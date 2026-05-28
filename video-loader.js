const videos = document.querySelectorAll('video[data-src], video:has(source[data-src])');

const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const video = entry.target;

    if (video.dataset.src) {
        video.src = video.dataset.src;
    } else {
        video.querySelectorAll('source[data-src]').forEach(source => {
            source.src = source.dataset.src;
        });
    }
    video.preload = 'none';
    video.load();

    // Video will load but not autoplay - user must click play
    // To re-enable autoplay, uncomment the following lines:
    // video.play().catch(() => {
    //     // autoplay can fail silently, this is normal
    // });
    
    observer.unobserve(video);
});
}, {
rootMargin: '300px'
});

videos.forEach(video => observer.observe(video));
