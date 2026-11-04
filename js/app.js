import { createStore } from './store.js?v=8';

gsap.registerPlugin(ScrollTrigger);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const D = window.THEMS;
const mobile = matchMedia('(max-width:860px),(pointer:coarse)').matches;
const portrait = innerHeight > innerWidth;
const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ---------- Logo (asl fayldan vektorlangan) ---------- */
$$('.logo-p').forEach(p => p.setAttribute('d', D.logoPath));
$('#ld-path').setAttribute('d', D.logoPath);

/* ---------- Til ---------- */
let lang = (() => { try { return localStorage.getItem('thems-lang') || 'uz'; } catch { return 'uz'; } })();
const som = () => (lang === 'ru' ? 'сум' : "so'm");
const money = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const tr = o => (typeof o === 'string' ? o : o[lang]);
function applyLang() {
  document.documentElement.lang = lang;
  $$('[data-uz]').forEach(el => { el.innerHTML = el.dataset[lang]; });
  $$('.lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
  document.title = lang === 'ru' ? 'thems. — Мужская одежда, Ташкент. Дорого у нас — только вкус.' : "thems. — Erkaklar kiyimi, Toshkent. Bizda qimmat — faqat did.";
  renderFilters(); renderGrid(); renderReels();
  if (current) openSheet(current, true);
  $('.h-tel').setAttribute('aria-label', lang === 'ru' ? 'Позвонить' : "Qo'ng'iroq");
  $('.sh-x').setAttribute('aria-label', lang === 'ru' ? 'Закрыть' : 'Yopish');
  $('.lang').setAttribute('aria-label', lang === 'ru' ? 'Язык' : 'Til');
}
$$('.lang button').forEach(b => b.onclick = () => { lang = b.dataset.lang; try { localStorage.setItem('thems-lang', lang); } catch {} applyLang(); });

/* ---------- Obrazlar ---------- */
const CATS = [
  { k: 'all', uz: 'Hammasi', ru: 'Все' }, { k: 'pidjak', uz: 'Pidjak', ru: 'Пиджаки' }, { k: 'kostyum', uz: 'Kostyum, dvoyka', ru: 'Костюмы, двойки' },
  { k: 'ustki', uz: 'Ustki kiyim', ru: 'Верхняя одежда' }, { k: 'trikotaj', uz: 'Trikotaj', ru: 'Трикотаж' },
];
let cat = 'all', current = null, branch = 0, removed = new Set();
function renderFilters() {
  $('#filters').innerHTML = CATS.map(c => {
    const n = c.k === 'all' ? D.looks.length : D.looks.filter(l => l.cat === c.k).length;
    return `<button class="${c.k === cat ? 'on' : ''}" data-c="${c.k}">${tr(c)}<sup>${n}</sup></button>`;
  }).join('');
  $$('#filters button').forEach(b => b.onclick = () => { cat = b.dataset.c; renderFilters(); renderGrid(true); });
}
function renderGrid(anim) {
  const list = D.looks.filter(l => cat === 'all' || l.cat === cat);
  $('#grid').innerHTML = list.map(l => `
    <button class="card" data-id="${l.id}">
      <figure>
        <img loading="lazy" src="${l.photos[0]}" alt="${l.title}">
        <img loading="lazy" src="${l.photos[1] || l.photos[0]}" alt="">
        <span class="plus"><svg><use href="#i-arrow"/></svg></span>
      </figure>
      <h3>${l.title}</h3>
      <p><span>${l.items.length} ${lang === 'ru' ? 'вещи' : 'buyum'}</span><b>${money(l.items.reduce((a, b) => a + b.price, 0))} ${som()}</b></p>
    </button>`).join('');
  $$('.card').forEach(c => c.onclick = () => openSheet(D.looks.find(l => l.id == c.dataset.id)));
  if (anim && !reduced) gsap.from('.card', { opacity: 0, y: 18, duration: .5, stagger: .03, ease: 'power2.out', onComplete: () => ScrollTrigger.refresh() });
}

/* ---------- Obraz oynasi: buyumlarni olib tashlab jami hisoblash ---------- */
function total() { return current.items.reduce((a, it, i) => a + (removed.has(i) ? 0 : it.price), 0); }
function openSheet(l, keep) {
  if (!keep || current !== l) removed = new Set();
  current = l;
  $('#sh-cat').textContent = tr(CATS.find(c => c.k === l.cat));
  $('#sh-title').textContent = l.title;
  $('#sh-gal').innerHTML = l.photos.map((p, i) => `<img src="${p}" alt="${l.title} ${i + 1}" ${i ? 'loading="lazy"' : ''}>`).join('');
  $('#sh-items').innerHTML = l.items.map((it, i) => `<li><label>
      <input type="checkbox" data-i="${i}" ${removed.has(i) ? '' : 'checked'}>
      <span class="box"><svg><use href="#i-check"/></svg></span>
      <span class="nm">${it.name}${it.art ? `<small>Art. ${it.art}</small>` : ''}</span>
      <span class="pr">${money(it.price)}</span></label></li>`).join('');
  $$('#sh-items input').forEach(inp => inp.onchange = () => {
    const i = +inp.dataset.i; inp.checked ? removed.delete(i) : removed.add(i); updateSum();
  });
  $('#sh-branch').innerHTML = D.branches.map((b, i) => `<button class="${i === branch ? 'on' : ''}" data-b="${i}">${b}</button>`).join('');
  $$('#sh-branch button').forEach(b => b.onclick = () => { branch = +b.dataset.b; $$('#sh-branch button').forEach(x => x.classList.toggle('on', x === b)); });
  $('#sh-hint').hidden = true;
  updateSum();
  if (!keep) {
    $('#sheet').classList.add('open'); $('#sheet').setAttribute('aria-hidden', 'false');
    lenis?.stop(); document.body.style.overflow = 'hidden'; $('.sh-x').focus({ preventScroll: true });
  }
}
function updateSum() { $('#sh-sum').textContent = `${money(total())} ${som()}`; $('#sh-send').disabled = total() === 0; $('#sh-send').style.opacity = total() === 0 ? .5 : 1; }
function closeSheet() {
  $('#sheet').classList.remove('open'); $('#sheet').setAttribute('aria-hidden', 'true');
  current = null; lenis?.start(); document.body.style.overflow = '';
}
$$('[data-close]').forEach(e => e.onclick = closeSheet);
addEventListener('keydown', e => { if (e.key === 'Escape' && current) closeSheet(); });
$('#sh-send').onclick = async () => {
  const items = current.items.filter((_, i) => !removed.has(i));
  const head = lang === 'ru' ? 'Здравствуйте! Хочу этот образ:' : "Assalomu alaykum! Shu obraz kerak:";
  const fil = lang === 'ru' ? 'Филиал' : 'Filial';
  const sum = lang === 'ru' ? 'Итого' : 'Jami';
  const txt = `${head}\n${items.map(i => `— ${i.name}${i.art ? ` (${i.art})` : ''}: ${money(i.price)} ${som()}`).join('\n')}\n${sum}: ${money(total())} ${som()}\n${fil}: ${D.branches[branch]}`;
  try { await navigator.clipboard.writeText(txt); $('#sh-hint').hidden = false; } catch {}
  window.open('https://ig.me/m/thems.uz', '_blank', 'noopener');
};

$$('[data-man]').forEach(b => b.onclick = () => openSheet(D.mannequins[+b.dataset.man]));

/* ---------- Kadrlar ---------- */
let reelObs;
function renderReels() {
  const box = $('#reels');
  box.innerHTML = D.reels.map(r => `
    <a class="reel" href="${r.url}" target="_blank" rel="noopener" aria-label="${tr(r.t)}">
      <video muted loop playsinline preload="none" poster="${r.poster}" src="${r.src}"></video>
      <span class="tag">${tr(r.t)}</span>
    </a>`).join('');
  reelObs?.disconnect();
  reelObs = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target.querySelector('video');
    if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
  }), { threshold: .55 });
  $$('.reel').forEach(r => reelObs.observe(r));
  if (!reduced && !mobile) {
    const upd = () => {
      const c = innerWidth / 2;
      $$('.reel').forEach(r => {
        const b = r.getBoundingClientRect(), d = Math.max(-1, Math.min(1, (b.left + b.width / 2 - c) / c));
        r.style.transform = `rotateY(${-d * 14}deg) scale(${1 - Math.abs(d) * .05})`;
      });
    };
    box.onscroll = upd; upd(); addEventListener('resize', upd);
  }
}

