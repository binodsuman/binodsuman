/**
 * Render 25 LeetCode interview problems with Java / Python textareas.
 */
(function () {
    const PROBLEMS = window.DSA_LEETCODE_25 || [];
    const picker = document.getElementById('dsa25Picker');
    const filters = document.getElementById('dsa25Filters');
    const detail = document.getElementById('dsa25Detail');
    if (!picker || !detail || PROBLEMS.length === 0) return;

    let lang = 'java';
    let activeSlug = PROBLEMS[0].slug;
    let patternFilter = 'All';

    const patterns = ['All', ...Array.from(new Set(PROBLEMS.map((p) => p.pattern)))];

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function current() {
        return PROBLEMS.find((p) => p.slug === activeSlug) || PROBLEMS[0];
    }

    function visibleProblems() {
        if (patternFilter === 'All') return PROBLEMS;
        return PROBLEMS.filter((p) => p.pattern === patternFilter);
    }

    function renderFilters() {
        filters.innerHTML = patterns.map((name) => {
            const active = name === patternFilter ? ' active' : '';
            return `<button type="button" class="dsa25-filter${active}" data-pattern="${escapeHtml(name)}">${escapeHtml(name)}</button>`;
        }).join('');
    }

    function renderPicker() {
        const list = visibleProblems();
        picker.innerHTML = list.map((p) => {
            const active = p.slug === activeSlug ? ' active' : '';
            return `<button type="button" class="dsa25-pick${active}" data-slug="${p.slug}">
                <div class="dsa25-pick-meta">
                    <span>#${p.id} · LC ${p.lc}</span>
                    <span class="dsa25-diff ${p.difficulty.toLowerCase()}">${p.difficulty}</span>
                </div>
                <div class="dsa25-pick-title">${escapeHtml(p.title)}</div>
            </button>`;
        }).join('');
    }

    function textarea(id, css, value) {
        return `<div class="dsa25-code-wrap">
            <button type="button" class="dsa25-copy" data-copy="${id}">Copy</button>
            <textarea id="${id}" class="dsa25-textarea ${css}" spellcheck="false">${escapeHtml(value)}</textarea>
        </div>`;
    }

    function renderDetail() {
        const p = current();
        const idx = PROBLEMS.findIndex((x) => x.slug === p.slug);
        const snippet = lang === 'java' ? p.snippetJava : p.snippetPython;
        let full = lang === 'java' ? p.java : p.python;
        if (lang === 'java' && !full.includes('import ') && /\b(Map|List|Set|Queue|Deque|HashMap|ArrayList|ArrayDeque|Arrays)\b/.test(full)) {
            full = 'import java.util.*;\n\n' + full;
        }
        if (lang === 'python') {
            const needsTyping = (/\b(List|Optional)\[/.test(full) || full.includes('Optional[')) && !full.includes('from typing import');
            if (needsTyping) full = 'from typing import List, Optional\n\n' + full;
        }
        const tags = (p.tags || []).map((t) => `<span class="dsa25-tag">${escapeHtml(t)}</span>`).join('');
        const lcUrl = `https://leetcode.com/problems/${p.slug}/`;

        detail.innerHTML = `
            <div class="dsa25-detail-head">
                <h2>${p.id}. ${escapeHtml(p.title)}</h2>
                <span class="dsa25-diff ${p.difficulty.toLowerCase()}">${p.difficulty}</span>
                <a class="dsa25-lc" href="${lcUrl}" target="_blank" rel="noopener">LeetCode ${p.lc} ↗</a>
            </div>
            <div class="dsa25-tags">${tags}<span class="dsa25-tag">${escapeHtml(p.pattern)}</span></div>

            <div class="dsa25-block dsa25-think">
                <h3>Interview thinking (after you read the question)</h3>
                <p>${escapeHtml(p.thinking)}</p>
            </div>

            <div class="dsa25-block">
                <h3>1. Question</h3>
                <p>${escapeHtml(p.question)}</p>
            </div>
            <div class="dsa25-block">
                <h3>2. Example</h3>
                <pre class="dsa25-diagram">${escapeHtml(p.example)}</pre>
            </div>
            <div class="dsa25-block">
                <h3>3. Easy explanation</h3>
                <p>${escapeHtml(p.explain)}</p>
            </div>
            <div class="dsa25-block">
                <h3>4. Pattern and data flow</h3>
                <pre class="dsa25-diagram">${escapeHtml(p.patternFlow)}</pre>
            </div>
            <div class="dsa25-block">
                <h3>5. Important parts of the question</h3>
                <div class="dsa25-note">${escapeHtml(p.important)}</div>
            </div>

            <div class="dsa25-block">
                <h3>6–7. Code — Java and Python</h3>
                <p class="dsa25-text" style="white-space:normal;margin-bottom:0.4rem;">Complexity: <strong>${escapeHtml(p.complexity)}</strong>. Linked-list / tree problems assume LeetCode’s <code>ListNode</code> / <code>TreeNode</code>. Java solutions use typical interview imports (<code>HashMap</code>, <code>ArrayDeque</code>, …).</p>
                <div class="dsa25-tabs" role="tablist">
                    <button type="button" class="dsa25-tab${lang === 'java' ? ' active' : ''}" data-lang="java" role="tab">Java</button>
                    <button type="button" class="dsa25-tab${lang === 'python' ? ' active' : ''}" data-lang="python" role="tab">Python</button>
                </div>
                <p style="font-size:0.8rem;color:#64748b;margin:0 0 0.35rem;">Important snippet</p>
                ${textarea('dsa25Snippet', 'snippet', snippet)}
                <p style="font-size:0.8rem;color:#64748b;margin:0.7rem 0 0.35rem;">Full code (editable copy in the text area)</p>
                ${textarea('dsa25Full', '', full)}
            </div>

            <div class="dsa25-block">
                <h3>Follow-up you should mention</h3>
                <p>${escapeHtml(p.followUp)}</p>
            </div>

            <div class="dsa25-nav-btns">
                <button type="button" id="dsa25Prev" ${idx === 0 ? 'disabled' : ''}>← Previous</button>
                <button type="button" id="dsa25Next" ${idx === PROBLEMS.length - 1 ? 'disabled' : ''}>Next →</button>
            </div>
        `;

        if (history.replaceState) {
            history.replaceState(null, '', '#' + p.slug);
        } else {
            location.hash = p.slug;
        }
    }

    function selectSlug(slug) {
        if (!PROBLEMS.some((p) => p.slug === slug)) return;
        activeSlug = slug;
        renderPicker();
        renderDetail();
        detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    filters.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-pattern]');
        if (!btn) return;
        patternFilter = btn.getAttribute('data-pattern');
        const vis = visibleProblems();
        if (!vis.some((p) => p.slug === activeSlug) && vis[0]) {
            activeSlug = vis[0].slug;
        }
        renderFilters();
        renderPicker();
        renderDetail();
    });

    picker.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-slug]');
        if (!btn) return;
        selectSlug(btn.getAttribute('data-slug'));
    });

    detail.addEventListener('click', (e) => {
        const tab = e.target.closest('[data-lang]');
        if (tab) {
            lang = tab.getAttribute('data-lang');
            renderDetail();
            return;
        }
        const copyBtn = e.target.closest('[data-copy]');
        if (copyBtn) {
            const id = copyBtn.getAttribute('data-copy');
            const area = document.getElementById(id);
            if (!area) return;
            navigator.clipboard.writeText(area.value).then(() => {
                copyBtn.textContent = 'Copied';
                setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1600);
            }).catch(() => {
                area.select();
                document.execCommand('copy');
            });
            return;
        }
        if (e.target.id === 'dsa25Prev') {
            const idx = PROBLEMS.findIndex((x) => x.slug === activeSlug);
            if (idx > 0) selectSlug(PROBLEMS[idx - 1].slug);
        }
        if (e.target.id === 'dsa25Next') {
            const idx = PROBLEMS.findIndex((x) => x.slug === activeSlug);
            if (idx < PROBLEMS.length - 1) selectSlug(PROBLEMS[idx + 1].slug);
        }
    });

    const hash = (location.hash || '').replace('#', '');
    if (hash && PROBLEMS.some((p) => p.slug === hash)) {
        activeSlug = hash;
    }

    renderFilters();
    renderPicker();
    renderDetail();
})();
