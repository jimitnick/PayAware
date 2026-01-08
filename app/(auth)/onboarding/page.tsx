
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutDashboard, Loader2, Sparkles, IndianRupee } from 'lucide-react'
import { saveUserProfile } from './actions'

export default function OnboardingPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [monthlyBudget, setMonthlyBudget] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [checkingAuth, setCheckingAuth] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/signup')
                return
            }
            // Pre-fill email from auth
            if (user.email) {
                setEmail(user.email)
            }
            setCheckingAuth(false)
        }
        checkUser()
    }, [supabase, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!name.trim()) {
            setError('Please enter your name')
            setLoading(false)
            return
        }

        if (!monthlyBudget || parseFloat(monthlyBudget) <= 0) {
            setError('Please enter a valid monthly budget')
            setLoading(false)
            return
        }

        const result = await saveUserProfile({
            name: name.trim(),
            email: email,
            monthlyBudget: parseFloat(monthlyBudget),
        })

        if (result.error) {
            setError(result.error)
            setLoading(false)
            return
        }

        // Sign out and redirect to login
        await supabase.auth.signOut()
        router.push('/login?onboarded=true')
    }

    if (checkingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
            <div className="w-full max-w-lg space-y-8">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <LayoutDashboard className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Welcome to PayAware!
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Let's set up your profile to get started
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-yellow-500" />
                            Complete Your Profile
                        </CardTitle>
                        <CardDescription>
                            This information helps us personalize your experience
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">
                                    This is the email you signed up with
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="budget">Monthly Budget (INR)</Label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="budget"
                                        type="number"
                                        required
                                        min={0}
                                        placeholder="50000"
                                        className="pl-9"
                                        value={monthlyBudget}
                                        onChange={(e) => setMonthlyBudget(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Set your monthly spending limit to track expenses
                                </p>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Setting up...
                                    </>
                                ) : (
                                    'Complete Setup'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="text-center text-xs text-gray-500">
                    <p>Your data is secure and never shared with third parties.</p>
                </div>
            </div>
        </div>
    )
}
