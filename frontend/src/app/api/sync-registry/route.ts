import { NextResponse } from 'next/server'

// VM Backend URL
// In production, this should be an env var, but hardcoded for reliability now.
const BACKEND_URL = 'http://4.180.228.169:3001'

export async function POST() {
    try {
        console.log("Proxying sync-registry to VM...")
        const res = await fetch(`${BACKEND_URL}/api/sync-registry`, {
            method: 'POST',
            signal: AbortSignal.timeout(5000) // 5s timeout
        })

        if (!res.ok) {
            console.error(`Backend sync failed with status: ${res.status}`)
            return NextResponse.json({ success: false, error: `Backend returned ${res.status}` }, { status: res.status })
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (e) {
        console.error('Proxy Sync Error:', e)
        return NextResponse.json({ error: 'Failed to connect to backend' }, { status: 502 })
    }
}
