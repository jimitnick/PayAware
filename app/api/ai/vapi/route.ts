// 1. Change the import (Don't use the server client for this)
import { createClient } from '@supabase/supabase-js' 
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        
        if (body.message.type === 'tool-calls') {
            const toolCall = body.message.toolCalls[0]
            const functionName = toolCall.function.name

            if (functionName === 'logTransaction') {
                let args = toolCall.function.arguments;
                if (typeof args === 'string') {
                    args = JSON.parse(args);
                }
                const { amount, type, category, description } = args;

                const callObj = body.message.call;
                const userId = callObj?.assistantOverrides?.metadata?.userId || callObj?.metadata?.userId;

                if (!userId) {
                    return NextResponse.json({
                        results: [{ toolCallId: toolCall.id, result: "Error: User ID not found." }]
                    });
                }

                // 2. ✅ FIXED: Create an Admin Client to bypass RLS
                const supabaseAdmin = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY! // <--- This key bypasses RLS
                );

                const { error } = await supabaseAdmin.from('transactions').insert([
                    {
                        amount: amount,
                        type: type,
                        category: category,
                        description: description,
                        user_id: userId,
                        is_confirmed: true
                    }
                ])

                if (error) {
                    console.error("Supabase Error:", error);
                    return NextResponse.json({
                        results: [{ toolCallId: toolCall.id, result: "Database error. Check your server logs." }]
                    });
                }

                return NextResponse.json({
                    results: [
                        {
                            toolCallId: toolCall.id,
                            result: `Done. I've logged ${amount} rupees for ${description}.`
                        }
                    ]
                })
            }
        }
        
        return NextResponse.json({});

    } catch (error) {
        console.error('Vapi error', error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}