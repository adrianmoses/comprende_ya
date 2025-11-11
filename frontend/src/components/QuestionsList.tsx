// components/QuestionsList.tsx
import { Question } from '@/types';

interface QuestionsListProps {
  questions: Question[];
  title: string;
}

export default function QuestionsList({ questions, title }: QuestionsListProps) {
  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">Responde las siguientes preguntas sobre el video</p>

        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={idx} className="border-b pb-6 last:border-b-0">
              <h3 className="font-semibold text-lg mb-3">
                {idx + 1}. {q.question}
              </h3>
              <div className="space-y-2">
                {q.answers.map((answer, answerIdx) => (
                  <label
                    key={answerIdx}
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`question-${idx}`}
                      value={answerIdx}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>{answer}</span>
                  </label>
                ))}
              </div>
              {q.explanation && (
                <details className="mt-3">
                  <summary className="text-sm text-blue-600 cursor-pointer">
                    Ver explicación
                  </summary>
                  <p className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded">
                    {q.explanation}
                  </p>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}