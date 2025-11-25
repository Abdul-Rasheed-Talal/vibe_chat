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

  // Simplify query to avoid complex join issues
  const { data, error } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching conversations:', JSON.stringify(error, null, 2))
    return []
  }

  if (!data || data.length === 0) return []

  // Manually fetch details to ensure data integrity
  const conversationsWithDetails = await Promise.all(data.map(async (item: any) => {
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', item.conversation_id)
      .single()

    if (!conversation) return null

    const { data: participants } = await supabase
      .from('conversation_participants')
      .select(`
        user:profiles (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversation.id)

    // Get unread count
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversation.id)
      .gt('created_at', item.last_read_at)

    return {
      id: conversation.id,
      last_message: conversation.last_message,
      last_message_at: conversation.last_message_at,
      is_group: conversation.is_group,
      participants: participants?.map((p: any) => p.user) || [],
      unread_count: count || 0
    }
  }))

  return conversationsWithDetails.filter(Boolean).sort((a: any, b: any) =>
    new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  )
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
