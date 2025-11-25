'use client'

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] hover:shadow-xl",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] hover:brightness-110",
                destructive: "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-2xl shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.02]",
                outline: "border-2 border-white/20 bg-transparent text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/30 hover:scale-[1.02]",
                secondary: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02]",
                ghost: "bg-transparent text-white hover:bg-white/10 hover:scale-[1.02] backdrop-blur-sm",
                link: "text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300",
                glow: "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:scale-[1.02] hover:brightness-110 animate-pulse",
                neon: "bg-transparent border-2 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/25 hover:bg-cyan-400/10 hover:shadow-cyan-400/40 hover:scale-[1.02]",
                glass: "bg-white/10 border-2 border-white/20 text-white backdrop-blur-xl hover:bg-white/20 hover:border-white/30 hover:scale-[1.02]"
            },
            size: {
                default: "h-12 px-8 py-3 text-base",
                sm: "h-10 rounded-xl px-4 text-sm",
                lg: "h-14 rounded-2xl px-10 text-lg",
                xl: "h-16 rounded-2xl px-12 text-xl",
                icon: "h-12 w-12 rounded-2xl"
            },
            animation: {
                none: "",
                pulse: "animate-pulse",
                bounce: "animate-bounce",
                spin: "animate-spin"
            }
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            animation: "none"
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    loading?: boolean
    success?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, animation, asChild = false, loading, success, children, ...props }, ref) => {
        const Comp = (asChild ? Slot : motion.button) as any

        const buttonContent = loading ? (
            <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Loading...</span>
            </div>
        ) : success ? (
            <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-green-500" />
                <span>Success!</span>
            </div>
        ) : children

        const motionProps = !asChild ? {
            whileHover: { scale: 1.02 },
            whileTap: { scale: 0.98 },
            initial: { scale: 1 },
        } : {}

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, animation, className }))}
                ref={ref}
                {...(asChild ? {} : motionProps)}
                {...props}
            >
                {buttonContent}
            </Comp>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }