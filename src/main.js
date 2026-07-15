// Custom Mascot Web Component: <domo-mascot>
class DomoMascot extends HTMLElement {
  constructor() {
    super();
    
    // Physics variables (Hooke's Law spring simulation)
    this.scaleX = 1;
    this.scaleY = 1;
    this.targetScaleX = 1;
    this.targetScaleY = 1;
    this.velX = 0;
    this.velY = 0;
    this.stiffness = 0.08;
    this.damping = 0.80;

    // Eye states: 'normal', 'blinking', 'starry', 'dizzy', 'wide-shocked', 'squinting-happy'
    this.eyeState = 'normal';
    
    // Mouth states: 'smile', 'open-talking', 'fire-breathing', 'puffing-cheeks'
    this.mouthState = 'smile';
    
    // Active accessory: 'none', 'tiny-crown', 'sunglasses', 'party-hat'
    this.activeAccessory = 'none';

    // State Machine variables
    this.reactionState = 'IDLE'; // 'IDLE', 'REACTING', 'RECOVERING'
    this.activeReactionTimer = null;
    this.activeFlickerTimer = null;

    // Audio Engine variables
    this.audioCtx = null;
    this.isMuted = false;
    this.speechTimeout = null;

    // Idle timers
    this.idleTimer = null;
    this.blinkTimer = null;
  }

