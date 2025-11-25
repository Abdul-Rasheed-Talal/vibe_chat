'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function LoadingPulse({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-1", className)}>
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full bg-primary"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                        y: [0, -4, 0]
                    }}
                    transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    )
}

export function LoadingPulseBubbles() {
    return (
        <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Left Bubble */}
            <motion.div
                className="absolute left-0 bottom-0 w-10 h-10 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30"
                animate={{
                    y: [0, -10, 0],
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Right Bubble */}
            <motion.div
                className="absolute right-0 top-4 w-8 h-8 rounded-full bg-accent/20 backdrop-blur-md border border-accent/30"
                animate={{
                    y: [0, 8, 0],
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.8, 0.3]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />

            {/* Center Pulse */}
            <div className="z-10 bg-card/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg shadow-primary/20 border border-white/10">
                <LoadingPulse />
            </div>
        </div>
    )
}
