'use client';

import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';
import InputBar from './components/InputBar';

type Message = {
  id: string;
  role: 'assistant' | 'user';
  content: string | React.ReactNode;
  type?: 'text' | 'options' | 'input' | 'result';
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Initial sequence
    const init = async () => {
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 1000));
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'Halo! Saya asisten AI Anda. Saya bisa membantu Anda menganalisis performa dan kualitas website Anda.',
          type: 'text'
        }
      ]);
      
      await new Promise(r => setTimeout(r, 800));
      setMessages(prev => [...prev, {
        id: '2',
        role: 'assistant',
        content: 'Silakan masukkan URL website yang ingin Anda analisis.',
        type: 'input'
      }]);
      setIsTyping(false);
    };
    init();
  }, []);

  const handleSendUrl = (url: string) => {
    if (!url.trim()) return;
    
    const validatedUrl = url.startsWith('http') ? url : `https://${url}`;
    setCurrentUrl(validatedUrl);

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: validatedUrl, type: 'text' }
    ]);

    setIsTyping(true);
    
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Bagus! Data apa yang ingin Anda lihat untuk website ini?',
          type: 'options'
        }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleOptionSelect = (option: string) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: option, type: 'text' }
    ]);

    setIsTyping(true);

    setTimeout(() => {
      if (option === 'Performance SEO Web Saya') {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Untuk analisis SEO yang lebih akurat, apa keyword utama yang ingin Anda targetkan?',
            type: 'input'
          }
        ]);
      } else if (option === 'Performance Brand di AI Search') {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Siapa nama brand atau produk yang ingin kami analisis di AI Search?',
            type: 'input'
          }
        ]);
      } else {
        // Audit Kualitas Website
        showResult(option);
      }
      setIsTyping(false);
    }, 1000);
  };

  const showResult = (option: string, extraInfo?: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: (
            <div className="space-y-4">
              <p>Menganalisis <strong>{option}</strong> untuk {currentUrl}{extraInfo ? ` dengan fokus "${extraInfo}"` : ''}...</p>
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Analysis Report</span>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    COMPLETED
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800">Skor Keseluruhan: 92/100</h4>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-[92%] rounded-full" />
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Website Anda menunjukkan performa yang sangat baik. {option} pada {currentUrl} telah dioptimalkan dengan standar industri terbaru.
                  </p>
                </div>
                <div className="pt-2 flex gap-2">
                  <button className="flex-1 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                    Lihat Detail
                  </button>
                  <button className="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ),
          type: 'result'
        }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSendInput = (val: string) => {
    if (!val.trim()) return;

    // Check if we are waiting for URL or for extra info
    if (!currentUrl) {
      handleSendUrl(val);
    } else {
      // We already have a URL, so this must be extra info (keyword or brand)
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'user', content: val, type: 'text' }
      ]);
      
      const lastBotMsg = [...messages].reverse().find(m => m.role === 'assistant');
      const context = lastBotMsg?.content?.toString() || '';
      
      let option = '';
      if (context.includes('SEO')) option = 'Performance SEO Web Saya';
      else if (context.includes('brand')) option = 'Performance Brand di AI Search';
      
      showResult(option, val);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      <Header />

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-8 mt-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onOptionSelect={handleOptionSelect}
            />
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <InputBar
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSubmit={(val) => {
          handleSendInput(val);
          setInputValue('');
        }}
      />
    </div>
  );
}
