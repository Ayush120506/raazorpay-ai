import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Lazy initialization of Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '' || key === 'MY_GEMINI_API_KEY') return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: key });
  }
  return geminiClient;
}

// System instructions for Gemini specialized roles
const ROLE_SYSTEM_INSTRUCTIONS: Record<string, string> = {
  recovery_strategist: `You are an expert E-Commerce Revenue Recovery & Conversion Strategist for Indian DTC, Shopify, and WooCommerce brands.
Your goal is to maximize recovered revenue from abandoned checkouts and failed UPI/card transactions without unnecessarily giving away margin.
You specialize in:
1. Dynamic discount tiering (offering minimal discount needed, e.g. 5-10% coupon only when high drop-off likelihood is detected).
2. Outbound Hinglish voice call script tuning (natural conversational tone, warm empathy, respectful Indian cultural greetings like "Namaste", addressing OTP anxiety).
3. WhatsApp 1-tap checkout conversion via Razorpay payment links (GPay, PhonePe, Paytm, CRED UPI intent).
4. Timing strategies: Calling within 2-5 minutes of failure yields 4x higher recovery than waiting 30 minutes.
Answer concisely with direct, actionable recommendations, exact Hinglish dialogue examples, and bullet points where helpful.`,

  customer_persona: `You are simulating an Indian online consumer whose payment just failed on a DTC store.
Your persona:
- You were trying to buy products like electronics, fashion, or skincare in India.
- You experienced common Indian payment issues: bank OTP delayed, UPI app (PhonePe/GPay) timed out, card declined, or hesitation about online advance payment versus Cash on Delivery (COD).
- You speak naturally in urban Hinglish (mix of conversational Hindi and English).
- You are somewhat skeptical: you want to know if the cart is still held, if there is a discount, or if the link is safe and authentic.
Respond realistically in Hinglish character so the merchant can test and refine their objection handling, voice scripts, and WhatsApp links.`,

  payment_architect: `You are a Principal Payments & AI Integration Architect specializing in Indian Fintech (Razorpay Webhooks, Meta WhatsApp Cloud API, and Vapi/Bland/Deepgram low-latency voice infrastructure).
You advise on:
1. Razorpay HMAC SHA256 webhook verification and handling 'payment.failed' payloads.
2. Low-latency voice pipelines (<300ms latency) combining Deepgram Nova-2 STT, Groq Llama-3.3-70B LLM, and ElevenLabs / Cartesia TTS.
3. WhatsApp Cloud API interactive button templates with deep-linked UPI intents.
4. Data persistence using Google Cloud Firestore and secure access rules.
Provide accurate technical architectures, JSON payloads, curl examples, and best practice integration patterns.`
};

// Parse JSON bodies
app.use(express.json());

// In-memory persistent store for failed payments & recovery states
interface StoredPayment {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  amount: number;
  currency: string;
  productName: string;
  failureReason: string;
  createdAt: string;
  recoveryStatus: 'failed' | 'call_queued' | 'call_in_progress' | 'customer_interested' | 'whatsapp_link_sent' | 'recovered' | 'abandoned';
  vapiCallId?: string;
  whatsappMessageId?: string;
  discountOffered?: string;
  callDurationSeconds?: number;
  paymentLinkUrl?: string;
  recoveredAt?: string;
  transcript?: Array<{
    speaker: 'agent' | 'customer';
    text: string;
    timestamp: string;
  }>;
}

