
const TG_CHANNEL      = 'prodsynto'; 
const TG_BOT_USERNAME = 'SyntoKitsBot';

const KITS = [
  {
    name: "! SYNTO - APRIL 2026",
    subtitle: "Lucy Bedroque · Slayr · Prettifun",
    cover: "ART2.jpg",
    link: "#",
    botKitId: "BQACAgIAAxkBAAMHago5o9z-MyD_JYBvPmc-KlmyXuMAAiGeAALcl1FIQMWnX9EQS7s7BA",
    contents: [
      { icon: "🥁", label: "Mixer Presets",       color: "#1a2d0a", count: "15 файлов"  },
      { icon: "🎹", label: "Loops",     color: "#0a1a2d", count: "8 файлов" },
      { icon: "🎛️", label: "Vocal Chops",        color: "#1a2d1a", count: "5 файлов"  },
      { icon: "🌊", label: "Phrases", color: "#2d2d0a", count: "10 файлов" },
      { icon: "🎚️", label: "ZIP's",       color: "#2d1a0a", count: "5 файлов"  },
      { icon: "🎱", label: "MIDI'S",       color: "#4d2e16", count: "10 файлов"  },
    ]
  },
  {
    name: "!SYNTO - MARCH 2026",
    subtitle: "Burger Music · Slayr · Lucy Bedroque",
    cover: "ART.jpg",
    link: "#",
    botKitId: "BQACAgIAAxkBAAMIago5sQfHvgQEcIuXtkITxqNxCn4AAiKeAALcl1FIMtJ6vgABv4cmOwQ",
    contents: [
      { icon: "🥁", label: "LOOPS", color: "#2d0a0a", count: "15 файлов" },
      { icon: "🎸", label: "MIDI's",  color: "#0a1a2d", count: "18 файлов" },
      { icon: "💣", label: "PHRASES",      color: "#1a2d0a", count: "5 файлов" },
      { icon: "🎤", label: "ZIP'S",   color: "#2d2d0a", count: "3 файла" },
      { icon: "🎛️", label: "BONUS - DRUMS",        color: "#1a2d1a", count: "46 файлов"  },
    ]
  },
  {
    name: "[KUBFU COMMUNITY BUNDLE v2] ",
    subtitle: "Fx · Experimental · SoundDesign",
    cover: "ART3.jpg",
    link: "#",
    botKitId: "BQACAgIAAxkBAAMGago5f4Mr9iG0QG-iewzGtvjXqDMAAiCeAALcl1FImxBO3zxsLcI7BA",
    contents: [
      { icon: "📻", label: "Infiltrator2 Presets", color: "#2d0a0a", count: "300 файлов"  },
    ]
  },
];

const SERVER_URL = 'https://synto-serverr.prodsynto.workers.dev/';
/* ═══════════════════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════════════════ */
const htmlEl   = document.documentElement;
const themeBtn = document.getElementById('theme-btn');
let isDark = true;

const savedTheme = localStorage.getItem('synto-theme');
if (savedTheme === 'light') {
  isDark = false;
  htmlEl.setAttribute('data-theme', 'light');
  themeBtn.textContent = '☀️';
}

function toggleTheme() {
  isDark = !isDark;
  htmlEl.setAttribute('data-theme', isDark ? 'dark' : 'light');
  themeBtn.textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('synto-theme', isDark ? 'dark' : 'light');
}

/* ═══════════════════════════════════════════════════════════
   BACK TO TOP
═══════════════════════════════════════════════════════════ */
const bttBtn     = document.getElementById('back-to-top');
const detailPage = document.getElementById('detail-page');
let detailOpen   = false;

window.addEventListener('scroll', () => {
  if (!detailOpen) bttBtn.classList.toggle('visible', window.scrollY > 300);
}, { passive: true });

detailPage.addEventListener('scroll', () => {
  if (detailOpen) bttBtn.classList.toggle('visible', detailPage.scrollTop > 220);
}, { passive: true });

