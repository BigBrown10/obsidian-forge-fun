import axios from 'axios';

export class FiveSimService {
    private apiKey: string;
    private baseUrl = 'https://5sim.net/v1';

    constructor() {
        this.apiKey = process.env.FIVESIM_API_KEY || '';
        if (!this.apiKey) {
            console.warn("⚠️ FiveSimService: FIVESIM_API_KEY not found in env. SMS verification will fail.");
        }
    }

    // Headers
    private get headers() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
        };
    }

    /**
     * Buy a number for a specific product and country
     * @param product e.g. 'twitter', 'telegram', 'google'
     * @param country e.g. 'usa', 'england', 'russia'
     */
    async buyNumber(product: string, country: string = 'usa'): Promise<{ id: number, phone: string } | null> {
        if (!this.apiKey) return null;

        try {
            console.log(`📱 [5sim] Buying number for ${product} in ${country}...`);
            const res = await axios.get(`${this.baseUrl}/user/buy/activation/${country}/any/${product}`, {
                headers: this.headers
            });

            // Response format depends on 5sim, usually { id: 123, phone: '+123...', ... }
            if (res.data && res.data.phone) {
                console.log(`📱 [5sim] Acquired: ${res.data.phone} (ID: ${res.data.id})`);
                return { id: res.data.id, phone: res.data.phone };
            }
            return null;
        } catch (error) {
            console.error("❌ [5sim] Buy Failed:", error);
            return null;
        }
    }

    /**
     * Check for SMS code
     * @param orderId The ID returned from buyNumber
     */
    async checkOrder(orderId: number): Promise<string | null> {
        if (!this.apiKey) return null;

        try {
            const res = await axios.get(`${this.baseUrl}/user/check/${orderId}`, {
                headers: this.headers
            });

            // Statuses: PENDING, RECEIVED, CANCELED, TIMEOUT, FINISHED, BANNED
            if (res.data.status === 'RECEIVED' && res.data.sms && res.data.sms.length > 0) {
                // Return the last code
                const lastMsg = res.data.sms[res.data.sms.length - 1];
                console.log(`📩 [5sim] Code Received: ${lastMsg.code}`);
                return lastMsg.code; // extraction might be needed depending on API
            }

            return null;
        } catch (error) {
            // console.error("Error checking order", error); 
            return null;
        }
    }

    /**
     * Wait for code with polling
     */
    async waitForCode(orderId: number, timeoutMs = 60000): Promise<string | null> {
        console.log(`⏳ [5sim] Waiting for SMS code (Order ${orderId})...`);
        const start = Date.now();

        while (Date.now() - start < timeoutMs) {
            const code = await this.checkOrder(orderId);
            if (code) return code;
            await new Promise(r => setTimeout(r, 2000)); // Poll every 2s
        }

        console.log("❌ [5sim] Timeout waiting for code.");
        return null;
    }

    /**
     * Cancel/Finish order
     */
    async finishOrder(orderId: number) {
        // Implementation omitted for brevity, but good practice to clear orders
    }
}
