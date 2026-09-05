import React, { useState, useEffect } from 'react';
import { FailedPayment } from '../types';
import { 
  X, 
  Phone, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  Radio, 
  ArrowRight,
  Code,
  Layers,
  Wand2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  payment: FailedPayment | null;
  onSendWhatsApp: (payment: FailedPayment) => Promise<void>;
}

export const VoiceCallModal: React.FC<Props> = ({
  isOpen,
  onClose,
  payment,
  onSendWhatsApp
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcript' | 'prompt' | 'tool'>('transcript');

  useEffect(() => {
    // Stop speech synthesis on modal close
    if (!isOpen && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  }, [isOpen]);

  if (!isOpen || !payment) return null;

  const handlePlayAudio = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!payment.transcript || payment.transcript.length === 0) return;

    setIsPlayingAudio(true);
    let index = 0;

    const speakNext = () => {
      if (index >= payment.transcript!.length) {
        setIsPlayingAudio(false);
        return;
      }

      const item = payment.transcript![index];
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.rate = 1.0;
      utterance.pitch = item.speaker === 'agent' ? 1.15 : 0.95;

      // Try selecting a Hindi or Indian English voice if available
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('en-IN') || v.name.includes('India'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      utterance.onend = () => {
        index++;
        speakNext();
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  const handleSendWhatsApp = async () => {
    setIsSendingWhatsApp(true);
    try {
      await onSendWhatsApp(payment);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#080808] border border-[#222] rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#222] flex items-center justify-between bg-[#080808]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-[#111] border border-[#222] flex items-center justify-center text-orange-400 shadow-[0_0_12px_rgba(234,88,12,0.15)]">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-serif italic text-white tracking-wide">Voice Agent Call Session</h3>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-orange-500/10 text-orange-400 border border-orange-500/30">
                  Hinglish AI Voice
                </span>
              </div>
              <p className="text-xs text-[#777] mt-0.5">
                Customer: <span className="text-[#DDD] font-medium">{payment.customerName}</span> ({payment.customerPhone}) • Order: <span className="font-mono text-orange-400">{payment.orderId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePlayAudio}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-orange-600 text-white animate-pulse shadow-[0_0_12px_rgba(234,88,12,0.4)]'
                  : 'bg-[#111] hover:bg-[#181818] text-orange-400 border border-[#262626]'
              }`}
              title="Play Hinglish speech using browser audio synthesis"
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-orange-400" />}
              <span>{isPlayingAudio ? 'Stop Voice' : 'Listen to Call'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-[#666] hover:text-white p-1 rounded hover:bg-[#161616] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-[#222] px-5 text-xs bg-[#050505]">
          <button
            onClick={() => setActiveTab('transcript')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'transcript'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-[#777] hover:text-[#DDD]'
            }`}
          >
            Live Conversation Transcript
          </button>
          <button
            onClick={() => setActiveTab('prompt')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'prompt'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-[#777] hover:text-[#DDD]'
            }`}
          >
            Voice Agent Prompt (Hinglish)
          </button>
          <button
            onClick={() => setActiveTab('tool')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'tool'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-[#777] hover:text-[#DDD]'
            }`}
          >
            Function Call (send_whatsapp_payment_link)
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs bg-[#080808]">
          {activeTab === 'transcript' && (
            <div className="space-y-3">
              {/* Call Summary Bar */}
              <div className="p-3 bg-[#050505] rounded border border-[#222] flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2 text-[#AAA]">
                  <Bot className="w-4 h-4 text-orange-400" />
                  <span>Agent: <strong className="text-white">Priya (Hinglish AI)</strong></span>
                  <span className="text-[#444]">•</span>
                  <span>Model: <strong className="text-white font-mono">Groq Llama-3.3 / Vapi</strong></span>
                </div>
                <div className="text-[#777]">
                  Duration: <span className="font-mono text-white">{payment.callDurationSeconds || 45}s</span>
                </div>
              </div>

              {/* Transcript list */}
              <div className="space-y-3 pt-1">
                {payment.transcript && payment.transcript.length > 0 ? (
                  payment.transcript.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${msg.speaker === 'agent' ? 'justify-start' : 'justify-end'}`}
                    >
                      {msg.speaker === 'agent' && (
                        <div className="w-7 h-7 rounded bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 mt-1 border border-orange-500/20">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded p-3.5 text-xs leading-relaxed ${
                          msg.speaker === 'agent'
                            ? 'bg-[#111] text-[#EEE] border border-[#222]'
                            : 'bg-[#191410] text-orange-100 border border-orange-500/20'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1 text-[10px] text-[#777]">
                          <span className="font-semibold text-[#CCC]">
                            {msg.speaker === 'agent' ? 'Priya (AI Voice Agent)' : payment.customerName}
                          </span>
                          <span className="font-mono">{msg.timestamp}</span>
                        </div>
                        <p>{msg.text}</p>
                      </div>
                      {msg.speaker === 'customer' && (
                        <div className="w-7 h-7 rounded bg-[#161616] text-[#AAA] flex items-center justify-center shrink-0 mt-1 border border-[#262626]">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-[#666]">
                    No transcript yet. Click "Call Customer" in the dashboard to initiate the call.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'prompt' && (
            <div className="space-y-3 font-mono">
              <div className="p-3.5 bg-[#050505] rounded border border-[#222] text-[#CCC] text-[11px] leading-relaxed whitespace-pre-wrap">
{`You are Priya, a polite, empathetic and energetic customer checkout specialist from the merchant's store.
Customer Name: ${payment.customerName}
Item: ${payment.productName}
Amount: ₹${payment.amount}
Failure Reason: ${payment.failureReason}
Preferred Style: Fluent urban Hinglish (natural conversational Hindi interspersed with English words like order, checkout, payment, discount, link, WhatsApp).

Conversational Strategy:
1. Warm greeting: "Namaste ${payment.customerName} ji! Main store se Priya baat kar rahi hoon..."
2. Explain the reason: "Aapka checkout pay karte waqt bank server issue ki wajah se complete nahi ho paya tha..."
3. Offer instant recovery incentive: 10% instant discount code (RECOVER10) with 1-click WhatsApp UPI link.
4. Tool invocation: If customer gives consent, immediately execute function:
   send_whatsapp_payment_link(order_id="${payment.orderId}", phone="${payment.customerPhone}")`}
              </div>
            </div>
          )}

          {activeTab === 'tool' && (
            <div className="space-y-3 font-mono text-[11px]">
              <div className="p-3.5 bg-[#050505] rounded border border-[#222] text-[#CCC]">
                <div className="text-orange-400 font-semibold mb-2 flex items-center gap-1.5">
                  <Code className="w-4 h-4" /> Tool Call Execution Payload
                </div>
                <pre className="text-[#888] overflow-x-auto">
{JSON.stringify({
  tool_name: "send_whatsapp_payment_link",
  parameters: {
    order_id: payment.orderId,
    customer_phone: payment.customerPhone,
    customer_name: payment.customerName,
    agreed_amount: Math.round(payment.amount * 0.9),
    discount_code: "RECOVER10",
    payment_gateway: "Razorpay 1-Click UPI"
  },
  callback_endpoint: "POST /api/voice-agent/callback",
  destination_service: "Meta WhatsApp Cloud API v19.0"
}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#222] bg-[#050505] flex items-center justify-between">
          <div className="text-xs text-[#777]">
            Current Status: <span className="text-emerald-400 font-mono capitalize">{payment.recoveryStatus.replace(/_/g, ' ')}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSendWhatsApp}
              disabled={isSendingWhatsApp}
              className="flex items-center space-x-1.5 px-4 py-2 rounded bg-green-700 hover:bg-green-600 text-white font-semibold text-xs shadow-[0_0_12px_rgba(22,163,74,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingWhatsApp ? 'Sending WhatsApp...' : 'Trigger WhatsApp Link Callback'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
