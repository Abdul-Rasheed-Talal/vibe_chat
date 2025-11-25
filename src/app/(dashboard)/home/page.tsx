import { getAllUsers } from '@/app/actions/profile'
import { UserGrid } from '@/components/home/UserGrid'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const users = await getAllUsers()

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-6 pb-0">
                <h1 className="text-3xl font-black tracking-tight glow-text mb-2">Discover Vibes</h1>
                <p className="text-muted-foreground">Connect with people who share your vibe.</p>
            </div>

            <div className="flex-1 overflow-y-auto">
                <UserGrid users={users} />
            </div>
        </div>
    )
}