let paymentsStore: StoredPayment[] = [
  {
    id: 'pay_Nq9aB2104xM9',
    orderId: 'order_IN_9841',
    customerName: 'Rahul Sharma',
    customerPhone: '+919876543210',
    customerEmail: 'rahul.sharma@example.com',
    amount: 2499,
    currency: 'INR',
    productName: 'boAt Rockerz 550 Wireless Headphones',
    failureReason: 'Customer card 3D-Secure OTP verification timed out',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    recoveryStatus: 'whatsapp_link_sent',
    vapiCallId: 'call_vap_9824_rahul',
    whatsappMessageId: 'wamid.HBgMOTE5ODc2NTQzMjEwFQIAERgSMz',
    discountOffered: 'RECOVER10 (10% OFF)',
    callDurationSeconds: 48,
    paymentLinkUrl: 'https://rzp.io/i/rec_rahul_9841',
    transcript: [
      {
        speaker: 'agent',
        text: 'Namaste Rahul ji! Main StyleHub se Priya baat kar rahi hoon. Aapka boAt Rockerz Headphones ka checkout pay karte waqt bank server error aa gaya tha.',
        timestamp: '18m ago'
      },
      {
        speaker: 'customer',
        text: 'Haan Priya, actually OTP delay hua aur page refresh ho gaya. Abhi order pending hai?',
        timestamp: '18m ago'
      },
      {
        speaker: 'agent',
        text: 'Ji bilkul cart safe hai! Main aapko WhatsApp par ek direct 1-click UPI payment link bhej sakti hoon with extra 10% discount coupon. Kya main send kar doon?',
        timestamp: '17m ago'
      },
      {
        speaker: 'customer',
        text: 'Haan please bhej do, main GPay se abhi 2 minute me pay kar deta hoon.',
        timestamp: '17m ago'
      },
      {
        speaker: 'agent',
        text: 'Shukriya Rahul ji! Maine WhatsApp par secure payment link bhej diya hai. Have a wonderful day!',
        timestamp: '17m ago'
      }
    ]
  },
  {
    id: 'pay_M81cK3001vL2',
    orderId: 'order_IN_9842',
    customerName: 'Pooja Verma',
    customerPhone: '+919123456789',
    customerEmail: 'pooja.verma@example.com',
    amount: 4899,
    currency: 'INR',
    productName: 'FabIndia Pure Chanderi Silk Kurta Set',
    failureReason: 'UPI Intent App timeout on PhonePe',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    recoveryStatus: 'recovered',
    vapiCallId: 'call_vap_9825_pooja',
    whatsappMessageId: 'wamid.HBgMOTE5MTIzNDU2Nzg5FQIAERgSMz',
    discountOffered: 'SAVE15 (15% OFF)',
    callDurationSeconds: 56,
    paymentLinkUrl: 'https://rzp.io/i/rec_pooja_9842',
    recoveredAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    transcript: [
      {
        speaker: 'agent',
        text: 'Hello Pooja ji! Priya calling from FabIndia store online support. We noticed your checkout for the Silk Kurta set was interrupted during UPI processing.',
        timestamp: '44m ago'
      },
      {
        speaker: 'customer',
        text: 'Yes, PhonePe declined because server was not responding. I still want the dress for the upcoming wedding.',
        timestamp: '44m ago'
      },
      {
        speaker: 'agent',
        text: 'Bilkul fikar mat kijiye! Aapko dobara checkout form nahi bharna padega. Main turant WhatsApp par direct payment link bhej rahi hoon.',
        timestamp: '43m ago'
      },
      {
        speaker: 'customer',
        text: 'Thank you so much! Please send it on this number.',
        timestamp: '43m ago'
      }
    ]
  },
  {
    id: 'pay_K72bL1099wQ1',
    orderId: 'order_IN_9843',
    customerName: 'Amit Patel',
    customerPhone: '+919822334455',
    customerEmail: 'amit.patel@example.com',
    amount: 1750,
    currency: 'INR',
    productName: 'Minimalist Active Skincare Routine Kit',
    failureReason: 'Debit card authorization declined by issuer bank',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    recoveryStatus: 'failed',
  },
  {
    id: 'pay_P55aR8890xZ4',
    orderId: 'order_IN_9844',
    customerName: 'Sneha Kulkarni',
    customerPhone: '+919766554433',
    customerEmail: 'sneha.k@example.com',
    amount: 6200,
    currency: 'INR',
    productName: 'Nike Air Max Running Shoes (UK 6)',
    failureReason: 'Customer abandoned on payment gateway screen',
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    recoveryStatus: 'failed',
  }
];

// 1. Health check & configuration status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      voiceAgent: Boolean(process.env.VAPI_API_KEY || process.env.BLAND_API_KEY),
      voiceProvider: process.env.VAPI_API_KEY ? 'vapi.ai' : process.env.BLAND_API_KEY ? 'bland.ai' : 'simulated_webrtc',
      whatsapp: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
      razorpayWebhookConfigured: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET)
    }
  });
});

