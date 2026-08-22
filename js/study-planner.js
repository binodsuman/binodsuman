/**
 * Study planner — stored in this browser only (localStorage).
 */
(function () {
    const KEY = 'bs-study-planner';
    const TITLE_MAX = 200;
    const COLLAPSED_DEFAULT = { week: true, later: true, done: true };

    const CATALOG = [
        { title: 'System Design hub', href: '/cheat-sheets/system-design/' },
        { title: 'CAP theorem', href: '/cheat-sheets/system-design/core/cap-theorem/' },
        { title: 'DSA patterns', href: '/cheat-sheets/dsa/patterns/' },
        { title: 'AI study hub', href: '/cheat-sheets/ai/' },
        { title: 'JSON formatter (Tools)', href: '/tools/' },
        { title: 'Watch latest videos', href: '/#latest-videos' }
    ];

    const SUGGEST = [
        { title: 'System Design Fundamentals', href: 'https://binodtech.com/learn/system-design/fundamentals' },
        { title: 'Design URL Shortener', href: 'https://binodtech.com/learn/system-design/url-shortener' },
        { title: 'Design Rate Limiter', href: 'https://binodtech.com/learn/system-design/rate-limiter' },
        { title: 'DSA Patterns Overview', href: 'https://binodtech.com/learn/dsa/patterns-intro' },
        { title: 'RAG Fundamentals', href: 'https://binodtech.com/learn/ai-engineering/rag-fundamentals' },
        { title: 'Prompt Engineering Basics', href: 'https://binodtech.com/learn/ai-engineering/prompt-engineering' },
        { title: 'Apache Kafka Basics', href: 'https://binodtech.com/learn/data-cloud/kafka-basics' },
        { title: 'STAR Method Mastery', href: 'https://binodtech.com/learn/behavioral/star-method' },
        { title: 'Java Core Concepts', href: 'https://binodtech.com/learn/java/java-core' }
    ];

    const STARTERS = [
        { title: 'Watch a latest video', date: null, href: '/#latest-videos' },
        { title: 'One system design cheat sheet', date: null, href: '/cheat-sheets/system-design/core/cap-theorem/' },
        { title: 'Format JSON in Dev Tools', date: null, href: '/tools/' }
    ];

    const root = document.getElementById('study-list');
    if (!root) return;

    const groupsEl = document.getElementById('studyGroups');
    const form = document.getElementById('studyAddForm');
    const titleIn = document.getElementById('studyTitle');
    const dateIn = document.getElementById('studyDate');
    const quick = document.getElementById('studyQuickAdd');
    const progressEl = document.getElementById('studyProgress');
    const revisionEl = document.getElementById('studyRevision');
    const suggestEl = document.getElementById('studySuggest');
    const importInput = document.getElementById('studyImport');

    function newId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
        return 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    }

    function todayStr() {
        const d = new Date();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return d.getFullYear() + '-' + m + '-' + day;
    }

    function startOfWeek(iso) {
        const [y, m, d] = iso.split('-').map(Number);
        const dt = new Date(y, m - 1, d);
        const day = (dt.getDay() + 6) % 7;
        dt.setDate(dt.getDate() - day);
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const dd = String(dt.getDate()).padStart(2, '0');
        return dt.getFullYear() + '-' + mm + '-' + dd;
    }

    function addDays(iso, n) {
        const [y, m, d] = iso.split('-').map(Number);
        const dt = new Date(y, m - 1, d + n);
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const dd = String(dt.getDate()).padStart(2, '0');
        return dt.getFullYear() + '-' + mm + '-' + dd;
    }

    function load() {
        try {
            const raw = localStorage.getItem(KEY);
            if (!raw) return { v: 1, seeded: false, items: [] };
            const data = JSON.parse(raw);
            if (!data || !Array.isArray(data.items)) return { v: 1, seeded: false, items: [] };
            return { v: 1, seeded: !!data.seeded, items: data.items };
        } catch (e) {
            return { v: 1, seeded: false, items: [] };
        }
    }

    function save(state) {
        try {
            localStorage.setItem(KEY, JSON.stringify({ v: 1, seeded: state.seeded, items: state.items }));
        } catch (e) { /* private mode */ }
    }

    function seedIfNeeded(state) {
        if (state.seeded) return state;
        const now = Date.now();
        state.items = STARTERS.map((s) => ({
            id: newId(),
            title: s.title,
            date: s.date,
            note: '',
            href: s.href,
            done: false,
            doneAt: null,
            createdAt: now
        }));
        state.seeded = true;
        save(state);
        return state;
    }

    function bucket(item, today, weekStart, weekEnd) {
        if (item.done) return 'done';
        if (!item.date) return 'nodate';
        if (item.date <= today) return 'today';
        if (item.date >= weekStart && item.date <= weekEnd) return 'week';
        return 'later';
    }

    function matchesFilter(item, filter, today, weekStart, weekEnd) {
        if (filter === 'all') return true;
        if (filter === 'done') return item.done;
        if (filter === 'nodate') return !item.done && !item.date;
        if (filter === 'today') return !item.done && item.date && item.date <= today;
        if (filter === 'week') {
            return !item.done && item.date && item.date >= weekStart && item.date <= weekEnd;
        }
        return true;
    }

    let state = seedIfNeeded(load());
    let filter = 'all';
    const collapsed = Object.assign({}, COLLAPSED_DEFAULT);

    if (quick) {
        CATALOG.forEach((c, i) => {
            const opt = document.createElement('option');
            opt.value = String(i);
            opt.textContent = c.title;
            quick.appendChild(opt);
        });
    }

    const dayIndex = Math.floor(Date.now() / 86400000) % SUGGEST.length;
    const todayTopic = SUGGEST[dayIndex];
    if (revisionEl) {
        revisionEl.innerHTML = 'Today’s revision: <a href="' + todayTopic.href + '" target="_blank" rel="noopener noreferrer">' + todayTopic.title + '</a>';
    }

    function addItem(title, date, href) {
        const t = String(title || '').trim().slice(0, TITLE_MAX);
        if (!t) return;
        state.items.push({
            id: newId(),
            title: t,
            date: date || null,
            note: '',
            href: href || '',
            done: false,
            doneAt: null,
            createdAt: Date.now()
        });
        save(state);
        render();
    }

    function renderSuggest() {
        if (!suggestEl) return;
        suggestEl.innerHTML = '';
        const ordered = SUGGEST.slice(dayIndex).concat(SUGGEST.slice(0, dayIndex));
        ordered.forEach((s) => {
            const row = document.createElement('div');
            row.className = 'study-suggest-row';
            const a = document.createElement('a');
            a.href = s.href;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = s.title;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'study-btn-ghost';
            btn.textContent = 'Add';
            btn.addEventListener('click', () => addItem(s.title, todayStr(), s.href));
            row.appendChild(a);
            row.appendChild(btn);
            suggestEl.appendChild(row);
        });
    }

    function render() {
        if (!groupsEl) return;
        const today = todayStr();
        const weekStart = startOfWeek(today);
        const weekEnd = addDays(weekStart, 6);

        const weekItems = state.items.filter((it) => it.date && it.date >= weekStart && it.date <= weekEnd);
        const weekDone = weekItems.filter((it) => it.done).length;
        if (progressEl) {
            progressEl.textContent = weekItems.length
                ? weekDone + '/' + weekItems.length + ' this week'
                : 'No dated items this week';
        }

        const labels = {
            today: 'Today',
            week: 'This week',
            later: 'Later',
            nodate: 'No date',
            done: 'Done'
        };
        const order = ['today', 'week', 'later', 'nodate', 'done'];
        const buckets = { today: [], week: [], later: [], nodate: [], done: [] };

        state.items.forEach((it) => {
            if (!matchesFilter(it, filter, today, weekStart, weekEnd)) return;
            buckets[bucket(it, today, weekStart, weekEnd)].push(it);
        });

        groupsEl.innerHTML = '';
        let any = false;
        order.forEach((key) => {
            const list = buckets[key];
            if (!list.length) return;
            any = true;
            const group = document.createElement('div');
            group.className = 'study-group';
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'study-group-toggle';
            const open = !collapsed[key];
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            btn.innerHTML = '<span>' + labels[key] + '</span><i class="fas fa-chevron-' + (open ? 'up' : 'down') + '"></i>';
            btn.addEventListener('click', () => {
                collapsed[key] = !collapsed[key];
                render();
            });
            group.appendChild(btn);
            if (open) {
                list.forEach((it) => group.appendChild(rowEl(it)));
            }
            groupsEl.appendChild(group);
        });
        if (!any) {
            const p = document.createElement('p');
            p.className = 'study-empty';
            p.textContent = 'Nothing here. Add what you want to study — with a date or as a backlog.';
            groupsEl.appendChild(p);
        }
    }

    function rowEl(it) {
        const row = document.createElement('div');
        row.className = 'study-item' + (it.done ? ' is-done' : '');

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!it.done;
        cb.setAttribute('aria-label', 'Mark done');
        cb.addEventListener('change', () => {
            it.done = cb.checked;
            it.doneAt = it.done ? Date.now() : null;
            save(state);
            render();
        });

        const title = document.createElement('input');
        title.type = 'text';
        title.className = 'study-item-title';
        title.value = it.title;
        title.maxLength = TITLE_MAX;
        title.addEventListener('change', () => {
            const t = title.value.trim().slice(0, TITLE_MAX);
            if (!t) {
                title.value = it.title;
                return;
            }
            it.title = t;
            save(state);
        });

        const date = document.createElement('input');
        date.type = 'date';
        date.className = 'study-item-date';
        date.value = it.date || '';
        date.setAttribute('aria-label', 'Date');
        date.addEventListener('change', () => {
            it.date = date.value || null;
            save(state);
            render();
        });

        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'study-item-del';
        del.setAttribute('aria-label', 'Delete');
        del.innerHTML = '<i class="fas fa-trash-alt"></i>';
        del.addEventListener('click', () => {
            if (it.title && !confirm('Delete this item?')) return;
            state.items = state.items.filter((x) => x.id !== it.id);
            save(state);
            render();
        });

        row.appendChild(cb);
        row.appendChild(title);
        row.appendChild(date);
        if (it.href) {
            const a = document.createElement('a');
            a.className = 'study-item-link';
            a.href = it.href;
            a.textContent = 'Open';
            if (/^https?:\/\//i.test(it.href)) {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            }
            row.appendChild(a);
        } else {
            row.appendChild(document.createElement('span'));
        }
        row.appendChild(del);
        return row;
    }

    if (form && titleIn) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let href = '';
            if (quick && quick.value !== '') href = CATALOG[Number(quick.value)].href || '';
            addItem(titleIn.value, dateIn && dateIn.value ? dateIn.value : null, href);
            titleIn.value = '';
            if (dateIn) dateIn.value = '';
            if (quick) quick.value = '';
        });
    }

    if (quick && titleIn) {
        quick.addEventListener('change', () => {
            if (quick.value === '') return;
            const c = CATALOG[Number(quick.value)];
            if (c && !titleIn.value.trim()) titleIn.value = c.title;
        });
    }

    root.querySelectorAll('.study-filter').forEach((btn) => {
        btn.addEventListener('click', () => {
            filter = btn.getAttribute('data-filter');
            root.querySelectorAll('.study-filter').forEach((b) => b.classList.toggle('is-active', b === btn));
            render();
        });
    });

    const clearBtn = document.getElementById('studyClearDone');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const n = state.items.filter((it) => it.done).length;
            if (!n) return;
            if (!confirm('Remove ' + n + ' completed item(s)?')) return;
            state.items = state.items.filter((it) => !it.done);
            save(state);
            render();
        });
    }

    const exportBtn = document.getElementById('studyExport');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const blob = new Blob([JSON.stringify({ v: 1, seeded: true, items: state.items }, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'binodsuman-study-list.json';
            a.click();
            URL.revokeObjectURL(a.href);
        });
    }

    const importBtn = document.getElementById('studyImportBtn');
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', () => {
            const file = importInput.files && importInput.files[0];
            importInput.value = '';
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data = JSON.parse(String(reader.result));
                    if (!data || !Array.isArray(data.items)) return;
                    state = {
                        v: 1,
                        seeded: true,
                        items: data.items.map((it) => ({
                            id: it.id || newId(),
                            title: String(it.title || '').slice(0, TITLE_MAX),
                            date: it.date || null,
                            note: String(it.note || ''),
                            href: String(it.href || ''),
                            done: !!it.done,
                            doneAt: it.doneAt || null,
                            createdAt: it.createdAt || Date.now()
                        })).filter((it) => it.title)
                    };
                    save(state);
                    render();
                } catch (err) { /* ignore bad file */ }
            };
            reader.readAsText(file);
        });
    }

    renderSuggest();
    render();
})();
