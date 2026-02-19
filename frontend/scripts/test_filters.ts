// test_filters.ts
// Strict Logic Verification for "Start Incubation" vs "Launch Token" separation

// 1. Mock Data
const agents = [
    { id: '1', launched: true, metadataURI: JSON.stringify({ launchMode: 'instant' }) }, // Live Token
    { id: '2', launched: false, metadataURI: JSON.stringify({ launchMode: 'incubator' }) }, // Incubator Token
    { id: '3', launched: false, metadataURI: JSON.stringify({ launchMode: 'instant' }) }, // Unlaunched Instant (Should NOT be live)
    { id: '4', launched: true, metadataURI: JSON.stringify({ launchMode: 'incubator' }) }, // Launched Incubator (Should be live?) -> Yes, launched = live.
    { id: '5', launched: false, metadataURI: "{}" }, // Unknown unlaunched -> Not live
];

// 2. Define Filter Logic (COPIED FROM page.tsx - STRICT VERSION)
const liveFilter = (a: any) => {
    // STRICT FILTER: Only Launched agents are Live.
    if (!a.launched) return false;
    return true;
}

const incubatorFilter = (a: any) => {
    try {
        const m = a.metadataURI && a.metadataURI.startsWith('{') ? JSON.parse(a.metadataURI) : {}
        return m.launchMode === 'incubator' && !a.launched
    } catch { return false }
}

// 3. Run Tests
console.log("--- Testing Live Filter (Strict: launched=true) ---");
const liveAgents = agents.filter(liveFilter);
liveAgents.forEach(a => console.log(`[LIVE] ID: ${a.id}, Launched: ${a.launched}`));

console.log("\n--- Testing Incubator Filter (incubator mode + not launched) ---");
const incubatorAgents = agents.filter(incubatorFilter);
incubatorAgents.forEach(a => console.log(`[INCUBATOR] ID: ${a.id}, Launched: ${a.launched}`));

// 4. Assertions
const liveIds = liveAgents.map(a => a.id);
const incubatorIds = incubatorAgents.map(a => a.id);

if (liveIds.includes('2')) console.error("FAIL: Live Feed contains unlaunched Incubator token!");
else console.log("PASS: Live Feed excludes unlaunched Incubator token.");

if (liveIds.includes('3')) console.error("FAIL: Live Feed contains unlaunched Instant token!");
else console.log("PASS: Live Feed excludes unlaunched Instant token.");

if (!incubatorIds.includes('2')) console.error("FAIL: Incubator Feed missing standard Incubator token!");
else console.log("PASS: Incubator Feed includes standard Incubator token.");

if (incubatorIds.includes('1')) console.error("FAIL: Incubator Feed contains Launched token!");
else console.log("PASS: Incubator Feed excludes Launched token.");

console.log("\n--- Summary ---");
console.log(`Live Count: ${liveAgents.length}`);
console.log(`Incubator Count: ${incubatorAgents.length}`);
