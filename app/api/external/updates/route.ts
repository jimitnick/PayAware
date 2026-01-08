
import { NextResponse } from 'next/server'
import { fetchRegulatoryUpdates, getRealTimeNews } from '@/lib/external/updates-service'
import { withSecurity } from '@/lib/api-middleware'

async function handler() {
    try {
        const updates = await fetchRegulatoryUpdates()
        const news = await getRealTimeNews()

        // Set Cache-Control for 1 hour
        const response = NextResponse.json({ updates })
        response.headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate')

        return response
    } catch (error) {
        return new NextResponse('Error fetching updates', { status: 500 })
    }
}

export const GET = withSecurity(handler, { protected: false }) // Publicly accessible updates
