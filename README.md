# AccessAI — Adaptive Intelligence & Personal Reading Evolution

> **"Accessibility is no longer attached to websites. It is attached to people."**

AccessAI is an intelligent, person-centric accessibility Chrome Extension (Manifest V3 + React + Tailwind + Local Machine Learning/Heuristics) that observes non-sensitive interaction patterns and gradually evolves the user's **Personal Reading Fingerprint**.

---

## 🌟 Key Features

### 1. 🧠 Adaptive Learning Engine
- **Gradual Preference Learning**: Observes repeated adjustments (font size increases, line spacing, theme shifts, focus mode) and calculates time-decayed preference weights.
- **Multi-Factor Confidence Scores**: Assigns deterministic confidence values ($0.00 - 1.00$) to every learned trait based on observation frequency, modal consistency, and domain diversity.
- **Reading Comfort Profile**: Visualizes 5 core perceptual dimensions (**Typography**, **Spacing**, **Focus**, **Theme**, **Motion**).

### 2. 🛡️ 100% Client-Side Privacy by Design
- **Zero Cloud Telemetry**: All Bayesian scoring, session tracking, and fingerprint evolution execute locally inside IndexedDB.
- **Zero Webpage Text or URLs Collected**: Operates purely on structural layout signals without reading or storing page copy.
- **Strict Input Exclusion**: Passwords, form fields, inputs, and contenteditable elements are automatically excluded from overrides.

### 3. 🎯 Smart Context & Focus Mode
- **Structural Classification**: Automatically detects page contexts (**Articles**, **Documentation**, **Dashboards**, **Education**, **Shopping**) using DOM signals.
- **Context Preservation**: Preserves code blocks, sidebars, and interactive buttons while optimizing reading passages.
- **Interactive Reading Ruler**: Real-time cursor-tracking focus ruler.

### 4. 💡 Explainable AI Recommendations
- Provides transparent rationales for every suggestion (e.g. *"AccessAI noticed that you usually increase line spacing on long articles"*).
- The user retains complete control with single-click profile evolution approvals.

### 5. 🎬 Built-In Interactive Demo Simulator
- Presentation-ready scenario runner demonstrating Sarah's reading journey from baseline 16px to learned Lexend 18px / 1.7x spacing / Warm theme with animated confidence gauges and event logs.

---

## 🚀 Getting Started

### Installation & Development

```bash
# 1. Clone the repository
git clone https://github.com/divyasaminathan02/Access_AI.git
cd Access_AI

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build extension bundle for Chrome
npm run build
```

### Loading into Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top right.
3. Click **Load unpacked** and select the `dist/` directory (or workspace root).

---

## 🏗️ Architecture

```
src/
├── learning/
│   ├── adaptiveEngine.js       # Master coordinator for interaction learning & evolution
│   ├── preferenceScoring.js    # Frequency weighting, decay & modal clustering
│   ├── confidenceEngine.js     # Multi-factor confidence & Reading Comfort Profile
│   ├── recommendationEngine.js # Explainable suggestion rules engine
│   └── learningStorage.js      # IndexedDB storage layer
│
├── content/
│   ├── contentScript.js        # Dynamic style injection & HUD mounting
│   ├── floatingHUD.jsx         # Accessible floating quick-controls bar
│   └── smartFocus.js           # Structural context detector & distraction isolation
│
├── analytics/
│   └── readingSession.js       # Lightweight duration & fatigue heuristic tracker
│
├── privacy/
│   └── privacyManager.js       # Input exclusion & privacy checklist manager
│
├── dashboard/                  # Full-featured evolution analytics dashboard
├── demo/                       # Live presentation scenario runner
├── onboarding/                 # Interactive reading calibration assessment
└── popup/                      # Extension popup quick controls
```

---

## 📜 Core Principle

AccessAI does **not** diagnose medical conditions:
> *"We do not claim to know what condition you have. We are learning how YOU read best."*
