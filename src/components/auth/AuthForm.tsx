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
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative bg-gradient-to-br from-zinc-900/90 via-zinc-900/95 to-black/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Top accent line */}
                <div className="h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />

                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.6 }}
                            className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent mb-3"
                        >
                            <Sparkles className="w-7 h-7 text-white" />
                        </motion.div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                            {isLogin ? 'Welcome Back' : 'Join Vibe Chat'}
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            {isLogin ? 'Continue your conversations' : 'Start connecting with your tribe'}
                        </p>
                    </div>

                    {/* Tab Toggle */}
                    <div className="relative flex p-1 bg-zinc-800/50 rounded-xl">
                        <motion.div
                            className="absolute top-1 bottom-1 bg-gradient-to-r from-primary to-accent rounded-lg"
                            initial={false}
                            animate={{
                                left: isLogin ? '0.25rem' : '50%',
                                right: isLogin ? '50%' : '0.25rem',
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${isLogin ? 'text-white' : 'text-zinc-400 hover:text-zinc-300'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${!isLogin ? 'text-white' : 'text-zinc-400 hover:text-zinc-300'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Google Sign In - FIXED */}
                    <form action={async () => { await signInWithGoogle() }}>
                        <Button
                            variant="outline"
                            className="w-full h-11 bg-white hover:bg-zinc-50 text-zinc-900 border-none rounded-lg font-medium transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                            type="submit"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                            </svg>
                            <span className="text-sm">Continue with Google</span>
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-700/50" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-zinc-900 text-zinc-500 uppercase tracking-wider">Or</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form action={handleSubmit} className="space-y-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'signup'}
                                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-3"
                            >
                                {!isLogin && (
                                    <>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                name="fullName"
                                                placeholder="Full Name"
                                                required={!isLogin}
                                                disabled={isPending}
                                                className="h-11 pl-10 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg transition-all"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-accent transition-colors" />
                                            <Input
                                                name="username"
                                                placeholder="Username"
                                                required={!isLogin}
                                                disabled={isPending}
                                                className="h-11 pl-10 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 rounded-lg transition-all"
                                            />
                                        </div>
                                    </>
                                )}
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="Email"
                                        required
                                        disabled={isPending}
                                        className="h-11 pl-10 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg transition-all"
                                    />
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-accent transition-colors" />
                                    <Input
                                        name="password"
                                        type="password"
                                        placeholder="Password"
                                        required
                                        disabled={isPending}
                                        minLength={6}
                                        className="h-11 pl-10 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 rounded-lg transition-all"
                                    />
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg"
                            >
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
