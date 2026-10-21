// Segmented control (.mk-seg) – a single-choice switch for the views of one media block.
//
//   <div class="mk-seg" role="radiogroup" data-controls="some-id" style="--mk-seg-count: 2; --mk-seg-index: 1;">
//     <span class="mk-seg__thumb" aria-hidden="true"></span>
//     <button class="mk-seg__item" role="radio" data-view="mobile">Mobile</button> ...
//   </div>
//   <div id="some-id">
//     <img data-view="mobile" hidden> <img data-view="desktop"> ...
//   </div>
//
// Picking a segment shows the element with the matching data-view and hides the rest.
// The selected fill is the thumb: design-system.css places it from --mk-seg-count (how
// many segments) and --mk-seg-index (which one is selected) and slides it between them.
// Write both in the markup so the control is right before this script runs; a control
// without them, or without a thumb, gets them here.
// A recording that is hidden is paused; one that is shown plays again. video-loader.js
// still fetches each recording the first time it is on screen.
(function () {
    function videosIn(el) {
        return el.tagName === 'VIDEO' ? [el] : Array.prototype.slice.call(el.querySelectorAll('video'));
    }

    document.querySelectorAll('.mk-seg[data-controls]').forEach(function (seg) {
        var host = document.getElementById(seg.dataset.controls);
        var items = Array.prototype.slice.call(seg.querySelectorAll('.mk-seg__item'));
        if (!host || !items.length) return;

        var views = Array.prototype.slice.call(host.querySelectorAll('[data-view]'));

        // The thumb, and where it starts: on the segment the markup marks as selected
        var checked = items.filter(function (item) {
            return item.getAttribute('aria-checked') === 'true';
        })[0] || items[0];
        seg.style.setProperty('--mk-seg-count', items.length);
        seg.style.setProperty('--mk-seg-index', items.indexOf(checked));
        if (!seg.querySelector('.mk-seg__thumb')) {
            var thumb = document.createElement('span');
            thumb.className = 'mk-seg__thumb';
            thumb.setAttribute('aria-hidden', 'true');
            seg.insertBefore(thumb, seg.firstChild);
        }

        function select(item, focus) {
            items.forEach(function (other) {
                var on = other === item;
                other.setAttribute('aria-checked', on ? 'true' : 'false');
                other.tabIndex = on ? 0 : -1;
            });
            seg.style.setProperty('--mk-seg-index', items.indexOf(item));

            views.forEach(function (view) {
                var show = view.dataset.view === item.dataset.view;
                view.hidden = !show;
                videosIn(view).forEach(function (video) {
                    if (!show) {
                        video.pause();
                    } else if (video.getAttribute('src')) {
                        var playing = video.play();
                        if (playing && playing.catch) playing.catch(function () {});
                    }
                });
            });

            if (focus) item.focus();
        }

        items.forEach(function (item, i) {
            item.addEventListener('click', function () {
                select(item, false);
            });

            item.addEventListener('keydown', function (e) {
                var step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1
                    : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
                if (!step) return;
                e.preventDefault();
                select(items[(i + step + items.length) % items.length], true);
            });
        });
    });
})();
