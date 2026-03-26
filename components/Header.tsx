import React from 'react';
import { Cpu, Database, Building2 } from 'lucide-react';
import { Mode } from '../types';
import { MODE_CONFIG } from '../constants';
import { motion } from 'framer-motion';

interface HeaderProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
  registryCount: number;
  onToggleRegistry: () => void;
}

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

export const Header: React.FC<HeaderProps> = ({ currentMode, onModeChange, registryCount, onToggleRegistry }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 select-none flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Cpu size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">AI2A</h1>
            <p className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 font-semibold mt-0.5">Agent Factory</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-0.5 bg-zinc-900/50 border border-zinc-800/50 rounded-full backdrop-blur-md overflow-x-auto scrollbar-hide">
          {MODES.map(mode => {
            const config = MODE_CONFIG[mode];
            const isActive = currentMode === mode;
            return (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                className={`relative px-3 py-1.5 text-[10px] font-semibold rounded-full transition-colors duration-200 z-10 whitespace-nowrap ${
                  isActive ? 'text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title={config.description}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-zinc-100 rounded-full shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="flex items-center gap-1">
                  {mode === Mode.AOS_BUILDER && <Building2 size={9} strokeWidth={2} />}
                  {config.shortLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Registry Toggle */}
        <button
          onClick={onToggleRegistry}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-all text-zinc-400 hover:text-zinc-200 flex-shrink-0"
        >
          <Database size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Registry</span>
          {registryCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-100 text-zinc-950 text-[10px] font-bold">
              {registryCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
