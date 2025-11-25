'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login, signup, signInWithGoogle } from '@/app/login/actions'
import { Loader2, Mail, Lock, User, Sparkles } from 'lucide-react'

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
        <div className="w-full max-w-md relative">
            {/* Animated background orbs */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative bg-gradient-to-br from-zinc-900/90 via-zinc-900/95 to-black/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Top accent line */}
                <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />

                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.6 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4"
                        >
                            <Sparkles className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                            {isLogin ? 'Welcome Back' : 'Join Vibe Chat'}
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            {isLogin ? 'Continue your conversations' : 'Start connecting with your tribe'}
                        </p>
                    </div>

                    {/* Tab Toggle */}
                    <div className="relative flex p-1 bg-zinc-800/50 rounded-2xl">
                        <motion.div
                            className="absolute top-1 bottom-1 bg-gradient-to-r from-primary to-accent rounded-xl"
                            initial={false}
                            animate={{
                                left: isLogin ? '0.25rem' : '50%',
                                right: isLogin ? '50%' : '0.25rem',
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${isLogin ? 'text-white' : 'text-zinc-400 hover:text-zinc-300'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${!isLogin ? 'text-white' : 'text-zinc-400 hover:text-zinc-300'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Google Sign In */}
                    <form action={async () => { await signInWithGoogle() }}>
                        <Button
                            variant="outline"
                            className="w-full h-12 bg-white hover:bg-zinc-100 text-zinc-900 border-none rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                            type="submit"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-700" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-3 bg-zinc-900 text-zinc-500 uppercase tracking-wider">Or</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form action={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'signup'}
                                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                {!isLogin && (
                                    <>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                name="fullName"
                                                placeholder="Full Name"
                                                required={!isLogin}
                                                disabled={isPending}
                                                className="h-12 pl-12 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-accent transition-colors" />
                                            <Input
                                                name="username"
                                                placeholder="Username"
                                                required={!isLogin}
                                                disabled={isPending}
                                                className="h-12 pl-12 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-accent/50 focus:ring-accent/20 rounded-xl transition-all"
                                            />
                                        </div>
                                    </>
                                )}
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="Email"
                                        required
                                        disabled={isPending}
                                        className="h-12 pl-12 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                                    />
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-accent transition-colors" />
                                    <Input
                                        name="password"
                                        type="password"
                                        placeholder="Password"
                                        required
                                        disabled={isPending}
                                        minLength={6}
                                        className="h-12 pl-12 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-accent/50 focus:ring-accent/20 rounded-xl transition-all"
                                    />
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl"
                            >
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    {isLogin ? 'Signing in...' : 'Creating account...'}
                                </>
                            ) : (
                                <>{isLogin ? 'Sign In' : 'Create Account'}</>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
