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
      <main className="flex-1 overflow-y-auto px-4 pt-5 w-full mx-auto ">
       <div className="bg-[#FFFFFF] rounded-t-2xl shadow-md pt-4 pb-10 mt-4 w-[95%] mx-auto ">
         <div className="max-w-2xl mx-auto space-y-2 pt-4">
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
