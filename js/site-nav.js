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
            </ul>
        </div>
    </header>`;

    document.body.classList.add('has-site-nav');
    document.body.insertAdjacentHTML('afterbegin', NAV_HTML);

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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSiteNav);
    } else {
        initSiteNav();
    }
})();
