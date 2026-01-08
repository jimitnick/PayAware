import { getBalance, getRecentTransactions } from './actions'
import { TransactionForm } from './transaction-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import VoiceExpenseLogger from '@/components/ui/VoiceExpenseLogger'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { balance, income, expense } = await getBalance()
    const transactions = await getRecentTransactions()

    return (
        <div className="flex flex-col space-y-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="mx-10 md:mx-0 text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Financial Overview
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your personal finances efficiently.
                    </p>
                </div>
                <ModeToggle />
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="relative overflow-hidden border-none shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white dark:from-blue-900 dark:to-blue-950">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">Total Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatCurrency(balance)}</div>
                        <p className="text-xs text-blue-100/80 mt-1">
                            Available savings
                        </p>
                    </CardContent>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                </Card>

                <Card className="relative overflow-hidden border-none shadow-sm dark:bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                        <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(income)}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Inflow
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none shadow-sm dark:bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                        <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full">
                            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(expense)}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            Outflow
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            {/* ✅ FIXED: Added 'items-start' so columns don't stretch to match each other's height */}
            <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7 items-start">
                {/* Recent Transactions List */}
                <Card className="col-span-1 md:col-span-4 lg:col-span-4 border shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle>Recent Transactions</CardTitle>
                                <CardDescription>
                                    Your latest {transactions.length} activities.
                                </CardDescription>
                            </div>
                            <Activity className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {transactions.map((t, index) => (
                                <div key={t.id} className="flex items-center group">
                                    <div className={`flex items-center justify-center min-w-[36px] min-h-[36px] w-9 h-9 rounded-full transition-colors ${t.type === 'income'
                                        ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400 group-hover:bg-green-200 dark:group-hover:bg-green-900/60'
                                        : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 group-hover:bg-red-200 dark:group-hover:bg-red-900/60'
                                        }`}>
                                        {t.type === 'income' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                    </div>
                                    <div className="ml-4 space-y-1 flex-1">
                                        <p className="text-sm font-medium leading-none">{t.category}</p>
                                        <p className="text-xs text-muted-foreground truncate max-w-[180px] md:max-w-xs">{t.description || 'No description'}</p>
                                    </div>
                                    <div className={`ml-auto font-medium text-sm ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                                    </div>
                                </div>
                            ))}
                            {transactions.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Activity className="h-10 w-10 mb-2 opacity-20" />
                                    <p>No transactions found.</p>
                                    <p className="text-sm">Start by adding one!</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Transaction Form */}
                <div className="col-span-1 md:col-span-3 lg:col-span-3 space-y-6">

                    {/* 3. VOICE AGENT: Placed here for perfect alignment */}
                    <VoiceExpenseLogger userId={user?.id || ''} />

                    {/* MANUAL FORM: Placed below voice agent */}
                    <TransactionForm />

                </div>
            </div>
        </div>
    )
}