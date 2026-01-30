import React, { useState, useEffect } from 'react';
import { defaults as defaultProps } from '../config/defaults';

// --- Types derived from defaults object ---
type ConfigData = typeof defaultProps;

// Helper type for nested partials
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

const TABS = [
  'General',
  'Scope',
  'Objectives',
  'Resources',
  'Governance',
  'Advanced',
  'Reporting'
] as const;

type TabName = typeof TABS[number];

// --- Presets (Defined as overrides only) ---
const PRESETS: Record<string, DeepPartial<ConfigData>> = {
  "Conservative": {
    scope_limits: { max_concurrent_jobs: 2, max_files_touched: 10 },
    objectives: {
      fitness_weights: { correctness: 0.50, security: 0.30, performance: 0.05, ux: 0.05 },
      novelty_bonus: 0.01
    },
    safety_and_governance: { human_approval_required: true }
  },
  "Aggressive": {
    scope_limits: { max_concurrent_jobs: 8, max_files_touched: 100 },
    objectives: {
      fitness_weights: { correctness: 0.20, archScore: 0.30, performance: 0.20 },
      novelty_bonus: 0.15
    },
    safety_and_governance: { human_approval_required: false }
  },
  "Security-First": {
    objectives: {
      fitness_weights: { security: 0.60, correctness: 0.20, maintainability: 0.10 },
      soft_objectives: { securityFocus: 80 }
    },
    safety_and_governance: { 
        sensitive_file_globs: ["**/*", "**/.env", "**/*.pem", "**/secrets.*"] 
    }
  },
  "Human-Aligned": {
    objectives: {
      fitness_weights: { ux: 0.40, maintainability: 0.30 },
      soft_objectives: { modularityFocus: 60 }
    },
    safety_and_governance: { human_approval_required: true }
  }
};

// Deep merge utility
const mergeConfigs = (base: any, update: any): any => {
    const result = { ...base };
    Object.keys(update).forEach(key => {
        if (typeof update[key] === 'object' && update[key] !== null && !Array.isArray(update[key])) {
            result[key] = mergeConfigs(base[key] || {}, update[key]);
        } else {
            result[key] = update[key];
        }
    });
    return result;
};

