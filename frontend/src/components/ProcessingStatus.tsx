// components/ProcessingStatus.tsx

interface ProcessingStatusProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

export default function ProcessingStatus({ status, message }: ProcessingStatusProps) {
  if (status === 'idle') return null;

  const statusConfig = {
    loading: {
      color: 'bg-blue-100 text-blue-800',
      icon: '⏳',
      title: 'Procesando...',
    },
    success: {
      color: 'bg-green-100 text-green-800',
      icon: '✅',
      title: '¡Completado!',
    },
    error: {
      color: 'bg-red-100 text-red-800',
      icon: '❌',
      title: 'Error',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`max-w-2xl mx-auto mt-6 p-4 rounded-lg ${config.color}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{config.icon}</span>
        <div>
          <h3 className="font-semibold">{config.title}</h3>
          {message && <p className="text-sm mt-1">{message}</p>}
        </div>
      </div>
      {status === 'loading' && (
        <div className="mt-3">
          <div className="w-full bg-white rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-xs mt-2">Descargando audio → Transcribiendo → Generando preguntas...</p>
        </div>
      )}
    </div>
  );
}