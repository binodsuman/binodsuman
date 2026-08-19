(function () {
    const toast = document.getElementById('toolsToast');

    function showToast(msg) {
        toast.textContent = msg || 'Copied!';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1800);
    }

    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            showToast('Copied to clipboard');
        } catch {
            showToast('Copy failed');
        }
    }

    function setStatus(el, ok, msg) {
        el.className = 'tools-status ' + (ok ? 'ok' : 'err');
        el.textContent = msg;
    }

    function b64urlDecode(str) {
        let s = str.replace(/-/g, '+').replace(/_/g, '/');
        const pad = s.length % 4;
        if (pad) s += '='.repeat(4 - pad);
        const binary = atob(s);
        try {
            return decodeURIComponent(
                binary.split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
            );
        } catch {
            return binary;
        }
    }

    function prettyJson(obj) {
        return JSON.stringify(obj, null, 2);
    }

    /* Tabs + hash routing */
    const tabs = document.querySelectorAll('.tools-tab');
    const panels = document.querySelectorAll('.tools-panel');

    function activate(id) {
        tabs.forEach((t) => t.classList.toggle('active', t.dataset.tool === id));
        panels.forEach((p) => p.classList.toggle('active', p.id === 'panel-' + id));
        if (history.replaceState) {
            history.replaceState(null, '', '#' + id);
        }
    }

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => activate(tab.dataset.tool));
    });

    const hash = (location.hash || '#json').replace('#', '');
    const valid = [...tabs].some((t) => t.dataset.tool === hash);
    activate(valid ? hash : 'json');

    /* JSON */
    const jsonIn = document.getElementById('jsonIn');
    const jsonOut = document.getElementById('jsonOut');
    const jsonStatus = document.getElementById('jsonStatus');

    function formatJson(minify) {
        try {
            const parsed = JSON.parse(jsonIn.value);
            jsonOut.value = minify ? JSON.stringify(parsed) : prettyJson(parsed);
            setStatus(jsonStatus, true, 'Valid JSON');
        } catch (e) {
            jsonOut.value = '';
            setStatus(jsonStatus, false, e.message);
        }
    }

    document.getElementById('jsonFormat')?.addEventListener('click', () => formatJson(false));
    document.getElementById('jsonMinify')?.addEventListener('click', () => formatJson(true));
    document.getElementById('jsonValidate')?.addEventListener('click', () => {
        try {
            JSON.parse(jsonIn.value);
            setStatus(jsonStatus, true, 'Valid JSON');
        } catch (e) {
            setStatus(jsonStatus, false, e.message);
        }
    });
    document.getElementById('jsonCopy')?.addEventListener('click', () => copyText(jsonOut.value || jsonIn.value));
    document.getElementById('jsonClear')?.addEventListener('click', () => {
        jsonIn.value = '';
        jsonOut.value = '';
        jsonStatus.textContent = '';
        jsonStatus.className = 'tools-status';
    });

    /* JWT */
    const jwtIn = document.getElementById('jwtIn');
    const jwtHeader = document.getElementById('jwtHeader');
    const jwtPayload = document.getElementById('jwtPayload');
    const jwtMeta = document.getElementById('jwtMeta');
    const jwtStatus = document.getElementById('jwtStatus');

    function decodeJwt() {
        const raw = jwtIn.value.trim();
        if (!raw) {
            jwtHeader.textContent = '';
            jwtPayload.textContent = '';
            jwtMeta.textContent = '';
            jwtStatus.textContent = '';
            return;
        }
        const parts = raw.split('.');
        if (parts.length < 2) {
            setStatus(jwtStatus, false, 'Not a JWT — expected header.payload.signature');
            return;
        }
        try {
            const header = JSON.parse(b64urlDecode(parts[0]));
            const payload = JSON.parse(b64urlDecode(parts[1]));
            jwtHeader.textContent = prettyJson(header);
            jwtPayload.textContent = prettyJson(payload);
            const bits = [];
            if (payload.exp) {
                const exp = new Date(payload.exp * 1000);
                bits.push('exp: ' + exp.toISOString() + (Date.now() > exp.getTime() ? ' (expired)' : ' (valid)'));
            }
            if (payload.iat) bits.push('iat: ' + new Date(payload.iat * 1000).toISOString());
            if (payload.iss) bits.push('iss: ' + payload.iss);
            if (payload.sub) bits.push('sub: ' + payload.sub);
            jwtMeta.replaceChildren();
            bits.forEach((b) => {
                const span = document.createElement('span');
                span.textContent = b;
                jwtMeta.appendChild(span);
            });
            setStatus(jwtStatus, true, 'Decoded locally — signature is not verified');
        } catch (e) {
            setStatus(jwtStatus, false, 'Could not decode: ' + e.message);
        }
    }

    document.getElementById('jwtDecode')?.addEventListener('click', decodeJwt);
    jwtIn?.addEventListener('input', decodeJwt);
    document.getElementById('jwtCopy')?.addEventListener('click', () => copyText(jwtPayload.textContent));

    /* Base64 */
    const b64In = document.getElementById('b64In');
    const b64Out = document.getElementById('b64Out');
    const b64Status = document.getElementById('b64Status');

    document.getElementById('b64Encode')?.addEventListener('click', () => {
        try {
            b64Out.value = btoa(unescape(encodeURIComponent(b64In.value)));
            setStatus(b64Status, true, 'Encoded');
        } catch (e) {
            setStatus(b64Status, false, e.message);
        }
    });
    document.getElementById('b64Decode')?.addEventListener('click', () => {
        try {
            b64Out.value = decodeURIComponent(escape(atob(b64In.value.trim())));
            setStatus(b64Status, true, 'Decoded');
        } catch (e) {
            setStatus(b64Status, false, 'Invalid Base64');
        }
    });
    document.getElementById('b64Copy')?.addEventListener('click', () => copyText(b64Out.value));
    document.getElementById('b64Swap')?.addEventListener('click', () => {
        const tmp = b64In.value;
        b64In.value = b64Out.value;
        b64Out.value = tmp;
    });

    /* URL */
    const urlIn = document.getElementById('urlIn');
    const urlOut = document.getElementById('urlOut');

    document.getElementById('urlEncode')?.addEventListener('click', () => {
        urlOut.value = encodeURIComponent(urlIn.value);
    });
    document.getElementById('urlDecode')?.addEventListener('click', () => {
        try {
            urlOut.value = decodeURIComponent(urlIn.value);
        } catch {
            urlOut.value = 'Invalid percent-encoding';
        }
    });
    document.getElementById('urlCopy')?.addEventListener('click', () => copyText(urlOut.value));

    /* Timestamp */
    const tsUnix = document.getElementById('tsUnix');
    const tsIso = document.getElementById('tsIso');
    const tsLocal = document.getElementById('tsLocal');
    const tsIst = document.getElementById('tsIst');
    const tsStatus = document.getElementById('tsStatus');

    function renderDate(d) {
        if (Number.isNaN(d.getTime())) return;
        tsUnix.value = String(Math.floor(d.getTime() / 1000));
        tsIso.value = d.toISOString();
        tsLocal.value = d.toString();
        tsIst.value = d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
    }

    document.getElementById('tsNow')?.addEventListener('click', () => {
        renderDate(new Date());
        setStatus(tsStatus, true, 'Filled with the current time.');
    });
    document.getElementById('tsFromUnix')?.addEventListener('click', () => {
        const n = Number(tsUnix.value);
        if (!Number.isFinite(n)) {
            setStatus(tsStatus, false, 'Type a Unix number first (example: 1735689600).');
            return;
        }
        const ms = n < 1e12 ? n * 1000 : n;
        const d = new Date(ms);
        if (Number.isNaN(d.getTime())) {
            setStatus(tsStatus, false, 'That number is not a valid date.');
            return;
        }
        renderDate(d);
        setStatus(tsStatus, true, 'Converted the Unix number into human-readable dates.');
    });
    document.getElementById('tsFromIso')?.addEventListener('click', () => {
        const d = new Date(tsIso.value);
        if (Number.isNaN(d.getTime())) {
            setStatus(tsStatus, false, 'Paste an ISO date first (example: 2026-08-19T09:24:00Z).');
            return;
        }
        renderDate(d);
        setStatus(tsStatus, true, 'Converted the ISO date into a Unix number.');
    });
    document.getElementById('tsCopyUnix')?.addEventListener('click', () => copyText(tsUnix.value));
    renderDate(new Date());

    /* UUID */
    const uuidOut = document.getElementById('uuidOut');
    const uuidCount = document.getElementById('uuidCount');

    function makeUuids() {
        const n = Math.min(50, Math.max(1, Number(uuidCount.value) || 1));
        const lines = [];
        for (let i = 0; i < n; i++) lines.push(crypto.randomUUID());
        uuidOut.value = lines.join('\n');
    }

    document.getElementById('uuidGen')?.addEventListener('click', makeUuids);
    document.getElementById('uuidCopy')?.addEventListener('click', () => copyText(uuidOut.value));
    makeUuids();

    /* Hash */
    const hashIn = document.getElementById('hashIn');
    const hashOut = document.getElementById('hashOut');
    const hashAlgo = document.getElementById('hashAlgo');

    async function hashText() {
        const algo = hashAlgo.value;
        const data = new TextEncoder().encode(hashIn.value);
        const buf = await crypto.subtle.digest(algo, data);
        const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
        hashOut.value = hex;
    }

    document.getElementById('hashRun')?.addEventListener('click', () => {
        hashText().catch((e) => {
            hashOut.value = e.message;
        });
    });
    document.getElementById('hashCopy')?.addEventListener('click', () => copyText(hashOut.value));

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, (c) => (
            { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
        ));
    }

    function runRegex() {
        const pattern = document.getElementById('rePattern').value;
        const text = document.getElementById('reText').value;
        const flags = [
            document.getElementById('reG').checked ? 'g' : '',
            document.getElementById('reI').checked ? 'i' : '',
            document.getElementById('reM').checked ? 'm' : '',
            document.getElementById('reS').checked ? 's' : '',
        ].join('');
        const out = document.getElementById('reOut');
        const status = document.getElementById('reStatus');
        try {
            if (!pattern) {
                out.textContent = text;
                setStatus(status, false, 'Enter a pattern.');
                return;
            }
            const re = new RegExp(pattern, flags);
            const matches = text.match(re);
            const count = matches ? matches.length : 0;
            setStatus(status, true, count ? count + ' match(es)' : 'No matches');
            const highlightFlags = flags.includes('g') ? flags : flags + 'g';
            const reHi = new RegExp(pattern, highlightFlags);
            let html = '';
            let last = 0;
            let m;
            reHi.lastIndex = 0;
            while ((m = reHi.exec(text)) !== null) {
                html += escapeHtml(text.slice(last, m.index));
                html += '<mark>' + escapeHtml(m[0]) + '</mark>';
                last = m.index + m[0].length;
                if (m[0].length === 0) {
                    reHi.lastIndex += 1;
                    if (reHi.lastIndex > text.length) break;
                }
            }
            html += escapeHtml(text.slice(last));
            out.innerHTML = html;
        } catch (e) {
            out.textContent = '';
            setStatus(status, false, e.message);
        }
    }

    document.getElementById('reRun')?.addEventListener('click', runRegex);
    ['rePattern', 'reText', 'reG', 'reI', 'reM', 'reS'].forEach((id) => {
        document.getElementById(id)?.addEventListener('input', runRegex);
        document.getElementById(id)?.addEventListener('change', runRegex);
    });
    runRegex();

    function describeCronField(value, name, min, max, labels) {
        if (value === '*') return name + ': every value (' + min + '–' + max + ')';
        if (value.startsWith('*/')) {
            const step = Number(value.slice(2));
            return name + ': every ' + step + ' units';
        }
        if (value.includes('-') && !value.includes(',')) {
            return name + ': from ' + value.replace('-', ' to ');
        }
        if (labels && labels[value] !== undefined) return name + ': ' + labels[value];
        return name + ': ' + value;
    }

    function explainCron() {
        const raw = document.getElementById('cronIn').value.trim();
        const status = document.getElementById('cronStatus');
        const out = document.getElementById('cronOut');
        const specials = {
            '@yearly': 'Once a year: 0 0 1 1 *',
            '@annually': 'Once a year: 0 0 1 1 *',
            '@monthly': 'Once a month: 0 0 1 * *',
            '@weekly': 'Once a week: 0 0 * * 0',
            '@daily': 'Once a day: 0 0 * * *',
            '@midnight': 'Once a day: 0 0 * * *',
            '@hourly': 'Once an hour: 0 * * * *',
            '@reboot': 'Once at startup (machine/process start)',
        };
        if (specials[raw]) {
            setStatus(status, true, 'Special expression');
            out.textContent = specials[raw];
            return;
        }
        const parts = raw.split(/\s+/);
        if (parts.length < 5) {
            setStatus(status, false, 'Need 5 fields: minute hour day-of-month month day-of-week');
            out.textContent = '';
            return;
        }
        const week = { '0': 'Sunday', '7': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday', '4': 'Thursday', '5': 'Friday', '6': 'Saturday' };
        const month = { '1': 'January', '2': 'February', '3': 'March', '4': 'April', '5': 'May', '6': 'June', '7': 'July', '8': 'August', '9': 'September', '10': 'October', '11': 'November', '12': 'December' };
        const lines = [
            describeCronField(parts[0], 'Minute', 0, 59),
            describeCronField(parts[1], 'Hour (0–23)', 0, 23),
            describeCronField(parts[2], 'Day of month', 1, 31),
            describeCronField(parts[3], 'Month', 1, 12, month),
            describeCronField(parts[4], 'Day of week (0=Sun)', 0, 7, week),
        ];
        setStatus(status, true, 'Plain-English breakdown');
        out.textContent = lines.join('\n');
    }

    document.getElementById('cronRun')?.addEventListener('click', explainCron);
    document.getElementById('cronIn')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') explainCron();
    });
    explainCron();

    const TOKEN_PRICES = {
        'gpt-4o': { in: 2.5, out: 10, ctx: 128000 },
        'gpt-4o-mini': { in: 0.15, out: 0.6, ctx: 128000 },
        'claude-sonnet': { in: 3, out: 15, ctx: 200000 },
    };

    function estimateTokens() {
        const text = document.getElementById('tokIn').value;
        const model = document.getElementById('tokModel').value;
        const prices = TOKEN_PRICES[model];
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const tokens = Math.ceil(chars / 4) || 0;
        const inCost = (tokens / 1e6) * prices.in;
        const meta = document.getElementById('tokMeta');
        meta.replaceChildren();
        [
            ['Characters', String(chars)],
            ['Words', String(words)],
            ['Est. tokens', String(tokens)],
            ['Fits in context?', tokens <= prices.ctx ? 'Yes (' + prices.ctx.toLocaleString() + ')' : 'Over limit'],
            ['Est. input cost', '$' + inCost.toFixed(6)],
        ].forEach(([k, v]) => {
            const span = document.createElement('span');
            const strong = document.createElement('strong');
            strong.textContent = k + ': ';
            span.appendChild(strong);
            span.appendChild(document.createTextNode(v));
            meta.appendChild(span);
        });
        document.getElementById('tokHint').textContent =
            'Estimate only. Code and non-English usually use more tokens than 4 characters. Prices are approximate list rates for input tokens.';
    }

    document.getElementById('tokRun')?.addEventListener('click', estimateTokens);
    document.getElementById('tokIn')?.addEventListener('input', estimateTokens);
    document.getElementById('tokModel')?.addEventListener('change', estimateTokens);
    estimateTokens();

    function diffLines(aText, bText) {
        const a = aText.split('\n');
        const b = bText.split('\n');
        const n = a.length;
        const m = b.length;
        const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
        for (let i = n - 1; i >= 0; i--) {
            for (let j = m - 1; j >= 0; j--) {
                dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
        const rows = [];
        let i = 0;
        let j = 0;
        while (i < n && j < m) {
            if (a[i] === b[j]) {
                rows.push({ t: 'same', v: a[i] });
                i++;
                j++;
            } else if (dp[i + 1][j] >= dp[i][j + 1]) {
                rows.push({ t: 'del', v: a[i] });
                i++;
            } else {
                rows.push({ t: 'add', v: b[j] });
                j++;
            }
        }
        while (i < n) rows.push({ t: 'del', v: a[i++] });
        while (j < m) rows.push({ t: 'add', v: b[j++] });
        return rows;
    }

    function runDiff() {
        const rows = diffLines(document.getElementById('diffA').value, document.getElementById('diffB').value);
        const box = document.getElementById('diffOut');
        box.replaceChildren();
        rows.forEach((r) => {
            const div = document.createElement('div');
            div.className = 'tools-diff-line ' + r.t;
            div.textContent = (r.t === 'add' ? '+ ' : r.t === 'del' ? '- ' : '  ') + r.v;
            box.appendChild(div);
        });
    }

    document.getElementById('diffRun')?.addEventListener('click', runDiff);
    runDiff();
})();
