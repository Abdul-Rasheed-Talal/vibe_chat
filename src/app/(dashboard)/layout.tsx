'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MessageSquare, User, Settings, LogOut, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { signout } from '@/app/login/actions'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-64 border-r border-border/40 bg-card/50 backdrop-blur-xl flex-col items-stretch py-6 z-20">
                <div className="mb-8 px-4 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary animate-pulse" />
                    <span className="font-bold text-xl tracking-tighter glow-text">Vibe Chat</span>
                </div>

                <nav className="flex-1 space-y-2 px-2">
                    <NavItem href="/direct" icon={<MessageSquare />} label="Chats" active={pathname.startsWith('/direct')} />
                    <NavItem href="/profile" icon={<User />} label="Profile" active={pathname === '/profile'} />
                    <NavItem href="/settings" icon={<Settings />} label="Settings" active={pathname === '/settings'} />
                </nav>

                <div className="mt-auto px-2 space-y-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-full justify-start px-4"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="ml-2">Theme</span>
                    </Button>

                    <form action={signout}>
                        <Button variant="ghost" className="w-full justify-start px-4 text-destructive hover:text-destructive">
                            <LogOut className="h-5 w-5" />
                            <span className="ml-2">Logout</span>
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-t border-border/40 flex items-center justify-around z-50 px-4">
                <Link href="/direct" className={`p-2 rounded-full ${pathname.startsWith('/direct') ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}>
                    <MessageSquare className="h-6 w-6" />
                </Link>
                <Link href="/profile" className={`p-2 rounded-full ${pathname === '/profile' ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}>
                    <User className="h-6 w-6" />
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
                <form action={signout}>
                    <Button variant="ghost" size="icon" className="text-destructive">
                        <LogOut className="h-5 w-5" />
                    </Button>
                </form>
            </nav>

            {/* Main Content (Middle Column) */}
            <main className="flex-1 relative overflow-hidden flex flex-col">
                {/* Background Gradients */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[100px]" />
                </div>

                <div className="flex-1 z-10 overflow-hidden">
                    {children}
                </div>
            </main>

            {/* Right Column (Info/Media) - Placeholder for now, can be toggleable */}
            {/* <aside className="hidden lg:block w-80 border-l border-border/40 bg-card/30 backdrop-blur-xl p-6">
                <h3 className="font-semibold mb-4">Shared Media</h3>
                <div className="grid grid-cols-3 gap-2">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="aspect-square rounded-md bg-muted/50 animate-pulse" />
                    ))}
                </div>
            </aside> */}
        </div>
    )
}

function NavItem({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
    return (
        <Link href={href}>
            <Button
                variant={active ? "secondary" : "ghost"}
                className={`w-full justify-center md:justify-start md:px-4 ${active ? 'glow-box' : ''}`}
            >
                {icon}
                <span className="hidden md:block ml-2">{label}</span>
            </Button>
        </Link>
    )
}
