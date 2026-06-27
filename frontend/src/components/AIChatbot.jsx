import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const QUICK_CHIPS = [
  "Show upcoming events 📅",
  "How do I cancel a ticket? 🎫",
  "Explain the waitlist system 📋",
  "How do I earn badges? 🏆",
  "Recommend tech events for me 💻",
];

const AIChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm **Nexus AI**, your campus event assistant. 🤖✨\n\nI can help you discover events, understand booking policies, or answer any platform questions. What's on your mind?" }
  ]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText) return;

    const userMsg = { role: 'user', text: msgText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const updatedHistory = [...history, { role: 'user', content: msgText }];

    try {
      const res = await chatService.sendMessage(msgText, updatedHistory, user?.id);
      const aiText = res.data?.response || "I'm not sure about that. Try asking about events or booking policies!";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
      setHistory([...updatedHistory, { role: 'assistant', content: aiText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "🔌 I'm having trouble connecting to the server. Please check if the backend is running on port 5005." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = (text) => {
    // Simple markdown: **bold**, newlines
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 5000 }}>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Open Nexus AI Assistant"
        style={{
          width: '62px', height: '62px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
          border: 'none', color: 'white', fontSize: '1.8rem', cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(110,142,251,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.12) rotate(10deg)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="glass fade-in" style={{
          position: 'absolute', bottom: '80px', right: 0,
          width: '370px', height: '560px', display: 'flex', flexDirection: 'column',
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
          borderRadius: '24px', overflow: 'hidden',
          border: '1px solid rgba(110,142,251,0.2)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.18)'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(90deg, #6e8efb, #a777e3)',
            color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem'
          }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🤖</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Nexus AI Assistant</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '7px', height: '7px', background: '#2ecc71', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 6px #2ecc71' }}></span>
                Online · Powered by AI
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%', padding: '0.75rem 1rem', borderRadius: '16px',
                fontSize: '0.87rem', lineHeight: '1.5',
                background: m.role === 'user'
                  ? 'linear-gradient(135deg, #6e8efb, #a777e3)'
                  : '#f0f2f8',
                color: m.role === 'user' ? 'white' : '#333',
                borderBottomRightRadius: m.role === 'user' ? '3px' : '16px',
                borderBottomLeftRadius: m.role === 'ai' ? '3px' : '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
              }}
                dangerouslySetInnerHTML={{ __html: renderMessage(m.text) }}
              />
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', background: '#f0f2f8', padding: '0.75rem 1rem', borderRadius: '16px', borderBottomLeftRadius: '3px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: '8px', height: '8px', borderRadius: '50%', background: '#a777e3',
                    animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`
                  }} />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chips */}
          {messages.length <= 2 && (
            <div style={{ padding: '0 1rem 0.5rem', display: 'flex', gap: '0.4rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {QUICK_CHIPS.map((chip, i) => (
                <button key={i} onClick={() => sendMessage(chip)} style={{
                  whiteSpace: 'nowrap', padding: '0.35rem 0.75rem', borderRadius: '20px',
                  border: '1px solid rgba(110,142,251,0.35)', background: 'rgba(110,142,251,0.06)',
                  color: '#6e8efb', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                  onMouseOver={e => { e.currentTarget.style.background = '#6e8efb'; e.currentTarget.style.color = 'white'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(110,142,251,0.06)'; e.currentTarget.style.color = '#6e8efb'; }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(0,0,0,0.07)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Ask me anything about events..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              style={{ flex: 1, border: 'none', background: '#f4f6fc', padding: '0.75rem 1rem', borderRadius: '12px', outline: 'none', fontSize: '0.88rem' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isTyping || !input.trim()}
              style={{
                background: 'linear-gradient(135deg, #6e8efb, #a777e3)', color: 'white',
                border: 'none', borderRadius: '12px', padding: '0.75rem 1rem',
                cursor: 'pointer', fontSize: '1.1rem', opacity: isTyping || !input.trim() ? 0.5 : 1
              }}
            >➤</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default AIChatbot;
