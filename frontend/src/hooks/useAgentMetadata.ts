import { useState, useEffect } from 'react';

export interface AgentMetadata {
    description?: string;
    image?: string;
    vaultPercent?: number;
    opsPercent?: number;
    agentType?: string;
    skills?: any[];
    budgetAllocation?: {
        marketing: number;
        team: number;
        community: number;
    };
}

export function useAgentMetadata(metadataURI: string | undefined | null) {
    const [metadata, setMetadata] = useState<AgentMetadata | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!metadataURI) {
            setMetadata(null);
            return;
        }

        const fetchMetadata = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Check if it's a URL
                if (metadataURI.startsWith('http')) {
                    const response = await fetch(metadataURI);
                    if (!response.ok) throw new Error('Failed to fetch metadata');
                    const data = await response.json();
                    setMetadata(data);
                } else {
                    // Try parsing as JSON string (Backwards compatibility)
                    try {
                        const data = JSON.parse(metadataURI);
                        setMetadata(data);
                    } catch (e) {
                        // If it's not JSON and not a URL, it might be a raw string or invalid
                        console.warn("Invalid metadata format", metadataURI);
                        setMetadata(null);
                    }
                }
            } catch (err) {
                console.error("Error fetching agent metadata:", err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
                setMetadata(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetadata();
    }, [metadataURI]);

    return { metadata, isLoading, error };
}
