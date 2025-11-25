import { getConversations } from '@/app/actions/chat'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { UserSearch } from '@/components/chat/UserSearch'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ConversationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const conversations = await getConversations()

    return (
        <div className="container h-full overflow-y-auto max-w-2xl py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold glow-text">Messages</h1>
                <Link href="/direct/new">
                    <Button size="icon" className="rounded-full shadow-lg shadow-primary/20">
                        <Plus className="h-5 w-5" />
                    </Button>
                </Link>
            </div>

            <UserSearch />

            <div className="space-y-2 mt-6">
                {conversations.map((conversation: any) => {
                    const otherParticipant = conversation.participants.find((p: any) => p.user.id !== user.id)?.user

                    return (
                        <Link
                            key={conversation.id}
                            href={`/direct/c/${conversation.id}`}
                            className="flex items-center gap-4 rounded-2xl border border-border/50 p-4 transition-all hover:bg-accent/50 hover:scale-[1.02]"
                        >
                            <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                                <AvatarImage src={otherParticipant?.avatar_url || ''} />
                                <AvatarFallback>{otherParticipant?.username?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold truncate">{otherParticipant?.username || 'Unknown'}</p>
                                    <div className="flex items-center gap-2">
                                        {conversation.last_message_at && (
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                                            </span>
                                        )}
                                        {conversation.unread_count > 0 && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground animate-pulse">
                                                {conversation.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                    {conversation.last_message || 'Started a conversation'}
                                </p>
                            </div>
                        </Link>
                    )
                })}

                {conversations.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground mb-4">No conversations yet.</p>
                        <Link href="/direct/new">
                            <Button className="glow-box">Start a Chat</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
