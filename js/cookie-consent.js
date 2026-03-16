(function() {
  'use strict';

  var GA_ID = 'G-68PN353H4C';
  var ADSENSE_ID = 'ca-pub-3972168030077539';
  var STORAGE_KEY = 'igardening_cookie_consent';

  var lang = (document.documentElement.lang || 'fr').substring(0, 2).toLowerCase();

  var translations = {
    fr: {
      message: 'Ce site utilise des cookies pour am\u00e9liorer votre exp\u00e9rience.',
      accept: 'Accepter',
      refuse: 'Refuser',
      privacy: 'Politique de confidentialit\u00e9',
      privacyUrl: '/pages/privacy.html'
    },
    en: {
      message: 'This site uses cookies to improve your experience.',
      accept: 'Accept',
      refuse: 'Decline',
      privacy: 'Privacy Policy',
      privacyUrl: '/en/pages/privacy.html'
    },
    es: {
      message: 'Este sitio utiliza cookies para mejorar su experiencia.',
      accept: 'Aceptar',
      refuse: 'Rechazar',
      privacy: 'Pol\u00edtica de privacidad',
      privacyUrl: '/es/pages/privacy.html'
    }
  };

  var t = translations[lang] || translations.fr;

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch(e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch(e) {}
  }

  function loadGA() {
    if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  function loadAdSense() {
    if (document.querySelector('script[src*="googlesyndication.com"]')) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_ID;
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }

  function loadTracking() {
    loadGA();
    loadAdSense();
  }

  function showBanner() {
    var banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:999999;background:#1a3409;color:#f0f7ec;font-family:Inter,system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.5;padding:16px 20px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px 20px;box-shadow:0 -2px 12px rgba(0,0,0,0.25);';

    var text = document.createElement('p');
    text.style.cssText = 'margin:0;flex:1 1 300px;text-align:center;';
    text.innerHTML = t.message + ' <a href="' + t.privacyUrl + '" style="color:#8bc34a;text-decoration:underline;">' + t.privacy + '</a>';

    var btnWrap = document.createElement('div');
    btnWrap.style.cssText = 'display:flex;gap:10px;flex-shrink:0;';

    var btnAccept = document.createElement('button');
    btnAccept.textContent = t.accept;
    btnAccept.style.cssText = 'background:#2d5016;color:#fff;border:2px solid #8bc34a;padding:8px 24px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;font-family:inherit;transition:background .2s;';
    btnAccept.onmouseover = function(){ this.style.background='#3a6b1e'; };
    btnAccept.onmouseout = function(){ this.style.background='#2d5016'; };

    var btnRefuse = document.createElement('button');
    btnRefuse.textContent = t.refuse;
    btnRefuse.style.cssText = 'background:transparent;color:#c5d8b8;border:2px solid #5a7a48;padding:8px 24px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;font-family:inherit;transition:background .2s;';
    btnRefuse.onmouseover = function(){ this.style.background='rgba(255,255,255,0.08)'; };
    btnRefuse.onmouseout = function(){ this.style.background='transparent'; };

    btnAccept.addEventListener('click', function() {
      setConsent('accepted');
      banner.remove();
      loadTracking();
    });

    btnRefuse.addEventListener('click', function() {
      setConsent('refused');
      banner.remove();
    });

    btnWrap.appendChild(btnAccept);
    btnWrap.appendChild(btnRefuse);
    banner.appendChild(text);
    banner.appendChild(btnWrap);
    document.body.appendChild(banner);
  }

  // Main logic
  var consent = getConsent();
  if (consent === 'accepted') {
    loadTracking();
  } else if (consent !== 'refused') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }
})();
