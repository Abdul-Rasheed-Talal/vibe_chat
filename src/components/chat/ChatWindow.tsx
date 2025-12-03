'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, ArrowLeft, Paperclip, Smile, Mic } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { sendMessage, deleteMessage } from '@/app/actions/chat'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { AISuggestions } from '@/components/chat/AISuggestions'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { LoadingPulse } from '@/components/ui/loading-pulse'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { cn } from '@/lib/utils'

type Message = {
    id: number | string
    content: string
    sender_id: string
    created_at: string
    conversation_id: string
    attachments?: {
        type: 'image' | 'file' | 'audio'
        url: string
        name: string
    }[]
    isOptimistic?: boolean
    deleted_at?: string | null
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
    const virtuosoRef = useRef<VirtuosoHandle>(null)
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

    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

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
                    const newMessage = payload.new as Message
                    setMessages((prev) => {
                        if (prev.some(m => m.id === newMessage.id)) return prev
                        if (newMessage.sender_id === currentUser.id) {
                            const optimisticIndex = prev.findIndex(m =>
                                m.isOptimistic &&
                                m.content === newMessage.content
                            )
                            if (optimisticIndex !== -1) {
                                const newMessages = [...prev]
                                newMessages[optimisticIndex] = newMessage
                                return newMessages
                            }
                        }
                        return [...prev, newMessage]
                    })
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversation.id}`,
                },
                (payload) => {
                    const updatedMessage = payload.new as Message
                    setMessages((prev) => prev.map(m =>
                        m.id === updatedMessage.id ? updatedMessage : m
                    ))
                }
            )
            .on('broadcast', { event: 'typing' }, (payload) => {
                console.log('Received typing event:', payload)
                if (payload.payload.userId !== currentUser.id) {
                    setOtherUserTyping(true)
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
                    typingTimeoutRef.current = setTimeout(() => setOtherUserTyping(false), 3000)
                }
            })
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState()
                const users = new Set<string>()
                for (const id in newState) {
                    // @ts-ignore
                    const user = newState[id][0] as any
                    if (user && user.user_id) users.add(user.user_id)
                }
                setOnlineUsers(users)
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ user_id: currentUser.id, online_at: new Date().toISOString() })
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [conversation.id, supabase, currentUser.id])

    const handleTyping = async () => {
        if (!isTyping) {
            setIsTyping(true)
            await supabase.channel(`conversation:${conversation.id}`).send({
                type: 'broadcast',
                event: 'typing',
                payload: { userId: currentUser.id },
            })
        }

        // Debounce the typing status reset
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

        // We don't want to set isTyping to false immediately, we want to keep it true while they type
        // The timeout here is just for local state if needed, but for broadcast we send "start" effectively.
        // A better approach for broadcast is to send it periodically or debounce the send.
        // For now, let's just ensure we send it.

        setTimeout(() => setIsTyping(false), 3000)
    }

    const [isRecording, setIsRecording] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                const file = new File([blob], 'voice-message.webm', { type: 'audio/webm' })
                await uploadAndSendFile(file, 'audio')

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)
        } catch (error) {
            console.error('Error accessing microphone:', error)
            alert('Could not access microphone')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    const uploadAndSendFile = async (file: File, type: 'image' | 'file' | 'audio') => {
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
                type: type,
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
                attachments: [attachment],
                isOptimistic: true
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

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const type = file.type.startsWith('image/') ? 'image' : 'file'
        await uploadAndSendFile(file, type)
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
            conversation_id: conversation.id,
            isOptimistic: true
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
            alert(result.error)
        }
    }

    const handleDeleteMessage = async (messageId: number | string) => {
        // Optimistic update
        setMessages(prev => prev.map(m =>
            m.id === messageId
                ? { ...m, deleted_at: new Date().toISOString() }
                : m
        ))

        const result = await deleteMessage(messageId, conversation.id)
        if (result?.error) {
            console.error('Error deleting message:', result.error)
            alert('Failed to delete message')
            // Revert optimistic update (optional, or just let revalidation fix it)
        }
    }

    return (
        <div className="flex h-full flex-col bg-background/50 backdrop-blur-sm relative">
            {/* Header */}
            <div className="flex items-center border-b border-border/40 p-4 gap-4 bg-card/80 backdrop-blur-xl z-10 sticky top-0">
                <Link href="/direct" className="md:hidden">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>

                {otherParticipant ? (
                    <>
                        <div className="relative">
                            <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                                <AvatarImage src={otherParticipant.avatar_url || ''} />
                                <AvatarFallback>{otherParticipant.username[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {/* Online Status Dot */}
                            <span className={cn(
                                "absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-background transition-colors",
                                onlineUsers.has(otherParticipant.id) ? "bg-green-500" : "bg-zinc-500"
                            )} />
                        </div>
                        <div className="ml-2 flex-1">
                            <p className="font-bold text-sm glow-text">{otherParticipant.username}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                {otherUserTyping ? (
                                    <span className="text-primary font-medium animate-pulse">Typing...</span>
                                ) : (
                                    onlineUsers.has(otherParticipant.id) ? 'Online' : 'Offline'
                                )}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="ml-2">
                        <p className="font-bold text-sm glow-text">Group Chat</p>
                        {otherUserTyping && <p className="text-xs text-primary animate-pulse">Someone is typing...</p>}
                    </div>
                )}
            </div>

            {/* Messages Area - Virtualized */}
            <div className="flex-1 overflow-hidden p-4">
                <Virtuoso
                    ref={virtuosoRef}
                    data={messages}
                    initialTopMostItemIndex={messages.length - 1}
                    followOutput="smooth"
                    itemContent={(index, msg) => (
                        <div className="py-2">
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                isMe={msg.sender_id === currentUser.id}
                                onDelete={handleDeleteMessage}
                            />
                        </div>
                    )}
                    components={{
                        Footer: () => (
                            otherUserTyping ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex justify-start py-2"
                                >
                                    <div className="bg-card/80 backdrop-blur-md border border-border/50 px-4 py-3 rounded-[20px] rounded-tl-[4px] shadow-sm">
                                        <LoadingPulse />
                                    </div>
                                </motion.div>
                            ) : null
                        )
                    }}
                />
            </div>

            {/* AI Suggestions */}
            <div className="px-4 pb-2">
                <AISuggestions onSelect={(text) => setNewMessage(text)} />
            </div>

            {/* Composer */}
            <div className="p-4 bg-card/80 backdrop-blur-xl border-t border-border/40">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-end max-w-4xl mx-auto">
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
                        className="rounded-full h-10 w-10 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || isRecording}
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>

                    <div className="flex-1 relative group">
                        <Input
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value)
                                handleTyping()
                            }}
                            placeholder={isRecording ? "Recording..." : "Message..."}
                            className={cn(
                                "pr-10 rounded-2xl bg-muted/30 border-border/50 focus-visible:ring-primary/50 focus-visible:border-primary/50 min-h-[44px] py-3 transition-all duration-300 group-hover:bg-muted/50",
                                isRecording && "bg-red-500/10 border-red-500/50 text-red-500 placeholder:text-red-500/70"
                            )}
                            disabled={isRecording}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                        >
                            <Smile className="h-5 w-5" />
                        </Button>
                    </div>

                    {newMessage.trim() ? (
                        <Button
                            type="submit"
                            size="icon"
                            className="h-11 w-11 rounded-full shadow-lg shadow-primary/25 hover:scale-105 transition-all shrink-0"
                        >
                            <Send className="h-5 w-5 ml-0.5" />
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant={isRecording ? "destructive" : "secondary"}
                            size="icon"
                            className={cn(
                                "h-11 w-11 rounded-full shrink-0 transition-all duration-300",
                                isRecording && "animate-pulse scale-110"
                            )}
                            onClick={isRecording ? stopRecording : startRecording}
                        >
                            <Mic className="h-5 w-5" />
                        </Button>
                    )}
                </form>
            </div>
        </div>
    )
}
