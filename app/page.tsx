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
