import { getConversations } from '@/app/actions/chat'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default async function ConversationsPage() {
    const conversations = await getConversations()

    return (
        <div className="container h-full overflow-y-auto max-w-2xl py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Messages</h1>
                <Link href="/direct/new">
                    <Button size="icon" className="rounded-full">
                        <Plus className="h-5 w-5" />
                    </Button>
                </Link>
            </div>

            <div className="space-y-2">
                {conversations.map((conversation: any) => {
                    // For 1:1, find the other participant
                    // This logic assumes 1:1 for now or takes the first other participant
                    // In a real app, we'd handle group names
                    const otherParticipant = conversation.participants[0] // We should filter out 'me' in the action or here if needed, but the action returns all participants.
                    // Actually, the action returns participants. We should filter out the current user in the UI or Action.
                    // Let's assume the action returns *other* participants for 1:1 convenience or we filter here.
                    // The action `getConversations` returns `participants: item.conversation.participants.map((p: any) => p.user)`.
                    // We need to know who "me" is to filter.
                    // But `getConversations` is a Server Action, so we can't easily pass "me" unless we fetch it here too.
                    // Let's fetch user here to filter.

                    return (
                        <Link
                            key={conversation.id}
                            href={`/direct/c/${conversation.id}`}
                            className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                        >
                            <Avatar>
                                <AvatarImage src={otherParticipant?.avatar_url || ''} />
                                <AvatarFallback>{otherParticipant?.username?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium truncate">{otherParticipant?.username || 'Unknown'}</p>
                                    <div className="flex items-center gap-2">
                                        {conversation.last_message_at && (
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                                            </span>
                                        )}
                                        {conversation.unread_count > 0 && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
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
                            <Button>Start a Chat</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
