import {useQuery} from "@tanstack/react-query";
import {FlowStatus} from "@/types";
import {getFlowStatus} from "@/lib/api";


export function useFlowStatus(flowRunId: string | null) {
    return useQuery<FlowStatus>({
        queryKey: ['flow-status', flowRunId],
        queryFn: async () => {
            return await getFlowStatus(flowRunId);
        },
        enabled: !!flowRunId,
        refetchInterval: (query) => {
            // Dejar de hacer polling cuando termine
            if (!query.state.data) return 2000;
            const data = query.state.data;
            return data.status === 'COMPLETED' || data.status === 'FAILED' ? false : 2000;
        }
    })
}