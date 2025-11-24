'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, User as UserIcon, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Profile = {
    id: string
    username: string
    full_name: string
    avatar_url: string | null
}

export default function SearchPage() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Profile[]>([])
    const [isPending, startTransition] = useTransition()
    const supabase = createClient()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(async () => {
            if (!query.trim()) return

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .ilike('username', `%${query}%`)
                .limit(10)

            if (data) {
                setResults(data)
            }
        })
    }

    return (
        <div className="container h-full overflow-y-auto max-w-2xl py-8">
            <h1 className="mb-6 text-2xl font-bold">Search</h1>
            <form onSubmit={handleSearch} className="mb-8 flex gap-2">
                <Input
                    placeholder="Search users..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1"
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
            </form>

            <div className="space-y-4">
                {results.map((profile) => (
                    <Link
                        key={profile.id}
                        href={`/direct/${profile.id}`}
                        className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                    >
                        <Avatar>
                            <AvatarImage src={profile.avatar_url || ''} />
                            <AvatarFallback>{profile.username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{profile.username}</p>
                            <p className="text-sm text-muted-foreground">{profile.full_name}</p>
                        </div>
                    </Link>
                ))}
                {results.length === 0 && query && !isPending && (
                    <p className="text-center text-muted-foreground">No users found.</p>
                )}
            </div>
        </div>
    )
}