  connectedCallback() {
    // Generate inline SVG structure for Domo with FX layers
    this.innerHTML = `
      <svg viewBox="0 0 200 200" class="domo-svg" xmlns="http://www.w3.org/2000/svg">
        <!-- Ground Shadow -->
        <ellipse class="domo-shadow" cx="100" cy="172" rx="55" ry="8" fill="#2C2623" opacity="0.25" />
        
        <!-- CSS Idle Group (animates floating bob) -->
        <g class="domo-idle-group">
          <!-- CSS Reaction Group (animates shakes, spins, ricochets) -->
          <g class="domo-reaction-group">
            <!-- Main Body Group (animates click/drag spring squish in JS) -->
            <g class="domo-body-group">
              
              <!-- Body Outline & Shape (Soft egg-like pear) -->
              <path id="domo-body" d="M 40,110 C 40,65 70,45 100,45 C 130,45 160,65 160,110 C 160,150 135,168 100,168 C 65,168 40,150 40,110 Z" 
                    fill="#FFD23F" stroke="#2C2623" stroke-width="5" stroke-linejoin="round" />
              
              <!-- Rosy Cheeks -->
              <ellipse cx="58" cy="106" rx="9" ry="5.5" fill="#FF8E91" opacity="0.65" />
              <ellipse cx="142" cy="106" rx="9" ry="5.5" fill="#FF8E91" opacity="0.65" />
              
              <!-- Eye System -->
              <!-- Left Eye Sclera -->
              <circle id="left-sclera" cx="75" cy="88" r="16" fill="#FFFFFF" stroke="#2C2623" stroke-width="4.5" />
              <!-- Right Eye Sclera -->
              <circle id="right-sclera" cx="125" cy="88" r="16" fill="#FFFFFF" stroke="#2C2623" stroke-width="4.5" />

              <!-- Normal Pupils -->
              <circle id="left-pupil" cx="75" cy="88" r="6.5" fill="#2C2623" />
              <circle id="right-pupil" cx="125" cy="88" r="6.5" fill="#2C2623" />

              <!-- Dizzy Eyes (😵‍💫) -->
              <g id="eyes-dizzy" class="hidden-layer">
                <path d="M 68,81 L 82,95 M 82,81 L 68,95" stroke="#2C2623" stroke-width="4" stroke-linecap="round" />
                <path d="M 118,81 L 132,95 M 132,81 L 118,95" stroke="#2C2623" stroke-width="4" stroke-linecap="round" />
              </g>

              <!-- Starry Eyes (✨) -->
              <g id="eyes-star" class="hidden-layer">
                <path d="M 75,76 L 78,84 L 86,87 L 78,90 L 75,98 L 72,90 L 64,87 L 72,84 Z" fill="#FFD23F" stroke="#2C2623" stroke-width="2" />
                <path d="M 125,76 L 128,84 L 136,87 L 128,90 L 125,98 L 122,90 L 114,87 L 122,84 Z" fill="#FFD23F" stroke="#2C2623" stroke-width="2" />
              </g>

              <!-- Closed Eyes (😆/Blink) -->
              <g id="eyes-closed" class="hidden-layer">
                <path d="M 59,88 Q 75,98 91,88" fill="none" stroke="#2C2623" stroke-width="4.5" stroke-linecap="round" />
                <path d="M 109,88 Q 125,98 141,88" fill="none" stroke="#2C2623" stroke-width="4.5" stroke-linecap="round" />
              </g>

              <!-- Mouths -->
              <!-- Smile (Default) -->
              <path id="mouth-smile" d="M 90,110 Q 100,119 110,110" fill="none" stroke="#2C2623" stroke-width="4" stroke-linecap="round" />
              
              <!-- Open talking (O shape) -->
              <ellipse id="mouth-talk" class="hidden-layer" cx="100" cy="113" rx="8" ry="11" fill="#2C2623" />
              
              <!-- Fire-breathing (spicy reaction) -->
              <path id="mouth-fire" class="hidden-layer" d="M 86,110 Q 100,132 114,110 Z" fill="#FF4B2B" stroke="#2C2623" stroke-width="4.5" stroke-linejoin="round" />
              
              <!-- Puffing Cheeks (Espresso/static reactions) -->
              <circle id="mouth-cheeks" class="hidden-layer" cx="100" cy="112" r="6" fill="none" stroke="#2C2623" stroke-width="4" />
              
              <!-- Accessories & Hats -->
              <!-- Tiny Crown -->
              <g id="acc-crown" class="hidden-layer" transform="translate(100, 36)">
                <path d="M -18,0 L -22,-16 L -8,-7 L 0,-22 L 8,-7 L 22,-16 L 18,0 Z" fill="#FFD23F" stroke="#2C2623" stroke-width="3" stroke-linejoin="round" />
                <circle cx="-22" cy="-16" r="3" fill="#FF5A5F" stroke="#2C2623" stroke-width="1.5" />
                <circle cx="0" cy="-22" r="3" fill="#A8DADC" stroke="#2C2623" stroke-width="1.5" />
                <circle cx="22" cy="-16" r="3" fill="#FF5A5F" stroke="#2C2623" stroke-width="1.5" />
              </g>

              <!-- Party Hat -->
              <g id="acc-party-hat" class="hidden-layer" transform="translate(100, 42)">
                <path d="M -15,0 L 0,-34 L 15,0 Z" fill="#FF5A5F" stroke="#2C2623" stroke-width="3" stroke-linejoin="round" />
                <circle cx="0" cy="-34" r="4.5" fill="#FFD23F" stroke="#2C2623" stroke-width="2" />
                <path d="M -8,-17 L 8,-17 M -11,-8 L 11,-8" stroke="#FFFFFF" stroke-width="2.5" />
              </g>

              <!-- Sunglasses -->
              <g id="acc-sunglasses" class="hidden-layer" transform="translate(100, 88)">
                <path d="M -30,-5 L -8,-5 C -8,7 -30,7 -30,-5 Z" fill="#2C2623" stroke="#2C2623" stroke-width="2" />
                <path d="M 8,-5 L 30,-5 C 30,7 8,7 8,-5 Z" fill="#2C2623" stroke="#2C2623" stroke-width="2" />
                <path d="M -8,-2 L 8,-2" stroke="#2C2623" stroke-width="3" stroke-linecap="round" />
              </g>

              <!-- --- Visual FX Layers --- -->
              <!-- 🌶️ Chili Flames -->
              <g id="fx-flames" class="hidden-layer">
                <path d="M 38,105 Q 12,92 24,78 Q -5,100 24,115 Z" fill="#FF4B2B" stroke="#2C2623" stroke-width="2.5" stroke-linejoin="round" />
                <path d="M 32,120 Q 8,118 16,105 Q -2,120 22,130 Z" fill="#FF8A00" stroke="#2C2623" stroke-width="2" stroke-linejoin="round" />
                <path d="M 162,105 Q 188,92 176,78 Q 205,100 176,115 Z" fill="#FF4B2B" stroke="#2C2623" stroke-width="2.5" stroke-linejoin="round" />
                <path d="M 168,120 Q 192,118 184,105 Q 202,120 178,130 Z" fill="#FF8A00" stroke="#2C2623" stroke-width="2" stroke-linejoin="round" />
              </g>

              <!-- ⚡ Static Spark Lightning Bolt -->
              <g id="fx-lightning" class="hidden-layer">
                <path d="M 90,25 L 115,65 L 98,70 L 120,110 L 105,110 L 92,75 L 108,70 Z" fill="#FFD23F" stroke="#2C2623" stroke-width="3" stroke-linejoin="round" />
              </g>

              <!-- 🧊 Translucent Ice Cube encasing Domo -->
              <g id="fx-ice" class="hidden-layer">
                <rect x="25" y="32" width="150" height="142" rx="22" fill="rgba(0, 242, 254, 0.26)" stroke="#00F2FE" stroke-width="5" stroke-linejoin="round" />
                <path d="M 40,55 L 70,55 M 40,55 L 40,85" fill="none" stroke="white" stroke-width="4.5" stroke-linecap="round" opacity="0.65" />
              </g>
              
              <!-- 🎈 Balloon Pop Expand Ring -->
              <circle id="fx-pop-ring" class="hidden-layer" cx="100" cy="100" r="10" fill="none" stroke="#2C2623" stroke-width="4.5" />

            </g>
          </g>
        </g>
      </svg>
    `;

    // Cache elements
    this.bodyGroup = this.querySelector('.domo-body-group');
    this.reactionGroup = this.querySelector('.domo-reaction-group');
    this.leftPupil = this.querySelector('#left-pupil');
    this.rightPupil = this.querySelector('#right-pupil');
    this.leftSclera = this.querySelector('#left-sclera');
    this.rightSclera = this.querySelector('#right-sclera');
    this.closedEyesGroup = this.querySelector('#eyes-closed');
    this.dizzyEyesGroup = this.querySelector('#eyes-dizzy');
    this.starryEyesGroup = this.querySelector('#eyes-star');

    // Cache FX elements
    this.fxFlames = this.querySelector('#fx-flames');
    this.fxLightning = this.querySelector('#fx-lightning');
    this.fxIce = this.querySelector('#fx-ice');
    this.fxPopRing = this.querySelector('#fx-pop-ring');

    this.mouths = {
      smile: this.querySelector('#mouth-smile'),
      talk: this.querySelector('#mouth-talk'),
      fire: this.querySelector('#mouth-fire'),
      cheeks: this.querySelector('#mouth-cheeks')
    };

    this.accessories = {
      'tiny-crown': this.querySelector('#acc-crown'),
      'party-hat': this.querySelector('#acc-party-hat'),
      'sunglasses': this.querySelector('#acc-sunglasses')
    };

    // Initialize systems
    this.initPhysics();
    this.initInteraction();
    
    // Start background loops
    this.resetIdleTimer();
    this.scheduleBlink();
  }

