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

// ─── Burger menu ─────────────────────────────────────────────────────────────
var burgerBtn  = document.getElementById('burgerBtn');
var navMobile  = document.getElementById('navMobile');

function toggleMenu(force) {
  var isOpen = force !== undefined ? force : !navMobile.classList.contains('open');
  navMobile.classList.toggle('open', isOpen);
  burgerBtn.classList.toggle('open', isOpen);
  burgerBtn.setAttribute('aria-expanded', isOpen);
  navMobile.setAttribute('aria-hidden', !isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

if (burgerBtn) {
  burgerBtn.addEventListener('click', function() { toggleMenu(); });
}

// Zamknij menu po kliknięciu w link lub poza overlay
if (navMobile) {
  navMobile.querySelectorAll('.nav-mobile-link').forEach(function(link) {
    link.addEventListener('click', function() { toggleMenu(false); });
  });
}

// Zamknij na Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') toggleMenu(false);
});

// ─── Mobilny przełącznik języka ──────────────────────────────────────────────
var langMobile = document.getElementById('langSwitcherMobile');
if (langMobile) {
  langMobile.addEventListener('click', function() {
    // Przełącz język bezpośrednio — NIE przez .click() na desktopowym przycisku
    // bo to powodowało podwójne przełączenie (pl→en→pl) i brak powrotu do PL
    currentLang = (currentLang === 'pl') ? 'en' : 'pl';
    localStorage.setItem('yb_lang', currentLang);
    document.body.classList.remove('cms-ready');
    loadCMSData(currentLang);
    toggleMenu(false);
  });
}

// ─── Scroll to top ───────────────────────────────────────────────────────────
var scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', function() {
  if (!scrollTopBtn) return;
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
