import { LoadingPulseBubbles } from '@/components/ui/loading-pulse'

export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background overflow-hidden relative">
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[100px] animate-pulse" />
            </div>

            <div className="flex flex-col items-center gap-8 z-10">
                <LoadingPulseBubbles />
                <h1 className="text-2xl font-bold tracking-tighter glow-text animate-pulse">
                    Vibe Chat
                </h1>
            </div>
        </div>
    )
}
