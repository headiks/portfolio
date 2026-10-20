// 1) RU/EN switch: text lives in index.html as paired lang="ru"/lang="en" nodes; CSS hides the inactive one.
// 2) Scroll reveal, count-up numbers, scroll progress. 3) Horizontal experience timeline.
(function () {
  var META = {
    ru: {
      title: 'Александр Егоров — AI-инженер: LLM, агенты, RAG',
      desc: 'Портфолио Александра Егорова: AI-инженер, LLM-ассистенты, агенты, RAG, Python. Облачные и офлайн-решения, CV на производстве.'
    },
    en: {
      title: 'Alexander Egorov — AI Engineer: LLM, agents, RAG',
      desc: 'Portfolio of Alexander Egorov: AI engineer, LLM assistants, agents, RAG, Python. Cloud and offline solutions, CV in production.'
    }
  };
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motion = !reduce && 'IntersectionObserver' in window;
  if (motion) root.classList.add('js'); // gates the hidden "before reveal" CSS: no JS or reduced motion = content simply shows

  function read() { try { return localStorage.getItem('lang'); } catch (e) { return null; } }
  function write(l) { try { localStorage.setItem('lang', l); } catch (e) { /* private mode: skip */ } }

  function apply(l) {
    root.lang = l;
    document.title = META[l].title;
    var m = document.querySelector('meta[name="description"]');
    if (m) m.content = META[l].desc;
    var btns = document.querySelectorAll('[data-lang-btn]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-pressed', String(btns[i].getAttribute('data-lang-btn') === l));
    }
  }

  var q = new URLSearchParams(location.search).get('lang');
  root.lang = META[q] ? q : META[read()] ? read() : 'ru'; // before first paint: no language flash

  // Theme: light on a first visit regardless of the system setting; dark only if the visitor chose it.
  function readTheme() { try { return localStorage.getItem('theme'); } catch (e) { return null; } }
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    var btns = document.querySelectorAll('[data-theme-btn]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-pressed', String(btns[i].getAttribute('data-theme-btn') === t));
    }
  }
  root.setAttribute('data-theme', readTheme() === 'dark' ? 'dark' : 'light'); // before first paint

  // Email: every mailto link opens a small panel with the address and a copy button.
  var popFrom = null, copyTimer;
  function popEl() { return document.getElementById('mailpop'); } // script runs in <head>: look it up lazily
  function openMail(from) {
    var pop = popEl();
    popFrom = from;
    pop.hidden = false;
    pop.querySelector('.mp-copy').classList.remove('ok');
    pop.querySelector('.mp-copy').focus();
  }
  function closeMail(restoreFocus) {
    var pop = popEl();
    if (!pop || pop.hidden) return;
    pop.hidden = true;
    clearTimeout(copyTimer);
    if (restoreFocus && popFrom) popFrom.focus();
    popFrom = null;
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) { // fallback for non-secure contexts
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { /* ignore */ }
      document.body.removeChild(ta);
      ok ? resolve() : reject();
    });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMail(true); });

  // Certificate: native <dialog>; closes on x, Esc (built in) or a click on the backdrop.
  document.addEventListener('click', function (e) {
    var dlg = document.getElementById('cert');
    if (!dlg) return;
    if (e.target.closest && e.target.closest('[data-cert-open]')) {
      closeMail(false);
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    } else if (e.target === dlg || (e.target.closest && e.target.closest('[data-cert-close]'))) {
      if (dlg.close) dlg.close(); else dlg.removeAttribute('open');
    }
  });

  document.addEventListener('click', function (e) {
    var mail = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (mail && !mail.closest('#mailpop') && !(e.metaKey || e.ctrlKey || e.shiftKey || e.button)) {
      e.preventDefault();
      openMail(mail);
      return;
    }
    if (e.target.closest && e.target.closest('.mp-x')) { closeMail(true); return; }
    var cp = e.target.closest && e.target.closest('.mp-copy');
    if (cp) {
      var addr = popEl().querySelector('.mp-addr');
      copyText(addr.textContent).then(function () {
        cp.classList.add('ok');
        clearTimeout(copyTimer);
        copyTimer = setTimeout(function () { cp.classList.remove('ok'); }, 2500);
      }, function () { getSelection().selectAllChildren(addr); }); // copy blocked: select the text so Ctrl+C works
      return;
    }
    if (!e.target.closest('#mailpop')) closeMail(false);

    var t = e.target.closest && e.target.closest('[data-theme-btn]');
    if (t) {
      var th = t.getAttribute('data-theme-btn');
      try { localStorage.setItem('theme', th); } catch (err) { /* private mode: skip */ }
      applyTheme(th);
      return;
    }
    var b = e.target.closest && e.target.closest('[data-lang-btn]');
    if (!b) return;
    var l = b.getAttribute('data-lang-btn');
    write(l);
    apply(l);
  });

  function each(sel, fn, ctx) { Array.prototype.forEach.call((ctx || document).querySelectorAll(sel), fn); }

  function countUp(el) {
    each('.cnt', function (n) {
      var to = +n.getAttribute('data-to'), t0 = null;
      n.textContent = '0';
      (function step(t) {
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / 1100);
        n.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      })(performance.now());
    }, el);
  }

  function initMotion() {
    each('[data-stagger], .tl-track', function (p) {
      Array.prototype.forEach.call(p.children, function (c, i) { c.style.setProperty('--i', Math.min(i, 9)); });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
        countUp(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    each('.rv, [data-stagger], [data-io]', function (el) { io.observe(el); });

    var bar = document.querySelector('.prog'), tick = false;
    function progress() {
      tick = false;
      var h = root.scrollHeight - root.clientHeight;
      if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, root.scrollTop / h) : 0) + ')';
    }
    addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(progress); } }, { passive: true });
    progress();
  }

  function initTimeline() {
    var tl = document.querySelector('.tl');
    if (!tl) return;
    var track = tl.querySelector('.tl-track');
    var items = Array.prototype.slice.call(tl.querySelectorAll('.tl-item'));
    var panels = items.map(function (b) { return document.getElementById(b.getAttribute('aria-controls')); });
    var prev = tl.querySelector('[data-dir="-1"]'), next = tl.querySelector('[data-dir="1"]');
    var sel = items.length - 1, open = -1; // sel: last chosen stage (drives the axis); open: expanded stage or -1

    function center(i, smooth) {
      var b = items[i];
      if (track.scrollWidth <= track.clientWidth) return;
      track.scrollTo({ left: b.offsetLeft - (track.clientWidth - b.offsetWidth) / 2, behavior: smooth && !reduce ? 'smooth' : 'auto' });
    }

    function show(i, smooth) {
      if (i >= 0) sel = i;
      open = i;
      items.forEach(function (b, k) {
        b.setAttribute('aria-expanded', String(k === open));
        b.setAttribute('data-s', k < sel ? 'past' : k === sel ? 'now' : 'next');
        if (panels[k]) panels[k].hidden = k !== open;
      });
      if (open >= 0 && panels[open]) {
        panels[open].classList.remove('enter');
        void panels[open].offsetWidth; // restart the enter animation
        panels[open].classList.add('enter');
        center(open, smooth);
      }
      prev.disabled = sel <= 0;
      next.disabled = sel >= items.length - 1;
    }

    items.forEach(function (b, i) {
      b.addEventListener('click', function () { show(open === i ? -1 : i, true); });
      b.addEventListener('keydown', function (e) {
        var to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: items.length - 1 }[e.key];
        if (to === undefined || !items[to]) return;
        e.preventDefault();
        items[to].focus();
        center(to, true);
      });
    });
    tl.addEventListener('click', function (e) {
      if (e.target.closest('.tp-close')) { show(-1); items[sel].focus(); }
    });
    [prev, next].forEach(function (btn) {
      btn.addEventListener('click', function () {
        var to = sel + +btn.getAttribute('data-dir');
        if (items[to]) show(to, true);
      });
    });

    show(items.length - 1, false); // newest stage open by default
    center(items.length - 1, false);
  }

  document.addEventListener('DOMContentLoaded', function () {
    apply(root.lang);
    applyTheme(root.getAttribute('data-theme'));
    initTimeline();
    if (motion) initMotion();
  });
})();
