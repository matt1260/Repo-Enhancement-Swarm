import path from 'path';
import { AppContext } from './context';
import { ModuleGraph } from '../evolution/module_graph';

/**
 * RepoIngestor
 * Handles the initial cloning, analysis, and graph generation of a repository.
 */
export class RepoIngestor {
    private ctx: AppContext;

    constructor(ctx: AppContext) {
        this.ctx = ctx;
    }

    /**
     * Orchestrates the ingestion process.
     */
    public async ingest(runId: string, repoUrl: string): Promise<ModuleGraph> {
        console.log(`[RepoIngest] Starting ingestion for ${repoUrl}`);

        // 1. Clone Repo (Simulated via Job)
        // In a real env, this would trigger a container to git clone
        const cloneJobId = await this.ctx.jobs.submitJob('GIT_CLONE', { url: repoUrl, target: runId });
        await this.waitForJob(cloneJobId);

        // 2. Static Analysis / Indexing
        // Run tools like 'madge', 'sloc', 'eslint' to extract graph data
        const analysisJobId = await this.ctx.jobs.submitJob('STATIC_ANALYSIS', { runId });
        const analysisResult = await this.waitForJob(analysisJobId);

        // 3. Construct ModuleGraph
        const graph = new ModuleGraph(runId + '-baseline');
        
        // Mocking population of graph from analysis results
        if (analysisResult) {
            // Assume analysisResult contains nodes/edges
            // In reality, we'd parse the JSON output of the analysis tools
            const files = ['index.ts', 'app.ts', 'utils.ts', 'core/logic.ts'];
            
            files.forEach(f => {
                graph.nodes.set(f, {
                    id: f,
                    type: 'file',
                    loc: Math.floor(Math.random() * 200) + 50,
                    complexity: Math.floor(Math.random() * 10) + 1,
                    responsibilities: ['Generated responsibility']
                });
            });

            graph.edges.push({ source: 'index.ts', target: 'app.ts', type: 'import', weight: 1 });
            graph.edges.push({ source: 'app.ts', target: 'core/logic.ts', type: 'import', weight: 1 });
        }

        // 4. Save to GraphStore
        const serialized = graph.serialize();
        await this.ctx.graph.ingestGraph(runId, serialized.nodes, serialized.edges);

        console.log(`[RepoIngest] Ingestion complete. Nodes: ${graph.nodes.size}, Edges: ${graph.edges.length}`);
        return graph;
    }

    private async waitForJob(jobId: string): Promise<any> {
        // Simple polling for the job result (since we are in local dev mostly)
        let status = 'queued';
        while (status !== 'completed' && status !== 'failed') {
            await new Promise(r => setTimeout(r, 200));
            status = await this.ctx.jobs.getJobStatus(jobId);
        }
        
        if (status === 'failed') {
            throw new Error(`Job ${jobId} failed.`);
        }

        return this.ctx.jobs.getJobResult(jobId);
    }
}
