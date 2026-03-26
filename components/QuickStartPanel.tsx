import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, Users, Building2, Cpu, ChevronRight, Sparkles, Zap, BrainCircuit, Code, Search } from 'lucide-react';
import { AOS_DEPARTMENT_PRESETS, PROMPT_ARCHITECT_PRESETS } from '../constants';
import { Mode } from '../types';

interface QuickStartPanelProps {
  onSelectPreset: (prompt: string) => void;
  onSwitchMode: (mode: Mode) => void;
  currentMode: Mode;
}

const PRESET_ICONS: Record<string, React.FC<{ size?: number; strokeWidth?: number }>> = {
  'preset_strategy': TrendingUp,
  'preset_finance': DollarSign,
  'preset_crm': Users,
  'preset_full_aos': Building2,
  'preset_logic': BrainCircuit,
  'preset_code': Code,
  'preset_rag': Search,
};

const PRESET_COLORS: Record<string, string> = {
  'preset_strategy': 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  'preset_finance': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'preset_crm': 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  'preset_full_aos': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'preset_logic': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'preset_code': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  'preset_rag': 'text-teal-400 bg-teal-500/10 border-teal-500/20',
};

const AGENT_QUICK_PROMPTS = [
  { label: 'Financial Controller', prompt: 'Crie um Financial Controller Agent para uma startup SaaS com Reconciliation Specialist, Consolidation Engine e Variance Analyst como sub-agentes. Configure guardrails de máxima segurança com escalação obrigatória para transações acima de $10k.' },
  { label: 'CS Guardian', prompt: 'Crie um CS Guardian Agent especializado em detecção de churn silencioso com Churn Predictor, Sentiment Analyst e Health Monitor. Configure alertas proativos e planos de retenção automatizados.' },
  { label: 'Growth Strategist', prompt: 'Crie um Growth Strategist Agent com Market Analyst, Pricing Optimizer e Campaign Architect. Foco em sinais de intenção em tempo real e briefs de campanha prontos para execução.' },
  { label: 'Fiscal Compliance', prompt: 'Crie um Fiscal Compliance Agent com Tax Calculator, Audit Logger e Regulatory Monitor. Configure conformidade fiscal automática com trilha de auditoria imutável.' },
];

export const QuickStartPanel: React.FC<QuickStartPanelProps> = ({
  onSelectPreset,
  onSwitchMode,
  currentMode,
}) => {
  const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);

  const isAOSMode = currentMode === Mode.AOS_BUILDER;

  const handlePreset = (preset: typeof AOS_DEPARTMENT_PRESETS[0] | typeof PROMPT_ARCHITECT_PRESETS[0], mode: Mode) => {
    if (currentMode !== mode) {
      onSwitchMode(mode);
    }
    onSelectPreset(preset.prompt);
  };

  const handleAgentQuick = (prompt: string) => {
    if (currentMode !== Mode.AGENT_ARCHITECT) {
      onSwitchMode(Mode.AGENT_ARCHITECT);
    }
    onSelectPreset(prompt);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="w-full mb-6"
    >
      {/* AOS Department Presets */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={12} className="text-zinc-500" />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            AOS Quick-Start
          </span>
          {!isAOSMode && (
            <span className="text-[8px] text-zinc-600 font-medium">(switches to AOS Builder)</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {AOS_DEPARTMENT_PRESETS.map(preset => {
            const Icon = PRESET_ICONS[preset.id] || Building2;
            const colorClass = PRESET_COLORS[preset.id] || 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
            const isHovered = hoveredPreset === preset.id;
            const isFull = preset.id === 'preset_full_aos';

            return (
              <motion.button
                key={preset.id}
                onClick={() => handlePreset(preset, Mode.AOS_BUILDER)}
                onMouseEnter={() => setHoveredPreset(preset.id)}
                onMouseLeave={() => setHoveredPreset(null)}
                whileTap={{ scale: 0.97 }}
                className={`group relative text-left p-3 rounded-xl border transition-all duration-200 ${
                  isFull
                    ? 'col-span-2 bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/40'
                    : `${colorClass} hover:brightness-125`
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <Icon size={14} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-zinc-200 truncate">{preset.label}</span>
                      {isFull && (
                        <span className="flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                          <Sparkles size={8} />
                          Full
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -4 }}
                        className="flex-shrink-0 self-center"
                      >
                        <ChevronRight size={14} className="text-zinc-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Prompt Architect Presets */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <BrainCircuit size={12} className="text-zinc-500" />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Prompt Architecture
          </span>
          {currentMode !== Mode.PROMPT_ARCHITECT && (
            <span className="text-[8px] text-zinc-600 font-medium">(switches to Prompt Architect)</span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2">
          {PROMPT_ARCHITECT_PRESETS.map(preset => {
            const Icon = PRESET_ICONS[preset.id] || BrainCircuit;
            const colorClass = PRESET_COLORS[preset.id] || 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
            const isHovered = hoveredPreset === preset.id;

            return (
              <motion.button
                key={preset.id}
                onClick={() => handlePreset(preset, Mode.PROMPT_ARCHITECT)}
                onMouseEnter={() => setHoveredPreset(preset.id)}
                onMouseLeave={() => setHoveredPreset(null)}
                whileTap={{ scale: 0.98 }}
                className={`group relative text-left p-3 rounded-xl border transition-all duration-200 ${colorClass} hover:brightness-125`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <Icon size={14} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-zinc-200 truncate">{preset.label}</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -4 }}
                        className="flex-shrink-0 self-center"
                      >
                        <ChevronRight size={14} className="text-zinc-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Agent Quick-Create */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Cpu size={12} className="text-zinc-500" />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Agent Quick-Create
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {AGENT_QUICK_PROMPTS.map((item, i) => (
            <button
              key={i}
              onClick={() => handleAgentQuick(item.prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-800/60 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all text-[10px] font-medium"
            >
              <Zap size={10} />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
