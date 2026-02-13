"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttestationService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class AttestationService {
    isSimulated;
    teeSecretKey; // In real TEE, this is derived from hardware root of trust
    constructor() {
        // Check if running in a real TEE environment (e.g. Gramine/Occlum)
        // For now, we simulate it.
        this.isSimulated = process.env.TEE_SIMULATION !== 'false';
        this.teeSecretKey = process.env.TEE_SECRET_KEY || 'mock-tee-secret-key-do-not-use-in-prod';
        if (this.isSimulated) {
            console.warn('⚠️  Running in TEE SIMULATION mode. Attestations are NOT secure.');
        }
        else {
            console.log('🔒  Initializing Real TEE Attestation Service...');
        }
    }
    /**
     * Generates a "Consent-to-Spend" quote.
     * In a real SGX enclave, this would call the architectural enclave (QE).
     * Here, we sign the payload with our mock key.
     */
    async generateQuote(payload) {
        const timestamp = Date.now();
        const dataToSign = `${payload}:${timestamp}`;
        // Simulate signing
        const signature = crypto_1.default
            .createHmac('sha256', this.teeSecretKey)
            .update(dataToSign)
            .digest('hex');
        // Simulate MR_ENCLAVE (a hash of the code)
        const mrEnclave = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        return {
            quote: `MOCK_QUOTE_FOR:${payload}`,
            signature,
            timestamp,
            mrEnclave
        };
    }
    /**
     * Verifies a quote.
     * In production, this runs on-chain or via a remote verifier (Intel IAS/DCAP).
     */
    async verifyQuote(quote, originalPayload) {
        const dataToSign = `${originalPayload}:${quote.timestamp}`;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', this.teeSecretKey)
            .update(dataToSign)
            .digest('hex');
        if (quote.signature !== expectedSignature)
            return false;
        // Check timestamp freshness (e.g. 5 mins)
        if (Date.now() - quote.timestamp > 300000)
            return false;
        return true;
    }
}
exports.AttestationService = AttestationService;
