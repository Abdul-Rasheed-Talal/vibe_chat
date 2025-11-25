import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "glow" | "neon" | "glass"
  glowColor?: "teal" | "purple" | "blue" | "pink" | "orange"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", glowColor = "teal", ...props }, ref) => {
    const glowColors = {
      teal: "focus-visible:shadow-teal-500/25 focus-visible:border-teal-400",
      purple: "focus-visible:shadow-purple-500/25 focus-visible:border-purple-400",
      blue: "focus-visible:shadow-blue-500/25 focus-visible:border-blue-400",
      pink: "focus-visible:shadow-pink-500/25 focus-visible:border-pink-400",
      orange: "focus-visible:shadow-orange-500/25 focus-visible:border-orange-400"
    }

    const variants = {
      default: "border-2 border-white/20 bg-white/5 backdrop-blur-sm",
      glow: `border-2 border-white/20 bg-white/5 backdrop-blur-sm focus-visible:shadow-lg ${glowColors[glowColor]}`,
      neon: `border-2 border-${glowColor}-400/30 bg-${glowColor}-500/5 backdrop-blur-sm shadow-lg shadow-${glowColor}-500/10`,
      glass: "border-2 border-white/30 bg-white/10 backdrop-blur-xl"
    }

    return (
      <motion.div whileTap={{ scale: 0.995 }} className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300",
            "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
            "disabled:cursor-not-allowed disabled:opacity-50 text-white",
            variants[variant],
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    )
  }
)
Input.displayName = "Input"

export { Input }