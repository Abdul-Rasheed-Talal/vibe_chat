'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, ArrowLeft, Paperclip } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { sendMessage } from '@/app/actions/chat'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { AISuggestions } from '@/components/chat/AISuggestions'

type Message = {
    id: number
    content: string
    sender_id: string
    created_at: string
    conversation_id: string
    attachments?: {
        type: 'image' | 'file'
        url: string
        name: string
    }[]
}

type Profile = {
    id: string
    username: string
    full_name: string
    avatar_url: string | null
}

type Conversation = {
    id: string
    is_group: boolean
    participants: { user: Profile }[]
}

export function ChatWindow({
    currentUser,
    conversation,
    initialMessages,
}: {
    currentUser: any
    conversation: Conversation
    initialMessages: Message[]
}) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [newMessage, setNewMessage] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [otherUserTyping, setOtherUserTyping] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    // Identify the other participant (for 1:1)
    const otherParticipant = conversation.participants.find(
        (p) => p.user.id !== currentUser.id
    )?.user

    useEffect(() => {
        // Scroll to bottom on load and new messages
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, otherUserTyping])

    useEffect(() => {
        const channel = supabase
            .channel(`conversation:${conversation.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversation.id}`,
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new as Message])
                }
            )
            .on('broadcast', { event: 'typing' }, (payload) => {
                if (payload.payload.userId !== currentUser.id) {
                    setOtherUserTyping(true)
                    // Clear typing after 3 seconds
                    setTimeout(() => setOtherUserTyping(false), 3000)
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [conversation.id, supabase, currentUser.id])

    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true)
            supabase.channel(`conversation:${conversation.id}`).send({
                type: 'broadcast',
                event: 'typing',
                payload: { userId: currentUser.id },
            })
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false)
        }, 2000)
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${conversation.id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('attachments')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('attachments')
                .getPublicUrl(filePath)

            // Send message with attachment immediately
            const attachment = {
                type: file.type.startsWith('image/') ? 'image' : 'file',
                url: publicUrl,
                name: file.name
            } as const

            // Optimistic update
            const tempId = Date.now()
            const optimisticMessage: Message = {
                id: tempId,
                content: '',
                sender_id: currentUser.id,
                created_at: new Date().toISOString(),
                conversation_id: conversation.id,
                attachments: [attachment]
            }

            setMessages((prev) => [...prev, optimisticMessage])

            // Server Action
            const formData = new FormData()
            formData.append('conversationId', conversation.id)
            formData.append('content', '')
            formData.append('attachments', JSON.stringify([attachment]))

            await sendMessage(formData)

        } catch (error) {
            console.error('Upload failed:', error)
            alert('Upload failed')
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        // Optimistic update
        const tempId = Date.now()
        const optimisticMessage: Message = {
            id: tempId,
            content: newMessage,
            sender_id: currentUser.id,
            created_at: new Date().toISOString(),
            conversation_id: conversation.id
        }

        setMessages((prev) => [...prev, optimisticMessage])
        const contentToSend = newMessage
        setNewMessage('')
        setIsTyping(false)

        // Call Server Action
        const formData = new FormData()
        formData.append('conversationId', conversation.id)
        formData.append('content', contentToSend)

        const result = await sendMessage(formData)

        if (result?.error) {
            console.error('Error sending message:', result.error)
            // Remove optimistic message or show error
            setMessages((prev) => prev.filter(m => m.id !== tempId))
            alert('Failed to send message')
        }
    }

    return (
        <div className="flex h-full flex-col bg-background/50 backdrop-blur-sm">
            <div className="flex items-center border-b border-border/40 p-4 gap-4 bg-card/30 backdrop-blur-md">
                <Link href="/direct" className="md:hidden">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>

                {otherParticipant ? (
                    <>
                        <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                            <AvatarImage src={otherParticipant.avatar_url || ''} />
                            <AvatarFallback>{otherParticipant.username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="ml-2">
                            <p className="font-semibold glow-text">{otherParticipant.username}</p>
                            <p className="text-xs text-muted-foreground">
                                {otherUserTyping ? (
                                    <span className="animate-pulse text-primary">Typing...</span>
                                ) : 'Active now'}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="ml-2">
                        <p className="font-semibold glow-text">Group Chat</p>
                        {otherUserTyping && <p className="text-xs text-muted-foreground animate-pulse text-primary">Someone is typing...</p>}
                    </div>
                )}
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                        const isMe = msg.sender_id === currentUser.id
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm transition-all hover:scale-[1.02] ${isMe
                                        ? 'bg-primary text-primary-foreground glow-box'
                                        : 'bg-card border border-border/50 text-foreground'
                                        }`}
                                >
                                    {msg.attachments?.map((att, i) => (
                                        <div key={i} className="mb-2">
                                            {att.type === 'image' ? (
                                                <img src={att.url} alt="attachment" className="max-w-full rounded-lg" />
                                            ) : (
                                                <a href={att.url} target="_blank" rel="noopener noreferrer" className="underline text-xs">
                                                    {att.name}
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                    {msg.content && <p>{msg.content}</p>}
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
                {otherUserTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex justify-start"
                    >
                        <div className="bg-muted px-4 py-2 rounded-2xl rounded-tl-none">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <AISuggestions onSelect={(text) => setNewMessage(text)} />

            <form onSubmit={handleSendMessage} className="border-t border-border/40 p-4 flex gap-2 items-center bg-card/30 backdrop-blur-md">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    <Paperclip className="h-5 w-5" />
                </Button>

                <Input
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value)
                        handleTyping()
                    }}
                    placeholder="Message..."
                    className="flex-1 rounded-full bg-background/50 border-border/50 focus-visible:ring-primary/50"
                />
                <Button type="submit" size="icon" className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" disabled={!newMessage.trim() && !isUploading}>
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    )
}
