# Technical Specification: hello.pudomo.com (Domo's Play-Hub & Snack Kitchen)

## 1. Project Overview & Objectives
**Target Domain:** `hello.pudomo.com`  
**Core Purpose:** Serve as a live, interactive, joyful, and memorable entry point to `pudomo.com` that captivates visitors for >30 seconds through discovery mechanics, responsive character interaction, and viral custom greetings.  
**Hosting & Cost:** Cloudflare Pages (Free Tier). Zero backend servers, zero databases, $0.00 infrastructure cost forever.  
**Aesthetic Theme:** Bright, warm, inviting, clean, and cheerful. (NO dark mode, NO glassmorphism). Palette dominated by creamy whites, sunshine yellows, soft sky blues, vibrant coral accents, and modern friendly typography (`Outfit` or `Plus Jakarta Sans`).

---

## 2. Technical Stack & Architecture
- **Framework/Build Tool:** Vite + Vanilla JavaScript (ES6+), HTML5, CSS3.
- **Rendering:** Layered SVG & CSS DOM transforms with lightweight JavaScript spring/easing math (60 FPS, Retinacompatible, zero layout shifts).
- **Audio Engine:** Built-in **Web Audio API** (`AudioContext`). Synthesizes dynamic "Animalese" (melodic gibberish blips) directly in the browser without loading external audio assets or calling paid APIs.
- **State & Persistence:** Pure client-side URL parameter encoding (`?msg=...` & `?hat=...`). No external databases or authentication required.

---

## 3. Core Component Breakdown

### A. The Mascot (`<domo-mascot>`)
Domo is a layered, interactive SVG character structured into 4 independent layers:
1. **Base Body:** Scalable, squishy blob container with CSS Bézier curve transitions and JS spring recovery on click/drag.
2. **Eye Tracking System:**
   - Two circular black pupils inside white circular sclera.
   - **Desktop Behavior:** Pupils track `window.onmousemove` coordinates (`clientX`, `clientY`) using trigonometry (`Math.atan2`) constrained within the sclera radius.
   - **Mobile Behavior:** Pupils track the last touch coordinates (`lastTouchX`, `lastTouchY`). When idle for >3 seconds, Domo blinks and smoothly shifts gaze to random items on the snack tray or directly forward.
   - **Eye States:** `normal`, `blinking`, `starry` (✨), `dizzy` (😵‍💫), `wide-shocked` (😳), `squinting-happy` (😆).
3. **Mouth & Speech Synchronizer:**
   - Swaps between `smile`, `open-talking`, `fire-breathing`, and `puffing-cheeks`.
   - When speaking, the mouth toggles open and closed in sync with the Web Audio API syllable timer.
4. **Accessory/Hat Overlay:**
   - Absolutely positioned layer above Domo's head where unlocked accessories (`tiny-crown`, `sunglasses`, `party-hat`) dynamically attach when activated.

### B. The Snack Bar (`<snack-tray>`)
Fixed at the bottom of the viewport, displaying 6 draggable/tappable snack items:
- **Universal Input Strategy:**
   - **Desktop:** Users can click to feed *OR* drag and drop the snack item onto Domo's body.
   - **Mobile:** Tapping any snack triggers a Bézier arc animation where a duplicate of the snack item pops out of the tray, flips through the air, and lands inside Domo's open mouth (`touch-action: none` enabled on Domo to prevent accidental page scrolling).

### C. Reaction State Machine
To prevent animation bugs or layout glitches when users rapidly click items, Domo operates under a strict state machine:
- **States:** `IDLE` ↔ `REACTING` ↔ `RECOVERING`.
- **Interrupt Rule:** If Domo is in `REACTING` state (e.g., mid-way through breathing chili fire) and the user triggers a new snack, the current animation immediately cancels (`clearTimeout(activeReactionTimer)`), resets CSS transform classes, and initiates the new snack reaction seamlessly.

---

## 4. Exact Snack Reaction & Audio Matrix

