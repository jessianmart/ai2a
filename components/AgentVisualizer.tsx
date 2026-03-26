import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Wrench, Database, Shield, Network, Building2, BrainCircuit } from 'lucide-react';
import { Mode } from '../types';
import { MODE_CONFIG } from '../constants';

interface AgentVisualizerProps {
  mode: Mode;
  isThinking: boolean;
}

const MODE_ICONS: Record<Mode, React.FC<{ size?: number; strokeWidth?: number }>> = {
  [Mode.AGENT_ARCHITECT]:  Cpu,
  [Mode.SKILL_ARCHITECT]:  Zap,
  [Mode.TOOL_ARCHITECT]:   Wrench,
  [Mode.MEMORY_ARCHITECT]: Database,
  [Mode.ORCHESTRATOR]:     Shield,
  [Mode.MAS_PIPELINE]:     Network,
  [Mode.AOS_BUILDER]:      Building2,
  [Mode.PROMPT_ARCHITECT]: BrainCircuit,
};

const MODES = [
  Mode.AGENT_ARCHITECT,
  Mode.SKILL_ARCHITECT,
  Mode.TOOL_ARCHITECT,
  Mode.MEMORY_ARCHITECT,
  Mode.ORCHESTRATOR,
  Mode.MAS_PIPELINE,
  Mode.AOS_BUILDER,
  Mode.PROMPT_ARCHITECT,
];

export const AgentVisualizer: React.FC<AgentVisualizerProps> = ({ mode, isThinking }) => {
  return (
    <div className="flex items-center gap-3 mb-6 flex-wrap">
      <motion.div
        animate={{
          scale: isThinking ? [1, 1.03, 1] : 1,
          borderColor: isThinking ? ['rgba(161,161,170,0.2)', 'rgba(161,161,170,0.5)', 'rgba(161,161,170,0.2)'] : 'rgba(161,161,170,0.1)'
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="px-3 py-1.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md flex items-center gap-2"
      >
        <div className={`w-1.5 h-1.5 rounded-full ${isThinking ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500/40'}`} />
        <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-zinc-500">
          {isThinking ? 'Processing' : 'Ready'}
        </span>
      </motion.div>

      <div className="flex gap-1.5">
        {MODES.map(m => {
          const Icon = MODE_ICONS[m];
          const config = MODE_CONFIG[m];
          const active = m === mode;
          return (
            <div
              key={m}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all ${
                active
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-100 shadow-lg shadow-white/5'
                  : 'bg-transparent text-zinc-600 border-zinc-800/30'
              }`}
              title={config.description}
            >
              <Icon size={10} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[8px] font-bold uppercase tracking-wider">{config.shortLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
