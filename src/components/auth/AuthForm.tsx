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
        <div className="w-full p-10 space-y-8 bg-black/40 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-2xl shadow-primary/10 relative overflow-hidden">
            {/* Decorative Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 blur-sm" />

            <div className="space-y-3 text-center relative z-10">
                <h1 className="text-4xl font-bold tracking-tighter text-white drop-shadow-sm">
                    {isLogin ? 'Welcome back' : 'Create an account'}
                </h1>
                <p className="text-lg text-white/60">
                    {isLogin
                        ? 'Enter your credentials to access your account'
                        : 'Enter your information to create an account'}
                </p>
            </div>

            <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/5 relative z-10">
                <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 rounded-xl text-base font-medium transition-all duration-300 ${isLogin ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                    Login
                </Button>
                <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 rounded-xl text-base font-medium transition-all duration-300 ${!isLogin ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                    Sign Up
                </Button>
            </div>

            <form action={async () => { await signInWithGoogle() }} className="relative z-10">
                <Button variant="outline" className="w-full h-14 text-lg font-medium relative bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all rounded-2xl group" type="submit">
                    <div className="absolute left-6 flex items-center justify-center transition-transform group-hover:scale-110">
                        <svg className="h-6 w-6" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                    </div>
                    Sign in with Google
                </Button>
            </form>

            <div className="relative py-2 z-10">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                    <span className="bg-transparent px-4 text-white/40 font-medium">
                        Or continue with
                    </span>
                </div>
            </div>

            <form action={handleSubmit} className="space-y-5 relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isLogin ? 'login' : 'signup'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                    >
                        {!isLogin && (
                            <>
                                <div className="space-y-2">
                                    <Input
                                        name="fullName"
                                        placeholder="Full Name"
                                        required={!isLogin}
                                        disabled={isPending}
                                        className="h-14 text-lg px-5 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        name="username"
                                        placeholder="Username"
                                        required={!isLogin}
                                        disabled={isPending}
                                        className="h-14 text-lg px-5 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all"
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
                                className="h-14 text-lg px-5 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all"
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
                                className="h-14 text-lg px-5 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all"
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>

                {error && (
                    <div className="p-4 text-sm font-medium text-red-200 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-primary-500 hover:from-primary-500 hover:to-primary shadow-xl shadow-primary/20 rounded-2xl hover:scale-[1.02] transition-all text-white border-none" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
