import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { MoreVertical, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type MessageBubbleProps = {
    message: {
        id: number | string
        content: string
        created_at: string
        deleted_at?: string | null
        attachments?: { type: 'image' | 'file' | 'audio'; url: string; name: string }[]
    }
    isMe: boolean
    showAvatar?: boolean
    onDelete?: (id: number | string) => void
}

export function MessageBubble({ message, isMe, showAvatar, onDelete }: MessageBubbleProps) {
    if (message.deleted_at) {
        return (
            <div
                className={cn(
                    "flex w-full mb-2",
                    isMe ? "justify-end" : "justify-start"
                )}
            >
                <div
                    className={cn(
                        "relative max-w-[75%] px-4 py-3 text-sm rounded-2xl shadow-sm italic text-muted-foreground border border-border/30",
                        isMe
                            ? "bg-primary/10 rounded-tr-sm"
                            : "bg-muted/50 rounded-tl-sm"
                    )}
                >
                    This message was deleted
                </div>
            </div>
        )
    }

    return (
        <div
            className={cn(
                "flex w-full mb-2 group items-center gap-2",
                isMe ? "justify-end" : "justify-start"
            )}
        >
            {/* Delete Option for Me */}
            {isMe && onDelete && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={() => onDelete(message.id)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            <div
                className={cn(
                    "relative max-w-[75%] px-4 py-3 text-sm rounded-2xl shadow-sm",
                    isMe
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground border border-border/50 rounded-tl-sm"
                )}
            >
                {/* Attachments */}
                {message.attachments?.map((att, i) => (
                    <div key={i} className="mb-2">
                        {att.type === 'image' ? (
                            <img
                                src={att.url}
                                alt="attachment"
                                className="max-w-full rounded-md"
                                loading="lazy"
                            />
                        ) : att.type === 'audio' ? (
                            <div className="flex items-center gap-2 min-w-[200px]">
                                <audio controls src={att.url} className="w-full h-8" />
                            </div>
                        ) : (
                            <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 rounded bg-background/10 hover:bg-background/20 transition-colors"
                            >
                                <span className="text-xs underline truncate">{att.name}</span>
                            </a>
                        )}
                    </div>
                ))}

                {/* Text Content */}
                {message.content && (
                    <p className="leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                    </p>
                )}

                {/* Timestamp */}
                <span className={cn(
                    "text-[10px] mt-1 block w-full text-right opacity-70",
                    isMe ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                    {format(new Date(message.created_at), 'h:mm a')}
                </span>
            </div>
        </div>
    )
}
