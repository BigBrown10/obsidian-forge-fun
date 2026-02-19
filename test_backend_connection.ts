
import { AgentSchema } from './frontend/src/lib/api';

async function testBackend() {
    console.log("Testing connection to VM Backend: http://4.180.228.169:3001/api/agents");
    try {
        const res = await fetch('http://4.180.228.169:3001/api/agents');
        if (!res.ok) {
            throw new Error(`HTTP Status: ${res.status}`);
        }
        const data = await res.json();
        console.log(`✅ Success! Received ${data.length} agents.`);
        if (data.length > 0) {
            console.log("First agent sample:", JSON.stringify(data[0], null, 2));
        } else {
            console.log("⚠️ Agent list is empty. (Did hydration finish?)");
        }
    } catch (error) {
        console.error("❌ Failed to fetch agents:", error);
    }
}

testBackend();
