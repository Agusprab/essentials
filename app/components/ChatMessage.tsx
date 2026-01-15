import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Message } from '../../types/chat';

interface ChatMessageProps {
  message: Message;
  onOptionSelect: (option: string) => void;
}

export default function ChatMessage({ message, onOptionSelect }: ChatMessageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay sedikit untuk efek animasi muncul
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          message.role === 'user'
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
        }`}
      >
        <div className="text-sm md:text-base leading-relaxed">
          {typeof message.content === 'string' ? (
            <ReactMarkdown
              remarkPlugins={[remarkBreaks]}
              components={{
                p: ({ children }) => <p className="mb-2">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{children}</a>,
              }}
            >
              {message.content.replace(/<br>/g, '\n').replace(/<b>/g, '**').replace(/<\/b>/g, '**').replace(/<i>/g, '*').replace(/<\/i>/g, '*').replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '[$2]($1)')}
            </ReactMarkdown>
          ) : (
            message.content
          )}
        </div>

        {message.type === 'options' && (
          <div className="mt-4 grid grid-cols-1 gap-2">
            {(message.options || []).map((opt: any, index: number) => {
              const key = typeof opt === 'string' ? opt : opt.key;
              const label = typeof opt === 'string' ? opt : opt.label;
              return (
                <button
                  key={key || index}
                  onClick={() => onOptionSelect(key)}
                  className="text-left px-4 py-2.5 text-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all active:scale-[0.98]"
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}