  disconnectedCallback() {
    clearTimeout(this.idleTimer);
    clearTimeout(this.blinkTimer);
    clearTimeout(this.activeReactionTimer);
    clearInterval(this.activeFlickerTimer);
    this.stopSpeech();
  }

  // --- Spring Physics System ---
  initPhysics() {
    const tick = () => {
      // Hooke's Law for X Axis
      const diffX = this.targetScaleX - this.scaleX;
      this.velX = (this.velX + diffX * this.stiffness) * this.damping;
      this.scaleX += this.velX;

      // Hooke's Law for Y Axis
      const diffY = this.targetScaleY - this.scaleY;
      this.velY = (this.velY + diffY * this.stiffness) * this.damping;
      this.scaleY += this.velY;

      // Apply scale to Domo's body group
      if (this.bodyGroup) {
        this.bodyGroup.style.transform = `scale(${this.scaleX}, ${this.scaleY})`;
      }

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Squish Domo (utility for clicks/taps/feedings)
  triggerSquish(xFactor = 1.15, yFactor = 0.82) {
    this.scaleX = xFactor;
    this.scaleY = yFactor;
  }

  // --- Pointer & Touch Interaction System ---
  initInteraction() {
    // Click / Touch squash effect
    this.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.initAudio(); // Initialize audio context on first click/interaction

      // If he is currently floating as a balloon or encased in ice, a click shatters or pops him!
      if (this.reactionGroup.classList.contains('state-balloon')) {
        this.popBalloon();
        return;
      }
      if (this.classList.contains('state-frozen')) {
        this.shatterIce();
        return;
      }
      
      // Otherwise, trigger the interactive squish targets
      this.targetScaleX = 1.24;
      this.targetScaleY = 0.72;
      
      // Temporarily change expressions if normal/idle
      if (this.eyeState === 'normal') {
        this.setEyeState('wide-shocked');
      }
      if (this.mouthState === 'smile') {
        this.setMouthState('cheeks');
      }
      
      this.resetIdleTimer();
    });

    const releaseSquish = () => {
      if (this.reactionGroup.classList.contains('state-balloon') || this.classList.contains('state-frozen')) {
        return; // Don't interrupt balloon or ice status scale
      }

      // Return target scale to 1.0 (physics spring will trigger bounce)
      this.targetScaleX = 1;
      this.targetScaleY = 1;
      
      // Restore normal expressions if we altered them
      if (this.eyeState === 'wide-shocked') {
        this.setEyeState('normal');
      }
      if (this.mouthState === 'cheeks') {
        this.setMouthState('smile');
      }
    };

    this.addEventListener('pointerup', releaseSquish);
    this.addEventListener('pointerleave', releaseSquish);
    this.addEventListener('pointercancel', releaseSquish);

    // Eye tracking logic
    const handleMove = (clientX, clientY) => {
      this.resetIdleTimer();
      
      // Do not track if eyes are in a non-tracking state
      if (['dizzy', 'blinking', 'starry', 'squinting-happy'].includes(this.eyeState)) {
        return;
      }
      
      this.trackPointer(clientX, clientY);
    };

    window.addEventListener('pointermove', (e) => {
      handleMove(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
  }

  // Trigonometry pupil positioning
  trackPointer(clientX, clientY) {
    if (!this.leftSclera || !this.rightSclera || !this.leftPupil || !this.rightPupil) return;

    const leftRect = this.leftSclera.getBoundingClientRect();
    const rightRect = this.rightSclera.getBoundingClientRect();

    // Eyeball centers in screen pixel space
    const leftCX = leftRect.left + leftRect.width / 2;
    const leftCY = leftRect.top + leftRect.height / 2;
    const rightCX = rightRect.left + rightRect.width / 2;
    const rightCY = rightRect.top + rightRect.height / 2;

    // Calculate left eye vector
    const leftDX = clientX - leftCX;
    const leftDY = clientY - leftCY;
    const leftAngle = Math.atan2(leftDY, leftDX);
    const leftDist = Math.min(4.5, Math.hypot(leftDX, leftDY) / 32); 
    
    // Calculate right eye vector
    const rightDX = clientX - rightCX;
    const rightDY = clientY - rightCY;
    const rightAngle = Math.atan2(rightDY, rightDX);
    const rightDist = Math.min(4.5, Math.hypot(rightDX, rightDY) / 32);

    // Apply translations
    this.leftPupil.setAttribute('cx', 75 + Math.cos(leftAngle) * leftDist);
    this.leftPupil.setAttribute('cy', 88 + Math.sin(leftAngle) * leftDist);
    this.rightPupil.setAttribute('cx', 125 + Math.cos(rightAngle) * rightDist);
    this.rightPupil.setAttribute('cy', 88 + Math.sin(rightAngle) * rightDist);
  }

  // Reset eye tracking coordinates back to center (0, 0 displacement)
  resetEyes() {
    if (this.leftPupil && this.rightPupil) {
      this.leftPupil.setAttribute('cx', 75);
      this.leftPupil.setAttribute('cy', 88);
      this.rightPupil.setAttribute('cx', 125);
      this.rightPupil.setAttribute('cy', 88);
    }
  }

  // --- State Machines: Eyes, Mouth & Accessories ---

  setEyeState(state) {
    if (this.eyeState === state && state !== 'blinking') return;
    this.eyeState = state;

    // Hide all eye types
    this.leftSclera.classList.remove('hidden-layer');
    this.rightSclera.classList.remove('hidden-layer');
    this.leftPupil.classList.remove('hidden-layer');
    this.rightPupil.classList.remove('hidden-layer');
    this.closedEyesGroup.classList.add('hidden-layer');
    this.dizzyEyesGroup.classList.add('hidden-layer');
    this.starryEyesGroup.classList.add('hidden-layer');

    this.resetEyes();

    switch (state) {
      case 'blinking':
      case 'squinting-happy':
        this.leftSclera.classList.add('hidden-layer');
        this.rightSclera.classList.add('hidden-layer');
        this.leftPupil.classList.add('hidden-layer');
        this.rightPupil.classList.add('hidden-layer');
        this.closedEyesGroup.classList.remove('hidden-layer');
        break;
      case 'dizzy':
        this.leftSclera.classList.add('hidden-layer');
        this.rightSclera.classList.add('hidden-layer');
        this.leftPupil.classList.add('hidden-layer');
        this.rightPupil.classList.add('hidden-layer');
        this.dizzyEyesGroup.classList.remove('hidden-layer');
        break;
      case 'starry':
        this.leftSclera.classList.add('hidden-layer');
        this.rightSclera.classList.add('hidden-layer');
        this.leftPupil.classList.add('hidden-layer');
        this.rightPupil.classList.add('hidden-layer');
        this.starryEyesGroup.classList.remove('hidden-layer');
        break;
      case 'wide-shocked':
        this.leftPupil.setAttribute('r', 9.5);
        this.rightPupil.setAttribute('r', 9.5);
        break;
      case 'normal':
      default:
        this.leftPupil.setAttribute('r', 6.5);
        this.rightPupil.setAttribute('r', 6.5);
        break;
    }
  }

  setMouthState(state) {
    if (this.mouthState === state) return;
    this.mouthState = state;

    // Hide all mouth paths
    Object.values(this.mouths).forEach(el => el.classList.add('hidden-layer'));
    
    // Show targeted path
    if (this.mouths[state]) {
      this.mouths[state].classList.remove('hidden-layer');
    }
  }

  showAccessory(accessory) {
    // Hide all accessories first
    Object.values(this.accessories).forEach(el => el.classList.add('hidden-layer'));
    
    this.activeAccessory = accessory;
    if (this.accessories[accessory]) {
      this.accessories[accessory].classList.remove('hidden-layer');
    }
  }

  // --- Blink & Idle Gaze Loops ---
  scheduleBlink() {
    clearTimeout(this.blinkTimer);
    const interval = 3000 + Math.random() * 3000;
    this.blinkTimer = setTimeout(() => {
      if (this.eyeState === 'normal') {
        const previousState = this.eyeState;
        this.setEyeState('blinking');
        setTimeout(() => {
          this.setEyeState(previousState);
          this.scheduleBlink();
        }, 140);
      } else {
        this.scheduleBlink();
      }
    }, interval);
  }

  resetIdleTimer() {
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      this.playIdleGaze();
    }, 3500);
  }

  playIdleGaze() {
    if (['normal'].includes(this.eyeState)) {
      const randomAngle = Math.random() * Math.PI * 2;
      const randomDist = Math.random() * 3.5;
      
      if (this.leftPupil && this.rightPupil) {
        this.leftPupil.setAttribute('cx', 75 + Math.cos(randomAngle) * randomDist);
        this.leftPupil.setAttribute('cy', 88 + Math.sin(randomAngle) * randomDist);
        this.rightPupil.setAttribute('cx', 125 + Math.cos(randomAngle) * randomDist);
        this.rightPupil.setAttribute('cy', 88 + Math.sin(randomAngle) * randomDist);
      }
    }
    this.resetIdleTimer();
  }

  // --- Web Audio API voice Synthesizer ---
  initAudio() {
    if (this.audioCtx) return;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  playBlip(frequency, duration, type = 'sine') {
    if (this.isMuted) return;
    this.initAudio();
    
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

    // Envelope shaping (prevents audio speaker popping)
    gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08, this.audioCtx.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  speakMessage(text, pitchMin = 300, pitchMax = 450, speed = 80, oscType = 'triangle') {
    this.stopSpeech();
    
    const speechText = document.getElementById('speech-text');
    if (!speechText) return;

    speechText.textContent = '';
    let index = 0;

    const speakNext = () => {
      if (index >= text.length) {
        this.stopSpeech();
        return;
      }

      const char = text[index];
      speechText.textContent += char;

      // Speak blip on valid characters (skip spaces/punctuation)
      if (/[a-zA-Z0-9]/.test(char)) {
        const freq = pitchMin + Math.random() * (pitchMax - pitchMin);
        this.playBlip(freq, (speed * 0.95) / 1000, oscType);
        
        // Toggle mouth open/closed for talk synchronization
        this.setMouthState(this.mouthState === 'talk' ? 'smile' : 'talk');
      } else {
        this.setMouthState('smile');
      }

      index++;
      this.speechTimeout = setTimeout(speakNext, speed);
    };

    speakNext();
  }

  stopSpeech() {
    clearTimeout(this.speechTimeout);
    this.setMouthState('smile');
  }

  // Plays a beautiful chord fanfare for Star reaction
  playStarFanfare() {
    if (this.isMuted) return;
    this.initAudio();

    // C Major Triad progression: C4, E4, G4, C5
    const freqs = [261.63, 329.63, 392.00, 523.25];
    freqs.forEach((f, idx) => {
      setTimeout(() => {
        this.playBlip(f, 0.45, 'sine');
      }, idx * 160);
    });
  }

  // Plays a popped sound effect
  playPopFx() {
    if (this.isMuted) return;
    this.initAudio();
    
    // Quick pitch drop frequency sweep for pop ring
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.15);

    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.15);
  }

  // Plays a glass shatter bell sound
  playShatterFx() {
    if (this.isMuted) return;
    this.initAudio();

    const chimeNotes = [987.77, 1174.66, 1318.51]; // B5, D6, E6
    chimeNotes.forEach((f, idx) => {
      setTimeout(() => {
        this.playBlip(f, 0.25, 'sine');
      }, idx * 40);
    });
  }

  // --- Snack Reaction State Machine ---

  triggerReaction(snackName) {
    // Interrupt rule: Cancel existing reaction and reset state cleanly
    if (this.reactionState === 'REACTING') {
      this.resetReactionState();
    }

    this.reactionState = 'REACTING';

    switch (snackName) {
      case 'Chili':
        this.setEyeState('dizzy');
        
        // Show side flames and turn red
        this.fxFlames.classList.remove('hidden-layer');
        this.classList.add('state-chili');
        this.reactionGroup.classList.add('state-chili-shake');

        // Play raspy rapid speech
        this.speakMessage("HOT HOT HOT! So spicy! Breathing fire!", 200, 280, 60, 'triangle');

        // Reaction duration: 3.0 seconds
        this.activeReactionTimer = setTimeout(() => {
          this.reactionState = 'RECOVERING';
          this.fxFlames.classList.add('hidden-layer');
          this.reactionGroup.classList.remove('state-chili-shake');
          
          this.speakMessage("Whew... that was way too hot...", 280, 360, 95, 'triangle');
          
          this.activeReactionTimer = setTimeout(() => {
            this.resetReactionState();
          }, 1200);
        }, 3000);
        break;

      case 'Balloon':
        this.setEyeState('wide-shocked');
        
        // Disable click physics temporarily by setting target scale manually
        this.targetScaleX = 1;
        this.targetScaleY = 1;

        // Apply scale/float class
        this.reactionGroup.classList.add('state-balloon', 'state-balloon-sway');

        this.speakMessage("Wheee! Look at me float! Squeak!", 650, 850, 95, 'sine');
        
        // Auto-pop after 3.0 seconds
        this.activeReactionTimer = setTimeout(() => {
          this.popBalloon();
        }, 3000);
        break;

      case 'Spark':
        this.setEyeState('dizzy');
        
        this.reactionGroup.classList.add('state-spark-ricochet');

        // Lightning bolt flicker logic
        this.activeFlickerTimer = setInterval(() => {
          this.fxLightning.classList.toggle('hidden-layer');
        }, 120);

        this.speakMessage("BZZT! Zap! I'm completely static-charged!", 400, 700, 70, 'sawtooth');

        // Duration: 3.0 seconds
        this.activeReactionTimer = setTimeout(() => {
          this.resetReactionState();
        }, 3000);
        break;

      case 'Espresso':
        this.setEyeState('wide-shocked');
        
        this.reactionGroup.classList.add('state-espresso-bob', 'state-espresso-trail');
        
        // Expand pupils
        this.leftPupil.setAttribute('r', 9.5);
        this.rightPupil.setAttribute('r', 9.5);

        this.speakMessage("GOGOGO! Hyper-speed! Too much energy!", 800, 1000, 45, 'triangle');

        // Duration: 3.0 seconds
        this.activeReactionTimer = setTimeout(() => {
          this.resetReactionState();
        }, 3000);
        break;

      case 'Frost':
        this.setEyeState('dizzy');
        
        this.classList.add('state-frozen');
        this.reactionGroup.classList.add('state-frost-shiver');
        this.fxIce.classList.remove('hidden-layer');

        this.speakMessage("S-s-so c-c-cold! I'm frozen solid!", 900, 1200, 120, 'sine');

        // Auto-shatter after 3.0 seconds
        this.activeReactionTimer = setTimeout(() => {
          this.shatterIce();
        }, 3000);
        break;

      case 'Star':
        this.setEyeState('starry');
        
        this.reactionGroup.classList.add('state-star-spin');
        
        // Trigger star fanfare + Javascript Confetti burst
        this.playStarFanfare();
        this.spawnConfetti();

        this.speakMessage("Twinkle twinkle! I feel absolutely amazing!", 320, 480, 80, 'triangle');

        // Duration: 3.0 seconds
        this.activeReactionTimer = setTimeout(() => {
          this.resetReactionState();
          this.showAccessory('tiny-crown');
          
          document.getElementById('speech-text').textContent = "✨ Look at my shiny crown! I feel like royalty!";
        }, 3000);
        break;
    }
  }

  // Reset Domo back to pure IDLE state, removing all effects classes
  resetReactionState() {
    clearTimeout(this.activeReactionTimer);
    clearInterval(this.activeFlickerTimer);
    this.stopSpeech();

    this.reactionState = 'IDLE';

    // Remove CSS flags
    this.classList.remove('state-chili', 'state-frozen');
    
    this.reactionGroup.classList.remove(
      'state-chili-shake',
      'state-balloon',
      'state-balloon-sway',
      'state-spark-ricochet',
      'state-espresso-bob',
      'state-espresso-trail',
      'state-frost-shiver',
      'state-star-spin'
    );

    // Hide FX layers
    this.fxFlames.classList.add('hidden-layer');
    this.fxLightning.classList.add('hidden-layer');
    this.fxIce.classList.add('hidden-layer');
    this.fxPopRing.classList.add('hidden-layer');

    // Restore standard scales and faces
    this.targetScaleX = 1;
    this.targetScaleY = 1;
    this.setEyeState('normal');
    this.setMouthState('smile');
  }

  // Pop animation for Helium Balloon
  popBalloon() {
    this.reactionGroup.classList.remove('state-balloon', 'state-balloon-sway');
    
    this.playPopFx();
    this.animatePopRing();
    this.resetReactionState();
    
    // Satisfying bounce
    this.triggerSquish(0.7, 1.3); 
    
    document.getElementById('speech-text').textContent = "💥 *POP!* Phew, that was high up!";
  }

  animatePopRing() {
    if (!this.fxPopRing) return;
    this.fxPopRing.classList.remove('hidden-layer');
    let radius = 10;
    
    const scalePop = () => {
      radius += 4.5;
      this.fxPopRing.setAttribute('r', radius);
      this.fxPopRing.setAttribute('opacity', 1 - radius / 65);
      
      if (radius < 65) {
        requestAnimationFrame(scalePop);
      } else {
        this.fxPopRing.classList.add('hidden-layer');
        this.fxPopRing.setAttribute('r', 10);
        this.fxPopRing.setAttribute('opacity', 1);
      }
    };
    requestAnimationFrame(scalePop);
  }

  // Shatter ice action for Frost Cube
  shatterIce() {
    this.playShatterFx();
    this.resetReactionState();
    
    // Shatter bounce
    this.triggerSquish(1.15, 0.85);

    // Spawn falling ice shards
    const container = document.querySelector('.game-stage');
    for (let i = 0; i < 15; i++) {
      const shard = document.createElement('div');
      shard.className = 'confetti-particle';
      shard.textContent = Math.random() > 0.5 ? '❄️' : '💎';
      shard.style.left = '50%';
      shard.style.top = '50%';
      
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 80;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist + 120; // drop shard down
      const rot = Math.random() * 360;

      shard.style.setProperty('--dx', `${dx}px`);
      shard.style.setProperty('--dy', `${dy}px`);
      shard.style.setProperty('--rot', `${rot}deg`);

      container.appendChild(shard);
      setTimeout(() => shard.remove(), 2000);
    }

    document.getElementById('speech-text').textContent = "❄️ Shattered! Brrr, I was freezing!";
  }

  // Golden Star Confetti Generator
  spawnConfetti() {
    const container = document.querySelector('.game-stage');
    const particles = ['⭐', '✨', '💛', '🎉'];
    
    for (let i = 0; i < 35; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';
      p.textContent = particles[Math.floor(Math.random() * particles.length)];
      p.style.left = '50%';
      p.style.top = '40%';
      
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 140;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist + 80; 
      const rot = 180 + Math.random() * 360;

      p.style.setProperty('--dx', `${dx}px`);
      p.style.setProperty('--dy', `${dy}px`);
      p.style.setProperty('--rot', `${rot}deg`);

      container.appendChild(p);
      setTimeout(() => p.remove(), 2500);
    }
  }
}

// Register the custom web component
customElements.define('domo-mascot', DomoMascot);


// --- Global Application Interactions & Tray Engine ---

function initSnackTray() {
  const tray = document.getElementById('snack-tray');
  if (!tray) return;

  const snacks = [
    { name: 'Chili', emoji: '🌶️' },
    { name: 'Balloon', emoji: '🎈' },
    { name: 'Spark', emoji: '⚡' },
    { name: 'Espresso', emoji: '☕' },
    { name: 'Frost', emoji: '🧊' },
    { name: 'Star', emoji: '👑' }
  ];

  snacks.forEach(snack => {
    const card = document.createElement('div');
    card.className = 'snack-item';
    card.textContent = snack.emoji;
    card.dataset.name = snack.name;
    
    tray.appendChild(card);
    setupSnackDragAndTap(card);
  });
}

// Custom Pointer Engine representing unified Drag & Drop + Tap arc trajectory
function setupSnackDragAndTap(item) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  
  item.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    isDragging = false;
    startX = e.clientX;
    startY = e.clientY;
    
