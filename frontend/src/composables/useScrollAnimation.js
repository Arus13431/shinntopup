import { onMounted, onUnmounted } from 'vue';

// Track scrolling direction globally to optimize performance
let scrollDirection = 'down';
let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY) {
      scrollDirection = 'down';
    } else if (currentScrollY < lastScrollY) {
      scrollDirection = 'up';
    }
    lastScrollY = currentScrollY;
  }, { passive: true });
}

export function useScrollAnimation(elRef, direction = null) {
  let observer = null;

  onMounted(() => {
    const el = elRef.value;
    if (!el) return;

    // Apply base class for transition styling
    el.classList.add('scroll-animate');

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // If a direction is explicitly specified, use it.
          // Otherwise, dynamically determine it based on viewport scroll direction:
          // Scroll down -> elements enter from below -> fade up
          // Scroll up -> elements enter from above -> fade down
          const animationDirection = direction || (scrollDirection === 'down' ? 'up' : 'down');

          if (animationDirection === 'up') {
            el.classList.remove('scroll-animate-down');
            el.classList.add('scroll-animate-up');
          } else {
            el.classList.remove('scroll-animate-up');
            el.classList.add('scroll-animate-down');
          }

          // Trigger reflow to apply transform start positions
          void el.offsetHeight;
          
          el.classList.add('scroll-visible');
        } else {
          // Reset animation so it can animate again when entering from another side
          el.classList.remove('scroll-visible');
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -10px 0px' // offset slightly to trigger just as entering viewport
    });

    observer.observe(el);

    // Fallback safeguard to prevent blank elements if observer fails, delays, or rootMargin misses it
    setTimeout(() => {
      if (el && !el.classList.contains('scroll-visible')) {
        el.classList.add('scroll-animate-up');
        void el.offsetHeight;
        el.classList.add('scroll-visible');
      }
    }, 300);
  });

  onUnmounted(() => {
    if (observer && elRef.value) {
      observer.unobserve(elRef.value);
    }
  });
}
