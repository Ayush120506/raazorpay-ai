export type RecoveryStatus = 
  | 'failed' 
  | 'call_queued'
  | 'call_in_progress'
  | 'customer_interested'
  | 'whatsapp_link_sent'
  | 'recovered'
  | 'abandoned';

export interface FailedPayment {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  amount: number; // in INR
  currency: string;
  productName: string;
  failureReason: string;
  createdAt: string;
  recoveryStatus: RecoveryStatus;
  vapiCallId?: string;
  whatsappMessageId?: string;
  discountOffered?: string;
  callDurationSeconds?: number;
  transcript?: Array<{
    speaker: 'agent' | 'customer';
    text: string;
    timestamp: string;
  }>;
  paymentLinkUrl?: string;
  recoveredAt?: string;
}

export interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: 'payment.failed' | 'order.paid';
  contains: string[];
  payload: {
    payment: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        method: string;
        email: string;
        contact: string;
        error_code: string;
        error_description: string;
        notes?: {
          customer_name?: string;
          product_name?: string;
          cart_id?: string;
        };
      };
    };
  };
  created_at: number;
}

export interface RecoveryCallRequest {
  paymentId: string;
  customerPhone: string;
  customerName: string;
  amount: number;
  productName: string;
  preferredLanguage?: 'hinglish' | 'english' | 'hindi';
  offerDiscount?: boolean;
  discountPercentage?: number;
}

export interface WhatsAppSendRequest {
  paymentId: string;
  customerPhone: string;
  customerName: string;
  amount: number;
  productName: string;
  paymentLink: string;
  couponCode?: string;
}

export interface VoiceAgentToolCall {
  name: 'send_whatsapp_payment_link';
  parameters: {
    order_id: string;
    customer_phone: string;
    discount_code?: string;
    agreed_amount?: number;
  };
}

export type GeminiModelId = 
  | 'gemini-3.5-flash'
  | 'gemini-3.1-flash-lite'
  | 'gemini-3.1-pro-preview';

export type ChatRoleKey = 
  | 'recovery_strategist'
  | 'customer_persona'
  | 'payment_architect';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

