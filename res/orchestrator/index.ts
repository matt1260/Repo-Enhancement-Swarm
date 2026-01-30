import fs from 'fs';
import path from 'path';
import { createContext, AppContext } from './context';

/**
 * Orchestrator Core
 * Manages the lifecycle of the Repo Enhancement Swarm.
 * Now refactored to use Hexagonal Architecture (Ports & Adapters).
 */

export class Orchestrator {
    private config: any;
    private ctx: AppContext;
    private isRunning: boolean = false;
    private runId: string;

    constructor(configPath: string) {
        this.config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        this.runId = `run-${Date.now()}`;
        
        // Initialize the Application Context (Dependency Injection)
        // Switch to 'prod' here when adapters are ready.
        this.ctx = createContext('local');
        
        this.initializeRun();
    }

    private async initializeRun() {
        console.log(`[Orchestrator] Initializing run ${this.runId}`);
        await this.ctx.metadata.saveRun(this.runId, this.config);
    }

    public async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        console.log(`[Orchestrator] Starting run ${this.runId} with supervisor: ${this.config.general.supervisor}`);
        
        // 1. Ingest Repo (Uses Job Queue)
        await this.ctx.jobs.submitJob('REPO_INGEST', { url: this.config.general.repo_url });
        await this.ctx.metadata.updateRunStatus(this.runId, 'ingesting', {});

        // 2. Main Evolution Loop
        while(this.isRunning) {
            await this.evolutionStep();
            // Basic throttling
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    public stop() {
        this.isRunning = false;
        console.log("[Orchestrator] Stopping...");
        this.ctx.metadata.updateRunStatus(this.runId, 'stopped', {});
    }

    private async evolutionStep() {
        console.log("[Orchestrator] Tick...");
        
        // Example: Use LLM to analyze state
        const analysis = await this.ctx.llm.generate("Analyze current metrics", "gemini-pro");
        console.log(`[Analyst] ${analysis}`);

        // Example: Update Graph
        await this.ctx.graph.ingestGraph(this.runId, [], []); // Mock update

        await this.ctx.metadata.updateRunStatus(this.runId, 'running', { ticks: Date.now() });
    }
}
