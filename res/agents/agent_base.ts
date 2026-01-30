/**
 * Base Agent Class
 * All specialized agents inherit from this.
 */

export interface AgentProposal {
    operator: string;
    rationale: string;
    targetFiles: string[];
    confidence: number;
}

// Minimal interface to avoid circular dependency issues at import time
// Real implementations cast to ModuleGraph
export interface Organism {
    id: string;
}

export abstract class BaseAgent {
    public name: string;
    public role: string;

    constructor(name: string, role: string) {
        this.name = name;
        this.role = role;
    }

    /**
     * Observe the current state of the organism/repo.
     */
    abstract observe(organism: Organism): void;

    /**
     * Propose a mutation based on observations and objectives.
     */
    abstract proposeMutation(organism: Organism): Promise<AgentProposal | null>;

    /**
     * Validate a proposal from another agent (Seconding).
     */
    abstract validateProposal(proposal: AgentProposal): Promise<boolean>;

    /**
     * Log an action or thought.
     */
    protected log(message: string) {
        console.log(`[Agent:${this.name}] ${message}`);
    }
}
