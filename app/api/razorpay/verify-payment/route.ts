import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amount,
            recipientName,
            recipientVpa,
            note,
        } = body

        // Verify signature
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex')

        if (generatedSignature !== razorpay_signature) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            )
        }

        // Payment verified - store transaction in Supabase
        const { error: insertError } = await supabase.from('transactions').insert({
            user_id: user.id,
            amount: amount,
            type: 'expense',
            category: 'Payment',
            description: `Payment to ${recipientName || recipientVpa || 'Recipient'}${note ? ` - ${note}` : ''} (Ref: ${razorpay_payment_id})`,
            is_confirmed: true,
        })

        if (insertError) {
            console.error('Error storing transaction:', insertError)
            // Payment was successful but storage failed - log but don't fail
            // In production, you'd want to handle this more robustly
        }

        revalidatePath('/dashboard')
        revalidatePath('/payments')

        return NextResponse.json({
            success: true,
            paymentId: razorpay_payment_id,
        })
    } catch (error) {
        console.error('Error verifying payment:', error)
        return NextResponse.json(
            { error: 'Failed to verify payment' },
            { status: 500 }
        )
    }
}
