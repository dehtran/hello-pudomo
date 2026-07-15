# pudomo.com — Project Repository & Orientation Guide

Welcome to the central repository for **`hello.pudomo.com`** (and future `pudomo.com` ecosystem projects). 

> **Important Note for Developers & AI Agents in New Sessions:**  
> This repository is currently in the **Post-Specification / Pre-Scaffolding Phase**. All technical requirements, interactive mechanics, and architectural rules have been fully defined and locked in via detailed specification documents in this folder. **No application code (`package.json`, `index.html`, `src/`) has been scaffolded yet.** Your immediate next step is to initialize the project and begin building directly against `TECH_SPEC.md`.

---

## 🗺️ Repository Structure & Document Guide

When jumping into this repo, read these core documents first:

| File | Purpose & Status |
| :--- | :--- |
| **`README.md`** | This orientation and onboarding guide. |
| **`TECH_SPEC.md`** | **[PRIMARY BLUEPRINT]** The authoritative, complete technical specification for building `hello.pudomo.com` (Domo's Play-Hub & Snack Kitchen). Details the layered SVG mascot anatomy, 6 snack reaction animations, Web Audio API Animalese voice engine, URL parameter (`?msg=`) security/sanitization, and responsive desktop/mobile behavior. **Build exactly according to this spec.** |
| **`ARCADE_CONCEPT.md`** | **[TABLED / VAULTED]** Concept document for a 30-second survival arcade mini-game ("Catch & Dodge"). *Do not implement this for `hello.pudomo.com`.* It is preserved here for a future subdomain project (`arcade.pudomo.com`). |

---

## 🌟 Project #1: `hello.pudomo.com` (Domo's Play-Hub)

### Overview
`hello.pudomo.com` is a live, interactive, joyful, and highly shareable landing page featuring **Domo**, our squishy and energetic web mascot. The goal is to captivate visitors for **>30 seconds to several minutes** through playful interactions, discovery loops, and custom greetings.

### Core Principles & Constraints (Must Enforce!)
1. **Aesthetics & Theme:**
   - **Light, Bright, Warm, and Cheerful.** Use a clean palette: creamy whites, sunshine yellows, soft sky blues, vibrant coral accents, and friendly rounded typography (`Outfit` or `Plus Jakarta Sans`).
   - 🚫 **NO Dark Mode as default. NO Glassmorphism.**
2. **Infrastructure & Cost ($0.00 Forever):**
   - Must be designed for static deployment on **Cloudflare Pages (Free Tier)**.
   - 🚫 **NO Backend Servers, NO Databases, NO Paid Cloud APIs.**
   - All custom messages and shareable states are encoded directly inside URL parameters (`hello.pudomo.com/?msg=Hello+World&hat=party`).
3. **Tech Stack:**
   - **Vite + Vanilla JavaScript (ES6+) + HTML5 + CSS3.**
   - Layered SVG for Domo's character transformations.
   - Built-in **Web Audio API (`AudioContext`)** for zero-cost, zero-lag "Animalese" melodic speech blips.
4. **Security & Sanitization:**
   - All incoming URL parameters (`?msg=...`) must be sanitized and truncated (`maxlength: 120 chars`).
   - Always inject user-provided text using `textContent` or `innerText`. 🚫 **NEVER use `innerHTML`.**

---

## 🚀 Next Steps for Development (Action Plan)

Whoever (or whatever session) picks up this project should execute the following sequence:

1. **Review Spec:** Read `TECH_SPEC.md` top-to-bottom to review all 6 snack specifications, audio pitches, and eye-tracking math.
2. **Scaffold Project:** Initialize a clean Vite project in this root directory:
   ```bash
   npx -y create-vite@latest ./ --template vanilla
   npm install
   npm run dev
   ```
3. **Build Core Components in Order:**
   - Step 1: Build `<domo-mascot>` (SVG layers, eye tracking, squish physics).
   - Step 2: Build `<snack-tray>` & reaction animations for all 6 snacks (`Chili`, `Balloon`, `Spark`, `Espresso`, `Frost Cube`, `Golden Star`).
   - Step 3: Build Web Audio API `Animalese` voice synthesizer.
   - Step 4: Implement URL parameter (`?msg=...`) parsing, click-to-listen prompt, and share link generator.
4. **Verify & Deploy:** Run through the acceptance checklist in `TECH_SPEC.md` (Section 7) and deploy to Cloudflare Pages!
