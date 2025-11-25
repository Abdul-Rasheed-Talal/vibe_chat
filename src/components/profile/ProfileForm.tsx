'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateProfile } from '@/app/actions/profile'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Upload, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage({ userProfile, userId }: { userProfile: any, userId: string }) {
    const [loading, setLoading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatar_url || '')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()

    // If profile is missing, we still want to show the form so they can create it.
    // The updateProfile action now handles upsert.

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}/${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setAvatarUrl(publicUrl)
        } catch (error: any) {
            console.error('Error uploading avatar:', error)
            alert(`Error uploading avatar: ${error.message || JSON.stringify(error)}`)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        if (avatarUrl) formData.append('avatarUrl', avatarUrl)

        const result = await updateProfile(formData)
        setLoading(false)

        if (result?.error) {
            alert(result.error)
        } else {
            router.refresh()
            alert('Profile updated!')
        }
    }

    return (
        <div className="container max-w-lg py-10">
            <h1 className="text-3xl font-bold mb-8 glow-text">Edit Profile</h1>

            <div className="flex flex-col items-center mb-8">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar className="h-32 w-32 ring-4 ring-primary/20 transition-all group-hover:ring-primary/50">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="text-4xl">{userProfile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="h-8 w-8 text-white" />
                    </div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                />
                <p className="mt-2 text-sm text-muted-foreground">Click to change avatar</p>
            </div>

            <form action={handleSubmit} className="space-y-6 bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input name="fullName" defaultValue={userProfile?.full_name} placeholder="Your Name" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Username</label>
                    <Input name="username" defaultValue={userProfile?.username} placeholder="@username" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Status / Bio</label>
                    <Input name="status" defaultValue={userProfile?.status} placeholder="What's your vibe?" />
                </div>

                <Button type="submit" className="w-full glow-box" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </form>
        </div>
    )
}
