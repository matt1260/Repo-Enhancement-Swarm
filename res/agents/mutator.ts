import { BaseAgent, AgentProposal, Organism } from './agent_base';
import { ModuleGraph } from '../evolution/module_graph';
import { MutationOperator } from '../mutations/operators';

export class MutatorAgent extends BaseAgent {
    constructor() {
        super('Neo', 'Mutator');
    }

    observe(organism: Organism): void {
        // Mutators look for small tactical opportunities
    }

    async proposeMutation(organism: Organism): Promise<AgentProposal | null> {
        const graph = organism as unknown as ModuleGraph;
        const nodes = Array.from(graph.nodes.values());
        if (nodes.length === 0) return null;

        const target = nodes[Math.floor(Math.random() * nodes.length)];

        return {
            operator: MutationOperator.MICRO,
            targetFiles: [target.id],
            rationale: `Optimizing loop structures and variable naming in ${target.id}.`,
            confidence: 0.6
        };
    }

    async validateProposal(proposal: AgentProposal): Promise<boolean> {
        // Mutators are generally permissive
        return true;
    }
}
