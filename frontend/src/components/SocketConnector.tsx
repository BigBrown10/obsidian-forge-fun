'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Agent } from '../lib/api'

export function SocketConnector() {
    const queryClient = useQueryClient()

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws'
        let socket: WebSocket | null = null;
        let retryCount = 0;
        let isUnmounting = false;

        const connect = () => {
            if (isUnmounting) return;

            try {
                socket = new WebSocket(wsUrl)

                socket.onopen = () => {
                    console.log('✅ [Socket] Connected')
                    retryCount = 0
                }

                socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data)
                        if (data.type === 'AGENTS_UPDATED') {
                            console.log('⚡ [Socket] Received Update:', data.agents.length, 'agents')
                            const agents = data.agents as Agent[]

                            // 1. Update List Query
                            // Directly set cache to avoid refetch flicker
                            queryClient.setQueryData(['agents'], agents)

                            // 2. Optimistically update individual agent details if they are in the cache
                            // This helps the Agent Detail page stay fresh without refetching
                            agents.forEach(agent => {
                                // Specific query key for individual agent
                                queryClient.setQueryData(['agent', agent.ticker], (old: Agent | undefined) => {
                                    // Only update if existing data is older or different?
                                    // For simplicity, overwrite if exists.
                                    return agent
                                })
                            })
                        }
                    } catch (e) {
                        console.error('[Socket] Parse Error', e)
                    }
                }

                socket.onclose = () => {
                    if (!isUnmounting) {
                        console.log('❌ [Socket] Disconnected. Reconnecting...')
                        // Exponential backoff
                        const timeout = Math.min(1000 * (2 ** retryCount), 10000)
                        retryCount++
                        setTimeout(connect, timeout)
                    }
                }

                socket.onerror = (e) => {
                    // console.error('[Socket] Error', e) // Keep console clean on dev
                }

            } catch (e) {
                console.error("Socket Init Failed", e)
            }
        }

        connect()

        return () => {
            isUnmounting = true;
            if (socket) {
                socket.close()
            }
        }
    }, [queryClient])

    return null
}
