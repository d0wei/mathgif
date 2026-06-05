import { useState } from 'react';
import { useExpertChat } from '../hooks/useExpertChat';
import { expertRoles } from '../core/ai/expertRoles';

interface ExpertChatProps {
  apiKey: string;
}

export function ExpertChat({ apiKey }: ExpertChatProps) {
  const [input, setInput] = useState('');
  const [selectedExpert, setSelectedExpert] = useState(expertRoles[1].id);
  const [isOpen, setIsOpen] = useState(false);
  
  const { messages, isLoading, currentExpert, sendMessage, clearMessages } = useExpertChat({
    apiKey,
  });

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input, selectedExpert);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition flex items-center justify-center text-2xl"
        title="咨询数学专家"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">数学专家咨询</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        {/* Expert Selection */}
        <div className="mt-3 flex gap-2">
          {expertRoles.map((expert) => (
            <button
              key={expert.id}
              onClick={() => setSelectedExpert(expert.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition ${
                selectedExpert === expert.id
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={expert.description}
            >
              <span>{expert.avatar}</span>
              <span>{expert.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-2">👋</div>
            <p className="text-sm">有问题？问问我们的数学专家</p>
            <p className="text-xs mt-2">例如："怎么理解正弦函数？"</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.role === 'expert' && (
                <div className="flex items-center gap-1 mb-1 text-xs text-gray-500">
                  <span>{msg.expertAvatar}</span>
                  <span>{msg.expertName}</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{currentExpert?.avatar}</span>
                <span>正在思考...</span>
                <span className="animate-pulse">💭</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            发送
          </button>
        </div>
        
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600"
          >
            清空对话
          </button>
        )}
      </div>
    </div>
  );
}
