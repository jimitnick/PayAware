
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
    const { toast } = useToast()
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

        return () => {
            document.body.removeChild(script)
        }
    }, [])

    const handlePay = async () => {
        if (!scriptLoaded) {
            toast({
                title: 'Loading',
                description: 'Payment system is loading, please wait...',
                variant: 'default',
            })
            return
        }

        setLoading(true)

        try {
            // Create order
            const orderResponse = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    recipientVpa: vpa,
                    recipientName: name,
                    note: note,
                }),
            })

            if (!orderResponse.ok) {
                const error = await orderResponse.json()
                throw new Error(error.error || 'Failed to create order')
            }

            const orderData = await orderResponse.json()

            // Open Razorpay checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'PayAware',
                description: `Payment to ${name || vpa || 'Recipient'}`,
                order_id: orderData.orderId,
                handler: async function (response: RazorpayResponse) {
                    // Verify payment
                    const verifyResponse = await fetch('/api/razorpay/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: parseFloat(amount),
                            recipientName: name,
                            recipientVpa: vpa,
                            note: note,
                        }),
                    })

                    if (verifyResponse.ok) {
                        toast({
                            title: 'Payment Successful',
                            description: `₹${amount} paid successfully!`,
                        })
                        // Reset form
                        setVpa('')
                        setAmount('')
                        setName('')
                        setNote('')
                    } else {
                        toast({
                            title: 'Verification Failed',
                            description: 'Payment verification failed. Please contact support.',
                            variant: 'destructive',
                        })
                    }
                    setLoading(false)
                },
                prefill: {
                    name: name || undefined,
                },
                notes: {
                    recipientVpa: vpa,
                    note: note,
                },
                theme: {
                    color: '#3B82F6',
                },
                config: {
                    display: {
                        blocks: {
                            banks: {
                                name: 'Pay using UPI or Card',
                                instruments: [
                                    { method: 'upi' },
                                    { method: 'card', types: ['credit', 'debit'] },
                                ],
                            },
                        },
                        sequence: ['block.banks'],
                        preferences: {
                            show_default_blocks: false,
                        },
                    },
                },
            }

            const rzp = new window.Razorpay(options)
            rzp.on('payment.failed', function () {
                toast({
                    title: 'Payment Failed',
                    description: 'The payment was unsuccessful. Please try again.',
                    variant: 'destructive',
                })
                setLoading(false)
            })
            rzp.open()
        } catch (error) {
            console.error('Payment error:', error)
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to initiate payment',
                variant: 'destructive',
            })
            setLoading(false)
        }
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
                    Enter the recipient details and pay securely via Razorpay.
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
                        min={0}
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

                <div className="pt-4 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Secure payment via <strong>Razorpay</strong> • UPI & Cards accepted</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={handlePay}
                    disabled={!isValid || loading || !scriptLoaded}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay ₹{amount || '0'}
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
