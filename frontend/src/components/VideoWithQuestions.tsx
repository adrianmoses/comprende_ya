import { useState, useEffect } from 'react';
import { TimestampedQuestion, QuestionProgress, FillInBlankExercise } from '@/types';
import { getProgress, saveProgress, resetProgress } from '@/lib/api';
import FillInBlankExerciseComponent from './FillInBlankExercise';

interface VideoWithQuestionsProps {
    videoId: string;
    questions: TimestampedQuestion[];
    title: string;
    exercises?: FillInBlankExercise[];
}

export default function VideoWithQuestions({
    videoId,
    questions,
    title,
    exercises = []
}: VideoWithQuestionsProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [progressMap, setProgressMap] = useState<Map<number, QuestionProgress>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());

    // Sort exercises by timestamp
    const sortedExercises = [...exercises].sort((a, b) => a.start_time - b.start_time);

    // Load progress on mount
    useEffect(() => {
        const loadProgress = async () => {
            try {
                const data = await getProgress(videoId);
                const map = new Map<number, QuestionProgress>();
                data.progress.forEach(p => {
                    map.set(p.question_id, p);
                });
                setProgressMap(map);
            } catch (error) {
                console.error('Failed to load progress:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadProgress();
    }, [videoId]);

    // Check if current question has been answered before
    useEffect(() => {
        const currentQ = questions[currentQuestionIndex];
        if (currentQ.id) {
            const savedProgress = progressMap.get(currentQ.id);
            if (savedProgress) {
                setSelectedAnswer(savedProgress.user_answer);
                setIsAnswered(true);
            } else {
                setSelectedAnswer(null);
                setIsAnswered(false);
            }
        }
    }, [currentQuestionIndex, progressMap, questions]);

    // Helper to format timestamp (seconds -> MM:SS)
    const formatTimestamp = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = isAnswered && selectedAnswer === currentQuestion.correct_answer;

    const handleAnswerSelect = (answerIndex: number) => {
        if (!isAnswered) {
            setSelectedAnswer(answerIndex);
        }
    };

    const handleSubmit = async () => {
        if (selectedAnswer !== null && currentQuestion.id) {
            setIsAnswered(true);

            // Save to backend
            try {
                const result = await saveProgress(videoId, currentQuestion.id, selectedAnswer);
                // Update local progress map
                setProgressMap(prev => {
                    const newMap = new Map(prev);
                    newMap.set(currentQuestion.id!, {
                        question_id: currentQuestion.id!,
                        user_answer: result.user_answer,
                        is_correct: result.is_correct,
                        answered_at: result.answered_at
                    });
                    return newMap;
                });
            } catch (error) {
                console.error('Failed to save progress:', error);
            }
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleReset = async () => {
        if (confirm('¿Estás seguro de que quieres resetear todo el progreso?')) {
            try {
                await resetProgress(videoId);
                setProgressMap(new Map());
                setSelectedAnswer(null);
                setIsAnswered(false);
                setCurrentQuestionIndex(0);
            } catch (error) {
                console.error('Failed to reset progress:', error);
            }
        }
    };

    // Calculate progress summary
    const answeredCount = progressMap.size;
    const correctCount = Array.from(progressMap.values()).filter(p => p.is_correct).length;

    if (isLoading) {
        return <div className="w-full max-w-4xl mx-auto p-6 text-center">Cargando progreso...</div>;
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">
                            Progreso: {answeredCount} de {questions.length} respondidas
                        </span>
                        <span className="text-sm font-medium text-green-600">
                            {correctCount} correctas
                        </span>
                        {answeredCount > 0 && (
                            <span className="text-sm font-medium text-gray-600">
                                ({Math.round((correctCount / answeredCount) * 100)}%)
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleReset}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                        Resetear progreso
                    </button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* YouTube Video Embed */}
            <div className="rounded-lg shadow-lg overflow-hidden">
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
                <div className="p-4 bg-gray-50">
                    <h2 className="text-xl font-semibold">{title}</h2>
                </div>
            </div>

            {/* Questions Section */}
            <div className="rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded">
                            {formatTimestamp(currentQuestion.timestamp)}
                        </span>
                        <span className="text-gray-600 text-sm">
                            Pregunta {currentQuestionIndex + 1} de {questions.length}
                        </span>
                        {currentQuestion.id && progressMap.has(currentQuestion.id) && (
                            <span className={`text-sm font-semibold ${
                                progressMap.get(currentQuestion.id)?.is_correct
                                    ? 'text-green-600'
                                    : 'text-red-600'
                            }`}>
                                {progressMap.get(currentQuestion.id)?.is_correct ? '✓ Correcta' : '✗ Incorrecta'}
                            </span>
                        )}
                    </div>
                </div>

                <h3 className="text-lg font-bold mb-4">{currentQuestion.question}</h3>

                {/* Answer Options */}
                <div className="space-y-3 mb-6">
                    {currentQuestion.answers.map((answer, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswerSelect(idx)}
                            disabled={isAnswered}
                            className={`
                                w-full text-left p-4 rounded-lg border-2 transition-colors
                                ${selectedAnswer === idx && !isAnswered
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-blue-300'
                                }
                                ${isAnswered && idx === currentQuestion.correct_answer
                                    ? 'border-green-500 bg-green-50'
                                    : ''
                                }
                                ${isAnswered && selectedAnswer === idx && idx !== currentQuestion.correct_answer
                                    ? 'border-red-500 bg-red-50'
                                    : ''
                                }
                                ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700">{answer}</span>
                                {isAnswered && idx === currentQuestion.correct_answer && (
                                    <span className="text-green-600 font-bold text-xl">✓</span>
                                )}
                                {isAnswered && selectedAnswer === idx && idx !== currentQuestion.correct_answer && (
                                    <span className="text-red-600 font-bold text-xl">✗</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Explanation (shown after answering) */}
                {isAnswered && currentQuestion.explanation && (
                    <div className={`mb-6 p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-blue-50'}`}>
                        <p className="text-sm text-gray-700">
                            <strong className={isCorrect ? 'text-green-800' : 'text-blue-800'}>
                                Explicación:
                            </strong>{' '}
                            {currentQuestion.explanation}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        ← Anterior
                    </button>

                    {!isAnswered ? (
                        <button
                            onClick={handleSubmit}
                            disabled={selectedAnswer === null}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Verificar Respuesta
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={currentQuestionIndex === questions.length - 1}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Siguiente →
                        </button>
                    )}
                </div>
            </div>

            {/* Fill-in-Blank Exercises Section */}
            {sortedExercises.length > 0 && (
                <div className="rounded-lg shadow-lg p-6 bg-gradient-to-br from-purple-50 to-blue-50">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            ✏️ Ejercicios de Completar
                        </h3>
                        <p className="text-gray-600 text-sm">
                            Completa los espacios en blanco basándote en lo que escuchaste en el video (ordenados cronológicamente)
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-purple-600 h-2 rounded-full transition-all"
                                    style={{
                                        width: `${sortedExercises.length > 0 ? (completedExercises.size / sortedExercises.length) * 100 : 0}%`
                                    }}
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                                {completedExercises.size}/{sortedExercises.length}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {sortedExercises.map((exercise, index) => (
                            <div key={exercise.id || index} className="bg-white rounded-lg p-4 shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-500">
                                            Ejercicio {index + 1}
                                        </span>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                            {formatTimestamp(exercise.start_time)} - {formatTimestamp(exercise.end_time)}
                                        </span>
                                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                                            exercise.difficulty === 'facil'
                                                ? 'bg-green-100 text-green-800'
                                                : exercise.difficulty === 'medio'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {exercise.difficulty === 'facil' ? 'Fácil' :
                                             exercise.difficulty === 'medio' ? 'Medio' : 'Difícil'}
                                        </span>
                                    </div>
                                    {completedExercises.has(index) && (
                                        <span className="text-green-600 font-semibold text-sm">
                                            ✓ Completado
                                        </span>
                                    )}
                                </div>
                                <FillInBlankExerciseComponent
                                    exercise={exercise}
                                    onComplete={(correct) => {
                                        if (correct) {
                                            setCompletedExercises(new Set([...completedExercises, index]));
                                        }
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {completedExercises.size === sortedExercises.length && sortedExercises.length > 0 && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center mt-6">
                            <div className="text-4xl mb-2">🎉</div>
                            <h3 className="text-xl font-bold text-green-800 mb-1">
                                ¡Excelente trabajo!
                            </h3>
                            <p className="text-green-700">
                                Has completado todos los ejercicios correctamente.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
