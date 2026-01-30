# Repo Enhancement Swarm (RES)

RES is an autonomous multi-agent system designed to evolve and maintain codebases. It is built on a **Hexagonal Architecture (Ports and Adapters)** to allow for easy scaling from a local laptop to a production Kubernetes cluster.

## Architecture & Stack

### 1. Core Logic (`res/core`)
Pure TypeScript business logic. Dependency-free.

### 2. Interfaces / Ports (`res/interfaces/infrastructure.ts`)
Defines the contracts for:
- **MetadataStore**: `IMetadataStore`
- **GraphStore**: `IGraphStore`
- **ArtifactStore**: `IArtifactStore`
- **JobQueue**: `IJobQueue`
- **LLM**: `ILlmGateway`

### 3. Infrastructure Adapters (`res/infrastructure`)

#### Local Development (Implemented)
- **FileSystem DB**: JSON files in `.evo/db`
- **InMemory Queue**: Simple async dispatch
- **Mock LLM**: Console output

#### Production (Recommended Specification)
- **Datastore**: PostgreSQL (Metadata), Neo4j (Graph)
- **Object Store**: AWS S3 / MinIO
- **Compute**: Ray Cluster / Kubernetes Jobs
- **Queues**: Redis / RabbitMQ
- **Secrets**: HashiCorp Vault

## Usage

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Start (Local Mode)**
   ```bash
   node res/orchestrator/start.js --config=res/config/runtime.json
   ```

## Scaling to Production
To move to production, implement the interfaces in `res/infrastructure/prod/` using your preferred drivers (pg, neo4j-driver, aws-sdk, etc.) and switch `createContext('local')` to `createContext('prod')` in the Orchestrator.
