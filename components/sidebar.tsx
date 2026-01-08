'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    CreditCard,
    PieChart,
    Bell,
    Menu,
    LogOut,
    Wallet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ModeToggle } from '@/components/mode-toggle'
import { signOut } from './sidebar-actions'

interface SidebarProps {
    userEmail?: string
    userAvatarUrl?: string
}

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/payments', label: 'Payments', icon: CreditCard },
    { href: '/insights', label: 'Insights', icon: PieChart },
    { href: '/updates', label: 'Updates', icon: Bell },
]

export function Sidebar({ userEmail, userAvatarUrl }: SidebarProps) {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    return (
        <>
            {/* Mobile Trigger */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <div className="flex flex-col h-full">
                        <div className="p-6">
                            <div className="flex items-center gap-2 font-bold text-xl">
                                <Wallet className="h-6 w-6 text-primary" />
                                <span>PayAware</span>
                            </div>
                        </div>
                        <Separator />
                        <nav className="flex-1 p-4 space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </nav>
                        <div className="p-4 border-t">
                            <div className="flex items-center gap-3 mb-4">
                                <Avatar>
                                    <AvatarImage src={userAvatarUrl} />
                                    <AvatarFallback>{userEmail?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{userEmail}</p>
                                </div>
                                <ModeToggle />
                            </div>
                            <form action={signOut}>
                                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </Button>
                            </form>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col w-64 fixed inset-y-0 border-r bg-card/50 backdrop-blur-xl">
                <div className="p-6">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <Wallet className="h-6 w-6 text-primary" />
                        <span>PayAware</span>
                    </div>
                </div>
                <Separator />
                <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        )
                    })}
                </div>
                <div className="p-4 border-t bg-background/50">
                    <div className="flex items-center gap-3 mb-4">
                        <Avatar>
                            <AvatarImage src={userAvatarUrl} />
                            <AvatarFallback>{userEmail?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" title={userEmail}>{userEmail}</p>
                        </div>
                        <div className="scale-75 origin-right">
                            <ModeToggle />
                        </div>
                    </div>
                    <form action={signOut}>
                        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </Button>
                    </form>
                </div>
            </div>
        </>
    )
}
