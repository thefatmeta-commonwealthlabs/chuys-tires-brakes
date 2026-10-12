// Chuy's Tires & Brake Service - Main Interactive Logic
document.addEventListener('DOMContentLoaded', () => {
  initCountdownTimer();
  initAnimatedCounters();
  initCreditDisplay();
  initMobileMenu();
});

// Urgency Countdown Timer (Tony Robbins Momentum Anchor)
function initCountdownTimer() {
  const timerElements = document.querySelectorAll('.countdown-timer-display');
  if (!timerElements.length) return;

  // 14 minutes 45 seconds countdown stored in sessionStorage or fresh
  let duration = parseInt(sessionStorage.getItem('chuys_urgency_timer') || '885', 10);

  function updateDisplay() {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    timerElements.forEach(el => el.textContent = formatted);

    if (duration > 0) {
      duration--;
      sessionStorage.setItem('chuys_urgency_timer', duration.toString());
    } else {
      duration = 900; // Reset urgency cycle
    }
  }

  updateDisplay();
  setInterval(updateDisplay, 1000);
}

// Animated Stat Counters
function initAnimatedCounters() {
  const counters = document.querySelectorAll('.stat-counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target') || '0');
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        
        let start = 0;
        const duration = 2000;
        const startTime = performance.now();

        function step(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = start + (target - start) * easeOut;
          
          el.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
          }
        }
        requestAnimationFrame(step);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(c => observer.observe(c));
}

// Quote Credit Display in Navbar & Header
function initCreditDisplay() {
  const creditElements = document.querySelectorAll('.user-credits-remaining');
  const storedCredits = localStorage.getItem('chuys_quote_credits') || '1';
  const storedTier = localStorage.getItem('chuys_subscription_tier') || 'Free Tier';

  creditElements.forEach(el => {
    el.textContent = `${storedCredits} Quote Credits (${storedTier})`;
  });
}

// Mobile Menu Toggle
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!toggleBtn || !mobileMenu) return;

  toggleBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}
