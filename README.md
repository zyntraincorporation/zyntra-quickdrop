# ⚡ Zyntra QuickDrop

> Instant cross-device text sharing. Pair your phone and desktop in seconds with a QR code. Real-time sync. No login required.

![QuickDrop Banner](https://via.placeholder.com/1200x400/09090b/6366f1?text=Zyntra+QuickDrop)

---

## 🚀 Features

| Feature | Description |
|---|---|
| ⚡ Realtime Sync | Firebase Firestore listeners — sub-100ms updates |
| 📱 QR Pairing | Scan once, paired forever across sessions |
| 🔔 Toast Notifications | Floating desktop popups with 1-click copy |
| 📋 Copy / Paste | One-tap copy & paste with sound + vibration |
| 💬 Chat Bubbles | Message history with timestamps, swipe to delete |
| 🔍 Search | Search through your message history |
| ✍️ Typing Indicator | Real-time typing status from paired device |
| 📡 Online Status | Live presence indicators per device |
| 🔄 Auto-Copy | Optionally auto-copy incoming text |
| 📲 PWA | Install as a native-feeling app on any device |
| 🔗 Share Target | Receive text shared from Android apps |
| 🌙 Dark Mode | Polished dark UI, system theme support |
| 🔐 Anonymous Auth | No signup — instant anonymous Firebase auth |
| 🛡️ Secure Rules | Firestore rules enforce pair-based access |

---

## 📁 Project Structure

```
zyntra-quickdrop/
├── app/
│   ├── layout.tsx              # Root layout, metadata, fonts
│   ├── globals.css             # Tailwind + custom CSS
│   ├── page.tsx                # Landing page
│   ├── pair/
│   │   └── page.tsx            # QR code pairing screen
│   ├── dashboard/
│   │   └── page.tsx            # Main messaging dashboard
│   └── settings/
│       └── page.tsx            # Settings panel
├── components/
│   ├── MessageBubble.tsx       # Chat bubble with copy/delete
│   ├── TextInput.tsx           # Send input with paste button
│   ├── Toast.tsx               # Floating notification toast
│   ├── TypingIndicator.tsx     # Animated typing dots
│   ├── StatusIndicator.tsx     # Device online/offline pill
│   ├── QRDisplay.tsx           # QR code + pair code display
│   └── InstallButton.tsx       # PWA install prompt
├── hooks/
│   ├── useDevice.ts            # Device identity + auth
│   ├── usePairing.ts           # Session create/join logic
│   ├── useMessages.ts          # Realtime messages + typing
│   └── useOnlineStatus.ts      # Network + presence tracking
├── lib/
│   ├── firebase.ts             # Firebase app init
│   ├── auth.ts                 # Anonymous auth + device ID
│   ├── firestore.ts            # All Firestore operations
│   ├── notifications.ts        # FCM + Web Push
│   └── utils.ts                # Helpers: copy, sound, vibrate
├── types/
│   └── index.ts                # TypeScript interfaces
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker (cache + FCM)
│   └── icons/                  # App icons (generate with pwa-asset-generator)
├── firestore.rules             # Security rules
├── firestore.indexes.json      # Composite indexes
├── firebase.json               # Firebase CLI config
├── vercel.json                 # Vercel deployment config
└── .env.local.example          # Environment variables template
```

---

## 🗃️ Firestore Schema

```
firestore/
├── sessions/{sessionId}
│   ├── code: string            # 6-char uppercase pair code
│   ├── devices: string[]       # [deviceId1, deviceId2] (max 2)
│   ├── createdAt: number       # Unix ms timestamp
│   ├── expiresAt: number       # Unix ms (24h TTL)
│   ├── active: boolean
│   │
│   ├── messages/{messageId}
│   │   ├── text: string        # Message content (max 10KB)
│   │   ├── senderId: string    # Firebase Auth UID
│   │   ├── senderNickname: string
│   │   ├── senderType: 'mobile' | 'desktop' | 'unknown'
│   │   ├── timestamp: number
│   │   ├── read: boolean
│   │   └── sessionId: string
│   │
│   └── typing/{deviceId}
│       ├── deviceId: string
│       ├── nickname: string
│       ├── isTyping: boolean
│       └── timestamp: number
│
└── devices/{deviceId}
    ├── id: string              # Same as Firebase Auth UID
    ├── nickname: string
    ├── type: 'mobile' | 'desktop' | 'unknown'
    ├── fcmToken: string?       # FCM push token
    ├── lastSeen: number
    ├── online: boolean
    └── sessionId: string
```

---

## ⚙️ Setup Guide

### 1. Clone & Install

```bash
git clone https://github.com/your-org/zyntra-quickdrop.git
cd zyntra-quickdrop
npm install
```

### 2. Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add Project** → name it `zyntra-quickdrop`
3. Enable **Google Analytics** (optional)
4. Click **Continue**

### 3. Enable Firebase Services

**Authentication:**
```
Firebase Console → Authentication → Get Started
→ Sign-in method → Anonymous → Enable
```

**Firestore:**
```
Firebase Console → Firestore Database → Create database
→ Start in production mode → Choose region (e.g. asia-south1 for Bangladesh)
```

**Cloud Messaging (for push notifications):**
```
Firebase Console → Project Settings → Cloud Messaging
→ Web Push certificates → Generate key pair
→ Copy the Key Pair (this is your VAPID key)
```

### 4. Register Web App

```
Firebase Console → Project Settings → Your apps → Add app → Web
→ App nickname: QuickDrop
→ Register app → Copy the firebaseConfig object
```

### 5. Configure Environment Variables

```bash
cp .env.local.example .env.local
# Edit .env.local with your Firebase values
```

### 6. Deploy Firestore Rules

```bash
npm install -g firebase-tools
firebase login
firebase use --add  # select your project
firebase deploy --only firestore:rules,firestore:indexes
```

### 7. Generate PWA Icons

```bash
npx pwa-asset-generator ./public/logo.svg ./public/icons \
  --background "#09090b" --padding "15%" \
  --maskable --manifest ./public/manifest.json
```

### 8. Run Locally

```bash
npm run dev
# → http://localhost:3000
```

---

## 🚀 Deploying to Vercel

### Option A: Vercel Dashboard (Easiest)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add environment variables from your `.env.local`
4. Deploy → copy your deployment URL

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# ... add all env vars
vercel --prod
```

### Post-Deploy

- Update Firebase Console → Authentication → Authorized Domains → add your Vercel URL
- Update Firebase Console → Firestore → Security Rules if needed

---

## 🔒 Security Notes

### Firestore Rules
- All reads/writes require Firebase Authentication (anonymous or Google)
- Users can only read/write messages within their paired session
- Message size is capped at 10KB
- Sessions expire after 24 hours (enforced in rules)

### Rate Limiting (Production)
For production, add Cloud Functions to enforce rate limiting:

```javascript
// functions/index.js
exports.checkRateLimit = functions.firestore
  .document('sessions/{sessionId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const userId = snap.data().senderId;
    // Count messages in last 60 seconds and enforce limits
  });
