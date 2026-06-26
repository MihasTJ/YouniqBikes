/**
 * cms-loader.js — Youniq Bikes
 * Obsługa dwujęzyczności (PL / EN) + ładowanie cennika.
 */

// ─── Aktualny język — wyznaczany ze ścieżki URL ────────────────────────────────
// /en/ (oraz ewentualne podstrony /en/...) → angielski; pozostałe → polski.
// Dzięki temu każda wersja językowa ma własny, indeksowalny adres.
function detectLangFromPath() {
  return /^\/en(\/|$)/.test(window.location.pathname) ? 'en' : 'pl';
}
var currentLang = detectLangFromPath();

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

// ─── Optymalizuj URL zdjęcia do WebP ─────────────────────────────────────────
// Unsplash: dodaj fm=webp (serwer zwróci WebP zamiast JPEG).
// Lokalne uploads (.jpg/.jpeg/.png): zamień na .webp; jeśli plik nie istnieje
// (onerror), załaduj oryginalne rozszerzenie jako fallback.
function optimizeImageUrl(src) {
  if (!src) return src;
  if (src.includes('unsplash.com')) {
    var sep = src.includes('?') ? '&' : '?';
    return src.replace(/[&?]fm=\w+/, '') + sep + 'fm=webp';
  }
  return src;
}

function toWebpUrl(src) {
  return src.replace(/\.(jpe?g|png)(\?.*)?$/i, '.webp');
}

