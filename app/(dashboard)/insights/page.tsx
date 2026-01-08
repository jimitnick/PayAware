import { AIClient } from './ai-client'
import { Bot } from 'lucide-react'
import { getChatHistory } from './actions'

export default async function InsightsPage() {
    const history = await getChatHistory()

    return (
        <div className="flex flex-col space-y-8 p-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Bot className="h-8 w-8 text-blue-500" />
                        AI Insights
                    </h1>
                    <p className="text-muted-foreground">
                        Get neutral, data-driven observations about your finances.
                    </p>
                </div>
            </div>

            <AIClient initialHistory={history} />
        </div>
    )
}