function backToTop() {
  if (detailOpen) {
    detailPage.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/* ═══════════════════════════════════════════════════════════
   BUILD BG LAYERS
═══════════════════════════════════════════════════════════ */
const heroBgEl = document.getElementById('hero-bg');
const kitsBgEl = document.getElementById('kits-bg');

KITS.forEach((kit, i) => {
  const hl = document.createElement('div');
  hl.className = 'hero-bg-layer' + (i === 0 ? ' active' : '');
  hl.style.backgroundImage = `url(${kit.cover})`;
  heroBgEl.appendChild(hl);

  const kl = document.createElement('div');
  kl.className = 'kits-bg-layer' + (i === 0 ? ' active' : '');
  kl.style.backgroundImage = `url(${kit.cover})`;
  kitsBgEl.appendChild(kl);
});

function setActiveBg(idx) {
  heroBgEl.querySelectorAll('.hero-bg-layer').forEach((l, i) => l.classList.toggle('active', i === idx));
  kitsBgEl.querySelectorAll('.kits-bg-layer').forEach((l, i) => l.classList.toggle('active', i === idx));
}

/* ═══════════════════════════════════════════════════════════
   CAROUSEL
═══════════════════════════════════════════════════════════ */
let current = 0, startX = 0, startY = 0, isDragging = false;

const slider   = document.getElementById('card-slider');
const dotsEl   = document.getElementById('dots');
const kitName  = document.getElementById('kit-name');
const cardWrap = document.getElementById('card-wrap');

KITS.forEach((kit, i) => {
  const card = document.createElement('div');
  card.className = 'kit-card';
  const img = document.createElement('img');
  img.src = kit.cover;
  img.alt = kit.name;
  card.appendChild(img);
  slider.appendChild(card);

  const dot = document.createElement('div');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dotsEl.appendChild(dot);
});

function updateCarousel(animate = true) {
  slider.style.transition = animate ? 'transform .38s cubic-bezier(.4,0,.2,1)' : 'none';
  slider.style.transform  = `translateX(-${current * 100}%)`;
  dotsEl.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
  kitName.style.opacity = '0';
  setTimeout(() => {
    kitName.textContent = KITS[current].name;
    kitName.style.transition = 'opacity .25s';
    kitName.style.opacity = '1';
  }, 130);
  setActiveBg(current);
}
updateCarousel(false);
kitName.textContent = KITS[0].name;

document.getElementById('prev').addEventListener('click', () => {
  current = (current - 1 + KITS.length) % KITS.length;
  updateCarousel();
});
document.getElementById('next').addEventListener('click', () => {
  current = (current + 1) % KITS.length;
  updateCarousel();
});

// Touch swipe
cardWrap.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
  isDragging = true;
}, { passive: true });

cardWrap.addEventListener('touchmove', e => {
  if (!isDragging) return;
  const dx = Math.abs(e.touches[0].clientX - startX);
  const dy = Math.abs(e.touches[0].clientY - startY);
  if (dx > dy) e.preventDefault();
}, { passive: false });

cardWrap.addEventListener('touchend', e => {
  if (!isDragging) return;
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dx) > 36) {
    current = dx < 0
      ? (current + 1) % KITS.length
      : (current - 1 + KITS.length) % KITS.length;
    updateCarousel();
  }
  isDragging = false;
});

// Mouse drag (desktop)
cardWrap.addEventListener('mousedown', e => { startX = e.clientX; isDragging = true; });
window.addEventListener('mouseup', e => {
  if (!isDragging) return;
  const dx = e.clientX - startX;
  if (Math.abs(dx) > 36) {
    current = dx < 0
      ? (current + 1) % KITS.length
      : (current - 1 + KITS.length) % KITS.length;
    updateCarousel();
  }
  isDragging = false;
});

/* ═══════════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════════ */
function scrollToKits() {
  document.getElementById('kits-section').scrollIntoView({ behavior: 'smooth' });
}

/* ═══════════════════════════════════════════════════════════
   DETAIL PAGE
═══════════════════════════════════════════════════════════ */
document.getElementById('btn-inside').addEventListener('click', openDetail);

function openDetail(kitIndex) {
  if (typeof kitIndex === 'number') current = kitIndex;
  const kit = KITS[current];

  document.getElementById('detail-img').src              = kit.cover;
  document.getElementById('detail-title').textContent    = kit.name;
  document.getElementById('detail-subtitle').textContent = kit.subtitle;

  const list = document.getElementById('content-list');
  list.innerHTML = '';
  kit.contents.forEach(item => {
    const el = document.createElement('div');
    el.className = 'content-item';
    el.innerHTML = `
      <div class="item-icon" style="background:${item.color}">${item.icon}</div>
      <div class="item-name">${item.label}</div>
      <div class="item-count">${item.count}</div>`;
    list.appendChild(el);
  });

  resetSubSteps();
  buildOtherKits(current);

  const main = document.getElementById('main-page');
  main.style.opacity   = '0';
  main.style.transform = 'translateX(-40px)';
  setTimeout(() => {
    main.style.display       = 'none';
    detailPage.style.display = 'flex';
    detailPage.scrollTop     = 0;
    detailOpen = true;
    bttBtn.classList.remove('visible');
    requestAnimationFrame(() => detailPage.classList.add('visible'));
  }, 260);
}

