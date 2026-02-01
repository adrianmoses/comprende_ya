import { useState } from 'react';
import { FillInBlankExercise } from '@/types';
import FillInBlankExerciseComponent from './FillInBlankExercise';

interface Props {
  exercises: FillInBlankExercise[];
  title: string;
}

export default function FillInBlankExercisesList({ exercises, title }: Props) {
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());

  const handleExerciseComplete = (index: number, correct: boolean) => {
    if (correct) {
      setCompletedExercises(new Set([...completedExercises, index]));
    }
  };

  const progress = {
    total: exercises.length,
    completed: completedExercises.size,
    percentage: exercises.length > 0
      ? Math.round((completedExercises.size / exercises.length) * 100)
      : 0
  };

  if (!exercises || exercises.length === 0) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-400 text-5xl mb-4">📝</div>
        <h2 className="text-xl font-semibold text-gray-600 mb-2">
          No hay ejercicios disponibles
        </h2>
        <p className="text-gray-500">
          Los ejercicios de completar espacios aparecerán aquí cuando estén disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with title and progress */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progreso: {progress.completed} de {progress.total} ejercicios completados
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {progress.percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Exercise stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-gray-600">
              {exercises.filter(e => e.difficulty === 'facil').length} Fácil
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-gray-600">
              {exercises.filter(e => e.difficulty === 'medio').length} Medio
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-gray-600">
              {exercises.filter(e => e.difficulty === 'dificil').length} Difícil
            </span>
          </div>
        </div>
      </div>

      {/* Exercise list */}
      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <div key={exercise.id || index}>
            <div className="mb-2">
              <span className="text-sm font-semibold text-gray-500">
                Ejercicio {index + 1}
              </span>
            </div>
            <FillInBlankExerciseComponent
              exercise={exercise}
              onComplete={(correct) => handleExerciseComplete(index, correct)}
            />
          </div>
        ))}
      </div>

      {/* Completion message */}
      {progress.completed === progress.total && progress.total > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center mt-6">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-xl font-bold text-green-800 mb-1">
            ¡Felicitaciones!
          </h3>
          <p className="text-green-700">
            Has completado todos los ejercicios correctamente.
          </p>
        </div>
      )}
    </div>
  );
}