    item.setPointerCapture(e.pointerId);
    item.style.transition = 'none';
    item.style.zIndex = '1000';
  });

  item.addEventListener('pointermove', (e) => {
    if (!item.hasPointerCapture(e.pointerId)) return;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    // Trigger drag threshold if movement > 6px
    if (Math.hypot(dx, dy) > 6) {
      isDragging = true;
    }
    
    if (isDragging) {
      item.style.transform = `translate(${dx}px, ${dy}px) scale(1.15)`;
    }
  });

  item.addEventListener('pointerup', (e) => {
    if (!item.hasPointerCapture(e.pointerId)) return;
    item.releasePointerCapture(e.pointerId);

    // Restore design transition styles
    item.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    item.style.zIndex = '20';

    if (isDragging) {
      const domo = document.getElementById('domo');
      const domoRect = domo.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      
      const centerX = itemRect.left + itemRect.width / 2;
      const centerY = itemRect.top + itemRect.height / 2;

      // Check if dropped within Domo's active container bounds
      if (
        centerX >= domoRect.left &&
        centerX <= domoRect.right &&
        centerY >= domoRect.top &&
        centerY <= domoRect.bottom
      ) {
        feedDomoDirectly(item.dataset.name);
      }
      
      // Return snack card back to its tray slot
      item.style.transform = 'translate(0, 0)';
    } else {
      // Direct click/tap: animate parabolic trajectory flight arc
      const itemRect = item.getBoundingClientRect();
      const initialX = itemRect.left + itemRect.width / 2;
      const initialY = itemRect.top + itemRect.height / 2;
      
      throwSnackArc(item.dataset.name, item.textContent, initialX, initialY);
    }
  });
}

