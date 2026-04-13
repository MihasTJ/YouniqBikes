// ─── Scroll reveal ────────────────────────────────────────────────────────────
// Galeria jest wykluczona z reveal dopóki cms-loader nie załaduje zdjęć.
// Klasa .cms-ready na body jest sygnałem że można odkryć galerię.

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;

      // Elementy galerii — czekaj na sygnał od cms-loader
      if (el.closest('#galeria')) {
        if (document.body.classList.contains('cms-ready')) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
        // Jeśli cms-ready jeszcze nie ma — nic nie rób,
        // cms-loader sam wywoła revealGallery() gdy skończy
        return;
      }

      // Wszystkie inne sekcje — reveal normalnie
      el.classList.add('visible');
      observer.unobserve(el);
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// ─── Wywoływane przez cms-loader gdy zdjęcia są gotowe ───────────────────────
window.revealGallery = function() {
  document.body.classList.add('cms-ready');

  document.querySelectorAll('#galeria .reveal').forEach((el) => {
    el.classList.add('visible');
  });
};
