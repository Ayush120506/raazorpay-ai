import React, { useState } from 'react';
import { FailedPayment } from '../types';
import { 
  X, 
  CheckCircle2, 
  ExternalLink, 
  MessageSquare, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight,
  Code,
  Copy,
  Check
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  payment: FailedPayment | null;
  onMarkRecovered: (payment: FailedPayment) => Promise<void>;
}

export const WhatsAppPreviewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  payment,
  onMarkRecovered
}) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !payment) return null;

  const discountedAmount = Math.round(payment.amount * 0.9);
  const paymentLink = payment.paymentLinkUrl || `https://rzp.io/i/rec_${payment.orderId.replace(/[^a-zA-Z0-9]/g, '')}`;

  const handleSimulatePayment = async () => {
    setIsRecovering(true);
    try {
      await onMarkRecovered(payment);
      onClose();
    } finally {
      setIsRecovering(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#080808] border border-[#222] rounded-xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#080808]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif italic text-white tracking-wide">WhatsApp Cloud API Delivery</h3>
              <p className="text-[11px] text-[#777]">Recipient: <span className="font-mono text-orange-400">{payment.customerPhone}</span></p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowJson(!showJson)}
              className="px-2.5 py-1 text-xs rounded bg-[#111] text-[#CCC] border border-[#222] hover:text-white cursor-pointer"
            >
              {showJson ? 'View UI' : 'API JSON'}
            </button>
            <button
              onClick={onClose}
              className="text-[#666] hover:text-white p-1 rounded hover:bg-[#161616] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 text-xs bg-[#080808]">
          {!showJson ? (
            /* Smartphone Chat UI */
            <div className="max-w-[340px] mx-auto bg-[#0b141a] rounded-[24px] border-4 border-[#222] shadow-2xl overflow-hidden font-sans">
              {/* WhatsApp App Top Bar */}
              <div className="bg-[#1f2c34] px-4 py-2.5 flex items-center justify-between border-b border-[#2a3942]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold text-xs">
                    S
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100 text-xs flex items-center gap-1">
                      StyleHub Support
                      <ShieldCheck className="w-3 h-3 text-[#00a884]" />
                    </div>
                    <div className="text-[10px] text-[#8696a0]">Verified Business Account</div>
                  </div>
                </div>
              </div>

              {/* Message Thread */}
              <div className="p-3 space-y-3 bg-[#0c1317] min-h-[360px] flex flex-col justify-end bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
                {/* Received Bubble */}
                <div className="bg-[#1f2c34] text-[#e9edef] rounded-2xl rounded-tl-none p-3.5 shadow-md max-w-[92%] space-y-2 border border-[#2a3942]/60">
                  {/* Header Title */}
                  <div className="font-bold text-sm text-[#00a884] flex items-center gap-1">
                    ⚡ Complete Your Order
                  </div>

                  {/* Body */}
                  <div className="text-xs leading-relaxed text-[#d1d7db] space-y-1.5">
                    <p>Namaste <strong>{payment.customerName}</strong>! Priya here from StyleHub support.</p>
                    <p>Here is your reserved 1-click checkout link for <strong>{payment.productName}</strong>.</p>
                    
                    <div className="p-2 rounded bg-[#111b21] border border-[#222e35] my-1 text-[11px]">
                      <div>🏷️ <strong>Coupon:</strong> RECOVER10 (10% OFF)</div>
                      <div>💰 <strong>Amount:</strong> <span className="line-through text-[#8696a0]">₹{payment.amount}</span> <span className="text-[#00a884] font-bold font-mono">₹{discountedAmount}</span></div>
                      <div className="truncate text-[#8696a0] text-[10px] mt-0.5 font-mono">{paymentLink}</div>
                    </div>
                  </div>

                  {/* WhatsApp Quick Reply Button */}
                  <div className="pt-2 border-t border-[#2a3942]/60">
                    <button
                      onClick={handleSimulatePayment}
                      className="w-full py-2 px-3 rounded bg-[#00a884] hover:bg-[#008f70] text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>💳 Pay via UPI / Razorpay (₹{discountedAmount})</span>
                    </button>
                  </div>

                  <div className="text-[9px] text-[#8696a0] text-right">
                    Just now • Sent via Meta Cloud API
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Meta API JSON inspector */
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between text-[#777]">
                <span className="text-[10px]">POST https://graph.facebook.com/v19.0/messages</span>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy Link'}
                </button>
              </div>
              <pre className="p-3.5 bg-[#050505] rounded border border-[#222] text-[#CCC] text-[11px] overflow-x-auto">
{JSON.stringify({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to: payment.customerPhone.replace(/[^0-9]/g, ''),
  type: "interactive",
  interactive: {
    type: "button",
    header: {
      type: "text",
      text: "⚡ Complete Your Order"
    },
    body: {
      text: `Namaste ${payment.customerName}! Priya here from StyleHub. Here is your direct checkout link for ${payment.productName}.\n\n🏷️ Coupon: RECOVER10 (10% OFF)\n💰 Payable: ₹${discountedAmount}\n\nClick below to pay with UPI or card:`
    },
    action: {
      buttons: [
        {
          type: "reply",
          reply: {
            id: `pay_${payment.orderId}`,
            title: `💳 Pay ₹${discountedAmount} via UPI`
          }
        }
      ]
    }
  }
}, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#222] bg-[#050505] flex items-center justify-between">
          <div className="text-xs text-[#777]">
            Status: <span className="text-green-400 font-mono font-semibold">{payment.recoveryStatus}</span>
          </div>

          <button
            onClick={handleSimulatePayment}
            disabled={isRecovering || payment.recoveryStatus === 'recovered'}
            className="flex items-center space-x-1.5 px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-colors cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{payment.recoveryStatus === 'recovered' ? 'Payment Recovered!' : isRecovering ? 'Processing...' : 'Simulate Customer Completing Payment'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
