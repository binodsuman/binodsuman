/** Reusable search/filter/copy grid for command & prompt libraries */
function initCommandGrid(opts) {
    const {
        prefix,
        commands,
        categories,
        favKey,
        copyField = 'cmd',
        getCategoryLabel,
    } = opts;

    const favorites = new Set(JSON.parse(localStorage.getItem(favKey) || '[]'));
    let activeFilter = 'all';
    let searchQuery = '';

    const searchEl = document.getElementById(prefix + 'Search');
    const countEl = document.getElementById(prefix + 'Count');
    const tabsEl = document.getElementById(prefix + 'Tabs');
    const gridEl = document.getElementById(prefix + 'Grid');

    if (!gridEl) return;

    function showCopied(card) {
        card.classList.add('copied');
        setTimeout(() => card.classList.remove('copied'), 1500);
        const toast = document.getElementById('toolsToast');
        if (toast) {
            toast.textContent = 'Copied!';
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 1800);
        }
    }

    function getFiltered() {
        return commands.filter((p) => {
            if (activeFilter === 'favorites' && !favorites.has(p.id)) return false;
            if (activeFilter !== 'all' && activeFilter !== 'favorites' && p.category !== activeFilter) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const text = copyField === 'prompt' ? p.prompt : p.cmd;
                return text.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) ||
                    (p.cmd && p.cmd.toLowerCase().includes(q));
            }
            return true;
        });
    }

    function updateCounts() {
        tabsEl?.querySelectorAll('.prompt-filter-btn').forEach((btn) => {
            const id = btn.dataset.filter;
            let n;
            if (id === 'all') n = commands.length;
            else if (id === 'favorites') n = favorites.size;
            else n = commands.filter((p) => p.category === id).length;
            const badge = btn.querySelector('.tab-count');
            if (badge) badge.textContent = n;
        });
    }

    function renderFilters() {
        if (!tabsEl) return;
        const items = [{ id: 'all', name: 'All' }, { id: 'favorites', name: '★ Saved' }, ...categories];
        tabsEl.innerHTML = items.map((c) => {
            const count = c.id === 'all' ? commands.length
                : c.id === 'favorites' ? favorites.size
                : commands.filter((p) => p.category === c.id).length;
            return `<button type="button" class="prompt-filter-btn ${activeFilter === c.id ? 'active' : ''}" data-filter="${c.id}">${c.name} <span class="tab-count">${count}</span></button>`;
        }).join('');
        tabsEl.querySelectorAll('.prompt-filter-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                activeFilter = btn.dataset.filter;
                renderFilters();
                render();
            });
        });
    }

    function render() {
        const filtered = getFiltered();
        if (countEl) countEl.textContent = filtered.length;
        if (!filtered.length) {
            gridEl.innerHTML = '<div class="prompt-empty"><i class="fas fa-search"></i><p>No matches.</p></div>';
            return;
        }
        gridEl.innerHTML = filtered.map((p) => {
            const isFav = favorites.has(p.id);
            const title = p.cmd || p.name || '';
            const safeTitle = escapeHtml(title);
            const safeDesc = escapeHtml(p.desc);
            const safeCat = escapeHtml(getCategoryLabel(p.category));
            return `<article class="prompt-card" data-id="${p.id}">
                <div class="prompt-card-top">
                    <span class="prompt-cmd">${safeTitle}</span>
                    <button type="button" class="prompt-star ${isFav ? 'active' : ''}" aria-label="Save command" title="Save to this browser — persists after refresh">★</button>
                </div>
                <p class="prompt-desc">${safeDesc}</p>
                <div class="prompt-card-footer"><span class="prompt-cat-label">${safeCat}</span></div>
            </article>`;
        }).join('');

        gridEl.querySelectorAll('.prompt-card').forEach((card) => {
            const id = parseInt(card.dataset.id, 10);
            const item = commands.find((x) => x.id === id);
            card.addEventListener('click', (e) => {
                if (e.target.closest('.prompt-star')) return;
                const text = copyField === 'prompt' ? item.prompt : item.cmd;
                navigator.clipboard.writeText(text).then(() => showCopied(card));
            });
            card.querySelector('.prompt-star').addEventListener('click', (e) => {
                e.stopPropagation();
                const btn = e.target;
                if (favorites.has(id)) {
                    favorites.delete(id);
                    btn.classList.remove('active');
                } else {
                    favorites.add(id);
                    btn.classList.add('active');
                }
                localStorage.setItem(favKey, JSON.stringify([...favorites]));
                updateCounts();
                if (activeFilter === 'favorites') render();
            });
        });
    }

    searchEl?.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        render();
    });

    renderFilters();
    render();
}
