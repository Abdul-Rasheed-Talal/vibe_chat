import { getConversations } from '@/app/actions/chat'
import { getSuggestedUsers } from '@/app/actions/profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Plus, UserPlus } from 'lucide-react'
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
    const suggestedUsers = await getSuggestedUsers()

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
                        <p className="text-muted-foreground mb-6">No conversations yet. Start vibing with new people!</p>

                        {suggestedUsers.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold glow-text mb-4">Suggested Users</h3>
                                <div className="grid gap-3">
                                    {suggestedUsers.map((suggestedUser: any) => (
                                        <Link
                                            key={suggestedUser.id}
                                            href={`/direct/t/${suggestedUser.id}`}
                                            className="flex items-center justify-between p-3 rounded-xl bg-card/30 border border-border/50 hover:bg-primary/10 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={suggestedUser.avatar_url} />
                                                    <AvatarFallback>{suggestedUser.username?.[0]?.toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-left">
                                                    <p className="font-medium text-sm">{suggestedUser.username}</p>
                                                    <p className="text-xs text-muted-foreground">{suggestedUser.full_name}</p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                                <UserPlus className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {suggestedUsers.length === 0 && (
                            <Link href="/direct/new">
                                <Button className="glow-box">Start a Chat</Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
