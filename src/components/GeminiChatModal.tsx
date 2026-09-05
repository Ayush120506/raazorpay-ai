import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  BrainCircuit, 
  Cpu, 
  UserCheck, 
  Code2, 
  TrendingUp, 
  Trash2,
  Check,
  Copy
} from 'lucide-react';
import { ChatMessage, GeminiModelId, ChatRoleKey, FailedPayment } from '../types';

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: FailedPayment[];
}

const ROLES: Array<{
  id: ChatRoleKey;
  label: string;
  tagline: string;
  icon: any;
}> = [
  {
    id: 'recovery_strategist',
    label: 'Recovery Strategist',
    tagline: 'Discount tiering, timing & conversion scripts',
    icon: TrendingUp
  },
  {
    id: 'customer_persona',
    label: 'Shopper Roleplay',
    tagline: 'Simulate Indian customer OTP & UPI objections',
    icon: UserCheck
  },
  {
    id: 'payment_architect',
    label: 'Payment Architect',
    tagline: 'Razorpay, WhatsApp API & Vapi stack',
    icon: Code2
  }
];

const MODELS: Array<{
  id: GeminiModelId;
  label: string;
  badge: string;
  description: string;
  icon: any;
}> = [
  {
    id: 'gemini-3.5-flash',
    label: 'Gemini 3.5 Flash',
    badge: 'General Tasks',
    description: 'Balanced speed and strategic reasoning',
    icon: Zap
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash Lite',
    badge: 'Fast Responses',
    description: 'Sub-second suggestions and quick script drafts',
    icon: Cpu
  },
  {
    id: 'gemini-3.1-pro-preview',
    label: 'Gemini 3.1 Pro Preview',
    badge: 'Complex Reasoning',
    description: 'Deep analytical and multi-step drop-off inspection',
    icon: BrainCircuit
  }
];

