/**
 * cms-loader.js — Youniq Bikes
 * Wczytuje pliki YAML z folderu _data/ i podmienia treści na stronie.
 */

// ─── Solidny parser YAML ───────────────────────────────────────────────────────
// Obsługuje wartości z dwukropkami (URL-e, godziny itp.)
function parseYAML(text) {
  const result = {};
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Regex: klucz to tylko litery/cyfry/podkreślniki, potem ": " i reszta to wartość
    const match = trimmed.match(/^([a-zA-Z0-9_]+)\s*:\s*(.*)/);
    if (!match) continue;

    const key = match[1];
    let value = match[2].trim();

    // Wartość w podwójnych cudzysłowach
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    }
    // Wartość w pojedynczych cudzysłowach
    else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1).replace(/\\'/g, "'");
    }
    // Bez cudzysłowów — wartość może zawierać dwukropki (np. 10:00, https://)

    result[key] = value;
  }

  return result;
}

// ─── Pobierz plik YAML ────────────────────────────────────────────────────────
async function fetchYAML(path) {
  try {
    const res = await fetch(path + '?v=' + Date.now());
    if (!res.ok) return {};
    return parseYAML(await res.text());
  } catch (e) {
    console.warn('cms-loader: błąd pobierania', path, e);
    return {};
  }
}

// ─── Buduje HTML dla contact_info z klikalnymi numerami telefonu ──────────────
function buildContactInfo(value) {
  return value.replace(
    /(\+?[\d\s]{9,15})/g,
    (match) => {
      const digits = match.replace(/\s/g, '');
      return '<a href="tel:' + digits + '">' + match + '</a>';
    }
  );
}

// ─── Podmień treści na stronie ────────────────────────────────────────────────
function applyData(data) {
  document.querySelectorAll('[data-cms]').forEach(function(el) {
    const key = el.getAttribute('data-cms');
    if (!(key in data)) return;

    const value = data[key];

    // Obrazki
    if (el.tagName === 'IMG') {
      el.src = value;
      el.onerror = function() { this.onerror = null; };
      return;
    }

    // Linki CTA — podmień tylko tekst, zostaw href bez zmian
    if (el.tagName === 'A') {
      el.textContent = value;
      return;
    }

    // Pole kontaktowe — zamień numery telefonu na linki
    if (key === 'contact_info') {
      el.innerHTML = buildContactInfo(value);
      return;
    }

    // Wszystko inne — wstaw jako innerHTML, \n → <br>
    el.innerHTML = value.replace(/\n/g, '<br>');
  });
}

// ─── Główna funkcja ───────────────────────────────────────────────────────────
async function loadCMSData() {
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
