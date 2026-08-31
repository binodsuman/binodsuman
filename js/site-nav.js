/**
 * Shared navigation — YouTube dropdown + external Academy link.
 */
(function () {
    const ACADEMY_URL = 'https://binodtech.com';

    const NAV_HTML = `
    <header class="site-header">
        <div class="nav-container">
            <a href="/" class="logo">Binod<span>Suman</span></a>
            <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu">
                <i class="fas fa-bars"></i>
            </button>
            <ul class="nav-menu" id="navMenu">
                <li class="nav-dropdown" data-dropdown="videos">
                    <button type="button" class="nav-dropdown-toggle" aria-expanded="false">
                        YouTube Video <i class="fas fa-chevron-down"></i>
                    </button>
                    <ul class="nav-dropdown-menu">
                        <li><a href="/#latest-videos" class="nav-link" data-nav="latest-videos">Latest Videos</a></li>
                        <li><a href="/#popular-videos" class="nav-link" data-nav="popular-videos">Popular Videos</a></li>
                        <li><a href="/#playlists" class="nav-link" data-nav="playlists">Playlists</a></li>
                        <li><a href="/#dsa" class="nav-link" data-nav="dsa">DSA</a></li>
                        <li class="nav-dropdown-divider"></li>
                        <li><a href="https://youtube.com/@binodsuman" target="_blank" rel="noopener" class="nav-link" data-nav="youtube-channel">YouTube Channel <i class="fas fa-external-link-alt"></i></a></li>
                    </ul>
                </li>
                <li><a href="/#about" class="nav-link" data-nav="about">Connect</a></li>
                <li><a href="${ACADEMY_URL}" target="_blank" rel="noopener" class="nav-link nav-link-external" data-nav="academy">Academy <i class="fas fa-external-link-alt"></i></a></li>
                <li class="nav-dropdown" data-dropdown="llm-prompt">
                    <button type="button" class="nav-dropdown-toggle" aria-expanded="false">
                        LLM Prompt <i class="fas fa-chevron-down"></i>
                    </button>
                    <ul class="nav-dropdown-menu">
                        <li><a href="/ai-terminology/" class="nav-link" data-nav="ai-terminology">AI Terminology</a></li>
                        <li><a href="/image-prompts" class="nav-link" data-nav="image-prompts">Image Prompt</a></li>
                        <li><a href="/commands" class="nav-link" data-nav="slash-prompt">Slash Prompt</a></li>
                        <li><a href="/system-prompts/" class="nav-link" data-nav="system-prompts">System Prompt</a></li>
                    </ul>
                </li>
                <li><a href="/tools/" class="nav-link" data-nav="dev-tools">Tools</a></li>
                <li><a href="/study-planner/" class="nav-link" data-nav="study-planner">Study Planner</a></li>
            </ul>
            <div class="appearance-wrap">
                <button type="button" class="appearance-btn" id="appearanceBtn" aria-label="Appearance" aria-expanded="false" aria-haspopup="true" title="Appearance">
                    <i class="fas fa-palette" aria-hidden="true"></i>
                </button>
                <div class="appearance-menu" id="appearanceMenu" role="menu" hidden>
                    <p class="appearance-menu-label">Appearance</p>
                    <button type="button" role="menuitem" class="appearance-option" data-theme="light"><span class="appearance-swatch appearance-swatch--light"></span> Light</button>
                    <button type="button" role="menuitem" class="appearance-option" data-theme="dark"><span class="appearance-swatch appearance-swatch--dark"></span> Dark</button>
                    <button type="button" role="menuitem" class="appearance-option" data-theme="midnight"><span class="appearance-swatch appearance-swatch--midnight"></span> Midnight</button>
                    <button type="button" role="menuitem" class="appearance-option" data-theme="sepia"><span class="appearance-swatch appearance-swatch--sepia"></span> Sepia</button>
                    <button type="button" role="menuitem" class="appearance-option" data-theme="ocean"><span class="appearance-swatch appearance-swatch--ocean"></span> Ocean</button>
                    <button type="button" role="menuitem" class="appearance-option" data-theme="forest"><span class="appearance-swatch appearance-swatch--forest"></span> Forest</button>
                </div>
            </div>
        </div>
    </header>`;

    document.body.classList.add('has-site-nav');
    document.body.insertAdjacentHTML('afterbegin', NAV_HTML);

    const THEMES = ['light', 'dark', 'midnight', 'sepia', 'ocean', 'forest'];

    function getAppearance() {
        try {
            const t = localStorage.getItem('bs-appearance');
            return THEMES.includes(t) ? t : 'dark';
        } catch (e) {
            return 'dark';
        }
    }

    function applyAppearance(theme) {
        if (!THEMES.includes(theme)) theme = 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem('bs-appearance', theme); } catch (e) {}
        document.querySelectorAll('.appearance-option').forEach((btn) => {
            btn.classList.toggle('is-active', btn.getAttribute('data-theme') === theme);
        });
    }

    function initAppearance() {
        applyAppearance(getAppearance());
        const btn = document.getElementById('appearanceBtn');
        const menu = document.getElementById('appearanceMenu');
        if (!btn || !menu) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const open = menu.hasAttribute('hidden');
            if (open) {
                menu.removeAttribute('hidden');
                btn.setAttribute('aria-expanded', 'true');
            } else {
                menu.setAttribute('hidden', '');
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        menu.querySelectorAll('.appearance-option').forEach((opt) => {
            opt.addEventListener('click', () => {
                applyAppearance(opt.getAttribute('data-theme'));
                menu.setAttribute('hidden', '');
                btn.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.appearance-wrap')) {
                menu.setAttribute('hidden', '');
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                menu.setAttribute('hidden', '');
                btn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function initSiteNav() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navMenu = document.getElementById('navMenu');
        const path = window.location.pathname.replace(/\/$/, '') || '/';

        if (path === '/ai-terminology' || path.endsWith('/ai-terminology')) {
            markChildActive('llm-prompt', 'ai-terminology');
        } else if (path === '/image-prompts' || path.endsWith('/image-prompts')) {
            markChildActive('llm-prompt', 'image-prompts');
        } else if (path === '/commands' || path.endsWith('/commands')) {
            markChildActive('llm-prompt', 'slash-prompt');
        } else if (path === '/system-prompts' || path.endsWith('/system-prompts')) {
            markChildActive('llm-prompt', 'system-prompts');
        } else if (path === '/tools' || path.endsWith('/tools')) {
            document.querySelector('[data-nav="dev-tools"]')?.classList.add('active-child');
        } else if (path === '/study-planner' || path.endsWith('/study-planner')) {
            document.querySelector('[data-nav="study-planner"]')?.classList.add('active-child');
        } else if (path === '/git-commands' || path.endsWith('/git-commands') ||
                   path === '/unix-commands' || path.endsWith('/unix-commands') ||
                   path === '/docker-commands' || path.endsWith('/docker-commands') ||
                   path === '/kubernetes-commands' || path.endsWith('/kubernetes-commands')) {
            document.querySelector('[data-nav="dev-tools"]')?.classList.add('active-child');
        }

        const hash = window.location.hash.replace('#', '');
        if (path === '/' || path === '/index.html') {
            if (hash === 'latest-videos' || hash === 'popular-videos' || hash === 'playlists' || hash === 'dsa') {
                markChildActive('videos', hash);
            } else if (hash === 'about') {
                document.querySelector('[data-nav="about"]')?.classList.add('active-child');
            }
        }

        document.querySelectorAll('.nav-dropdown-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const parent = btn.closest('.nav-dropdown');
                    const isOpen = parent.classList.toggle('open');
                    btn.setAttribute('aria-expanded', isOpen);
                }
            });
        });

        mobileMenuBtn?.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('active');
            mobileMenuBtn.innerHTML = isOpen
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });

        navMenu?.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                if (mobileMenuBtn) mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                document.querySelectorAll('.nav-dropdown').forEach((d) => d.classList.remove('open'));
            });
        });

        document.querySelectorAll('a[href^="/#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href').slice(1);
                if (path === '/' || path === '/index.html') {
                    const el = document.getElementById(targetId);
                    if (el) {
                        e.preventDefault();
                        window.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' });
                    }
                }
            });
        });
    }

    function markChildActive(dropdownId, childNav) {
        const dropdown = document.querySelector(`[data-dropdown="${dropdownId}"]`);
        if (!dropdown) return;
        dropdown.querySelector('.nav-dropdown-toggle')?.classList.add('active-parent');
        document.querySelector(`[data-nav="${childNav}"]`)?.classList.add('active-child');
    }

    function loadStudyReminders() {
        if (document.querySelector('script[data-bs-study-reminders]')) return;
        const s = document.createElement('script');
        s.src = '/js/study-reminders.js?v=1';
        s.defer = true;
        s.setAttribute('data-bs-study-reminders', '1');
        (document.head || document.documentElement).appendChild(s);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initSiteNav();
            initAppearance();
            loadStudyReminders();
        });
    } else {
        initSiteNav();
        initAppearance();
        loadStudyReminders();
    }
})();