// Drag & drop: direct feed
function feedDomoDirectly(snackName) {
  const domo = document.getElementById('domo');
  if (domo) {
    domo.triggerSquish(0.88, 1.16); // gulp swallow
    domo.triggerReaction(snackName);
  }
}

// Parabolic trajectory throwing formula: Bezier quadratic curve
function throwSnackArc(snackName, emoji, startX, startY) {
  const domo = document.getElementById('domo');
  if (!domo) return;

  const domoRect = domo.getBoundingClientRect();
  const targetX = domoRect.left + domoRect.width * 0.5;
  const targetY = domoRect.top + domoRect.height * 0.56; // Position near mouth

  // Spawn flying indicator element
  const flyer = document.createElement('div');
  flyer.className = 'flying-snack';
  flyer.textContent = emoji;
  flyer.style.left = `${startX}px`;
  flyer.style.top = `${startY}px`;
  flyer.style.transform = 'translate(-50%, -50%)';
  document.body.appendChild(flyer);

  const duration = 650; // milliseconds
  const startTime = performance.now();
  
  // Parabolic peak point (arc height control)
  const ctrlX = (startX + targetX) / 2;
  const ctrlY = Math.min(startY, targetY) - 120;

  // Domo visually gets ready to eat
  domo.setEyeState('wide-shocked');
  domo.setMouthState('talk'); // open mouth

  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);

    // Bezier Quadratic Formula
    const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ctrlX + t * t * targetX;
    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * ctrlY + t * t * targetY;

    flyer.style.left = `${x}px`;
    flyer.style.top = `${y}px`;
    flyer.style.transform = `translate(-50%, -50%) rotate(${t * 360}deg) scale(${1 - t * 0.25})`;

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      flyer.remove();
      domo.triggerSquish(0.86, 1.18); // swallow physics
      domo.triggerReaction(snackName);
    }
  }
  requestAnimationFrame(step);
}