const QUICK_PROMPTS: Record<ChatRoleKey, string[]> = {
  recovery_strategist: [
    'How can I raise checkout recovery from 15% to 45% in India?',
    'Write a natural Hinglish outbound call script for ₹2,499 boAt headphones',
    'What is the optimal coupon discount without hurting profit margins?'
  ],
  customer_persona: [
    'I am Priya from StyleHub. We saw your ₹2,499 order failed. Can I help?',
    'Sir, bank OTP delay ho gaya tha. Aapke liye cart reserve rakhi hai.',
    'Would you like a direct 10% off WhatsApp UPI link to complete this?'
  ],
  payment_architect: [
    'How do I verify Razorpay payment.failed webhook signature in Node?',
    'Show sample payload for Meta WhatsApp interactive UPI payment link',
    'What is the ideal Vapi + Deepgram + Groq low-latency architecture?'
  ]
};

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({ isOpen, onClose, payments }) => {
  const [selectedRole, setSelectedRole] = useState<ChatRoleKey>('recovery_strategist');
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>('gemini-3.5-flash');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('checkout_rescue_chat_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: `Namaste! I am your **Gemini Revenue Recovery AI Strategist**.\n\nI can help you:\n- **Analyze failed checkouts** from your live Razorpay feed\n- **Craft Hinglish voice recovery scripts** tailored to Indian shoppers\n- **Roleplay customer objections** to stress-test your agents\n- **Design high-converting WhatsApp payment links**\n\nHow can I help recover your abandoned carts today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash'
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('checkout_rescue_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!textToSend) setInput('');
    setLoading(true);

    // Prepare store context
    const totalLost = payments.reduce((acc, p) => acc + (p.recoveryStatus !== 'recovered' ? p.amount : 0), 0);
    const totalRecovered = payments.reduce((acc, p) => acc + (p.recoveryStatus === 'recovered' ? p.amount : 0), 0);
    const recentFailures = payments.slice(0, 5).map(p => `${p.customerName} (₹${p.amount}) - ${p.productName} [Reason: ${p.failureReason}, Status: ${p.recoveryStatus}]`).join('\n');
    
    const summary = `Total Lost In-Cart: ₹${totalLost} | Total Recovered: ₹${totalRecovered}\nRecent Checkouts:\n${recentFailures}`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          model: selectedModel,
          roleKey: selectedRole,
          currentPaymentsSummary: summary
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response returned.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `I encountered an issue connecting to Gemini: ${err.message || 'Service unreachable'}. Please verify your connection or check Gemini settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    const welcome: ChatMessage = {
      id: `msg_welcome_${Date.now()}`,
      role: 'assistant',
      content: `Conversation refreshed. I am ready to advise on recovery strategies, simulate Indian customer personas, or debug payment gateway webhooks.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: selectedModel
    };
    setMessages([welcome]);
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#080808] border border-[#222] rounded-xl max-w-4xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Top Header */}
        <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#080808]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-[#141414] border border-[#222] flex items-center justify-center text-orange-400 shadow-[0_0_12px_rgba(234,88,12,0.18)]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif italic text-white tracking-wide">
                  Gemini Recovery Intelligence
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-orange-500/30 text-orange-400 bg-orange-950/20">
                  Multi-Turn
                </span>
              </div>
              <p className="text-xs text-[#777]">
                Conversational AI advisor, script optimizer & customer roleplay simulator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              title="Clear conversation"
              className="text-[#666] hover:text-[#BBB] p-1.5 rounded hover:bg-[#141414] transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#666] hover:text-white p-1.5 rounded hover:bg-[#161616] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar: Role & Model Selectors */}
        <div className="px-4 py-2.5 bg-[#050505] border-b border-[#1c1c1c] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Role selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] text-[#666] uppercase font-mono mr-1">Role:</span>
            {ROLES.map(role => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-orange-950/30 border-orange-500/50 text-orange-400'
                      : 'bg-[#0f0f0f] border-[#222] text-[#888] hover:text-[#CCC] hover:border-[#333]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{role.label}</span>
                </button>
              );
            })}
          </div>

          {/* Model selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] text-[#666] uppercase font-mono mr-1">Model:</span>
            {MODELS.map(model => {
              const isSelected = selectedModel === model.id;
              return (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  title={model.description}
                  className={`px-2 py-1 rounded text-[11px] font-mono border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#181818] border-orange-500/60 text-orange-300'
                      : 'bg-[#0c0c0c] border-[#1e1e1e] text-[#777] hover:text-[#BBB]'
                  }`}
                >
                  <span>{model.label}</span>
                  <span className="text-[9px] text-[#555]">({model.badge.split(' ')[0]})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#080808]">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded bg-[#141414] border border-[#222] flex items-center justify-center text-orange-400 flex-shrink-0 mt-0.5 shadow-[0_0_8px_rgba(234,88,12,0.12)]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] rounded-xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-orange-950/20 border border-orange-500/30 text-orange-100 rounded-tr-none'
                    : 'bg-[#0e0e0e] border border-[#222] text-[#CCC] rounded-tl-none'
                }`}>
                  {/* Meta Bar */}
                  <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-white/5 text-[10px] text-[#666]">
                    <span className="font-mono">
                      {isUser ? 'Merchant' : 'Gemini Recovery AI'}
                    </span>
                    <div className="flex items-center gap-2">
                      {m.modelUsed && !isUser && (
                        <span className="font-mono text-orange-400/80 bg-[#161616] px-1.5 py-0.2 rounded border border-[#262626]">
                          {m.modelUsed}
                        </span>
                      )}
                      <span>{m.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => copyMessage(m.id, m.content)}
                          className="hover:text-white cursor-pointer ml-1"
                          title="Copy text"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Body with clean formatting */}
                  <div className="whitespace-pre-wrap font-sans text-xs space-y-1">
                    {m.content}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center text-[#999] flex-shrink-0 mt-0.5">
                    <UserCheck className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded bg-[#141414] border border-[#222] flex items-center justify-center text-orange-400 flex-shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
              </div>
              <div className="bg-[#0e0e0e] border border-[#222] rounded-xl rounded-tl-none p-3.5 text-xs text-[#888] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                <span>Thinking with {selectedModel}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-4 py-2 bg-[#050505] border-t border-[#1a1a1a] overflow-x-auto">
          <div className="flex items-center gap-2 text-[11px] whitespace-nowrap">
            <span className="text-[#555] font-mono text-[10px] uppercase">Suggestions:</span>
            {QUICK_PROMPTS[selectedRole].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="px-2.5 py-1 rounded bg-[#101010] hover:bg-[#181818] border border-[#222] hover:border-[#333] text-[#AAA] hover:text-white transition-colors cursor-pointer text-[11px] disabled:opacity-50 truncate max-w-xs"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-3.5 bg-[#080808] border-t border-[#222]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask Gemini as ${ROLES.find(r => r.id === selectedRole)?.label}... (e.g. "How to overcome OTP failure?")`}
              disabled={loading}
              className="flex-1 bg-[#040404] border border-[#222] focus:border-orange-500 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-[#555] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(234,88,12,0.25)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[10px] text-[#555] font-mono">
            <span>Powered by Google DeepMind Gemini API</span>
            <span>Role: {ROLES.find(r => r.id === selectedRole)?.label}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