/* ---------- Skroll ---------- */
let lenis = null;
if (!reduced && !mobile) {
  lenis = new Lenis({ lerp: .085, wheelMultiplier: .9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const t = $(a.getAttribute('href')); if (!t) return;
  e.preventDefault();
  // Bo'limga aniq sakrash + yumshoq ochilish: uzun animatsiya 3D sayrni aylantirib yubormaydi
  if (lenis) lenis.scrollTo(t, { immediate: true, force: true }); else t.scrollIntoView();
  if (!reduced) gsap.fromTo('main', { opacity: .15 }, { opacity: 1, duration: .55, ease: 'power2.out', clearProps: 'opacity' });
}));

const header = $('header');
ScrollTrigger.create({ trigger: '#obrazlar', start: 'top 70px', onToggle: s => header.classList.toggle('solid', s.isActive), end: 'max' });

if (!reduced) {
  gsap.utils.toArray('.sec-head').forEach(h => gsap.from(h.children, { opacity: 0, y: 28, duration: .9, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 84%' } }));
  gsap.utils.toArray('.branch').forEach((b, i) => gsap.from(b, { opacity: 0, y: 34, duration: .9, delay: i * .08, ease: 'power3.out', scrollTrigger: { trigger: b, start: 'top 90%' } }));
}

/* ---------- Bob matnlari: kamera to'xtashiga qarab ---------- */
const chapters = $$('.ch').map(el => ({ el, s: +el.dataset.from, on: false }));
function showChapters(sf, last) {
  chapters.forEach(c => {
    const dist = Math.abs(sf - c.s);
    const a = Math.max(0, Math.min(1, 1 - (dist - .16) / .2));
    if (a > 0) {
      c.el.style.visibility = 'visible'; c.el.style.opacity = a;
      const dy = (sf - c.s) * -26;
      c.el.style.transform = (c.el.classList.contains('ch-end') ? 'translateY(-50%) ' : '') + `translateY(${dy}px)`;
    } else if (c.el.style.visibility !== 'hidden') { c.el.style.visibility = 'hidden'; c.el.style.opacity = 0; }
    c.el.classList.toggle('on', a > .6);
  });
}

/* ---------- 3D ---------- */
const bar = $('.ld-bar i');
const done = () => { bar.style.transform = 'scaleX(1)'; setTimeout(() => $('#loader').classList.add('done'), 260); };
const fail = () => {
  $('#gl').style.display = 'none'; $('#gl-fallback').hidden = false;
  ScrollTrigger.create({ trigger: '.walk', start: 'top top', end: 'bottom bottom', onUpdate: s => { const sf = s.progress * 7; showChapters(sf); $('#prog-i').style.transform = `scaleX(${s.progress})`; } });
  showChapters(0); done();
};

applyLang();
bar.style.transform = 'scaleX(.3)';

(async () => {
  let store;
  try {
    const t = document.createElement('canvas');
    if (!(t.getContext('webgl2') || t.getContext('webgl'))) throw new Error('no webgl');
    const gl = $('#gl');
    store = await createStore(gl, { mobile, portrait, shoes: D.shoes });
    const fit = () => store.resize(gl.clientWidth, gl.clientHeight);
    fit();
    let lw = innerWidth;
    addEventListener('resize', () => { if (!mobile || innerWidth !== lw) { lw = innerWidth; fit(); } ScrollTrigger.refresh(); });
    bar.style.transform = 'scaleX(.9)';
    window.__store = store;

    ScrollTrigger.create({
      trigger: '.walk', start: 'top top', end: 'bottom bottom',
      onUpdate: s => {
        store.setProgress(s.progress);
        const sf = store.stopFloat(s.progress);
        showChapters(sf);
        store.setActive(Math.round(sf));
        $('#prog-i').style.transform = `scaleX(${s.progress})`;
      },
    });
    new IntersectionObserver(([e]) => store.setVisible(e.isIntersecting)).observe($('.walk'));
    if (!mobile) addEventListener('pointermove', e => store.setMouse(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1), { passive: true });
    const p0 = ScrollTrigger.getAll().find(t => t.trigger === $('.walk'))?.progress || 0;
    store.jump(p0); showChapters(store.stopFloat(p0)); store.setActive(Math.round(store.stopFloat(p0)));
    store.start();

    // Maneken bilan ishlash: umumiy kadrda bosilsa yaqinlashadi, yaqin kadrda olib qo'yish oynasi ochiladi
    const stopY = i => $('.walk').offsetTop + ($('.walk').offsetHeight - innerHeight) * i / (store.stopCount - 1);
    const goStop = i => { const y = stopY(i); if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y); };
    const ndc = e => { const r = gl.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1]; };
    if (!mobile) gl.addEventListener('pointermove', e => {
      const i = store.pick(...ndc(e));
      gl.style.cursor = i >= 0 ? 'pointer' : '';
      store.setHover(i);
    }, { passive: true });
    gl.addEventListener('pointerleave', () => store.setHover(-1));
    gl.addEventListener('click', e => {
      const i = store.pick(...ndc(e));
      if (i < 0) return;
      const sf = store.stopFloat(ScrollTrigger.getAll().find(t => t.trigger === $('.walk')).progress);
      if (Math.abs(sf - (3 + i)) < .3) openSheet(D.mannequins[i]); else goStop(3 + i);
    });
    done();
  } catch (e) { console.error(e); fail(); }
})();
