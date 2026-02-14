
async function test() {
    try {
        console.log("Sending POST request...");
        const response = await fetch('http://localhost:3001/agent/spawn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agentId: "999",
                manifest: {
                    name: "API_AGENT",
                    ticker: "API",
                    runtimePrompt: "You are a test agent."
                }
            })
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Body:", text);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
