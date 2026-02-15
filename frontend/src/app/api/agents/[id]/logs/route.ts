import { NextResponse } from 'next/server'

// VM Backend URL
const BACKEND_URL = 'http://4.180.228.169:3001'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const res = await fetch(`${BACKEND_URL}/api/agents/${id}/logs`, {
            signal: AbortSignal.timeout(5000)
        })

        if (!res.ok) {
            if (res.status === 404) return NextResponse.json([])
            return NextResponse.json({ error: `Backend returned ${res.status}` }, { status: res.status })
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (e) {
        console.error('Proxy Logs Error:', e)
        return NextResponse.json([], { status: 500 }) // Return empty array on failure
    }
}
