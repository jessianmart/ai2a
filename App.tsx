import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Boxes, ArrowUp, RefreshCw, Mic, StopCircle, Sparkles, Plus, Check, Shield, Wrench, Database, Network, Save, Building2, BrainCircuit } from 'lucide-react';

import { Message, Mode, RegistryState } from './types';
import { MODE_CONFIG } from './constants';
import { sendMessageStream, resetChat, extractJsonFromResponse } from './services/geminiService';
import { getRegistry, parseAndSave } from './services/registry';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { Header } from './components/Header';
import { AgentVisualizer } from './components/AgentVisualizer';
import { RegistryPanel } from './components/RegistryPanel';
import { QuickStartPanel } from './components/QuickStartPanel';

// Speech Recognition
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState<Mode>(Mode.AGENT_ARCHITECT);
  const [registry, setRegistry] = useState<RegistryState>(getRegistry());
  const [showRegistry, setShowRegistry] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Microphone
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Speech Recognition init
  useEffect(() => {
    const windowObj = window as unknown as IWindow;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => {
            const space = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
            return prev + space + finalTranscript;
          });
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Auto-scroll
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  useEffect(() => {
    if (isStreaming) scrollToBottom('auto');
  }, [messages, isStreaming, scrollToBottom]);

  // Auto-save JSON configs from model responses to registry
  const trySaveToRegistry = useCallback((fullText: string) => {
    const json = extractJsonFromResponse(fullText);
    if (!json) return;
    const result = parseAndSave(json);
    if (result) {
      setRegistry(getRegistry());
      setSavedNotice(`${result.type} saved to registry`);
      setTimeout(() => setSavedNotice(null), 3000);
    }
  }, []);

  const handleSend = async (manualText?: string) => {
    const textToSend = manualText || input;
    if (!textToSend.trim() || isThinking || isStreaming) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    requestAnimationFrame(() => scrollToBottom('smooth'));

    const modelMsgId = (Date.now() + 1).toString();
    const modelMsg: Message = {
      id: modelMsgId,
      role: 'model',
      content: '',
      timestamp: Date.now() + 1
    };

    try {
      const fullText = await sendMessageStream(userMsg.content, mode, (chunk) => {
        setIsThinking(prev => {
          if (prev) {
            setMessages(curr => [...curr, modelMsg]);
            return false;
          }
          return prev;
        });
        setIsStreaming(true);
        setMessages(prev => prev.map(msg =>
          msg.id === modelMsgId
            ? { ...msg, content: msg.content + chunk }
            : msg
        ));
      });

      // Try to extract and save config from the completed response
      trySaveToRegistry(fullText);
    } catch (error) {
      console.error(error);
    } finally {
      setIsThinking(false);
      setIsStreaming(false);
      setTimeout(() => scrollToBottom('smooth'), 100);
    }
  };

  const handleModeSwitch = (newMode: Mode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setMessages([]);
    resetChat();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Extract interactive options from message
  const getOptionsFromMessage = (content: string): string[] => {
    const match = content.match(/:::\{"options":\s*(\[.*?\])\}:::/s);
    if (match?.[1]) {
      try { return JSON.parse(match[1]); } catch { return []; }
    }
    return [];
  };

  const toggleOption = (option: string) => {
    setInput(prev => {
      const parts = prev.split(',').map(p => p.trim()).filter(p => p);
      if (parts.includes(option)) {
        return parts.filter(p => p !== option).join(', ');
      }
      return parts.length > 0 ? `${parts.join(', ')}, ${option}` : option;
    });
  };

  const registryCount = registry.agents.length + registry.skills.length + registry.tools.length +
    registry.memories.length + registry.pipelines.length +
    (registry.organizations?.length ?? 0) + (registry.departments?.length ?? 0);

  const handlePresetSelect = (prompt: string) => {
    setInput(prompt);
    // Auto-send after a short delay so the mode switch can settle
    setTimeout(() => handleSend(prompt), 50);
  };

  const modeConfig = MODE_CONFIG[mode];

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white flex flex-col overflow-hidden">
      <Header
        currentMode={mode}
        onModeChange={handleModeSwitch}
        registryCount={registryCount}
        onToggleRegistry={() => setShowRegistry(v => !v)}
      />

      {/* Registry Panel */}
      <RegistryPanel
        isOpen={showRegistry}
        onClose={() => setShowRegistry(false)}
        registry={registry}
        onRegistryChange={setRegistry}
      />

      {/* Saved Notice Toast */}
      <AnimatePresence>
        {savedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-md"
          >
            <Save size={14} />
            {savedNotice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        ref={scrollViewportRef}
        className="flex-1 overflow-y-auto scroll-smooth w-full relative"
      >
        <div className="max-w-4xl mx-auto pt-24 pb-32 px-4 flex flex-col gap-6 min-h-full">
          <AgentVisualizer mode={mode} isThinking={isThinking} />

          <AnimatePresence mode="wait">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col gap-6"
              >
                {/* Mode header */}
                <div className="flex flex-col items-center text-center opacity-50 pointer-events-none select-none pt-4 pb-2">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mb-4 shadow-xl">
                    {mode === Mode.AGENT_ARCHITECT && <Terminal size={24} strokeWidth={1.5} />}
                    {mode === Mode.SKILL_ARCHITECT && <Boxes size={24} strokeWidth={1.5} />}
                    {mode === Mode.TOOL_ARCHITECT && <Wrench size={24} strokeWidth={1.5} />}
                    {mode === Mode.MEMORY_ARCHITECT && <Database size={24} strokeWidth={1.5} />}
                    {mode === Mode.ORCHESTRATOR && <Shield size={24} strokeWidth={1.5} />}
                    {mode === Mode.MAS_PIPELINE && <Network size={24} strokeWidth={1.5} />}
                    {mode === Mode.AOS_BUILDER && <Building2 size={24} strokeWidth={1.5} />}
                    {mode === Mode.PROMPT_ARCHITECT && <BrainCircuit size={24} strokeWidth={1.5} />}
                  </div>
                  <h2 className="text-lg font-medium tracking-tight text-zinc-300">{modeConfig.label}</h2>
                  <p className="max-w-sm text-zinc-600 text-xs mt-1">{modeConfig.description}</p>
                </div>

                {/* Quick-start panel */}
                <QuickStartPanel
                  onSelectPreset={handlePresetSelect}
                  onSwitchMode={handleModeSwitch}
                  currentMode={mode}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {messages.map((msg, index) => {
            const isLastMessage = index === messages.length - 1;
            const options = (msg.role === 'model' && isLastMessage && !isStreaming && !isThinking)
              ? getOptionsFromMessage(msg.content)
              : [];

            return (
              <div
                key={msg.id}
                className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-[1.2rem] px-6 py-4 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-zinc-100 text-zinc-900 ml-12'
                      : 'bg-zinc-900/40 border border-zinc-800/50 mr-4'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                </div>

                {options.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap gap-2 mt-3 ml-1 max-w-[85%]"
                  >
                    {options.map((option, i) => {
                      const parts = input.split(',').map(p => p.trim());
                      const isSelected = parts.includes(option);

                      return (
                        <button
                          key={i}
                          onClick={() => toggleOption(option)}
                          className={`group flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full border transition-all active:scale-95 shadow-sm ${
                            isSelected
                              ? 'bg-zinc-100 text-zinc-950 border-zinc-100 hover:bg-zinc-200'
                              : 'bg-zinc-800/50 text-zinc-300 border-zinc-700/50 hover:bg-zinc-700 hover:text-white hover:border-zinc-600'
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                          {!isSelected && <Plus size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" />}
                          {option}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}

          {/* Thinking State */}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start pl-2"
            >
              <div className="flex items-center gap-2 text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800/50">
                <Sparkles size={14} className="animate-pulse" />
                <span className="text-[10px] font-medium tracking-wider uppercase">Processing</span>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} className="h-1" />
        </div>
      </main>

      {/* Footer Input */}
      <footer className="fixed bottom-0 left-0 w-full pb-8 pt-4 px-4 z-40 pointer-events-none flex justify-center bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent">
        <div className="pointer-events-auto w-full max-w-3xl">
          {/* Mode indicator pill */}
          <div className="flex justify-center mb-2">
            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-semibold px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800/30">
              {modeConfig.label}
            </span>
          </div>

          <div className="relative flex items-center gap-2 bg-zinc-900 rounded-full p-1.5 shadow-2xl shadow-black/50 border border-zinc-800/80 ring-1 ring-white/5 transition-all focus-within:border-zinc-700 focus-within:ring-white/10 group">
            {/* Mic Button */}
            <button
              onClick={toggleListening}
              className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                isListening
                  ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                  : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
              }`}
            >
              <AnimatePresence mode="wait">
                {isListening ? (
                  <motion.div key="stop" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <div className="relative">
                      <motion.span
                        className="absolute -inset-2 rounded-full bg-red-500/20"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <StopCircle size={18} fill="currentColor" strokeWidth={0} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="mic" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Mic size={18} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : `Describe your ${modeConfig.shortLabel.toLowerCase()}...`}
              className="flex-1 bg-transparent text-zinc-200 placeholder-zinc-500 text-[15px] px-2 focus:outline-none font-normal"
              disabled={isThinking || isStreaming}
              autoComplete="off"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSend()}
              disabled={(isThinking || !input.trim()) && !isListening}
              className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                input.trim() && !isThinking && !isStreaming
                  ? 'bg-zinc-100 text-zinc-950 hover:scale-105 active:scale-95 shadow-md shadow-zinc-500/10'
                  : 'bg-transparent text-zinc-600'
              }`}
            >
              {isThinking || isStreaming ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <ArrowUp size={20} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
