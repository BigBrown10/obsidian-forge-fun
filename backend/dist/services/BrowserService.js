"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserService = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
class BrowserService {
    browser = null;
    async launch() {
        if (!this.browser) {
            console.log("🚀 Launching Headless Browser...");
            this.browser = await puppeteer_1.default.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for running as root/docker
            });
        }
    }
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
    async visitAndScreenshot(url) {
        if (!this.browser)
            await this.launch();
        const page = await this.browser.newPage();
        try {
            console.log(`🌐 Navigating to ${url}...`);
            // Set a realistic viewport
            await page.setViewport({ width: 1280, height: 800 });
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            const title = await page.title();
            console.log(`📄 Page Title: ${title}`);
            // Take screenshot as base64
            const screenshotBuffer = await page.screenshot({ encoding: 'base64', type: 'jpeg', quality: 80 });
            return {
                title,
                screenshot: `data:image/jpeg;base64,${screenshotBuffer}`
            };
        }
        catch (error) {
            console.error(`❌ Error visiting ${url}:`, error);
            throw error;
        }
        finally {
            await page.close();
        }
    }
}
exports.BrowserService = BrowserService;
