/* The original ten book-page images are intentionally preserved without alteration. */
(() => {
  'use strict';
  const titles = ['Cover', 'Stop Letting Life Name You', 'Loved Is Who You Are', 'Righteous Is Who You Are', 'Blessed Is Who You Are', 'Anointed Is Who You Are', 'Healed Is Who You Are', 'Joy-filled Is Who You Are', 'Bold Is Who You Are', 'Keep Growing in Who God Says You Are'];
  const descriptions = [
    'Cover: You Are Who God Says You Are. 7 Biblical Truths That Will Change the Way You See Yourself. By David Fowler.',
    'Introduction: Stop Letting Life Name You. Who God is, who you now are, what you now have, and what you can now do.',
    'Truth 1: Loved Is Who You Are. What God says, what this means, say it, live it, and give it away.',
    'Truth 2: Righteous Is Who You Are. What God says, what this means, say it, live it, and give it away.',
    'Truth 3: Blessed Is Who You Are. What God says, what this means, say it, live it, and give it away.',
    'Truth 4: Anointed Is Who You Are. What God says, what this means, say it, live it, and give it away.',
    'Truth 5: Healed Is Who You Are. What God says, what this means, say it, live it, and give it away.',
    'Truth 6: Joy-filled Is Who You Are. What God says, what this means, say it, live it, and give it away.',
    'Truth 7: Bold Is Who You Are. What God says, what this means, say it, live it, and give it away.',
    'Next steps: Keep Growing in Who God Says You Are. Watch Faith Boost, share with five, gather a few, learn about the Founders 50, and partner with Lockliel.'
  ];
  const total = titles.length;
  const get = id => document.getElementById(id);
  const viewport = get('page-viewport');
  const frame = get('page-frame');
  const image = get('page-image');
  const counter = get('page-counter');
  const progress = get('page-progress');
  const title = get('page-title');
  const previous = get('previous-button');
  const next = get('next-button');
  const cover = get('cover-button');
  const zoom = get('zoom-button');
  const message = get('page-message');
  const messageText = get('page-message-text');
  const retry = get('retry-button');
  const nextSteps = get('keep-growing');
  const completion = get('completion-link');
  const toc = Array.from(document.querySelectorAll('[data-page]'));
  let page = 1;
  let requestedPage = 1;
  let loading = false;
  let requestId = 0;
  let enlarged = false;
  let touch = null;
  let lastTouchAt = 0;
  const loaded = new Map();
  const assetPath = n => `pages/page-${String(n).padStart(2, '0')}.jpg`;

  function emit(name, detail = {}) {
    // Host integration hook. This package does not install a tracking provider.
    // Events contain only book/page/action information; never subscriber details.
    document.dispatchEvent(new CustomEvent('lockliel:resource', { detail: { event: name, resource: 'you-are-who-god-says-you-are', ...detail } }));
    if (name !== 'reader_page' && navigator.doNotTrack !== '1') {
      fetch('/api/faith-boost/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: name, ...detail }), keepalive: true }).catch(() => {});
    }
  }

  function fetchPage(n) {
    if (loaded.has(n)) return loaded.get(n);
    const promise = new Promise((resolve, reject) => {
      const asset = new Image();
      const timer = window.setTimeout(() => reject(new Error('Page load timed out')), 18000);
      asset.onload = () => { window.clearTimeout(timer); resolve(asset); };
      asset.onerror = () => { window.clearTimeout(timer); reject(new Error('Page image unavailable')); };
      asset.src = assetPath(n);
    });
    loaded.set(n, promise);
    promise.catch(() => loaded.delete(n));
    return promise;
  }

  function preloadNeighbors() {
    [page - 1, page + 1].filter(n => n >= 1 && n <= total).forEach(n => { fetchPage(n).catch(() => {}); });
  }

  function updateNavigation() {
    previous.disabled = loading || page === 1;
    next.disabled = loading || page === total;
    cover.disabled = loading || page === 1;
    zoom.disabled = loading;
    viewport.setAttribute('aria-busy', String(loading));
    toc.forEach(button => {
      button.disabled = loading;
      if (Number(button.dataset.page) === page) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }

  async function showPage(value) {
    const n = Math.min(total, Math.max(1, Number(value)));
    if (!Number.isInteger(n)) return;
    if (n === page && message.hidden) return;
    const id = ++requestId;
    requestedPage = n;
    loading = true;
    updateNavigation();
    retry.hidden = true;
    message.hidden = false;
    messageText.textContent = `Loading page ${n}…`;
    try {
      await fetchPage(n);
      if (id !== requestId) return;
      // Do not replace the visible page or count until the target image is ready.
      page = n;
      image.src = assetPath(page);
      image.alt = descriptions[page - 1];
      title.textContent = titles[page - 1];
      counter.textContent = `Page ${page} of ${total}`;
      progress.value = page;
      progress.textContent = `${page} of ${total}`;
      viewport.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      frame.classList.remove('page-enter');
      void frame.offsetWidth;
      frame.classList.add('page-enter');
      message.hidden = true;
      nextSteps.hidden = page !== total;
      completion.hidden = page !== total;
      if (page === total) emit('reader_final_page', { page });
      emit('reader_page', { page });
      preloadNeighbors();
    } catch {
      if (id !== requestId) return;
      messageText.textContent = 'This page could not load. Please try again, or use Download PDF above.';
      retry.hidden = false;
    } finally {
      if (id === requestId) { loading = false; updateNavigation(); }
    }
  }

  previous.addEventListener('click', () => showPage(page - 1));
  next.addEventListener('click', () => showPage(page + 1));
  cover.addEventListener('click', () => showPage(1));
  retry.addEventListener('click', () => showPage(requestedPage));
  toc.forEach(button => button.addEventListener('click', () => {
    document.querySelector('.contents').open = false;
    get('book-reader').focus({ preventScroll: true });
    get('book-reader').scrollIntoView({ block: 'start', behavior: 'auto' });
    showPage(Number(button.dataset.page));
  }));
  zoom.addEventListener('click', () => {
    enlarged = !enlarged;
    viewport.classList.toggle('enlarged', enlarged);
    zoom.setAttribute('aria-pressed', String(enlarged));
    zoom.textContent = enlarged ? 'Fit page' : 'Enlarge';
    get('reader-hint').textContent = enlarged
      ? 'Scroll to read the enlarged page. Use Previous or Next to turn pages.'
      : 'Swipe left or right, or use your keyboard arrows. Enlarge for a closer look.';
    viewport.setAttribute('aria-label', enlarged ? 'Enlarged book page. Scroll to read. Use Previous and Next buttons to turn pages.' : 'Book page. Use left and right arrows to turn pages.');
    viewport.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
  document.addEventListener('keydown', event => {
    const target = event.target;
    if (loading || enlarged || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || target.closest('input,textarea,select,[contenteditable="true"],summary')) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showPage(page + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  viewport.addEventListener('touchstart', event => {
    touch = !enlarged && event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY, time: Date.now() } : null;
  }, { passive: true });
  viewport.addEventListener('touchmove', event => { if (event.touches.length !== 1) touch = null; }, { passive: true });
  viewport.addEventListener('touchcancel', () => { touch = null; }, { passive: true });
  viewport.addEventListener('touchend', event => {
    if (!touch || !event.changedTouches.length || enlarged || loading) { touch = null; return; }
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    const elapsed = Date.now() - touch.time;
    touch = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6 && elapsed < 900 && Date.now() - lastTouchAt > 350) {
      lastTouchAt = Date.now();
      showPage(page + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  get('share-button').addEventListener('click', async () => {
    const payload = { title: 'Faith Boost Broadcast | Lockliel', text: 'A daily reminder of who you are in Christ. Join me for Faith Boost.', url: 'https://lockliel.com/#faith-boost' };
    const status = get('share-status');
    status.textContent = '';
    get('share-fallback').hidden = true;
    if (navigator.share) {
      try { await navigator.share(payload); emit('share_completed', { destination: 'faith_boost' }); return; }
      catch (error) { if (error && error.name === 'AbortError') return; }
    }
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(payload.url);
      status.textContent = 'Faith Boost link copied. Send it to someone you’re thinking of.';
      emit('share_link_copied', { destination: 'faith_boost' });
    } catch {
      status.textContent = 'Open Faith Boost below, then share the address with a friend.';
      get('share-fallback').hidden = false;
    }
  });
  document.querySelectorAll('.download-link').forEach(link => link.addEventListener('click', () => emit('pdf_download_click')));
  document.querySelectorAll('.social-link').forEach(link => link.addEventListener('click', () => emit('social_follow_click', { platform: link.querySelector('small').textContent.toLowerCase() })));
  document.querySelectorAll('a[href="https://lockliel.com/founders-50"]').forEach(link => link.addEventListener('click', () => emit('founders_50_click')));
  document.querySelectorAll('a[href="https://lockliel.com/#partner"]').forEach(link => link.addEventListener('click', () => emit('partnership_click')));
  document.querySelectorAll('a[href="https://lockliel.com/#faith-boost"]').forEach(link => link.addEventListener('click', () => emit('faith_boost_click')));

  image.addEventListener('error', () => {
    message.hidden = false;
    messageText.textContent = 'This page could not load. Please try again, or use Download PDF above.';
    retry.hidden = false;
    requestedPage = page;
    loaded.delete(page);
  });
  if (image.complete && !image.naturalWidth) {
    message.hidden = false;
    messageText.textContent = 'The cover could not load. Please try again, or use Download PDF above.';
    retry.hidden = false;
  }
  updateNavigation();
  preloadNeighbors();
  emit('reader_open');
})();