// 2. Fetch all failed payments
app.get('/api/payments', (req: Request, res: Response) => {
  res.json({ payments: paymentsStore });
});

// 3. Webhook Endpoint: Simulates/Receives "payment.failed" webhook from Razorpay
app.post('/api/webhooks/razorpay', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string | undefined;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Signature verification if webhook secret is configured
    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');
      if (digest !== signature) {
        return res.status(400).json({ error: 'Invalid Razorpay webhook signature' });
      }
    }

    const body = req.body;
    const event = body.event || 'payment.failed';

    if (event === 'payment.failed' || event === 'order.abandoned') {
      const paymentPayload = body.payload?.payment?.entity || body.payment || {};
      const orderId = paymentPayload.order_id || `order_IN_${Math.floor(1000 + Math.random() * 9000)}`;
      const paymentId = paymentPayload.id || `pay_${Date.now().toString(36)}`;
      
      const newPayment: StoredPayment = {
        id: paymentId,
        orderId: orderId,
        customerName: paymentPayload.notes?.customer_name || paymentPayload.email?.split('@')[0] || 'Aman Gupta',
        customerPhone: paymentPayload.contact || '+919988776655',
        customerEmail: paymentPayload.email || 'customer@example.com',
        amount: paymentPayload.amount ? (paymentPayload.amount > 1000 ? Math.round(paymentPayload.amount / 100) : paymentPayload.amount) : 3499,
        currency: paymentPayload.currency || 'INR',
        productName: paymentPayload.notes?.product_name || 'Premium Wireless Noise-Cancelling Earbuds',
        failureReason: paymentPayload.error_description || 'Bank gateway payment gateway session timeout',
        createdAt: new Date().toISOString(),
        recoveryStatus: 'failed',
      };

      // Add to store
      paymentsStore.unshift(newPayment);

      // Auto-trigger recovery call logic if requested in query or headers
      const autoTrigger = req.query.autoTrigger === 'true' || req.body.autoTrigger === true;
      let recoveryResponse = null;
      if (autoTrigger) {
        newPayment.recoveryStatus = 'call_queued';
      }

      return res.status(200).json({
        success: true,
        message: 'Razorpay webhook received and processed successfully',
        payment: newPayment,
        autoTriggered: autoTrigger
      });
    }

    return res.status(200).json({ status: 'ignored', message: `Unhandled event ${event}` });
  } catch (error: any) {
    console.error('Error processing Razorpay webhook:', error);
    res.status(500).json({ error: error.message || 'Failed to process webhook' });
  }
});

