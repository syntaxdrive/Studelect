# StudElect 🇳🇬
### *Multi-Tenant, Cryptographically Secure Digital Election Platform for Nigerian Higher Education Institutions*

StudElect is an enterprise-grade electronic voting system designed specifically for the unique legal, constitutional, and technological realities of Nigerian universities, polytechnics, and colleges of education.

---

## 🌟 Key Innovations & Features

### 1. Hierarchical Multi-Tenancy
- **Apex Tier:** Student Union Government (SUG) Executive Council & Senate / Student Representative Council (SRC).
- **Faculty / College Tier:** Associations (e.g. NESA, FASSA, NAMSN, LAWSA).
- **Departmental Tier:** Associations (e.g. NACOS, NUESA, ASSEES).
- **Residential / Hall Tier:** Hall Executive Councils (e.g. Jaja Hall, Sultan Bello, Queen Amina, Moremi).

### 2. Built-in Nigerian Constitutional Eligibility & Disqualification Engine
- **Association Dues Clearance:** Checks if a student is a dues-paying "financial member" with valid receipt clearance (critical for NACOS/NESA).
- **SDC Disciplinary Blacklist:** Blocks students under active suspension, probation, or investigation by the Students' Disciplinary Committee.
- **Program Type Filter:** Automatically enforces full-time undergraduate requirements (excluding DLI, Sandwich, and Part-Time where constitutionally mandated).
- **Matriculation Number Normalizer:** Regex engine supporting all Nigerian slash, hyphen, case-insensitive, and compact formats (`20/52HA012`, `FSC-CSC-19-004`, `UI/2019/1234`).

### 3. 100% Zero-Cost Free-Tier Operation (\$0 / ₦0 to Run)
- Bypasses expensive ₦50,000+ SMS charges using **4 free-tier verification methods**:
  1. **ELCOM Scratch PIN Slips (₦0 cost):** High-entropy 8-character verification PINs (`ST-8K2P-9M4Q`).
  2. **Free Email OTP:** 3,000 free transactional emails/month via Resend.
  3. **Telegram Bot 2FA:** 100% free and unlimited automated OTPs.
  4. **Portal Secret Matching:** Offline validation against official school portal dumps.

### 4. Decoupled Cryptographic Ballot Secrecy & Verification
- **Unlinkable Ballots:** Single-use blinded tokens decouple student identity from cast ballots. Even database super-admins cannot identify who a student voted for.
- **Deterministic Public Receipts:** Every voter receives a verifiable receipt hash (`SE-A9F4-8E2B-C104`) with a QR code to verify inclusion on the public ledger after polls close.

---

## 🛠️ Technology Stack (Free-Tier Production Ready)

| Layer | Technology | Free Tier |
| :--- | :--- | :--- |
| **Frontend & PWA** | Next.js 15 (App Router), React 19, TailwindCSS, Lucide Icons | Open Source / Vercel Hobby |
| **Database & Auth** | Supabase (PostgreSQL 16) with Row-Level Security (RLS) | 500 MB DB (~250k+ votes) |
| **ORM** | Prisma ORM 5 | Type-safe migrations |
| **Double-Vote Guard** | PostgreSQL Advisory Locks (`pg_try_advisory_xact_lock`) | Native PostgreSQL (Free) |
| **Email Gateway** | Resend | 3,000 free emails/month |
| **Storage** | Supabase Storage / Cloudflare R2 | 1GB / 10GB free storage |

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
cd studelect
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase connection strings:
```bash
cp .env.example .env
```

### 3. Initialize Prisma Database Schema
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the election portal.

---

## 📱 Interactive Demo Routes
- **Campus Selector:** `/`
- **UNILAG Election Hub:** `/unilag`
- **Voter Accreditation & Polling Booth:** `/unilag/elections/elec-nacos-2026/vote`
- **Live Results Dashboard:** `/unilag/elections/elec-nacos-2026/results`
- **Public Receipt Verifier:** `/unilag/elections/elec-nacos-2026/verify`
- **ELCOM Admin Suite:** `/unilag/admin`
