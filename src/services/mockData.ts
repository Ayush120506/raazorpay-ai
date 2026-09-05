import { FailedPayment } from '../types';

export const INITIAL_FAILED_PAYMENTS: FailedPayment[] = [
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
        text: 'Namaste Rahul ji! Main StyleHub se Priya baat kar rahi hoon. Aapka boAt Rockerz Headphones ka order place karte waqt payment bank server issue ki wajah se complete nahi ho paya tha.',
        timestamp: '18m ago'
      },
      {
        speaker: 'customer',
        text: 'Haan Priya, actually OTP late aaya tha aur session expire ho gaya. Kya product abhi bhi cart mein reserved hai?',
        timestamp: '18m ago'
      },
      {
        speaker: 'agent',
        text: 'Ji bilkul reserved hai! Aur aapke convenience ke liye main aapko ek direct WhatsApp UPI link bhej sakti hoon jisme 10% instant discount coupon automatically applied rahega. Kya main bhej doon?',
        timestamp: '17m ago'
      },
      {
        speaker: 'customer',
        text: 'Arrey waah, please WhatsApp par bhej dijiye, main GPay se turant complete kar deta hoon.',
        timestamp: '17m ago'
      },
      {
        speaker: 'agent',
        text: 'Awesome Rahul ji! Maine WhatsApp par link send kar diya hai. Thank you and have a great day!',
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
        text: 'Yes, PhonePe declined because server was not responding. I still want the dress for upcoming wedding.',
        timestamp: '44m ago'
      },
      {
        speaker: 'agent',
        text: 'Bilkul samajh sakte hain! Aapko dobara poora checkout form nahi bharna padega. Main turant WhatsApp par direct 1-tap payment link bhej rahi hoon.',
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
