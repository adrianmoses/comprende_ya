import { createFileRoute } from '@tanstack/react-router'
import {listVideos} from "@/lib/api";

export const Route = createFileRoute('/videos')({
    loader: async () => {
        return listVideos()
    },
    component: RouteComponent,
})

function RouteComponent() {
    const videoData = Route.useLoaderData()
    const videos = videoData.videos

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Processed Videos</h1>

            {videos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>No videos processed yet.</p>
                    <p className="mt-2">Go to the home page to process your first video!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {videos.map((video) => (
                        <a
                            key={video.id}
                            href={`/video/${video.video_id}`}
                            className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
                                    <div className="flex gap-4 text-sm text-gray-600">
                                        <span>Duration: {formatDuration(video.duration)}</span>
                                        <span>Questions: {video.questions.length}</span>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-400">
                                    ID: {video.video_id}
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}
