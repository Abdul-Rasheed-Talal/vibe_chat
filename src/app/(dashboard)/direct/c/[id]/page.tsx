import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { LazyChatWindow } from '@/components/chat/LazyChatWindow'


import { markAsRead } from '@/app/actions/chat'

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { id } = await params
    console.log('ChatPage: Loading conversation', id)

    // Fetch conversation and participants
    const { data: conversation, error } = await supabase
        .from('conversations')
        .select(`
            id,
            is_group,
            participants:conversation_participants(
                user:profiles(*)
            )
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('ChatPage: Error fetching conversation:', JSON.stringify(error, null, 2))
    }

    if (!conversation) {
        console.error('ChatPage: Conversation not found or access denied')
        notFound()
    }

    // Verify membership
    const isMember = conversation.participants.some((p: any) => p.user.id === user.id)
    if (!isMember) {
        // In a real app, show 403
        notFound()
    }

    // Fetch messages
    const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: false })
        .limit(50)

    // Reverse messages for display (oldest at top)
    const initialMessages = messages?.reverse() || []

    // Mark as read
    await markAsRead(id, false)

    // Transform to match component type
    const typedConversation = {
        id: conversation.id,
        is_group: conversation.is_group,
        participants: conversation.participants.map((p: any) => ({
            user: Array.isArray(p.user) ? p.user[0] : p.user
        }))
    }

    return (
        <div className="h-full">
            <LazyChatWindow
                currentUser={user}
                conversation={typedConversation}
                initialMessages={initialMessages}
            />
        </div>
    )
}
