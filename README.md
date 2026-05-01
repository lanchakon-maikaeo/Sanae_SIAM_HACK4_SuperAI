# 🌺 Sanaé SIAM
### HACK4 SuperAI Season 4 Submission

> *"Sanaé" (เสน่ห์) — The Thai word for charm, allure, and enchantment.*  
> *Sanaé SIAM bridges the invisible gap between foreign visitors and Thai cultural nuance.*

---

## 🏆 Project Overview

**Sanaé SIAM** is a premium AI-powered cultural travel web application for foreign tourists visiting Thailand. Unlike generic travel apps, it provides **culturally nuanced, context-aware guidance** across destinations, food, traditions, heritage arts, and etiquette.

> **Core insight:** Most travel apps tell you *where* to go. Sanaé SIAM tells you *how* to be there.

### The Problem
Foreign tourists in Thailand frequently make unintentional cultural mistakes — entering temples incorrectly dressed, mishandling food customs, accidentally violating laws (lèse-majesté, vaping ban) — due to a lack of accessible, specific, and culturally sensitive guidance.

### The Solution
An AI-powered editorial travel guide with a **Gemini-powered chat advisor** that:
- Provides destination-specific dress codes, customs, and activities
- Flags allergens, dietary tags, and spice levels for every dish
- Explains cultural sensitivity levels (Low / Medium / High)
- Answers real-time questions in warm, precise English

---

## ✨ Features

| Section | Description |
|---------|-------------|
| 🗺 **Thailand** | 29 destinations across 6 regions with cultural context, dress code, customs, activities |
| 🎪 **Festivals** | Major Thai festivals with sensitivity ratings and detail views |
| 🍜 **Cuisine** | Signature dishes with allergen flags, dietary tags, spice levels |
| 📋 **Tips** | 8 cultural conduct categories with do/don't guidance |
| 🎭 **Culture** | Living Heritage arts + Sacred Architecture styles |
| 🤖 **Thai AI Advisor** | Real-time Gemini-powered chat panel with preset questions |

---

## 🛠 Tech Stack

```
Frontend Framework
├── React 19 + TypeScript 5.8
├── Vite 6.2 (build tool)
└── Tailwind CSS v4 (via @tailwindcss/vite)

AI Layer
└── Google Gemini API (@google/genai ^1.29.0)
    └── ai.models.generateContent()
    └── System prompt: Thai Cultural Guide AI persona

UI & Animation
├── Motion (Framer Motion) ^12 — AnimatePresence, scroll fade-ins
├── Lucide React ^0.546 — icons (MapPin, Send, Search, ShieldCheck, etc.)
└── Google Fonts — Cormorant Garamond (serif) + Montserrat (sans)

Data Layer
└── src/data.json — single source of truth (29KB)
    ├── destinations[]
    ├── festivals[]
    ├── dishes[]
    ├── tips[]
    ├── heritage_arts[]
    └── architecture[]

Backend (available)
├── Express ^4.21
└── dotenv ^17
```

---

## 📁 File Structure

```
Sanaé SIAM/
├── index.html              # App entry point
├── metadata.json           # Google AI Studio app metadata
├── .env.example            # Environment variable template
├── .gitignore
├── package.json
├── vite.config.ts          # Vite + Tailwind + Gemini API key injection
├── tsconfig.json           # TypeScript (ES2022, React JSX, bundler moduleResolution)
└── src/
    ├── main.tsx            # React 19 root mount (StrictMode)
    ├── App.tsx             # Entire app — components, state, AI logic (46KB)
    ├── index.css           # Tailwind v4 + Google Fonts + custom CSS vars
    └── data.json           # All cultural content (29KB)
```

---

## 🧠 App Architecture

