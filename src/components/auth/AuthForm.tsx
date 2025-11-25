'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login, signup, signInWithGoogle } from '@/app/login/actions'
import { Loader2 } from 'lucide-react'

export function AuthForm() {
    const [isLogin, setIsLogin] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setError(null)
        startTransition(async () => {
            const action = isLogin ? login : signup
            const result = await action(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl border shadow-sm">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tighter">
                    {isLogin ? 'Welcome back' : 'Create an account'}
                </h1>
                <p className="text-muted-foreground">
                    {isLogin
                        ? 'Enter your credentials to access your account'
                        : 'Enter your information to create an account'}
                </p>
            </div>

            <div className="flex p-1 bg-muted rounded-lg">
                <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Login
                </button>
                <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Sign Up
                </button>
            </div>

            <form action={async () => { await signInWithGoogle() }}>
                <Button variant="outline" className="w-full" type="submit">
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                    Sign in with Google
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>

            <form action={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isLogin ? 'login' : 'signup'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                    >
                        {!isLogin && (
                            <>
                                <div className="space-y-2">
                                    <Input
                                        name="fullName"
                                        placeholder="Full Name"
                                        required={!isLogin}
                                        disabled={isPending}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        name="username"
                                        placeholder="Username"
                                        required={!isLogin}
                                        disabled={isPending}
                                    />
                                </div>
                            </>
                        )}
                        <div className="space-y-2">
                            <Input
                                name="email"
                                type="email"
                                placeholder="Email"
                                required
                                disabled={isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                name="password"
                                type="password"
                                placeholder="Password"
                                required
                                disabled={isPending}
                                minLength={6}
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>

                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isLogin ? 'Signing in...' : 'Creating account...'}
                        </>
                    ) : (
                        <>{isLogin ? 'Sign In' : 'Sign Up'}</>
                    )}
                </Button>
            </form>
        </div>
    )
}
