// Sidebar Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.right > .section-content');
    const navLinks = document.querySelectorAll('.sidebar-menu a');
    const navbarHeight = 120; // Height of the navbar
    const scrollOffset = navbarHeight + 100; // Add 40px padding for better spacing

    function smoothScrollToTop(targetTop, durationMs) {
        const startTop = window.scrollY;
        const distance = targetTop - startTop;
        const startTime = performance.now();

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            const eased = easeOutCubic(progress);

            window.scrollTo(0, Math.round(startTop + distance * eased));

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    // The first link (Overview) starts active, on every page
    if (navLinks.length) {
        navLinks.forEach(link => link.classList.remove('active'));
        navLinks[0].classList.add('active');
    }

    // While a click is scrolling the page to its section, scroll-tracking waits
    let lockUntil = 0;
    let lockTimer = null;

    // Smooth scroll for menu items
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.querySelector(`.${targetId}`);
            
            if (targetSection) {
                const targetTop = Math.max(
                    0,
                    Math.round(targetSection.getBoundingClientRect().top + window.scrollY - scrollOffset)
                );

                if (window.lenis && typeof window.lenis.scrollTo === 'function') {
                    window.lenis.scrollTo(targetSection, {
                        offset: -scrollOffset,
                        duration: 1.2,
                        immediate: false,
                        force: true,
                        lock: true,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                } else {
                    smoothScrollToTop(targetTop, 700);
                }
                
                // Set active state on click, and hold it while the page scrolls there
                lockUntil = performance.now() + 1500;
                clearTimeout(lockTimer);
                lockTimer = setTimeout(updateActiveSection, 1550);
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Follow the page: the link of the section being read is the active one
    function updateActiveSection() {
        if (performance.now() < lockUntil) return;

        const triggerOffset = scrollOffset;
        let current = '';

        // At the bottom of the page the last section is the current one
        const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;

        const matchFor = section => Array.from(section.classList).find(cls =>
            Array.from(navLinks).some(link => link.getAttribute('href') === `#${cls}`)
        );

        if (isAtBottom) {
            for (let i = sections.length - 1; i >= 0; i--) {
                const match = matchFor(sections[i]);
                if (match) { current = match; break; }
            }
        } else {
            sections.forEach(section => {
                const match = matchFor(section);
                if (!match) return;

                const rect = section.getBoundingClientRect();
                if (rect.top <= triggerOffset && rect.bottom >= triggerOffset) {
                    current = match;
                }
            });
        }

        // Above the first section, the first link stays active
        if (!current && navLinks.length) {
            current = navLinks[0].getAttribute('href').substring(1);
            if (window.scrollY > 0 && sections.length && sections[0].getBoundingClientRect().top <= triggerOffset) {
                return; // between sections: keep whatever is active
            }
        }

        if (current) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href').substring(1) === current);
            });
        }
    }

    let ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                updateActiveSection();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    updateActiveSection();
});
