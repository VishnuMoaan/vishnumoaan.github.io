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

  document.addEventListener('DOMContentLoaded', () => {
    setYear();
    setLoadedAnimation();
    setupMobileNav();
    setupRevealOnScroll();
    setupChatModal();
    setupPortraitFallback();
  });
})();
