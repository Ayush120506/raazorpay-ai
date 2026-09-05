import { FailedPayment, RazorpayWebhookPayload } from '../types';

export async function fetchPayments(): Promise<FailedPayment[]> {
  const res = await fetch('/api/payments');
  if (!res.ok) {
    throw new Error(`Failed to fetch payments: ${res.statusText}`);
  }
  const data = await res.json();
  return data.payments || [];
}

export async function simulateRazorpayWebhook(
  payload: any, 
  autoTrigger: boolean = true
): Promise<{ success: boolean; payment: FailedPayment; message: string }> {
  const res = await fetch(`/api/webhooks/razorpay?autoTrigger=${autoTrigger}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Razorpay-Signature': 'simulated_sig_checkout_rescue'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to simulate webhook');
  }
  return res.json();
}

export async function triggerRecoveryCall(params: {
  paymentId: string;
  preferredLanguage?: 'hinglish' | 'english' | 'hindi';
  offerDiscount?: boolean;
  discountPercentage?: number;
}): Promise<{ success: boolean; payment: FailedPayment; message: string; provider: string }> {
  const res = await fetch('/api/recovery/trigger-call', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to trigger voice recovery call');
  }
  return res.json();
}

export async function triggerWhatsAppLink(params: {
  paymentId: string;
  orderId: string;
  customerPhone: string;
  customerName: string;
  discountCode?: string;
}): Promise<{ success: boolean; payment: FailedPayment; paymentLink: string }> {
  const res = await fetch('/api/voice-agent/callback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to trigger WhatsApp link');
  }
  return res.json();
}

export async function markPaymentRecovered(paymentId: string): Promise<FailedPayment> {
  const res = await fetch(`/api/payments/${paymentId}/mark-recovered`, {
    method: 'POST'
  });
  if (!res.ok) {
    throw new Error('Failed to mark payment as recovered');
  }
  const data = await res.json();
  return data.payment;
}

export async function resetDemoPayments(): Promise<FailedPayment[]> {
  const res = await fetch('/api/payments/reset-demo', {
    method: 'POST'
  });
  const data = await res.json();
  return data.payments;
}

export async function fetchHealth(): Promise<any> {
  const res = await fetch('/api/health');
  return res.json();
}
