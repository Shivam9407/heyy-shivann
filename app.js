/**
 * Hiii Shivann — Main Interactive Controller
 * Handles SPA page transitions, split-letter hover effects, and parallax
 */

document.addEventListener('DOMContentLoaded', () => {
  initSplitLetters();
  initRouting();
  initParallax();
});

/**
 * Split each character of "Happy 1st August" into the double-letter rolling animation
 */
function initSplitLetters() {
  const container = document.getElementById('split-text-target');
  if (!container) return;

  const text = container.getAttribute('data-text') || 'Happy 1st August';
  container.innerHTML = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const box = document.createElement('div');
    box.className = 'letter-box';

    const spacer = document.createElement('span');
    spacer.className = 'letter-spacer';
    spacer.textContent = char === ' ' ? '\u00A0' : char;

    const top = document.createElement('span');
    top.className = 'letter-top';
    top.textContent = char === ' ' ? '\u00A0' : char;

    const bottom = document.createElement('span');
    bottom.className = 'letter-bottom';
    bottom.textContent = char === ' ' ? '\u00A0' : char;

    box.appendChild(spacer);
    box.appendChild(top);
    box.appendChild(bottom);
    container.appendChild(box);
  }
}

/**
 * Seamless SPA router between Landing Page and Letter Page
 */
function initRouting() {
  const homeView = document.getElementById('home-view');
  const letterView = document.getElementById('letter-view');
  const linkToLetter = document.getElementById('go-to-letter');
  const linkToHome = document.getElementById('back-to-home');

  function navigateTo(page, push = true) {
    if (page === 'letter' || page === '/page' || page === 'page') {
      if (homeView) homeView.style.display = 'none';
      if (letterView) {
        letterView.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      document.title = 'Hii-Shivann | Letter';
      if (push && window.location.pathname !== '/page') {
        history.pushState({ page: 'letter' }, '', '/page');
      }
    } else {
      if (letterView) letterView.style.display = 'none';
      if (homeView) {
        homeView.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      document.title = 'Hii-Shivann';
      if (push && window.location.pathname !== '/') {
        history.pushState({ page: 'home' }, '', '/');
      }
    }
  }

  // Intercept links
  if (linkToLetter) {
    linkToLetter.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('letter');
    });
  }

  if (linkToHome) {
    linkToHome.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('home');
    });
  }

  // Browser back/forward button support
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.page === 'letter') {
      navigateTo('letter', false);
    } else if (window.location.pathname.endsWith('/page') || window.location.pathname.endsWith('page.html')) {
      navigateTo('letter', false);
    } else {
      navigateTo('home', false);
    }
  });

  // Check initial URL
  if (window.location.pathname.endsWith('/page') || window.location.pathname.endsWith('page.html') || window.location.hash === '#letter') {
    navigateTo('letter', false);
  } else {
    navigateTo('home', false);
  }
}

/**
 * Subtle parallax for the August section
 */
function initParallax() {
  const bgImg = document.querySelector('.august-bg-img');
  if (!bgImg) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const rect = bgImg.getBoundingClientRect();
        const winHeight = window.innerHeight;
        if (rect.bottom >= 0 && rect.top <= winHeight) {
          const progress = (winHeight - rect.top) / (winHeight + rect.height);
          const translateY = (progress - 0.5) * 45; // subtle float
          bgImg.style.transform = `scale(1.1) translateY(${translateY}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}
