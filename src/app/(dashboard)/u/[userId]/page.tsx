import { getUserProfile } from '@/app/actions/profile'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MessageCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getConversations } from '@/app/actions/chat'

export default async function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { userId } = await params
    const profile = await getUserProfile(userId)

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-2xl font-bold mb-4">User not found</h1>
                <Link href="/home">
                    <Button variant="outline">Go Home</Button>
                </Link>
            </div>
        )
    }

    // Check if conversation already exists
    const conversations = await getConversations()
    const existingConversation = conversations.find((c: any) =>
        c.participants.some((p: any) => p.user?.id === profile.id)
    )

    const chatLink = existingConversation
        ? `/direct/c/${existingConversation.id}`
        : `/direct/t/${profile.id}`

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            <div className="relative h-48 bg-gradient-to-r from-primary/20 to-secondary/20">
                <Link href="/home" className="absolute top-6 left-6 z-10">
                    <Button variant="ghost" size="icon" className="rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40 text-white">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
            </div>

            <div className="px-6 -mt-16 flex flex-col items-center relative z-10">
                <div className="relative">
                    <div className="absolute inset-0 bg-background rounded-full m-1" />
                    <Avatar className="h-32 w-32 ring-4 ring-background shadow-xl">
                        <AvatarImage src={profile.avatar_url} className="object-cover" />
                        <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                            {profile.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <h1 className="mt-4 text-3xl font-black tracking-tight glow-text text-center">
                    {profile.full_name || profile.username}
                </h1>
                <p className="text-muted-foreground font-medium">@{profile.username}</p>

                {profile.status && (
                    <div className="mt-4 px-4 py-1.5 rounded-full bg-secondary/50 text-sm font-medium text-secondary-foreground">
                        {profile.status}
                    </div>
                )}

                <div className="mt-8 w-full max-w-sm">
                    <Link href={chatLink} className="w-full">
                        <Button className="w-full h-12 text-lg font-bold glow-box shadow-lg shadow-primary/20">
                            <MessageCircle className="mr-2 h-5 w-5" />
                            Message
                        </Button>
                    </Link>
                </div>

                <div className="mt-12 w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm">
                        <h3 className="font-bold text-lg mb-4">About</h3>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <div className="flex justify-between py-2 border-b border-border/20">
                                <span>Joined</span>
                                <span className="text-foreground font-medium">
                                    {new Date(profile.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border/20">
                                <span>Vibe Score</span>
                                <span className="text-foreground font-medium">High</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm">
                        <h3 className="font-bold text-lg mb-4">Badges</h3>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                Early Adopter
                            </span>
                            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-xs font-bold border border-purple-500/20">
                                Vibe Master
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
