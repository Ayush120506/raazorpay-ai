import React, { useState } from 'react';
import { X, Send, Play, Copy, Check, ShieldAlert, Sparkles, Terminal } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSendWebhook: (payload: any, autoTrigger: boolean) => Promise<void>;
}

const PRESETS = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    amount: 2499,
    customer: 'Rahul Sharma',
    phone: '+919876543210',
    email: 'rahul.sharma@example.com',
    error: 'Customer card 3D-Secure OTP verification timed out',
    method: 'card'
  },
  {
    name: 'Chanderi Silk Festive Kurta Set',
    amount: 4899,
    customer: 'Pooja Verma',
    phone: '+919123456789',
    email: 'pooja.verma@example.com',
    error: 'UPI Intent App timeout on PhonePe bank gateway',
    method: 'upi'
  },
  {
    name: 'Plant Protein Supplement 1kg',
    amount: 1999,
    customer: 'Vikram Mehta',
    phone: '+919811223344',
    email: 'vikram.mehta@example.com',
    error: 'Insufficient account balance on debit card',
    method: 'card'
  },
  {
    name: 'Sneakers Sport Edition (UK 8)',
    amount: 5490,
    customer: 'Aarav Malhotra',
    phone: '+919820011223',
    email: 'aarav.m@example.com',
    error: 'Payment authorization declined by customer issuing bank',
    method: 'netbanking'
  }
];

export const WebhookSimulator: React.FC<Props> = ({
  isOpen,
  onClose,
  onSendWebhook
}) => {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [customerName, setCustomerName] = useState(PRESETS[0].customer);
  const [customerPhone, setCustomerPhone] = useState(PRESETS[0].phone);
  const [customerEmail, setCustomerEmail] = useState(PRESETS[0].email);
  const [productName, setProductName] = useState(PRESETS[0].name);
  const [amount, setAmount] = useState(PRESETS[0].amount);
  const [errorDesc, setErrorDesc] = useState(PRESETS[0].error);
  const [autoTrigger, setAutoTrigger] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setSelectedPreset(preset);
    setCustomerName(preset.customer);
    setCustomerPhone(preset.phone);
    setCustomerEmail(preset.email);
    setProductName(preset.name);
    setAmount(preset.amount);
    setErrorDesc(preset.error);
  };

  const samplePayload = {
    entity: 'event',
    account_id: 'acc_stylehub_live',
    event: 'payment.failed',
    contains: ['payment'],
    payload: {
      payment: {
        entity: {
          id: `pay_sim_${Date.now().toString(36)}`,
          amount: amount * 100, // Razorpay uses paisa
          currency: 'INR',
          status: 'failed',
          order_id: `order_IN_${Math.floor(1000 + Math.random() * 9000)}`,
          method: selectedPreset.method,
          email: customerEmail,
          contact: customerPhone,
          error_code: 'BAD_REQUEST_ERROR',
          error_description: errorDesc,
          notes: {
            customer_name: customerName,
            product_name: productName,
            cart_id: `cart_${Date.now()}`
          }
        }
      }
    },
    created_at: Math.floor(Date.now() / 1000)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSendWebhook(samplePayload, autoTrigger);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCurl = () => {
    const curl = `curl -X POST http://localhost:3000/api/webhooks/razorpay?autoTrigger=${autoTrigger} \\
  -H "Content-Type: application/json" \\
  -H "X-Razorpay-Signature: test_signature" \\
  -d '${JSON.stringify(samplePayload, null, 2)}'`;
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#080808] border border-[#222] rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#222] flex items-center justify-between bg-[#080808]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif italic text-white tracking-wide">Simulate Razorpay "payment.failed" Webhook</h3>
              <p className="text-xs text-[#777]">Triggers backend endpoint <code className="text-orange-400 font-mono">POST /api/webhooks/razorpay</code></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#666] hover:text-white p-1 rounded hover:bg-[#161616] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs bg-[#080808]">
          {/* Presets */}
          <div>
            <label className="block font-medium text-[#AAA] mb-2 uppercase text-[10px] tracking-widest font-mono">Quick Presets (Indian E-Commerce Abandoned Checkouts):</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                    productName === preset.name
                      ? 'bg-[#141414] border-orange-500/70 text-white shadow-[0_0_10px_rgba(234,88,12,0.1)]'
                      : 'bg-[#0c0c0c] border-[#222] text-[#999] hover:border-[#333]'
                  }`}
                >
                  <div className="font-medium truncate text-white">{preset.name}</div>
                  <div className="flex justify-between text-[11px] text-[#777] mt-1">
                    <span>{preset.customer}</span>
                    <span className="font-mono text-orange-400">₹{preset.amount}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#777] mb-1">Customer Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-[#050505] border border-[#222] rounded px-3 py-2 text-[#EEE] focus:outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[#777] mb-1">Customer WhatsApp Phone</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#050505] border border-[#222] rounded px-3 py-2 text-[#EEE] font-mono focus:outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#777] mb-1">Product Abandoned</label>
                <input
                  type="text"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  className="w-full bg-[#050505] border border-[#222] rounded px-3 py-2 text-[#EEE] focus:outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[#777] mb-1">Checkout Amount (INR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full bg-[#050505] border border-[#222] rounded px-3 py-2 text-[#EEE] font-mono focus:outline-none focus:border-orange-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#777] mb-1">Razorpay Failure Reason</label>
              <input
                type="text"
                value={errorDesc}
                onChange={e => setErrorDesc(e.target.value)}
                className="w-full bg-[#050505] border border-[#222] rounded px-3 py-2 text-[#EEE] focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>

            {/* Auto-Trigger Toggle */}
            <div className="flex items-center justify-between p-3 rounded bg-[#0c0c0c] border border-[#222]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <div>
                  <div className="font-medium text-[#EEE]">Auto-Trigger Voice Agent</div>
                  <div className="text-[11px] text-[#777]">Automatically call customer via Voice Agent on payment failure</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoTrigger}
                  onChange={e => setAutoTrigger(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#222] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            {/* Payload Preview */}
            <div className="bg-[#050505] rounded border border-[#222] p-3 font-mono text-[11px] text-[#777]">
              <div className="flex items-center justify-between mb-1 pb-1 border-b border-[#222] text-[#BBB]">
                <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-orange-400" /> Razorpay Webhook JSON</span>
                <button
                  type="button"
                  onClick={copyCurl}
                  className="flex items-center gap-1 text-[10px] text-orange-400 hover:text-orange-300 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied cURL' : 'Copy cURL'}
                </button>
              </div>
              <pre className="overflow-x-auto text-[#888] max-h-24">
                {JSON.stringify(samplePayload, null, 2)}
              </pre>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[#777] hover:text-white rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-5 py-2 rounded bg-orange-600 hover:bg-orange-500 text-white font-semibold shadow-[0_0_12px_rgba(234,88,12,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending Webhook...' : 'Dispatch Webhook to Backend'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