// Custom Greeting URL & Input Controller
function initCustomMessage() {
  const input = document.getElementById('custom-message');
  const shareBtn = document.getElementById('share-btn');
  const speechText = document.getElementById('speech-text');

  if (!input || !shareBtn || !speechText) return;

  input.addEventListener('input', (e) => {
    const rawVal = e.target.value;
    const cleanVal = rawVal.slice(0, 120);
    input.value = cleanVal;
    
    if (cleanVal.trim() === '') {
      speechText.textContent = "Hi friend! I'm Domo, your host at pudomo.com! Try feeding me a snack from below and see what happens!";
    } else {
      speechText.textContent = cleanVal;
    }
  });

  shareBtn.addEventListener('click', () => {
    const msg = input.value.trim();
    const domo = document.getElementById('domo');
    const hat = domo ? domo.activeAccessory : 'none';
    
    let url = window.location.origin + window.location.pathname;
    const params = [];
    if (msg) params.push(`msg=${encodeURIComponent(msg)}`);
    if (hat !== 'none') params.push(`hat=${hat}`);
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    navigator.clipboard.writeText(url).then(() => {
      alert("✨ Link copied! Send it to a friend so Domo can greet them!");
    }).catch(err => {
      console.error('Failed to copy link:', err);
    });
  });
}

