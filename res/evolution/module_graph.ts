import { FitnessVector } from '../evaluation/fitness';
import { MutationOperator, MutationPatch } from '../mutations/operators';

export interface ModuleNode {
    id: string; // File path or module name
    type: 'file' | 'package' | 'class' | 'function';
    loc: number;
    complexity: number;
    responsibilities: string[];
    content?: string; // Content cache (optional)
}

export interface DependencyEdge {
    source: string;
    target: string;
    type: 'import' | 'call' | 'inheritance';
    weight: number;
}

export interface OrganismMetadata {
    generation: number;
    parents: string[]; // IDs of parent organisms
    mutationsApplied: string[]; // List of operators applied
}

/**
 * ModuleGraph
 * Represents the state of the repository (The Organism).
 */
export class ModuleGraph {
    public id: string;
    public nodes: Map<string, ModuleNode>;
    public edges: DependencyEdge[];
    public fitness: FitnessVector;
    public metadata: OrganismMetadata;

    constructor(id: string) {
        this.id = id;
        this.nodes = new Map();
        this.edges = [];
        this.fitness = {
            correctness: 0,
            security: 0,
            performance: 0,
            maintainability: 0,
            ux: 0,
            archScore: 0
        };
        this.metadata = {
            generation: 0,
            parents: [],
            mutationsApplied: []
        };
    }

    /**
     * Clones the graph for mutation (Copy-on-Write simulation).
     */
    public clone(newId: string): ModuleGraph {
        const clone = new ModuleGraph(newId);
        // Deep copy nodes and edges
        clone.nodes = new Map(JSON.parse(JSON.stringify(Array.from(this.nodes.entries()))));
        clone.edges = JSON.parse(JSON.stringify(this.edges));
        clone.fitness = { ...this.fitness };
        clone.metadata = { 
            generation: this.metadata.generation + 1,
            parents: [this.id],
            mutationsApplied: [...this.metadata.mutationsApplied]
        };
        return clone;
    }

    /**
     * Applies a mutation patch to the graph model.
     * Note: This updates the *graph representation*, not the actual files on disk yet.
     */
    public applyMutation(patch: MutationPatch): void {
        this.metadata.mutationsApplied.push(patch.operator);
        
        // Logic to update graph based on patch type
        // This is a simplified simulation of how code changes affect the graph
        if (patch.operator === MutationOperator.MODULE_FISSION) {
            // Example: Split a node into two
            const target = patch.modified_files[0];
            if (this.nodes.has(target)) {
                const original = this.nodes.get(target)!;
                // Reduce complexity of original
                original.complexity /= 2;
                original.loc /= 2;
                
                // Add new node (simplified)
                const newNodeId = target.replace('.ts', '_part2.ts');
                this.nodes.set(newNodeId, {
                    ...original,
                    id: newNodeId,
                    responsibilities: ['Splinter responsibility']
                });
                
                // Add edge
                this.edges.push({ source: target, target: newNodeId, type: 'import', weight: 1 });
            }
        }
        
        // Handle other operators...
    }

    /**
     * Returns a JSON representation for storage/visualization.
     */
    public serialize(): any {
        return {
            id: this.id,
            nodes: Array.from(this.nodes.values()),
            edges: this.edges,
            fitness: this.fitness,
            metadata: this.metadata
        };
    }
}