// ─── Załaduj zdjęcie w tle, pokaż gdy gotowe ─────────────────────────────────
function loadImageWhenReady(imgEl, src) {
  return new Promise(function(resolve) {
    if (!src) { resolve(); return; }

    var finalSrc = optimizeImageUrl(src);

    // Dla lokalnych plików JPG/PNG: próbuj WebP, fallback do oryginału
    var isLocalUpload = /^\/images\/uploads\//i.test(finalSrc);
    var needsWebpTry  = isLocalUpload && /\.(jpe?g|png)(\?.*)?$/i.test(finalSrc);
    var webpSrc       = needsWebpTry ? toWebpUrl(finalSrc) : null;

    function applyAndResolve(url) {
      imgEl.src = url;
      imgEl.classList.add('loaded');
      imgEl.style.opacity = '1';
      resolve();
    }

    var temp = new window.Image();
    temp.onload = function() { applyAndResolve(temp.src); };
    temp.onerror = function() {
      if (webpSrc && temp.src === webpSrc) {
        // WebP nie zadziałało — użyj oryginału
        var fallback = new window.Image();
        fallback.onload = function() { applyAndResolve(finalSrc); };
        fallback.onerror = function() { applyAndResolve(finalSrc); };
        fallback.src = finalSrc;
      } else {
        applyAndResolve(finalSrc);
      }
    };
    temp.src = webpSrc || finalSrc;
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
    uslugi_label:    'Usługi',
    services_h2:     'Co robimy<br><em>naprawdę</em> dobrze.',
    dlaczego_label:  'Dlaczego My',
    dlaczego_h2:     'Nie każdy<br>serwis<br>to <em>przyjmie.</em>',
    faq_label:       'Często zadawane pytania (FAQ)',
    faq_h2:          'Pytania, które<br><em>wracają</em><br>w rozmowach.',
    nav_uslugi:    'Usługi',
    nav_dlaczego:  'Dlaczego My',
    nav_cennik:    'Cennik',
    opinie:        'Opinie',
    nav_galeria:   'Galeria',
    nav_kontakt:   'Kontakt',
    cennik_label:  'Cennik',
    opinie_label:  'Głos klientów',
    opinie_h2:     'Mówią to,<br>czego nie<br><em>piszemy sami.</em>',
    opinie_cta:    'Zobacz wszystkie opinie w Google →',
    galeria_label: 'Galeria',
    galeria_h2:    'Style i<br><em>specjalizacje.</em>',
    galeria_sub:   'Rowery i usługi, które kochamy — od custom buildów po przywracanie klasyków do życia.',
    galeria_cta:   'Porozmawiajmy o Twoim projekcie →',
    kontakt_label: 'Kontakt',
    footer_center: 'Rakowicka 99 · Kraków · © 2026 YouniqService',
    hero_seo_label: 'Serwis rowerowy i custom builds — Kraków',
    lang_active:   'PL',
    lang_other:    'EN',
  },
  en: {
    ticker: ['Custom Builds','Wheel Lacing','Premium Service','Shimano · SRAM · Campagnolo','Road Bikes','Gravel Bikes','Touring Builds','Steel & Titanium Frames'],
    contact_btn_primary: 'Write to us',
    contact_btn_ghost: 'Find the workshop',
    uslugi_label:    'Services',
    services_h2:     'What we do<br><em>really</em> well.',
    dlaczego_label:  'Why Us',
    dlaczego_h2:     'Not every shop<br>will<br><em>take this on.</em>',
    faq_label:       'Frequently Asked Questions',
    faq_h2:          'Questions that<br><em>come up</em><br>again and again.',
    nav_uslugi:    'Services',
    nav_dlaczego:  'Why Us',
    nav_cennik:    'Pricing',
    opinie:        'Reviews',
    nav_galeria:   'Gallery',
    nav_kontakt:   'Contact',
    cennik_label:  'Pricing',
    opinie_label:  'Client Voice',
    opinie_h2:     "Words we<br>didn't<br><em>write ourselves.</em>",
    opinie_cta:    'See all reviews on Google →',
    galeria_label: 'Gallery',
    galeria_h2:    'Styles &<br><em>specialities.</em>',
    galeria_sub:   'Bikes and services we love — from custom builds to restoring classics.',
    galeria_cta:   "Let's talk about your build →",
    kontakt_label: 'Contact',
    footer_center: 'Rakowicka 99 · Kraków · © 2026 YouniqService',
    hero_seo_label: 'Bike service & custom builds — Kraków',
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
  var lblM = document.getElementById('langLabelMobile');
  var othM = document.getElementById('langOtherMobile');
  if (lblM) lblM.textContent = t.lang_active;
  if (othM) othM.textContent = t.lang_other;

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
    var tripled = t.ticker.concat(t.ticker).concat(t.ticker);
    tickerEl.innerHTML = tripled.map(function(s) { return '<span>' + s + '</span>'; }).join('');
  }

  // Przyciski kontakt
  var ctaRow = document.querySelector('#kontakt .cta-row');
  if (ctaRow) {
    var btnPrimary = ctaRow.querySelector('.btn-primary');
    var btnGhost   = ctaRow.querySelector('.btn-ghost');
    if (btnPrimary && t.contact_btn_primary) btnPrimary.textContent = t.contact_btn_primary;
    if (btnGhost   && t.contact_btn_ghost)   btnGhost.textContent   = t.contact_btn_ghost;
  }

  var footerCenter = document.querySelector('footer .footer-center');
  if (footerCenter) footerCenter.textContent = t.footer_center;

  document.documentElement.lang = lang;
}

// ─── Formatuj ceny z cennik.yml ──────────────────────────────────────────────
// Ceny są w cennik.yml zagnieżdżone w cat1/cat2/cat3.
// Po flattenNested() są dostępne jako price1..price21.
// • Wartość liczbowa  → PL "od X zł" / EN "from X PLN".
// • price21 (stawka godzinowa) → PL "X zł / h" / EN "X PLN / h".
// • Wartość tekstowa (np. "wycena indywidualna") → użyta dosłownie.
//   Dla EN tekst nadpisuje się w cennik_en.yml (np. "individual quote").
var hourlyPriceKeys = { price21: true };

function applyPrices(data, lang) {
  var isPL = (lang !== 'en');
  for (var i = 1; i <= 21; i++) {
    var key = 'price' + i;
    var raw = data[key];
    if (raw === undefined || raw === null || raw === '') continue;

    // Wartość nienumeryczna — użyj jako gotowy tekst ceny.
    if (isNaN(Number(raw))) { data[key + '_price'] = String(raw); continue; }

    var num = Number(raw);
    var formatted;
    if (hourlyPriceKeys[key]) {
      formatted = isPL ? (num + ' zł / h') : (num + ' PLN / h');
    } else {
      formatted = isPL ? ('od ' + num + ' zł') : ('from ' + num + ' PLN');
    }
    data[key + '_price'] = formatted;
  }
  return data;
}

// ─── Pliki YAML dla każdego języka ───────────────────────────────────────────
// Ceny są wyłącznie w cennik.yml (cat1/cat2/cat3 → price1..21).
// Edycja w CMS → zapis do cennik.yml → strona czyta z cennik.yml. ✓

var filesPL = [
  '/_data/hero.yml',
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
  '/_data/uslugi_en.yml',
  '/_data/dlaczego_en.yml',
  '/_data/faq_en.yml',
  '/_data/opinie_en.yml',
  '/_data/galeria_en.yml',
  '/_data/kontakt_en.yml',
  '/_data/cennik.yml',     // 1. baza PL — zawiera price1..21 (liczby) w cat1/cat2/cat3
  '/_data/cennik_en.yml',  // 2. EN nadpisuje tylko _service i nagłówki (bez liczb)
];

// ─── Głęboki merge obiektów ───────────────────────────────────────────────────
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

// ─── Przełącznik języka — nawigacja między /  i  /en/ ──────────────────────────
// Każda wersja językowa ma własny URL (lepsze SEO), więc przełącznik przenosi
// na odpowiadającą stronę zamiast podmieniać treść w miejscu.
function initLangSwitcher() {
  var targetByCurrent = { pl: '/en/', en: '/' };
  ['langSwitcher', 'langSwitcherMobile'].forEach(function(id) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', function() {
      window.location.href = targetByCurrent[currentLang];
    });
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
