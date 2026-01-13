'use client';

import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';
import InputBar from './components/InputBar';
import { useChat } from '../hooks/useChat';

export default function Home() {
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
    <div className="flex flex-col h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      <Header />

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 pt-3 sm:pt-5 w-full mx-auto">
       <div className="bg-[#FFFFFF] rounded-t-2xl shadow-md pt-2 sm:pt-4 pb-6 sm:pb-10 mt-2 sm:mt-4 w-full  mx-auto min-h-full overflow-y-auto">
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
  );
}
