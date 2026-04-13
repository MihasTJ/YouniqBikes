/**
 * cms-loader.js — Youniq Bikes
 * Wczytuje pliki YAML z _data/ używając js-yaml i podmienia treści na stronie.
 * Galeria ukryta do czasu załadowania danych — zero "skoku" zdjęć.
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

// ─── Pobierz plik YAML ────────────────────────────────────────────────────────
async function fetchYAML(path) {
  try {
    var res = await fetch(path + '?v=' + Date.now());
    if (!res.ok) return {};
    return window.jsyaml.load(await res.text()) || {};
  } catch (e) {
    console.warn('cms-loader: błąd pobierania', path, e);
    return {};
  }
}

// ─── Zamień numery telefonu na klikalne linki ─────────────────────────────────
function linkifyPhone(value) {
  return value.replace(/(\+?[\d\s]{9,15})/g, function(match) {
    return '<a href="tel:' + match.replace(/\s/g, '') + '">' + match + '</a>';
  });
}

// ─── Podmień treści na stronie ────────────────────────────────────────────────
function applyData(data) {
  document.querySelectorAll('[data-cms]').forEach(function(el) {
    var key = el.getAttribute('data-cms');
    if (!(key in data)) return;

    var value = String(data[key]);

    if (el.tagName === 'IMG') {
      // Załaduj zdjęcie — pokaż galerię dopiero gdy się załaduje
      el.src = value;
      el.onerror = function() { this.onerror = null; };
      return;
    }

    if (el.tagName === 'A') {
      el.textContent = value;
      return;
    }

    if (key === 'contact_info') {
      el.innerHTML = linkifyPhone(value);
      return;
    }

    el.innerHTML = value.replace(/\n/g, '<br>');
  });
}

// ─── Poczekaj aż wszystkie zdjęcia w galerii się załadują ────────────────────
function waitForGalleryImages() {
  var gallery = document.querySelector('.gallery-grid');
  if (!gallery) return Promise.resolve();

  var images = Array.from(gallery.querySelectorAll('img'));
  if (images.length === 0) return Promise.resolve();

  var promises = images.map(function(img) {
    return new Promise(function(resolve) {
      if (img.complete && img.naturalWidth > 0) {
        resolve();
      } else {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve); // błąd też "zwalnia" blokadę
      }
    });
  });

  return Promise.all(promises);
}

// ─── Główna funkcja ───────────────────────────────────────────────────────────
async function loadCMSData() {
  // 1. Ukryj galerię natychmiast — zanim zdążą się załadować domyślne src
  var gallery = document.querySelector('.gallery-grid');
  if (gallery) {
    gallery.style.opacity = '0';
    gallery.style.transition = 'none';
  }

  // 2. Załaduj js-yaml
  if (!window.jsyaml) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js');
  }

  // 3. Pobierz wszystkie dane
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

  // 4. Podmień treści (w tym src zdjęć)
  applyData(allData);

  // 5. Poczekaj aż nowe zdjęcia się załadują, potem odkryj galerię płynnie
  await waitForGalleryImages();

  if (gallery) {
    gallery.style.transition = 'opacity 0.5s ease';
    gallery.style.opacity = '1';
  }
}

// ─── Uruchom możliwie jak najwcześniej ───────────────────────────────────────
// Nie czekamy na DOMContentLoaded — uruchamiamy od razu gdy skrypt się załaduje
// i sprawdzamy czy DOM jest już gotowy
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadCMSData);
} else {
  loadCMSData();
}
