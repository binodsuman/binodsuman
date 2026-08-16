/**
 * Shared navigation bar — same font & layout as home page on every page.
 */
(function () {
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
                    </ul>
                </li>
                <li><a href="/#about" class="nav-link" data-nav="about">Connect</a></li>
                <li class="nav-dropdown" data-dropdown="cheat-sheets">
                    <button type="button" class="nav-dropdown-toggle" aria-expanded="false">
                        Study Material <i class="fas fa-chevron-down"></i>
                    </button>
                    <ul class="nav-dropdown-menu nav-dropdown-menu--study">
                        <li class="nav-dropdown-label">System Design</li>
                        <li><a href="/cheat-sheets/system-design/" class="nav-link" data-nav="sd-hub">SD Hub (24 topics)</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/fundamentals" class="nav-link" data-nav="sd-fundamentals">SD Fundamentals</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/patterns" class="nav-link" data-nav="sd-patterns">SD Interview Patterns</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/url-shortener" class="nav-link" data-nav="sd-url-shortener">URL Shortener</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/rate-limiter" class="nav-link" data-nav="sd-rate-limiter">Rate Limiter</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/chat-system" class="nav-link" data-nav="sd-chat-system">WhatsApp & Chat</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/news-feed" class="nav-link" data-nav="sd-news-feed">News Feed</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/twitter-timeline" class="nav-link" data-nav="sd-twitter-timeline">Twitter</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/youtube-streaming" class="nav-link" data-nav="sd-youtube-streaming">YouTube</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/instagram-photos" class="nav-link" data-nav="sd-instagram-photos">Instagram</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/web-crawler" class="nav-link" data-nav="sd-web-crawler">Web Crawler</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/typeahead" class="nav-link" data-nav="sd-typeahead">Typeahead</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/file-storage" class="nav-link" data-nav="sd-file-storage">File Storage</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/api-gateway" class="nav-link" data-nav="sd-api-gateway">API Gateway</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/notification-system" class="nav-link" data-nav="sd-notification-system">Notifications</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/distributed-cache" class="nav-link" data-nav="sd-distributed-cache">Distributed Cache</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/ticket-booking" class="nav-link" data-nav="sd-ticket-booking">Ticket Booking</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/uber-rides" class="nav-link" data-nav="sd-uber-rides">Uber / Rides</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/distributed-search" class="nav-link" data-nav="sd-distributed-search">Distributed Search</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/distributed-logging" class="nav-link" data-nav="sd-distributed-logging">Distributed Logging</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/distributed-task-scheduler" class="nav-link" data-nav="sd-distributed-task-scheduler">Task Scheduler</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/shared-counter" class="nav-link" data-nav="sd-shared-counter">Shared Counter</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/quora" class="nav-link" data-nav="sd-quora">Quora</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/google-maps" class="nav-link" data-nav="sd-google-maps">Google Maps</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/proximity-service" class="nav-link" data-nav="sd-proximity-service">Proximity Service</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/payment-system" class="nav-link" data-nav="sd-payment-system">Payment System</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/system-design/chatgpt-system" class="nav-link" data-nav="sd-chatgpt-system">ChatGPT System</a></li>
                        <li class="nav-dropdown-label">AI</li>
                        <li><a href="/cheat-sheets/ai/" class="nav-link" data-nav="ai-hub">AI Basics Hub</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/ai/roadmap" class="nav-link" data-nav="ai-roadmap">AI Master Roadmap</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/ai/ml-interview" class="nav-link" data-nav="ai-ml">ML/DL Interview Guide</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/ai/rag" class="nav-link" data-nav="ai-rag">RAG</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/ai/agents-intro" class="nav-link" data-nav="ai-agents">What is an Agent?</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/ai/create-first-agent" class="nav-link" data-nav="ai-first-agent">Create First Agent</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/ai/langchain-basics" class="nav-link" data-nav="ai-langchain">LangChain Basics</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/ai/cursor-guide" class="nav-link" data-nav="ai-cursor">How to Use Cursor</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/ai/claude-guide" class="nav-link" data-nav="ai-claude">How to Use Claude</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/ai/cursor-vs-claude-code" class="nav-link" data-nav="ai-cursor-claude">Cursor vs Claude Code</a></li>
                        <li class="nav-dropdown-label">Java</li>
                        <li><a href="/cheat-sheets/java/core" class="nav-link" data-nav="java-core">Java Core</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/java/collections" class="nav-link" data-nav="java-collections">Collections & Concurrency</a></li>
                        <li class="nav-dropdown-label">DSA</li>
                        <li><a href="/cheat-sheets/dsa/patterns" class="nav-link" data-nav="dsa-patterns">DSA Patterns</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/dsa/top-problems" class="nav-link" data-nav="dsa-problems">Top Interview Problems</a></li>
                        <li class="nav-dropdown-label">Data Engineering</li>
                        <li><a href="/cheat-sheets/data-engineering/kafka" class="nav-link" data-nav="de-kafka">Apache Kafka</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/data-engineering/spark" class="nav-link" data-nav="de-spark">Apache Spark</a></li>
                        <li class="nav-dropdown-label">Behaviour</li>
                        <li><a href="/cheat-sheets/behaviour/star" class="nav-link" data-nav="beh-star">STAR Method</a></li>
                        <li class="nav-dropdown-child"><a href="/cheat-sheets/behaviour/questions" class="nav-link" data-nav="beh-questions">Top Behavioral Qs</a></li>
                    </ul>
                </li>
                <li class="nav-dropdown" data-dropdown="llm-prompt">
                    <button type="button" class="nav-dropdown-toggle" aria-expanded="false">
                        LLM Prompt <i class="fas fa-chevron-down"></i>
                    </button>
                    <ul class="nav-dropdown-menu">
                        <li><a href="/image-prompts" class="nav-link" data-nav="image-prompts">Image Prompt</a></li>
                        <li><a href="/commands" class="nav-link" data-nav="slash-prompt">Slash Prompt</a></li>
                    </ul>
                </li>
                <li><a href="http://youtube.com/@binodsuman" target="_blank" rel="noopener" class="nav-link">YouTube <i class="fas fa-external-link-alt"></i></a></li>
            </ul>
        </div>
    </header>`;

    const CHEAT_SHEET_NAV_MAP = {
        '/cheat-sheets/system-design': 'sd-hub',
        '/cheat-sheets/system-design/fundamentals': 'sd-fundamentals',
        '/cheat-sheets/system-design/patterns': 'sd-patterns',
        '/cheat-sheets/system-design/url-shortener': 'sd-url-shortener',
        '/cheat-sheets/system-design/rate-limiter': 'sd-rate-limiter',
        '/cheat-sheets/system-design/chat-system': 'sd-chat-system',
        '/cheat-sheets/system-design/news-feed': 'sd-news-feed',
        '/cheat-sheets/system-design/twitter-timeline': 'sd-twitter-timeline',
        '/cheat-sheets/system-design/youtube-streaming': 'sd-youtube-streaming',
        '/cheat-sheets/system-design/instagram-photos': 'sd-instagram-photos',
        '/cheat-sheets/system-design/web-crawler': 'sd-web-crawler',
        '/cheat-sheets/system-design/file-storage': 'sd-file-storage',
        '/cheat-sheets/system-design/typeahead': 'sd-typeahead',
        '/cheat-sheets/system-design/api-gateway': 'sd-api-gateway',
        '/cheat-sheets/system-design/notification-system': 'sd-notification-system',
        '/cheat-sheets/system-design/distributed-cache': 'sd-distributed-cache',
        '/cheat-sheets/system-design/ticket-booking': 'sd-ticket-booking',
        '/cheat-sheets/system-design/uber-rides': 'sd-uber-rides',
        '/cheat-sheets/system-design/distributed-search': 'sd-distributed-search',
        '/cheat-sheets/system-design/distributed-logging': 'sd-distributed-logging',
        '/cheat-sheets/system-design/distributed-task-scheduler': 'sd-distributed-task-scheduler',
        '/cheat-sheets/system-design/shared-counter': 'sd-shared-counter',
        '/cheat-sheets/system-design/quora': 'sd-quora',
        '/cheat-sheets/system-design/google-maps': 'sd-google-maps',
        '/cheat-sheets/system-design/proximity-service': 'sd-proximity-service',
        '/cheat-sheets/system-design/payment-system': 'sd-payment-system',
        '/cheat-sheets/system-design/chatgpt-system': 'sd-chatgpt-system',
        '/cheat-sheets/ai': 'ai-hub',
        '/cheat-sheets/ai/roadmap': 'ai-roadmap',
        '/cheat-sheets/ai/ml-interview': 'ai-ml',
        '/cheat-sheets/ai/rag': 'ai-rag',
        '/cheat-sheets/ai/first-llm-integration': 'ai-first-llm',
        '/cheat-sheets/ai/agents-intro': 'ai-agents',
        '/cheat-sheets/ai/create-first-agent': 'ai-first-agent',
        '/cheat-sheets/ai/langchain-basics': 'ai-langchain',
        '/cheat-sheets/ai/google-adk': 'ai-google-adk',
        '/cheat-sheets/ai/n8n-basics': 'ai-n8n',
        '/cheat-sheets/ai/cursor-guide': 'ai-cursor',
        '/cheat-sheets/ai/claude-guide': 'ai-claude',
        '/cheat-sheets/ai/cursor-vs-claude-code': 'ai-cursor-claude',
        '/cheat-sheets/ai/prompt-engineering-basics': 'ai-prompt',
        '/cheat-sheets/ai/embeddings-basics': 'ai-embeddings',
        '/cheat-sheets/ai/openai-api-basics': 'ai-openai',
        '/cheat-sheets/ai/fine-tuning-basics': 'ai-fine-tuning',
        '/cheat-sheets/ai/mcp-basics': 'ai-mcp',
        '/cheat-sheets/java/core': 'java-core',
        '/cheat-sheets/java/collections': 'java-collections',
        '/cheat-sheets/dsa/patterns': 'dsa-patterns',
        '/cheat-sheets/dsa/top-problems': 'dsa-problems',
        '/cheat-sheets/data-engineering/kafka': 'de-kafka',
        '/cheat-sheets/data-engineering/spark': 'de-spark',
        '/cheat-sheets/behaviour/star': 'beh-star',
        '/cheat-sheets/behaviour/questions': 'beh-questions',
    };

    document.body.classList.add('has-site-nav');
    document.body.insertAdjacentHTML('afterbegin', NAV_HTML);

    function initSiteNav() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navMenu = document.getElementById('navMenu');
        const path = window.location.pathname.replace(/\/$/, '') || '/';

        if (path === '/image-prompts' || path.endsWith('/image-prompts')) {
            markChildActive('llm-prompt', 'image-prompts');
        } else if (path === '/commands' || path.endsWith('/commands')) {
            markChildActive('llm-prompt', 'slash-prompt');
        } else if (path.startsWith('/cheat-sheets')) {
            const navId = CHEAT_SHEET_NAV_MAP[path];
            if (navId) {
                markChildActive('cheat-sheets', navId);
            } else {
                document.querySelector('[data-dropdown="cheat-sheets"] .nav-dropdown-toggle')?.classList.add('active-parent');
            }
        }

        const hash = window.location.hash.replace('#', '');
        if (path === '/' || path === '/index.html') {
            if (hash === 'latest-videos' || hash === 'popular-videos' || hash === 'playlists' || hash === 'dsa') {
                markChildActive('videos', hash);
            } else if (hash === 'about') {
                document.querySelector('[data-nav="about"]')?.classList.add('active-child');
            }
        }

        mobileMenuBtn?.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('active');
            mobileMenuBtn.innerHTML = isOpen
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });

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

        navMenu?.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                if (mobileMenuBtn) mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
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
