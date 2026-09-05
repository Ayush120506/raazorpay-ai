import React, { useState } from 'react';
import { 
  X, 
  FolderTree, 
  Terminal, 
  FileCode, 
  Copy, 
  Check, 
  Layers,
  Server,
  Flame,
  Layout,
  Shield
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationDocsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'structure' | 'commands' | 'server' | 'firebase' | 'rules'>('structure');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const folderStructureText = `ai-revenue-recovery/
├── server.ts                    # Express REST API (Razorpay Webhook + Voice Agent Callback + Vite Middleware)
├── firestore.rules              # Zero-Trust Firestore Security Rules (ABAC)
├── package.json                 # Project dependencies & build scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite bundler & Tailwind CSS configuration
├── .env.example                 # Environment variables specification
├── README.md                    # Comprehensive step-by-step setup guide
├── index.html                   # Entry point HTML with meta tags
└── src/
    ├── main.tsx                 # React DOM mount point
    ├── App.tsx                  # Single-Page Merchant Dashboard
    ├── firebase.ts              # Firebase Auth & Firestore Client SDK initializers
    ├── types.ts                 # Shared TypeScript interfaces
    ├── index.css                # Tailwind CSS global styles
    ├── services/
    │   ├── api.ts               # Frontend REST client for backend endpoints
    │   └── mockData.ts          # Seed test checkouts & transcripts
    └── components/
        ├── Navbar.tsx           # Header, system health status & merchant auth
        ├── MetricsBar.tsx       # Recovered revenue, rate, calls & WhatsApp counters
        ├── FailedPaymentsTable.tsx # Searchable, filterable abandoned checkout table
        ├── WebhookSimulator.tsx # Razorpay webhook payload builder & dispatcher
        ├── VoiceCallModal.tsx   # Live Hinglish audio synthesizer & transcript viewer
        ├── WhatsAppPreviewModal.tsx # Simulated WhatsApp smartphone chat interface
        ├── SetupGuideModal.tsx  # Free-tier API keys walkthrough
        └── IntegrationDocsModal.tsx # Folder structure, copyable code & commands`;

  const installCommands = `# 1. Initialize project directory
mkdir ai-revenue-recovery && cd ai-revenue-recovery
npm init -y

# 2. Install production dependencies
npm install express dotenv firebase lucide-react motion react react-dom @google/genai

# 3. Install developer dependencies (Vite, TypeScript, Tailwind, tsx, esbuild)
npm install -D vite @vitejs/plugin-react @tailwindcss/vite tailwindcss @types/express @types/node tsx esbuild typescript

# 4. Run the full-stack dev server
npm run dev`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#080808] border border-[#222] rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#222] flex items-center justify-between bg-[#080808]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-[#141414] border border-[#222] flex items-center justify-center text-orange-400 shadow-[0_0_12px_rgba(234,88,12,0.15)]">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif italic text-white tracking-wide">Project Structure & Copy-Pasteable Code</h3>
              <p className="text-xs text-[#777]">Complete folder map, terminal initialization commands & configurations</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#666] hover:text-white p-1 rounded hover:bg-[#161616] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#222] px-5 text-xs overflow-x-auto bg-[#050505]">
          <button
            onClick={() => setActiveTab('structure')}
            className={`py-3 px-3 font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'structure'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-[#777] hover:text-[#CCC]'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            Folder Structure
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`py-3 px-3 font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'commands'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-[#777] hover:text-[#CCC]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Install Commands
          </button>
          <button
            onClick={() => setActiveTab('server')}
            className={`py-3 px-3 font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'server'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-[#777] hover:text-[#CCC]'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            server.ts
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
            firebase.ts
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3 px-3 font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'rules'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-[#777] hover:text-[#CCC]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            firestore.rules
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 text-xs bg-[#080808]">
          {activeTab === 'structure' && (
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between text-[#777]">
                <span>Production Project Tree</span>
                <button
                  onClick={() => copyToClipboard(folderStructureText, 'tree')}
                  className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 cursor-pointer"
                >
                  {copiedSection === 'tree' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedSection === 'tree' ? 'Copied' : 'Copy Tree'}
                </button>
              </div>
              <pre className="p-4 bg-[#050505] rounded border border-[#222] text-[#BBB] leading-relaxed overflow-x-auto text-[11px]">
                {folderStructureText}
              </pre>
            </div>
          )}

          {activeTab === 'commands' && (
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between text-[#777]">
                <span>Bash / Terminal CLI Initialization</span>
                <button
                  onClick={() => copyToClipboard(installCommands, 'cmds')}
                  className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 cursor-pointer"
                >
                  {copiedSection === 'cmds' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedSection === 'cmds' ? 'Copied' : 'Copy Commands'}
                </button>
              </div>
              <pre className="p-4 bg-[#050505] rounded border border-[#222] text-orange-300/90 leading-relaxed overflow-x-auto text-[11px]">
                {installCommands}
              </pre>
            </div>
          )}

          {activeTab === 'server' && (
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between text-[#777]">
                <span>Express Server Endpoints (Webhook + Call trigger + WhatsApp action)</span>
                <button
                  onClick={() => copyToClipboard('// See /server.ts in project files', 'server')}
                  className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 cursor-pointer"
                >
                  {copiedSection === 'server' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedSection === 'server' ? 'Copied' : 'Copy server.ts'}
                </button>
              </div>
              <div className="p-4 bg-[#050505] rounded border border-[#222] text-[#CCC] space-y-2 text-[11px]">
                <p className="text-orange-400 font-semibold">1. POST /api/webhooks/razorpay</p>
                <p className="text-[#888]">Receives & verifies Razorpay payment.failed payload and adds failed checkout to Firestore.</p>

                <p className="text-orange-400 font-semibold pt-2">2. POST /api/recovery/trigger-call</p>
                <p className="text-[#888]">Initiates outbound Hinglish voice call via Vapi.ai / Bland.ai REST API with personalized prompt.</p>

                <p className="text-orange-400 font-semibold pt-2">3. POST /api/voice-agent/callback</p>
                <p className="text-[#888]">Voice agent tool-call destination that delivers WhatsApp 1-tap payment link via Meta Graph API.</p>
              </div>
            </div>
          )}

          {activeTab === 'firebase' && (
            <div className="space-y-3 font-mono">
              <div className="p-4 bg-[#050505] rounded border border-[#222] text-[#CCC] space-y-2 text-[11px]">
                <p className="text-orange-400 font-semibold">Firebase SDK Client (src/firebase.ts)</p>
                <p className="text-[#888]">Supports both real Firebase Auth / Firestore and instant seamless developer demo mode.</p>
                <p className="text-[#888]">Functions exported: <code className="text-orange-400">loginWithGoogle()</code>, <code className="text-orange-400">loginWithEmail()</code>, <code className="text-orange-400">logoutUser()</code>, <code className="text-orange-400">db</code>, <code className="text-orange-400">auth</code>.</p>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3 font-mono">
              <div className="p-4 bg-[#050505] rounded border border-[#222] text-[#CCC] space-y-2 text-[11px]">
                <p className="text-orange-400 font-semibold">Zero-Trust Firestore Rules (firestore.rules)</p>
                <p className="text-[#888]">Enforces Attribute-Based Access Control on collections: <code className="text-orange-400">/merchants/&#123;merchantId&#125;</code>, <code className="text-orange-400">/failed_payments/&#123;paymentId&#125;</code>, <code className="text-orange-400">/recovery_sessions/&#123;sessionId&#125;</code>.</p>
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
