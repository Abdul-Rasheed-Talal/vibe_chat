import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto items-center justify-center p-8 text-center">
      <h1 className="text-2xl font-bold">Welcome, {user.user_metadata.full_name || user.email}</h1>
      <p className="mt-2 text-muted-foreground">Select a conversation to start chatting.</p>
    </div>
  )
}
