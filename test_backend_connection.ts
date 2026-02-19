
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
            console.log("First Agent:");
            console.log(`- ID: ${data[0].id}`);
            console.log(`- Name: ${data[0].name}`);
            console.log(`- Ticker: ${data[0].ticker}`);
            console.log(`- Token Address: ${data[0].tokenAddress}`);
        } else {
            console.log("⚠️ Agent list is empty.");
        }
    } catch (error) {
        console.error("❌ Failed to fetch agents:", error);
    }
}

testBackend();
