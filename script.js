(() => {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setYear() {
    const yearEl = qs('#year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  function setLoadedAnimation() {
    // Trigger hero fade-in once DOM is ready.
    requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  }

  function setupMobileNav() {
    const toggle = qs('.nav-toggle');
    const nav = qs('#site-nav');
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    toggle.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      setOpen(open);
    });

    // Close when clicking a link
    qsa('a[href^="#"]', nav).forEach((a) => {
      a.addEventListener('click', () => setOpen(false));
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('is-open')) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      const clickedInside = nav.contains(target) || toggle.contains(target);
      if (!clickedInside) setOpen(false);
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  function setupRevealOnScroll() {
    const items = qsa('.reveal');
    if (!items.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((el) => io.observe(el));
  }

  function setupChatModal() {
    const modal = qs('#chatModal');
    if (!modal) return;

    const panel = qs('.modal-panel', modal);
    const openButtons = qsa('[data-open-chat]');
    const closeButtons = qsa('[data-close-chat]', modal);

    const setOpen = (open) => {
      modal.classList.toggle('is-open', open);
      modal.setAttribute('aria-hidden', String(!open));

      if (open) {
        document.documentElement.style.overflow = 'hidden';
        // Focus close button for accessibility
        const close = qs('[data-close-chat]', modal);
        close?.focus();
      } else {
        document.documentElement.style.overflow = '';
      }
    };

    openButtons.forEach((btn) => btn.addEventListener('click', () => setOpen(true)));
    closeButtons.forEach((btn) => btn.addEventListener('click', () => setOpen(false)));

    // Click outside panel closes
    modal.addEventListener('click', (e) => {
      if (!panel) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.classList.contains('modal-overlay')) setOpen(false);
    });

    // Escape closes
    document.addEventListener('keydown', (e) => {
      const isOpen = modal.classList.contains('is-open');
      if (isOpen && e.key === 'Escape') setOpen(false);
    });
  }

  function setupPortraitFallback() {
    const img = qs('#aboutPortrait');
    if (!img) return;

    const fallback = img.getAttribute('data-fallback');
    if (!fallback) return;

    const onError = () => {
      img.removeEventListener('error', onError);
      img.src = fallback;
    };

    img.addEventListener('error', onError);
  }

  function setupExperienceCards() {
    const cards = qsa('.timeline-card.expandable');
    if (!cards.length) return;

    cards.forEach((card) => {
      const toggle = () => {
        const isExpanded = card.classList.contains('expanded');
        
        // Close other cards
        cards.forEach(c => {
          if (c !== card) {
            c.classList.remove('expanded');
            c.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current card
        card.classList.toggle('expanded');
        card.setAttribute('aria-expanded', String(!isExpanded));
      };

      card.addEventListener('click', toggle);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  function setupExperienceCarousel() {
    const track = qs('.carousel-cards');
    const cards = qsa('.flip-card');
    const prevBtn = qs('.carousel-prev');
    const nextBtn = qs('.carousel-next');
    const dots = qsa('.dot');
    
    if (!track || !cards.length) return;

    let currentIndex = 0;

    const updateCarousel = () => {
      // Update active card - no translation, just active state
      cards.forEach((card, idx) => {
        card.classList.toggle('active', idx === currentIndex);
        card.setAttribute('data-active', idx === currentIndex ? 'true' : 'false');
      });

      // Update dots
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });

      // Update button states
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === cards.length - 1;

      // Scroll active card into view smoothly
      if (cards[currentIndex]) {
        cards[currentIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    };

    const goToSlide = (index) => {
      currentIndex = Math.max(0, Math.min(index, cards.length - 1));
      updateCarousel();
    };

    // Navigation buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
    }

    // Dot navigation
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => goToSlide(idx));
    });

    // Touch/Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartTime = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartTime = Date.now();
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      touchEndX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', () => {
      const touchDiff = touchStartX - touchEndX;
      const touchTime = Date.now() - touchStartTime;
      const minSwipeDistance = 50;
      const maxSwipeTime = 300;

      // Fast swipe detected
      if (Math.abs(touchDiff) > minSwipeDistance && touchTime < maxSwipeTime) {
        if (touchDiff > 0) {
          // Swipe left - next card
          goToSlide(currentIndex + 1);
        } else {
          // Swipe right - prev card
          goToSlide(currentIndex - 1);
        }
      }

      touchStartX = 0;
      touchEndX = 0;
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      const carousel = qs('.experience-carousel');
      if (!carousel) return;

      // Check if carousel is in viewport
      const rect = carousel.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (inView) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goToSlide(currentIndex - 1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          goToSlide(currentIndex + 1);
        }
      }
    });

    // Mobile tap to flip
    if (window.innerWidth <= 968) {
      cards.forEach((card) => {
        card.addEventListener('click', (e) => {
          // Don't flip if clicking nav buttons
          if (e.target.closest('.carousel-nav, .dot')) return;
          
          card.classList.toggle('flipped');
        });
      });
    }

    // Initialize
    updateCarousel();
  }

  // Initialize after components are loaded
  function initializeApp() {
    setYear();
    setLoadedAnimation();
    setupMobileNav();
    setupRevealOnScroll();
    setupChatModal();
    setupPortraitFallback();
    setupExperienceCarousel();
  }

  // Listen for components loaded event
  document.addEventListener('componentsLoaded', initializeApp);

  // Fallback: initialize on DOMContentLoaded if components are already loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Give component loader a moment to fire
    setTimeout(() => {
      if (!document.querySelector('.site-header')) {
        console.warn('Components not loaded, initializing anyway...');
        initializeApp();
      }
    }, 100);
  });
})();
