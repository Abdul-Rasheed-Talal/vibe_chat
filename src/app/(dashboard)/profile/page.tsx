import { getProfile } from '@/app/actions/profile'
import ProfileForm from '@/components/profile/ProfileForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Profile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const profile = await getProfile()

    return <ProfileForm userProfile={profile} userId={user.id} />
}
