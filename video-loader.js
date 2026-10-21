// Lazy-loads videos marked with data-src, and only keeps autoplay videos
// playing while they are on screen. Without the pause, every video the visitor
// has scrolled past keeps decoding in the background, which is what made long
// pages stutter and crash.

// Every video is watched so autoplay ones can be paused off screen; only videos
// marked with data-src are lazy-loaded.
const videos = document.querySelectorAll('video');

function loadVideo(video) {
    if (video.dataset.loaded) return;

    const lazySources = video.querySelectorAll('source[data-src]');
    // Nothing to lazy-load: the video already has a plain src.
    if (!video.dataset.src && !lazySources.length) return;
    video.dataset.loaded = 'true';

    if (video.dataset.src) {
        video.src = video.dataset.src;
    } else {
        lazySources.forEach(source => {
            source.src = source.dataset.src;
        });
    }
    video.preload = 'auto';
    video.load();
}

// Start downloading a little before the video scrolls into view.
const loadObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        loadVideo(entry.target);
        loadObserver.unobserve(entry.target);
    });
}, {
    rootMargin: '300px'
});

// Play only while some part of the video is actually visible.
const playObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target;

        if (entry.isIntersecting) {
            loadVideo(video);
            video.play().catch(() => {
                // autoplay can fail silently, this is normal
            });
        } else {
            video.pause();
        }
    });
});

videos.forEach(video => {
    loadObserver.observe(video);

    // Videos without the autoplay attribute are only lazy-loaded.
    if (!video.hasAttribute('autoplay')) return;

    // The observer decides when to play, not the browser.
    video.removeAttribute('autoplay');
    // iPhones only play a video in place (instead of fullscreen) when it is inline.
    video.playsInline = true;
    video.setAttribute('playsinline', '');

    playObserver.observe(video);
});
