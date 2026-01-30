import { BaseAgent } from './agent_base';
import { ArchitectAgent } from './architect';
import { MutatorAgent } from './mutator';
import { GovernorAgent } from './governor';

/**
 * Registry of active agents in the swarm.
 */

export class AgentRegistry {
    private agents: Map<string, BaseAgent> = new Map();

    constructor() {
        this.register(new ArchitectAgent());
        this.register(new MutatorAgent());
        this.register(new GovernorAgent());
        // Add others here as implemented
    }

    public register(agent: BaseAgent) {
        this.agents.set(agent.name, agent);
        console.log(`[Registry] Registered agent: ${agent.name} (${agent.role})`);
    }

    public getAgent(name: string): BaseAgent | undefined {
        return this.agents.get(name);
    }

    public getAllAgents(): BaseAgent[] {
        return Array.from(this.agents.values());
    }

    public getAgentsByRole(role: string): BaseAgent[] {
        return this.getAllAgents().filter(a => a.role === role);
    }
}
