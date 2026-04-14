/**
 * cms-loader.js — Youniq Bikes
 * Obsługa dwujęzyczności (PL / EN) + ładowanie cennika.
 */

// ─── Aktualny język ───────────────────────────────────────────────────────────
var currentLang = localStorage.getItem('yb_lang') || 'pl';

// ─── Załaduj js-yaml z CDN ────────────────────────────────────────────────────
function loadScript(src) {
  return new Promise(function(resolve, reject) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ─── Pobierz i parsuj plik YAML ───────────────────────────────────────────────
async function fetchYAML(path) {
  try {
    var res = await fetch(path + '?v=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return {};
    return window.jsyaml.load(await res.text()) || {};
  } catch (e) {
    console.warn('cms-loader:', path, e);
    return {};
  }
}

// ─── Zamień telefon na link ───────────────────────────────────────────────────
function linkifyPhone(value) {
  return value.replace(/(\+?[\d\s]{9,15})/g, function(match) {
    return '<a href="tel:' + match.replace(/\s/g, '') + '">' + match + '</a>';
  });
}

// ─── Załaduj zdjęcie w tle, pokaż gdy gotowe ─────────────────────────────────
function loadImageWhenReady(imgEl, src) {
  return new Promise(function(resolve) {
    if (!src) { resolve(); return; }
    var temp = new window.Image();
    temp.onload = function() {
      imgEl.src = src;
      imgEl.classList.add('loaded');
      imgEl.style.opacity = '1';
      resolve();
    };
    temp.onerror = function() {
      imgEl.src = src;
      imgEl.classList.add('loaded');
      imgEl.style.opacity = '1';
      resolve();
    };
    temp.src = src;
  });
}

// ─── Spłaszcz zagnieżdżone obiekty (np. cat1/cat2/cat3 z Decap CMS object widget)
function flattenNested(data) {
  var flat = {};
  Object.keys(data).forEach(function(key) {
    var val = data[key];
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.keys(val).forEach(function(subKey) {
        flat[subKey] = val[subKey];
      });
    } else {
      flat[key] = val;
    }
  });
  return flat;
}

// ─── Podmień treści, zdjęcia galerii obsłuż osobno ───────────────────────────
function applyData(data) {
  var galleryPromises = [];

  document.querySelectorAll('[data-cms]').forEach(function(el) {
    var key = el.getAttribute('data-cms');
    if (!(key in data)) return;
    var value = String(data[key]);

    if (el.tagName === 'IMG' && key.startsWith('gallery') && key.endsWith('_img')) {
      galleryPromises.push(loadImageWhenReady(el, value));
      return;
    }
    if (el.tagName === 'IMG') { el.src = value; return; }
    if (el.tagName === 'A')   { el.textContent = value; return; }
    if (key === 'contact_info') { el.innerHTML = linkifyPhone(value); return; }
    el.innerHTML = value.replace(/\n/g, '<br>');
  });

  return Promise.all(galleryPromises);
}

// ─── Tłumaczenia UI (nav, etykiety sekcji) ───────────────────────────────────
var uiStrings = {
  pl: {
    ticker: ['Custom Builds','Zaplatanie Kół','Serwis Premium','Shimano · SRAM · Campagnolo','Rowery Szosowe','Gravele','Wyprawówki','Ramy Stalowe & Tytanowe'],
    contact_btn_primary: 'Napisz do nas',
    contact_btn_ghost: 'Znajdź warsztat',
    nav_filozofia: 'Filozofia',
    filozofia_label: 'O nas / Filozofia',
    uslugi_label:    'Usługi',
    services_h2:     'Co robimy<br><em>naprawdę</em> dobrze.',
    dlaczego_label:  'Dlaczego My',
    dlaczego_h2:     'Nie każdy<br>serwis<br>to <em>przyjmie.</em>',
    faq_label:       'Często zadawane pytania (FAQ)',
    faq_h2:          'Pytania, które<br><em>wracają</em><br>w rozmowach.',
    nav_uslugi:    'Usługi',
    nav_dlaczego:  'Dlaczego My',
    nav_cennik:    'Cennik',
    nav_galeria:   'Realizacje',
    nav_kontakt:   'Kontakt',
    cennik_label:  'Cennik',
    opinie_label:  'Głos klientów',
    opinie_h2:     'Mówią to,<br>czego nie<br><em>piszemy sami.</em>',
    galeria_label: 'Realizacje',
    galeria_h2:    'Nasze<br><em>prace.</em>',
    galeria_sub:   'Każdy rower to osobna historia. Oto kilka z nich.',
    galeria_cta:   'Porozmawiajmy o Twoim projekcie →',
    kontakt_label: 'Kontakt',
    footer_copy:   '© 2026 Youniq Bikes. Wszelkie prawa zastrzeżone.',
    footer_sub:    'Rakowicka 99 · Kraków · Customowe Rowery Premium',
    lang_active:   'PL',
    lang_other:    'EN',
  },
  en: {
    ticker: ['Custom Builds','Wheel Lacing','Premium Service','Shimano · SRAM · Campagnolo','Road Bikes','Gravel Bikes','Touring Builds','Steel & Titanium Frames'],
    contact_btn_primary: 'Write to us',
    contact_btn_ghost: 'Find the workshop',
    nav_filozofia: 'Philosophy',
    filozofia_label: 'About / Philosophy',
    uslugi_label:    'Services',
    services_h2:     'What we do<br><em>really</em> well.',
    dlaczego_label:  'Why Us',
    dlaczego_h2:     'Not every shop<br>will<br><em>take this on.</em>',
    faq_label:       'Frequently Asked Questions',
    faq_h2:          'Questions that<br><em>come up</em><br>again and again.',
    nav_uslugi:    'Services',
    nav_dlaczego:  'Why Us',
    nav_cennik:    'Pricing',
    nav_galeria:   'Portfolio',
    nav_kontakt:   'Contact',
    cennik_label:  'Pricing',
    opinie_label:  'Client Voice',
    opinie_h2:     "Words we<br>didn't<br><em>write ourselves.</em>",
    galeria_label: 'Portfolio',
    galeria_h2:    'Our<br><em>work.</em>',
    galeria_sub:   'Every bike tells a story. Here are a few.',
    galeria_cta:   "Let's talk about your build →",
    kontakt_label: 'Contact',
    footer_copy:   '© 2026 Youniq Bikes. All rights reserved.',
    footer_sub:    'Rakowicka 99 · Kraków · Premium Custom Bikes',
    lang_active:   'EN',
    lang_other:    'PL',
  }
};

// ─── Zastosuj tłumaczenia UI ──────────────────────────────────────────────────
function applyUI(lang) {
  var t = uiStrings[lang];

  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (!t[key]) return;
    if (/<[a-z]/i.test(t[key])) { el.innerHTML = t[key]; } else { el.textContent = t[key]; }
  });

  var lbl = document.getElementById('langLabel');
  var oth = document.getElementById('langOther');
  if (lbl) lbl.textContent = t.lang_active;
  if (oth) oth.textContent = t.lang_other;
  // Mobile lang switcher labels
  var lblM = document.getElementById('langLabelMobile');
  var othM = document.getElementById('langOtherMobile');
  if (lblM) lblM.textContent = t.lang_active;
  if (othM) othM.textContent = t.lang_other;
  // Mobile nav links (data-i18n already handled above via querySelectorAll)

  var opinieLabel = document.querySelector('#opinie .section-label');
  if (opinieLabel) opinieLabel.textContent = t.opinie_label;
  var opinieH2 = document.querySelector('#opinie h2');
  if (opinieH2) opinieH2.innerHTML = t.opinie_h2;

  var galeriaLabel = document.querySelector('#galeria .section-label');
  if (galeriaLabel) galeriaLabel.textContent = t.galeria_label;
  var galeriaH2 = document.querySelector('.gallery-header h2');
  if (galeriaH2) galeriaH2.innerHTML = t.galeria_h2;
  var galeriaSub = document.querySelector('.gallery-sub');
  if (galeriaSub) galeriaSub.textContent = t.galeria_sub;
  var galeriaCta = document.querySelector('.gallery-cta a');
  if (galeriaCta) galeriaCta.textContent = t.galeria_cta;

  var cennikLabel = document.querySelector('#cennik .section-label');
  if (cennikLabel) cennikLabel.textContent = t.cennik_label;

  var kontaktLabel = document.querySelector('#kontakt .section-label');
  if (kontaktLabel) kontaktLabel.textContent = t.kontakt_label;

  // Ticker
  var tickerEl = document.querySelector('.ticker');
  if (tickerEl && t.ticker) {
    var doubled = t.ticker.concat(t.ticker);
    tickerEl.innerHTML = doubled.map(function(s) { return '<span>' + s + '</span>'; }).join('');
  }

  // Przyciski kontakt
  var ctaRow = document.querySelector('#kontakt .cta-row');
  if (ctaRow) {
    var btnPrimary = ctaRow.querySelector('.btn-primary');
    var btnGhost   = ctaRow.querySelector('.btn-ghost');
    if (btnPrimary && t.contact_btn_primary) btnPrimary.textContent = t.contact_btn_primary;
    if (btnGhost   && t.contact_btn_ghost)   btnGhost.textContent   = t.contact_btn_ghost;
  }

  var footerPs = document.querySelectorAll('footer p');
  if (footerPs[0]) footerPs[0].textContent = t.footer_sub;
  if (footerPs[1]) footerPs[1].textContent = t.footer_copy;

  document.documentElement.lang = lang;
}

