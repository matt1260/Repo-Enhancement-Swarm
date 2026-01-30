/**
 * Mutation Operators
 * Defines the types of transformations the swarm can apply to the code.
 */

export enum MutationOperator {
    MODULE_FISSION = 'MODULE_FISSION', // Split a module into smaller parts
    MODULE_FUSION = 'MODULE_FUSION',   // Merge two modules
    MODULE_SPECIALIZATION = 'MODULE_SPECIALIZATION', // Refine a module for a specific task
    INTERFACE_EXTRACTION = 'INTERFACE_EXTRACTION', // Create an abstraction layer
    DEPENDENCY_REWIRING = 'DEPENDENCY_REWIRING', // Optimize imports/calls
    COMPRESSION = 'COMPRESSION', // Code golf / minimization
    MICRO = 'MICRO', // Small refactors, variable naming, loop optimization
    ALGORITHMIC = 'ALGORITHMIC', // Replacing O(n^2) with O(n log n) etc.
    ADVERSARIAL = 'ADVERSARIAL', // Injecting probes or stress tests (Red Team)
    UX_TWEAK = 'UX_TWEAK' // Frontend changes
}

export interface MutationPatch {
    operator: MutationOperator;
    diff: string; // Unified diff format
    modified_files: string[];
    added_tests: string[];
    runtime_instructions?: string;
}

export interface MutationResult {
    success: boolean;
    patch: MutationPatch;
    sandboxMetrics?: any;
}
