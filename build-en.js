/**
 * build-en.js — generator angielskiej wersji strony (/en/index.html)
 *
 * Po co: EN ma własny, indeksowalny URL (/en/) z poprawnym <head>
 * (title / description / canonical / og / hreflang / JSON-LD po angielsku),
 * a Google indeksuje go jako osobną stronę.
 *
 * Jak to działa: <body> jest WSPÓLNE — pobierane 1:1 z index.html (jedno
 * źródło prawdy). Treść i tak wstrzykuje cms-loader.js z plików _data/*_en.yml
 * na podstawie ścieżki /en/. Tu różni się tylko <head>.
 *
 * Użycie:  node build-en.js
 * Uruchom po KAŻDEJ zmianie struktury <body> w index.html.
 * (Zmiany samej treści w CMS → _data/*.yml — NIE wymagają przebudowy.)
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'index.html');
const OUT_DIR = path.join(ROOT, 'en');
const OUT = path.join(OUT_DIR, 'index.html');

// ─── Angielski <head> ──────────────────────────────────────────────────────────
// Assety podawane są ścieżkami absolutnymi (/...), żeby działały z /en/.
const EN_HEAD = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>YouniqService – Custom Bike Builds & Premium Bike Service Kraków</title>
<meta name="description" content="YouniqService – custom bikes and premium service in Kraków. Custom builds, hand-built wheels, Shimano / SRAM / Campagnolo service. Rakowicka 99.">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<link rel="canonical" href="https://youniqservice.pl/en/">

<!-- hreflang — wersje językowe -->
<link rel="alternate" hreflang="pl" href="https://youniqservice.pl/">
<link rel="alternate" hreflang="en" href="https://youniqservice.pl/en/">
<link rel="alternate" hreflang="x-default" href="https://youniqservice.pl/">

<!-- Favicon -->
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="pl_PL">
<meta property="og:site_name" content="YouniqService">
<meta property="og:title" content="YouniqService – Custom Bikes Kraków">
<meta property="og:description" content="Custom bikes and premium service in Kraków. Custom builds, hand-built wheels, Shimano / SRAM / Campagnolo service. Rakowicka 99.">
<meta property="og:url" content="https://youniqservice.pl/en/">
<meta property="og:image" content="https://youniqservice.pl/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="YouniqService – Custom Bikes Kraków">
<meta name="twitter:description" content="Custom bikes and premium service in Kraków. Rakowicka 99.">
<meta name="twitter:image" content="https://youniqservice.pl/og.jpg">

<!-- Local SEO: structured data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BicycleStore",
  "name": "YouniqService",
  "description": "Custom bikes and premium service in Kraków: custom builds, hand-built wheels, Shimano / SRAM / Campagnolo service.",
  "url": "https://youniqservice.pl/en/",
  "inLanguage": "en",
  "telephone": "+48500250068",
  "priceRange": "$$",
  "currenciesAccepted": "PLN",
  "paymentAccepted": "Cash, Credit Card",
  "image": "https://youniqservice.pl/og.jpg",
  "logo": {
    "@type": "ImageObject",
    "url": "https://youniqservice.pl/android-chrome-512x512.png",
    "width": 512,
    "height": 512
  },
  "hasMap": "https://maps.app.goo.gl/XpUsyRzsvwveWy1d6",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Rakowicka 99",
    "addressLocality": "Kraków",
    "postalCode": "31-510",
    "addressCountry": "PL"
  },
  "sameAs": [
    "https://www.google.com/maps/place/YouniqService"
  ],
  "areaServed": {
    "@type": "City",
    "name": "Kraków"
  },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "10:00", "closes": "18:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "10:00", "closes": "14:00" }
  ]
}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">

<!-- GOOGLE ANALYTICS 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-HZ32LKPJF8"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-HZ32LKPJF8');
</script>

<!-- Netlify Identity Widget -->
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>

<style>
.hero-cta-mobile  { display: none; }
.hero-cta-desktop { display: inline-flex; }
@media (max-width: 768px) {
  .hero-cta-desktop { display: none; }
  .hero-cta-mobile  { display: inline-flex; }
}
</style>

<!-- FAQPage structured data (EN) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "inLanguage": "en",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do you only repair modern bikes?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. Our passion is bringing classics back to life. We happily take on the revival of 30-year-old MTBs, vintage road bikes, and city bikes (e.g. Winora) that others have written off." }
    },
    {
      "@type": "Question",
      "name": "Do you take on repairs that other shops refused?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. We specialise in difficult cases — from unusual faults in SRAM (Click Box) and FOX systems to non-standard frames and cargo bikes. If someone told you it can't be fixed, bring the bike to us at Rakowicka 99." }
    },
    {
      "@type": "Question",
      "name": "How does pricing work? Will there be any surprises?",
      "acceptedAnswer": { "@type": "Answer", "text": "We operate transparently. When you drop off your bike, we run an initial diagnosis and give you an estimated cost. If additional parts are needed during the work, we consult with you before purchasing them. We invoice every part and service in detail." }
    },
    {
      "@type": "Question",
      "name": "Do I need to book an appointment?",
      "acceptedAnswer": { "@type": "Answer", "text": "In season, we can get busy, so for larger projects (custom builds, tuning, full overhauls) we recommend calling ahead. Minor jobs like tube changes or quick adjustments we try to handle on the spot or within 24 hours, schedule permitting." }
    },
    {
      "@type": "Question",
      "name": "Do you advise on component selection?",
      "acceptedAnswer": { "@type": "Answer", "text": "Of course. We don't push the most expensive parts. We recommend solutions appropriate to your bike's condition and your budget. We're happy to share knowledge — if you want to maintain your bike yourself, we'll show you how to do it properly." }
    },
    {
      "@type": "Question",
      "name": "Why choose YouniqService over a chain service?",
      "acceptedAnswer": { "@type": "Answer", "text": "Because here your bike is not just another number in the queue. We approach every machine meticulously — every bolt is checked, cleaned and lubricated. The work is done by a passionate engineer-mechanic for whom safety and Swiss-watch precision are what count." }
    }
  ]
}
</script>
</head>
`;

// ─── Generowanie ───────────────────────────────────────────────────────────────
const src = fs.readFileSync(SRC, 'utf8');

const bodyStart = src.indexOf('<body>');
if (bodyStart === -1) {
  console.error('build-en: nie znaleziono <body> w index.html — przerwano.');
  process.exit(1);
}

const body = src.slice(bodyStart); // <body> ... </html>
const output = EN_HEAD + body;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, output, 'utf8');

console.log('build-en: zapisano ' + path.relative(ROOT, OUT) + ' (' + output.length + ' B)');
