'use client'

import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const SUGGESTIONS = [
    "No cap 🧢",
    "Bet! 🔥",
    "Slay 💅",
    "Vibe check ✨",
    "For real? 💀",
    "W 🚀",
    "L + Ratio",
    "Main character energy",
    "Sounds good!",
    "On my way!"
]

export function AISuggestions({ onSelect }: { onSelect: (text: string) => void }) {
    // Randomly select 3 suggestions
    const suggestions = SUGGESTIONS.sort(() => 0.5 - Math.random()).slice(0, 3)

    return (
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center text-xs text-primary font-medium whitespace-nowrap">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Vibe
            </div>
            {suggestions.map((text, i) => (
                <motion.div
                    key={text}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary whitespace-nowrap"
                        onClick={() => onSelect(text)}
                    >
                        {text}
                    </Button>
                </motion.div>
            ))}
        </div>
    )
}
