import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EditProfileModal } from '@/components/profile/EditProfileModal'

export default async function ProfilePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: fetchedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    let profile = fetchedProfile

    if (!profile) {
        // Fallback if profile doesn't exist yet (e.g. trigger failed or first login)
        profile = {
            id: user.id,
            username: user.user_metadata.username || user.email?.split('@')[0] || 'User',
            full_name: user.user_metadata.full_name || '',
            avatar_url: null,
            bio: ''
        }
    }

    return (
        <div className="container h-full overflow-y-auto max-w-2xl py-8">
            <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="text-4xl">{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                    <h1 className="text-2xl font-bold">{profile?.username}</h1>
                    <p className="text-muted-foreground">{profile?.full_name}</p>
                    {profile?.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
                </div>
                <EditProfileModal profile={profile} />
            </div>
        </div>
    )
}
