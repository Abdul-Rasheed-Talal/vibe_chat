import { getProfile } from '@/app/actions/profile'
import ProfileForm from '@/components/profile/ProfileForm'

export default async function Profile() {
    const profile = await getProfile()

    return <ProfileForm userProfile={profile} />
}
