import fs from 'fs';
import path from 'path';
import { 
    IMetadataStore, 
    IGraphStore, 
    IArtifactStore, 
    IJobQueue,
    ILlmGateway
} from '../../interfaces/infrastructure';

const BASE_DIR = path.join((process as any).cwd(), 'res', '.evo');

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export class LocalMetadataStore implements IMetadataStore {
    constructor() { ensureDir(path.join(BASE_DIR, 'db')); }

    async saveRun(runId: string, config: any): Promise<void> {
        const filePath = path.join(BASE_DIR, 'db', `${runId}.meta.json`);
        fs.writeFileSync(filePath, JSON.stringify({ runId, config, status: 'initialized', metrics: {} }, null, 2));
    }

    async updateRunStatus(runId: string, status: string, metrics: any): Promise<void> {
        const filePath = path.join(BASE_DIR, 'db', `${runId}.meta.json`);
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            data.status = status;
            data.metrics = { ...data.metrics, ...metrics };
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        }
    }

    async getRun(runId: string): Promise<any> {
        const filePath = path.join(BASE_DIR, 'db', `${runId}.meta.json`);
        return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : null;
    }
}

export class LocalGraphStore implements IGraphStore {
    constructor() { ensureDir(path.join(BASE_DIR, 'graph')); }

    async ingestGraph(runId: string, nodes: any[], edges: any[]): Promise<void> {
        const filePath = path.join(BASE_DIR, 'graph', `${runId}.graph.json`);
        fs.writeFileSync(filePath, JSON.stringify({ nodes, edges }, null, 2));
    }

    async query(query: string): Promise<any> {
        console.log(`[LocalGraphStore] Mock Query: ${query}`);
        return { nodes: [], edges: [] }; // Mock response
    }

    async getComplexityMetrics(runId: string): Promise<any> {
        return { cyclomatic: 10, depth: 3 }; // Mock
    }
}

export class LocalArtifactStore implements IArtifactStore {
    constructor() { ensureDir(path.join(BASE_DIR, 'artifacts')); }

    async uploadArtifact(runId: string, artifactPath: string, content: string | Buffer): Promise<string> {
        const targetDir = path.join(BASE_DIR, 'artifacts', runId);
        ensureDir(targetDir);
        const fileName = path.basename(artifactPath);
        const finalPath = path.join(targetDir, fileName);
        fs.writeFileSync(finalPath, content);
        return `file://${finalPath}`;
    }

    async downloadArtifact(uri: string): Promise<Buffer> {
        const filePath = uri.replace('file://', '');
        return fs.readFileSync(filePath);
    }

    async listArtifacts(runId: string): Promise<string[]> {
        const targetDir = path.join(BASE_DIR, 'artifacts', runId);
        if (!fs.existsSync(targetDir)) return [];
        return fs.readdirSync(targetDir);
    }
}

export class LocalJobQueue implements IJobQueue {
    private jobs: Map<string, any> = new Map();

    async submitJob(jobType: string, payload: any): Promise<string> {
        const jobId = `job-${Date.now()}-${Math.random()}`;
        console.log(`[LocalJobQueue] Queued ${jobType} (${jobId})`);
        this.jobs.set(jobId, { status: 'queued', payload });
        
        // Mock immediate execution for local dev
        setTimeout(() => {
            this.jobs.set(jobId, { status: 'completed', result: { success: true } });
        }, 500);

        return jobId;
    }

    async getJobStatus(jobId: string): Promise<'queued' | 'running' | 'completed' | 'failed'> {
        return this.jobs.get(jobId)?.status || 'failed';
    }

    async getJobResult(jobId: string): Promise<any> {
        return this.jobs.get(jobId)?.result;
    }
}

export class LocalLlmGateway implements ILlmGateway {
    async generate(prompt: string, model: string): Promise<string> {
        console.log(`[LocalLLM] Generating with ${model}...`);
        return "MOCK_RESPONSE: This is a placeholder for real LLM output.";
    }

    async embed(text: string): Promise<number[]> {
        return [0.1, 0.2, 0.3]; // Mock vector
    }
}
