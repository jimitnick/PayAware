

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LayoutDashboard, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const justOnboarded = searchParams.get('onboarded') === 'true'

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (signInError) {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            })

            if (signUpError) {
                setError(signInError.message)
            } else {
                router.refresh()
                router.push('/dashboard')
            }
        } else {
            router.refresh()
            router.push('/dashboard')
        }

        router.refresh()
        router.push('/dashboard')
        setLoading(false)
    }

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
            {/* Left Side - Brand & Visuals */}
            <div className="hidden bg-black lg:block relative overflow-hidden">
                {/* Abstract Background Animation */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-900 via-black to-blue-950">
                    <div className="absolute top-0 left-0 w-full h-full opacity-30">
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500 blur-[80px] animate-pulse" style={{ animationDuration: '4s' }} />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600 blur-[80px] animate-pulse" style={{ animationDuration: '7s' }} />
                    </div>
                </div>

                <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center text-lg font-medium"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur mr-2">
                            <LayoutDashboard className="h-5 w-5 text-blue-400" />
                        </div>
                        PayAware
                    </motion.div>

                    <div className="space-y-6">
                        <motion.blockquote
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="space-y-2"
                        >
                            <p className="text-3xl font-light leading-snug tracking-tight lg:text-4xl text-gray-200">
                                "Financial awareness isn't just about numbers. It's about <span className="text-blue-400 font-normal">clarity</span>, <span className="text-indigo-400 font-normal">control</span>, and <span className="text-purple-400 font-normal">peace of mind</span>."
                            </p>
                            <footer className="text-base text-gray-400 mt-4 flex items-center gap-2">
                                <div className="h-px w-8 bg-gray-600"></div>
                                The PayAware Philosophy
                            </footer>
                        </motion.blockquote>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="flex gap-4 text-sm text-gray-500"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" /> Secure
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-500" /> Private
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Intelligent
                            </div>
                        </motion.div>
                    </div>

                    <div className="text-sm text-gray-500">
                        &copy; 2024 PayAware Inc.
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-8 lg:p-8 bg-background">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px]"
                >
                    <div className="flex flex-col space-y-2 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 lg:hidden text-white mb-2">
                            <LayoutDashboard className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                            Welcome Back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email to sign in or create an account
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <form onSubmit={handleLogin}>
                            <div className="grid gap-4">
                                <motion.div
                                    className="grid gap-2"
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Label htmlFor="email" className="font-medium text-foreground">Email</Label>
                                    <Input
                                        id="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        disabled={loading}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11 px-4 bg-muted/30 border-input hover:border-blue-400 focus:border-blue-500 transition-colors"
                                    />
                                </motion.div>
                                <motion.div
                                    className="grid gap-2"
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Label htmlFor="password" className="font-medium text-foreground">Password</Label>
                                    <Input
                                        id="password"
                                        placeholder="••••••••"
                                        type="password"
                                        autoCapitalize="none"
                                        autoComplete="current-password"
                                        disabled={loading}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-11 px-4 bg-muted/30 border-input hover:border-blue-400 focus:border-blue-500 transition-colors"
                                    />
                                </motion.div>

                                {error && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        className="text-red-500 text-sm bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-200 dark:border-red-900/30"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Button disabled={loading} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]">
                                        {loading && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Continue with Email
                                    </Button>
                                </motion.div>
                            </div>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Trusted by financial experts
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
