

interface FlowStatusDisplayProps {
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'EXISTS';
    name?: string;
}

export default function FlowStatusDisplay({ status, name }: FlowStatusDisplayProps) {
    const statusConfig = {
        PENDING: { color: 'bg-gray-100 text-gray-800', icon: '⏳', text: 'En cola' },
        RUNNING: { color: 'bg-blue-100 text-blue-800', icon: '🔄', text: 'Procesando' },
        COMPLETED: { color: 'bg-green-100 text-green-800', icon: '✅', text: 'Completado' },
        FAILED: { color: 'bg-red-100 text-red-800', icon: '❌', text: 'Error' },
        EXISTS: { color: 'bg-green-100 text-green-800', icon: '✅', text: 'Completado' },
    };

    const config = statusConfig[status]

    return (
        <div className={`p-4 rounded-lg ${config.color}`}>
            <div className="flex items-center gap-3">
                <span className="text-2xl">{config.icon}</span>
                <div>
                    <h3 className="font-semibold">{config.text}</h3>
                    {name && <p className="text-sm">{name}</p>}
                </div>
            </div>
        </div>
    )
}