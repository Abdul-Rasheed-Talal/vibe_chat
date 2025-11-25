import { getOrCreateConversation } from '@/app/actions/chat'
import { redirect } from 'next/navigation'

export default async function ThreadPage({ params }: { params: { id: string } }) {
    // params.id is the target USER ID
    try {
        const conversationId = await getOrCreateConversation(params.id)
        redirect(`/direct/c/${conversationId}`)
    } catch (error) {
        console.error('Error creating conversation:', error)
        redirect('/direct')
    }
}
