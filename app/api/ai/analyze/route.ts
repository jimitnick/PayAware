
import { NextRequest, NextResponse } from 'next/server'
import { generateInsight } from '@/lib/ai/service'
import { withSecurity } from '@/lib/api-middleware'
import { createClient } from '@/lib/supabase/server'

async function handler(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return new NextResponse('Unauthorized', { status: 401 })

        // Fetch user context (transactions)
        // In a real app, we might pass specific time ranges. 
        // Here we fetch recent 50 transactions.
        const { data: transactions } = await supabase
            .from('transactions')
            .select('created_at, type, category, amount, description')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        const body = await req.json().catch(() => ({}))

        const response = await generateInsight({
            transactions: transactions || [],
            query: body.query
        })

        // Persist to database
        try {
            if (response.insight && !response.insight.includes('Error')) {
                await supabase.from('ai_chats').insert({
                    user_id: user.id,
                    query: body.query || 'General overview',
                    response: response.insight
                })
            }
        } catch (dbError) {
            console.error('Failed to save chat history:', dbError)
            // Don't fail the request if history save fails
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error(error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

// Wrap with rate limiting and auth check
export const POST = withSecurity(handler, { protected: true })
