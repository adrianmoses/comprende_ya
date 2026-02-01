// src/routes/index.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import YouTubeSearch from '@/components/YouTubeSearch'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { processVideoAsync, classifyVideo } from '@/lib/api'
import { toast } from 'sonner'
import FlowStatusDisplay from '@/components/FlowStatusDisplay'
import { useFlowStatus } from '@/hooks/useFlowStatus'
import { DialectClassification } from '@/types'
import { Globe } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
    const navigate = useNavigate()
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
    const [selectedTitle, setSelectedTitle] = useState<string | null>(null)
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
    const [flowRunId, setFlowRunId] = useState<string | null>(null)
    const [classification, setClassification] = useState<DialectClassification | null>(null)
    const [isClassifying, setIsClassifying] = useState(false)

    const { data: flowStatus } = useFlowStatus(flowRunId)

    const mutation = useMutation({
        mutationFn: async ({ url, force }: { url: string, force: boolean }) => {
            return await processVideoAsync(url, force)
        },
        onSuccess: (data) => {
            if (data.status === 'EXISTS') {
                toast.success(`Video ya procesado!`)
                // Navigate to the video page
                if (data.result?.video_id) {
                    navigate({ to: `/video/${data.result.video_id}` })
                }
            } else {
                setFlowRunId(data.flow_run_id)
                toast.success('Video en procesamiento...')
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Error al procesar el video')
        }
    })

    const handleSelectVideo = (url: string, title: string) => {
        setSelectedUrl(url)
        setSelectedTitle(title)
        setClassification(null)

        // Extract video ID from URL
        const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
        if (videoIdMatch) {
            setSelectedVideoId(videoIdMatch[1])
        }
    }

    const handleClassify = async () => {
        if (!selectedVideoId) return

        setIsClassifying(true)
        try {
            const result = await classifyVideo(selectedVideoId)
            setClassification(result)
            toast.success('Video clasificado exitosamente')
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Error al clasificar el video')
            setClassification(null)
        } finally {
            setIsClassifying(false)
        }
    }

    const handleProcessVideo = () => {
        if (selectedUrl) {
            mutation.mutate({ url: selectedUrl, force: false })
        }
    }

    return (
        <div className="min-h-[calc(100vh-80px)] py-12">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl mb-4">
                        ComprendeYa
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        Improve your Spanish audio comprehension with interactive quizzes
                    </p>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <YouTubeSearch
                        onSelectVideo={handleSelectVideo}
                        isProcessing={mutation.isPending}
                    />
                </div>

                {/* Selected video + Classify/Process buttons */}
                {selectedUrl && selectedTitle && !flowRunId && (
                    <div className="max-w-4xl mx-auto mt-6">
                        <div className="rounded-lg border border-gray-500 shadow-md p-6">
                            <h3 className="font-medium mb-2">Video seleccionado:</h3>
                            <p className="text-sm text-muted-foreground mb-4">{selectedTitle}</p>

                            {/* Classification section */}
                            {classification && (
                                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <h4 className="font-medium text-blue-900 dark:text-blue-100">
                                            Dialecto: {classification.dialect}
                                        </h4>
                                        <span className="text-sm text-blue-700 dark:text-blue-300">
                                            ({classification.confidence}% confianza)
                                        </span>
                                    </div>
                                    <div className="text-sm text-blue-800 dark:text-blue-200">
                                        <p className="font-medium mb-1">Señales lingüísticas:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            {classification.signals.map((signal, idx) => (
                                                <li key={idx}>{signal}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleClassify}
                                    disabled={isClassifying || mutation.isPending}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    {isClassifying ? 'Clasificando...' : classification ? 'Reclasificar' : 'Clasificar Dialecto'}
                                </Button>
                                <Button
                                    onClick={handleProcessVideo}
                                    disabled={mutation.isPending || isClassifying}
                                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-950"
                                >
                                    {mutation.isPending ? 'Procesando...' : 'Procesar Video'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Flow status */}
                {flowStatus && (
                    <div className="max-w-4xl mx-auto mt-6">
                        <FlowStatusDisplay
                            status={flowStatus.status}
                            name={flowStatus.message || 'Procesando video...'}
                        />

                        {flowStatus.status === 'COMPLETED' && flowStatus.result?.video_id && (
                            <div className="mt-4 text-center">
                                <Button
                                    onClick={() => navigate({ to: `/video/${flowStatus.result!.video_id}` })}
                                    className="bg-green-600 text-white hover:bg-green-700"
                                >
                                    Ver Video y Preguntas
                                </Button>
                            </div>
                        )}

                        {flowStatus.status === 'FAILED' && (
                            <div className="mt-4 bg-red-50 p-4 rounded-lg">
                                <p className="text-red-800">Error: {flowStatus.error}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
