// ===== iGardening Main JS =====

document.addEventListener('DOMContentLoaded', () => {

    // ===== Mobile Menu Toggle =====
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const searchToggle = document.getElementById('searchToggle');
    const searchBar = document.getElementById('searchBar');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    if (searchToggle && searchBar) {
        searchToggle.addEventListener('click', () => {
            searchBar.classList.toggle('active');
            const input = searchBar.querySelector('input');
            if (input && searchBar.classList.contains('active')) {
                input.focus();
            }
        });
    }

    // ===== Sticky Header Shadow =====
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 20);
        }, { passive: true });
    }

    // ===== Scroll to Top Button =====
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
        }, { passive: true });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===== Scroll Animations (Intersection Observer) =====
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger animations
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 80);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    } else {
        // Fallback: show everything
        animatedElements.forEach(el => el.classList.add('visible'));
    }

    // ===== Newsletter form =====
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            if (email) {
                newsletterForm.innerHTML = `
                    <div style="padding: 20px; text-align: center;">
                        <div style="font-size: 2.5rem; margin-bottom: 12px;">&#127793;</div>
                        <p style="font-size: 1.15rem; font-weight: 600; margin-bottom: 8px;">Merci de votre inscription !</p>
                        <p style="font-size: 0.9rem; opacity: 0.8;">Vous recevrez bientôt nos meilleurs conseils jardinage.</p>
                    </div>`;
            }
        });
    }

    // ===== Smooth scroll for anchor links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ===== Mobile dropdown toggle (click instead of hover) =====
    document.querySelectorAll('.nav-dropdown > a').forEach(dropdownLink => {
        dropdownLink.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parent = dropdownLink.parentElement;
                // Close other open dropdowns
                document.querySelectorAll('.nav-dropdown.open').forEach(d => {
                    if (d !== parent) d.classList.remove('open');
                });
                parent.classList.toggle('open');
            }
        });
    });

    // ===== Close mobile menu on link click =====
    document.querySelectorAll('.nav > a, .dropdown-content a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav) mainNav.classList.remove('active');
            if (menuToggle) menuToggle.classList.remove('active');
            document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
        });
    });

    // ===== Close mobile menu when clicking outside =====
    document.addEventListener('click', (e) => {
        if (mainNav && mainNav.classList.contains('active') &&
            !mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
            mainNav.classList.remove('active');
            menuToggle.classList.remove('active');
            document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
        }
    });

    // ===== Newsletter Popup =====
    const nlDismissed = localStorage.getItem('nl_popup_dismissed');
    if (!nlDismissed) {
        setTimeout(() => {
            // Detect language
            const lang = document.documentElement.lang || 'fr';
            const texts = {
                fr: {
                    title: 'Rejoignez la communauté iGardening !',
                    desc: 'Recevez chaque semaine nos meilleurs conseils de jardinage, guides saisonniers et astuces exclusives directement dans votre boîte mail.',
                    btn: "S'inscrire à la newsletter",
                    skip: 'Non merci, peut-être plus tard'
                },
                en: {
                    title: 'Join the iGardening community!',
                    desc: 'Get our best gardening tips, seasonal guides and exclusive tricks delivered to your inbox every week.',
                    btn: 'Subscribe to the newsletter',
                    skip: 'No thanks, maybe later'
                },
                es: {
                    title: '¡Únete a la comunidad iGardening!',
                    desc: 'Recibe cada semana nuestros mejores consejos de jardinería, guías estacionales y trucos exclusivos directamente en tu correo.',
                    btn: 'Suscribirse al boletín',
                    skip: 'No gracias, quizás más tarde'
                }
            };
            const t = texts[lang] || texts.fr;

            const overlay = document.createElement('div');
            overlay.className = 'nl-popup-overlay';
            overlay.innerHTML = `
                <div class="nl-popup">
                    <button class="nl-popup-close" aria-label="Fermer">&times;</button>
                    <div class="nl-popup-body">
                        <div class="nl-icon">🌱</div>
                        <h2>${t.title}</h2>
                        <p>${t.desc}</p>
                        <a href="https://newsletter.igardening.co/" target="_blank" rel="noopener" class="nl-btn">${t.btn}</a>
                        <button class="nl-skip">${t.skip}</button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => overlay.classList.add('active'));
            });

            const closePopup = () => {
                overlay.classList.remove('active');
                localStorage.setItem('nl_popup_dismissed', Date.now());
                setTimeout(() => overlay.remove(), 400);
            };

            overlay.querySelector('.nl-popup-close').addEventListener('click', closePopup);
            overlay.querySelector('.nl-skip').addEventListener('click', closePopup);
            overlay.querySelector('.nl-btn').addEventListener('click', () => {
                localStorage.setItem('nl_popup_dismissed', Date.now());
            });
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closePopup();
            });
        }, 5000);
    }

    // ===== Image lazy loading fallback =====
    if (!('loading' in HTMLImageElement.prototype)) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const imgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    imgObserver.unobserve(img);
                }
            });
        });
        lazyImages.forEach(img => imgObserver.observe(img));
    }
});
