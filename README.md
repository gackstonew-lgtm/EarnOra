# EarnOra

> **A Professional Review-and-Earn Platform for Kenya**  
> *Tagline:* Review. Earn. Grow.  
> *Core Value Proposition:* Turn your honest opinions into real M-Pesa earnings.

EarnOra is a mobile-first Progressive Web App (PWA) tailored for the Kenyan market with future expansion to Uganda, Tanzania, Rwanda, Ghana, Nigeria, and South Africa. Users earn verified cash bounties directly to Safaricom M-Pesa for writing authentic, constructive, first-hand reviews of restaurants, digital apps, local services, fintechs, and consumer products.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Modern mobile-first responsive layout, dark/light theme)
- **Database & Auth:** PostgreSQL & Supabase (Row Level Security policies, migration scripts)
- **PWA:** Web App Manifest, offline support, install banner
- **Payments:** Safaricom M-Pesa Daraja 2.0 API (B2C automated payouts, C2B business funding)
- **Icons:** Lucide React

---

## 🚀 Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gackstonew-lgtm/EarnOra.git
   cd EarnOra
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env.local
   ```
   *(In development mode, safe default fallbacks for mock OTP and sandbox M-Pesa are active out-of-the-box).*

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser. Use mobile viewport emulation (e.g. 390px width) for the native app experience.

5. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

6. **Run Automated Test Suite:**
   ```bash
   node --test tests/phase1-verification.test.mjs
   ```

---

## 🔑 Environment Variables

The project requires the following environment variables (defined with placeholder values in `.env.example`):

| Variable | Description | Example / Default |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public URL of the frontend | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/earnora` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase anon key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase administrative secret | `eyJhbGciOi...` |
| `AUTH_SECRET` | 32-character authentication secret | `random_secret_hash` |
| `SESSION_SECRET` | Session encryption key | `random_secret_hash` |
| `SMS_OTP_API_KEY` | SMS provider API key for phone OTP | `sandbox_key` |
| `SMS_OTP_USERNAME` | SMS gateway account username | `sandbox` |
| `SMS_SENDER_ID` | Approved SMS alphanumeric sender ID | `EarnOra` |
| `DARAJA_ENV` | Safaricom Daraja environment | `sandbox` or `production` |
| `DARAJA_CONSUMER_KEY` | Safaricom Daraja API Consumer Key | `daraja_key` |
| `DARAJA_CONSUMER_SECRET` | Safaricom Daraja API Consumer Secret | `daraja_secret` |
| `DARAJA_SHORTCODE` | Business B2C Payout Shortcode | `600000` |
| `DARAJA_INITIATOR_NAME` | B2C API Initiator Username | `testapi` |
| `DARAJA_SECURITY_CREDENTIAL` | Encrypted Daraja Security Credential | `cert_credential` |
| `DARAJA_PASSKEY` | Lipa Na M-Pesa Online passkey | `daraja_passkey` |
| `DARAJA_CALLBACK_URL` | Webhook URL for M-Pesa payout results | `https://yourdomain.co.ke/api/daraja/callback` |
| `DARAJA_TIMEOUT_URL` | Webhook URL for M-Pesa queue timeouts | `https://yourdomain.co.ke/api/daraja/timeout` |

---

## 📁 Folder Structure

```
EarnOra/
├── public/
│   ├── assets/              # Official brand logos (dark and light modes)
│   └── manifest.json        # PWA standalone web app manifest
├── src/
│   ├── app/
│   │   ├── activity/        # Referrals, daily streak multipliers, leaderboard
│   │   ├── admin/           # Review moderation desk, fraud flags, audit logs
│   │   ├── auth/
│   │   │   ├── login/       # Branded sign in with show/hide password
│   │   │   ├── register/    # 7-country phone validation & referral attribution
│   │   │   └── verify-otp/  # 6-digit OTP verification with countdown & lockout
│   │   ├── business/        # Business campaign creation & budget tracking
│   │   ├── earn/            # Task discovery, category filter, detail modals
│   │   │   └── submit/      # Structured 50-word review submission & photo attestation
│   │   ├── menu/            # Profile settings & compliance shortcuts
│   │   ├── privacy/         # Kenya Data Protection Act 2019 compliance
│   │   ├── terms/           # Transparent earning model & anti-fraud terms
│   │   ├── wallet/          # Available/pending balances & Daraja B2C withdrawals
│   │   ├── globals.css      # Poppins typography, CSS variables, Tailwind tokens
│   │   ├── layout.tsx       # Root layout with header, bottom nav, PWA banner
│   │   └── page.tsx         # Responsive home screen with 10 Earning Cards
│   ├── components/
│   │   ├── brand/           # EarnoraLogo, EarnoraSymbol (SVG), ThemeToggle
│   │   ├── cards/           # EarningCard component (22px radius, KES badges)
│   │   ├── navigation/      # AppHeader (notifications bell) & 5-item BottomNav
│   │   ├── providers/       # AuthProvider and ThemeProvider
│   │   └── ui/              # PwaInstallBanner and manual iOS/Android guide
│   └── lib/
│       ├── auth-service.ts  # Client/server auth logic, OTP limits, referral resolver
│       ├── constants.ts     # 7 countries, 10 earning card configs, brand copy
│       ├── daraja.ts        # Safaricom Daraja B2C payout integration service
│       ├── mock-data.ts     # Seed profiles, tasks, ledger transactions, leaderboard
│       ├── phone-utils.ts   # International phone normalization & payout eligibility
│       └── types.ts         # TypeScript domain definitions
├── supabase/
│   └── migrations/          # PostgreSQL schemas, RLS policies, M-Pesa ledger
├── tests/
│   └── phase1-verification.test.mjs  # Automated domain test suite
├── .env.example             # Complete environment variables template
├── .env.local               # Local development overrides (git-ignored)
├── .gitignore               # Strict exclusion of secrets, build, and node_modules
├── package.json             # dev, build, start, and lint scripts
├── tailwind.config.ts       # Earnora palette tokens & 22px radii
└── tsconfig.json            # Strict TypeScript configuration
```
