import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { MessageSender } from '../types';
import { getChatResponseStream } from '../services/geminiService';
import { SparklesIcon, CloseIcon, SendIcon } from './icons';

interface ChatbotProps {
    onToggle: (isOpen: boolean) => void;
}

const AiMessageContent: React.FC<{ text: string; animate: boolean }> = React.memo(({ text, animate }) => {
    const parseAndAnimate = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g).filter(part => part);
        let wordCount = 0;

        return parts.map((part, partIndex) => {
            let content;
            let isBold = false;

            if (part.startsWith('**') && part.endsWith('**')) {
                content = part.slice(2, -2);
                isBold = true;
            } else {
                content = part;
            }

            const words = content.split(/(\s+)/).filter(w => w);
            const animatedContent = words.map((word, wordIndex) => {
                if (animate) {
                    const delay = (wordCount + wordIndex) * 0.05;
                    return (
                        <span key={wordIndex} className="opacity-0 animate-word-fade-in" style={{ animationDelay: `${delay}s` }}>
                            {word}
                        </span>
                    );
                }
                return word;
            });

            wordCount += words.length;
            
            return isBold ? <strong key={partIndex}>{animatedContent}</strong> : <React.Fragment key={partIndex}>{animatedContent}</React.Fragment>;
        });
    };
    
    return <p className="text-sm leading-relaxed">{parseAndAnimate(text)}</p>
});

const Chatbot: React.FC<ChatbotProps> = ({ onToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'initial', sender: MessageSender.AI, text: 'Hello! How can I help you with your trades today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isAnimatingIn, setIsAnimatingIn] = useState(false);
    const animatedMessageIds = useRef(new Set<string>(['initial']));

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isTyping]);
    
    useEffect(() => {
        onToggle(isOpen);
        if (isOpen) {
            const timer = setTimeout(() => setIsAnimatingIn(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsAnimatingIn(false);
        }
    }, [isOpen, onToggle]);
    
    const handleSend = async () => {
        if (input.trim() === '' || isTyping) return;

        const userMessage: ChatMessage = { id: Date.now().toString(), sender: MessageSender.USER, text: input };
        setMessages(prev => [...prev, userMessage]);
        const prompt = input;
        setInput('');
        setIsTyping(true);
        
        let fullResponse = '';
        try {
            const stream = getChatResponseStream(prompt);
            for await (const chunk of stream) {
                fullResponse += chunk;
            }
        } catch (error) {
            console.error("Error getting AI response:", error);
            fullResponse = "Sorry, I'm having trouble connecting right now.";
        } finally {
            setIsTyping(false);
            if (fullResponse) {
                const aiMessage: ChatMessage = { id: (Date.now() + 1).toString(), sender: MessageSender.AI, text: fullResponse };
                setMessages(prev => [...prev, aiMessage]);
            }
        }
    };
    
    return (
        <div className="fixed bottom-8 right-4 z-50">
            {!isOpen && (
                 <button
                    onClick={() => setIsOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-base font-medium bg-white/5 border border-white/10 rounded-xl hover:bg-white/20 active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-lg animate-fade-in"
                    aria-label='Chat with "Dhaqaale AI"'
                >
                    <SparklesIcon />
                    <span>Chat with "Dhaqaale AI"</span>
                </button>
            )}

            {isOpen && (
                <div className={`w-[calc(100vw-2rem)] max-w-md h-[70vh] max-h-[650px] bg-slate-900/50 border border-slate-700 rounded-2xl backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.2)] flex flex-col transition-all duration-300 ease-out ${isAnimatingIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                        <h2 className="font-bold text-lg">Chat with DHAQAALE AI</h2>
                        <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
                            <CloseIcon />
                        </button>
                    </header>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((message) => {
                            const hasBeenAnimated = animatedMessageIds.current.has(message.id);
                            const shouldAnimate = !hasBeenAnimated;
                            if (shouldAnimate) {
                                animatedMessageIds.current.add(message.id);
                            }

                            return (
                                <div key={message.id} className={`flex ${message.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-xl ${message.sender === MessageSender.USER ? 'bg-blue-600 rounded-br-none' : 'bg-slate-700 rounded-bl-none'} ${shouldAnimate && message.sender === MessageSender.AI ? 'animate-fade-in' : ''}`}>
                                        {message.sender === MessageSender.AI ? (
                                            <AiMessageContent text={message.text} animate={shouldAnimate} />
                                        ) : (
                                            <p className="text-sm leading-relaxed">{message.text}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {isTyping && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="p-3 rounded-xl bg-slate-700 rounded-bl-none">
                                    <div className="flex items-center space-x-1">
                                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-white/10 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask a question..."
                                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-full outline-none focus:border-slate-500 transition-colors placeholder:text-slate-400 focus:placeholder:text-transparent"
                            />
                            <button onClick={handleSend} className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-white flex-shrink-0 hover:bg-slate-500 transition-colors active:scale-95 disabled:opacity-50" disabled={isTyping || !input.trim()}>
                               <SendIcon />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;