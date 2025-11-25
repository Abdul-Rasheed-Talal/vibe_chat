'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateProfile } from '@/app/actions/profile'
import { Camera, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        avatar_url: '',
        status: '',
    })
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profile) {
                setUser(user)
                setFormData({
                    username: profile.username || '',
                    full_name: profile.full_name || '',
                    avatar_url: profile.avatar_url || '',
                    status: profile.status || '',
                })
            }
            setLoading(false)
        }

        fetchUser()
    }, [supabase, router])

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        try {
            const fileExt = file.name.split('.').pop()
            const filePath = `${user.id}/avatar.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
        } catch (error) {
            console.error('Error uploading avatar:', error)
            alert('Error uploading avatar')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const result = await updateProfile(formData)
            if (result?.error) {
                alert(result.error)
            } else {
                alert('Profile updated successfully!')
                router.refresh()
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            alert('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container max-w-2xl py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold glow-text mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your account and profile preferences.</p>
            </div>

            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your public profile details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group cursor-pointer">
                                <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                                    <AvatarImage src={formData.avatar_url} />
                                    <AvatarFallback className="text-2xl">
                                        {formData.username?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="h-8 w-8 text-white" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarUpload}
                                    />
                                </label>
                            </div>
                            <p className="text-sm text-muted-foreground">Click to change avatar</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="@username"
                                className="bg-background/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="John Doe"
                                className="bg-background/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Input
                                id="status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                placeholder="What's on your mind?"
                                className="bg-background/50"
                            />
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full glow-box" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
