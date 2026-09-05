import React from 'react';
import { MerchantUser } from '../firebase';
import { 
  Bot, 
  Radio, 
  Sparkles, 
  Code2, 
  BookOpen, 
  PlusCircle, 
  LogOut, 
  UserCircle,
  RefreshCw,
  Zap
} from 'lucide-react';

interface Props {
  currentUser: MerchantUser | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onOpenWebhookModal: () => void;
  onOpenSetupGuide: () => void;
  onOpenCodeDocs: () => void;
  onOpenGeminiChat: () => void;
  onResetDemo: () => void;
  isResetting: boolean;
  serverStatus: any;
}

export const Navbar: React.FC<Props> = ({
  currentUser,
  onLoginClick,
  onLogoutClick,
  onOpenWebhookModal,
  onOpenSetupGuide,
  onOpenCodeDocs,
  onOpenGeminiChat,
  onResetDemo,
  isResetting,
  serverStatus
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#080808]/90 backdrop-blur-md border-b border-[#222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand identity: REV.AI / AI Revenue Recovery */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 bg-orange-600 rounded-full shadow-[0_0_15px_rgba(234,88,12,0.6)] animate-pulse" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-black tracking-tighter text-white flex items-center gap-1.5">
                  REV<span className="text-orange-500">.</span>AI
                </span>
                <span className="text-[9px] font-mono tracking-[0.2em] uppercase px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  AUTONOMOUS CONCIERGE
                </span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#888] hidden sm:block font-medium">
                High-Converting Voice & WhatsApp Interventions
              </div>
            </div>
          </div>
        </div>

        {/* System telemetry & Action Buttons */}
        <div className="flex items-center space-x-2.5">
          {/* Node Active indicator */}
          <div className="hidden lg:flex items-center gap-2 mr-2 px-2.5 py-1 rounded border border-[#222] bg-[#050505]">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[10px] font-mono tracking-tight text-[#888]">
              {serverStatus?.services?.voiceProvider ? `${String(serverStatus.services.voiceProvider).toUpperCase()}_READY` : 'VAPI_NODE_ACTIVE'}
            </span>
          </div>

          {/* Quick Simulation Trigger */}
          <button
            id="btn-simulate-webhook-nav"
            onClick={onOpenWebhookModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)] transition-all cursor-pointer"
            title="Simulate incoming failed checkout webhook from Razorpay"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Simulate Razorpay</span>
            <span>Webhook</span>
          </button>

          {/* Setup Guide */}
          <button
            id="btn-setup-guide-nav"
            onClick={onOpenSetupGuide}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded bg-[#080808] hover:bg-[#141414] text-[#DDD] border border-[#222] hover:border-[#333] transition-all cursor-pointer"
            title="Step-by-step free tier setup guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">Setup Guide</span>
          </button>

          {/* Code & Project Structure */}
          <button
            id="btn-code-docs-nav"
            onClick={onOpenCodeDocs}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded bg-[#080808] hover:bg-[#141414] text-[#DDD] border border-[#222] hover:border-[#333] transition-all cursor-pointer"
            title="View code, folder structure & npm commands"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Code & Commands</span>
          </button>

          {/* Gemini AI Chat Advisor */}
          <button
            id="btn-gemini-chat-nav"
            onClick={onOpenGeminiChat}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded bg-[#101010] hover:bg-orange-950/30 text-orange-300 border border-orange-500/40 hover:border-orange-500/70 transition-all cursor-pointer shadow-[0_0_10px_rgba(234,88,12,0.15)]"
            title="Open Gemini Recovery AI multi-turn assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-semibold">Gemini AI</span>
            <span className="hidden xl:inline text-[9px] font-mono px-1 py-0.2 rounded bg-orange-500/20 text-orange-300">
              Multi-Turn
            </span>
          </button>

          {/* Reset Demo Data */}
          <button
            id="btn-reset-demo-nav"
            onClick={onResetDemo}
            disabled={isResetting}
            className="p-2 text-[#777] hover:text-[#FFF] hover:bg-[#141414] border border-[#222] rounded transition-all cursor-pointer disabled:opacity-50"
            title="Reset to initial test checkouts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-orange-400' : ''}`} />
          </button>

          {/* Auth Button */}
          {currentUser ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-[#222]">
              <div className="hidden xl:block text-right">
                <div className="text-xs font-medium text-[#EEE]">{currentUser.displayName || 'Merchant Admin'}</div>
                <div className="text-[10px] font-mono text-[#666]">{currentUser.email || 'Admin'}</div>
              </div>
              <button
                id="btn-logout-nav"
                onClick={onLogoutClick}
                className="p-1.5 rounded bg-[#080808] hover:bg-red-950/40 text-[#777] hover:text-red-400 border border-[#222] hover:border-red-900/50 transition-all cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-login-nav"
              onClick={onLoginClick}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-[#111] hover:bg-[#191919] text-[#EEE] border border-[#333] transition-all cursor-pointer"
            >
              <UserCircle className="w-3.5 h-3.5 text-orange-400" />
              <span>Merchant Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
