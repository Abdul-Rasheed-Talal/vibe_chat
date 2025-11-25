import { AuthForm } from '@/components/auth/AuthForm'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-96 h-96 rounded-full bg-primary/20 blur-[100px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[5%] w-96 h-96 rounded-full bg-accent/20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

            <div className="z-10 w-full flex flex-col items-center">
                <div className="mb-12 text-center space-y-3">
                    <h1 className="text-5xl font-bold tracking-tighter bg-gradient-to-r from-white via-primary to-accent bg-clip-text text-transparent drop-shadow-2xl">
                        Vibe Chat
                    </h1>
                    <p className="text-zinc-400">Connect with your vibe tribe.</p>
                </div>
                <AuthForm />
            </div>
        </div>
    )
}
