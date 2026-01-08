
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ExternalLink, QrCode } from 'lucide-react'
import { getBalance } from '../dashboard/actions'
import { useToast } from '@/components/ui/use-toast'

export function PaymentGenerator() {
    const [vpa, setVpa] = useState('')
    const [amount, setAmount] = useState('')
    const [name, setName] = useState('')
    const [note, setNote] = useState('')
    const [balance, setBalance] = useState(0)

    useEffect(() => {
        const fetchBalance = async () => {
            const { balance } = await getBalance()
            setBalance(balance)
        }
        fetchBalance()
    }, [])

    const generateLink = () => {
        const amountNum = parseFloat(amount)
        if (isNaN(amountNum) || amountNum <= 0) return ''

        // Standard UPI Link format
        // upi://pay?pa=address&pn=name&am=amount&cu=INR&tn=note
        const params = new URLSearchParams()
        if (vpa) params.append('pa', vpa)
        if (name) params.append('pn', name)
        if (amount) params.append('am', amount)
        params.append('cu', 'INR')
        if (note) params.append('tn', note)

        return `upi://pay?${params.toString()}`
    }

    const { toast } = useToast()

    const handlePay = () => {
        const amountNum = parseFloat(amount)
        if (amountNum > balance) {
            toast({
                title: "Insufficient Balance",
                description: `You only have ₹${balance}. Cannot pay ₹${amount}.`,
                variant: "destructive"
            })
            return
        }

        const link = generateLink()
        if (link) {
            window.location.href = link
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                    Enter the recipient details to generate a payment link.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="vpa">Recipient VPA (UPI ID)</Label>
                        <Input
                            id="vpa"
                            placeholder="e.g. merchant@upi"
                            value={vpa}
                            onChange={(e) => setVpa(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Recipient Name (Optional)</Label>
                        <Input
                            id="name"
                            placeholder="e.g. John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="amount">Amount (INR)</Label>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Available balance: ₹{balance}</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="note">Note (Optional)</Label>
                    <Input
                        id="note"
                        placeholder="Payment for..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                <div className="pt-4 p-4 bg-muted/50 rounded-lg break-all text-xs font-mono text-muted-foreground">
                    Preview: {parseFloat(amount) > balance ? 'Insufficient balance' : generateLink()}
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handlePay} disabled={!vpa || !amount || parseFloat(amount) > balance}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in Payment App
                </Button>
            </CardFooter>
        </Card>
    )
}
