/**
 * Hiii Shivann — Flower Interaction System
 * Exactly reproduced from https://heyruu.vercel.app / github.com/Shivam9407/heyruu
 */

const FLOWER_ASSETS = [
  {
    id: 'flower_0',
    src: '/flowers/flower-01.png',
    width: 436,
    height: 572,
    aspectRatio: 0.76,
    centerX: 0.486,
    centerY: 0.506,
    name: 'Peach Rose'
  },
  {
    id: 'flower_1',
    src: '/flowers/flower-02.png',
    width: 500,
    height: 500,
    aspectRatio: 1.0,
    centerX: 0.490,
    centerY: 0.500,
    name: 'Forget-me-not Bouquet'
  },
  {
    id: 'flower_2',
    src: '/flowers/flower-03.png',
    width: 375,
    height: 666,
    aspectRatio: 0.56,
    centerX: 0.523,
    centerY: 0.508,
    name: 'Sunflower'
  },
  {
    id: 'flower_3',
    src: '/flowers/flower-04.png',
    width: 375,
    height: 666,
    aspectRatio: 0.56,
    centerX: 0.489,
    centerY: 0.694,
    name: 'Pink Daisy'
  },
  {
    id: 'flower_4',
    src: '/flowers/flower-05.png',
    width: 500,
    height: 500,
    aspectRatio: 1.0,
    centerX: 0.505,
    centerY: 0.499,
    name: 'Cherry Blossom'
  },
  {
    id: 'flower_5',
    src: '/flowers/flower-06.png',
    width: 375,
    height: 666,
    aspectRatio: 0.56,
    centerX: 0.493,
    centerY: 0.613,
    name: 'White Lily'
  },
  {
    id: 'flower_6',
    src: '/flowers/flower-07.png',
    width: 375,
    height: 666,
    aspectRatio: 0.56,
    centerX: 0.495,
    centerY: 0.509,
    name: 'Blue Violet'
  },
  {
    id: 'flower_7',
    src: '/flowers/flower-08.png',
    width: 500,
    height: 500,
    aspectRatio: 1.0,
    centerX: 0.496,
    centerY: 0.514,
    name: 'Purple Aster'
  },
  {
    id: 'flower_8',
    src: '/flowers/flower-09.png',
    width: 500,
    height: 500,
    aspectRatio: 1.0,
    centerX: 0.493,
    centerY: 0.484,
    name: 'Red Dahlia'
  },
  {
    id: 'flower_9',
    src: '/flowers/flower-10.png',
    width: 500,
    height: 500,
    aspectRatio: 1.0,
    centerX: 0.496,
    centerY: 0.499,
    name: 'Cyan Blossom'
  },
  {
    id: 'flower_10',
    src: '/flowers/flower-11.png',
    width: 447,
    height: 559,
    aspectRatio: 0.80,
    centerX: 0.481,
    centerY: 0.485,
    name: 'Yellow Marigold'
  },
  {
    id: 'flower_11',
    src: '/flowers/flower-12.png',
    width: 500,
    height: 500,
    aspectRatio: 1.0,
    centerX: 0.499,
    centerY: 0.498,
    name: 'Soft Carnation'
  },
  {
    id: 'flower_12',
    src: '/flowers/flower-13.png',
    width: 500,
    height: 500,
    aspectRatio: 1.0,
    centerX: 0.502,
    centerY: 0.515,
    name: 'Wine Rose'
  }
];

const FLOWER_CONFIG = {
  desktopSpawnDistance: 60,
  mobileSpawnDistance: 32,
  maxActiveFlowers: 35,
  desktopBaseWidth: 200,
  desktopBaseHeight: 228,
  mobileBaseWidth: 140,
  mobileBaseHeight: 160,
  visibleDuration: 0.75,
  enterDuration: 0.45,
  exitDuration: 0.5,
  minScale: 0.85,
  maxScale: 1.15,
  minRotate: -24,
  maxRotate: 24,
  randomOffset: 12
};

class HeyRuuFlowerInteraction {
  constructor(container) {
    this.container = container;
    this.overlay = null;
    this.lastSpawn = { x: -9999, y: -9999 };
    this.flowerIndex = 0;
    this.activeFlowers = [];
    this.isTouchDevice = false;
    this.isReducedMotion = false;
    this.init();
  }

  init() {
    // Detect fine mouse vs touch
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.isTouchDevice = hasTouch && !hasFinePointer;

    // Update instruction label if present
    const instructionLabel = document.getElementById('instruction-label');
    if (instructionLabel) {
      instructionLabel.textContent = this.isTouchDevice ? 'TOUCH & DRAG' : 'HOVER YOUR CURSOR';
    }

    // Preload images
    FLOWER_ASSETS.forEach(asset => {
      const img = new Image();
      img.src = asset.src;
    });

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'flower-interaction-overlay';
    this.overlay.setAttribute('aria-hidden', 'true');
    this.container.appendChild(this.overlay);

    this.bindEvents();
  }