// ─── Formatuj ceny z cennik.yml ─────────────────────────────────────────────
// Ceny (liczby) są w cennik.yml (PL). Loader formatuje je automatycznie:
// PL → "od X zł", EN → "from X PLN". price15=0 → bezpłatna/free.
function applyPrices(data, lang) {
  var isPL = (lang !== 'en');
  for (var i = 1; i <= 16; i++) {
    var raw = data['price' + i];
    if (raw === undefined) continue;
    var num = Number(raw);
    var formatted;
    if (i === 15 && num === 0) {
      formatted = isPL ? 'bezpłatna' : 'free';
    } else if (i === 16) {
      formatted = isPL ? (num + ' zł / h') : (num + ' PLN / h');
    } else {
      formatted = isPL ? ('od ' + num + ' zł') : ('from ' + num + ' PLN');
    }
    data['price' + i + '_price'] = formatted;
  }
  return data;
}

// ─── Pliki YAML dla każdego języka ───────────────────────────────────────────
var filesPL = [
  '/_data/hero.yml',
  '/_data/filozofia.yml',
  '/_data/uslugi.yml',
  '/_data/dlaczego.yml',
  '/_data/faq.yml',
  '/_data/opinie.yml',
  '/_data/galeria.yml',
  '/_data/kontakt.yml',
  '/_data/cennik.yml',
];

