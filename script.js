document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('js-enabled');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.site-header');
  if (header) {
    const syncHeaderHeight = () => document.documentElement.style.setProperty('--header-height', header.getBoundingClientRect().height + 'px');
    syncHeaderHeight();
    new ResizeObserver(syncHeaderHeight).observe(header);
  }
  const mobileMenu = document.getElementById('mobileMenu');
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const phoneLayout = matchMedia('(max-width: 739px)');
  if (mobileMenu && menuToggle) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.showModal();
      menuToggle.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('menu-open');
    });
    mobileMenu.querySelector('.mobile-menu-close').addEventListener('click', () => mobileMenu.close());
    mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => mobileMenu.close()));
    mobileMenu.addEventListener('close', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('menu-open');
    });
    phoneLayout.addEventListener('change', event => { if (!event.matches && mobileMenu.open) mobileMenu.close(); });
  }
  const updateHeader = () => header?.classList.toggle('is-scrolled', scrollY > 30);
  updateHeader();
  addEventListener('scroll', updateHeader, { passive: true });

  if ('IntersectionObserver' in window && !motion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: .06 });
    document.querySelectorAll('.mission-statement, .mission-portrait-wrap, .slider-header, .training-header, .section-header, .showcase-header, .card, .comparison-box, .training-card, .media-card, .showcase-item, .cta-yellow-block, .cta-banner, .contact-item').forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight) return;
      el.classList.add('reveal-item', 'reveal-pending');
      el.style.setProperty('--reveal-delay', `${([...el.parentElement.children].indexOf(el) % 3) * .07}s`);
      observer.observe(el);
    });
    motion.addEventListener('change', event => {
      if (!event.matches) return;
      observer.disconnect();
      document.querySelectorAll('.reveal-pending').forEach(el => el.classList.add('is-revealed'));
    });
  }

  const video = document.getElementById('heroBgVideo');
  const sound = document.getElementById('heroSoundToggle');
  if (video && sound) {
    let ready = false, visible = true, requested = false;
    const syncMotion = () => {
      if (!ready || !visible || document.hidden || (!requested && (motion.matches || phoneLayout.matches || navigator.connection?.saveData))) { video.pause(); return; }
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      video.play().catch(() => {});
    };
    const scheduleVideo = () => {
      const start = () => { ready = true; syncMotion(); };
      if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 2000 });
      else setTimeout(start, 500);
    };
    if (document.readyState === 'complete') scheduleVideo();
    else addEventListener('load', scheduleVideo, { once: true });
    motion.addEventListener('change', syncMotion);
    phoneLayout.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncMotion);
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      syncMotion();
    }).observe(video);
    sound.addEventListener('click', () => {
      video.muted = !video.muted;
      ready = true; requested = true; syncMotion();
      const unmuted = !video.muted;
      sound.classList.toggle('is-unmuted', unmuted);
      sound.setAttribute('aria-pressed', String(unmuted));
      sound.setAttribute('aria-label', unmuted ? 'Mute background video' : 'Unmute background video');
    });
  }

  const slider = document.getElementById('assessmentSlider');
  const prev = document.getElementById('slidePrevBtn');
  const next = document.getElementById('slideNextBtn');
  if (slider && prev && next) {
    const sync = () => {
      prev.disabled = slider.scrollLeft <= 2;
      next.disabled = slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 2;
    };
    const move = direction => slider.scrollBy({ left: direction * (slider.querySelector('.assessment-card').offsetWidth + (parseFloat(getComputedStyle(slider).columnGap) || 24)), behavior: motion.matches ? 'instant' : 'smooth' });
    prev.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    slider.addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    sync();
  }

  // Keep native validation and submission; put errors beside their fields.
  document.querySelectorAll('form').forEach(form => {
    const fields = [...form.querySelectorAll('input, textarea')];
    const validate = field => {
      if (field.required && field.type === 'text') field.setCustomValidity(field.value.trim() ? '' : 'Please fill out this field.');
      const valid = field.validity.valid;
      field.setAttribute('aria-invalid', String(!valid));
      document.getElementById(`${field.id}-error`).textContent = valid ? '' : field.validationMessage;
      return valid;
    };
    fields.forEach(field => {
      const error = document.createElement('p');
      error.id = `${field.id}-error`;
      error.className = 'field-error';
      error.setAttribute('aria-live', 'polite');
      field.setAttribute('aria-describedby', error.id);
      field.after(error);
      field.addEventListener('blur', () => { if (field.value || field.getAttribute('aria-invalid') === 'true') validate(field); });
      field.addEventListener('input', () => { if (field.getAttribute('aria-invalid') === 'true') validate(field); });
      field.addEventListener('invalid', () => validate(field));
    });
    form.addEventListener('submit', event => {
      if (!fields.map(validate).every(Boolean)) {
        event.preventDefault();
        fields.find(field => !field.validity.valid)?.focus();
        return;
      }
      if (form.matches('[data-inquiry-form]')) {
        event.preventDefault();
        const value = name => form.elements.namedItem(name)?.value.trim() || '';
        const lines = ['Hello PETTOP LONDON, I would like to inquire about the next intake.', 'Name: ' + value('full_name'), 'WhatsApp: ' + value('whatsapp_number'), 'Preschool: ' + value('preschool_name')];
        if (value('message')) lines.push('Question: ' + value('message'));
        location.assign('https://wa.me/' + form.dataset.whatsapp + '?text=' + encodeURIComponent(lines.join('\n')));
      }
    });
  });

  const modal = document.getElementById('LeadModal');
  if (!modal) return;
  const close = document.getElementById('closeModalBtn');
  const background = [...document.querySelectorAll('body > header, body > main, body > footer')];
  const wasInert = new Map();
  let lastFocus;
  function openModal() {
    if (modal.classList.contains('is-visible')) return;
    lastFocus = document.activeElement;
    try { sessionStorage.setItem('pettop-intake-seen', 'true'); } catch { /* Storage may be blocked. */ }
    modal.inert = false;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-visible');
    document.body.classList.add('modal-open');
    background.forEach(el => { wasInert.set(el, el.inert); el.inert = true; });
    modal.querySelector('.modal-box').scrollTop = 0;
    close.focus({ preventScroll: true });
  }
  function closeModal() {
    if (!modal.classList.contains('is-visible')) return;
    modal.classList.remove('is-visible');
    background.forEach(el => { el.inert = wasInert.get(el) || false; });
    document.body.classList.remove('modal-open');
    if (lastFocus && lastFocus !== document.body && lastFocus.isConnected) lastFocus.focus({ preventScroll: true });
    else document.querySelector('[data-open-modal]')?.focus({ preventScroll: true });
    modal.setAttribute('aria-hidden', 'true');
    modal.inert = true;
  }
  document.querySelectorAll('[data-open-modal]').forEach(button => button.addEventListener('click', event => { event.preventDefault(); openModal(); }));
  close.addEventListener('click', closeModal);
  modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', event => {
    if (!modal.classList.contains('is-visible')) return;
    if (event.key === 'Escape') { event.preventDefault(); closeModal(); }
    if (event.key === 'Tab') {
      const elements = [...modal.querySelectorAll('button, input, textarea, a[href]')].filter(el => !el.disabled && el.getClientRects().length);
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
});
