# AI Revenue Recovery SaaS (Abandoned Checkout Voice & WhatsApp Agent)

A complete, production-ready proof-of-concept (POC) for an **AI Revenue Recovery** application. It automatically recovers abandoned checkouts and failed payments (from Razorpay / Stripe) using automated Hinglish AI voice calls and instant 1-tap WhatsApp payment links.

Built strictly on **100% Free / Open-Source Tiers**:
- **Backend:** Node.js with Express.js for REST API endpoints & Razorpay webhooks.
- **Database & Auth:** Firebase Firestore (Zero-Trust ABAC security rules) & Firebase Auth.
- **Frontend:** Single-Page React Dashboard styled with Tailwind CSS.
- **Voice Agent:** Integration code for Vapi.ai / Bland.ai (Free developer trials) + WebRTC & Groq Llama-3 open-source architecture.
- **Messaging:** Meta WhatsApp Cloud API (Free tier: 1,000 service conversations/month).

---

## 📁 Complete Folder Structure

```
ai-revenue-recovery/
├── server.ts                    # Express.js REST API & Razorpay Webhook Handler
├── firestore.rules              # Attribute-Based Zero-Trust Firestore Security Rules
├── package.json                 # Project dependencies and full-stack scripts
├── tsconfig.json                # TypeScript compiler config
├── vite.config.ts               # Vite configuration with Tailwind CSS
├── .env.example                 # Environment variables specification
├── index.html                   # Entry point HTML with meta tags
├── README.md                    # Step-by-step setup guide for all free tiers
└── src/
    ├── main.tsx                 # React DOM mount point
    ├── App.tsx                  # Single-Page Merchant Dashboard UI
    ├── firebase.ts              # Firebase Auth & Firestore Client SDK initializers
    ├── types.ts                 # Shared TypeScript interfaces
    ├── index.css                # Tailwind CSS global stylesheet
    ├── services/
    │   ├── api.ts               # Frontend REST client for Express endpoints
    │   └── mockData.ts          # Seed test checkouts & transcripts
    └── components/
        ├── Navbar.tsx           # Header, system health status & merchant auth
        ├── MetricsBar.tsx       # Recovered revenue, rate, calls & WhatsApp counters
        ├── FailedPaymentsTable.tsx # Searchable, filterable checkout table
        ├── WebhookSimulator.tsx # Razorpay webhook payload builder & dispatcher
        ├── VoiceCallModal.tsx   # Live Hinglish audio synthesizer & transcript viewer
        ├── WhatsAppPreviewModal.tsx # Simulated WhatsApp smartphone chat interface
        ├── SetupGuideModal.tsx  # Free-tier API keys walkthrough modal
        ├── IntegrationDocsModal.tsx # Folder structure & code export modal
        └── LoginModal.tsx       # Firebase Auth / Merchant login modal
```

---

## ⚡ Exact Commands to Initialize & Run Project

```bash
# 1. Create directory & initialize package.json
mkdir ai-revenue-recovery && cd ai-revenue-recovery
npm init -y

# 2. Install production dependencies
npm install express dotenv firebase lucide-react motion react react-dom @google/genai

# 3. Install devDependencies
npm install -D vite @vitejs/plugin-react @tailwindcss/vite tailwindcss @types/express @types/node tsx esbuild typescript

# 4. Copy environment file and configure keys
cp .env.example .env

# 5. Start development server (Port 3000)
npm run dev

# 6. Build for production
npm run build

# 7. Start compiled production server
npm start
```

---

## 🔑 Step-by-Step Guide to Free-Tier API Keys

### 1. Vapi.ai Voice Agent ($10 Free Credit)
1. Sign up at [https://vapi.ai](https://vapi.ai).
2. Go to **Account &rarr; API Keys** and copy your **Private API Key**. Set this as `VAPI_API_KEY` in `.env`.
3. Go to **Phone Numbers** to claim a free trial phone number.
4. Configure your assistant with:
   - **Transcriber:** Deepgram Nova-2 (`language: "hi"` or `"en-IN"`).
   - **Model:** Groq `llama-3.3-70b-versatile` (fastest sub-second voice latency).
   - **Voice:** ElevenLabs Rachel / Priya.
   - **Tool / Function:** `send_whatsapp_payment_link` pointing to your Express callback URL: `https://<YOUR_APP_URL>/api/voice-agent/callback`.

*(Alternative: Bland.ai gives $5 free credit with their trial key).*

### 2. Meta WhatsApp Cloud API (1,000 Free Conversations / Month)
1. Sign in to the [Meta for Developers Portal](https://developers.facebook.com).
2. Click **Create App** &rarr; select **Other** &rarr; select **Business**.
3. Under **Add Products to Your App**, click **Set Up** on **WhatsApp**.
4. On the **API Setup** page:
   - Copy **Temporary Access Token** to `WHATSAPP_ACCESS_TOKEN` in `.env` (or create a permanent System User Token in Business Settings).
   - Copy **Phone Number ID** to `WHATSAPP_PHONE_NUMBER_ID` in `.env`.
   - Add your test phone number in **To Phone Number** to receive messages for testing.
5. In production, submit your WhatsApp Business Account and message templates for automated delivery.

### 3. Razorpay Webhooks (Free Sandbox / Test Mode)
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com) and toggle to **Test Mode**.
2. Go to **Settings &rarr; Webhooks &rarr; Add New Webhook**.
3. **Webhook URL:** `https://<YOUR_APP_URL>/api/webhooks/razorpay`
4. **Secret:** Set any secure passphrase (e.g. `rzp_webhook_secret_99`) and set in `RAZORPAY_WEBHOOK_SECRET`.
5. **Active Events:** Select `payment.failed` and `order.paid`.

### 4. Firebase (Spark Plan - 100% Free)
1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. **Authentication:** Enable **Google** and **Email/Password** sign-in providers.
3. **Firestore Database:** Create Firestore database in native mode. Paste the security rules from `firestore.rules`.
4. **Project Settings &rarr; General &rarr; Your apps &rarr; Web App:** Copy the `firebaseConfig` properties to `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

---

## 🌐 Backend REST API Endpoints

### 1. `POST /api/webhooks/razorpay`
Simulates or receives real Razorpay `payment.failed` webhook events.
- Verifies HMAC SHA256 signature using `RAZORPAY_WEBHOOK_SECRET`.
- Parses customer name, contact phone, failed amount, product name, and error description.
- Automatically creates or updates the checkout document in Firestore.
- Triggers voice recovery if `autoTrigger=true`.

### 2. `POST /api/recovery/trigger-call`
Initiates an outbound Hinglish voice recovery call.
- Generates a customized conversational prompt for the customer.
- Executes real outbound call to Vapi.ai / Bland.ai REST APIs (or uses built-in realistic browser synthesizer if keys are omitted).
- Records transcript, timestamps, and customer agreement.

### 3. `POST /api/voice-agent/callback`
The tool-call webhook that the Voice Agent invokes when the customer says *"Haan please WhatsApp par bhej dijiye"*.
- Calls Meta WhatsApp Cloud API (`https://graph.facebook.com/v19.0/{phone_number_id}/messages`).
- Delivers an interactive message with instant discount (10% OFF) and 1-tap UPI payment link.
- Updates payment recovery status to `whatsapp_link_sent`.

### 4. `POST /api/payments/:id/mark-recovered`
Marks the payment as recovered once the customer completes checkout via WhatsApp.
