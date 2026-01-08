
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles, Mic } from 'lucide-react'
import { remark } from 'remark';
import html from 'remark-html';

export interface ChatHistoryItem {
    id: string
    query: string
    response: string
    created_at: string
}

interface AIClientProps {
    initialHistory: ChatHistoryItem[]
}

import { useToast } from '@/components/ui/use-toast'

export function AIClient({ initialHistory = [] }: AIClientProps) {
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState<ChatHistoryItem[]>(initialHistory)
    const [processedHistory, setProcessedHistory] = useState<{ id: string, query: string, html: string }[]>([])
    const [isListening, setIsListening] = useState(false)
    const { toast } = useToast()

    // Process markdown for history items on load or when history changes
    useEffect(() => {
        const process = async () => {
            const processed = await Promise.all(history.map(async (item) => {
                const processedContent = await remark()
                    .use(html)
                    .process(item.response)
                return {
                    id: item.id,
                    query: item.query,
                    html: processedContent.toString()
                }
            }))
            // Sort by newest first matching the UI
            setProcessedHistory(processed.reverse())
        }
        process()
    }, [history])

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            toast({
                title: "Not Supported",
                description: "Voice recognition is not supported in this browser. Please try Chrome.",
                variant: "destructive"
            })
            return
        }

        const recognition = new (window as any).webkitSpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onstart = () => {
            setIsListening(true)
        }

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            setQuery(transcript)
            recognition.stop()
        }

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error)
            setIsListening(false)

            let errorMessage = "An error occurred with voice recognition."
            if (event.error === 'network') {
                errorMessage = "Network error: improved internet connection required for voice recognition."
            } else if (event.error === 'not-allowed') {
                errorMessage = "Microphone access denied. Please allow microphone permissions."
            } else if (event.error === 'no-speech') {
                errorMessage = "No speech detected. Please try again."
            }

            toast({
                title: "Voice Error",
                description: errorMessage,
                variant: "destructive"
            })
        }

        recognition.onend = () => {
            setIsListening(false)
        }

        recognition.start()
    }

    const handleAnalyze = async () => {
        if (!query.trim()) return

        setLoading(true)
        try {
            const res = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            })

            if (!res.ok) {
                throw new Error('Failed to fetch insights')
            }

            const data = await res.json()

            // Optimistically update history locally
            const newItem: ChatHistoryItem = {
                id: crypto.randomUUID(),
                query: query,
                response: data.insight,
                created_at: new Date().toISOString()
            }

            // Add new item to history (it will trigger useEffect to process markdown)
            setHistory(prev => [...prev, newItem])
            setQuery('')

        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to generate insights. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Ask PayAware AI</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <Textarea
                            placeholder="e.g., What is my highest expense category this month?"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pr-12"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`absolute right-2 bottom-2 ${isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`}
                            onClick={startListening}
                            title="Speak your query"
                        >
                            <Mic className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        AI will analyze your recent transactions to answer.
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleAnalyze} disabled={loading} className="w-full sm:w-auto">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate Insight
                    </Button>
                </CardFooter>
            </Card>

            <div className="space-y-6">
                {processedHistory.map((item) => (
                    <Card key={item.id} className="bg-slate-50 dark:bg-slate-900 border-blue-100 dark:border-blue-900">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                You asked: <span className="text-foreground">{item.query}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="prose dark:prose-invert max-w-none text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: item.html }}
                            />
                        </CardContent>
                        <CardFooter>
                            <p className="text-xs text-muted-foreground italic">
                                Disclaimer: This is generated by AI and is for informational purposes only. Not financial advice.
                            </p>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