```

### Pair Code Security
- Codes are 6 characters from a 32-character alphabet = 1,073,741,824 combinations
- Sessions expire in 24h
- Maximum 2 devices per session
- Codes are validated server-side via Firestore rules

---

## 📱 PWA Installation

### Android Chrome
1. Open the app in Chrome
2. Tap the menu → "Add to Home screen"
3. Or use the in-app **Install** button

### iOS Safari
1. Open the app in Safari
2. Tap the Share button → "Add to Home Screen"

### Desktop Chrome
1. Look for the install icon in the address bar
2. Or use the in-app **Install** button

---

## 🏗️ Architecture Decisions

| Decision | Rationale |
|---|---|
| Firebase Firestore | Real-time listeners, no server needed, scales automatically |
| Anonymous Auth | Zero friction for users, still enforces security rules |
| No Redux | Messages/state fit natively in React hooks |
| Framer Motion | GPU-accelerated animations, minimal bundle impact |
| TailwindCSS | Utility-first = no runtime CSS, small bundle |
| QR Code pairing | Works offline, no account needed, instant |
| Web Audio API | Tiny sound feedback with no audio files |

---

## ⚡ Performance Notes

- **Bundle size target:** < 200KB gzipped
- **First Contentful Paint:** < 1.5s on 3G
- **Firestore listeners** are debounced and unsubscribed on unmount
- **Framer Motion** animations use `transform` and `opacity` only (GPU layers)
- **No rerenders** on unrelated state: hooks are isolated per concern
- **Service Worker** caches static assets for instant repeat visits
- **Messages** are paginated (50 most recent) to avoid Firestore read costs

---

## 🧪 Testing the App

```bash
# 1. Open on desktop
open http://localhost:3000

# 2. Click "Get Started" → "Create Pair Code"
# 3. Open on mobile (same WiFi or use ngrok)
ngrok http 3000

# 4. Scan the QR code on your phone
# 5. Both devices are now paired!
# 6. Type something on desktop — it appears instantly on mobile
```

---

## 📄 License

MIT © 2026 Zyntra Verse — Built by Nirob

---

*Zyntra QuickDrop is part of the Zyntra Verse AI automation ecosystem.*
