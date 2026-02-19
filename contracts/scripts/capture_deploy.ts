import { execSync } from 'child_process';
import * as fs from 'fs';

try {
    const output = execSync('npx hardhat run scripts/deploy_split.ts --network bnb_testnet', { encoding: 'utf8' });
    fs.writeFileSync('deploy_result.txt', output);
    console.log('Deployment output saved to deploy_result.txt');
} catch (e) {
    console.error('Deployment failed:', e.stdout || e.message);
    if (e.stdout) fs.writeFileSync('deploy_result.txt', e.stdout);
}