| Snack Item | Duration | Visual & Physics Animation | Animalese Voice & Pitch Shift |
| :--- | :--- | :--- | :--- |
| 🌶️ **Spicy Chili** | `4.0s` | Domo turns fiery orange-red (`#FF4B2B`), shakes rapidly horizontally (`animation: shake 0.1s infinite`), blows cartoon smoke and flame vectors out both sides, and hops twice. | Deep, raspy, low-pitch rapid blips (`200Hz - 280Hz`). |
| 🎈 **Helium Balloon** | `Hold until Click` | Domo inflates (`transform: scale(1.4)`), drifts up toward the top of the viewport (`translateY(-120px)`), and floats gently. Clicking or tapping Domo triggers a `*POP*` visual ring, deflating back to `scale(1)` with a rubbery bounce. | Squeaky, high-pitched treble blips (`600Hz - 850Hz`). |
| ⚡ **Static Spark** | `3.5s` | Yellow lightning overlay flashes, Domo's outline becomes "frizzy", and Domo ricochets left and right across the screen boundaries 3 times like a pinball before settling. | Electric zap/crackle synth chirps (`sawtooth wave, 400Hz - 700Hz`). |
| ☕ **Espresso Shot** | `4.0s` | Eye pupils dilate wide, body bobs up and down at 3x hyper-speed (`animation-duration: 0.25s`), leaving a colorful rainbow motion-blur trail across the canvas. | Staccato, hyper-fast chirps (`800Hz+, 40ms intervals`). |
| 🧊 **Frost Cube** | `Hold until Click` | Domo turns icy cyan-blue (`#00F2FE`), shivers (`translateX(-2px to 2px)`), and gets encased in a translucent ice cube outline. Clicking/tapping shatters the ice into SVG snowflake shards. | Chimey, crystal-clear bell tones (`sine wave, 900Hz - 1200Hz`). |
| 👑 **Golden Star** | `4.5s` | A burst of golden star confetti rains down from top, Domo does a triumphant 360-degree spin (`transform: rotate(360deg)`), and permanently puts on the `tiny-crown` accessory. | Triumphant fanfare chord + sparkly twinkle blips (`major triad progression`). |

---

## 5. URL Encoding, Sharing & Security Specification

### A. Custom Message Workflow
1. **Input Interface:** A clean input bar situated below Domo:
   - Text input (`maxlength="120"`, placeholder: *"Type a message for Domo to say..."*).
   - Action Button: **"Copy Share Link 🔗"**.
2. **Link Generation:** When clicked, generates:
   `https://hello.pudomo.com/?msg=` + `encodeURIComponent(userInput.trim())` + `&hat=` + `currentHat`
   Copies to device clipboard and displays toast: *"✨ Link copied! Send it to a friend so Domo can greet them!"*

### B. Security & Sanitization (Strict Enforcement)
- **XSS Prevention:** All incoming URL parameters (`new URLSearchParams(window.location.search).get('msg')`) MUST be injected strictly into text nodes via `element.textContent` or `element.innerText`. **Never use `.innerHTML` under any circumstances.**
- **Length Truncation:** Incoming parameters must be programmatically sliced: `const rawMsg = (params.get('msg') || '').slice(0, 120);`

### C. Default vs. Custom URL States & Autoplay Audio Handling
- **Default State (No `?msg=`):**
   - Domo automatically speaks: *"Hi friend! I'm Domo, your host at pudomo.com! Try feeding me a snack from below and see what happens!"* (Visual bubble immediately visible; audio triggers on first user tap/click).
- **Custom State (`?msg=...` present):**
   - Browsers block autoplay audio until the first interaction. Therefore, when `?msg=` is detected:
     1. Domo bounces cheerfully holding a glowing invitation badge: **"👉 Domo has a custom message for you! [Tap/Click anywhere to listen]"**
     2. Upon the first pointer down / touch event anywhere on the document, the badge fades out, Domo does a happy backflip, and begins typing out the custom message letter-by-letter synchronized with the melodic Animalese Web Audio blips.

---

## 6. Responsive Layout & Mobile Optimization
- **Touch-Action Locking:** Set `touch-action: manipulation` or `none` on the `#domo-container` so dragging or stretching Domo on mobile does not trigger browser pull-to-refresh or page scrolling.
- **Viewport Structure:**
   - **Header:** Clean, lightweight header showing `pudomo.com` logo and sound toggle (`🔊 / 🔇`).
   - **Center Stage (Flexible flex-grow):** Domo centered with responsive scaling (`clamp(180px, 40vw, 320px)`).
   - **Bottom Action Area:** Custom speech input box stacked above the horizontal horizontally-scrollable or 2-row grid Snack Tray (`min-height: 80px` for comfortable touch targets >= `48x48px`).

---

## 7. Verification & Acceptance Checklist (For Next Session)
- [ ] **Aesthetics Verification:** Confirm bright, warm, cheerful light theme (no dark mode or glassmorphism defaults).
- [ ] **Eye Tracking Verification:** Verify pupils smoothly track mouse on desktop and follow tapped items on mobile without escaping sclera boundaries.
- [ ] **Snack Matrix Verification:** Test all 6 snacks individually. Confirm exact durations, visual transitions, state interruptions, and return to `IDLE`.
- [ ] **Audio Verification:** Confirm Web Audio API blips generate cleanly, pitch shifts match snack types, and the sound toggle (`🔊/🔇`) mutes/unmutes reliably.
- [ ] **Security & URL Verification:** Pass `<script>alert('xss')</script>` in `?msg=`. Confirm text renders literally as plain string and script never executes. Test 500-character string and confirm truncation to 120 characters.
- [ ] **Mobile Parity Verification:** Test tap-to-feed arc animation on simulated mobile viewport. Verify zero horizontal scrolling or layout shift.
