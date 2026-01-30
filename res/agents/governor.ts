import { BaseAgent, AgentProposal, Organism } from './agent_base';
import { ModuleGraph } from '../evolution/module_graph';

export class GovernorAgent extends BaseAgent {
    private policy: any;

    constructor(policy: any = {}) {
        super('System', 'Governor');
        this.policy = policy;
    }

    observe(organism: Organism): void {
        const graph = organism as unknown as ModuleGraph;
        this.log(`Enforcing policy. Current fitness: ${JSON.stringify(graph.fitness)}`);
    }

    async proposeMutation(organism: Organism): Promise<AgentProposal | null> {
        // Governors do not propose code changes directly, usually.
        // They might propose a rollback if things are bad, but mostly they vote.
        return null;
    }

    async validateProposal(proposal: AgentProposal): Promise<boolean> {
        // 1. Check Restricted Files
        const restricted = ['.env', 'secrets.ts', 'config/prod.json'];
        const touchesRestricted = proposal.targetFiles.some(f => 
            restricted.some(r => f.includes(r))
        );

        if (touchesRestricted) {
            this.log(`VETO: Proposal touches restricted file(s): ${proposal.targetFiles.join(', ')}`);
            return false;
        }

        // 2. Check Confidence Threshold
        if (proposal.confidence < 0.5) {
            this.log(`VETO: Low confidence proposal.`);
            return false;
        }

        return true;
    }
}
