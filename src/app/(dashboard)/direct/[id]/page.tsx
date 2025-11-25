import { redirect } from 'next/navigation'

export default function RedirectPage({ params }: { params: { id: string } }) {
    // Redirect legacy /direct/[userId] to /direct/t/[userId] which handles conversation creation
    redirect(`/direct/t/${params.id}`)
}
