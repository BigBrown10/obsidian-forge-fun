import { useQuery } from '@tanstack/react-query'
import { getAgents, type Agent } from '@/lib/api'

export type { Agent }

export function useAgents() {
    return useQuery({
        queryKey: ['agents'],
        queryFn: getAgents,
        refetchInterval: 2000, // Poll every 2 seconds
    })
}

import { getAgentByTicker } from '@/lib/api'

export function useAgent(ticker: string) {
    return useQuery({
        queryKey: ['agent', ticker],
        queryFn: () => getAgentByTicker(ticker),
        refetchInterval: 2000,
        enabled: !!ticker, // Only run if ticker is present
        retry: 2,
    })
}
