'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login, signup, signInWithGoogle } from '@/app/login/actions'
import { Loader2, Mail, Lock, User, Eye, EyeOff, MessageCircle, Zap } from 'lucide-react'

export function AuthForm() {
    const [isLogin, setIsLogin] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [currentColor, setCurrentColor] = useState<keyof typeof colorThemes>('teal')

    const colorThemes = {
        teal: 'from-cyan-400 to-teal-500',
        purple: 'from-purple-400 to-pink-500',
        blue: 'from-blue-400 to-indigo-500',
        orange: 'from-orange-400 to-red-500'
    }

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
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
            {/* Animated Background Elements - Simplified for performance */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl opacity-50"></div>
            </div>

            {/* Theme Selector */}
            <div className="absolute top-6 right-6 flex gap-2 z-30">
                {Object.entries(colorThemes).map(([color, gradient]) => (
                    <button
                        key={color}
                        onClick={() => setCurrentColor(color as keyof typeof colorThemes)}
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} transition-transform hover:scale-110 border-2 ${currentColor === color ? 'border-white' : 'border-transparent'}`}
                        aria-label={`Select ${color} theme`}
                    />
                ))}
            </div>

            {/* Main Card Container */}
            <div className="relative w-full max-w-[1200px] min-h-[600px] bg-white/5 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col lg:flex-row z-10">

                {/* Animated Overlay Panels */}
                <AnimatePresence mode="wait" initial={false}>
                    {isLogin ? (
                        <motion.div
                            key="signup-prompt-overlay"
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            className={`absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-br ${colorThemes[currentColor]} z-20 hidden lg:flex flex-col items-center justify-center p-12 text-white text-center`}
                        >
                            <div className="mb-8 flex items-center gap-4">
                                <Zap className="w-12 h-12" />
                                <span className="text-4xl font-black tracking-tight">VibeChat</span>
                            </div>

                            <h2 className="text-5xl font-black mb-6">New Here?</h2>

                            <p className="text-lg text-white/90 mb-10 leading-relaxed font-medium max-w-sm">
                                Sign up and discover a great amount of new opportunities!
                            </p>

                            <button
                                onClick={() => setIsLogin(false)}
                                className="px-12 py-4 border-2 border-white/50 rounded-xl font-bold text-lg tracking-wider hover:bg-white/10 hover:border-white transition-all duration-300 uppercase"
                            >
                                Sign Up
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="signin-prompt-overlay"
                            initial={{ x: '-100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '-100%', opacity: 0 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            className={`absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-br ${colorThemes[currentColor]} z-20 hidden lg:flex flex-col items-center justify-center p-12 text-white text-center`}
                        >
                            <div className="mb-8 flex items-center gap-4">
                                <MessageCircle className="w-12 h-12" />
                                <span className="text-4xl font-black tracking-tight">VibeChat</span>
                            </div>

                            <h2 className="text-5xl font-black mb-6">Welcome Back!</h2>

                            <p className="text-lg text-white/90 mb-10 leading-relaxed font-medium max-w-sm">
                                To keep connected with us please login with your personal info.
                            </p>

                            <button
                                onClick={() => setIsLogin(true)}
                                className="px-12 py-4 border-2 border-white/50 rounded-xl font-bold text-lg tracking-wider hover:bg-white/10 hover:border-white transition-all duration-300 uppercase"
                            >
                                Sign In
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Left Form Section (Sign In) */}
                <div className={`w-full lg:w-1/2 p-8 lg:p-12 flex flex-col items-center justify-center transition-all duration-500 ${!isLogin ? 'lg:opacity-0 lg:pointer-events-none' : 'opacity-100'}`}>
                    <div className="w-full max-w-sm flex flex-col items-center">
                        <h2 className="text-4xl font-black mb-8 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                            Sign In
                        </h2>

                        {/* Social Login - Only Google */}
                        <div className="flex gap-4 mb-8 w-full">
                            <form action={async () => { await signInWithGoogle() }} className="w-full">
                                <button
                                    type="submit"
                                    className="w-full h-12 rounded-xl border border-white/20 flex items-center justify-center gap-3 text-white hover:bg-white/5 transition-all duration-300 font-medium"
                                >
                                    <span className="font-bold text-xl">G+</span>
                                    <span>Continue with Google</span>
                                </button>
                            </form>
                        </div>

                        <div className="w-full flex items-center gap-4 mb-8">
                            <div className="h-px bg-white/10 flex-1"></div>
                            <span className="text-white/40 text-sm font-medium">or email</span>
                            <div className="h-px bg-white/10 flex-1"></div>
                        </div>

                        <form action={handleSubmit} className="w-full space-y-4">
                            <div className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="Email address"
                                        required
                                        disabled={isPending}
                                        className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30 focus:bg-white/10 transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <Input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        required
                                        disabled={isPending}
                                        className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30 focus:bg-white/10 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="text-right">
                                <a href="#" className="text-sm text-white/40 hover:text-white/60 transition-colors">
                                    Forgot password?
                                </a>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-sm text-red-300 text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Button
                                type="submit"
                                className={`w-full h-12 mt-2 bg-gradient-to-r ${colorThemes[currentColor]} hover:opacity-90 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg border-0`}
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 lg:hidden">
                            <p className="text-white/60 text-sm">
                                Don't have an account?{' '}
                                <button onClick={() => setIsLogin(false)} className="text-white font-bold hover:underline">
                                    Sign Up
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Form Section (Sign Up) */}
                <div className={`w-full lg:w-1/2 p-8 lg:p-12 flex flex-col items-center justify-center transition-all duration-500 ${isLogin ? 'lg:opacity-0 lg:pointer-events-none hidden lg:flex' : 'opacity-100'}`}>
                    <div className="w-full max-w-sm flex flex-col items-center">
                        <h2 className="text-4xl font-black mb-8 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                            Create Account
                        </h2>

                        {/* Social Login - Only Google */}
                        <div className="flex gap-4 mb-8 w-full">
                            <form action={async () => { await signInWithGoogle() }} className="w-full">
                                <button
                                    type="submit"
                                    className="w-full h-12 rounded-xl border border-white/20 flex items-center justify-center gap-3 text-white hover:bg-white/5 transition-all duration-300 font-medium"
                                >
                                    <span className="font-bold text-xl">G+</span>
                                    <span>Sign up with Google</span>
                                </button>
                            </form>
                        </div>

                        <div className="w-full flex items-center gap-4 mb-8">
                            <div className="h-px bg-white/10 flex-1"></div>
                            <span className="text-white/40 text-sm font-medium">or email</span>
                            <div className="h-px bg-white/10 flex-1"></div>
                        </div>

                        <form action={handleSubmit} className="w-full space-y-4">
                            <div className="space-y-4">
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <Input
                                        name="fullName"
                                        placeholder="Full Name"
                                        required
                                        disabled={isPending}
                                        className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30 focus:bg-white/10 transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <Input
                                        name="username"
                                        placeholder="@username"
                                        required
                                        disabled={isPending}
                                        className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30 focus:bg-white/10 transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="Email address"
                                        required
                                        disabled={isPending}
                                        className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30 focus:bg-white/10 transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <Input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        required
                                        disabled={isPending}
                                        className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30 focus:bg-white/10 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-sm text-red-300 text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Button
                                type="submit"
                                className={`w-full h-12 mt-2 bg-gradient-to-r ${colorThemes[currentColor]} hover:opacity-90 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg border-0`}
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    'Sign Up'
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 lg:hidden">
                            <p className="text-white/60 text-sm">
                                Already have an account?{' '}
                                <button onClick={() => setIsLogin(true)} className="text-white font-bold hover:underline">
                                    Sign In
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}