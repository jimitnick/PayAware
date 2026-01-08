'use server'

import { createClient } from '@supabase/supabase-js'

export async function checkUserExists(email: string) {
    // strict check using service role to bypass RLS and see if user exists in public.users
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY!
    )

    const { data } = await supabaseAdmin
        .from('users')
        .select('user_id')
        .eq('email', email)
        .single()

    return !!data
}
