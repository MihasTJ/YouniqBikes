// ─── Scroll reveal — Intersection Observer ───────────────────────────────────
// Dodaje klasę .active do .reveal gdy element pojawi się w viewport.
// Galeria jest wykluczona dopóki cms-loader nie wywoła revealGallery().

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;

      // Elementy galerii — czekaj na sygnał od cms-loader
      if (el.closest('#galeria')) {
        if (document.body.classList.contains('cms-ready')) {
          el.classList.add('active');
          revealObserver.unobserve(el);
        }
        return;
      }

      el.classList.add('active');
      revealObserver.unobserve(el);
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ─── Wywoływane przez cms-loader gdy zdjęcia są gotowe ───────────────────────
window.revealGallery = function() {
  document.body.classList.add('cms-ready');

  document.querySelectorAll('#galeria .reveal').forEach((el) => {
    el.classList.add('active');
    el.classList.add('visible'); // zachowaj visible dla pewności
  });
};

// ─── Scroll Spy — podświetla aktywny link w nawigacji ────────────────────────
(function initScrollSpy() {
  var sections = Array.from(document.querySelectorAll('section[id]'));
  var navLinks = Array.from(document.querySelectorAll('nav ul a[href^="#"]'));

  if (!navLinks.length || !sections.length) return;

  var currentActive = null;

  var spyObserver = new IntersectionObserver(
    function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;

        var id = entry.target.getAttribute('id');
        var matchingLink = navLinks.find(function(a) {
          return a.getAttribute('href') === '#' + id;
        });

        if (!matchingLink || matchingLink === currentActive) return;

        navLinks.forEach(function(a) { a.classList.remove('active'); });
        matchingLink.classList.add('active');
        currentActive = matchingLink;
      });
    },
    {
      // Sekcja aktywna gdy jej górna krawędź wchodzi w środkowy pas okna
      rootMargin: '-20% 0px -75% 0px',
      threshold: 0
    }
  );

  sections.forEach(function(section) { spyObserver.observe(section); });
})();

// ─── Burger menu ─────────────────────────────────────────────────────────────
var burgerBtn = document.getElementById('burgerBtn');
var navMobile = document.getElementById('navMobile');

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

if (navMobile) {
  navMobile.querySelectorAll('.nav-mobile-link').forEach(function(link) {
    link.addEventListener('click', function() { toggleMenu(false); });
  });
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') toggleMenu(false);
});

// ─── Mobilny przełącznik języka ──────────────────────────────────────────────
var langMobile = document.getElementById('langSwitcherMobile');
if (langMobile) {
  langMobile.addEventListener('click', function() {
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
