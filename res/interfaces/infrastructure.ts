/**
 * Hexagonal Architecture - Ports
 * These interfaces define the contract for the infrastructure layer.
 * Core logic uses these interfaces, allowing us to swap Local/File adapters
 * with Production (Postgres/Neo4j/S3/Ray) adapters easily.
 */

// 1. Datastores (PostgreSQL / Redis)
export interface IMetadataStore {
    saveRun(runId: string, config: any): Promise<void>;
    updateRunStatus(runId: string, status: string, metrics: any): Promise<void>;
    getRun(runId: string): Promise<any>;
}

// 2. Graph Store (Neo4j / Dgraph)
export interface IGraphStore {
    ingestGraph(runId: string, nodes: any[], edges: any[]): Promise<void>;
    query(cypherOrGremlin: string): Promise<any>;
    getComplexityMetrics(runId: string): Promise<any>;
}

// 3. Artifact Store (S3 / MinIO)
export interface IArtifactStore {
    uploadArtifact(runId: string, path: string, content: string | Buffer): Promise<string>; // returns URI
    downloadArtifact(uri: string): Promise<Buffer>;
    listArtifacts(runId: string): Promise<string[]>;
}

// 4. Job & Distributed Compute (Ray / Celery)
export interface IJobQueue {
    submitJob(jobType: string, payload: any): Promise<string>; // returns jobId
    getJobStatus(jobId: string): Promise<'queued' | 'running' | 'completed' | 'failed'>;
    getJobResult(jobId: string): Promise<any>;
}

// 5. LLM Orchestration (LangChain / vLLM)
export interface ILlmGateway {
    generate(prompt: string, model: string, config?: any): Promise<string>;
    embed(text: string): Promise<number[]>;
}
