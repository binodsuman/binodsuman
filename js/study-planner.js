/**
 * Study planner — stored in this browser only (localStorage).
 */
(function () {
    const KEY = 'bs-study-planner';
    const TITLE_MAX = 200;
    const COLLAPSED_DEFAULT = { week: true, later: true, done: true };
    const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const QUAD_LABELS = {
        ui: 'Urgent & important',
        ni: 'Not urgent & important',
        uu: 'Urgent & unimportant',
        nu: 'Not urgent & unimportant'
    };

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
    const dailyIn = document.getElementById('studyDaily');
    const noDateBtn = document.getElementById('studyNoDateBtn');
    const calEl = document.getElementById('studyCal');
    const calToggle = document.getElementById('studyCalToggle');
    const progressEl = document.getElementById('studyProgress');
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

    function monthStart(iso) {
        const [y, m] = iso.split('-').map(Number);
        return y + '-' + String(m).padStart(2, '0') + '-01';
    }

    function addMonths(iso, n) {
        const [y, m] = iso.split('-').map(Number);
        const dt = new Date(y, m - 1 + n, 1);
        return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-01';
    }

    function daysInMonth(iso) {
        const [y, m] = iso.split('-').map(Number);
        return new Date(y, m, 0).getDate();
    }

    function formatMonth(iso) {
        const [y, m] = iso.split('-').map(Number);
        return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }

    function isDaily(item) {
        return !!item.daily && !item.quad;
    }

    function dailyDoneOn(item, iso) {
        return Array.isArray(item.doneDates) && item.doneDates.indexOf(iso) !== -1;
    }

    function toggleDailyDone(item, iso) {
        if (!Array.isArray(item.doneDates)) item.doneDates = [];
        const i = item.doneDates.indexOf(iso);
        if (i >= 0) item.doneDates.splice(i, 1);
        else item.doneDates.push(iso);
    }

    function setTip(el, text) {
        if (!el || !text) return;
        el.setAttribute('data-tip', text);
        el.removeAttribute('title');
    }

    function normalizeDate(value) {
        if (!value) return null;
        const s = String(value).trim();
        const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
        return m ? m[1] : null;
    }

    function formatShort(iso) {
        if (!iso) return '';
        const [y, m, d] = iso.split('-').map(Number);
        if (!y || !m || !d) return iso;
        return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    }

    function formatDate(iso) {
        if (!iso) return '';
        const [y, m, d] = iso.split('-').map(Number);
        if (!y || !m || !d) return iso;
        const dt = new Date(y, m - 1, d);
        return dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function normalizeItem(it) {
        const quad = it.quad && QUAD_LABELS[it.quad] ? it.quad : null;
        const daily = !quad && !!it.daily;
        return {
            id: it.id || newId(),
            title: String(it.title || '').slice(0, TITLE_MAX),
            date: daily ? null : normalizeDate(it.date),
            daily: daily,
            doneDates: daily && Array.isArray(it.doneDates) ? it.doneDates.map(normalizeDate).filter(Boolean) : [],
            note: String(it.note || ''),
            href: String(it.href || ''),
            quad: quad,
            done: daily ? false : !!it.done,
            doneAt: daily ? null : (it.doneAt || null),
            createdAt: it.createdAt || Date.now()
        };
    }

    function load() {
        try {
            const raw = localStorage.getItem(KEY);
            if (!raw) return { v: 1, seeded: false, items: [] };
            const data = JSON.parse(raw);
            if (!data || !Array.isArray(data.items)) return { v: 1, seeded: false, items: [] };
            return { v: 1, seeded: !!data.seeded, items: data.items.map(normalizeItem).filter((it) => it.title) };
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
            daily: false,
            doneDates: [],
            note: '',
            href: s.href,
            quad: null,
            done: false,
            doneAt: null,
            createdAt: now
        }));
        state.seeded = true;
        save(state);
        return state;
    }

    function isMatrixOpen(item) {
        return !item.done && !!item.quad;
    }

    function bucket(item, today, weekStart, weekEnd) {
        if (item.done) return 'done';
        if (item.quad) return 'matrix';
        if (isDaily(item)) return 'daily';
        if (!item.date) return 'nodate';
        if (item.date <= today) return 'today';
        if (item.date >= weekStart && item.date <= weekEnd) return 'week';
        return 'later';
    }

    function matchesFilter(item, filter, today, weekStart, weekEnd) {
        if (isMatrixOpen(item)) return false;
        if (filter === 'all') return true;
        if (filter === 'done') return item.done;
        if (filter === 'daily') return !item.done && isDaily(item);
        if (filter === 'nodate') return !item.done && !item.date && !isDaily(item);
        if (filter === 'today') {
            if (isDaily(item)) return true;
            return !item.done && item.date && item.date <= today;
        }
        if (filter === 'week') {
            return !item.done && !isDaily(item) && item.date && item.date >= weekStart && item.date <= weekEnd;
        }
        return true;
    }

    let state = seedIfNeeded(load());
    let filter = 'all';
    let selectedDay = null;
    let calOpen = false;
    let calMonth = monthStart(todayStr());
    let dragItemId = null;
    const collapsed = Object.assign({}, COLLAPSED_DEFAULT);

    const dayIndex = Math.floor(Date.now() / 86400000) % SUGGEST.length;

    function setFilter(next) {
        filter = next;
        if (next !== 'day') selectedDay = null;
        if (next && next !== 'all' && next !== 'day') {
            Object.keys(collapsed).forEach((k) => { collapsed[k] = false; });
        }
        root.querySelectorAll('.study-filter').forEach((b) => {
            b.classList.toggle('is-active', b.getAttribute('data-filter') === next);
        });
    }

    function showAfterAdd(item) {
        const today = todayStr();
        const weekStart = startOfWeek(today);
        const weekEnd = addDays(weekStart, 6);
        const key = bucket(item, today, weekStart, weekEnd);
        setFilter('all');
        if (key !== 'matrix') collapsed[key] = false;
    }

    function addItem(title, date, href, quad, daily) {
        const t = String(title || '').trim().slice(0, TITLE_MAX);
        if (!t) return null;
        const isDailyItem = !quad && !!daily;
        const item = {
            id: newId(),
            title: t,
            date: quad || isDailyItem ? null : normalizeDate(date),
            daily: isDailyItem,
            doneDates: [],
            note: '',
            href: href || '',
            quad: quad && QUAD_LABELS[quad] ? quad : null,
            done: false,
            doneAt: null,
            createdAt: Date.now()
        };
        state.items.push(item);
        save(state);
        calOpen = false;
        showAfterAdd(item);
        render();
        return item;
    }

    function completeItem(it, done, viewDate) {
        if (isDaily(it)) {
            toggleDailyDone(it, viewDate || todayStr());
            save(state);
            render();
            return;
        }
        it.done = done;
        if (done) {
            it.doneAt = Date.now();
            if (!it.date) it.date = todayStr();
        } else {
            it.doneAt = null;
            if (it.quad) it.date = null;
        }
        save(state);
        if (done) collapsed.done = false;
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
            setTip(a, 'Open this topic');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'study-btn-ghost';
            btn.textContent = 'Add';
            setTip(btn, 'Add this topic to today');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem(s.title, todayStr(), s.href, null);
            });
            row.appendChild(a);
            row.appendChild(btn);
            suggestEl.appendChild(row);
        });
    }

    function moveToQuad(id, quad, beforeId) {
        if (!id || !QUAD_LABELS[quad]) return;
        const from = state.items.findIndex((x) => x.id === id);
        if (from < 0) return;
        const it = state.items[from];
        if (it.done || (it.quad === quad && (!beforeId || beforeId === id))) return;
        state.items.splice(from, 1);
        it.quad = quad;
        it.date = null;
        it.daily = false;
        let insertAt = state.items.length;
        if (beforeId && beforeId !== id) {
            const b = state.items.findIndex((x) => x.id === beforeId);
            if (b >= 0) insertAt = b;
        } else {
            let last = -1;
            state.items.forEach((x, i) => {
                if (!x.done && x.quad === quad) last = i;
            });
            insertAt = last >= 0 ? last + 1 : state.items.length;
        }
        state.items.splice(insertAt, 0, it);
        save(state);
        render();
    }

    function bindMatrixDnd() {
        document.querySelectorAll('.eisenhower-box').forEach((box) => {
            if (box.dataset.dndBound) return;
            box.dataset.dndBound = '1';
            box.addEventListener('dragover', (e) => {
                if (!dragItemId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                box.classList.add('is-drop-target');
            });
            box.addEventListener('dragleave', (e) => {
                if (e.relatedTarget && box.contains(e.relatedTarget)) return;
                box.classList.remove('is-drop-target');
            });
            box.addEventListener('drop', (e) => {
                e.preventDefault();
                box.classList.remove('is-drop-target');
                const form = box.querySelector('.eisenhower-add');
                const quad = form && form.getAttribute('data-quad');
                const over = e.target.closest('.study-item');
                const beforeId = over && box.contains(over) ? over.getAttribute('data-id') : null;
                const id = e.dataTransfer.getData('text/plain') || dragItemId;
                dragItemId = null;
                moveToQuad(id, quad, beforeId);
            });
        });
    }

    function renderMatrix() {
        bindMatrixDnd();
        Object.keys(QUAD_LABELS).forEach((quad) => {
            const el = document.querySelector('[data-quad-list="' + quad + '"]');
            if (!el) return;
            el.innerHTML = '';
            const list = state.items.filter((it) => !it.done && it.quad === quad);
            if (!list.length) {
                const p = document.createElement('p');
                p.className = 'eisenhower-empty';
                p.textContent = 'Drop a task here, or add one.';
                el.appendChild(p);
                return;
            }
            list.forEach((it) => el.appendChild(rowEl(it, true)));
        });
    }

    function datesWithTasks() {
        const set = {};
        state.items.forEach((it) => {
            if (it.quad || it.done || isDaily(it) || !it.date) return;
            set[it.date] = true;
        });
        return set;
    }

    function itemsForDay(iso) {
        const dated = state.items.filter((it) => !it.quad && !isDaily(it) && it.date === iso);
        const daily = state.items.filter((it) => !it.quad && isDaily(it));
        return dated.concat(daily);
    }

    function renderCalendar() {
        if (!calEl) return;
        if (calToggle) {
            calToggle.classList.toggle('is-open', calOpen);
            calToggle.setAttribute('aria-expanded', calOpen ? 'true' : 'false');
            const calHint = calOpen
                ? 'Hide the month calendar'
                : 'Show the month calendar. Click a day to list tasks for that date.';
            setTip(calToggle, calHint);
            calToggle.setAttribute('aria-label', calOpen ? 'Hide month calendar' : 'Show month calendar');
        }
        calEl.hidden = !calOpen;
        if (!calOpen) return;
        const today = todayStr();
        const marked = datesWithTasks();
        const [y, m] = calMonth.split('-').map(Number);
        const first = y + '-' + String(m).padStart(2, '0') + '-01';
        const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
        const count = daysInMonth(first);
        const prevCount = daysInMonth(addMonths(first, -1));

        calEl.innerHTML = '';
        const head = document.createElement('div');
        head.className = 'study-cal-head';
        const prev = document.createElement('button');
        prev.type = 'button';
        prev.className = 'study-cal-nav';
        prev.setAttribute('aria-label', 'Previous month');
        setTip(prev, 'Previous month');
        prev.textContent = '‹';
        prev.addEventListener('click', () => {
            calMonth = addMonths(calMonth, -1);
            render();
        });
        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'study-cal-nav';
        next.setAttribute('aria-label', 'Next month');
        setTip(next, 'Next month');
        next.textContent = '›';
        next.addEventListener('click', () => {
            calMonth = addMonths(calMonth, 1);
            render();
        });
        const title = document.createElement('strong');
        title.textContent = formatMonth(calMonth);
        head.appendChild(prev);
        head.appendChild(title);
        head.appendChild(next);
        calEl.appendChild(head);

        const wd = document.createElement('div');
        wd.className = 'study-cal-weekdays';
        WEEKDAYS.forEach((name) => {
            const s = document.createElement('span');
            s.textContent = name;
            wd.appendChild(s);
        });
        calEl.appendChild(wd);

        const grid = document.createElement('div');
        grid.className = 'study-cal-grid';
        const cells = [];
        for (let i = lead; i > 0; i--) {
            cells.push({ d: prevCount - i + 1, iso: addDays(first, -i), muted: true });
        }
        for (let d = 1; d <= count; d++) {
            const iso = y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            cells.push({ d: d, iso: iso, muted: false });
        }
        while (cells.length % 7) {
            const extra = cells.length - lead - count + 1;
            cells.push({ d: extra, iso: addDays(first, count + extra - 1), muted: true });
        }
        cells.forEach((cell) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'study-cal-cell';
            if (cell.muted) btn.classList.add('is-muted');
            if (cell.iso === today) btn.classList.add('is-today');
            if (selectedDay === cell.iso) btn.classList.add('is-selected');
            btn.textContent = String(cell.d);
            if (marked[cell.iso]) {
                const dot = document.createElement('span');
                dot.className = 'study-cal-dot';
                btn.appendChild(dot);
            }
            btn.setAttribute('aria-label', 'Show tasks for ' + formatDate(cell.iso));
            setTip(btn, marked[cell.iso]
                ? 'Show tasks for ' + formatDate(cell.iso) + ' (has dated tasks)'
                : 'Show tasks for ' + formatDate(cell.iso));
            btn.addEventListener('click', () => {
                selectedDay = cell.iso;
                filter = 'day';
                calMonth = monthStart(cell.iso);
                calOpen = false;
                root.querySelectorAll('.study-filter').forEach((b) => b.classList.remove('is-active'));
                render();
            });
            grid.appendChild(btn);
        });
        calEl.appendChild(grid);
    }

    function render() {
        renderMatrix();
        renderCalendar();
        if (!groupsEl) return;
        const today = todayStr();
        const weekStart = startOfWeek(today);
        const weekEnd = addDays(weekStart, 6);

        const weekItems = state.items.filter((it) => !it.quad && !isDaily(it) && it.date && it.date >= weekStart && it.date <= weekEnd);
        const weekDone = weekItems.filter((it) => it.done).length;
        if (progressEl) {
            progressEl.textContent = weekItems.length
                ? weekDone + '/' + weekItems.length + ' this week'
                : 'No dated items this week';
        }

        const weekBtn = root.querySelector('[data-filter="week"]');
        if (weekBtn) {
            setTip(weekBtn, 'Dated tasks from Monday ' + formatShort(weekStart) + ' through Sunday ' + formatShort(weekEnd) + ', including today.');
            weekBtn.textContent = 'This week · ' + formatShort(weekStart) + '–' + formatShort(weekEnd);
        }

        groupsEl.innerHTML = '';

        if (filter === 'day' && selectedDay) {
            const head = document.createElement('div');
            head.className = 'study-day-head';
            const strong = document.createElement('strong');
            strong.textContent = formatDate(selectedDay);
            const hint = document.createElement('span');
            hint.textContent = 'Dated tasks plus Daily';
            head.appendChild(strong);
            head.appendChild(hint);
            groupsEl.appendChild(head);
            const list = itemsForDay(selectedDay);
            if (!list.length) {
                const p = document.createElement('p');
                p.className = 'study-empty';
                p.textContent = 'No tasks on this date. Daily items appear here when you add them.';
                groupsEl.appendChild(p);
            } else {
            list.forEach((it) => groupsEl.appendChild(rowEl(it, false, selectedDay, isDaily(it) ? 'daily' : 'today')));
            }
            return;
        }

        const labels = {
            today: 'Today',
            week: 'This week · ' + formatShort(weekStart) + '–' + formatShort(weekEnd),
            later: 'Later',
            daily: 'Daily',
            nodate: 'No date',
            done: 'Completed'
        };
        const order = ['today', 'week', 'later', 'daily', 'nodate', 'done'];
        const buckets = { today: [], week: [], later: [], daily: [], nodate: [], done: [] };

        state.items.forEach((it) => {
            if (!matchesFilter(it, filter, today, weekStart, weekEnd)) return;
            let b = bucket(it, today, weekStart, weekEnd);
            if (b === 'matrix') return;
            if (filter === 'week' && b === 'today' && it.date >= weekStart) b = 'week';
            buckets[b].push(it);
        });

        let any = false;
        order.forEach((key) => {
            const list = buckets[key];
            const forceEmptyWeek = filter === 'week' && key === 'week' && !list.length;
            if (!list.length && !forceEmptyWeek) return;
            any = true;
            const group = document.createElement('div');
            group.className = 'study-group';
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'study-group-toggle';
            const open = filter !== 'all' || !collapsed[key];
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            setTip(btn, open ? 'Collapse this section' : 'Expand this section');
            btn.innerHTML = '<span>' + labels[key] + '</span><i class="fas fa-chevron-' + (open ? 'up' : 'down') + '"></i>';
            btn.addEventListener('click', () => {
                collapsed[key] = !collapsed[key];
                render();
            });
            group.appendChild(btn);
            if (open) {
                if (!list.length) {
                    const p = document.createElement('p');
                    p.className = 'study-empty';
                    p.textContent = 'No dated tasks this week.';
                    group.appendChild(p);
                } else {
                    list.forEach((it) => group.appendChild(rowEl(it, false, today, key)));
                }
            }
            groupsEl.appendChild(group);
        });
        if (!any) {
            const p = document.createElement('p');
            p.className = 'study-empty';
            p.textContent = filter === 'done'
                ? 'No completed items yet. Check a task off to move it here.'
                : 'Nothing here. Add a dated item, a daily task, or complete a matrix task.';
            groupsEl.appendChild(p);
        }
    }

    function rowEl(it, inMatrix, viewDate, groupKey) {
        const day = viewDate || todayStr();
        const row = document.createElement('div');
        const dailyChecked = isDaily(it) && dailyDoneOn(it, day);
        row.className = 'study-item' + (it.done || dailyChecked ? ' is-done' : '');

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = isDaily(it) ? dailyChecked : !!it.done;
        const cbHint = isDaily(it)
            ? (dailyChecked
                ? 'Uncheck to mark this daily task not done for this day'
                : 'Mark this daily task done for this day')
            : (it.done
                ? 'Uncheck to move this task back to open'
                : 'Mark done — moves this task to Completed');
        setTip(cb, cbHint);
        cb.setAttribute('aria-label', cbHint);
        cb.addEventListener('change', () => completeItem(it, cb.checked, day));

        const title = document.createElement('input');
        title.type = 'text';
        title.className = 'study-item-title';
        title.value = it.title;
        title.maxLength = TITLE_MAX;
        setTip(title, 'Edit task name');
        title.setAttribute('aria-label', 'Task name');
        title.addEventListener('change', () => {
            const t = title.value.trim().slice(0, TITLE_MAX);
            if (!t) {
                title.value = it.title;
                return;
            }
            it.title = t;
            save(state);
        });

        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'study-item-del';
        del.setAttribute('aria-label', 'Delete this task');
        setTip(del, 'Delete this task');
        del.innerHTML = '<i class="fas fa-trash-alt"></i>';
        del.addEventListener('click', () => {
            if (it.title && !confirm('Delete this item?')) return;
            state.items = state.items.filter((x) => x.id !== it.id);
            save(state);
            render();
        });

        if (inMatrix) {
            row.dataset.id = it.id;
            const handle = document.createElement('span');
            handle.className = 'study-item-drag';
            setTip(handle, 'Drag to move this task to another quadrant');
            handle.setAttribute('aria-hidden', 'true');
            handle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
            row.appendChild(handle);
            row.addEventListener('mousedown', (e) => {
                row.draggable = !e.target.closest('input, button, a');
            });
            row.addEventListener('dragstart', (e) => {
                if (!row.draggable) {
                    e.preventDefault();
                    return;
                }
                dragItemId = it.id;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', it.id);
                row.classList.add('is-dragging');
            });
            row.addEventListener('dragend', () => {
                row.draggable = false;
                row.classList.remove('is-dragging');
                dragItemId = null;
                document.querySelectorAll('.eisenhower-box.is-drop-target').forEach((b) => {
                    b.classList.remove('is-drop-target');
                });
            });
        }

        row.appendChild(cb);
        row.appendChild(title);

        if (inMatrix) {
            row.appendChild(del);
            return row;
        }

        if (isDaily(it)) {
            const meta = document.createElement('span');
            meta.className = 'study-item-meta';
            meta.textContent = 'Daily';
            setTip(meta, 'Repeats every day');
            row.appendChild(meta);
        } else {
            const readonly = !!it.done || groupKey === 'done';
            if (readonly) {
                const meta = document.createElement('span');
                meta.className = 'study-item-meta';
                meta.textContent = it.date ? formatDate(it.date) : 'No date';
                setTip(meta, 'Completed — date cannot be changed');
                row.appendChild(meta);
            } else {
                const wrap = document.createElement('span');
                wrap.className = 'study-item-datewrap';
                const shown = document.createElement('span');
                shown.className = 'study-item-meta';
                shown.textContent = it.date ? formatShort(it.date) : 'No date';
                const cal = document.createElement('span');
                cal.className = 'study-item-cal';
                const date = document.createElement('input');
                date.type = 'date';
                date.className = 'study-item-date';
                date.value = it.date || '';
                date.setAttribute('tabindex', '-1');
                date.setAttribute('aria-hidden', 'true');
                date.addEventListener('change', () => {
                    const next = normalizeDate(date.value);
                    it.date = next;
                    save(state);
                    if (!it.done) showAfterAdd(it);
                    render();
                });
                const calBtn = document.createElement('button');
                calBtn.type = 'button';
                calBtn.className = 'study-item-cal-btn';
                const calHint = it.date
                    ? 'Change the date of this task (now ' + formatDate(it.date) + ')'
                    : 'Give this task a date';
                setTip(calBtn, calHint);
                calBtn.setAttribute('aria-label', calHint);
                calBtn.innerHTML = '<i class="fas fa-calendar-alt" aria-hidden="true"></i>';
                calBtn.addEventListener('click', () => {
                    if (typeof date.showPicker === 'function') {
                        try {
                            date.showPicker();
                            return;
                        } catch (err) { /* fall through */ }
                    }
                    date.focus();
                    date.click();
                });
                cal.appendChild(date);
                cal.appendChild(calBtn);
                if (groupKey !== 'today') wrap.appendChild(shown);
                wrap.appendChild(cal);
                row.appendChild(wrap);
            }
        }
        row.appendChild(del);
        return row;
    }

    if (form && titleIn) {
        if (dateIn && !dateIn.value) dateIn.value = todayStr();
        function syncDailyUi() {
            if (!dateIn || !dailyIn) return;
            dateIn.disabled = !!dailyIn.checked;
        }
        if (dailyIn) dailyIn.addEventListener('change', syncDailyUi);
        syncDailyUi();
        function resetAddForm() {
            titleIn.value = '';
            if (dailyIn) dailyIn.checked = false;
            syncDailyUi();
            if (dateIn && !dateIn.value) dateIn.value = todayStr();
        }
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const daily = !!(dailyIn && dailyIn.checked);
            const dateVal = daily ? null : ((dateIn && dateIn.value) ? dateIn.value : todayStr());
            const added = addItem(titleIn.value, dateVal, '', null, daily);
            if (added) resetAddForm();
        });
        if (noDateBtn) {
            noDateBtn.addEventListener('click', () => {
                if (dailyIn) dailyIn.checked = false;
                syncDailyUi();
                const added = addItem(titleIn.value, null, '', null, false);
                if (added) resetAddForm();
            });
        }
    }

    document.querySelectorAll('.eisenhower-add').forEach((qform) => {
        qform.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = qform.querySelector('input[type="text"]');
            if (!input) return;
            const added = addItem(input.value, null, '', qform.getAttribute('data-quad'));
            if (added) input.value = '';
        });
    });

    root.querySelectorAll('.study-filter').forEach((btn) => {
        btn.addEventListener('click', () => {
            setFilter(btn.getAttribute('data-filter'));
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
                        items: data.items.map(normalizeItem).filter((it) => it.title)
                    };
                    save(state);
                    render();
                } catch (err) { /* ignore bad file */ }
            };
            reader.readAsText(file);
        });
    }

    if (calToggle) {
        calToggle.addEventListener('click', () => {
            calOpen = !calOpen;
            if (calOpen) calMonth = monthStart(selectedDay || todayStr());
            render();
        });
    }

    (function bindReminders() {
        const form = document.getElementById('studyRemindForm');
        if (!form) return;
        function attach() {
            const api = window.bsStudyReminders;
            if (!api || form.getAttribute('data-bound')) return;
            form.setAttribute('data-bound', '1');
            const onIn = document.getElementById('studyRemindOn');
            const soundIn = document.getElementById('studyRemindSound');
            const todayH = document.getElementById('studyRemindTodayH');
            const dailyH = document.getElementById('studyRemindDailyH');
            function fill() {
                const s = api.loadSettings();
                if (onIn) onIn.checked = s.enabled;
                if (soundIn) soundIn.checked = s.sound;
                if (todayH) todayH.value = String(s.todayHours);
                if (dailyH) dailyH.value = String(s.dailyHours);
            }
            fill();
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                api.saveSettings({
                    enabled: !!(onIn && onIn.checked),
                    sound: !!(soundIn && soundIn.checked),
                    todayHours: todayH ? todayH.value : 3,
                    dailyHours: dailyH ? dailyH.value : 1
                });
                fill();
            });
            const testToday = document.getElementById('studyRemindTestToday');
            const testDaily = document.getElementById('studyRemindTestDaily');
            if (testToday) testToday.addEventListener('click', () => api.test('today'));
            if (testDaily) testDaily.addEventListener('click', () => api.test('daily'));
        }
        if (window.bsStudyReminders) attach();
        else window.addEventListener('bs-study-reminders-ready', attach);
    })();

    (function bindHoverTips() {
        const tip = document.createElement('div');
        tip.className = 'study-tip';
        tip.setAttribute('role', 'tooltip');
        tip.hidden = true;
        document.body.appendChild(tip);
        function hide() {
            tip.hidden = true;
        }
        function show(el) {
            const text = el.getAttribute('data-tip');
            if (!text) return;
            tip.textContent = text;
            tip.hidden = false;
            const r = el.getBoundingClientRect();
            const tw = tip.offsetWidth;
            const th = tip.offsetHeight;
            let left = r.left + r.width / 2 - tw / 2;
            let top = r.bottom + 8;
            if (left < 8) left = 8;
            if (left + tw > window.innerWidth - 8) left = Math.max(8, window.innerWidth - tw - 8);
            if (top + th > window.innerHeight - 8) top = Math.max(8, r.top - th - 8);
            tip.style.left = left + 'px';
            tip.style.top = top + 'px';
        }
        document.addEventListener('mouseover', (e) => {
            const el = e.target.closest('[data-tip]');
            if (!el || !root.contains(el)) return;
            show(el);
        });
        document.addEventListener('mouseout', (e) => {
            const el = e.target.closest('[data-tip]');
            if (!el) return;
            const next = e.relatedTarget;
            if (next && (el.contains(next) || (next.closest && next.closest('[data-tip]') === el))) return;
            hide();
        });
        document.addEventListener('scroll', hide, true);
    })();

    renderSuggest();
    render();
})();
