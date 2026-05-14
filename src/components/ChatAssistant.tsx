import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { chatService } from '../services/chatService';
import { ChatMessage } from '../types';
import Markdown from 'react-markdown';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Xin chào! Tôi là NOMAD. Bạn cần hỗ trợ gì cho chuyến hành trình sắp tới không?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      let aiResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      await chatService.sendMessageStream(userMessage, (chunk) => {
        aiResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', text: aiResponse };
          return newMessages;
        });
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[2000] no-print">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '80px' : '600px',
              width: isMinimized ? '200px' : '400px'
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`bg-white border-4 border-vibrant-black shadow-[12px_12px_0px_#1a1a1a] rounded-[2rem] overflow-hidden flex flex-col transition-all duration-300 max-w-[calc(100vw-3rem)]`}
          >
            {/* Header */}
            <div className="bg-vibrant-black p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-vibrant-orange rounded-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-display uppercase text-sm tracking-widest">NOMAD</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[8px] text-white/60 font-black uppercase">Đang trực tuyến</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-vibrant-cream/20">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}
                    >
                      {msg.role === 'model' && (
                        <div className="w-8 h-8 rounded-full bg-vibrant-black flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-vibrant-orange" />
                        </div>
                      )}
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-vibrant-black text-white rounded-br-none' 
                          : 'bg-white border-2 border-vibrant-black/5 text-vibrant-black rounded-bl-none'
                      }`}>
                        <div className="markdown-body chat-content">
                          <Markdown>{msg.text}</Markdown>
                        </div>
                        {msg.text === '' && isLoading && (
                          <Loader2 className="w-4 h-4 animate-spin text-vibrant-orange" />
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-vibrant-orange flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t-2 border-vibrant-black/5 bg-white">
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Hỏi bất kỳ điều gì..."
                      disabled={isLoading}
                      className="w-full bg-vibrant-cream border-2 border-vibrant-black rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-4 focus:ring-vibrant-orange/10 transition-all text-sm font-bold disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="absolute right-2 top-1.5 p-2 bg-vibrant-black text-white rounded-lg hover:bg-vibrant-orange transition-colors disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[8px] font-black uppercase text-center mt-2 text-vibrant-black/30">
                    Sức mạnh bởi NOMAD AI • Trả lời có thể chứa sai sót
                  </p>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-vibrant-orange border-4 border-vibrant-black shadow-[6px_6px_0px_#1a1a1a] rounded-2xl flex items-center justify-center text-white relative group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-8 h-8" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <MessageCircle className="w-8 h-8" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-white border-2 border-vibrant-black rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-vibrant-black text-white text-[10px] font-black uppercase tracking-widest rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Cần trợ giúp?
          </div>
        )}
      </motion.button>
    </div>
  );
}
