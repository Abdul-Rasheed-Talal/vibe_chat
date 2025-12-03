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

  const content = formData.get('content') as string | null
  const conversationId = formData.get('conversationId') as string
  const attachmentsStr = formData.get('attachments') as string | null

  console.log('sendMessage received:', { conversationId, content, attachmentsStr })

  const validated = sendMessageSchema.safeParse({
    conversationId,
    content: content ?? undefined,
    attachments: attachmentsStr ?? undefined
  })

  if (!validated.success) {
    console.error('Validation error:', JSON.stringify(validated.error, null, 2))
    return { error: 'Invalid input' }
  }

  const attachments = validated.data.attachments ? JSON.parse(validated.data.attachments) : []

  // Fetch conversation participants to find the receiver
  const { data: participants, error: participantsError } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', validated.data.conversationId)
    .neq('user_id', user.id)
    .single()

  if (participantsError || !participants) {
    console.error('Error fetching receiver:', participantsError)
    return { error: 'Failed to determine receiver' }
  }

  const { error } = await supabase.from('messages').insert({
    conversation_id: validated.data.conversationId,
    sender_id: user.id,
    receiver_id: participants.user_id,
    content: validated.data.content || '',
    attachments: attachments
  })

  if (error) {
    console.error('Error sending message:', JSON.stringify(error, null, 2))
    return { error: `Failed to send message: ${error.message || JSON.stringify(error)}` }
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

export async function markAsRead(conversationId: string, shouldRevalidate = true) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)

  if (shouldRevalidate) {
    revalidatePath('/direct')
  }
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

  // Create new conversation using RPC
  const { data: newConversationId, error: createError } = await supabase
    .rpc('create_new_conversation', { other_user_id: userId })

  if (createError) {
    console.error('Error creating conversation:', createError)
    throw createError
  }

  return newConversationId
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

export async function getTotalUnreadCount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return 0

  // Get all conversations for the user
  const { data: participations } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', user.id)

  if (!participations || participations.length === 0) return 0

  let totalUnread = 0

  // For each conversation, count messages newer than last_read_at
  // This could be optimized with a better query but this is safe for now
  for (const p of participations) {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', p.conversation_id)
      .gt('created_at', p.last_read_at)

    totalUnread += count || 0
  }

  return totalUnread
}

export async function deleteMessage(messageId: string | number, conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('sender_id', user.id) // Ensure user owns the message

  if (error) {
    console.error('Error deleting message:', error)
    return { error: 'Failed to delete message' }
  }

  revalidatePath(`/direct/${conversationId}`)
}