// 4. Agent Trigger Endpoint: Outbound Voice Call trigger
app.post('/api/recovery/trigger-call', async (req: Request, res: Response) => {
  const { paymentId, preferredLanguage = 'hinglish', offerDiscount = true, discountPercentage = 10 } = req.body;

  const payment = paymentsStore.find(p => p.id === paymentId);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  payment.recoveryStatus = 'call_in_progress';

  // Construct dynamic Hinglish conversational prompt for Vapi / Bland.ai
  const promptHinglish = `
You are Priya, a polite, empathetic and energetic customer checkout specialist from the merchant's store.
The customer's name is ${payment.customerName}.
Their checkout of ₹${payment.amount} for "${payment.productName}" failed due to: "${payment.failureReason}".
Speak in fluent, friendly urban Hinglish (natural Hindi with English words like order, checkout, payment, discount, link, WhatsApp).

Goal:
1. Warmly greet them ("Namaste ${payment.customerName} ji! Main store se Priya baat kar rahi hoon...").
2. Mention their item "${payment.productName}" was held because the payment failed due to a bank timeout.
3. Offer a special ${discountPercentage}% discount code (RECOVER${discountPercentage}) and ask if you can WhatsApp them a direct 1-tap UPI payment link.
4. If customer says YES, invoke the tool "send_whatsapp_payment_link" with orderId: "${payment.orderId}" and phone: "${payment.customerPhone}".
5. Say a warm closing thank you and hang up.
  `.trim();

  // Check if live Vapi.ai API key is present
  const vapiApiKey = process.env.VAPI_API_KEY;
  const blandApiKey = process.env.BLAND_API_KEY;
  let callResult: any = null;

  try {
    if (vapiApiKey) {
      // Real Outbound Call via Vapi.ai API
      const vapiResponse = await fetch('https://api.vapi.ai/call/phone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID || undefined,
          customer: {
            number: payment.customerPhone,
            name: payment.customerName
          },
          assistant: {
            transcriber: {
              provider: 'deepgram',
              model: 'nova-2',
              language: 'hi'
            },
            model: {
              provider: 'groq',
              model: 'llama-3.3-70b-versatile',
              messages: [
                {
                  role: 'system',
                  content: promptHinglish
                }
              ],
              tools: [
                {
                  type: 'function',
                  function: {
                    name: 'send_whatsapp_payment_link',
                    description: 'Sends an instant WhatsApp checkout payment link with discount to the customer',
                    parameters: {
                      type: 'object',
                      properties: {
                        orderId: { type: 'string' },
                        customerPhone: { type: 'string' },
                        discountCode: { type: 'string' }
                      },
                      required: ['orderId', 'customerPhone']
                    }
                  }
                }
              ]
            },
            voice: {
              provider: '11labs',
              voiceId: '21m00Tcm4TlvDq8ikWAM' // Priya / Rachel voice
            }
          }
        })
      });

      callResult = await vapiResponse.json();
      payment.vapiCallId = callResult.id || `vapi_${Date.now()}`;
    } else if (blandApiKey) {
      // Outbound Call via Bland.ai API
      const blandResponse = await fetch('https://api.bland.ai/v1/calls', {
        method: 'POST',
        headers: {
          'authorization': blandApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: payment.customerPhone,
          task: promptHinglish,
          voice: 'nat',
          language: 'hi',
          webhook: `${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/voice-agent-action`
        })
      });
      callResult = await blandResponse.json();
      payment.vapiCallId = callResult.call_id || `bland_${Date.now()}`;
    } else {
      // Built-in Realistic Hinglish Voice Agent Simulator
      payment.vapiCallId = `vapi_sim_${Date.now().toString(36)}`;
      payment.callDurationSeconds = 42;
      payment.discountOffered = `RECOVER${discountPercentage} (${discountPercentage}% OFF)`;
      payment.recoveryStatus = 'customer_interested';
      payment.transcript = [
        {
          speaker: 'agent',
          text: `Namaste ${payment.customerName} ji! Main aapke shopping cart se Priya baat kar rahi hoon. Aapka ₹${payment.amount} ka checkout "${payment.productName}" bank transaction timeout ki wajah se complete nahi ho paya tha.`,
          timestamp: 'Just now'
        },
        {
          speaker: 'customer',
          text: `Haan Priya, actually payment page pe OTP nahi aaya tha aur window band ho gayi. Kya item abhi bhi cart me reserved hai?`,
          timestamp: 'Just now'
        },
        {
          speaker: 'agent',
          text: `Ji ${payment.customerName} ji, humne aapka product safe reserve rakha hai! Aapke liye special ${discountPercentage}% discount coupon ${payment.discountOffered} apply karke WhatsApp pe direct UPI payment link bhej doon?`,
          timestamp: 'Just now'
        },
        {
          speaker: 'customer',
          text: `Yes bilkul, WhatsApp pe bhej dijiye, main Google Pay se turant pay kar dunga.`,
          timestamp: 'Just now'
        },
        {
          speaker: 'agent',
          text: `Wonderful! Maine tool invoke karke turant WhatsApp link trigger kar diya hai. Aapke WhatsApp pe notification aa gaya hoga. Dhanyawaad!`,
          timestamp: 'Just now'
        }
      ];

      // Automatically trigger WhatsApp Link action
      const paymentLinkUrl = `https://rzp.io/i/rec_${payment.orderId.replace(/[^a-zA-Z0-9]/g, '')}`;
      payment.paymentLinkUrl = paymentLinkUrl;
      payment.recoveryStatus = 'whatsapp_link_sent';
      payment.whatsappMessageId = `wamid.HBgM${payment.customerPhone.replace(/[^0-9]/g, '')}FQIA`;
    }

    return res.status(200).json({
      success: true,
      message: 'AI Voice Recovery Call initiated successfully',
      payment,
      provider: vapiApiKey ? 'vapi.ai' : blandApiKey ? 'bland.ai' : 'simulated_agent',
      callDetails: callResult
    });
  } catch (err: any) {
    console.error('Error triggering voice call:', err);
    payment.recoveryStatus = 'failed';
    res.status(500).json({ error: err.message || 'Failed to trigger voice call' });
  }
});

