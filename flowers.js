/**
 * Hiii Shivann — Flower Interaction System
 * Reproduces the magical cursor & touch flower trail using the exact 13 assets.
 */

(function () {
  // 13 Flower Assets with bounding box metadata
  const FLOWER_ASSETS = [
    { src: '/assets/flowers/flower_01.png', width: 375, height: 666, baseScale: 0.9 },
    { src: '/assets/flowers/flower_02.png', width: 500, height: 500, baseScale: 1.0 },
    { src: '/assets/flowers/flower_03.png', width: 375, height: 666, baseScale: 0.95 },
    { src: '/assets/flowers/flower_04.png', width: 375, height: 666, baseScale: 0.85 },
    { src: '/assets/flowers/flower_05.png', width: 500, height: 500, baseScale: 1.05 },
    { src: '/assets/flowers/flower_06.png', width: 500, height: 500, baseScale: 1.0 },
    { src: '/assets/flowers/flower_07.png', width: 500, height: 500, baseScale: 1.1 },
    { src: '/assets/flowers/flower_08.png', width: 436, height: 572, baseScale: 0.95 },
    { src: '/assets/flowers/flower_09.png', width: 500, height: 500, baseScale: 1.05 },
    { src: '/assets/flowers/flower_10.png', width: 500, height: 500, baseScale: 1.05 },
    { src: '/assets/flowers/flower_11.png', width: 375, height: 666, baseScale: 0.9 },
    { src: '/assets/flowers/flower_12.png', width: 447, height: 559, baseScale: 1.0 },
    { src: '/assets/flowers/flower_13.png', width: 500, height: 500, baseScale: 1.05 }
  ];

  // Preload flower images
  FLOWER_ASSETS.forEach(item => {
    const img = new Image();
    img.src = item.src;
  });

  const CONFIG = {
    minSpawnDistanceDesktop: 32, // px between flowers
    minSpawnDistanceMobile: 26,  // px between flowers for touch trail
    maxActiveFlowers: 60,        // performance safety limit
    lifetimeMs: 1800,            // total visible life before full removal
    baseSizeDesktop: 85,         // px
    baseSizeMobile: 62           // px for phones
  };

  const isCoarse = window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  class FlowerInteractionEngine {
    constructor() {
      this.container = null;
      this.activeFlowers = [];
      this.lastPos = null;
      this.zIndexCounter = 100;
      this.isInteracting = false;
      this.init();
    }

    init() {
      // Create dedicated overlay container
      this.container = document.createElement('div');
      this.container.className = 'flower-interaction-overlay';
      this.container.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this.container);

      // Event listeners
      this.bindEvents();
    }

    bindEvents() {
      // Desktop fine pointer
      window.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'mouse') {
          this.handlePointerMove(e.clientX, e.clientY, false);
        }
      }, { passive: true });

      // Touch events with passive handling for smooth 60fps scrolling
      window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          const t = e.touches[0];
          this.lastPos = { x: t.clientX, y: t.clientY };
          this.spawnFlower(t.clientX, t.clientY, true);
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          const t = e.touches[0];
          this.handlePointerMove(t.clientX, t.clientY, true);
        }
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this.lastPos = null;
      }, { passive: true });
    }

    handlePointerMove(x, y, isTouch) {
      if (!this.lastPos) {
        this.lastPos = { x, y };
        this.spawnFlower(x, y, isTouch);
        return;
      }

      const dx = x - this.lastPos.x;
      const dy = y - this.lastPos.y;
      const dist = Math.hypot(dx, dy);
      const threshold = isTouch ? CONFIG.minSpawnDistanceMobile : CONFIG.minSpawnDistanceDesktop;

      if (dist >= threshold) {
        // If moved quickly, interpolate to prevent gaps
        if (dist > threshold * 2.5 && !isTouch) {
          const steps = Math.min(Math.floor(dist / threshold), 3);
          for (let i = 1; i <= steps; i++) {
            const ix = this.lastPos.x + (dx * (i / (steps + 1)));
            const iy = this.lastPos.y + (dy * (i / (steps + 1)));
            this.spawnFlower(ix, iy, isTouch);
          }
        }

        this.spawnFlower(x, y, isTouch);
        this.lastPos = { x, y };
      }
    }

    spawnFlower(x, y, isTouch) {
      if (prefersReducedMotion && this.activeFlowers.length > 10) return;

      // Maintain active flowers ceiling
      if (this.activeFlowers.length >= CONFIG.maxActiveFlowers) {
        const oldest = this.activeFlowers.shift();
        if (oldest && oldest.element && oldest.element.parentNode) {
          oldest.element.remove();
        }
      }

      // Pick random flower
      const flowerData = FLOWER_ASSETS[Math.floor(Math.random() * FLOWER_ASSETS.length)];
      const flowerEl = document.createElement('div');
      flowerEl.className = 'interactive-flower';

      // Subtle random variations
      const baseSize = isTouch ? CONFIG.baseSizeMobile : CONFIG.baseSizeDesktop;
      const scaleVariation = 0.85 + Math.random() * 0.35;
      const flowerSize = Math.round(baseSize * flowerData.baseScale * scaleVariation);

      // Random rotation (-30 to +30 deg)
      const initialRotation = -30 + Math.random() * 60;
      const floatRotation = initialRotation + (-10 + Math.random() * 20);

      // Jitter offset around cursor/finger
      const jitterX = -10 + Math.random() * 20;
      const jitterY = -10 + Math.random() * 20;

      // Drift physics (gentle upward floating)
      const driftY = prefersReducedMotion ? -5 : (-20 - Math.random() * 35);
      const driftX = prefersReducedMotion ? 0 : (-12 + Math.random() * 24);

      // Positioning: center flower on pointer
      const posX = x + jitterX - flowerSize / 2;
      const posY = y + jitterY - flowerSize / 2;

      this.zIndexCounter++;
      flowerEl.style.zIndex = this.zIndexCounter;
      flowerEl.style.width = `${flowerSize}px`;
      flowerEl.style.height = `${flowerSize}px`;
      flowerEl.style.left = `${posX}px`;
      flowerEl.style.top = `${posY}px`;

      // Set CSS variables for fluid GPU animation
      flowerEl.style.setProperty('--init-rot', `${initialRotation}deg`);
      flowerEl.style.setProperty('--float-rot', `${floatRotation}deg`);
      flowerEl.style.setProperty('--drift-x', `${driftX}px`);
      flowerEl.style.setProperty('--drift-y', `${driftY}px`);
      flowerEl.style.setProperty('--life-duration', `${CONFIG.lifetimeMs}ms`);

      const img = document.createElement('img');
      img.src = flowerData.src;
      img.alt = '';
      img.draggable = false;
      img.loading = 'eager';
      flowerEl.appendChild(img);

      this.container.appendChild(flowerEl);

      const flowerRecord = { element: flowerEl };
      this.activeFlowers.push(flowerRecord);

      // Cleanup when lifetime finishes
      setTimeout(() => {
        if (flowerEl.parentNode) {
          flowerEl.remove();
        }
        const idx = this.activeFlowers.indexOf(flowerRecord);
        if (idx !== -1) {
          this.activeFlowers.splice(idx, 1);
        }
      }, CONFIG.lifetimeMs);
    }
  }

  // Initialize engine on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.flowerEngine = new FlowerInteractionEngine();
    });
  } else {
    window.flowerEngine = new FlowerInteractionEngine();
  }
})();