// Master Mute Button State Persistence
function initMuteButton(domo) {
  const muteBtn = document.getElementById('mute-toggle');
  if (!muteBtn) return;

  const storedMute = localStorage.getItem('domo-muted') === 'true';
  domo.isMuted = storedMute;
  muteBtn.textContent = storedMute ? '🔇' : '🔊';

  muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    domo.isMuted = !domo.isMuted;
    localStorage.setItem('domo-muted', domo.isMuted);
    muteBtn.textContent = domo.isMuted ? '🔇' : '🔊';

    if (!domo.isMuted && domo.audioCtx) {
      domo.audioCtx.resume();
    }
  });
}

// URL parameters parsing workflow
function checkUrlParameters(domo) {
  const params = new URLSearchParams(window.location.search);
  
  let msg = params.get('msg');
  if (msg) {
    msg = msg.slice(0, 120).trim();
  }

  const hat = params.get('hat');
  if (hat && ['tiny-crown', 'party-hat', 'sunglasses'].includes(hat)) {
    domo.showAccessory(hat);
  }

  const inviteBadge = document.getElementById('invite-badge');
  const speechText = document.getElementById('speech-text');

  if (msg) {
    // Show custom greeting badge overlay
    inviteBadge.classList.remove('hidden');
    speechText.textContent = "👉 Domo has a custom message for you!";

    const playGreeting = () => {
      inviteBadge.classList.add('hidden');
      domo.initAudio();
      
      // Happy trigger jump!
      domo.triggerSquish(0.85, 1.22);
      
      // Speak shared text
      domo.speakMessage(msg, 300, 450, 80, 'triangle');
      
      window.removeEventListener('click', playGreeting);
      window.removeEventListener('touchstart', playGreeting);
    };

    window.addEventListener('click', playGreeting);
    window.addEventListener('touchstart', playGreeting);
  } else {
    // Default load sequence: speak welcome text on first document click or touch
    const defaultText = "Hi friend! I'm Domo, your host at pudomo.com! Try feeding me a snack from below and see what happens!";
    speechText.textContent = defaultText;

    const playWelcome = () => {
      domo.initAudio();
      domo.speakMessage(defaultText, 300, 450, 80, 'triangle');
      
      window.removeEventListener('click', playWelcome);
      window.removeEventListener('touchstart', playWelcome);
    };

    window.addEventListener('click', playWelcome);
    window.addEventListener('touchstart', playWelcome);
  }
}

// Run application loader once DOM is available
document.addEventListener('DOMContentLoaded', () => {
  const domo = document.getElementById('domo');
  
  initSnackTray();
  initCustomMessage();
  
  if (domo) {
    initMuteButton(domo);
    checkUrlParameters(domo);
    unlockAudioOnFirstGesture(domo);
  }
});

// Bulletproof iOS Safari audio unlocker listening to native touchstart/click gestures
function unlockAudioOnFirstGesture(domo) {
  const unlock = () => {
    domo.initAudio();
    if (domo.audioCtx && domo.audioCtx.state === 'suspended') {
      domo.audioCtx.resume();
    }
    // Remove listeners immediately
    window.removeEventListener('click', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('click', unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true });
}
