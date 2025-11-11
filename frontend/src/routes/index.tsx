// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import VideoInput from "@/components/VideoInput";
import {useMutation} from "@tanstack/react-query";
import {processVideoAsync} from "@/lib/api";
import {useState} from "react";
import {useFlowStatus} from "@/hooks/useFlowStatus";
import FlowStatusDisplay from "@/components/FlowStatusDisplay";
import TimestampedQuestionsList from "@/components/TimestampedQuestionsList";
import InteractiveVideoPlayer from "@/components/InteractiveVideoPlayer";


export const Route = createFileRoute('/')({
  component: Home,
})

type ViewMode = 'interactive' | 'list' | 'transcript';

function Home() {
    const [flowRunId, setFlowRunId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('interactive')
    const { data: flowStatus } = useFlowStatus(flowRunId)

    const mutation = useMutation({
        mutationFn: async ({ url, force }: { url: string, force: boolean}) => {
            return await processVideoAsync(url, force)
        },
        onSuccess: (data) => {
            if (data.status === 'EXISTS') {
                // Video ya existe, mostrar el existente
                setFlowRunId(null);
                // Podrías cargar el video directamente o mostrar un mensaje
                alert(`Video ya procesado! ID: ${data.result?.video_id}`);
            }
            setFlowRunId(data.flow_run_id);
        },
    });

    const handleSubmit = (url: string, force: boolean) => {
        setFlowRunId(null);
        mutation.mutate({ url, force });
    };

    const result = flowStatus?.status === 'COMPLETED' ? flowStatus.result : null;
    return (
      <div className="space-y-8">
          <VideoInput onSubmit={handleSubmit} isLoading={mutation.isPending} />

          {flowStatus && (
              <FlowStatusDisplay
                  status={flowStatus.status}
                  name={flowStatus.message}
                  />
          )}

          {result && (
              <>
                  {/** Tabs **/}
                  <div className="max-w-4xl mx-auto">
                      <div className="flex gap-2 border-b">
                          <button
                              onClick={() => setViewMode('interactive')}
                              className={`px-4 py-2 font-medium transition-colors ${
                                  viewMode === 'interactive'
                                  ? 'text-blue-600 border-b-2 border-blue-600'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                          >
                              🎬 Video Interactivo
                          </button>
                          <button
                              onClick={() => setViewMode('list')}
                              className={`px-4 py-2 font-medium transition-colors ${
                                  viewMode === 'list'
                                  ? 'text-blue-600 border-b-2 border-blue-600'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                          >
                              📝 Lista de Preguntas
                          </button>
                          <button
                              onClick={() => setViewMode('transcript')}
                              className={`px-4 py-2 font-medium transition-colors ${
                                viewMode === 'transcript'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                              }`}
                          >
                              📄 Transcripción
                          </button>
                      </div>
                  </div>

                  {/* Content */}
                  <div className="mt-6">
                      {viewMode === 'interactive' && (
                          <div className="space-y-4">
                              <div className="max-w-4xl mx-auto bg-blue-50 p-4 rounded-lg">
                                  <p className="text-sm text-blue-800">
                                    💡 <strong>Tip:</strong> El video se pausará automáticamente en los momentos clave para hacerte preguntas.
                                  </p>
                             </div>
                              <InteractiveVideoPlayer
                                  videoId={result.video_id}
                                  questions={result.questions}
                                  title={result.title}
                              />
                          </div>
                      )}
                      {viewMode === 'list' && (

                          <TimestampedQuestionsList
                              questions={result.questions}
                              title={result.title}
                          />
                      )}

                      {viewMode === 'transcript' && (
                          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                              <h2 className="text-2xl font-bold mb-4">Transcipción Completa</h2>
                              <div className="prose max-w-none">
                                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                      {result.transcript}
                                  </p>
                              </div>
                          </div>
                      )}
                  </div>

              </>
          )}

          {flowStatus?.status === 'FAILED' && (
              <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800">Error: {flowStatus.error}</p>
              </div>
          )}
      </div>
    )
}
