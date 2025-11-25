'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

type MessageBubbleProps = {
    message: {
        id: number
        content: string
        created_at: string
        attachments?: { type: 'image' | 'file'; url: string; name: string }[]
    }
    isMe: boolean
    showAvatar?: boolean
}

export function MessageBubble({ message, isMe, showAvatar }: MessageBubbleProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className={cn(
                "flex w-full",
                isMe ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={cn(
                    "relative max-w-[75%] px-5 py-3 text-sm shadow-sm transition-all hover:scale-[1.01]",
                    isMe
                        ? "bg-gradient-to-br from-primary to-primary-500 text-primary-foreground rounded-[20px] rounded-tr-[4px] shadow-lg shadow-primary/20"
                        : "bg-card/80 backdrop-blur-md border border-border/50 text-foreground rounded-[20px] rounded-tl-[4px]"
                )}
            >
                {/* Attachments */}
                {message.attachments?.map((att, i) => (
                    <div key={i} className="mb-2">
                        {att.type === 'image' ? (
                            <img
                                src={att.url}
                                alt="attachment"
                                className="max-w-full rounded-xl border border-white/10"
                                loading="lazy"
                            />
                        ) : (
                            <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 rounded-lg bg-background/20 hover:bg-background/30 transition-colors"
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
        </motion.div>
    )
}
