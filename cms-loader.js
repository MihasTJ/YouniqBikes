/**
 * cms-loader.js — Youniq Bikes
 * Wczytuje pliki YAML z folderu _data/ i podmienia treści na stronie.
 * Działa bez żadnych zewnętrznych bibliotek (poza prostym parserem YAML).
 */

// ─── Minimalny parser YAML (obsługuje klucz: "wartość") ───────────────────────
function parseYAML(text) {
  const result = {};
  const lines = text.split('\n');

  for (const line of lines) {
    // Pomiń puste linie i komentarze
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // Usuń cudzysłowy jeśli wartość jest w cudzysłowach
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Odkoduj podstawowe sekwencje ucieczki YAML
    value = value
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'");

    result[key] = value;
  }

  return result;
}

// ─── Pobierz plik YAML i zwróć sparsowany obiekt ──────────────────────────────
async function fetchYAML(path) {
  try {
    const response = await fetch(path + '?v=' + Date.now()); // cache bust
    if (!response.ok) return {};
    const text = await response.text();
    return parseYAML(text);
  } catch (e) {
    console.warn('cms-loader: nie można pobrać', path, e);
    return {};
  }
}

// ─── Podmień treść elementu na podstawie data-cms ─────────────────────────────
function applyData(data) {
  document.querySelectorAll('[data-cms]').forEach(el => {
    const key = el.getAttribute('data-cms');
    if (!(key in data)) return;

    const value = data[key];

    // Obsługa obrazków
    if (el.tagName === 'IMG') {
      el.src = value;
      return;
    }

    // Obsługa linków — podmień tylko tekst, nie href
    if (el.tagName === 'A') {
      el.textContent = value;
      return;
    }

    // Pozostałe elementy — wstaw jako HTML (żeby działały <br>, <strong> itp.)
    // Zamieniamy znaki nowej linii na <br>
    el.innerHTML = value.replace(/\n/g, '<br>');
  });
}

// ─── Główna funkcja ładująca wszystkie pliki ──────────────────────────────────
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

  // Pobierz wszystkie pliki równolegle
  const results = await Promise.all(files.map(fetchYAML));

  // Scal wszystkie dane w jeden obiekt
  const allData = Object.assign({}, ...results);

  // Podmień treści na stronie
  applyData(allData);

  // Obsługa specjalna: galeria — zdjęcia mogą być w folderze /images/uploads/
  applyGalleryImages(allData);
}

// ─── Specjalna obsługa zdjęć w galerii ───────────────────────────────────────
function applyGalleryImages(data) {
  // Galeria — upewnij się że src jest poprawnie ustawiony
  // (applyData już to robi, ale tu możemy dodać fallback)
  for (let i = 1; i <= 6; i++) {
    const key = `gallery${i}_img`;
    if (!data[key]) continue;

    // Znajdź img po data-cms (już podmieniony przez applyData)
    // To jest fallback na wypadek gdyby coś poszło nie tak
    const img = document.querySelector(`[data-cms="${key}"]`);
    if (img && img.tagName === 'IMG') {
      img.src = data[key];
      img.onerror = function () {
        // Jeśli zdjęcie nie załaduje się — zachowaj oryginalne
        this.onerror = null;
      };
    }
  }
}

// ─── Uruchom po załadowaniu DOM ───────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadCMSData);
} else {
  loadCMSData();
}
