import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { markAsRead } from '@/app/actions/chat'

export default async function ChatPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch conversation and participants
    const { data: conversation } = await supabase
        .from('conversations')
        .select(`
            id,
            is_group,
            participants:conversation_participants(
                user:profiles(*)
            )
        `)
        .eq('id', params.id)
        .single()

    if (!conversation) notFound()

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
        .eq('conversation_id', params.id)
        .order('created_at', { ascending: false })
        .limit(50)

    // Reverse messages for display (oldest at top)
    const initialMessages = messages?.reverse() || []

    // Mark as read
    await markAsRead(params.id)

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
            <ChatWindow
                currentUser={user}
                conversation={typedConversation}
                initialMessages={initialMessages}
            />
        </div>
    )
}
