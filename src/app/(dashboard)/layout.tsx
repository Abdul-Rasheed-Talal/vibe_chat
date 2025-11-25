'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MessageSquare, User, Settings, LogOut, Moon, Sun, Menu, Search, Plus } from 'lucide-react'
import { useTheme } from 'next-themes'
import { signout } from '@/app/login/actions'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    const [showRightPanel, setShowRightPanel] = useState(true)

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-b border-border/40 flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary animate-pulse" />
                    <span className="font-bold text-lg tracking-tighter glow-text">Vibe Chat</span>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[80%] sm:w-[385px] p-0">
                        <SidebarContent pathname={pathname} theme={theme} setTheme={setTheme} />
                    </SheetContent>
                </Sheet>
            </header>

            {/* Desktop/Tablet Sidebar (Left Column) */}
            <aside className="hidden md:flex w-20 lg:w-80 border-r border-border/40 bg-card/80 backdrop-blur-xl flex-col z-20 transition-all duration-300 shrink-0 h-full">
                <SidebarContent pathname={pathname} theme={theme} setTheme={setTheme} />
            </aside>

            {/* Main Content (Center Column) */}
            <main className="flex-1 relative overflow-hidden flex flex-col pt-16 md:pt-0 pb-16 md:pb-0 h-full">
                {/* Background Gradients */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[100px]" />
                </div>

                <div className="flex-1 z-10 overflow-hidden grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-0 h-full">
                    <div className="flex flex-col overflow-hidden h-full relative">
                        {children}
                    </div>
                    {showRightPanel && (
                        <aside className="hidden xl:flex w-80 border-l border-border/40 bg-card/30 backdrop-blur-xl flex-col p-6 z-20 h-full overflow-y-auto shrink-0">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg">Details</h3>
                                <Button variant="ghost" size="icon" onClick={() => setShowRightPanel(false)}>
                                    <Settings className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-3">Shared Media</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[1, 2, 3, 4, 5, 6].map(i => (
                                            <div key={i} className="aspect-square rounded-md bg-muted/50 animate-pulse" />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-3">Members</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/20" />
                                            <span className="text-sm">You</span>
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto">Admin</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-t border-border/40 flex items-center justify-around z-50 px-4">
                <Link href="/direct" className={`flex flex-col items-center p-1 rounded-lg ${pathname.startsWith('/direct') ? 'text-primary' : 'text-muted-foreground'}`}>
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-[10px] mt-1">Chats</span>
                </Link>
                <Link href="/profile" className={`flex flex-col items-center p-1 rounded-lg ${pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <User className="h-5 w-5" />
                    <span className="text-[10px] mt-1">Profile</span>
                </Link>
                <Button variant="ghost" size="icon" className="flex flex-col items-center h-auto py-1" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    <div className="relative h-5 w-5">
                        <Sun className="absolute inset-0 h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute inset-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </div>
                    <span className="text-[10px] mt-1">Theme</span>
                </Button>
                <form action={signout}>
                    <Button variant="ghost" size="icon" className="flex flex-col items-center h-auto py-1 text-destructive">
                        <LogOut className="h-5 w-5" />
                        <span className="text-[10px] mt-1">Logout</span>
                    </Button>
                </form>
            </nav>
        </div>
    )
}

function SidebarContent({ pathname, theme, setTheme }: { pathname: string, theme: string | undefined, setTheme: (theme: string) => void }) {
    return (
        <div className="flex flex-col h-full w-full py-6">
            <div className="mb-8 px-6 flex items-center gap-2 lg:px-6 justify-center lg:justify-start shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary animate-pulse shrink-0" />
                <span className="font-bold text-xl tracking-tighter glow-text hidden lg:block">Vibe Chat</span>
            </div>

            <div className="px-4 mb-6 hidden lg:block shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search vibes..."
                        className="w-full bg-muted/50 border-none rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    />
                </div>
            </div>

            <nav className="flex-1 space-y-2 px-3 overflow-y-auto">
                <NavItem href="/direct" icon={<MessageSquare />} label="Chats" active={pathname.startsWith('/direct')} />
                <NavItem href="/profile" icon={<User />} label="Profile" active={pathname === '/profile'} />
                <NavItem href="/settings" icon={<Settings />} label="Settings" active={pathname === '/settings'} />
            </nav>

            <div className="mt-auto px-3 space-y-2 shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-full justify-center lg:justify-start lg:px-4"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                    <div className="relative h-5 w-5 shrink-0">
                        <Sun className="absolute inset-0 h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute inset-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </div>
                    <span className="ml-3 hidden lg:block">Theme</span>
                </Button>

                <form action={signout}>
                    <Button variant="ghost" className="w-full justify-center lg:justify-start lg:px-4 text-destructive hover:text-destructive">
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className="ml-3 hidden lg:block">Logout</span>
                    </Button>
                </form>
            </div>
        </div>
    )
}

function NavItem({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
    return (
        <Link href={href}>
            <Button
                variant={active ? "secondary" : "ghost"}
                className={`w-full justify-center lg:justify-start lg:px-4 h-12 lg:h-10 ${active ? 'glow-box bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
                {icon}
                <span className="hidden lg:block ml-3 font-medium">{label}</span>
            </Button>
        </Link>
    )
}
