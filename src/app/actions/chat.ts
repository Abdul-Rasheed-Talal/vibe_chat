'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().max(2000).optional(),
  attachments: z.string().optional(), // JSON string
})

export async function sendMessage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const content = formData.get('content') as string
  const conversationId = formData.get('conversationId') as string
  const attachmentsStr = formData.get('attachments') as string

  const validated = sendMessageSchema.safeParse({ conversationId, content, attachments: attachmentsStr })

  if (!validated.success) {
    return { error: 'Invalid input' }
  }

  const attachments = validated.data.attachments ? JSON.parse(validated.data.attachments) : []

  const { error } = await supabase.from('messages').insert({
    conversation_id: validated.data.conversationId,
    sender_id: user.id,
    content: validated.data.content || '',
    attachments: attachments
  })

  if (error) {
    console.error('Error sending message:', error)
    return { error: 'Failed to send message' }
  }

  // Update conversation last_message
  const lastMsgText = attachments.length > 0 ? 'Sent an attachment' : validated.data.content

  await supabase.from('conversations').update({
    last_message: lastMsgText,
    last_message_at: new Date().toISOString(),
  }).eq('id', validated.data.conversationId)

  revalidatePath(`/direct/${conversationId}`)
}

export async function getConversations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('conversation_participants')
    .select(`
      last_read_at,
      conversation:conversations (
        id,
        last_message,
        last_message_at,
        is_group,
        participants:conversation_participants (
          user:profiles (
            id,
            username,
            full_name,
            avatar_url
          )
        ),
        messages:messages(count)
      )
    `)
    .eq('user_id', user.id)
    .order('conversation(last_message_at)', { ascending: false })

  // Note: The above query for messages count is tricky because we need to filter messages > last_read_at
  // Supabase/PostREST doesn't support complex join filtering easily in one go for "count where created_at > parent.last_read_at"
  // We might need a separate query or a Postgres function.
  // For now, let's fetch the conversations and then get unread counts in parallel or use a view.
  // A view is cleaner, but let's try to do it in code for speed if N is small, or use a better query.

  // Actually, let's use a separate query for unread counts or just fetch the last few messages? No, that's bad.
  // Best approach: Create a RPC function or use a view.
  // Let's stick to a simpler approach: fetch conversations, then for each, count unread.
  // Or better: define a view in the migration? I already wrote the migration.
  // Let's try to use the `rpc` approach if I had one, but I don't.
  // Let's iterate for now (N+1 but N is small usually).

  if (error) {
    console.error('Error fetching conversations:', error)
    return []
  }

  const conversationsWithUnread = await Promise.all(data.map(async (item: any) => {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', item.conversation.id)
      .gt('created_at', item.last_read_at)

    return {
      id: item.conversation.id,
      last_message: item.conversation.last_message,
      last_message_at: item.conversation.last_message_at,
      is_group: item.conversation.is_group,
      participants: item.conversation.participants.map((p: any) => p.user),
      unread_count: count || 0
    }
  }))

  return conversationsWithUnread
}

export async function markAsRead(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)

  revalidatePath('/direct')
}

export async function getOrCreateConversation(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Check if conversation already exists
  const { data: myConversations } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id)

  if (myConversations && myConversations.length > 0) {
    const conversationIds = myConversations.map(c => c.conversation_id)

    const { data: commonConversations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId)
      .in('conversation_id', conversationIds)

    if (commonConversations && commonConversations.length > 0) {
      for (const conv of commonConversations) {
        const { data: conversation } = await supabase
          .from('conversations')
          .select('is_group')
          .eq('id', conv.conversation_id)
          .single()

        if (conversation && !conversation.is_group) {
          return conv.conversation_id
        }
      }
    }
  }

  // Create new conversation
  const { data: newConv, error: createError } = await supabase
    .from('conversations')
    .insert({ is_group: false })
    .select()
    .single()

  if (createError) throw createError

  // Add participants
  await supabase.from('conversation_participants').insert([
    { conversation_id: newConv.id, user_id: user.id },
    { conversation_id: newConv.id, user_id: userId }
  ])

  return newConv.id
}

export async function searchUsers(query: string) {
  const supabase = await createClient()

  if (!query || query.length < 2) return []

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(10)

  if (error) {
    console.error('Error searching users:', error)
    return []
  }

  return users
}