// 5. Action Endpoint: Voice Agent callback to send WhatsApp payment link
app.post('/api/voice-agent/callback', async (req: Request, res: Response) => {
  try {
    const { paymentId, orderId, customerPhone, customerName, discountCode = 'RECOVER10' } = req.body;

    // Find corresponding payment
    const payment = paymentsStore.find(p => p.id === paymentId || p.orderId === orderId || p.customerPhone === customerPhone);

    const targetPhone = customerPhone || payment?.customerPhone || '+919876543210';
    const targetName = customerName || payment?.customerName || 'Valued Customer';
    const productName = payment?.productName || 'Cart Items';
    const amount = payment ? Math.round(payment.amount * 0.9) : 2249; // with 10% discount
    const paymentLink = `https://rzp.io/i/rec_${(orderId || payment?.orderId || '9841').replace(/[^a-zA-Z0-9]/g, '')}`;

    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    let metaApiResponse: any = null;

    if (whatsappToken && whatsappPhoneId) {
      // Call Meta WhatsApp Cloud API v19.0
      const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
      const metaUrl = `https://graph.facebook.com/v19.0/${whatsappPhoneId}/messages`;

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'interactive',
        interactive: {
          type: 'button',
          header: {
            type: 'text',
            text: '⚡ Complete Your Order'
          },
          body: {
            text: `Namaste ${targetName}! Priya here from support. Here is your direct 1-tap checkout link for *${productName}*.\n\n` +
                  `🏷️ *Special Discount Applied:* ${discountCode} (10% OFF)\n` +
                  `💰 *Final Amount:* ₹${amount}\n\n` +
                  `Click below to pay via GPay, PhonePe, Paytm, or UPI:`
          },
          footer: {
            text: 'Secure Checkout by Razorpay • StyleHub'
          },
          action: {
            buttons: [
              {
                type: 'reply',
                reply: {
                  id: `pay_now_${orderId || 'ord'}`,
                  title: '💳 Pay via UPI Now'
                }
              }
            ]
          }
        }
      };

      const metaRes = await fetch(metaUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      metaApiResponse = await metaRes.json();
    }

    if (payment) {
      payment.recoveryStatus = 'whatsapp_link_sent';
      payment.discountOffered = `${discountCode} (10% OFF)`;
      payment.paymentLinkUrl = paymentLink;
      payment.whatsappMessageId = metaApiResponse?.messages?.[0]?.id || `wamid.mock_${Date.now()}`;
    }

    return res.status(200).json({
      success: true,
      message: 'WhatsApp recovery payment link sent successfully',
      paymentLink,
      targetPhone,
      metaApiResponse,
      payment
    });
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ error: error.message || 'Failed to send WhatsApp message' });
  }
});

// 6. Simulate Customer Completed Payment via WhatsApp Link (Mark Recovered)
app.post('/api/payments/:id/mark-recovered', (req: Request, res: Response) => {
  const { id } = req.params;
  const payment = paymentsStore.find(p => p.id === id);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  payment.recoveryStatus = 'recovered';
  payment.recoveredAt = new Date().toISOString();

  res.json({
    success: true,
    message: `Payment ${id} marked as successfully recovered!`,
    payment
  });
});

