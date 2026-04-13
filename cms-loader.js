/**
 * cms-loader.js — Youniq Bikes
 * Zdjęcia galerii ładowane w tle — pokazują się dopiero gdy są gotowe.
 */

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
    var res = await fetch(path + '?v=' + Date.now());
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
      // Odkryj zdjęcie płynnie
      imgEl.style.transition = 'opacity 0.4s ease';
      imgEl.style.opacity = '1';
      resolve();
    };

    temp.onerror = function() {
      // Nawet przy błędzie pokaż element
      imgEl.src = src;
      imgEl.style.opacity = '1';
      resolve();
    };

    temp.src = src;
  });
}

// ─── Podmień treści, zdjęcia galerii obsłuż osobno ───────────────────────────
function applyData(data) {
  var galleryPromises = [];

  document.querySelectorAll('[data-cms]').forEach(function(el) {
    var key = el.getAttribute('data-cms');
    if (!(key in data)) return;

    var value = String(data[key]);

    // Zdjęcia galerii — specjalna obsługa z preloadem
    if (el.tagName === 'IMG' && key.startsWith('gallery') && key.endsWith('_img')) {
      galleryPromises.push(loadImageWhenReady(el, value));
      return;
    }

    // Inne obrazki (nie galeria)
    if (el.tagName === 'IMG') {
      el.src = value;
      return;
    }

    // Linki CTA
    if (el.tagName === 'A') {
      el.textContent = value;
      return;
    }

    // Kontakt — linkuj telefon
    if (key === 'contact_info') {
      el.innerHTML = linkifyPhone(value);
      return;
    }

    // Reszta
    el.innerHTML = value.replace(/\n/g, '<br>');
  });

  return Promise.all(galleryPromises);
}

// ─── Główna funkcja ───────────────────────────────────────────────────────────
async function loadCMSData() {
  // Ukryj zdjęcia galerii natychmiast przez JS — zanim przeglądarka je pobierze
  document.querySelectorAll('[data-cms^="gallery"][data-cms$="_img"]').forEach(function(img) {
    img.style.opacity = '0';
    img.style.transition = 'none';
    img.src = ''; // wyczyść src żeby przeglądarka nie pobierała starego
  });

  // Załaduj js-yaml
  if (!window.jsyaml) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js');
  }

  // Pobierz wszystkie pliki YAML równolegle
  var files = [
    '/_data/hero.yml',
    '/_data/filozofia.yml',
    '/_data/dlaczego.yml',
    '/_data/faq.yml',
    '/_data/opinie.yml',
    '/_data/galeria.yml',
    '/_data/kontakt.yml',
  ];

  var results = await Promise.all(files.map(fetchYAML));
  var allData = Object.assign.apply(Object, [{}].concat(results));

  // Podmień treści + czekaj aż zdjęcia galerii się załadują
  await applyData(allData);

  // Sygnał dla script.js — galeria gotowa, można odpalić reveal
  if (window.revealGallery) window.revealGallery();
}

// ─── Odpal jak najwcześniej ───────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadCMSData);
} else {
  loadCMSData();
}
