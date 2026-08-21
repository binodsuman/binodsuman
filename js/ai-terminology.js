(function () {
    const IMG_BASE = '/image/ai-terminology/';
    const slides = AI_TERMINOLOGY_SLIDES;
    const total = slides.length;

    const els = {
        image: document.getElementById('deckImage'),
        title: document.getElementById('deckTitle'),
        counter: document.getElementById('deckCounter'),
        progress: document.getElementById('deckProgressBar'),
        thumbs: document.getElementById('deckThumbs'),
        prev: document.getElementById('deckPrev'),
        next: document.getElementById('deckNext'),
        prevHit: document.getElementById('deckPrevHit'),
        nextHit: document.getElementById('deckNextHit'),
        max: document.getElementById('deckMax'),
        maxIcon: document.getElementById('deckMaxIcon')
    };

    let index = 0;
    let maximized = false;

    function parseHash() {
        const m = location.hash.match(/slide-(\d+)/i);
        if (!m) return 0;
        const n = parseInt(m[1], 10);
        if (n >= 1 && n <= total) return n - 1;
        return 0;
    }

    function setMaximized(on) {
        maximized = on;
        document.body.classList.toggle('deck-maximized', on);
        els.max.setAttribute('aria-pressed', on ? 'true' : 'false');
        els.max.setAttribute('aria-label', on ? 'Minimize slide' : 'Maximize slide');
        els.max.title = on ? 'Minimize' : 'Maximize';
        els.maxIcon.className = on ? 'fas fa-compress' : 'fas fa-expand';
    }

    function preload(i) {
        if (i < 0 || i >= total) return;
        const img = new Image();
        img.src = IMG_BASE + slides[i].file;
    }

    function go(i, { updateHash = true } = {}) {
        index = Math.max(0, Math.min(total - 1, i));
        const slide = slides[index];
        els.image.src = IMG_BASE + slide.file;
        els.image.alt = slide.title;
        els.title.textContent = slide.title;
        els.counter.textContent = `${index + 1} / ${total}`;
        els.progress.style.width = `${((index + 1) / total) * 100}%`;

        const atStart = index === 0;
        const atEnd = index === total - 1;
        [els.prev, els.prevHit].forEach((el) => { el.disabled = atStart; });
        [els.next, els.nextHit].forEach((el) => { el.disabled = atEnd; });

        els.thumbs.querySelectorAll('.deck-thumb').forEach((btn, n) => {
            btn.classList.toggle('active', n === index);
        });
        els.thumbs.querySelector('.deck-thumb.active')?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });

        if (updateHash) {
            history.replaceState(null, '', `#slide-${index + 1}`);
        }

        preload(index + 1);
        preload(index - 1);
    }

    function renderThumbs() {
        els.thumbs.innerHTML = slides.map((s, i) => (
            `<button type="button" class="deck-thumb" data-index="${i}" aria-label="Slide ${i + 1}: ${s.title}">` +
            `<img src="${IMG_BASE}${s.file}" alt="" loading="lazy"></button>`
        )).join('');
    }

    els.prev.addEventListener('click', () => go(index - 1));
    els.next.addEventListener('click', () => go(index + 1));
    els.prevHit.addEventListener('click', () => go(index - 1));
    els.nextHit.addEventListener('click', () => go(index + 1));
    els.max.addEventListener('click', () => setMaximized(!maximized));
    els.image.addEventListener('dblclick', () => setMaximized(!maximized));

    els.thumbs.addEventListener('click', (e) => {
        const btn = e.target.closest('.deck-thumb');
        if (!btn) return;
        go(Number(btn.dataset.index));
    });

    document.addEventListener('keydown', (e) => {
        if (e.target.matches('input, textarea')) return;
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
            e.preventDefault();
            go(index + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            e.preventDefault();
            go(index - 1);
        } else if (e.key === 'Home') {
            e.preventDefault();
            go(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            go(total - 1);
        } else if (e.key === 'Escape' && maximized) {
            e.preventDefault();
            setMaximized(false);
        } else if (e.key === 'f' || e.key === 'F' || e.key === 'm' || e.key === 'M') {
            e.preventDefault();
            setMaximized(!maximized);
        }
    });

    window.addEventListener('hashchange', () => go(parseHash(), { updateHash: false }));

    renderThumbs();
    go(parseHash(), { updateHash: true });
})();