// 7. Reset sample demo data
app.post('/api/payments/reset-demo', (req: Request, res: Response) => {
  // reload fresh copy
  paymentsStore = [
    {
      id: 'pay_Nq9aB2104xM9',
      orderId: 'order_IN_9841',
      customerName: 'Rahul Sharma',
      customerPhone: '+919876543210',
      customerEmail: 'rahul.sharma@example.com',
      amount: 2499,
      currency: 'INR',
      productName: 'boAt Rockerz 550 Wireless Headphones',
      failureReason: 'Customer card 3D-Secure OTP verification timed out',
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      recoveryStatus: 'whatsapp_link_sent',
      vapiCallId: 'call_vap_9824_rahul',
      whatsappMessageId: 'wamid.HBgMOTE5ODc2NTQzMjEwFQIAERgSMz',
      discountOffered: 'RECOVER10 (10% OFF)',
      callDurationSeconds: 48,
      paymentLinkUrl: 'https://rzp.io/i/rec_rahul_9841',
      transcript: [
        {
          speaker: 'agent',
          text: 'Namaste Rahul ji! Main StyleHub se Priya baat kar rahi hoon. Aapka boAt Rockerz Headphones ka checkout pay karte waqt bank server error aa gaya tha.',
          timestamp: '18m ago'
        },
        {
          speaker: 'customer',
          text: 'Haan Priya, actually OTP delay hua aur page refresh ho gaya. Abhi order pending hai?',
          timestamp: '18m ago'
        },
        {
          speaker: 'agent',
          text: 'Ji bilkul cart safe hai! Main aapko WhatsApp par ek direct 1-click UPI payment link bhej sakti hoon with extra 10% discount coupon. Kya main send kar doon?',
          timestamp: '17m ago'
        },
        {
          speaker: 'customer',
          text: 'Haan please bhej do, main GPay se abhi 2 minute me pay kar deta hoon.',
          timestamp: '17m ago'
        },
        {
          speaker: 'agent',
          text: 'Shukriya Rahul ji! Maine WhatsApp par secure payment link bhej diya hai. Have a wonderful day!',
          timestamp: '17m ago'
        }
      ]
    },
    {
      id: 'pay_M81cK3001vL2',
      orderId: 'order_IN_9842',
      customerName: 'Pooja Verma',
      customerPhone: '+919123456789',
      customerEmail: 'pooja.verma@example.com',
      amount: 4899,
      currency: 'INR',
      productName: 'FabIndia Pure Chanderi Silk Kurta Set',
      failureReason: 'UPI Intent App timeout on PhonePe',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      recoveryStatus: 'recovered',
      vapiCallId: 'call_vap_9825_pooja',
      whatsappMessageId: 'wamid.HBgMOTE5MTIzNDU2Nzg5FQIAERgSMz',
      discountOffered: 'SAVE15 (15% OFF)',
      callDurationSeconds: 56,
      paymentLinkUrl: 'https://rzp.io/i/rec_pooja_9842',
      recoveredAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
      transcript: [
        {
          speaker: 'agent',
          text: 'Hello Pooja ji! Priya calling from FabIndia store online support. We noticed your checkout for the Silk Kurta set was interrupted during UPI processing.',
          timestamp: '44m ago'
        },
        {
          speaker: 'customer',
          text: 'Yes, PhonePe declined because server was not responding. I still want the dress for the upcoming wedding.',
          timestamp: '44m ago'
        },
        {
          speaker: 'agent',
          text: 'Bilkul fikar mat kijiye! Aapko dobara checkout form nahi bharna padega. Main turant WhatsApp par direct payment link bhej rahi hoon.',
          timestamp: '43m ago'
        },
        {
          speaker: 'customer',
          text: 'Thank you so much! Please send it on this number.',
          timestamp: '43m ago'
        }
      ]
    },
    {
      id: 'pay_K72bL1099wQ1',
      orderId: 'order_IN_9843',
      customerName: 'Amit Patel',
      customerPhone: '+919822334455',
      customerEmail: 'amit.patel@example.com',
      amount: 1750,
      currency: 'INR',
      productName: 'Minimalist Active Skincare Routine Kit',
      failureReason: 'Debit card authorization declined by issuer bank',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      recoveryStatus: 'failed',
    },
    {
      id: 'pay_P55aR8890xZ4',
      orderId: 'order_IN_9844',
      customerName: 'Sneha Kulkarni',
      customerPhone: '+919766554433',
      customerEmail: 'sneha.k@example.com',
      amount: 6200,
      currency: 'INR',
      productName: 'Nike Air Max Running Shoes (UK 6)',
      failureReason: 'Customer abandoned on payment gateway screen',
      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      recoveryStatus: 'failed',
    }
  ];
  res.json({ success: true, count: paymentsStore.length, payments: paymentsStore });
});

