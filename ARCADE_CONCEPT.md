# Concept Document: Tabled Project ("Catch & Dodge: Pudo's Cloud Arcade")

**Target Subdomain:** `arcade.pudomo.com` or `play.pudomo.com`  
**Status:** Table / Vaulted (Preserved for future development after `hello.pudomo.com` launch).  
**Core Purpose:** A dedicated, replayable 30-to-60 second physics arcade survival game featuring Pudo, designed for competitive score chasing, unlocking special custom hats/skins, and sharing high scores across the `pudomo.com` ecosystem.

---

## 1. Why Tabled from `hello.pudomo.com`?
During initial architecture specification, we identified that embedding a full 30-second survival arcade game directly into the `hello.pudomo.com` greeting page introduced unnecessary dual-control complexity (dragging vs. keyboard control toggles), diluted the primary mascot interaction loop (Snack Kitchen & custom speech bubble sharing), and added state management bloat.

By separating this into a dedicated subdomain (`arcade.pudomo.com`), we ensure:
1. `hello.pudomo.com` remains hyper-fast, lightweight, focused, and instantly delightful.
2. `arcade.pudomo.com` can be built as a full-fledged, polished mini-game destination without UI compromises.

---

## 2. Gameplay & Mechanics Specification

### A. Core Game Loop
- **Objective:** Survive for 30 (or 60) seconds while catching falling positive items and dodging environmental hazards in a vertical falling-block arcade format.
- **Player Character:** Pudo moves horizontally (`X-axis only`) along the bottom stage floor.
- **Positive Items (Falling from top of screen):**
  - ☀️ **Sunshine Drops:** `+10 Points`. Fills Pudo's happiness meter.
  - 🍬 **Berry Bubbles:** `+25 Points`. Grants a temporary 3-second speed boost.
  - ⭐ **Golden Stars:** `+100 Points`. Rare spawn. Triggers a 5-second "Star Power / Invincibility" shield.
- **Hazards (Falling or drifting across screen):**
  - ⛈️ **Grumpy Rainclouds:** `-15 Points`. Causes Pudo to shiver and slows movement for 2 seconds.
  - ⚡ **Lightning Bolts:** `-30 Points`. Zaps Pudo, causing a 1-second stun (`dizzy` eye state).

---

## 3. Control Scheme Strategy

### A. Desktop Controls
- **Keyboard Primary:** `Left Arrow` (`A`) and `Right Arrow` (`D`) keys for crisp, instantaneous horizontal acceleration and braking.
- **Mouse Secondary:** Pudo horizontally smoothly follows the pointer (`clientX`) along the bottom track.

### B. Mobile Controls
- **Split-Screen Touch:**
  - Touching and holding the **Left Half** of the touchscreen moves Pudo left.
  - Touching and holding the **Right Half** of the touchscreen moves Pudo right.
- **Direct Thumb Drag (Optional Toggle):** Touching Pudo directly and dragging left/right moves the character 1:1 under the user's thumb.

---

## 4. Score, Unlocks & Cross-Domain Ecosystem

### A. High Score Persistence
- Scores are stored locally via `localStorage.setItem('pudomo_high_score', score)`.
- At the end of the round, Pudo holds up a celebratory trophy card displaying:
  - Final Score & High Score.
  - Rank badge (e.g., *Novice Cloud Hopper*, *Sunshine Champion*, *Galactic Pudo Master*).

### B. Cross-Domain Hat/Accessory Unlocks
- Achieving specific milestones (e.g., scoring `>1,000 points` or catching 5 Golden Stars) unlocks unique, exclusive accessories (e.g., `golden-arcade-trophy-hat` or `pixel-sunglasses`).
- **Cross-Link Transfer:** When unlocked, the end-game card provides a button: **"Show off your Trophy on hello.pudomo.com!"** which generates a redirect URL passing the unlocked item: `https://hello.pudomo.com/?hat=arcade-trophy&msg=I+scored+1250+points+in+the+Pudomo+Arcade!`

---

## 5. Future Implementation Prerequisites
When spinning up this project:
1. Initialize as a clean Vite + Canvas 2D or lightweight PixiJS project for optimal sprite rendering and collision detection (`AABB bounding box checks`).
2. Utilize the shared Animalese Web Audio API engine developed for `hello.pudomo.com` for sound effects (pickup chimes, hazard buzzers, and celebratory fanfare).
