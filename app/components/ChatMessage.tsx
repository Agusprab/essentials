import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

type Message = {
  id: string;
  role: 'assistant' | 'user';
  content: string | React.ReactNode;
  type?: 'text' | 'options' | 'input' | 'result';
};

interface ChatMessageProps {
  message: Message;
  onOptionSelect: (option: string) => void;
}

export default function ChatMessage({ message, onOptionSelect }: ChatMessageProps) {
  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
              {message.content.replace(/<br>/g, '\n').replace(/<b>/g, '**').replace(/<\/b>/g, '**').replace(/<i>/g, '*').replace(/<\/i>/g, '*')}
            </ReactMarkdown>
          ) : (
            message.content
          )}
        </div>

        {message.type === 'options' && (
          <div className="mt-4 grid grid-cols-1 gap-2">
            {[
              'Audit Kualitas Website',
              'Performance SEO Web Saya',
              'Performance Brand di AI Search'
            ].map((opt) => (
              <button
                key={opt}
                onClick={() => onOptionSelect(opt)}
                className="text-left px-4 py-2.5 text-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all active:scale-[0.98]"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}