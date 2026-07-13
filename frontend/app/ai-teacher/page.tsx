"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthNavbar from "@/components/AuthNavbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AITeacher() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I am the LearnStack AI Teacher 🤖. I have access to real-time internet search to give you the most accurate coding answers. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0A051A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    
    // Add user message to UI
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
        credentials: "include"
      });
      
      if (!res.ok) {
        let errorMsg = "Network error. I couldn't reach the server.";
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {}
        setMessages([...newMessages, { role: "assistant", content: "❌ " + errorMsg }]);
        setIsTyping(false);
        return;
      }

      setIsTyping(false); // remove the bouncing loader once stream starts

      // Add empty assistant message to be filled by stream
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: updated[lastIdx].content + chunk
            };
            return updated;
          });
        }
      }
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "❌ Network error. I couldn't reach the server." }]);
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A051A] text-white flex flex-col relative overflow-hidden">
      <AuthNavbar />
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-0 md:p-6 relative z-10">
        
        {/* Header */}
        <div className="mb-4 md:mb-6 mt-4 md:mt-0 text-center shrink-0 px-4">
          <h1 className="text-3xl md:text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center gap-3">
            <span>🤖</span> AI Teacher
          </h1>
          <p className="text-indigo-200 text-sm md:text-base">Ask anything. Powered by Google Gemini with live internet search.</p>
        </div>

        {/* Chat Box */}
        <div className="flex-1 bg-[#0F0A1A] md:glass md:border border-indigo-500/20 md:rounded-2xl flex flex-col overflow-hidden shadow-none md:shadow-[0_0_30px_rgba(79,70,229,0.1)]">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'user' ? (
                    <div className="bg-[#2A2342] text-white px-5 py-3.5 rounded-3xl rounded-tr-sm max-w-[85%] md:max-w-[70%] shadow-md whitespace-pre-wrap text-base">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="w-full text-gray-200 text-base leading-7 break-words">
                        <div className="prose prose-invert !max-w-full w-full">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                  <div className="rounded-xl overflow-hidden my-6 border border-gray-800 bg-[#0d0d0d] shadow-lg">
                                    <div className="flex items-center justify-between px-4 py-2 bg-[#2f2f2f] text-xs font-sans text-gray-300">
                                      <span className="uppercase tracking-wider font-semibold">{match[1]}</span>
                                      <button 
                                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                                        onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                                      >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                        Copy code
                                      </button>
                                    </div>
                                    <div className="p-4 overflow-x-auto text-sm font-mono text-gray-100">
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    </div>
                                  </div>
                                ) : (
                                  <code className="bg-[#2f2f2f] text-gray-200 rounded-md px-1.5 py-0.5 text-sm" {...props}>
                                    {children}
                                  </code>
                                )
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-full">
                    <div className="flex items-center h-8">
                      <div className="flex gap-1.5 items-center">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[#110C24] border-t border-indigo-500/20">
            <form onSubmit={handleSend} className="flex gap-3 relative max-w-4xl mx-auto">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Ask about coding, debug an error, or learn a new concept..."
                className="w-full bg-[#1A1430] border border-indigo-500/30 rounded-xl px-4 py-3 sm:py-4 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none"
                rows={1}
                style={{ minHeight: '52px', maxHeight: '150px' }}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white p-3 sm:p-4 rounded-xl transition-all shadow-md flex items-center justify-center shrink-0"
                aria-label="Send message"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
            <div className="text-center mt-2 text-xs text-gray-500">
              AI can make mistakes. Consider verifying important information.
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
