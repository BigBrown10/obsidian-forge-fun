import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const DATA_DIR = path.join(__dirname, '../../data');
const IDENTITY_FILE = path.join(DATA_DIR, 'identities.json');

export class IdentityService {
    constructor() {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        if (!fs.existsSync(IDENTITY_FILE)) fs.writeFileSync(IDENTITY_FILE, JSON.stringify({}));
    }

    async generateIdentity(agentId: string) {
        console.log(`🆔 Generating new identity for Agent ${agentId}...`);

        // 1. Generate Creds
        const username = `agent_${crypto.randomBytes(4).toString('hex')}`;
        const password = crypto.randomBytes(12).toString('base64') + '!Aa1'; // Strong pass

        // 2. Create Real Email (via Mail.tm)
        let email = `${username}@example.com`;
        try {
            const domainRes = await fetch('https://api.mail.tm/domains');
            const domains = await domainRes.json();
            if (domains['hydra:member'] && domains['hydra:member'][0]) {
                const domain = domains['hydra:member'][0].domain;
                email = `${username}@${domain}`;

                // Register account on Mail.tm
                const regRes = await fetch('https://api.mail.tm/accounts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address: email, password: password })
                });

                if (regRes.ok) {
                    console.log(`📧 Created Real Email: ${email}`);
                } else {
                    console.error("Failed to create Mail.tm account:", await regRes.text());
                }
            }
        } catch (e) {
            console.error("Mail.tm API failed, falling back to mock email.", e);
        }

        const identity = {
            agentId,
            username,
            email,
            password,
            created: Date.now(),
            service: 'mail.tm'
        };

        this.saveIdentity(agentId, identity);
        return identity;
    }

    saveIdentity(agentId: string, data: any) {
        let identities: any = {};
        try {
            identities = JSON.parse(fs.readFileSync(IDENTITY_FILE, 'utf-8'));
        } catch (e) { /* ignore */ }

        identities[agentId] = data;
        fs.writeFileSync(IDENTITY_FILE, JSON.stringify(identities, null, 2));
        console.log(`💾 Identity saved for ${agentId}`);
    }

    getIdentity(agentId: string) {
        try {
            const identities = JSON.parse(fs.readFileSync(IDENTITY_FILE, 'utf-8'));
            return identities[agentId] || null;
        } catch (e) {
            return null;
        }
    }

    async getCredentials(platform: string) {
        // Mock credentials - in production this would query a secure vault
        if (platform === 'twitter') {
            return {
                username: process.env.TWITTER_USERNAME || 'mock_user',
                password: process.env.TWITTER_PASSWORD || 'mock_password',
                cookies: [] // Populate with cookies for session persistence
            };
        }
        return null;
    }

    saveCookies(agentId: string, cookies: any[]) {
        const identities = JSON.parse(fs.readFileSync(IDENTITY_FILE, 'utf-8'));
        if (identities[agentId]) {
            identities[agentId].cookies = cookies;
            identities[agentId].lastLogin = Date.now();
            fs.writeFileSync(IDENTITY_FILE, JSON.stringify(identities, null, 2));
            console.log(`🍪 Cookies saved for ${agentId}`);
        }
    }
}