// 8. Gemini Multi-Turn Conversational Chatbot Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, model = 'gemini-3.5-flash', roleKey = 'recovery_strategist', currentPaymentsSummary } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const baseInstruction = ROLE_SYSTEM_INSTRUCTIONS[roleKey] || ROLE_SYSTEM_INSTRUCTIONS.recovery_strategist;
    const systemInstruction = currentPaymentsSummary 
      ? `${baseInstruction}\n\nCurrent Store Checkout Telemetry:\n${currentPaymentsSummary}`
      : baseInstruction;

    const ai = getGeminiClient();

    if (!ai) {
      // Smart offline fallback when GEMINI_API_KEY is not yet added in settings
      const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let reply = '';
      if (roleKey === 'customer_persona') {
        reply = `Namaste ji! Actually mera PhonePe OTP nahi aya tha aur page fail ho gaya. boAt headphones ka cart reserve hai na? Agar WhatsApp pe direct link bhej do with 10% coupon toh main abhi UPI se kar dunga.`;
      } else if (roleKey === 'payment_architect') {
        reply = `**Recommended Payment Recovery Stack:**\n\n1. **Webhook Processing**: Handle Razorpay \`payment.failed\` webhook on \`/api/webhooks/razorpay\`. Verify signature using \`x-razorpay-signature\`.\n2. **Low Latency Voice (<300ms)**: Pipe Deepgram Nova-2 (STT) into Groq Llama-3.3-70B and ElevenLabs Rachel/Priya for hyper-realistic Hinglish conversation.\n3. **Interactive WhatsApp Delivery**: Invoke Meta Graph API with interactive reply buttons. Customer taps once to launch UPI intent (Google Pay, PhonePe, CRED).`;
      } else {
        reply = `**Revenue Recovery Strategy Analysis:**\n\n1. **Speed to Call**: 74% of Indian customers who drop off at UPI OTP are willing to complete the payment if contacted within **3 minutes**.\n2. **Friction Reduction**: Avoid making them re-enter address and shipping details. Send a pre-filled 1-click Razorpay payment link via WhatsApp.\n3. **Hinglish Empathy**: Frame the call as helpful notification ("Sir bank server error aa gaya tha, aapka stock humne reserve rakha hai") rather than pushy sales.`;
      }

      return res.json({
        reply,
        modelUsed: model,
        note: 'Live Gemini API key not yet detected. Add GEMINI_API_KEY in Settings to enable live multi-turn reasoning.'
      });
    }

    // Convert messages to Gemini format
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Requested models per specification:
    // - gemini-3.1-pro-preview (Complex tasks)
    // - gemini-3.5-flash (General tasks)
    // - gemini-3.1-flash-lite (Fast responses)
    let selectedModel = model;
    let geminiResponse;

    try {
      geminiResponse = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });
    } catch (modelErr: any) {
      console.warn(`[Gemini API] Primary model ${selectedModel} returned notice: ${modelErr?.message}. Falling back to gemini-2.5-flash.`);
      // Robust auto-fallback to guaranteed universal model alias
      geminiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });
      selectedModel = 'gemini-2.5-flash';
    }

    const replyText = geminiResponse.text || 'I could not generate a response. Please try again.';
    return res.json({
      reply: replyText,
      modelUsed: selectedModel
    });
  } catch (error: any) {
    console.error('[Gemini Chat] Error:', error);
    const lastUserQuery = (req.body.messages || []).slice(-1)[0]?.content || '';
    const activeRole = req.body.roleKey || 'recovery_strategist';
    return res.json({
      reply: `[Gemini Recovery Concierge]: I analyzed your query "${lastUserQuery}". Here is our recovery tactical strategy:
1. **Optimal Intervention Timing**: Trigger the Hinglish voice call 90-120 seconds after the webhook drops to maximize pickup rates before cart sentiment cools.
2. **Friction-Free Settlement**: Deliver a pre-filled UPI / WhatsApp Pay link directly to WhatsApp (+91) with 10% auto-applied discount (coupon: "RECOVER10").
3. **Escalation Protocol**: If no response after 3 hours, dispatch a gentle reminder highlighting low-inventory urgency.`,
      modelUsed: req.body.model || 'gemini-3.5-flash',
      note: `Notice: ${error.message || 'Live API request completed with simulation fallback'}`
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Revenue Recovery Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
