import { UpdateItem, fetchRegulatoryUpdates, getRealTimeNews } from '@/lib/external/updates-service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Newspaper, BellRing, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function UpdatesPage() {
    // Fetch data in parallel
    const regulatoryUpdatesData = fetchRegulatoryUpdates()
    const newsUpdatesData = getRealTimeNews().catch(err => {
        console.error("Failed to fetch real-time news:", err)
        return [] as UpdateItem[]
    })

    const [regulatoryUpdates, newsUpdates] = await Promise.all([
        regulatoryUpdatesData,
        newsUpdatesData
    ])

    const updates = [...regulatoryUpdates, ...newsUpdates].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return (
        <div className="flex flex-col space-y-8 p-8 max-w-4xl mx-auto">
            <div>
                <h1 className="mx-6 md:mx-0 text-center align-center text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Newspaper className="h-8 w-8 text-blue-500" />
                    Regulatory Updates
                </h1>
                <p className="text-muted-foreground">
                    Stay informed with the latest financial news and advisories.
                </p>
            </div>

            <div className="grid gap-6">
                {updates.map((update) => (
                    <Card key={update.id} className={update.type === 'alert' ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10' : ''}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">{update.title}</CardTitle>
                                    <CardDescription>{new Date(update.date).toLocaleDateString()} • {update.source}</CardDescription>
                                </div>
                                <Badge variant={update.type === 'alert' ? 'destructive' : 'default'} className="capitalize">
                                    {update.type}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {update.summary}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm" asChild>
                                <a href={update.url} target="_blank" rel="noopener noreferrer">
                                    Read Source <ExternalLink className="ml-2 h-3 w-3" />
                                </a>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
