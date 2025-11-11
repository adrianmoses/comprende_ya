import {TimestampedQuestion} from "@/types";

interface TimestampedQuestionsListProps {
    questions: TimestampedQuestion[];
    title: string;
}

function formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function TimestampedQuestionsList({ questions, title }: TimestampedQuestionsListProps) {
    return (
        <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                <p className="text-gray-600 mb-6">
                    Preguntas distribuidas a lo largo del video
                </p>

                <div className="space-y-6">
                    {questions.map((q, idx) => (
                        <div key={idx} className="border-l-4 border-blue-500 pl-4 pb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                                    ⏱️ {formatTimestamp(q.timestamp)}
                                </span>
                                <span className="text-gray-500 text-sm">
                                    Pregunta {idx + 1} de {questions.length}
                                </span>
                            </div>

                            <h3 className="font-semibold text-lg mb-3">
                                {q.question}
                            </h3>

                            <div className="space-y-2">
                                {q.answers.map((answer, answerIdx) => (
                                    <label
                                        key={answerIdx}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-md cursor-pointer 
                                            transition-colors
                                            ${answerIdx === q.correct_answer 
                                                ? 'bg-green-50 border border-green-200' 
                                                : 'hover:bg-gray-50 border border-gray-200'
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${idx}`}
                                            value={answerIdx}
                                            className="w-4 h-4 text-blue-600"
                                            disabled
                                            checked={answerIdx === q.correct_answer}
                                            />

                                        <span className={answerIdx === q.correct_answer ? 'font-semibold': ''}>
                                            {answer}
                                        </span>
                                        {answerIdx === q.correct_answer && (
                                            <span className="ml-auto text-green-600 text-sm">✓ Correcta</span>
                                        )}
                                    </label>
                                ))}
                            </div>

                            {q.explanation && (
                                <div className="mt-3 bg-blue-300 p-3 rounded text-sm text-gray-700">
                                    <strong className="text-blue-800">Explicación:</strong> {q.explanation}
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}