function buildOtherKits(activeIdx) {
  const scroll = document.getElementById('other-kits-scroll');
  scroll.innerHTML = '';
  KITS.forEach((kit, i) => {
    if (i === activeIdx) return;
    const card = document.createElement('div');
    card.className = 'other-kit-card';
    card.innerHTML = `
      <img src="${kit.cover}" alt="${kit.name}">
      <div class="other-kit-label">${kit.name}</div>`;
    card.addEventListener('click', () => {
      detailPage.scrollTo({ top: 0 });
      setTimeout(() => openDetail(i), 60);
    });
    scroll.appendChild(card);
  });
}

function closeDetail() {
  const main = document.getElementById('main-page');
  detailPage.classList.remove('visible');
  setTimeout(() => {
    detailPage.style.display = 'none';
    detailOpen = false;
    main.style.display   = 'flex';
    main.style.opacity   = '0';
    main.style.transform = 'translateX(-40px)';
    bttBtn.classList.remove('visible');
    requestAnimationFrame(() => {
      main.style.transition = 'opacity .3s, transform .3s';
      main.style.opacity    = '1';
      main.style.transform  = 'translateX(0)';
    });
  }, 260);
}

/* ═══════════════════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════════════════ */
function openModal() {
  resetSubSteps();
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

// Swipe down to close modal sheet
(function () {
  const sheet = document.getElementById('modal-sheet');
  let sy = 0;
  sheet.addEventListener('touchstart', e => { sy = e.touches[0].clientY; }, { passive: true });
  sheet.addEventListener('touchend',   e => {
    if (e.changedTouches[0].clientY - sy > 60) closeModal();
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════
   SUBSCRIPTION
═══════════════════════════════════════════════════════════ */
function goToChannel() {
  window.open(`https://t.me/${TG_CHANNEL}`, '_blank');
}

function resetSubSteps() {
  ['step2', 'step3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = '.45';
  });
  ['step1-num', 'step2-num', 'step3-num'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('step-done');
  });
  const btn = document.getElementById('btn-check-sub');
  if (btn) {
    btn.textContent  = '✅ ПРОВЕРИТЬ ПОДПИСКУ';
    btn.disabled     = false;
    btn.style.background = '';
  }
}

async function checkSubscription() {
  const btn = document.getElementById('btn-check-sub');
  btn.textContent = 'Проверяем...';
  btn.disabled    = true;




  
  await new Promise(r => setTimeout(r, 1500));
  const subscribed = true;

  if (subscribed) {
    ['step1-num', 'step2-num', 'step3-num'].forEach(id =>
      document.getElementById(id).classList.add('step-done'));
    ['step2', 'step3'].forEach(id =>
      document.getElementById(id).style.opacity = '1');
    btn.textContent      = '🎉 Подписка подтверждена!';
    btn.style.background = 'linear-gradient(90deg,#48c78e,#3bc5a0)';
    showToast('🎁 Кит отправлен в Telegram!');
    setTimeout(() => closeModal(), 2000);
    setTimeout(() => {
      window.open(`https://t.me/${TG_BOT_USERNAME}?start=${KITS[current].botKitId}`, '_blank');
    }, 1200);
  } else {
    btn.textContent      = '❌ Подписка не найдена';
    btn.style.background = 'linear-gradient(90deg,#e74c3c,#c0392b)';
    setTimeout(() => {
      btn.textContent      = '✅ ПРОВЕРИТЬ ПОДПИСКУ';
      btn.style.background = '';
      btn.disabled         = false;
    }, 2200);
  }
}

/* ═══════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════ */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ═══════════════════════════════════════════════════════════
   TELEGRAM MINI APP INIT
═══════════════════════════════════════════════════════════ */
if (window.Telegram?.WebApp) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
}
