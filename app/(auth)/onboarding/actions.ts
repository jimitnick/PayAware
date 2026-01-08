'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveUserProfile(formData: {
    name: string
    email: string
    monthlyBudget: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
        .from('users')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

    let error;
    if (existingProfile) {
        const { error: updateError } = await supabase
            .from('users')
            .update({
                name: formData.name,
                email: formData.email,
                monthly_budget: formData.monthlyBudget,
                onboarding_completed: true,
            })
            .eq('user_id', user.id)
        error = updateError
    } else {
        const { error: insertError } = await supabase
            .from('users')
            .insert({
                user_id: user.id,
                name: formData.name,
                email: formData.email,
                monthly_budget: formData.monthlyBudget,
                onboarding_completed: true,
            })
        error = insertError
    }

    if (error) {
        console.error('Error saving profile:', error)
        return { error: 'Failed to save profile' }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function checkOnboardingStatus() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { completed: false, user: null }
    }

    const { data: profile } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()

    return {
        completed: profile?.onboarding_completed ?? false,
        user: user,
    }
}

export async function getUserProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single()

    return profile
}
