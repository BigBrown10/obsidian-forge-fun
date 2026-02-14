
import { IdentityService } from './src/services/IdentityService';

async function test() {
    const service = new IdentityService();
    console.log("🚀 Testing Identity Generation...");

    // Generate Identity for Agent 'TEST_AGENT'
    const identity = await service.generateIdentity('TEST_AGENT');
    console.log("Identity:", identity);

    // Verify Persistence
    const loaded = service.getIdentity('TEST_AGENT');
    console.log("Loaded from Disk:", loaded);

    if (loaded && loaded.email === identity.email) {
        console.log("✅ Success: Identity generated and saved.");
    } else {
        console.error("❌ Persistence Failed");
    }
}

test();
