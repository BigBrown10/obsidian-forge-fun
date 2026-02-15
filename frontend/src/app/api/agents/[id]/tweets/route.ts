import { NextResponse } from 'next/server'

// VM Backend URL
const BACKEND_URL = 'http://4.180.228.169:3001'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const res = await fetch(`${BACKEND_URL}/api/agents/${id}/tweets`, {
            signal: AbortSignal.timeout(5000)
        })

        if (!res.ok) {
            // If backend returns 404 (no tweets yet), we should forward that or return empty
            if (res.status === 404) return NextResponse.json([])
            return NextResponse.json({ error: `Backend returned ${res.status}` }, { status: res.status })
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (e) {
        console.error('Proxy Tweets Error:', e)
        return NextResponse.json([], { status: 500 }) // Return empty array on failure to not break UI
    }
}
