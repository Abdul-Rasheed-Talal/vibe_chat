'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MessageCircle, User } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function UserGrid({ users }: { users: any[] }) {
    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-primary/10 p-6 rounded-full mb-4">
                    <User className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Users Found</h3>
                <p className="text-muted-foreground max-w-sm">
                    It seems quiet here. Be the first to invite your friends!
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {users.map((user, index) => (
                <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden hover:bg-card/60 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="p-6 flex flex-col items-center text-center relative z-10">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Avatar className="h-24 w-24 ring-4 ring-card group-hover:ring-primary/20 transition-all duration-300">
                                <AvatarImage src={user.avatar_url} className="object-cover" />
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                    {user.username?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <h3 className="font-bold text-lg truncate w-full mb-1 glow-text">
                            {user.full_name || user.username}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 truncate w-full">
                            @{user.username}
                        </p>

                        {user.status && (
                            <div className="mb-6 px-3 py-1 rounded-full bg-secondary/50 text-xs font-medium text-secondary-foreground truncate max-w-full">
                                {user.status}
                            </div>
                        )}

                        <Link href={`/u/${user.id}`} className="w-full mt-auto">
                            <Button className="w-full glow-box group-hover:scale-105 transition-transform">
                                <User className="mr-2 h-4 w-4" />
                                View Profile
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
