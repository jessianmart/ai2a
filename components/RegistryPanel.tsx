import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2, Cpu, Zap, Wrench, Database, Network, Building2, LayoutDashboard, ChevronDown, ChevronRight } from 'lucide-react';
import { RegistryState } from '../types';
import {
  removeAgent, removeSkill, removeTool, removeMemory, removePipeline,
  removeOrganization, removeDepartment, clearRegistry,
} from '../services/registry';
import {
  exportAgentMd, exportSkillMd, exportToolMd, exportMemoryMd,
  exportOrganizationMd, exportDepartmentMd, exportFullSystem, downloadFile,
} from '../services/exportEngine';

interface RegistryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  registry: RegistryState;
  onRegistryChange: (state: RegistryState) => void;
}

type Section = 'organizations' | 'departments' | 'agents' | 'skills' | 'tools' | 'memories' | 'pipelines';

const SECTIONS: { key: Section; label: string; icon: React.FC<{ size?: number }> }[] = [
  { key: 'organizations', label: 'Organizations', icon: Building2 },
  { key: 'departments', label: 'Departments', icon: LayoutDashboard },
  { key: 'agents', label: 'Agents', icon: Cpu },
  { key: 'skills', label: 'Skills', icon: Zap },
  { key: 'tools', label: 'Tools', icon: Wrench },
  { key: 'memories', label: 'Memories', icon: Database },
  { key: 'pipelines', label: 'Pipelines', icon: Network },
];

export const RegistryPanel: React.FC<RegistryPanelProps> = ({ isOpen, onClose, registry, onRegistryChange }) => {
  const [expanded, setExpanded] = useState<Section | null>('organizations');

  const totalItems = registry.agents.length + registry.skills.length + registry.tools.length +
    registry.memories.length + registry.pipelines.length +
    (registry.organizations?.length ?? 0) + (registry.departments?.length ?? 0);

  const handleRemove = (section: Section, id: string) => {
    let newState: RegistryState;
    switch (section) {
      case 'organizations': newState = removeOrganization(id); break;
      case 'departments': newState = removeDepartment(id); break;
      case 'agents': newState = removeAgent(id); break;
      case 'skills': newState = removeSkill(id); break;
      case 'tools': newState = removeTool(id); break;
      case 'memories': newState = removeMemory(id); break;
      case 'pipelines': newState = removePipeline(id); break;
    }
    onRegistryChange(newState);
  };

  const handleExportItem = (section: Section, item: any) => {
    let content: string;
    let filename: string;
    switch (section) {
      case 'organizations': content = exportOrganizationMd(item); filename = `${item.name || item.id}_org.md`; break;
      case 'departments': content = exportDepartmentMd(item); filename = `${item.name || item.id}_dept.md`; break;
      case 'agents': content = exportAgentMd(item); filename = `${item.name || item.id}_agent.md`; break;
      case 'skills': content = exportSkillMd(item); filename = `${item.name || item.id}_skill.md`; break;
      case 'tools': content = exportToolMd(item); filename = `${item.name || item.id}_tool.md`; break;
      case 'memories': content = exportMemoryMd(item); filename = `${item.name || item.id}_memory.md`; break;
      default: return;
    }
    downloadFile(content, filename.replace(/\s+/g, '_').toLowerCase());
  };

  const handleExportAll = () => {
    const content = exportFullSystem(registry);
    downloadFile(content, `ai2a_system_export_${Date.now()}.md`);
  };

  const handleClearAll = () => {
    const newState = clearRegistry();
    onRegistryChange(newState);
  };

  const getItems = (section: Section): { id: string; name: string; _raw: any }[] => {
    const items = (registry[section] as any[] | undefined) ?? [];
    return items.map((item: any) => ({ id: item.id, name: item.name || item.id, _raw: item }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-white">Registry</h2>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mt-0.5">
                  {totalItems} items registered
                </p>
              </div>
              <div className="flex items-center gap-2">
                {totalItems > 0 && (
                  <>
                    <button
                      onClick={handleExportAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-950 text-[10px] font-bold uppercase tracking-wider hover:bg-white transition-colors"
                    >
                      <Download size={12} />
                      Export All
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 text-red-400 border border-zinc-800 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                    >
                      <Trash2 size={12} />
                      Clear
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {totalItems === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                  <Database size={40} strokeWidth={1} className="mb-4" />
                  <p className="text-sm text-zinc-500">Registry is empty</p>
                  <p className="text-xs text-zinc-600 mt-1">Create agents, skills or tools to see them here</p>
                </div>
              ) : (
                SECTIONS.map(({ key, label, icon: Icon }) => {
                  const items = getItems(key);
                  if (items.length === 0) return null;
                  const isExpanded = expanded === key;

                  return (
                    <div key={key} className="border border-zinc-800/50 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : key)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={14} />
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">{label}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">({items.length})</span>
                        </div>
                        {isExpanded ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 py-2 space-y-1">
                              {items.map(item => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/30 hover:bg-zinc-800/50 group transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-200 truncate">{item.name}</p>
                                    <p className="text-[10px] font-mono text-zinc-600 truncate">{item.id}</p>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleExportItem(key, item._raw)}
                                      className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
                                      title="Export .md"
                                    >
                                      <Download size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleRemove(key, item.id)}
                                      className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                      title="Remove"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
