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
    el.classList.add('visible');
  });
};

// ─── Scroll Spy — podświetla aktywny link w nawigacji ────────────────────────
// Śledzimy sekcję najbliżej górnej krawędzi viewportu (scroll-position based),
// zamiast wąskiego okna IntersectionObserver, które gubiło sekcje przy szybkim scrollu.
(function initScrollSpy() {
  var sections = Array.from(document.querySelectorAll('section[id]'));
  var navLinks = Array.from(document.querySelectorAll('nav ul a[href^="#"]'));

  if (!navLinks.length || !sections.length) return;

  var NAV_HEIGHT = 80; // px — offset nav fixed
  var currentActive = null;

  function getActiveSection() {
    var scrollY = window.scrollY + NAV_HEIGHT + 32;

    // Pierwsza sekcja, której top <= scrollY (iterujemy od dołu)
    var active = null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top + window.scrollY <= scrollY) {
        active = sections[i];
      }
    }
    return active;
  }

  function updateSpy() {
    var activeSection = getActiveSection();
    if (!activeSection) return;

    var id = activeSection.getAttribute('id');
    var matchingLink = navLinks.find(function(a) {
      return a.getAttribute('href') === '#' + id;
    });

    if (!matchingLink || matchingLink === currentActive) return;

    navLinks.forEach(function(a) { a.classList.remove('active'); });
    matchingLink.classList.add('active');
    currentActive = matchingLink;
  }

  // Throttle przez rAF — max 1x na klatkę
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() {
      updateSpy();
      ticking = false;
    });
  }, { passive: true });

  // Wywołaj od razu przy załadowaniu strony
  updateSpy();
})();

// ─── Ticker — CSS obsługuje hover, JS dodaje toggle dla dotyku ───────────────
(function initTickerPause() {
  var tickerWrap = document.querySelector('.ticker-wrap');
  if (!tickerWrap) return;

  var paused = false;

  // Na urządzeniach dotykowych hover nie działa — obsługujemy klik jako toggle
  tickerWrap.addEventListener('click', function() {
    paused = !paused;
    tickerWrap.classList.toggle('ticker-paused', paused);
  });
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
