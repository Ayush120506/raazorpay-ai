import React, { useState, useEffect } from 'react';
import { FailedPayment } from './types';
import { 
  fetchPayments, 
  simulateRazorpayWebhook, 
  triggerRecoveryCall, 
  triggerWhatsAppLink, 
  markPaymentRecovered, 
  resetDemoPayments,
  fetchHealth 
} from './services/api';
import { INITIAL_FAILED_PAYMENTS } from './services/mockData';
import { 
  getStoredUser, 
  logoutUser, 
  MerchantUser, 
  subscribeToFirestorePayments, 
  persistPaymentToFirestore, 
  updatePaymentStatusInFirestore,
  auth 
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { Navbar } from './components/Navbar';
import { MetricsBar } from './components/MetricsBar';
import { FailedPaymentsTable } from './components/FailedPaymentsTable';
import { WebhookSimulator } from './components/WebhookSimulator';
import { VoiceCallModal } from './components/VoiceCallModal';
import { WhatsAppPreviewModal } from './components/WhatsAppPreviewModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import { IntegrationDocsModal } from './components/IntegrationDocsModal';
import { LoginModal } from './components/LoginModal';
import { GeminiChatModal } from './components/GeminiChatModal';

import { 
  Bot, 
  MessageSquare, 
  PhoneCall, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  Info
} from 'lucide-react';

export default function App() {
  const [payments, setPayments] = useState<FailedPayment[]>(INITIAL_FAILED_PAYMENTS);
  const [currentUser, setCurrentUser] = useState<MerchantUser | null>(null);
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [callingPaymentId, setCallingPaymentId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modals state
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [voiceCallModalOpen, setVoiceCallModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [setupGuideModalOpen, setSetupGuideModalOpen] = useState(false);
  const [codeDocsModalOpen, setCodeDocsModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [geminiChatModalOpen, setGeminiChatModalOpen] = useState(false);

  const [activePaymentForModal, setActivePaymentForModal] = useState<FailedPayment | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Initial data loading & real-time sync with Firebase Auth and Firestore
  useEffect(() => {
    // 1. Firebase Auth listener for Google sign-in and session persistence
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const merchantUser: MerchantUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Merchant Admin',
          photoURL: firebaseUser.photoURL,
          isDemo: false
        };
        setCurrentUser(merchantUser);
        localStorage.setItem('checkout_rescue_user', JSON.stringify(merchantUser));
      } else {
        const savedUser = getStoredUser();
        if (savedUser) {
          setCurrentUser(savedUser);
        } else {
          // Default demo merchant logged in for immediate testing
          const defaultUser: MerchantUser = {
            uid: 'merchant_demo_01',
            email: 'merchant.admin@stylehub.store',
            displayName: 'Aman Gupta (Store Admin)',
            isDemo: true
          };
          setCurrentUser(defaultUser);
        }
      }
    });

    // 2. Real-time Firestore sync for failed payments
    const unsubscribeFirestore = subscribeToFirestorePayments((updatedList) => {
      if (updatedList && updatedList.length > 0) {
        setPayments(updatedList);
      }
    }, INITIAL_FAILED_PAYMENTS);

    // 3. Check server health
    fetchHealth()
      .then(res => setServerStatus(res))
      .catch(() => console.log('Backend starting up...'));

    return () => {
      unsubscribeAuth();
      unsubscribeFirestore();
    };
  }, []);

  const loadPayments = async () => {
    try {
      const data = await fetchPayments();
      if (data && data.length > 0) {
        setPayments(data);
      }
    } catch (err) {
      console.warn('Using local fallback state:', err);
    }
  };

  // 1. Trigger Razorpay Webhook
  const handleSendWebhook = async (payload: any, autoTrigger: boolean) => {
    try {
      const res = await simulateRazorpayWebhook(payload, autoTrigger);
      showToast(`Webhook received: Order #${res.payment.orderId} recorded!`, 'success');
      
      // Persist to Cloud Firestore
      await persistPaymentToFirestore(res.payment);
      await loadPayments();

      if (autoTrigger) {
        // Automatically dial
        handleTriggerCall(res.payment);
      }
    } catch (err: any) {
      showToast(err.message || 'Webhook simulation failed', 'error');
    }
  };

  // 2. Trigger AI Voice Call (Hinglish)
  const handleTriggerCall = async (payment: FailedPayment) => {
    setCallingPaymentId(payment.id);
    showToast(`Dialing ${payment.customerName} (+${payment.customerPhone}) in Hinglish AI Voice...`, 'info');

    try {
      const res = await triggerRecoveryCall({
        paymentId: payment.id,
        preferredLanguage: 'hinglish',
        offerDiscount: true,
        discountPercentage: 10
      });

      showToast(`Voice call completed! Customer agreed to 10% discount. WhatsApp link sent!`, 'success');
      
      // Persist call session & status in Cloud Firestore
      const updated = res.payment || payment;
      await updatePaymentStatusInFirestore(payment.id, {
        recoveryStatus: 'whatsapp_link_sent',
        discountOffered: updated.discountOffered || 'RECOVER10 (10% OFF)',
        callDurationSeconds: updated.callDurationSeconds || 45,
        transcript: updated.transcript,
        paymentLinkUrl: updated.paymentLinkUrl
      });
      await loadPayments();

      // Open Voice modal so user can inspect transcript & listen
      setActivePaymentForModal(updated);
      setVoiceCallModalOpen(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to trigger voice call', 'error');
    } finally {
      setCallingPaymentId(null);
    }
  };

  // 3. Trigger WhatsApp Message Callback
  const handleSendWhatsApp = async (payment: FailedPayment) => {
    try {
      const res = await triggerWhatsAppLink({
        paymentId: payment.id,
        orderId: payment.orderId,
        customerPhone: payment.customerPhone,
        customerName: payment.customerName,
        discountCode: 'RECOVER10'
      });

      showToast(`WhatsApp 1-click checkout message delivered via Meta Cloud API!`, 'success');
      
      // Update in Cloud Firestore
      const updated = res.payment || payment;
      await updatePaymentStatusInFirestore(payment.id, {
        recoveryStatus: 'whatsapp_link_sent',
        whatsappMessageId: updated.whatsappMessageId,
        paymentLinkUrl: updated.paymentLinkUrl
      });
      await loadPayments();

      setActivePaymentForModal(updated);
      setVoiceCallModalOpen(false);
      setWhatsappModalOpen(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to send WhatsApp message', 'error');
    }
  };

  // 4. Mark Recovered
  const handleMarkRecovered = async (payment: FailedPayment) => {
    try {
      await markPaymentRecovered(payment.id);
      showToast(`Payment of ₹${payment.amount} successfully recovered!`, 'success');
      
      // Update status in Cloud Firestore
      await updatePaymentStatusInFirestore(payment.id, {
        recoveryStatus: 'recovered',
        recoveredAt: new Date().toISOString()
      });
      await loadPayments();
    } catch (err: any) {
      showToast(err.message || 'Failed to mark payment as recovered', 'error');
    }
  };

  // 5. Reset Demo Data
  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const fresh = await resetDemoPayments();
      setPayments(fresh);
      showToast('Dashboard reset to initial checkout samples', 'info');
    } catch (err) {
      setPayments(INITIAL_FAILED_PAYMENTS);
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    showToast('Signed out of Merchant Dashboard', 'info');
  };

  const totalRecoveredAmount = payments
    .filter(p => p.recoveryStatus === 'recovered')
    .reduce((sum, p) => sum + p.amount, 0);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F0F0F0] flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded shadow-2xl border text-xs font-medium flex items-center space-x-2 ${
            toastMessage.type === 'success' 
              ? 'bg-[#080808] border-emerald-500/40 text-emerald-300' 
              : toastMessage.type === 'error'
              ? 'bg-[#080808] border-red-500/40 text-red-300'
              : 'bg-[#080808] border-orange-500/40 text-orange-300'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        currentUser={currentUser}
        onLoginClick={() => setLoginModalOpen(true)}
        onLogoutClick={handleLogout}
        onOpenWebhookModal={() => setWebhookModalOpen(true)}
        onOpenSetupGuide={() => setSetupGuideModalOpen(true)}
        onOpenCodeDocs={() => setCodeDocsModalOpen(true)}
        onOpenGeminiChat={() => setGeminiChatModalOpen(true)}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
        serverStatus={serverStatus}
      />

      {/* Editorial Header Section */}
      <section className="border-b border-[#222] bg-[#080808]/40 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif italic tracking-tighter leading-none text-white">
              Recovery Architecture
            </h1>
            <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-[#888] mt-3 font-semibold flex items-center gap-2.5">
              <span>Autonomous Concierge</span>
              <span className="text-[#333]">•</span>
              <span>Model V3 (Hinglish + WhatsApp)</span>
              <span className="text-[#333]">•</span>
              <span className="text-orange-400">Gemini 3.5 Intelligence</span>
            </div>
          </div>
          <div className="md:text-right border-l md:border-l-0 pl-4 md:pl-0 border-[#222]">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#777] mb-1 font-medium">Total Recovered</div>
            <div className="text-3xl sm:text-4xl font-light tracking-tighter text-white font-mono">
              {formatINR(totalRecoveredAmount)}
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Recovery Lifecycle Architecture Banner */}
        <div className="bg-[#080808] border border-[#222] rounded-xl p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 text-orange-400 text-[10px] font-semibold uppercase tracking-[0.25em]">
                <Sparkles className="w-3 h-3" />
                <span>Autonomous Checkout Recovery Workflow</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif italic text-white tracking-tight mt-1">
                From Abandoned Cart to Paid Order in 90 Seconds
              </h2>
              <p className="text-xs text-[#888] mt-1 max-w-2xl leading-relaxed">
                When an order fails on Razorpay, our AI voice agent calls the customer in polite urban Hinglish to offer assistance and a custom coupon code, then dispatches an instant 1-tap WhatsApp payment link.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => setGeminiChatModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-950/40 hover:bg-orange-950/70 border border-orange-500/40 hover:border-orange-500 text-orange-300 text-xs font-medium cursor-pointer transition-all shadow-[0_0_10px_rgba(234,88,12,0.15)]"
                >
                  <Bot className="w-3.5 h-3.5 text-orange-400" />
                  <span>Consult Gemini Strategist</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
                <button
                  onClick={() => setWebhookModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111] hover:bg-[#181818] border border-[#262626] text-[#BBB] hover:text-white text-xs font-medium cursor-pointer transition-all"
                >
                  <span>Test Razorpay Drop-off</span>
                </button>
              </div>
            </div>

            {/* Workflow steps in clean editorial sequence */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
              <div className="bg-[#050505] border border-[#222] rounded p-3">
                <div className="w-6 h-6 rounded bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-1.5 border border-red-500/20">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <div className="font-semibold text-[#EEE] text-xs">1. Razorpay</div>
                <div className="text-[10px] text-[#666] font-mono mt-0.5">PAYMENT_FAILED</div>
              </div>

              <div className="bg-[#050505] border border-[#222] rounded p-3">
                <div className="w-6 h-6 rounded bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-1.5 border border-orange-500/20">
                  <PhoneCall className="w-3.5 h-3.5" />
                </div>
                <div className="font-semibold text-[#EEE] text-xs">2. Voice AI</div>
                <div className="text-[10px] text-[#666] font-mono mt-0.5">HINGLISH_DIAL</div>
              </div>

              <div className="bg-[#050505] border border-[#222] rounded p-3">
                <div className="w-6 h-6 rounded bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-1.5 border border-green-500/20">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="font-semibold text-[#EEE] text-xs">3. WhatsApp</div>
                <div className="text-[10px] text-[#666] font-mono mt-0.5">META_CLOUD_API</div>
              </div>

              <div className="bg-[#050505] border border-[#222] rounded p-3">
                <div className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-1.5 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="font-semibold text-[#EEE] text-xs">4. Recovered</div>
                <div className="text-[10px] text-[#666] font-mono mt-0.5">REVENUE_CAPTURED</div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Overview */}
        <MetricsBar payments={payments} />

        {/* Failed Payments Table */}
        <FailedPaymentsTable
          payments={payments}
          onTriggerCall={handleTriggerCall}
          onViewCall={payment => {
            setActivePaymentForModal(payment);
            setVoiceCallModalOpen(true);
          }}
          onViewWhatsApp={payment => {
            setActivePaymentForModal(payment);
            setWhatsappModalOpen(true);
          }}
          onMarkRecovered={handleMarkRecovered}
          callingPaymentId={callingPaymentId}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-8 text-center text-xs text-[#666] bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="tracking-wide">
            AI Revenue Recovery Architecture • Free-Tier Stack (Express + Firebase + Vapi/Groq + Meta WhatsApp)
          </div>
          <div className="flex items-center space-x-3 text-[#777] font-mono text-[11px]">
            <button
              onClick={() => setSetupGuideModalOpen(true)}
              className="hover:text-orange-400 transition-colors cursor-pointer"
            >
              Setup Guide
            </button>
            <span className="text-[#333]">•</span>
            <button
              onClick={() => setCodeDocsModalOpen(true)}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Code & Docs
            </button>
            <span className="text-[#333]">•</span>
            <button
              onClick={() => setWebhookModalOpen(true)}
              className="hover:text-orange-400 transition-colors cursor-pointer"
            >
              Simulate Webhook
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <WebhookSimulator
        isOpen={webhookModalOpen}
        onClose={() => setWebhookModalOpen(false)}
        onSendWebhook={handleSendWebhook}
      />

      <VoiceCallModal
        isOpen={voiceCallModalOpen}
        onClose={() => setVoiceCallModalOpen(false)}
        payment={activePaymentForModal}
        onSendWhatsApp={handleSendWhatsApp}
      />

      <WhatsAppPreviewModal
        isOpen={whatsappModalOpen}
        onClose={() => setWhatsappModalOpen(false)}
        payment={activePaymentForModal}
        onMarkRecovered={handleMarkRecovered}
      />

      <SetupGuideModal
        isOpen={setupGuideModalOpen}
        onClose={() => setSetupGuideModalOpen(false)}
      />

      <IntegrationDocsModal
        isOpen={codeDocsModalOpen}
        onClose={() => setCodeDocsModalOpen(false)}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={user => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.displayName || 'Merchant Admin'}!`, 'success');
        }}
      />

      {/* Gemini AI Multi-Turn Chat Modal */}
      <GeminiChatModal
        isOpen={geminiChatModalOpen}
        onClose={() => setGeminiChatModalOpen(false)}
        payments={payments}
      />

      {/* Floating Gemini AI Concierge Trigger */}
      <aside aria-label="Gemini Assistant" className="fixed bottom-6 right-6 z-40">
        <button
          id="btn-gemini-chat-fab"
          onClick={() => setGeminiChatModalOpen(true)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0d0d0d] hover:bg-[#141414] text-white border border-orange-500/60 hover:border-orange-500 shadow-[0_0_24px_rgba(234,88,12,0.35)] transition-all cursor-pointer group"
          title="Open Gemini Recovery AI multi-turn assistant"
        >
          <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-[0_0_10px_rgba(234,88,12,0.6)] group-hover:scale-110 transition-transform">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-serif italic tracking-wide text-orange-200">Gemini AI Strategist</div>
            <div className="text-[9px] font-mono text-[#777]">Hinglish Scripts & Roleplay</div>
          </div>
        </button>
      </aside>
    </div>
  );
}
