import { createFileRoute } from '@tanstack/react-router'
import VideoWithQuestions from "@/components/VideoWithQuestions";
import TimestampedQuestionsList from "@/components/TimestampedQuestionsList";
import FillInBlankExercisesList from "@/components/FillInBlankExercisesList";
import {useState} from "react";
import {fetchVideo} from "@/lib/api";

export const Route = createFileRoute('/video/$videoId')({
    loader: async ({ params }) => {
        return fetchVideo(params.videoId)
    },
    component: RouteComponent,
})

type ViewMode = 'interactive' | 'list' | 'ejercicios' | 'transcript';

function RouteComponent() {
    const [viewMode, setViewMode] = useState<ViewMode>('interactive')
    const result = Route.useLoaderData();
    return (
      <div>
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
                          onClick={() => setViewMode('ejercicios')}
                          className={`px-4 py-2 font-medium transition-colors ${
                              viewMode === 'ejercicios'
                                  ? 'text-blue-600 border-b-2 border-blue-600'
                                  : 'text-gray-600 hover:text-gray-900'
                          }`}
                      >
                          ✏️ Ejercicios
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
                      <VideoWithQuestions
                          videoId={result.video_id}
                          questions={result.questions}
                          title={result.title}
                          exercises={result.fill_in_blank_exercises || []}
                      />
                  )}
                  {viewMode === 'list' && (

                      <TimestampedQuestionsList
                          questions={result.questions}
                          title={result.title}
                      />
                  )}

                  {viewMode === 'ejercicios' && (
                      <FillInBlankExercisesList
                          exercises={result.fill_in_blank_exercises || []}
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
      </div>
    );
}
