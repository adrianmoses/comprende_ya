import { createFileRoute } from '@tanstack/react-router'
import VideoInput from "@/components/VideoInput";
import FlowStatusDisplay from "@/components/FlowStatusDisplay";
import {useState} from "react";
import {useFlowStatus} from "@/hooks/useFlowStatus";
import {useMutation} from "@tanstack/react-query";
import {processVideoAsync} from "@/lib/api";
import {toast} from "sonner"

export const Route = createFileRoute('/add-video')({
  component: RouteComponent,
})

function RouteComponent() {
    const [flowRunId, setFlowRunId] = useState<string | null>(null);
    const handleSubmit = (url: string, force: boolean) => {
        setFlowRunId(null);
        mutation.mutate({ url, force });
    };

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
                toast(`Video ya procesado! ID: ${data.result?.video_id}`);
            }
            setFlowRunId(data.flow_run_id);
        },
    });

  return (
      <div className="space-y-8">
          <VideoInput onSubmit={handleSubmit} isLoading={mutation.isPending} />

          {flowStatus && (
              <FlowStatusDisplay
                  status={flowStatus.status}
                  name={flowStatus.message}
              />
          )}

          {flowStatus?.status === 'FAILED' && (
              <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800">Error: {flowStatus.error}</p>
              </div>
          )}
      </div>
  )
}
