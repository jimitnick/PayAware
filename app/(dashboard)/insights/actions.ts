'use server'

import { createClient } from '@/lib/supabase/server'

export interface ChatHistoryItem {
    id: string
    query: string
    response: string
    created_at: string
}

export async function getChatHistory(): Promise<ChatHistoryItem[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ai_chats')
        .select('*')
        .order('created_at', { ascending: true }) // Oldest first or newest? Chat interface usually shows newest at bottom, but if history list, maybe newest first. Let's do ascending for a chronological conversation feel.

    if (error) {
        console.error('Error fetching chat history:', error)
        return []
    }

    return data || []
}
