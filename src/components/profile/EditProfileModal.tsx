'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Profile = {
    id: string
    username: string
    full_name: string
    avatar_url: string | null
    bio?: string
}

export function EditProfileModal({ profile }: { profile: Profile | null }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        username: profile?.username || '',
        full_name: profile?.full_name || '',
        bio: profile?.bio || '',
    })
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null)
    const supabase = createClient()
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setAvatarFile(file)
            setAvatarPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profile) return

        setLoading(true)

        try {
            let avatar_url = profile.avatar_url

            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop()
                const fileName = `${profile.id}-${Math.random()}.${fileExt}`
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, avatarFile)

                if (uploadError) {
                    throw uploadError
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName)

                avatar_url = publicUrl
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    username: formData.username,
                    full_name: formData.full_name,
                    bio: formData.bio,
                    avatar_url,
                })
                .eq('id', profile.id)

            if (error) throw error

            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Error updating profile:', JSON.stringify(error, null, 2))
            alert(`Error updating profile: ${JSON.stringify(error)}`)
        } finally {
            setLoading(false)
        }
    }

    if (!profile) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="flex justify-center">
                            <div className="relative">
                                <Avatar className="h-24 w-24 cursor-pointer hover:opacity-80">
                                    <AvatarImage src={avatarPreview || ''} />
                                    <AvatarFallback>{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right">
                                Username
                            </Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bio" className="text-right">
                                Bio
                            </Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
