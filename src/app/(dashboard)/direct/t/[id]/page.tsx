import { getOrCreateConversation } from '@/app/actions/chat'
import { redirect } from 'next/navigation'

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
    // params.id is the target USER ID
    const { id } = await params
    let conversationId;
    try {
        conversationId = await getOrCreateConversation(id)
        console.log('ThreadPage: Got conversationId:', conversationId)
    } catch (error) {
        console.error('Error creating conversation:', error)
        redirect('/direct')
    }

    if (conversationId) {
        console.log('ThreadPage: Redirecting to', `/direct/c/${conversationId}`)
        redirect(`/direct/c/${conversationId}`)
    }
}