export default function ConfigConsole() {
  const [activeTab, setActiveTab] = useState<TabName>('General');
  const [config, setConfig] = useState<ConfigData>(defaultProps);
  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'error'>('idle');
  const [version, setVersion] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Auto-save simulation
  useEffect(() => {
    if (isDirty) {
        const timer = setTimeout(() => {
            // console.log(`[System] Auto-saving config version ${version + 1}...`);
            setVersion(v => v + 1);
            setIsDirty(false);
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [config, isDirty]);

  // Clear feedback after 3s
  useEffect(() => {
      if (feedback) {
          const timer = setTimeout(() => setFeedback(null), 3000);
          return () => clearTimeout(timer);
      }
  }, [feedback]);

  const handleStart = () => {
    setStatus('running');
    setFeedback("Swarm execution started.");
  };

  const handleStop = () => {
    setStatus('idle');
    setFeedback("Swarm execution stopped.");
  };

  const handlePause = () => {
    setStatus('paused');
    setFeedback("Swarm paused.");
  }

  const handleApprove = () => {
    setFeedback("Pending proposals approved.");
  }

  const applyPreset = (name: string) => {
    const overrides = PRESETS[name];
    if (!overrides) return;

    setConfig(prev => {
        const newConfig = mergeConfigs(prev, overrides);
        return newConfig;
    });
    setIsDirty(true);
    setFeedback(`${name} Preset Applied`);
  };

  const updateConfig = (path: string[], value: any) => {
    setConfig((prev) => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      let current = newConfig;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newConfig;
    });
    setIsDirty(true);
  };

  const handleInputChange = (path: string[], type: 'string' | 'number' | 'boolean' | 'array', value: string | boolean) => {
    let finalValue: any = value;
    if (type === 'number') {
      finalValue = Number(value);
    } else if (type === 'array') {
      finalValue = (value as string).split(',').map(s => s.trim());
    }
    updateConfig(path, finalValue);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'General':
        return (
          <div className="space-y-6 animate-fadeIn">
            <SectionHeader title="General Settings" description="Basic repository information and swarm identity." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Supervisor Name" value={config.general.supervisor} onChange={(v) => handleInputChange(['general', 'supervisor'], 'string', v)} />
              <InputField label="Repo URL" value={config.general.repo_url} onChange={(v) => handleInputChange(['general', 'repo_url'], 'string', v)} />
              <InputField label="Branch" value={config.general.repo_branch} onChange={(v) => handleInputChange(['general', 'repo_branch'], 'string', v)} />
              <InputField label="Languages (comma separated)" value={config.general.languages.join(', ')} onChange={(v) => handleInputChange(['general', 'languages'], 'array', v)} />
              <div className="md:col-span-2">
                <InputField label="Business Objective" value={config.general.business_objective} onChange={(v) => handleInputChange(['general', 'business_objective'], 'string', v)} fullWidth />
              </div>
              <InputField label="Allowed Providers" value={config.general.allowed_providers.join(', ')} onChange={(v) => handleInputChange(['general', 'allowed_providers'], 'array', v)} />
            </div>
          </div>
        );
      case 'Scope':
        return (
          <div className="space-y-6 animate-fadeIn">
             <SectionHeader title="Scope Limits" description="Define the boundaries of the swarm's operation." />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <InputField label="Max Files Touched" type="number" value={config.scope_limits.max_files_touched} onChange={(v) => handleInputChange(['scope_limits', 'max_files_touched'], 'number', v)} />
               <InputField label="Max Lines/Tick" type="number" value={config.scope_limits.max_lines_change_per_tick} onChange={(v) => handleInputChange(['scope_limits', 'max_lines_change_per_tick'], 'number', v)} />
               <InputField label="Concurrent Jobs" type="number" value={config.scope_limits.max_concurrent_jobs} onChange={(v) => handleInputChange(['scope_limits', 'max_concurrent_jobs'], 'number', v)} />
               <div className="md:col-span-2">
                 <InputField label="Allowed Paths (Globs)" value={config.scope_limits.allowed_paths.join(', ')} onChange={(v) => handleInputChange(['scope_limits', 'allowed_paths'], 'array', v)} fullWidth />
                 <div className="h-4" />
                 <InputField label="Excluded Paths (Globs)" value={config.scope_limits.excluded_paths.join(', ')} onChange={(v) => handleInputChange(['scope_limits', 'excluded_paths'], 'array', v)} fullWidth />
               </div>
             </div>
          </div>
        );
      case 'Objectives':
        return (
          <div className="space-y-6 animate-fadeIn">
            <SectionHeader title="Objectives & Fitness" description="Tune the evolutionary pressure." />
            
            <h3 className="text-lg font-semibold text-cyan-400 border-b border-gray-700 pb-2">Fitness Weights (Sum to 1.0)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <SliderField label="Correctness" value={config.objectives.fitness_weights.correctness} onChange={(v) => handleInputChange(['objectives', 'fitness_weights', 'correctness'], 'number', v)} step={0.01} max={1} />
              <SliderField label="Security" value={config.objectives.fitness_weights.security} onChange={(v) => handleInputChange(['objectives', 'fitness_weights', 'security'], 'number', v)} step={0.01} max={1} />
              <SliderField label="Performance" value={config.objectives.fitness_weights.performance} onChange={(v) => handleInputChange(['objectives', 'fitness_weights', 'performance'], 'number', v)} step={0.01} max={1} />
              <SliderField label="Maintainability" value={config.objectives.fitness_weights.maintainability} onChange={(v) => handleInputChange(['objectives', 'fitness_weights', 'maintainability'], 'number', v)} step={0.01} max={1} />
              <SliderField label="UX" value={config.objectives.fitness_weights.ux} onChange={(v) => handleInputChange(['objectives', 'fitness_weights', 'ux'], 'number', v)} step={0.01} max={1} />
              <SliderField label="Arch Score" value={config.objectives.fitness_weights.archScore} onChange={(v) => handleInputChange(['objectives', 'fitness_weights', 'archScore'], 'number', v)} step={0.01} max={1} />
            </div>

            <h3 className="text-lg font-semibold text-cyan-400 border-b border-gray-700 pb-2 mt-8">Soft Objectives (0-100)</h3>
            <div className="grid grid-cols-2 gap-4">
               <SliderField label="Performance Focus" value={config.objectives.soft_objectives.performanceFocus} onChange={(v) => handleInputChange(['objectives', 'soft_objectives', 'performanceFocus'], 'number', v)} max={100} />
               <SliderField label="Modularity Focus" value={config.objectives.soft_objectives.modularityFocus} onChange={(v) => handleInputChange(['objectives', 'soft_objectives', 'modularityFocus'], 'number', v)} max={100} />
               <SliderField label="Algorithm Focus" value={config.objectives.soft_objectives.algorithmFocus} onChange={(v) => handleInputChange(['objectives', 'soft_objectives', 'algorithmFocus'], 'number', v)} max={100} />
               <SliderField label="Security Focus" value={config.objectives.soft_objectives.securityFocus} onChange={(v) => handleInputChange(['objectives', 'soft_objectives', 'securityFocus'], 'number', v)} max={100} />
            </div>
          </div>
        );
      case 'Resources':
        return (
          <div className="space-y-6 animate-fadeIn">
            <SectionHeader title="Swarm Resource Limits" description="Constrain the operational footprint of the agents." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <InputField label="Max CPU Cores" type="number" value={config.resource_limits.swarm_limits.max_cpu_cores} onChange={(v) => handleInputChange(['resource_limits', 'swarm_limits', 'max_cpu_cores'], 'number', v)} />
              <InputField label="Max Memory (GB)" type="number" value={config.resource_limits.swarm_limits.max_memory_gb} onChange={(v) => handleInputChange(['resource_limits', 'swarm_limits', 'max_memory_gb'], 'number', v)} />
              <InputField label="Max Disk (GB)" type="number" value={config.resource_limits.swarm_limits.max_disk_gb} onChange={(v) => handleInputChange(['resource_limits', 'swarm_limits', 'max_disk_gb'], 'number', v)} />
              <InputField label="Max Tokens/Request" type="number" value={config.resource_limits.swarm_limits.max_tokens_per_request} onChange={(v) => handleInputChange(['resource_limits', 'swarm_limits', 'max_tokens_per_request'], 'number', v)} />
            </div>

            <SectionHeader title="Deployment Target Optimization" description="Tell agents where the optimized app will run." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-900/50 p-6 rounded-lg border border-gray-800">
                <InputField label="Target Platform" value={config.resource_limits.target_environment.platform} onChange={(v) => handleInputChange(['resource_limits', 'target_environment', 'platform'], 'string', v)} />
                <InputField label="Runtime Environment" value={config.resource_limits.target_environment.runtime} onChange={(v) => handleInputChange(['resource_limits', 'target_environment', 'runtime'], 'string', v)} />
                <InputField label="Constraint (e.g. low-memory)" value={config.resource_limits.target_environment.constraints} onChange={(v) => handleInputChange(['resource_limits', 'target_environment', 'constraints'], 'string', v)} />
                <InputField label="Scaling Strategy" value={config.resource_limits.target_environment.scaling_strategy} onChange={(v) => handleInputChange(['resource_limits', 'target_environment', 'scaling_strategy'], 'string', v)} />
            </div>
          </div>
        );
      case 'Governance':
         return (
          <div className="space-y-6 animate-fadeIn">
             <SectionHeader title="Safety & Governance" description="Human oversight and critical file protection." />
             <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <input 
                  type="checkbox" 
                  checked={config.safety_and_governance.human_approval_required}
                  onChange={(e) => handleInputChange(['safety_and_governance', 'human_approval_required'], 'boolean', e.target.checked)}
                  className="w-5 h-5 text-cyan-500 rounded focus:ring-cyan-600 bg-gray-700 border-gray-600"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-200">Human Approval Required</label>
                  <p className="text-xs text-gray-400">If enabled, all structural changes require manual PR approval.</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Consensus Required (votes)" type="number" value={config.safety_and_governance.evolution_core_edit_policy.consensus_required} onChange={(v) => handleInputChange(['safety_and_governance', 'evolution_core_edit_policy', 'consensus_required'], 'number', v)} />
                <div className="col-span-1 md:col-span-2">
                   <InputField label="Sensitive File Globs" value={config.safety_and_governance.sensitive_file_globs.join(', ')} onChange={(v) => handleInputChange(['safety_and_governance', 'sensitive_file_globs'], 'array', v)} fullWidth />
                </div>
             </div>
          </div>
         );
      case 'Advanced':
          return (
            <div className="space-y-6 animate-fadeIn">
                <SectionHeader title="Advanced Evolution Params" description="Fine-tune the genetic algorithm." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SliderField label="Min Structural Percent" value={config.advanced.min_structural_percent} onChange={(v) => handleInputChange(['advanced', 'min_structural_percent'], 'number', v)} step={0.05} />
                    <InputField label="Optimal Module Lines" type="number" value={config.advanced.optimal_module_lines} onChange={(v) => handleInputChange(['advanced', 'optimal_module_lines'], 'number', v)} />
                    <SliderField label="Size Penalty Weight" value={config.advanced.size_penalty_weight} onChange={(v) => handleInputChange(['advanced', 'size_penalty_weight'], 'number', v)} step={0.01} max={0.5} />
                    <InputField label="Eval Delay Ticks" type="number" value={config.advanced.eval_delay_ticks} onChange={(v) => handleInputChange(['advanced', 'eval_delay_ticks'], 'number', v)} />
                </div>
            </div>
          );
       case 'Reporting':
         return (
           <div className="space-y-6 animate-fadeIn">
              <SectionHeader title="Reporting" description="Metrics frequency and artifact storage." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Report Frequency (mins)" type="number" value={config.reporting.report_frequency_minutes} onChange={(v) => handleInputChange(['reporting', 'report_frequency_minutes'], 'number', v)} />
                <InputField label="Artifact Store Path" value={config.reporting.artifact_store} onChange={(v) => handleInputChange(['reporting', 'artifact_store'], 'string', v)} />
              </div>
           </div>
         )
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans relative">
      {/* Toast Notification */}
      {feedback && (
          <div className="absolute top-6 right-6 z-50 animate-bounceIn">
              <div className="bg-cyan-600 text-white px-4 py-2 rounded shadow-lg border border-cyan-500 flex items-center">
                  <span className="mr-2">✓</span>
                  {feedback}
              </div>
          </div>
      )}

      {/* Sidebar */}
      <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">RES</h1>
          <p className="text-xs text-gray-500 mt-1">Repo Enhancement Swarm v1.0</p>
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-xs uppercase font-semibold text-gray-500">Config Ver:</span>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-900/20 px-1.5 py-0.5 rounded">{version}</span>
            {isDirty && <span className="text-xs text-yellow-500 italic ml-auto animate-pulse">Saving...</span>}
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-800">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Presets</h3>
            <div className="grid grid-cols-2 gap-2">
                {Object.keys(PRESETS).map(preset => (
                    <button 
                        key={preset} 
                        onClick={() => applyPreset(preset)}
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-2 rounded border border-gray-700 transition-colors"
                    >
                        {preset}
                    </button>
                ))}
            </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-md transition-all duration-200 flex items-center justify-between group ${
                activeTab === tab 
                  ? 'bg-cyan-900/30 text-cyan-300 border-l-4 border-cyan-500' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <span className="font-medium text-sm">{tab}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          <div className="flex items-center space-x-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${
                status === 'running' ? 'bg-green-500 animate-pulse' : 
                status === 'paused' ? 'bg-yellow-500' : 
                status === 'error' ? 'bg-red-500' : 'bg-gray-500'
            }`} />
            <span className="text-sm font-medium text-gray-300 capitalize">{status}</span>
          </div>
          <div className="flex flex-col gap-2">
             {status === 'idle' && (
                <button 
                  onClick={handleStart}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2 px-4 rounded-md font-semibold text-sm transition-colors shadow-lg shadow-cyan-900/20"
                >
                  Start Run
                </button>
             )}
             {status === 'running' && (
                <>
                  <button 
                    onClick={handlePause}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded-md font-semibold text-sm"
                  >
                    Pause
                  </button>
                  <button 
                    onClick={handleStop}
                    className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-md font-semibold text-sm"
                  >
                    Abort
                  </button>
                </>
             )}
             {status === 'paused' && (
                 <button 
                    onClick={handleStart}
                    className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-md font-semibold text-sm"
                >
                    Resume
                </button>
             )}
             <button 
                onClick={handleApprove}
                className="w-full border border-cyan-700 text-cyan-400 hover:bg-cyan-900/30 py-2 rounded-md font-semibold text-sm mt-2"
             >
                Approve Pending
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-950 p-8">
        <div className="max-w-4xl mx-auto">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}

// --- Reusable Components ---

const SectionHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="mb-8">
    <h2 className="text-3xl font-bold text-gray-100">{title}</h2>
    <p className="text-gray-400 mt-2 text-lg">{description}</p>
  </div>
);

const InputField = ({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  fullWidth = false 
}: { 
  label: string; 
  value: string | number; 
  onChange: (val: string) => void; 
  type?: string; 
  fullWidth?: boolean;
}) => (
  <div className={fullWidth ? 'w-full' : ''}>
    <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2.5 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
    />
  </div>
);

const SliderField = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 1
}: {
  label: string;
  value: number;
  onChange: (val: string) => void;
  min?: number;
  max?: number;
  step?: number;
}) => (
  <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded">{value.toFixed(2)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
    />
  </div>
);