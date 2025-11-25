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
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 p-4">
            {/* Main Card Container - Increased size */}
            <div className="relative w-full max-w-[1200px] min-h-[800px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex">

                {/* Animated Overlay Panels (Teal Section) */}
                <AnimatePresence mode="wait" initial={false}>
                    {isLogin ? (
                        <motion.div
                            key="login-overlay"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            className="absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-br from-teal-400 to-teal-600 z-20 flex flex-col items-center justify-center p-20 text-white text-center"
                        >
                            <div className="mb-10 flex items-center gap-4">
                                <Sparkles className="w-10 h-10" />
                                <span className="text-3xl font-bold tracking-wide">Vibe Chat</span>
                            </div>
                            <h2 className="text-5xl font-bold mb-8">Welcome Back!</h2>
                            <p className="text-xl text-teal-50 mb-12 leading-relaxed">
                                To keep connected with us please<br />login with your personal info
                            </p>
                            <button
                                onClick={() => setIsLogin(false)}
                                className="px-16 py-4 border-2 border-white rounded-full font-bold text-lg tracking-wider hover:bg-white hover:text-teal-600 transition-all duration-300 uppercase"
                            >
                                Sign Up
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="signup-overlay"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-br from-teal-400 to-teal-600 z-20 flex flex-col items-center justify-center p-20 text-white text-center"
                        >
                            <div className="mb-10 flex items-center gap-4">
                                <Sparkles className="w-10 h-10" />
                                <span className="text-3xl font-bold tracking-wide">Vibe Chat</span>
                            </div>
                            <h2 className="text-5xl font-bold mb-8">Hello, Friend!</h2>
                            <p className="text-xl text-teal-50 mb-12 leading-relaxed">
                                Enter your personal details<br />and start your journey with us
                            </p>
                            <button
                                onClick={() => setIsLogin(true)}
                                className="px-16 py-4 border-2 border-white rounded-full font-bold text-lg tracking-wider hover:bg-white hover:text-teal-600 transition-all duration-300 uppercase"
                            >
                                Sign In
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Left Form Section (Sign In Form) */}
                <div className={`w-1/2 p-20 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${!isLogin ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="w-full max-w-md flex flex-col items-center">
                        <h2 className="text-5xl font-bold text-teal-500 mb-10">Sign In</h2>

                        {/* Social Icons */}
                        <div className="flex gap-6 mb-8">
                            <button className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-teal-500 hover:text-teal-500 transition-all">
                                <span className="font-bold text-xl">f</span>
                            </button>
                            <form action={async () => { await signInWithGoogle() }}>
                                <button type="submit" className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-red-500 hover:text-red-500 transition-all">
                                    <span className="font-bold text-xl">G+</span>
                                </button>
                            </form>
                            <button className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500 transition-all">
                                <span className="font-bold text-xl">in</span>
                            </button>
                        </div>

                        <p className="text-gray-400 text-base mb-10">or use your email account</p>

                        <form action={handleSubmit} className="w-full space-y-6">
                            <div className="relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="Email"
                                    required
                                    disabled={isPending}
                                    className="h-14 pl-16 bg-gray-100 border-none rounded-none text-lg text-gray-700 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-teal-500"
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    required
                                    disabled={isPending}
                                    minLength={6}
                                    className="h-14 pl-16 bg-gray-100 border-none rounded-none text-lg text-gray-700 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-teal-500"
                                />
                            </div>

                            <div className="text-right pt-2">
                                <a href="#" className="text-base text-gray-400 hover:text-teal-500 transition-colors">Forgot your password?</a>
                            </div>

                            {error && (
                                <div className="p-4 text-base text-red-500 bg-red-50 rounded-lg text-center">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-14 mt-6 bg-teal-500 hover:bg-teal-600 text-white font-bold text-lg rounded-full uppercase tracking-wider transition-all shadow-lg shadow-teal-500/30"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Right Form Section (Sign Up Form) */}
                <div className={`w-1/2 p-20 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${isLogin ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="w-full max-w-md flex flex-col items-center">
                        <h2 className="text-5xl font-bold text-teal-500 mb-10">Create Account</h2>

                        {/* Social Icons */}
                        <div className="flex gap-6 mb-8">
                            <button className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-teal-500 hover:text-teal-500 transition-all">
                                <span className="font-bold text-xl">f</span>
                            </button>
                            <form action={async () => { await signInWithGoogle() }}>
                                <button type="submit" className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-red-500 hover:text-red-500 transition-all">
                                    <span className="font-bold text-xl">G+</span>
                                </button>
                            </form>
                            <button className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500 transition-all">
                                <span className="font-bold text-xl">in</span>
                            </button>
                        </div>

                        <p className="text-gray-400 text-base mb-10">or use your email for registration</p>

                        <form action={handleSubmit} className="w-full space-y-6">
                            <div className="relative">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                                <Input
                                    name="fullName"
                                    placeholder="Name"
                                    required
                                    disabled={isPending}
                                    className="h-14 pl-16 bg-gray-100 border-none rounded-none text-lg text-gray-700 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-teal-500"
                                />
                            </div>

                            <div className="relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="Email"
                                    required
                                    disabled={isPending}
                                    className="h-14 pl-16 bg-gray-100 border-none rounded-none text-lg text-gray-700 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-teal-500"
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    required
                                    disabled={isPending}
                                    minLength={6}
                                    className="h-14 pl-16 bg-gray-100 border-none rounded-none text-lg text-gray-700 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-teal-500"
                                />
                            </div>

                            <div className="relative">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                                <Input
                                    name="username"
                                    placeholder="Username"
                                    required
                                    disabled={isPending}
                                    className="h-14 pl-16 bg-gray-100 border-none rounded-none text-lg text-gray-700 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-teal-500"
                                />
                            </div>

                            {error && (
                                <div className="p-4 text-base text-red-500 bg-red-50 rounded-lg text-center">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-14 mt-6 bg-teal-500 hover:bg-teal-600 text-white font-bold text-lg rounded-full uppercase tracking-wider transition-all shadow-lg shadow-teal-500/30"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Sign Up'
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
