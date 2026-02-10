#!/usr/bin/env node

/**
 * ECO IMPACT TRACKER - Dev Runner
 * Launches backend + frontend and displays a clean summary when ready.
 */

import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// ANSI colors
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

// State tracking
let frontendReady = false;
let backendReady = false;
let summaryDisplayed = false;
let frontendUrl = 'http://localhost:5173';
const backendPort = 8081;
const backendUrl = `http://localhost:${backendPort}`;
const swaggerUrl = `${backendUrl}/swagger-ui/index.html`;

/**
 * Display the summary block once both services are ready
 */
function displaySummary() {
    if (summaryDisplayed) return;
    summaryDisplayed = true;

    console.log('');
    console.log(`${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
    console.log(`${GREEN}${BOLD}  ECO IMPACT TRACKER — READY ✅${RESET}`);
    console.log(`${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
    console.log(`  ${CYAN}Frontend${RESET} : ${frontendUrl}`);
    console.log(`  ${CYAN}Backend${RESET}  : ${backendUrl}`);
    console.log(`  ${CYAN}Swagger${RESET}  : ${swaggerUrl}`);
    console.log(`${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
    console.log('');
}

/**
 * Try to display summary if conditions are met
 */
function tryDisplaySummary() {
    if (frontendReady && backendReady) {
        displaySummary();
    }
}

/**
 * Parse output lines for ready signals
 */
function parseLine(line) {
    // Detect Vite frontend URL: various formats
    // "Local:   http://localhost:5173/"
    // "➜  Local:   http://localhost:5173/"
    const viteMatch = line.match(/Local:\s*(https?:\/\/localhost[:\d]*\/?)/i);
    if (viteMatch) {
        frontendUrl = viteMatch[1].replace(/\/$/, '');
        frontendReady = true;
        tryDisplaySummary();
        return;
    }

    // Also detect "VITE v" line which means Vite started
    if (line.includes('VITE v') || line.includes('vite v')) {
        // Vite is starting, set a short timeout for fallback
        setTimeout(() => {
            if (!frontendReady) {
                frontendReady = true;
                tryDisplaySummary();
            }
        }, 2000);
    }

    // Detect backend ready: "Started EcoImpactTrackerApplication"
    if (line.includes('Started EcoImpactTrackerApplication') ||
        line.includes('Tomcat started on port')) {
        backendReady = true;
        tryDisplaySummary();

        // Also set a fallback for frontend if it started silently
        setTimeout(() => {
            if (!frontendReady) {
                frontendReady = true;
                tryDisplaySummary();
            }
        }, 3000);
        return;
    }
}

/**
 * Filter output - suppress noise after summary
 */
function shouldShowLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return false;

    // Show HTTP logs always
    if (trimmed.includes('HTTP') && trimmed.includes('->')) return true;

    // Before summary, show everything important
    if (!summaryDisplayed) {
        // Hide npm script noise
        if (trimmed.startsWith('>') || trimmed.startsWith('npm')) return false;
        // Show startup messages
        return true;
    }

    // After summary, only show important runtime logs
    if (trimmed.includes('ERROR') || trimmed.includes('WARN')) return true;
    if (trimmed.includes('[API]')) return true;

    return false;
}

/**
 * Main execution
 */
async function main() {
    // Step 1: Cleanup ports
    console.log(`${DIM}🧹 Cleaning up ports...${RESET}`);
    try {
        execSync('npm run cleanup:ports', {
            cwd: rootDir,
            stdio: 'pipe',
            encoding: 'utf-8'
        });
        console.log(`${GREEN}✓ Ports cleaned${RESET}\n`);
    } catch (e) {
        console.log(`${DIM}(cleanup skipped)${RESET}\n`);
    }

    // Step 2: Launch concurrently
    const child = spawn(
        'npx concurrently --raw --kill-others "npm run dev:backend" "npm run dev:frontend"',
        [],
        {
            cwd: rootDir,
            shell: true,
            stdio: ['inherit', 'pipe', 'pipe']
        }
    );

    // Handle stdout
    child.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
            parseLine(line);
            if (shouldShowLine(line)) {
                process.stdout.write(line + '\n');
            }
        }
    });

    // Handle stderr (Vite often outputs here)
    child.stderr.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
            parseLine(line);
            if (shouldShowLine(line)) {
                process.stderr.write(line + '\n');
            }
        }
    });

    // Handle exit
    child.on('close', (code) => {
        process.exit(code || 0);
    });

    // Forward signals
    process.on('SIGINT', () => child.kill('SIGINT'));
    process.on('SIGTERM', () => child.kill('SIGTERM'));
}

main().catch(console.error);
