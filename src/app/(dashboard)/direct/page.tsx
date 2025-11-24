import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function DirectPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch all profiles except current user
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)

    return (
        <div className="container h-full overflow-y-auto max-w-2xl py-8">
            <h1 className="mb-6 text-2xl font-bold">Start a Conversation</h1>
            <div className="space-y-2">
                {profiles?.map((profile) => (
                    <Link
                        key={profile.id}
                        href={`/direct/${profile.id}`}
                        className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                    >
                        <Avatar>
                            <AvatarImage src={profile.avatar_url || ''} />
                            <AvatarFallback>{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{profile.username}</p>
                            <p className="text-sm text-muted-foreground">{profile.full_name}</p>
                        </div>
                    </Link>
                ))}
                {profiles?.length === 0 && (
                    <p className="text-center text-muted-foreground">No other users found.</p>
                )}
            </div>
        </div>
    )
}
