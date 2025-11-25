'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { searchUsers } from '@/app/actions/chat'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { Search, Loader2 } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce' // Need to create this hook or implement debounce manually

export function UserSearch() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // Simple debounce effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true)
                const users = await searchUsers(query)
                setResults(users)
                setLoading(false)
            } else {
                setResults([])
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [query])

    return (
        <div className="relative w-full max-w-md mx-auto mb-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search users..."
                    className="pl-10 bg-card/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary/50"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                )}
            </div>

            {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card/90 backdrop-blur-md border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden">
                    {results.map((user) => (
                        <Link
                            key={user.id}
                            href={`/direct/t/${user.id}`}
                            className="flex items-center gap-3 p-3 hover:bg-primary/10 transition-colors"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-sm">{user.username}</p>
                                <p className="text-xs text-muted-foreground">{user.full_name}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
