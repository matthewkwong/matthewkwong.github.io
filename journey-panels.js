// Expanding journey panels: the open step's bar fills, then the next step opens.
// Selecting the open step pauses or resumes; selecting another step opens it and plays.
(function () {
  document.querySelectorAll('.jr').forEach(function (root) {
    var cols = Array.prototype.slice.call(root.querySelectorAll('.jr-col'));
    var secs = parseFloat(root.dataset.seconds) || 4;
    var middle = parseFloat(root.dataset.middleMultiplier) || 1;
    var active = 0;
    var paused = false;

    function show(i) {
      active = i;
      // The middle step carries the longest caption, so it holds longer
      root.style.setProperty('--jr-dur', (i === 1 ? secs * middle : secs) + 's');
      cols.forEach(function (col, j) {
        var on = j === i;
        col.setAttribute('aria-pressed', on ? 'true' : 'false');
        // Showing them again restarts the bar fill and the caption fade
        col.classList.toggle('is-open', on);
        col.querySelector('.jr-bar').hidden = !on;
      });
    }

    function setPaused(p) {
      paused = p;
      root.classList.toggle('is-paused', p);
    }

    // Narrow (matches the 700px container query): every step is open, so the
    // columns stop acting as toggles and the timer is hidden by CSS
    var row = root.querySelector('.jr-row');
    var groupLabel = row.getAttribute('aria-label');
    var narrow = false;

    function setNarrow(n) {
      if (n === narrow) return;
      narrow = n;
      if (n) {
        row.setAttribute('aria-label', 'User journey steps');
        cols.forEach(function (col) {
          col.removeAttribute('aria-pressed');
          col.tabIndex = -1;
        });
      } else {
        row.setAttribute('aria-label', groupLabel);
        cols.forEach(function (col) { col.removeAttribute('tabindex'); });
        show(active);
      }
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(function () {
        setNarrow(root.clientWidth <= 700);
      }).observe(root);
    }

    cols.forEach(function (col, i) {
      col.addEventListener('click', function () {
        if (narrow) return;
        if (i === active) {
          setPaused(!paused);
        } else {
          setPaused(false);
          show(i);
        }
      });
      col.querySelector('.jr-bar').addEventListener('animationend', function () {
        show((active + 1) % cols.length);
      });
    });

    // Hold the timer while the gallery is off screen so it starts where the reader does
    if ('IntersectionObserver' in window) {
      root.classList.add('is-offscreen');
      new IntersectionObserver(function (entries) {
        root.classList.toggle('is-offscreen', !entries[0].isIntersecting);
      }, { threshold: 0.5 }).observe(root);
    }

    show(0);
  });
})();
