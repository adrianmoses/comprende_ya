// components/InteractiveVideoPlayer.tsx
import { useState, useRef, useEffect } from 'react';
import { TimestampedQuestion } from '@/types';

interface InteractiveVideoPlayerProps {
    videoId: string;
    questions: TimestampedQuestion[];
    title: string;
}

export default function InteractiveVideoPlayer({
                                                   videoId,
                                                   questions,
                                                   title
                                               }: InteractiveVideoPlayerProps) {
    const [currentQuestion, setCurrentQuestion] = useState<TimestampedQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

    const playerRef = useRef<any>(null);
    const checkIntervalRef = useRef<any>(null);
    const answeredQuestionsRef = useRef<Set<number>>(new Set());  // ← REF para tracking inmediato
    const currentQuestionIndexRef = useRef<number | null>(null);   // ← Prevenir duplicados

    const getYouTubeVideoId = (url: string): string => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        return match ? match[1] : videoId;
    };

    const ytVideoId = getYouTubeVideoId(videoId);

    useEffect(() => {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        (window as any).onYouTubeIframeAPIReady = () => {
            playerRef.current = new (window as any).YT.Player('youtube-player', {
                videoId: ytVideoId,
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange,
                },
            });
        };

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
        };
    }, [ytVideoId]);

    const onPlayerReady = (event: any) => {
        console.log('✅ YouTube player listo');
    };

    const onPlayerStateChange = (event: any) => {
        if (event.data === (window as any).YT.PlayerState.PLAYING) {
            startCheckingForQuestions();
        } else {
            stopCheckingForQuestions();
        }
    };

    const startCheckingForQuestions = () => {
        if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
        }

        checkIntervalRef.current = setInterval(() => {
            if (!playerRef.current || !playerRef.current.getCurrentTime) {
                return;
            }

            // Si ya hay una pregunta mostrándose, no buscar otra
            if (currentQuestionIndexRef.current !== null) {
                return;
            }

            const currentTime = playerRef.current.getCurrentTime();

            // Buscar pregunta usando la REF (más rápido que state)
            const questionIndex = questions.findIndex(
                (q, idx) =>
                    !answeredQuestionsRef.current.has(idx) &&  // ← Usar REF
                    currentTime >= q.timestamp &&   // Después del timestamp
                    currentTime < q.timestamp + 0.5    // Ventana de 0.5s
            );

            if (questionIndex !== -1) {
                const questionToShow = questions[questionIndex];
                console.log(`⏸️  Mostrando pregunta ${questionIndex + 1} en ${currentTime.toFixed(1)}s`);

                // Marcar inmediatamente que estamos mostrando esta pregunta
                currentQuestionIndexRef.current = questionIndex;

                setCurrentQuestion(questionToShow);
                setSelectedAnswer(null);
                setIsCorrect(null);
                playerRef.current.pauseVideo();
                stopCheckingForQuestions();
            }
        }, 100);
    };

    const stopCheckingForQuestions = () => {
        if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
        }
    };

    const handleAnswerSubmit = () => {
        if (selectedAnswer === null || !currentQuestion) return;

        const correct = selectedAnswer === currentQuestion.correct_answer;
        setIsCorrect(correct);

        // Marcar como respondida en AMBOS: ref y state
        const idx = questions.indexOf(currentQuestion);
        answeredQuestionsRef.current.add(idx);  // ← REF (inmediato)
        setAnsweredQuestions(prev => new Set([...prev, idx]));  // ← STATE (para UI)

        console.log(`✅ Pregunta ${idx + 1} respondida. Total: ${answeredQuestionsRef.current.size}`);
    };

    const handleContinue = () => {
        setCurrentQuestion(null);
        setSelectedAnswer(null);
        setIsCorrect(null);
        currentQuestionIndexRef.current = null;  // ← Liberar la pregunta actual
        playerRef.current?.playVideo();
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                        id="youtube-player"
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${ytVideoId}?enablejsapi=1`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />

                    {/* Overlay de pregunta */}
                    {currentQuestion && (
                        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center p-6 z-10">
                            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold">{currentQuestion.question}</h3>
                                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                    {answeredQuestions.size + 1} / {questions.length}
                  </span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {currentQuestion.answers.map((answer, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedAnswer(idx)}
                                            disabled={isCorrect !== null}
                                            className={`
                        w-full text-left p-4 rounded-lg border-2 transition-colors
                        ${selectedAnswer === idx
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-blue-300'
                                            }
                        ${isCorrect !== null && idx === currentQuestion.correct_answer
                                                ? 'border-green-500 bg-green-50'
                                                : ''
                                            }
                        ${isCorrect === false && selectedAnswer === idx
                                                ? 'border-red-500 bg-red-50'
                                                : ''
                                            }
                        disabled:cursor-not-allowed
                      `}
                                        >
                                            {answer}
                                            {isCorrect !== null && idx === currentQuestion.correct_answer && (
                                                <span className="ml-2 text-green-600 font-bold">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {isCorrect !== null && currentQuestion.explanation && (
                                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-gray-700">
                                            <strong className="text-blue-800">Explicación:</strong>{' '}
                                            {currentQuestion.explanation}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    {isCorrect === null ? (
                                        <button
                                            onClick={handleAnswerSubmit}
                                            disabled={selectedAnswer === null}
                                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Verificar Respuesta
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleContinue}
                                            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                        >
                                            Continuar Video →
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Progreso */}
                <div className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span className="font-medium">{title}</span>
                        <span>
              {answeredQuestions.size} / {questions.length} preguntas completadas
            </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(answeredQuestions.size / questions.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
