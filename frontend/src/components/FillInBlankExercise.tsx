import { useState } from 'react';
import { FillInBlankExercise } from '@/types';

interface Props {
  exercise: FillInBlankExercise;
  onComplete?: (correct: boolean) => void;
}

export default function FillInBlankExerciseComponent({ exercise, onComplete }: Props) {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  // Parse exercise_text to create input fields
  const renderExerciseWithInputs = () => {
    const parts = exercise.exercise_text.split('___');
    const blankKeys = Object.keys(exercise.answers).sort();

    return parts.map((part, index) => (
      <span key={index}>
        {part}
        {index < parts.length - 1 && (
          <span className="inline-flex items-center gap-1 mx-1">
            <input
              type="text"
              value={userAnswers[blankKeys[index]] || ''}
              onChange={(e) => setUserAnswers({
                ...userAnswers,
                [blankKeys[index]]: e.target.value
              })}
              className={`
                inline-block border-b-2 px-2 py-1 min-w-[100px] text-center
                ${checked
                  ? userAnswers[blankKeys[index]]?.toLowerCase().trim() ===
                    exercise.answers[blankKeys[index]].toLowerCase().trim()
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500 focus:outline-none'
                }
              `}
              disabled={checked}
              placeholder="___"
            />
            {/* Hint button */}
            <button
              onClick={() => setShowHints({
                ...showHints,
                [blankKeys[index]]: !showHints[blankKeys[index]]
              })}
              className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
              title="Ver pista"
              type="button"
            >
              💡
            </button>
            {/* Show hint */}
            {showHints[blankKeys[index]] && exercise.hints[blankKeys[index]] && (
              <span className="text-xs text-gray-500 italic ml-1">
                ({exercise.hints[blankKeys[index]]})
              </span>
            )}
            {/* Show correct answer after checking */}
            {checked && userAnswers[blankKeys[index]]?.toLowerCase().trim() !==
              exercise.answers[blankKeys[index]].toLowerCase().trim() && (
              <span className="text-xs text-green-600 font-semibold ml-1">
                ✓ {exercise.answers[blankKeys[index]]}
              </span>
            )}
          </span>
        )}
      </span>
    ));
  };

  const handleCheck = () => {
    setChecked(true);
    const allCorrect = Object.keys(exercise.answers).every(
      key => userAnswers[key]?.toLowerCase().trim() === exercise.answers[key].toLowerCase().trim()
    );
    onComplete?.(allCorrect);
  };

  const handleReset = () => {
    setUserAnswers({});
    setChecked(false);
    setShowHints({});
    setShowOriginal(false);
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const correctCount = checked
    ? Object.keys(exercise.answers).filter(
        key => userAnswers[key]?.toLowerCase().trim() === exercise.answers[key].toLowerCase().trim()
      ).length
    : 0;
  const totalBlanks = Object.keys(exercise.answers).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
      {/* Header with difficulty and timestamp */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`
            px-2 py-1 rounded text-xs font-semibold uppercase
            ${exercise.difficulty === 'facil' ? 'bg-green-100 text-green-800' : ''}
            ${exercise.difficulty === 'medio' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${exercise.difficulty === 'dificil' ? 'bg-red-100 text-red-800' : ''}
          `}>
            {exercise.difficulty}
          </span>
          {checked && (
            <span className={`
              px-2 py-1 rounded text-xs font-semibold
              ${correctCount === totalBlanks ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
            `}>
              {correctCount}/{totalBlanks} correctas
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500">
          ⏱️ {formatTimestamp(exercise.start_time)} - {formatTimestamp(exercise.end_time)}
        </span>
      </div>

      {/* Exercise text with blanks */}
      <div className="text-lg leading-relaxed mb-6 font-medium text-gray-800">
        {renderExerciseWithInputs()}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        {!checked ? (
          <button
            onClick={handleCheck}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
          >
            Verificar Respuestas
          </button>
        ) : (
          <>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors font-medium"
            >
              Intentar de Nuevo
            </button>
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-medium"
            >
              {showOriginal ? 'Ocultar' : 'Ver'} Texto Original
            </button>
          </>
        )}
      </div>

      {/* Show original text when toggled */}
      {checked && showOriginal && (
        <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
          <p className="text-sm text-gray-600 mb-2 font-semibold">Texto original:</p>
          <p className="text-gray-800 leading-relaxed">{exercise.original_text}</p>
        </div>
      )}
    </div>
  );
}
