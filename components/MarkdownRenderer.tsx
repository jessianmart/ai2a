import React, { memo, useState } from 'react';
import { Check, Copy } from 'lucide-react';

// Sub-component for Code Blocks to handle "Copy" state independently
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-zinc-800/80 bg-black/40 shadow-sm group">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800/80">
         <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider">{language || 'text'}</span>
         
         <div className="flex items-center gap-3">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 hover:text-zinc-200 transition-colors uppercase tracking-wider"
              aria-label="Copy code"
            >
               {isCopied ? (
                 <>
                   <Check size={12} className="text-emerald-500" />
                   <span className="text-emerald-500">Copied</span>
                 </>
               ) : (
                 <>
                   <Copy size={12} />
                   <span>Copy</span>
                 </>
               )}
            </button>
            <div className="flex gap-1.5 opacity-50 pl-2 border-l border-zinc-800">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
            </div>
         </div>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-zinc-300 scrollbar-hide">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Memoize the renderer. If the content string hasn't changed, do not re-render.
export const MarkdownRenderer: React.FC<{ content: string }> = memo(({ content }) => {
  // Robust cleanup: 
  // Replace the JSON options block with an empty string to preserve text before AND after it.
  // Using global flag 'g' to remove all occurrences if AI hallucinates multiple blocks.
  const optionsRegex = /:::\{"options":\s*\[.*?\]\}:::/gs;
  const cleanContent = content.replace(optionsRegex, '').trim(); 

  // Split content by code blocks to isolate them
  const parts = cleanContent.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4 text-zinc-300 leading-relaxed font-light">
      {parts.map((part, index) => {
        // Handle Code Block
        if (part.startsWith('```')) {
          const match = part.match(/^```(\w+)?\n([\s\S]*?)```$/);
          const language = match ? match[1] : '';
          const code = match ? match[2] : part.slice(3, -3).trim();

          return <CodeBlock key={index} language={language} code={code} />;
        } else {
          // Handle standard markdown text (Headers, Lists, Paragraphs)
          const lines = part.split('\n');
          const renderedLines: React.ReactNode[] = [];
          
          let listItems: React.ReactNode[] = [];
          let listType: 'ul' | 'ol' = 'ul';

          const flushList = (keyPrefix: string) => {
            if (listItems.length > 0) {
              if (listType === 'ul') {
                renderedLines.push(
                  <ul key={`${keyPrefix}-ul`} className="list-none space-y-2 mb-4 ml-1">
                    {listItems}
                  </ul>
                );
              } else {
                 renderedLines.push(
                  <ol key={`${keyPrefix}-ol`} className="list-decimal space-y-2 mb-4 ml-5 text-zinc-300 marker:text-zinc-500">
                    {listItems}
                  </ol>
                );
              }
              listItems = [];
            }
          };

          lines.forEach((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) {
              flushList(`${index}-${i}`);
              return;
            }

            // Headers
            if (line.startsWith('### ')) {
              flushList(`${index}-${i}`);
              renderedLines.push(<h3 key={`${index}-${i}`} className="text-lg font-semibold text-zinc-100 mt-6 mb-2 tracking-tight">{renderInlineStyles(line.slice(4))}</h3>);
            } else if (line.startsWith('## ')) {
              flushList(`${index}-${i}`);
              renderedLines.push(<h2 key={`${index}-${i}`} className="text-xl font-bold text-white mt-8 mb-4 pb-2 border-b border-zinc-800">{renderInlineStyles(line.slice(3))}</h2>);
            } else if (line.startsWith('# ')) {
              flushList(`${index}-${i}`);
              renderedLines.push(<h1 key={`${index}-${i}`} className="text-3xl font-bold text-white mt-8 mb-6 tracking-tighter">{renderInlineStyles(line.slice(2))}</h1>);
            } 
            // Unordered Lists (Bulleted)
            else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              if (listItems.length > 0 && listType === 'ol') flushList(`${index}-${i}`);
              listType = 'ul';
              listItems.push(
                <li key={`${index}-${i}`} className="flex gap-3 text-zinc-300">
                    <span className="block w-1.5 h-1.5 mt-2 rounded-full bg-zinc-600 flex-shrink-0" />
                    <span className="flex-1">{renderInlineStyles(trimmed.slice(2))}</span>
                </li>
              );
            }
            // Ordered Lists (1. )
            else if (/^\d+\.\s/.test(trimmed)) {
               if (listItems.length > 0 && listType === 'ul') flushList(`${index}-${i}`);
               listType = 'ol';
               // Extract text after "1. "
               const text = trimmed.replace(/^\d+\.\s/, '');
               listItems.push(
                 <li key={`${index}-${i}`} className="pl-1">
                   <span>{renderInlineStyles(text)}</span>
                 </li>
               );
            }
            // Paragraphs
            else {
              flushList(`${index}-${i}`);
              renderedLines.push(<p key={`${index}-${i}`} className="mb-2 text-zinc-300">{renderInlineStyles(line)}</p>);
            }
          });

          flushList(`${index}-end`);

          return <div key={index}>{renderedLines}</div>;
        }
      })}
    </div>
  );
});

const renderInlineStyles = (text: string): React.ReactNode[] => {
  // Parser for **bold**, `code`, and *italic*
  const regex = /(\*\*.*?\*\*|`.*?`|\*[^*]+\*)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-zinc-800/80 border border-zinc-700/50 px-1.5 py-0.5 rounded text-zinc-200 font-mono text-[13px]">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
       return <em key={i} className="text-zinc-200">{part.slice(1, -1)}</em>;
    }
    return part;
  });
};