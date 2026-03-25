import React from 'react';
import { Cpu } from 'lucide-react';
import { Mode } from '../types';
import { motion } from 'framer-motion';

interface HeaderProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentMode, onModeChange }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3 select-none">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Cpu size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">AI2A</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold mt-1">Architect</p>
          </div>
        </div>

        {/* Animated Toggle Switch */}
        <div className="flex p-1 bg-zinc-900/50 border border-zinc-800/50 rounded-full backdrop-blur-md relative">
          <ModeButton 
            isActive={currentMode === Mode.AGENT_ARCHITECT} 
            onClick={() => onModeChange(Mode.AGENT_ARCHITECT)} 
            label="Agent Master" 
          />
          <ModeButton 
            isActive={currentMode === Mode.SKILL_ARCHITECT} 
            onClick={() => onModeChange(Mode.SKILL_ARCHITECT)} 
            label="Skill Vibe" 
          />
        </div>
      </div>
    </header>
  );
};

const ModeButton: React.FC<{ isActive: boolean; onClick: () => void; label: string }> = ({ isActive, onClick, label }) => (
  <button
    onClick={onClick}
    className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 z-10 ${
      isActive ? 'text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'
    }`}
  >
    {isActive && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 bg-zinc-100 rounded-full shadow-sm -z-10"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
    {label}
  </button>
);