```
src/App.tsx
│
├── Types
│   └── Destination, Festival, Dish, Tip, Message, HeritageArt, ArchitectureStyle
│
├── Data (loaded from data.json)
│   └── DESTINATIONS, FESTIVALS, DISHES, TIPS_LIST, HERITAGE_ARTS, ARCHITECTURE
│
├── AI Setup
│   └── GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
│       └── GEMINI_SYSTEM_PROMPT — Thai Cultural Guide persona
│
├── State
│   ├── activeSection      — scroll spy (thailand/festivals/cuisine/tips/culture)
│   ├── regionFilter       — All | Central | North | Northeast | East | West | South
│   ├── selectedDestination / selectedFestival / selectedTip  — detail views
│   ├── isMobileMenuOpen / isChatOpen
│   └── chatMessages / userInput / isTyping
│
├── Sections
│   ├── #thailand    — Destination grid + region filter tabs
│   ├── #festivals   — Festival cards + AnimatePresence detail modal
│   ├── #cuisine     — Food grid (allergens, spice dots, dietary tags)
│   ├── #tips        — Do/Don't etiquette cards with sensitivity badges
│   └── #culture     — Heritage arts + Architecture style showcase
│
└── AI Chat Panel
    ├── Slide-in from right via AnimatePresence + motion.div
    ├── Preset question pills → auto-send to Gemini
    ├── Typing indicator (3 bouncing terracotta dots)
    └── Form submit → ai.models.generateContent() → append response
```

---

## 🚀 Setup & Running

### Prerequisites
- Node.js 18+
- Google Gemini API key — [get one at Google AI Studio](https://aistudio.google.com)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/Sanae_SIAM_HACK4_SuperAI.git
cd Sanae_SIAM_HACK4_SuperAI

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Run development server
npm run dev
# → http://localhost:3000
```

### Available Scripts

```bash
npm run dev      # Dev server on port 3000 (0.0.0.0 host)
npm run build    # Production build → /dist
npm run preview  # Preview production build locally
npm run lint     # TypeScript type check (tsc --noEmit)
npm run clean    # Remove /dist folder
```

### Environment Variables

```env
# Required — injected automatically in Google AI Studio via Secrets panel
GEMINI_API_KEY="your_gemini_api_key_here"

# Optional — deployed Cloud Run URL for self-referential links
APP_URL="https://your-app-url.run.app"
```

---

## 🗺 Destination Coverage

**29 locations across 22 provinces and 6 regions:**

| Region | Provinces |
|--------|-----------|
| **Central** | Bangkok, Ayutthaya, Nakhon Pathom, Lopburi, Samut Songkhram |
| **North** | Chiang Mai, Nan, Mae Hong Son |
| **Northeast** | Nakhon Ratchasima, Ubon Ratchathani, Roi Et |
| **West** | Kanchanaburi, Ratchaburi, Phetchaburi, Prachuap Khiri Khan, Sangkhlaburi |
| **East** | Trat, Chonburi, Rayong |
| **South** | Nakhon Si Thammarat, Phuket, Krabi |

---

## 📊 Cultural Sensitivity System

```
🟠 HIGH    — Strong cultural or legal consequences
             (monks, Buddha images, head/feet taboos, monarchy)
🟡 MEDIUM  — Cultural faux pas with social impact
             (shoes, public affection, dining customs)
🟢 LOW     — Good-to-know etiquette
             (wai greeting, tipping, market behavior)
```

---

## 🎨 Design System

```
Typography
├── Display / Headings — Cormorant Garamond (serif, italic)
└── Body / UI         — Montserrat (sans-serif, weight 100–900)

Color Palette
├── --color-cream      #f5f0e8  (background)
├── --color-terracotta #8b4a2a  (accent, buttons, active states)
└── --color-cream-dark #e8e1d5  (secondary background)

Aesthetic
└── Luxury editorial — Kinfolk × Condé Nast Traveler
    No gradients · No drop shadows · 0.5px borders · Generous whitespace
```

---

## 🤖 AI System Prompt

```
"You are Thai Cultural Guide AI for Sanaé SIAM web app.
Answer questions about Thai destinations, food, and tips
in warm precise English.
For destinations: cover dress code, customs, activities, timing, fees.
For food: cover region, allergens, dietary tags, spice level, price in THB.
Keep answers to 3–4 short paragraphs.
End with one follow-up question."
```

---

## 🌏 Expandability

Sanaé SIAM is **Thailand-first, world-ready**. The React + Gemini architecture expands to any culture by swapping `src/data.json` and updating the system prompt — no structural changes needed.

Potential expansions: 🇯🇵 Japan · 🇮🇳 India · 🇸🇦 Middle East · 🇻🇳 Vietnam

---

## 📄 License

Apache-2.0 — Free to use, modify, and distribute with attribution.

---

<div align="center">

**Sanaé SIAM** — *เสน่ห์สยาม*

Built with ❤️ for SuperAI Season 6 · HACK4

*Helping the world experience Thailand with grace, understanding, and respect.*

</div>
