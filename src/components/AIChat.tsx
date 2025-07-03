"use client";

import { useState, FormEvent, useEffect, useRef } from 'react';

type Message = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Function to auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input || isLoading) return;
    
    setIsLoading(true);
    const userMessage: Message = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    const assistantMessageId = Date.now() + 1;
    setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [userMessage] }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Network response was not ok.');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: msg.content + chunk } 
            : msg
        ));
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: "Sorry, an error occurred." }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Main full-screen container with gradient background
    <div className="flex flex-col h-[calc(100vh-100px)] w-full bg-gradient-to-br from-gray-50 to-blue-100" dir="rtl">
        
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map(m => (
                <div key={m.id} className={`flex items-end gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                        style={{ perspective: '1000px' }}
                        className={`
                            ${m.role === 'assistant' ? 'animate-flip-in' : ''} 
                            inline-block p-4 rounded-2xl max-w-xl shadow-md
                            ${m.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : 'bg-white text-gray-800 rounded-bl-none'
                            }
                        `}
                    >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="p-4 rounded-2xl bg-white shadow-md">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-0"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                        </div>
                    </div>
                </div>
            )}
            {/* Empty div to scroll to */}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Form Area with "Glassmorphism" effect */}
        <div className="p-4 bg-white/50 backdrop-blur-lg border-t border-gray-200/80">
            <form onSubmit={handleSubmit} className="flex items-center gap-4 max-w-4xl mx-auto">
                <input
                    className="w-full p-3 border-2 border-transparent rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={input}
                    placeholder="اسأل مساعد إيبلا الذكي..."
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="p-3 bg-Purple text-white rounded-lg font-semibold hover:bg-Sky transition-all duration-300 shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100"
                >
                    إرسال
                </button>
            </form>
        </div>
    </div>
  );
}