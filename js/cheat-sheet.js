/**
 * Cheat sheet UX — print/PDF + YouTube thumbnail cards
 */
(function () {
    const CHANNEL_NAME = 'Binod Suman';

    function ytThumb(videoId) {
        return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }

    function extractVideoId(url) {
        const short = url.match(/youtu\.be\/([^?&]+)/);
        if (short) return short[1];
        const watch = url.match(/[?&]v=([^&]+)/);
        return watch ? watch[1] : null;
    }

    function buildVideoCard(video) {
        const thumbId = video.thumbId || extractVideoId(video.url);
        const thumb = thumbId ? ytThumb(thumbId) : '';
        const isPlaylist = video.type === 'playlist';
        const isChannel = video.type === 'channel';
        const badge = video.badge || (isPlaylist ? 'Playlist' : isChannel ? 'Channel' : '');

        return `
            <a href="${video.url}" class="cs-video-card" target="_blank" rel="noopener noreferrer" aria-label="Watch ${video.title} on YouTube">
                <div class="cs-video-thumb">
                    ${thumb ? `<img src="${thumb}" alt="${video.title}" loading="lazy" width="320" height="180">` : ''}
                    <div class="cs-video-overlay"></div>
                    <span class="cs-video-play" aria-hidden="true"><i class="fas fa-play"></i></span>
                    ${badge ? `<span class="cs-video-badge">${badge}</span>` : ''}
                </div>
                <div class="cs-video-meta">
                    <span class="cs-video-title">${video.title}</span>
                    <span class="cs-video-channel">
                        <i class="fab fa-youtube"></i> ${CHANNEL_NAME}
                    </span>
                </div>
            </a>`;
    }

    function initCheatSheet() {
        const container = document.querySelector('.cs-container');
        if (!container) return;

        injectActionBar(container);
        injectPromptBox(container);
        injectYouTubeSection(container);
    }

    function injectPromptBox(container) {
        if (container.querySelector('.cs-prompt-box')) return;

        const path = window.location.pathname.replace(/\/$/, '') || '/';
        const prompt = window.CHEAT_SHEET_PROMPTS?.[path];
        if (!prompt) return;

        const gptUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
        const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

        const box = document.createElement('div');
        box.className = 'cs-prompt-box';
        box.innerHTML = `
            <div class="cs-prompt-header">
                <h3><i class="fas fa-wand-magic-sparkles"></i> Practice with AI</h3>
                <p>Open ChatGPT or Claude with a tailored mock-interview / tutor prompt for this topic.</p>
            </div>
            <div class="cs-prompt-preview">${escapeHtml(prompt)}</div>
            <div class="cs-prompt-actions">
                <a href="${gptUrl}" class="cs-prompt-btn cs-prompt-gpt" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-external-link-alt"></i> Open in ChatGPT
                </a>
                <a href="${claudeUrl}" class="cs-prompt-btn cs-prompt-claude" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-external-link-alt"></i> Open in Claude
                </a>
                <button type="button" class="cs-prompt-btn cs-prompt-copy" id="csPromptCopy">
                    <i class="fas fa-copy"></i> Copy prompt
                </button>
            </div>`;

        const related = container.querySelector('.cs-related');
        if (related) {
            related.after(box);
        } else {
            container.appendChild(box);
        }

        document.getElementById('csPromptCopy')?.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(prompt);
                const btn = document.getElementById('csPromptCopy');
                if (btn) {
                    const orig = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => { btn.innerHTML = orig; }, 2000);
                }
            } catch {
                /* fallback ignored */
            }
        });
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function injectActionBar(container) {
        if (container.querySelector('.cs-actions')) return;

        const actions = document.createElement('div');
        actions.className = 'cs-actions';
        actions.innerHTML = `
            <button type="button" class="cs-print-btn" id="csPrintBtn" aria-label="Print or save as PDF">
                <i class="fas fa-print"></i> Print / Save PDF
            </button>
            <span class="cs-print-hint">Tip: choose "Save as PDF" in the print dialog</span>`;

        const hero = container.querySelector('.cs-hero');
        if (hero) {
            hero.after(actions);
        } else {
            container.prepend(actions);
        }

        document.getElementById('csPrintBtn')?.addEventListener('click', () => window.print());
    }

    function injectYouTubeSection(container) {
        const path = window.location.pathname.replace(/\/$/, '') || '/';
        const videos = window.CHEAT_SHEET_VIDEOS?.[path];
        if (!videos || videos.length === 0) return;
        if (container.querySelector('.cs-youtube')) return;

        const related = container.querySelector('.cs-related');
        const section = document.createElement('div');
        section.className = 'cs-youtube';
        section.innerHTML = `
            <div class="cs-youtube-header">
                <h3><i class="fab fa-youtube"></i> Watch on YouTube</h3>
                <a href="https://youtube.com/@binodsuman" class="cs-youtube-channel-link" target="_blank" rel="noopener">
                    Visit channel <i class="fas fa-arrow-right"></i>
                </a>
            </div>
            <div class="cs-youtube-grid">
                ${videos.map(buildVideoCard).join('')}
            </div>`;

        if (related) {
            related.before(section);
        } else {
            container.appendChild(section);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCheatSheet);
    } else {
        initCheatSheet();
    }
})();
