/* =========================================================
   Swish — interactions
   GSAP + ScrollTrigger for scroll animation, Lenis for smooth scroll.
   ========================================================= */
(() => {
  const html = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';

  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- theme toggle ---------- */
  const themeBtn = document.querySelector('[data-theme-toggle]');
  themeBtn?.addEventListener('click', () => {
    const dark = html.dataset.theme !== 'dark';
    if (dark) html.dataset.theme = 'dark'; else delete html.dataset.theme;
    try { localStorage.setItem('swish-theme', dark ? 'dark' : 'light'); } catch (e) {}
  });

  if (!hasGsap) {
    document.querySelector('.curtain')?.remove();
    document.querySelectorAll('[data-reveal]').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: target === 0 ? 0 : -90, duration: 1.4 });
    else (target === 0 ? window : target).scrollTo ? window.scrollTo({ top: target === 0 ? 0 : target.offsetTop - 90, behavior: 'smooth' }) : null;
  };

  /* ---------- text splitting ---------- */
  document.querySelectorAll('[data-split-lines] > span').forEach(line => {
    const inner = document.createElement('span');
    inner.innerHTML = line.innerHTML;
    line.innerHTML = '';
    line.appendChild(inner);
  });
  document.querySelectorAll('[data-scrub-words]').forEach(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  });
  const giant = document.querySelector('[data-footer-giant]');
  if (giant) giant.innerHTML = giant.textContent.split(' ').map(w => `<span class="wd">${[...w].map(c => `<span class="ch">${c}</span>`).join('')}</span>`).join(' ');

  /* ---------- intro / page load ---------- */
  const curtain = document.querySelector('.curtain');
  const heroLines = document.querySelectorAll('.hero__title > span > span');
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  gsap.set(heroLines, { yPercent: 110 });
  gsap.set('[data-hero-panel]', { clipPath: 'inset(12% 8% 0% 8% round 24px)' });
  intro
    .to('.curtain__logo', { yPercent: -40, opacity: 0, duration: .6, ease: 'power3.in' }, .35)
    .to(curtain, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, .55)
    .set(curtain, { display: 'none' })
    .to('[data-hero-panel]', { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.6 }, 1.0)
    .to(heroLines, { yPercent: 0, duration: 1.3, stagger: .09 }, 1.05)
    .to('.hero [data-reveal]', { opacity: 1, y: 0, duration: 1.1, stagger: .1 }, 1.25)
    .from('.header__inner > *', { y: -20, opacity: 0, duration: 1, stagger: .08 }, 1.2)
    .from('.hear, .sticker', { y: 30, opacity: 0, duration: 1, stagger: .1 }, 1.6);

  /* ---------- header: floating pill on scroll, hide on scroll down ---------- */
  const header = document.querySelector('[data-header]');
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      header.classList.toggle('is-scrolled', y > 40);
      const goingDown = y > lastY && y > 600 && !body.classList.contains('menu-open') && !body.classList.contains('mega-open');
      header.classList.toggle('is-hidden', goingDown);
      lastY = y;
    }
  });

  /* ---------- mega menu ---------- */
  const mega = document.querySelector('[data-mega]');
  if (mega) {
    const btn = mega.querySelector('button');
    let closeTimer;
    const open = () => { clearTimeout(closeTimer); mega.classList.add('is-open'); body.classList.add('mega-open'); btn.setAttribute('aria-expanded', 'true'); };
    const close = () => { closeTimer = setTimeout(() => { mega.classList.remove('is-open'); body.classList.remove('mega-open'); btn.setAttribute('aria-expanded', 'false'); }, 120); };
    mega.addEventListener('mouseenter', open);
    mega.addEventListener('mouseleave', close);
    btn.addEventListener('click', () => mega.classList.contains('is-open') ? close() : open());
    mega.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ---------- mobile menu ---------- */
  const burger = document.querySelector('[data-burger]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const setMenu = (openState) => {
    body.classList.toggle('menu-open', openState);
    burger.setAttribute('aria-expanded', String(openState));
    mobileMenu.setAttribute('aria-hidden', String(!openState));
    if (lenis) openState ? lenis.stop() : lenis.start();
  };
  burger?.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- anchor links with smooth scroll + curtain wipe for nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' ) { e.preventDefault(); return; }
      const target = id === '#top' ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      scrollTo(target);
    });
  });

  /* ---------- hero: stat reel + scroll parallax ---------- */
  const rows = document.querySelectorAll('[data-reel-row]');
  rows.forEach(row => {
    const dir = Number(row.dataset.reelRow);
    const span = row.querySelector('span');
    row.appendChild(span.cloneNode(true));
    const w = () => span.offsetWidth;
    gsap.fromTo(row, { x: dir > 0 ? () => -w() : 0 }, { x: dir > 0 ? 0 : () => -w(), duration: 38, ease: 'none', repeat: -1 });
  });

  // cycle between the reel and an image scene, like a showreel cut
  const scene = document.querySelector('.hero__scene');
  if (scene && !reduceMotion) {
    // stats play first, then hand over to the showreel video
    gsap.timeline({ delay: 3.6 })
      .to(scene, { opacity: 1, scale: 1, duration: 1.4, ease: 'expo.out' })
      .to('.hero__reel', { opacity: 0, duration: .7 }, 0);
  }

  const mm = gsap.matchMedia();
  mm.add('(min-width: 961px)', () => {
    gsap.to('[data-hero-panel]', {
      scale: .94, borderRadius: 32, ease: 'none',
      scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero__card', {
      y: -80, ease: 'none',
      scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- word-by-word scrub (intro + story) ---------- */
  document.querySelectorAll('[data-scrub-words]').forEach(el => {
    gsap.to(el.querySelectorAll('.w'), {
      opacity: 1, stagger: .08, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 45%', scrub: .6 }
    });
  });

  /* ---------- line reveals for headings outside the hero ---------- */
  document.querySelectorAll('[data-split-lines]:not(.hero__title)').forEach(el => {
    gsap.from(el.querySelectorAll(':scope > span > span'), {
      yPercent: 110, duration: 1.2, stagger: .08, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  /* ---------- generic fade-up reveals ---------- */
  document.querySelectorAll('[data-reveal]').forEach(el => {
    if (el.closest('.hero')) return;
    gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  /* ---------- work cards: reveal + image parallax ---------- */
  document.querySelectorAll('.card').forEach(card => {
    const media = card.querySelector('.card__media');
    const img = media.querySelector('img, video');
    gsap.from(media, { clipPath: 'inset(18% 6% 0% 6% round 24px)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 88%' } });
    gsap.from(card.querySelectorAll('.card__meta, .card__title'), { y: 24, opacity: 0, duration: 1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 75%' } });
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  mm.add('(min-width: 721px)', () => {
    gsap.fromTo('.work__col--right', { y: 0 }, { y: -120, ease: 'none', scrollTrigger: { trigger: '.work', start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- logos marquee ---------- */
  document.querySelectorAll('[data-marquee]').forEach(track => {
    const set = track.querySelector('.logos__set');
    track.appendChild(set.cloneNode(true));
    track.appendChild(set.cloneNode(true));
    const speed = Number(track.dataset.speed) || 40;
    const tween = gsap.to(track, { x: () => -set.offsetWidth, duration: () => set.offsetWidth / speed, ease: 'none', repeat: -1 });
    track.addEventListener('mouseenter', () => gsap.to(tween, { timeScale: .25, duration: .6 }));
    track.addEventListener('mouseleave', () => gsap.to(tween, { timeScale: 1, duration: .6 }));
  });

  /* ---------- expertise: active service follows scroll ---------- */
  const services = [...document.querySelectorAll('.service')];
  services.forEach((s, i) => {
    ScrollTrigger.create({
      trigger: s, start: 'top 55%', end: 'bottom 55%',
      onToggle: self => { if (self.isActive) services.forEach((o, j) => o.classList.toggle('is-active', i === j)); }
    });
    gsap.from(s.querySelector('.service__name'), { yPercent: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 92%' } });
  });
  // the floating "hear from" pill swaps sides over the dark section, as in the reference recording
  const hear = document.querySelector('[data-hear]');
  ScrollTrigger.create({
    trigger: '.expertise', start: 'top 60%', end: 'bottom 40%',
    onToggle: self => hear?.classList.toggle('is-left', self.isActive)
  });

  /* ---------- testimonial parallax + scale-in ---------- */
  const tMedia = document.querySelector('[data-parallax-wrap]');
  if (tMedia) {
    gsap.fromTo(tMedia, { scale: .9 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: tMedia, start: 'top bottom', end: 'top 30%', scrub: true } });
    gsap.fromTo(tMedia.querySelector('[data-parallax]'), { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: tMedia, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.testimonial__quote > *', { y: 40, opacity: 0, duration: 1.2, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: tMedia, start: 'top 60%' } });
  }

  /* ---------- big marquee: auto-scroll + scroll velocity boost ---------- */
  const velRows = [...document.querySelectorAll('[data-velocity-marquee]')].map(row => {
    const span = row.querySelector('span');
    row.appendChild(span.cloneNode(true));
    return { row, span, dir: Number(row.dataset.velocityMarquee), x: 0 };
  });
  let velocity = 0;
  ScrollTrigger.create({ trigger: '.big-marquee', start: 'top bottom', end: 'bottom top', onUpdate: self => { velocity = self.getVelocity(); } });
  gsap.ticker.add((_, delta) => {
    const dt = Math.min(delta, 50) / 1000;
    velocity *= .9;
    const boost = 1 + Math.min(Math.abs(velocity) / 300, 8);
    const dirSign = velocity < -5 ? -1 : 1;
    velRows.forEach(r => {
      const w = r.span.offsetWidth;
      if (!w) return;
      r.x += r.dir * dirSign * 60 * boost * dt;
      r.x = ((r.x % w) + w) % w;
      gsap.set(r.row, { x: -r.x });
    });
  });

  /* ---------- journal slider: buttons + drag ---------- */
  const slider = document.querySelector('[data-slider]');
  if (slider) {
    const step = () => (slider.querySelector('.post')?.offsetWidth || 300) + 24;
    document.querySelectorAll('[data-slide]').forEach(b => b.addEventListener('click', () => slider.scrollBy({ left: Number(b.dataset.slide) * step(), behavior: 'smooth' })));
    let down = false, startX = 0, startLeft = 0, moved = false;
    slider.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; startX = e.clientX; startLeft = slider.scrollLeft; });
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; slider.classList.add('is-dragging'); }
      slider.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return; down = false;
      slider.classList.remove('is-dragging');
      if (moved) { const s = step(); slider.scrollTo({ left: Math.round(slider.scrollLeft / s) * s, behavior: 'smooth' }); }
    });
    gsap.from('.post', { x: 120, opacity: 0, duration: 1.3, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: slider, start: 'top 85%' } });
  }

  /* ---------- footer: giant text letters rise in ---------- */
  if (giant) {
    gsap.from(giant.querySelectorAll('.ch'), {
      yPercent: 100, opacity: 0, duration: 1.2, stagger: .025, ease: 'expo.out',
      scrollTrigger: { trigger: giant, start: 'top 95%' }
    });
  }
  gsap.from('.footer__panel', { y: 80, borderRadius: 64, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.footer', start: 'top 95%' } });

  /* ---------- custom cursor bubble ---------- */
  if (finePointer) {
    const cursor = document.querySelector('.cursor');
    const xTo = gsap.quickTo(cursor, 'x', { duration: .5, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: .5, ease: 'power3' });
    window.addEventListener('pointermove', e => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
    document.querySelectorAll('[data-cursor]').forEach(el => {
      const mode = el.dataset.cursor;
      el.addEventListener('mouseenter', () => cursor.classList.add('is-' + mode));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-' + mode));
    });

    /* magnetic buttons */
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      const mx = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1, .4)' });
      const my = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1, .4)' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .25);
        my((e.clientY - r.top - r.height / 2) * .35);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }

  /* ---------- sticker eyes follow the pointer ---------- */
  const eyes = document.querySelectorAll('[data-eye]');
  window.addEventListener('pointermove', e => {
    eyes.forEach(eye => {
      const r = eye.getBoundingClientRect();
      const a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
      gsap.to(eye.firstElementChild, { x: Math.cos(a) * 3.5, y: Math.sin(a) * 5, duration: .3, overwrite: true });
    });
  }, { passive: true });

  /* ---------- back to top ---------- */
  document.querySelector('[data-to-top]')?.addEventListener('click', e => { e.preventDefault(); scrollTo(0); });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
