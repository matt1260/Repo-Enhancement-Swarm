import { 
    IMetadataStore, 
    IGraphStore, 
    IArtifactStore, 
    IJobQueue,
    ILlmGateway
} from '../interfaces/infrastructure';

import { 
    LocalMetadataStore, 
    LocalGraphStore, 
    LocalArtifactStore, 
    LocalJobQueue,
    LocalLlmGateway
} from '../infrastructure/local/fs_adapters';

export interface AppContext {
    metadata: IMetadataStore;
    graph: IGraphStore;
    artifacts: IArtifactStore;
    jobs: IJobQueue;
    llm: ILlmGateway;
}

// Factory to switch between Local and Prod stacks
export function createContext(env: 'local' | 'prod' = 'local'): AppContext {
    if (env === 'prod') {
        throw new Error("Production adapters (Postgres, Neo4j, S3, Ray) not implemented in this demo.");
        // Return Prod implementations here
    }

    return {
        metadata: new LocalMetadataStore(),
        graph: new LocalGraphStore(),
        artifacts: new LocalArtifactStore(),
        jobs: new LocalJobQueue(),
        llm: new LocalLlmGateway()
    };
}
