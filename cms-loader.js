/**
 * cms-loader.js — Youniq Bikes
 * Wczytuje pliki YAML z _data/ używając js-yaml (solidna biblioteka)
 * i podmienia treści na stronie przez atrybuty data-cms.
 */

// ─── Załaduj js-yaml z CDN ────────────────────────────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ─── Pobierz plik YAML i zwróć sparsowany obiekt ─────────────────────────────
async function fetchYAML(path) {
  try {
    const res = await fetch(path + '?v=' + Date.now());
    if (!res.ok) return {};
    const text = await res.text();
    return window.jsyaml.load(text) || {};
  } catch (e) {
    console.warn('cms-loader: błąd pobierania', path, e);
    return {};
  }
}

// ─── Zamień numery telefonu w tekście na klikalne linki ──────────────────────
function linkifyPhone(value) {
  return value.replace(/(\+?[\d\s]{9,15})/g, (match) => {
    const digits = match.replace(/\s/g, '');
    return '<a href="tel:' + digits + '">' + match + '</a>';
  });
}

// ─── Podmień treści na stronie ────────────────────────────────────────────────
function applyData(data) {
  document.querySelectorAll('[data-cms]').forEach(function (el) {
    const key = el.getAttribute('data-cms');
    if (!(key in data)) return;

    // js-yaml zwraca liczby jako number — zamień na string
    const value = String(data[key]);

    // Obrazki
    if (el.tagName === 'IMG') {
      el.src = value;
      el.onerror = function () { this.onerror = null; };
      return;
    }

    // Linki CTA — podmień tylko tekst, zostaw href
    if (el.tagName === 'A') {
      el.textContent = value;
      return;
    }

    // Pole kontaktowe — linkuj numery telefonu
    if (key === 'contact_info') {
      el.innerHTML = linkifyPhone(value);
      return;
    }

    // Wszystko inne — wstaw jako innerHTML
    // \n zamieniamy na <br> dla wieloliniowych wartości bez tagów
    el.innerHTML = value.replace(/\n/g, '<br>');
  });
}

// ─── Główna funkcja ───────────────────────────────────────────────────────────
async function loadCMSData() {
  // Załaduj js-yaml jeśli jeszcze nie załadowany
  if (!window.jsyaml) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js');
  }

  const files = [
    '/_data/hero.yml',
    '/_data/filozofia.yml',
    '/_data/dlaczego.yml',
    '/_data/faq.yml',
    '/_data/opinie.yml',
    '/_data/galeria.yml',
    '/_data/kontakt.yml',
  ];

  const results = await Promise.all(files.map(fetchYAML));
  const allData = Object.assign({}, ...results);
  applyData(allData);
}

// ─── Uruchom po załadowaniu DOM ───────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadCMSData);
} else {
  loadCMSData();
}
