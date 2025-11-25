import { AuthForm } from '@/components/auth/AuthForm'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[120px] animate-pulse" />
            </div>

            <div className="z-10 w-full max-w-[480px] flex flex-col items-center">
                <div className="mb-8 text-center space-y-2">
                    <div className="h-12 w-12 bg-primary rounded-full mx-auto animate-pulse shadow-lg shadow-primary/50" />
                    <h1 className="text-4xl font-bold tracking-tighter glow-text">Vibe Chat</h1>
                    <p className="text-muted-foreground text-sm">Connect with your vibe tribe.</p>
                </div>
                <AuthForm />
            </div>
        </div>
    )
}
