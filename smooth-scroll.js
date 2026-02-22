// Use native scroll on touch devices (phones/tablets) so the page actually scrolls.
// Lenis can block touch scroll on some mobile browsers.
var isTouch =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

if (isTouch || typeof Lenis === 'undefined') {
    window.lenis = null;
} else {
    window.lenis = new Lenis({
        duration: 1.2,
        easing: function (t) {
            return Math.min(1, 1.001 - Math.pow(2, -10 * t));
        },
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        window.lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}
