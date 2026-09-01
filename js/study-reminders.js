/**
 * Study planner reminders — runs on any page with site-nav.
 * Reads localStorage only. Notifications + alarm default on until turned off.
 */
(function () {
    const PLAN_KEY = 'bs-study-planner';
    const SET_KEY = 'bs-study-reminders';
    const CHECK_MS = 30000;
    const TITLE_MAX = 3;

    const defaults = {
        enabled: true,
        sound: true,
        todayHours: 3,
        dailyHours: 1,
        lastToday: 0,
        lastDaily: 0
    };

    let audioCtx = null;
    let armed = false;

    function todayStr() {
        const d = new Date();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return d.getFullYear() + '-' + m + '-' + day;
    }

    function clampHours(n, fallback) {
        const x = Number(n);
        if (!isFinite(x) || x <= 0) return fallback;
        return Math.min(24, Math.max(0.25, Math.round(x * 4) / 4));
    }

    function loadSettings() {
        let s = Object.assign({}, defaults);
        try {
            const raw = localStorage.getItem(SET_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                if (data && typeof data === 'object') Object.assign(s, data);
            }
        } catch (e) { /* ignore */ }
        s.enabled = s.enabled !== false;
        s.sound = s.sound !== false;
        s.todayHours = clampHours(s.todayHours, 3);
        s.dailyHours = clampHours(s.dailyHours, 1);
        s.lastToday = Number(s.lastToday) || 0;
        s.lastDaily = Number(s.lastDaily) || 0;
        let persist = false;
        if (!s.lastToday) {
            s.lastToday = Date.now();
            persist = true;
        }
        if (!s.lastDaily) {
            s.lastDaily = Date.now();
            persist = true;
        }
        if (persist) saveSettings(s);
        return s;
    }

    function saveSettings(s) {
        try {
            localStorage.setItem(SET_KEY, JSON.stringify(s));
        } catch (e) { /* private mode */ }
    }

    function loadItems() {
        try {
            const raw = localStorage.getItem(PLAN_KEY);
            if (!raw) return [];
            const data = JSON.parse(raw);
            return data && Array.isArray(data.items) ? data.items : [];
        } catch (e) {
            return [];
        }
    }

    function isDaily(it) {
        return !!it.daily && !it.quad;
    }

    function dailyDoneOn(it, iso) {
        return Array.isArray(it.doneDates) && it.doneDates.indexOf(iso) !== -1;
    }

    function openToday(items, iso) {
        return items.filter(function (it) {
            return !it.done && !it.quad && !isDaily(it) && it.date && it.date <= iso;
        });
    }

    function openDaily(items, iso) {
        return items.filter(function (it) {
            return isDaily(it) && !dailyDoneOn(it, iso);
        });
    }

    function titles(list) {
        return list.slice(0, TITLE_MAX).map(function (it) {
            return String(it.title || '').slice(0, 80);
        }).filter(Boolean);
    }

    function unlockAudio() {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            if (!audioCtx) audioCtx = new Ctx();
            if (audioCtx.state === 'suspended') audioCtx.resume();
        } catch (e) { /* ignore */ }
    }

    function playAlarm() {
        unlockAudio();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const notes = [880, 1174, 880, 1174, 988];
        notes.forEach(function (freq, i) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            const t0 = now + i * 0.22;
            gain.gain.setValueAtTime(0.0001, t0);
            gain.gain.exponentialRampToValueAtTime(0.12, t0 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(t0);
            osc.stop(t0 + 0.2);
        });
    }

    function showToast(title, body) {
        let el = document.getElementById('bs-study-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'bs-study-toast';
            el.className = 'bs-study-toast';
            el.setAttribute('role', 'alert');
            document.body.appendChild(el);
        }
        el.hidden = false;
        el.innerHTML =
            '<p class="bs-study-toast-kicker">Study Planner</p>' +
            '<strong>' + escapeHtml(title) + '</strong>' +
            '<span>' + escapeHtml(body) + '</span>' +
            '<div class="bs-study-toast-actions">' +
            '<button type="button" class="bs-study-toast-open">Open planner</button>' +
            '<button type="button" class="bs-study-toast-dismiss">Dismiss</button>' +
            '</div>';
        const openBtn = el.querySelector('.bs-study-toast-open');
        const dismissBtn = el.querySelector('.bs-study-toast-dismiss');
        if (openBtn) {
            openBtn.onclick = function (e) {
                e.stopPropagation();
                el.hidden = true;
                window.location.href = '/study-planner/';
            };
        }
        if (dismissBtn) {
            dismissBtn.onclick = function (e) {
                e.stopPropagation();
                el.hidden = true;
            };
        }
        el.onclick = function () {
            el.hidden = true;
            window.location.href = '/study-planner/';
        };
        clearTimeout(showToast._t);
        showToast._t = setTimeout(function () { el.hidden = true; }, 20000);
    }

    function osNotify(title, body, kind) {
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
        var opts = {
            body: body,
            tag: 'bs-study-' + kind,
            requireInteraction: true,
            icon: '/image/binod_suman.png',
            badge: '/image/binod_suman.png'
        };
        function pageNote() {
            try {
                var note = new Notification(title, opts);
                note.onclick = function () {
                    window.focus();
                    window.location.href = '/study-planner/';
                    note.close();
                };
            } catch (e) { /* on-page card still shows */ }
        }
        if (!('serviceWorker' in navigator)) {
            pageNote();
            return;
        }
        navigator.serviceWorker.ready.then(function (reg) {
            if (reg && typeof reg.showNotification === 'function') {
                return reg.showNotification(title, opts);
            }
            pageNote();
        }).catch(pageNote);
    }

    function registerReminderSw() {
        if (!('serviceWorker' in navigator)) return;
        navigator.serviceWorker.register('/study-reminders-sw.js').catch(function () { /* ignore */ });
    }

    function notify(kind, list) {
        const n = list.length;
        if (!n) return;
        const label = kind === 'today' ? 'Today' : 'Daily';
        const extra = n > TITLE_MAX ? ' (+' + (n - TITLE_MAX) + ' more)' : '';
        const title = label + ' study reminder';
        const body = titles(list).join(' · ') + extra;
        showToast(title, body);
        osNotify(title, body, kind);
        const s = loadSettings();
        if (s.sound) playAlarm();
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function maybeAskPermission() {
        if (typeof Notification === 'undefined') return;
        const s = loadSettings();
        if (!s.enabled) {
            hidePermBanner();
            return;
        }
        if (Notification.permission === 'granted' || Notification.permission === 'denied') {
            hidePermBanner();
            return;
        }
        showPermBanner();
    }

    function hidePermBanner() {
        const el = document.getElementById('bs-study-perm');
        if (el) el.hidden = true;
    }

    function showPermBanner() {
        let el = document.getElementById('bs-study-perm');
        if (!el) {
            el = document.createElement('div');
            el.id = 'bs-study-perm';
            el.className = 'bs-study-perm';
            el.innerHTML = '<p>Allow laptop notifications for Study Planner reminders (sound is already on).</p>' +
                '<button type="button" class="bs-study-perm-ok">Allow</button>' +
                '<button type="button" class="bs-study-perm-later">Later</button>';
            document.body.appendChild(el);
            el.querySelector('.bs-study-perm-ok').addEventListener('click', function () {
                Notification.requestPermission().then(function () {
                    hidePermBanner();
                    unlockAudio();
                });
            });
            el.querySelector('.bs-study-perm-later').addEventListener('click', hidePermBanner);
        }
        el.hidden = false;
    }

    function tick() {
        const s = loadSettings();
        if (!s.enabled) return;
        const items = loadItems();
        const iso = todayStr();
        const now = Date.now();
        const todayMs = s.todayHours * 3600000;
        const dailyMs = s.dailyHours * 3600000;
        const todayList = openToday(items, iso);
        const dailyList = openDaily(items, iso);
        let changed = false;
        if (todayList.length && now - s.lastToday >= todayMs) {
            s.lastToday = now;
            changed = true;
            notify('today', todayList);
        }
        if (dailyList.length && now - s.lastDaily >= dailyMs) {
            s.lastDaily = now;
            changed = true;
            notify('daily', dailyList);
        }
        if (changed) saveSettings(s);
    }

    function arm() {
        if (armed) return;
        armed = true;
        unlockAudio();
        maybeAskPermission();
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission().then(hidePermBanner);
        }
    }

    document.addEventListener('pointerdown', arm, { once: true, capture: true });
    document.addEventListener('keydown', arm, { once: true, capture: true });

    window.addEventListener('storage', function (e) {
        if (e.key === SET_KEY || e.key === PLAN_KEY) maybeAskPermission();
    });
    window.addEventListener('bs-study-reminders-change', maybeAskPermission);

    setInterval(tick, CHECK_MS);
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') tick();
    });

    maybeAskPermission();
    registerReminderSw();
    tick();

    window.bsStudyReminders = {
        loadSettings: loadSettings,
        saveSettings: function (partial) {
            const s = Object.assign(loadSettings(), partial);
            s.todayHours = clampHours(s.todayHours, 3);
            s.dailyHours = clampHours(s.dailyHours, 1);
            s.enabled = !!s.enabled;
            s.sound = !!s.sound;
            saveSettings(s);
            window.dispatchEvent(new Event('bs-study-reminders-change'));
            maybeAskPermission();
            return s;
        },
        test: function (kind) {
            arm();
            const iso = todayStr();
            const items = loadItems();
            const list = kind === 'daily' ? openDaily(items, iso) : openToday(items, iso);
            notify(kind === 'daily' ? 'daily' : 'today', list.length ? list : [{ title: 'No open tasks — this is a test alarm' }]);
        }
    };
    window.dispatchEvent(new Event('bs-study-reminders-ready'));
})();