var filesEN = [
  '/_data/hero_en.yml',
  '/_data/filozofia_en.yml',
  '/_data/uslugi_en.yml',
  '/_data/dlaczego_en.yml',
  '/_data/faq_en.yml',
  '/_data/opinie_en.yml',
  '/_data/galeria_en.yml',
  '/_data/kontakt_en.yml',
  '/_data/cennik.yml',      // najpierw PL — zawiera ceny (price1, price2...) w cat1/cat2/cat3
  '/_data/cennik_en.yml',   // potem EN — nadpisuje nazwy _service i nagłówki przez deep merge
];

// ─── Głęboki merge obiektów (rozwiązuje problem cat1/cat2/cat3) ──────────────
function deepMerge(target, source) {
  Object.keys(source).forEach(function(key) {
    var srcVal = source[key];
    var tgtVal = target[key];
    if (srcVal !== null && typeof srcVal === 'object' && !Array.isArray(srcVal) &&
        tgtVal !== null && typeof tgtVal === 'object' && !Array.isArray(tgtVal)) {
      deepMerge(tgtVal, srcVal);
    } else {
      target[key] = srcVal;
    }
  });
  return target;
}

// ─── Główna funkcja ładowania danych ─────────────────────────────────────────
async function loadCMSData(lang) {
  lang = lang || currentLang;

  document.querySelectorAll('[data-cms^="gallery"][data-cms$="_img"]').forEach(function(img) {
    img.style.opacity = '0';
    img.style.transition = 'none';
    img.src = '';
  });

  if (!window.jsyaml) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js');
  }

  var files = (lang === 'en') ? filesEN : filesPL;
  var results = await Promise.all(files.map(fetchYAML));
  var merged  = results.reduce(function(acc, obj) { return deepMerge(acc, obj); }, {});
  var allData = flattenNested(merged);
  applyPrices(allData, lang);

  await applyData(allData);
  applyUI(lang);

  if (window.revealGallery) window.revealGallery();
}

// ─── Przełącznik języka ───────────────────────────────────────────────────────
function initLangSwitcher() {
  var btn = document.getElementById('langSwitcher');
  if (!btn) return;
  btn.addEventListener('click', function() {
    currentLang = (currentLang === 'pl') ? 'en' : 'pl';
    localStorage.setItem('yb_lang', currentLang);
    document.body.classList.remove('cms-ready');
    loadCMSData(currentLang);
  });
}

// ─── Start ────────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    initLangSwitcher();
    loadCMSData(currentLang);
  });
} else {
  initLangSwitcher();
  loadCMSData(currentLang);
}
