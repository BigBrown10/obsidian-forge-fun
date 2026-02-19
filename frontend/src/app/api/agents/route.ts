import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// VM Backend URL (Support local dev and staging)
const BACKEND_URL = process.env.BACKEND_URL || 'http://4.180.228.169:3001'

export async function GET() {
    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000) // 5s timeout

        const res = await fetch(`${BACKEND_URL}/api/agents`, {
            signal: controller.signal,
            cache: 'no-store'
        })
        clearTimeout(timeout)

        if (!res.ok) {
            console.error(`Backend returned ${res.status}`)
            return NextResponse.json({ error: 'Failed to fetch agents from backend' }, { status: res.status })
        }

        const agents = await res.json()
        return NextResponse.json(agents)
    } catch (error) {
        console.error('API Proxy Error:', error)
        return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 })
    }
}
