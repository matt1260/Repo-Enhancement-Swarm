import { BaseAgent, AgentProposal, Organism } from './agent_base';
import { ModuleGraph } from '../evolution/module_graph';
import { MutationOperator } from '../mutations/operators';

export class ArchitectAgent extends BaseAgent {
    constructor() {
        super('Darwin', 'Architect');
    }

    observe(organism: Organism): void {
        const graph = organism as unknown as ModuleGraph; // Casting for now
        this.log(`Analyzing architecture of generation ${graph.metadata.generation}. Complexity avg: ${this.getAverageComplexity(graph)}`);
    }

    async proposeMutation(organism: Organism): Promise<AgentProposal | null> {
        const graph = organism as unknown as ModuleGraph;

        // Heuristic: Find large, complex modules and split them
        const candidates = Array.from(graph.nodes.values())
            .filter(n => n.complexity > 8 || n.loc > 200);

        if (candidates.length === 0) return null;

        const target = candidates[Math.floor(Math.random() * candidates.length)];
        
        return {
            operator: MutationOperator.MODULE_FISSION,
            targetFiles: [target.id],
            rationale: `Module ${target.id} has high complexity (${target.complexity}). Splitting to improve maintainability.`,
            confidence: 0.85
        };
    }

    async validateProposal(proposal: AgentProposal): Promise<boolean> {
        // Architects generally approve structural improvements
        if (proposal.operator === MutationOperator.MODULE_FISSION || 
            proposal.operator === MutationOperator.DEPENDENCY_REWIRING) {
            return true;
        }
        return false;
    }

    private getAverageComplexity(graph: ModuleGraph): number {
        if (graph.nodes.size === 0) return 0;
        let sum = 0;
        graph.nodes.forEach(n => sum += n.complexity);
        return sum / graph.nodes.size;
    }
}
