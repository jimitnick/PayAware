export interface UpdateItem {
    id: string
    title: string
    source: string
    date: string
    summary: string
    url: string
    type: 'alert' | 'news' | 'advisory'
}

// In a real production scenario, this would use `rss-parser` or `axios` to fetch 
// from RBI Press Releases (https://rbi.org.in/) or reliable news APIs.
// For the purpose of this hackathon/demo, we will simulate a realistic feed to ensure reliability.
const MOCK_UPDATES: UpdateItem[] = [
    {
        id: '1',
        title: 'RBI Caution on Unauthorized Forex Trading Platforms',
        source: 'Reserve Bank of India',
        date: new Date().toISOString(),
        summary: 'The RBI has issued a warning against unauthorized forex trading platforms and advised users to transact only with authorized dealers.',
        url: 'https://rbi.org.in',
        type: 'alert'
    },
    {
        id: '2',
        title: 'Updates to UPI Transaction Limits for Healthcare by NPCI',
        source: 'NPCI',
        date: new Date(Date.now() - 86400000).toISOString(),
        summary: 'NPCI has increased the transaction limit for UPI payments to hospitals and educational institutions.',
        url: 'https://www.npci.org.in/',
        type: 'news'
    },
    {
        id: '3',
        title: 'Safe Banking Practices Advisory',
        source: 'Indian Banks Association',
        date: new Date(Date.now() - 172800000).toISOString(),
        summary: 'Reminder to never share OTPs or PINs with anyone claiming to be a bank official.',
        url: '#',
        type: 'advisory'
    }
]

export async function getRealTimeNews(): Promise<UpdateItem[]> {
    try {
        const apiKey = process.env.FINANCIAL_DATASETS_API_KEY
        if (!apiKey) {
            console.warn('FINANCIAL_DATASETS_API_KEY is not set')
            return []
        }

        // Fetch directly from the external API to avoid loopback/relative URL issues on server
        // API requires 'ticker' parameter. We use a set of major market movers for general financial news.
        const response = await fetch('https://api.financialdatasets.ai/news?limit=10&ticker=SPY,AAPL,MSFT,NVDA,AMZN,GOOG', {
            headers: {
                'X-API-KEY': apiKey
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            console.error(`Failed to fetch news: ${response.status}`)
            return []
        }

        const data = await response.json();

        // Map the API response to UpdateItem format
        // API returns { news: [...] }
        if (!data.news || !Array.isArray(data.news)) {
            return []
        }

        return data.news.map((item: any) => ({
            id: item.url || crypto.randomUUID(), // Use URL as ID if unique, or random
            title: item.title,
            source: item.source || 'Financial News',
            date: item.date,
            summary: item.summary || item.title, // API might not return summary, falback to title
            url: item.url,
            type: 'news' as const
        }));
    } catch (error) {
        console.error('Error fetching real-time news:', error);
        return [];
    }
}
export async function fetchRegulatoryUpdates(): Promise<UpdateItem[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Real implementation stub:
    // const res = await fetch('https://newsapi.org/v2/everything?q=RBI+Finance&apiKey=...')
    // return transform(res.json())

    return MOCK_UPDATES
}
