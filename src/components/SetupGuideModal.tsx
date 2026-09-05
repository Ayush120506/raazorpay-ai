import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Bot, 
  MessageSquare, 
  CreditCard, 
  Flame, 
  CheckCircle, 
  ExternalLink,
  ChevronRight,
  Shield,
  Zap,
  Globe
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'vapi' | 'whatsapp' | 'razorpay' | 'firebase' | 'webrtc'>('vapi');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#080808] border border-[#222] rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#222] flex items-center justify-between bg-[#080808]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-[#141414] border border-[#222] flex items-center justify-center text-orange-400 shadow-[0_0_12px_rgba(234,88,12,0.15)]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif italic text-white tracking-wide">Free-Tier API Keys & Setup Guide</h3>
              <p className="text-xs text-[#777]">Step-by-step credentials guide for zero-cost testing & deployment</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#666] hover:text-white p-1 rounded hover:bg-[#161616] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#222] px-5 text-xs overflow-x-auto bg-[#050505]">
          <button
            onClick={() => setActiveTab('vapi')}
            className={`py-3 px-3 font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'vapi'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-[#777] hover:text-[#CCC]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            1. Vapi.ai Voice ($10 Free Credit)
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`py-3 px-3 font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-[#777] hover:text-[#CCC]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            2. WhatsApp Cloud API (1,000 Free msgs/mo)
          </button>
          <button
            onClick={() => setActiveTab('razorpay')}
            className={`py-3 px-3 font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'razorpay'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-[#777] hover:text-[#CCC]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            3. Razorpay Webhooks (Free Sandbox)
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`py-3 px-3 font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'firebase'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-[#777] hover:text-[#CCC]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            4. Firebase Free Spark Tier
          </button>
          <button
            onClick={() => setActiveTab('webrtc')}
            className={`py-3 px-3 font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'webrtc'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-[#777] hover:text-[#CCC]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            5. WebRTC + Groq Free Alt
          </button>
        </div>

        {/* Content Details */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-[#BBB] leading-relaxed bg-[#080808]">
          {activeTab === 'vapi' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#0d0d0d] rounded border border-[#222] text-[#CCC]">
                <strong className="text-orange-400 font-medium">Vapi.ai Free Developer Tier:</strong> Gives <strong className="text-white">$10 free credits</strong> immediately upon signup (equivalent to ~100-150 voice call minutes).
              </div>

              <ol className="list-decimal pl-5 space-y-2 text-[#AAA]">
                <li>
                  Sign up at <a href="https://vapi.ai" target="_blank" rel="noreferrer" className="text-orange-400 underline font-medium inline-flex items-center gap-0.5">vapi.ai <ExternalLink className="w-3 h-3" /></a>.
                </li>
                <li>
                  Navigate to <strong>Account Settings &rarr; API Keys</strong> and copy your <code className="text-orange-400 font-mono bg-[#141414] px-1 py-0.5 rounded">Private API Key</code>. Set this to <code className="text-orange-400 font-mono bg-[#141414] px-1 py-0.5 rounded">VAPI_API_KEY</code> in <code className="text-[#DDD] font-mono">.env</code>.
                </li>
                <li>
                  In <strong>Phone Numbers</strong>, get a free trial number or use your verified caller ID for outbound calling testing.
                </li>
                <li>
                  Configure the Voice Agent:
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-[#888]">
                    <li><strong>Transcriber:</strong> Deepgram (Nova-2 model, language: <code className="text-orange-400 font-mono">hi</code> or <code className="text-orange-400 font-mono">en-IN</code> for accurate Indian accents).</li>
                    <li><strong>Model:</strong> Groq (<code className="text-orange-400 font-mono">llama-3.3-70b-versatile</code> for sub-300ms ultra-low latency).</li>
                    <li><strong>Voice:</strong> ElevenLabs Rachel / Priya or Neerja.</li>
                    <li><strong>Function Calling Tool:</strong> <code className="text-orange-400 font-mono">send_whatsapp_payment_link</code> pointing to your callback URL <code className="text-orange-400 font-mono">POST /api/voice-agent/callback</code>.</li>
                  </ul>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#0d0d0d] rounded border border-[#222] text-[#CCC]">
                <strong className="text-green-400 font-medium">Meta Developer WhatsApp Cloud API Free Tier:</strong> Free 1,000 service conversations per month.
              </div>

              <ol className="list-decimal pl-5 space-y-2 text-[#AAA]">
                <li>
                  Go to the <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-orange-400 underline font-medium inline-flex items-center gap-0.5">Meta for Developers Portal <ExternalLink className="w-3 h-3" /></a> and register / log in.
                </li>
                <li>
                  Create an app with type <strong>"Other"</strong> &rarr; select <strong>"Business"</strong>.
                </li>
                <li>
                  In the App Dashboard, scroll to <strong>Add Products to Your App</strong> and click <strong>Set Up on WhatsApp</strong>.
                </li>
                <li>
                  On the <strong>API Setup</strong> page, you will see:
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-[#888]">
                    <li><strong>Temporary Access Token:</strong> Copy to <code className="text-orange-400 font-mono bg-[#141414] px-1 py-0.5 rounded">WHATSAPP_ACCESS_TOKEN</code> (or generate a Permanent System User Token in Business Settings).</li>
                    <li><strong>Phone Number ID:</strong> Copy the test phone ID to <code className="text-orange-400 font-mono bg-[#141414] px-1 py-0.5 rounded">WHATSAPP_PHONE_NUMBER_ID</code>.</li>
                    <li><strong>To Phone Number:</strong> Add your own personal phone number as a verified test recipient.</li>
                  </ul>
                </li>
                <li>
                  When the Voice Agent triggers the action callback, your Express server sends a JSON payload to <code className="text-orange-400 font-mono">https://graph.facebook.com/v19.0/&#123;phone_number_id&#125;/messages</code> with the 1-click Razorpay payment link.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'razorpay' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#0d0d0d] rounded border border-[#222] text-[#CCC]">
                <strong className="text-orange-400 font-medium">Razorpay Webhooks Free Sandbox:</strong> Razorpay provides a 100% free test mode with mock card, netbanking, and UPI declines.
              </div>

              <ol className="list-decimal pl-5 space-y-2 text-[#AAA]">
                <li>
                  Log in to <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" className="text-orange-400 underline font-medium inline-flex items-center gap-0.5">Razorpay Dashboard <ExternalLink className="w-3 h-3" /></a> and switch toggle to <strong>Test Mode</strong>.
                </li>
                <li>
                  Go to <strong>Settings &rarr; Webhooks &rarr; Add New Webhook</strong>.
                </li>
                <li>
                  <strong>Webhook URL:</strong> Set to your Express server endpoint:
                  <code className="block bg-[#050505] p-2 rounded border border-[#222] text-orange-400 my-1 font-mono">
                    https://your-domain.app/api/webhooks/razorpay
                  </code>
                </li>
                <li>
                  <strong>Secret:</strong> Enter any custom string (e.g. <code className="text-orange-400 font-mono">my_razorpay_secret_123</code>) and add to <code className="text-orange-400 font-mono">RAZORPAY_WEBHOOK_SECRET</code> in <code className="text-[#DDD] font-mono">.env</code>.
                </li>
                <li>
                  <strong>Active Events:</strong> Check <code className="text-orange-400 font-mono">payment.failed</code> and <code className="text-orange-400 font-mono">order.paid</code>.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'firebase' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#0d0d0d] rounded border border-[#222] text-[#CCC]">
                <strong className="text-orange-400 font-medium">Firebase Free Spark Tier:</strong> Generous free limits for Firestore (50k reads, 20k writes/day) and Firebase Auth (unlimited email/password + Google auth).
              </div>

              <ol className="list-decimal pl-5 space-y-2 text-[#AAA]">
                <li>
                  Create a new project at <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-orange-400 underline font-medium inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a>.
                </li>
                <li>
                  <strong>Authentication:</strong> Go to Build &rarr; Authentication &rarr; Sign-in method, and enable <strong>Google</strong> and <strong>Email/Password</strong>.
                </li>
                <li>
                  <strong>Firestore Database:</strong> Click Create Database &rarr; Start in Test mode or paste the security rules provided in <code className="text-orange-400 font-mono">firestore.rules</code>.
                </li>
                <li>
                  <strong>Web App Keys:</strong> Go to Project Settings &rarr; Your apps &rarr; Add Web App &rarr; Copy the <code className="text-orange-400 font-mono">firebaseConfig</code> values into <code className="text-[#DDD] font-mono">.env</code>.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'webrtc' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#0d0d0d] rounded border border-[#222] text-[#CCC]">
                <strong className="text-orange-400 font-medium">100% Free Open-Source Architecture (WebRTC + Groq + Whisper):</strong> For merchants wanting zero recurring API phone costs.
              </div>

              <div className="space-y-2 text-[#AAA]">
                <p>If you don't wish to use telecom telephony (Vapi / Bland / Twilio), you can run browser-to-browser WebRTC or in-app voice calls:</p>
                <ul className="list-disc pl-5 space-y-1 text-[#888]">
                  <li><strong>STT (Speech-to-Text):</strong> Groq Whisper API (free tier: <code className="text-orange-400 font-mono">whisper-large-v3</code>).</li>
                  <li><strong>Intelligence:</strong> Groq Llama-3.3-70B (free tier: fast 300 tokens/sec streaming).</li>
                  <li><strong>TTS (Text-to-Speech):</strong> Web Speech API (built-in to user browser, $0 cost) or open-source Kokoro / Piper TTS.</li>
                  <li><strong>Transport:</strong> WebRTC audio streaming between merchant browser and customer device via WebSockets.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#222] bg-[#050505] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded bg-[#141414] hover:bg-[#1c1c1c] text-white font-medium text-xs border border-[#262626] transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