  bindEvents() {
    const onMouseMove = (e) => {
      this.handlePointerMovement(e.clientX, e.clientY, false);
    };

    const onTouchStart = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        this.handlePointerMovement(touch.clientX, touch.clientY, true);
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        this.handlePointerMovement(touch.clientX, touch.clientY, true);
      }
    };

    const onTouchEnd = () => {
      this.lastSpawn = { x: -9999, y: -9999 };
    };

    this.container.addEventListener('mousemove', onMouseMove, { passive: true });
    this.container.addEventListener('touchstart', onTouchStart, { passive: true });
    this.container.addEventListener('touchmove', onTouchMove, { passive: true });
    this.container.addEventListener('touchend', onTouchEnd, { passive: true });
    this.container.addEventListener('touchcancel', onTouchEnd, { passive: true });
  }

  handlePointerMovement(clientX, clientY, isDown = false) {
    const rect = this.container.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    // Check bounds
    if (relX < 0 || relY < 0 || relX > rect.width || relY > rect.height) {
      return;
    }

    const dist = Math.hypot(
      relX - this.lastSpawn.x,
      relY - this.lastSpawn.y
    );

    const threshold = this.isTouchDevice
      ? FLOWER_CONFIG.mobileSpawnDistance
      : FLOWER_CONFIG.desktopSpawnDistance;

    if (dist >= threshold || (isDown && dist > 15)) {
      this.lastSpawn = { x: relX, y: relY };
      this.spawnFlower(relX, relY);
    }
  }

  spawnFlower(x, y) {
    const isMobile = window.innerWidth <= 768;
    const baseW = isMobile ? FLOWER_CONFIG.mobileBaseWidth : FLOWER_CONFIG.desktopBaseWidth;
    const baseH = isMobile ? FLOWER_CONFIG.mobileBaseHeight : FLOWER_CONFIG.desktopBaseHeight;

    const asset = FLOWER_ASSETS[this.flowerIndex % FLOWER_ASSETS.length];
    this.flowerIndex += 1;

    const scale = FLOWER_CONFIG.minScale + Math.random() * (FLOWER_CONFIG.maxScale - FLOWER_CONFIG.minScale);
    const rotation = FLOWER_CONFIG.minRotate + Math.random() * (FLOWER_CONFIG.maxRotate - FLOWER_CONFIG.minRotate);
    const jitterX = (Math.random() - 0.5) * FLOWER_CONFIG.randomOffset;
    const jitterY = (Math.random() - 0.5) * FLOWER_CONFIG.randomOffset;
    const floatOffset = -12 - Math.random() * 8;

    const posX = x + jitterX;
    const posY = y + jitterY;

    const left = posX - baseW * asset.centerX;
    const top = posY - baseH * asset.centerY;

    // Create flower DOM element
    const el = document.createElement('div');
    el.className = 'flower-instance flower-state-entering';
    if (this.isReducedMotion) el.classList.add('reduced-motion');
    el.style.width = `${baseW}px`;
    el.style.height = `${baseH}px`;
    el.style.transform = `translate3d(${left}px, ${top}px, 0) rotate(${rotation - 12}deg) scale(${scale * 0.3})`;
    el.style.opacity = '0';
    el.setAttribute('aria-hidden', 'true');

    const img = document.createElement('img');
    img.src = asset.src;
    img.alt = '';
    img.draggable = false;
    img.className = 'flower-image';
    img.loading = 'eager';
    el.appendChild(img);

    this.overlay.appendChild(el);

    // Limit active pool
    this.activeFlowers.push(el);
    if (this.activeFlowers.length > FLOWER_CONFIG.maxActiveFlowers) {
      const oldest = this.activeFlowers.shift();
      if (oldest && oldest.parentNode) oldest.remove();
    }

    // Step 1: Active
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.className = 'flower-instance flower-state-active';
        el.style.transform = `translate3d(${left}px, ${top}px, 0) rotate(${rotation}deg) scale(${scale})`;
        el.style.opacity = '1';
      });
    });

    // Step 2: Floating
    const enterTimer = setTimeout(() => {
      const driftY = this.isReducedMotion ? 0 : floatOffset;
      el.className = 'flower-instance flower-state-floating';
      el.style.transform = `translate3d(${left}px, ${top + driftY}px, 0) rotate(${rotation + 2}deg) scale(${scale * 0.98})`;
      el.style.opacity = '0.95';
    }, FLOWER_CONFIG.enterDuration * 1000);

    // Step 3: Exiting
    const exitTimer = setTimeout(() => {
      const exitY = this.isReducedMotion ? 0 : floatOffset - 16;
      el.className = 'flower-instance flower-state-exiting';
      el.style.transform = `translate3d(${left}px, ${top + exitY}px, 0) rotate(${rotation + 6}deg) scale(${scale * 0.35})`;
      el.style.opacity = '0';
    }, (FLOWER_CONFIG.enterDuration + FLOWER_CONFIG.visibleDuration) * 1000);

    // Step 4: Removal
    const removeTimer = setTimeout(() => {
      if (el.parentNode) el.remove();
      const idx = this.activeFlowers.indexOf(el);
      if (idx !== -1) this.activeFlowers.splice(idx, 1);
    }, (FLOWER_CONFIG.enterDuration + FLOWER_CONFIG.visibleDuration + FLOWER_CONFIG.exitDuration) * 1000);
  }
}

// Auto-initialize on hero section
function initFlowerInteractions() {
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    new HeyRuuFlowerInteraction(heroSection);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFlowerInteractions);
} else {
  initFlowerInteractions();
}

export default HeyRuuFlowerInteraction;
