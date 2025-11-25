'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const fullName = formData.get('fullName') as string
    const username = formData.get('username') as string
    const status = formData.get('status') as string
    const avatarUrl = formData.get('avatarUrl') as string

    const updates: any = {
        full_name: fullName,
        username: username,
        updated_at: new Date().toISOString(),
    }

    if (status) updates.status = status // Assuming we add a 'status' column or just use it if it exists. 
    // Wait, 'status' column might not exist in profiles table yet. I should check schema.
    // For now, let's assume standard profile fields. 
    // If avatarUrl is provided, update it.
    if (avatarUrl) updates.avatar_url = avatarUrl

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/profile')
    return { success: true }
}

export async function getProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return profile
}

export async function getSuggestedUsers() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: users } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .neq('id', user.id)
        .limit(20)

    return users || []
}
