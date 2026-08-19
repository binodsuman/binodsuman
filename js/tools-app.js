(function () {
    'use strict';

    const toast = document.getElementById('toolsToast');
    const sidebar = document.getElementById('toolsSidebar');
    const toolSearch = document.getElementById('toolSearch');
    const panels = document.querySelectorAll('[data-tool-panel]');

    function showToast(msg) {
        if (!toast) return;
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

    function setStatus(id, ok, msg) {
        const el = document.getElementById(id);
        if (!el) return;
        el.className = 'tools-status ' + (ok ? 'ok' : 'err');
        el.textContent = msg || '';
    }

    function $(id) { return document.getElementById(id); }

    function prettyJson(obj) { return JSON.stringify(obj, null, 2); }

    function b64urlDecode(str) {
        let s = str.replace(/-/g, '+').replace(/_/g, '/');
        const pad = s.length % 4;
        if (pad) s += '='.repeat(4 - pad);
        const binary = atob(s);
        try {
            return decodeURIComponent(binary.split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        } catch { return binary; }
    }

    /* ── Sidebar & routing ── */
    function buildSidebar(filter) {
        const q = (filter || '').toLowerCase();
        sidebar.innerHTML = TOOL_CATEGORIES.map((cat) => {
            const items = TOOL_CATALOG.filter((t) => {
                if (t.cat !== cat.id) return false;
                if (!q) return true;
                return t.label.toLowerCase().includes(q) || t.blurb.toLowerCase().includes(q);
            });
            if (!items.length) return '';
            const links = items.map((t) =>
                `<button type="button" class="tools-nav-item" data-tool="${t.id}">${t.label}</button>`
            ).join('');
            return `<div class="tools-nav-group"><div class="tools-nav-cat"><i class="fas ${cat.icon}"></i> ${cat.name}</div>${links}</div>`;
        }).join('');

        sidebar.querySelectorAll('[data-tool]').forEach((btn) => {
            btn.addEventListener('click', () => openTool(btn.dataset.tool));
        });
    }

    function openTool(id) {
        const meta = TOOL_CATALOG.find((t) => t.id === id);
        if (!meta) return;
        panels.forEach((p) => p.classList.toggle('active', p.dataset.toolPanel === id));
        sidebar.querySelectorAll('[data-tool]').forEach((b) => b.classList.toggle('active', b.dataset.tool === id));
        $('toolsPanelTitle').textContent = meta.label;
        $('toolsPanelBlurb').textContent = meta.blurb;
        const demoBtn = $('toolsDemoBtn');
        const cmdPanels = ['git-commands', 'unix-commands', 'docker-commands', 'kubernetes-commands'];
        if (demoBtn) {
            demoBtn.hidden = cmdPanels.includes(id);
            if (!cmdPanels.includes(id)) demoBtn.dataset.demo = id;
        }
        if (history.replaceState) history.replaceState(null, '', '#' + id);
        runDemo(id);
    }

    toolSearch?.addEventListener('input', (e) => buildSidebar(e.target.value.trim()));

    const hash = (location.hash || '#json').replace('#', '');
    buildSidebar();
    openTool(TOOL_CATALOG.some((t) => t.id === hash) ? hash : 'json');

    /* ── JSON ── */
    function formatJson(minify) {
        const inp = $('jsonIn');
        const out = $('jsonOut');
        try {
            const parsed = JSON.parse(inp.value);
            out.value = minify ? JSON.stringify(parsed) : prettyJson(parsed);
            setStatus('jsonStatus', true, 'Valid JSON');
        } catch (e) {
            out.value = '';
            setStatus('jsonStatus', false, e.message);
        }
    }
    $('jsonFormat')?.addEventListener('click', () => formatJson(false));
    $('jsonMinify')?.addEventListener('click', () => formatJson(true));

    /* ── SQL ── */
    function formatSql() {
        const sql = $('sqlIn').value.replace(/\s+/g, ' ').trim();
        const keywords = ['SELECT','FROM','WHERE','JOIN','LEFT JOIN','RIGHT JOIN','INNER JOIN','GROUP BY','ORDER BY','HAVING','LIMIT','INSERT INTO','VALUES','UPDATE','SET','DELETE FROM','ON','AND','OR'];
        let out = sql;
        keywords.forEach((kw) => {
            out = out.replace(new RegExp('\\b' + kw + '\\b', 'gi'), '\n' + kw);
        });
        $('sqlOut').value = out.replace(/^\n/, '').split('\n').map((l) => l.trim()).join('\n');
        setStatus('sqlStatus', true, 'Formatted (basic indent)');
    }
    $('sqlFormat')?.addEventListener('click', formatSql);

    /* ── XML ── */
    function formatXml() {
        try {
            const raw = $('xmlIn').value.trim();
            const doc = new DOMParser().parseFromString(raw, 'application/xml');
            if (doc.querySelector('parsererror')) throw new Error('Invalid XML');
            const formatted = formatXmlNode(doc.documentElement, 0);
            $('xmlOut').value = '<?xml version="1.0" encoding="UTF-8"?>\n' + formatted;
            setStatus('xmlStatus', true, 'Valid XML');
        } catch (e) {
            $('xmlOut').value = '';
            setStatus('xmlStatus', false, e.message);
        }
    }
    function formatXmlNode(node, depth) {
        const pad = '  '.repeat(depth);
        if (node.nodeType === 3) return node.textContent.trim();
        let xml = pad + '<' + node.nodeName;
        [...node.attributes].forEach((a) => { xml += ' ' + a.name + '="' + a.value + '"'; });
        const kids = [...node.childNodes].filter((n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim()));
        if (!kids.length) return xml + ' />';
        xml += '>';
        if (kids.length === 1 && kids[0].nodeType === 3) {
            return xml + kids[0].textContent.trim() + '</' + node.nodeName + '>';
        }
        xml += '\n' + kids.map((k) => k.nodeType === 1 ? formatXmlNode(k, depth + 1) : pad + '  ' + k.textContent.trim()).join('\n');
        return xml + '\n' + pad + '</' + node.nodeName + '>';
    }
    $('xmlFormat')?.addEventListener('click', formatXml);

    /* ── YAML ── */
    function formatYaml() {
        try {
            if (typeof jsyaml === 'undefined') throw new Error('YAML library loading…');
            const obj = jsyaml.load($('yamlIn').value);
            $('yamlOut').value = jsyaml.dump(obj, { lineWidth: 120, noRefs: true });
            setStatus('yamlStatus', true, 'Valid YAML');
        } catch (e) {
            $('yamlOut').value = '';
            setStatus('yamlStatus', false, e.message);
        }
    }
    $('yamlFormat')?.addEventListener('click', formatYaml);

    /* ── Markdown ── */
    function renderMarkdown() {
        const src = $('mdIn').value;
        if (typeof marked !== 'undefined') {
            $('mdOut').innerHTML = marked.parse(src);
        } else {
            $('mdOut').textContent = 'Markdown library loading…';
        }
    }
    $('mdIn')?.addEventListener('input', renderMarkdown);

    /* ── CSV ↔ JSON ── */
    function parseCsv(text) {
        const lines = text.trim().split(/\r?\n/);
        if (!lines.length) return [];
        const headers = lines[0].split(',').map((h) => h.trim());
        return lines.slice(1).filter(Boolean).map((line) => {
            const vals = line.split(',').map((v) => v.trim());
            const row = {};
            headers.forEach((h, i) => { row[h] = vals[i] || ''; });
            return row;
        });
    }
    $('csv2jsonRun')?.addEventListener('click', () => {
        try {
            $('csv2jsonOut').value = prettyJson(parseCsv($('csv2jsonIn').value));
            setStatus('csv2jsonStatus', true, 'Converted');
        } catch (e) { setStatus('csv2jsonStatus', false, e.message); }
    });
    $('json2csvRun')?.addEventListener('click', () => {
        try {
            const arr = JSON.parse($('json2csvIn').value);
            if (!Array.isArray(arr) || !arr.length) throw new Error('Need a JSON array of objects');
            const keys = Object.keys(arr[0]);
            const lines = [keys.join(',')].concat(arr.map((row) => keys.map((k) => row[k] ?? '').join(',')));
            $('json2csvOut').value = lines.join('\n');
            setStatus('json2csvStatus', true, 'Converted');
        } catch (e) { setStatus('json2csvStatus', false, e.message); }
    });

    /* ── JSON Schema ── */
    function inferSchema(val) {
        if (val === null) return { type: 'null' };
        if (Array.isArray(val)) {
            return { type: 'array', items: val.length ? inferSchema(val[0]) : {} };
        }
        if (typeof val === 'object') {
            const props = {};
            Object.keys(val).forEach((k) => { props[k] = inferSchema(val[k]); });
            return { type: 'object', properties: props };
        }
        return { type: typeof val };
    }
    $('jsonSchemaRun')?.addEventListener('click', () => {
        try {
            const parsed = JSON.parse($('jsonSchemaIn').value);
            $('jsonSchemaOut').value = prettyJson({ $schema: 'https://json-schema.org/draft/2020-12/schema', ...inferSchema(parsed) });
            setStatus('jsonSchemaStatus', true, 'Schema inferred from sample');
        } catch (e) { setStatus('jsonSchemaStatus', false, e.message); }
    });

    /* ── JWT ── */
    function decodeJwt() {
        const raw = $('jwtIn').value.trim();
        if (!raw) return;
        const parts = raw.split('.');
        if (parts.length < 2) { setStatus('jwtStatus', false, 'Not a valid JWT'); return; }
        try {
            $('jwtHeader').textContent = prettyJson(JSON.parse(b64urlDecode(parts[0])));
            $('jwtPayload').textContent = prettyJson(JSON.parse(b64urlDecode(parts[1])));
            setStatus('jwtStatus', true, 'Decoded locally — signature not verified');
        } catch (e) { setStatus('jwtStatus', false, e.message); }
    }
    $('jwtDecode')?.addEventListener('click', decodeJwt);

    /* ── Base64 / URL ── */
    $('b64Encode')?.addEventListener('click', () => {
        $('b64Out').value = btoa(unescape(encodeURIComponent($('b64In').value)));
        setStatus('b64Status', true, 'Encoded');
    });
    $('b64Decode')?.addEventListener('click', () => {
        try {
            $('b64Out').value = decodeURIComponent(escape(atob($('b64In').value.trim())));
            setStatus('b64Status', true, 'Decoded');
        } catch { setStatus('b64Status', false, 'Invalid Base64'); }
    });
    $('urlEncode')?.addEventListener('click', () => { $('urlOut').value = encodeURIComponent($('urlIn').value); });
    $('urlDecode')?.addEventListener('click', () => {
        try { $('urlOut').value = decodeURIComponent($('urlIn').value); }
        catch { $('urlOut').value = 'Invalid encoding'; }
    });

    /* ── UUID / Password ── */
    function makeUuids() {
        const n = Math.min(100, Math.max(1, Number($('uuidCount').value) || 1));
        $('uuidOut').value = Array.from({ length: n }, () => crypto.randomUUID()).join('\n');
    }
    $('uuidGen')?.addEventListener('click', makeUuids);

    function genPassword() {
        const len = Math.min(128, Math.max(8, Number($('pwLen').value) || 16));
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const sym = '!@#$%^&*-_=+';
        let chars = lower + upper + nums;
        if ($('pwSym').checked) chars += sym;
        const arr = new Uint32Array(len);
        crypto.getRandomValues(arr);
        $('pwOut').value = Array.from(arr, (n) => chars[n % chars.length]).join('');
    }
    $('pwGen')?.addEventListener('click', genPassword);

    /* ── Hash ── */
    async function hashText() {
        const buf = await crypto.subtle.digest($('hashAlgo').value, new TextEncoder().encode($('hashIn').value));
        $('hashOut').value = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    $('hashRun')?.addEventListener('click', () => hashText().catch((e) => { $('hashOut').value = e.message; }));

    /* ── Timestamp ── */
    function renderDate(d) {
        if (Number.isNaN(d.getTime())) return;
        $('tsUnix').value = String(Math.floor(d.getTime() / 1000));
        $('tsIso').value = d.toISOString();
        $('tsIst').value = d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
    }
    $('tsFromUnix')?.addEventListener('click', () => renderDate(new Date(Number($('tsUnix').value) * 1000)));
    $('tsNow')?.addEventListener('click', () => renderDate(new Date()));

    /* ── HTTP Status ── */
    function renderHttpStatus(q) {
        const grid = $('httpStatusGrid');
        const query = (q || '').toLowerCase();
        const list = HTTP_STATUS_CODES.filter((s) =>
            !query || String(s.code).includes(query) || s.name.toLowerCase().includes(query) || s.desc.toLowerCase().includes(query)
        );
        grid.innerHTML = list.map((s) =>
            `<article class="http-status-card"><span class="http-code">${s.code}</span><strong>${s.name}</strong><p>${s.desc}</p></article>`
        ).join('') || '<p class="tools-hint">No matches.</p>';
    }
    $('httpStatusSearch')?.addEventListener('input', (e) => renderHttpStatus(e.target.value.trim()));
    renderHttpStatus();

    /* ── API Builder ── */
    function buildApiRequest() {
        const method = $('apiMethod').value;
        const url = $('apiUrl').value.trim();
        const body = $('apiBody').value.trim();
        const headers = $('apiHeaders').value.trim().split('\n').filter(Boolean);
        const headerFlags = headers.map((h) => `-H '${h.replace(/'/g, "'\\''")}'`).join(' ');
        let curl = `curl -X ${method} '${url}' ${headerFlags}`.trim();
        if (body && method !== 'GET') curl += ` -d '${body.replace(/'/g, "'\\''")}'`;
        $('apiCurlOut').value = curl;
        const hdrObj = headers.reduce((o, line) => {
            const i = line.indexOf(':');
            if (i > 0) o[line.slice(0, i).trim()] = line.slice(i + 1).trim();
            return o;
        }, {});
        let fetchCode = `fetch("${url}", {\n  method: "${method}"`;
        if (Object.keys(hdrObj).length) fetchCode += ',\n  headers: ' + prettyJson(hdrObj);
        if (body && method !== 'GET') fetchCode += ',\n  body: ' + JSON.stringify(body);
        fetchCode += '\n}).then(r => r.json()).then(console.log);';
        $('apiFetchOut').value = fetchCode;
    }
    $('apiBuild')?.addEventListener('click', buildApiRequest);

    /* ── cURL ↔ Postman ── */
    function curlToPostman(curl) {
        const method = (curl.match(/-X\s+(\w+)/i) || curl.match(/--request\s+(\w+)/i) || [, 'GET'])[1].toUpperCase();
        const url = (curl.match(/curl\s+(?:[^']*')?([^'\s]+)/) || curl.match(/'([^']+)'/))[1] || '';
        const headers = [...curl.matchAll(/-H\s+'([^']+)'/g)].map((m) => {
            const i = m[1].indexOf(':');
            return { key: m[1].slice(0, i).trim(), value: m[1].slice(i + 1).trim() };
        });
        const bodyMatch = curl.match(/-d\s+'([^']*)'/);
        return prettyJson({
            info: { name: 'Imported from cURL', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
            item: [{ name: method + ' ' + url, request: { method, header: headers, url, body: bodyMatch ? { mode: 'raw', raw: bodyMatch[1] } : undefined } }],
        });
    }
    $('curlToPostman')?.addEventListener('click', () => {
        try {
            $('curlPostmanOut').value = curlToPostman($('curlPostmanIn').value);
            setStatus('curlPostmanStatus', true, 'Converted to Postman collection v2.1');
        } catch (e) { setStatus('curlPostmanStatus', false, e.message); }
    });

    /* ── K8s YAML ── */
    function genK8s() {
        const name = $('k8sName').value || 'my-app';
        const image = $('k8sImage').value || 'nginx:alpine';
        const replicas = $('k8sReplicas').value || '1';
        const port = $('k8sPort').value || '80';
        $('k8sOut').value = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${name}
  template:
    metadata:
      labels:
        app: ${name}
    spec:
      containers:
      - name: ${name}
        image: ${image}
        ports:
        - containerPort: ${port}
---
apiVersion: v1
kind: Service
metadata:
  name: ${name}-svc
spec:
  selector:
    app: ${name}
  ports:
  - port: ${port}
    targetPort: ${port}
  type: ClusterIP`;
    }
    $('k8sGen')?.addEventListener('click', genK8s);

    /* ── Cron, Regex, Diff, Tokens (compact) ── */
    function explainCron() {
        const parts = $('cronIn').value.trim().split(/\s+/);
        if (parts.length < 5) { setStatus('cronStatus', false, 'Need 5 fields'); return; }
        $('cronOut').textContent = ['Minute: ' + parts[0], 'Hour: ' + parts[1], 'Day: ' + parts[2], 'Month: ' + parts[3], 'Weekday: ' + parts[4]].join('\n');
        setStatus('cronStatus', true, 'Breakdown');
    }
    $('cronRun')?.addEventListener('click', explainCron);

    function runRegex() {
        try {
            const re = new RegExp($('rePattern').value, 'gi');
            const text = $('reText').value;
            $('reOut').innerHTML = text.replace(re, (m) => '<mark>' + m + '</mark>');
            setStatus('reStatus', true, (text.match(re) || []).length + ' match(es)');
        } catch (e) { setStatus('reStatus', false, e.message); }
    }
    $('reRun')?.addEventListener('click', runRegex);

    function runDiff() {
        const a = $('diffA').value.split('\n'), b = $('diffB').value.split('\n');
        const box = $('diffOut');
        box.innerHTML = '';
        const max = Math.max(a.length, b.length);
        for (let i = 0; i < max; i++) {
            const div = document.createElement('div');
            if (a[i] === b[i]) { div.className = 'tools-diff-line same'; div.textContent = '  ' + (a[i] || ''); }
            else {
                if (a[i] !== undefined) { const d = document.createElement('div'); d.className = 'tools-diff-line del'; d.textContent = '- ' + a[i]; box.appendChild(d); }
                if (b[i] !== undefined) { div.className = 'tools-diff-line add'; div.textContent = '+ ' + b[i]; box.appendChild(div); continue; }
            }
            box.appendChild(div);
        }
    }
    $('diffRun')?.addEventListener('click', runDiff);

    function estimateTokens() {
        const text = $('tokIn').value;
        const tokens = Math.ceil(text.length / 4) || 0;
        $('tokMeta').textContent = `Characters: ${text.length} · Est. tokens: ${tokens} · Fits 128K context: ${tokens < 128000 ? 'Yes' : 'No'}`;
    }
    $('tokRun')?.addEventListener('click', estimateTokens);

    /* ── Demo loader ── */
    function runDemo(id) {
        const ex = TOOL_EXAMPLES;
        const demos = {
            json: () => { $('jsonIn').value = ex.json; formatJson(false); },
            sql: () => { $('sqlIn').value = ex.sql; formatSql(); },
            xml: () => { $('xmlIn').value = ex.xml; formatXml(); },
            yaml: () => { $('yamlIn').value = ex.yaml; formatYaml(); },
            markdown: () => { $('mdIn').value = ex.markdown; renderMarkdown(); },
            csv2json: () => { $('csv2jsonIn').value = ex.csv; $('csv2jsonRun').click(); },
            json2csv: () => { $('json2csvIn').value = ex.jsonArr; $('json2csvRun').click(); },
            jwt: () => { $('jwtIn').value = ex.jwt; decodeJwt(); },
            base64: () => { $('b64In').value = ex.base64; $('b64Encode').click(); },
            url: () => { $('urlIn').value = ex.url; $('urlEncode').click(); },
            uuid: () => { $('uuidCount').value = '3'; makeUuids(); },
            password: () => { $('pwLen').value = '20'; genPassword(); },
            'json-schema': () => { $('jsonSchemaIn').value = ex.json; $('jsonSchemaRun').click(); },
            hash: () => { $('hashIn').value = ex.hash; hashText(); },
            'api-builder': () => { $('apiUrl').value = ex.apiUrl; buildApiRequest(); },
            'curl-postman': () => { $('curlPostmanIn').value = ex.curl; $('curlToPostman').click(); },
            timestamp: () => { $('tsUnix').value = ex.unix; renderDate(new Date(Number(ex.unix) * 1000)); },
            cron: () => { $('cronIn').value = ex.cron; explainCron(); },
            regex: () => { $('rePattern').value = ex.regexPattern; $('reText').value = ex.regexText; runRegex(); },
            diff: () => { $('diffA').value = ex.diffA; $('diffB').value = ex.diffB; runDiff(); },
            tokens: () => { $('tokIn').value = ex.tokens; estimateTokens(); },
            'k8s-yaml': () => { $('k8sName').value = ex.k8sName; $('k8sImage').value = ex.k8sImage; $('k8sReplicas').value = ex.k8sReplicas; $('k8sPort').value = ex.k8sPort; genK8s(); },
        };
        demos[id]?.();
    }

    document.querySelectorAll('[data-demo]').forEach((btn) => {
        btn.addEventListener('click', () => runDemo(btn.dataset.demo));
    });

    $('toolsDemoBtn')?.addEventListener('click', function () {
        runDemo(this.dataset.demo);
    });

    document.querySelectorAll('[data-copy]').forEach((btn) => {
        btn.addEventListener('click', () => copyText($(btn.dataset.copy).value));
    });

    if (typeof GIT_COMMANDS !== 'undefined') {
        initCommandGrid({ prefix: 'git', commands: GIT_COMMANDS, categories: GIT_CATEGORIES, favKey: 'binodsuman_git_favorites', getCategoryLabel: (id) => GIT_CATEGORIES.find((c) => c.id === id)?.name || '' });
    }
    if (typeof UNIX_COMMANDS !== 'undefined') {
        initCommandGrid({ prefix: 'unix', commands: UNIX_COMMANDS, categories: UNIX_CATEGORIES, favKey: 'binodsuman_unix_favorites', getCategoryLabel: (id) => UNIX_CATEGORIES.find((c) => c.id === id)?.name || '' });
    }
    if (typeof DOCKER_COMMANDS !== 'undefined') {
        initCommandGrid({ prefix: 'docker', commands: DOCKER_COMMANDS, categories: DOCKER_CATEGORIES, favKey: 'binodsuman_docker_favorites', getCategoryLabel: (id) => DOCKER_CATEGORIES.find((c) => c.id === id)?.name || '' });
    }
    if (typeof K8S_COMMANDS !== 'undefined') {
        initCommandGrid({ prefix: 'k8s', commands: K8S_COMMANDS, categories: K8S_CATEGORIES, favKey: 'binodsuman_k8s_favorites', getCategoryLabel: (id) => K8S_CATEGORIES.find((c) => c.id === id)?.name || '' });
    }
})();
