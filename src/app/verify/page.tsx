'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function VerifyPage() {
    const [logs, setLogs] = useState<string[]>([])
    const supabase = createClient()

    const addLog = (msg: string) => setLogs(prev => [...prev, msg])

    useEffect(() => {
        const verify = async () => {
            addLog('Starting verification...')

            // Check Session
            const { data: { session } } = await supabase.auth.getSession()
            addLog(`Session: ${session ? 'Logged in as ' + session.user.email : 'Not logged in'}`)

            if (!session) {
                addLog('Please log in to verify RLS policies.')
                return
            }

            // Check Storage
            addLog('Checking Storage buckets...')
            const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
            if (bucketError) {
                addLog(`Error listing buckets: ${JSON.stringify(bucketError)}`)
            } else {
                addLog(`Buckets found: ${buckets.map(b => b.name).join(', ')}`)
                const avatarsBucket = buckets.find(b => b.name === 'avatars')
                addLog(`'avatars' bucket exists: ${!!avatarsBucket}`)
            }

            // Check Profiles RLS
            addLog('Checking Profiles table access...')
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

            if (profileError) {
                addLog(`Error fetching profile: ${JSON.stringify(profileError)}`)
            } else {
                addLog(`Profile found: ${profile.username}`)
            }

            addLog('Verification complete.')
        }

        verify()
    }, [])

    return (
        <div className="p-8 font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">System Verification</h1>
            <div className="space-y-2">
                {logs.map((log, i) => (
                    <div key={i} className="border-b pb-1">{log}</div>
                ))}
            </div>
        </div>
    )
}
