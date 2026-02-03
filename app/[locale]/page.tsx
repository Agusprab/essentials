'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import ChatMessage from '../components/ChatMessage';
import TypingIndicator from '../components/TypingIndicator';
import InputDataDiri from '../components/InputDataDiri';
import { useChat } from '../../hooks/useChat';

const Header = dynamic(() => import('../components/Header'), { ssr: false });
const InputBar = dynamic(() => import('../components/InputBar'), { ssr: false });

export default function Home() {
  const params = useParams();
  const locale = params.locale as string;
  const { i18n } = useTranslation();

  useEffect(() => {
    if (locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  useEffect(() => {
    const submittedTimestamp = localStorage.getItem('userDataSubmitted');
    if (submittedTimestamp) {
      const timestamp = parseInt(submittedTimestamp, 10);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000; // 1 hari dalam ms
      if (now - timestamp < oneDay) {
        setIsDataSubmitted(true);
      } else {
        // Expired, remove from localStorage
        localStorage.removeItem('userDataSubmitted');
      }
    }
  }, []);

  const handleDataSubmitSuccess = () => {
    setIsDataSubmitted(true);
  };

  const {
    messages,
    inputValue,
    setInputValue,
    isTyping,
    messagesEndRef,
    handleOptionSelect,
    handleSendInput
  } = useChat();

  const isOffline = process.env.NEXT_PUBLIC_STATUS_APP === 'OFFLINE';

  return (
    <div className="relative h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 overflow-hidden">
      {/* Background Content with Blur if not submitted */}
      <div className={`flex flex-col h-full transition-all duration-700 ${!isDataSubmitted ? 'blur-md grayscale-[20%] scale-[1.02] pointer-events-none' : ''}`}>
        <Header />

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 pt-3 sm:pt-5 w-full mx-auto">
          <div className="bg-[#FFFFFF] rounded-t-2xl shadow-md pt-10 sm:pt-4 pb-6 sm:pb-10 mt-2 sm:mt-4 w-full mx-auto min-h-full overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-1 sm:space-y-2 pt-2 sm:pt-4 px-2 sm:px-0">
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
          </div>
        </main>

        {!isOffline && (
          <InputBar
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSubmit={(val) => {
              handleSendInput(val);
              setInputValue('');
            }}
          />
        )}
      </div>

      {/* Input Form Overlay */}
      {!isDataSubmitted && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/30 backdrop-blur-[2px]">
          <InputDataDiri onSubmitSuccess={handleDataSubmitSuccess} />
        </div>
      )}
    </div>
  );
}
