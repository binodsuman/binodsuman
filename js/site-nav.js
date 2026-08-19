/**
 * Shared navigation — mega-menu Study Material + YouTube Video dropdown.
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
                        <li class="nav-dropdown-divider"></li>
                        <li><a href="https://youtube.com/@binodsuman" target="_blank" rel="noopener" class="nav-link" data-nav="youtube-channel">YouTube Channel <i class="fas fa-external-link-alt"></i></a></li>
                    </ul>
                </li>
                <li><a href="/#about" class="nav-link" data-nav="about">Connect</a></li>
                <li class="nav-dropdown nav-dropdown--mega" data-dropdown="cheat-sheets">
                    <button type="button" class="nav-dropdown-toggle" aria-expanded="false">
                        Study Material <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="nav-dropdown-menu nav-mega-menu" role="menu">
                        <div class="nav-mega-tabs" role="tablist">
                            <button type="button" class="nav-mega-tab active" data-mega-tab="sd" role="tab" aria-selected="true">System Design</button>
                            <button type="button" class="nav-mega-tab" data-mega-tab="ai" role="tab" aria-selected="false">AI</button>
                            <button type="button" class="nav-mega-tab" data-mega-tab="more" role="tab" aria-selected="false">Java · DSA · More</button>
                        </div>
                        <div class="nav-mega-panels">
                            <div class="nav-mega-panel active" data-mega-panel="sd" role="tabpanel">
                                <a href="/cheat-sheets/system-design/core/" class="nav-mega-hub" data-nav="sd-core-hub"><i class="fas fa-cubes"></i> Core Concepts <span>30 topics</span></a>
                                <a href="/cheat-sheets/system-design/google/" class="nav-mega-hub" data-nav="sd-google-hub"><i class="fab fa-google"></i> Google SD <span>12 designs</span></a>
                                <a href="/cheat-sheets/system-design/" class="nav-mega-hub" data-nav="sd-hub"><i class="fas fa-layer-group"></i> Classic SD Hub</a>
                                <div class="nav-mega-label">Quick links</div>
                                <div class="nav-mega-grid">
                                    <a href="/cheat-sheets/system-design/url-shortener" class="nav-link" data-nav="sd-url-shortener">URL Shortener</a>
                                    <a href="/cheat-sheets/system-design/rate-limiter" class="nav-link" data-nav="sd-rate-limiter">Rate Limiter</a>
                                    <a href="/cheat-sheets/system-design/chatgpt-system" class="nav-link" data-nav="sd-chatgpt-system">ChatGPT</a>
                                    <a href="/cheat-sheets/system-design/payment-system" class="nav-link" data-nav="sd-payment-system">Payments</a>
                                    <a href="/cheat-sheets/system-design/youtube-streaming" class="nav-link" data-nav="sd-youtube-streaming">YouTube</a>
                                    <a href="/cheat-sheets/system-design/google-maps" class="nav-link" data-nav="sd-google-maps">Google Maps</a>
                                </div>
                            </div>
                            <div class="nav-mega-panel" data-mega-panel="ai" role="tabpanel" hidden>
                                <a href="/cheat-sheets/ai/" class="nav-mega-hub" data-nav="ai-hub"><i class="fas fa-robot"></i> AI Study Hub</a>
                                <div class="nav-mega-grid">
                                    <a href="/cheat-sheets/ai/roadmap" class="nav-link" data-nav="ai-roadmap">AI Roadmap</a>
                                    <a href="/cheat-sheets/ai/rag" class="nav-link" data-nav="ai-rag">RAG</a>
                                    <a href="/cheat-sheets/ai/agents-intro" class="nav-link" data-nav="ai-agents">Agents</a>
                                    <a href="/cheat-sheets/ai/langchain-basics" class="nav-link" data-nav="ai-langchain">LangChain</a>
                                    <a href="/cheat-sheets/ai/cursor-guide" class="nav-link" data-nav="ai-cursor">Cursor</a>
                                    <a href="/cheat-sheets/ai/claude-guide" class="nav-link" data-nav="ai-claude">Claude</a>
                                </div>
                            </div>
                            <div class="nav-mega-panel" data-mega-panel="more" role="tabpanel" hidden>
                                <div class="nav-mega-label">Java</div>
                                <div class="nav-mega-grid">
                                    <a href="/cheat-sheets/java/core" class="nav-link" data-nav="java-core">Java Core</a>
                                    <a href="/cheat-sheets/java/collections" class="nav-link" data-nav="java-collections">Collections</a>
                                </div>
                                <div class="nav-mega-label">DSA</div>
                                <div class="nav-mega-grid">
                                    <a href="/cheat-sheets/dsa/leetcode-25/" class="nav-link" data-nav="dsa-leetcode-25">25 LeetCode Problems</a>
                                    <a href="/cheat-sheets/dsa/patterns" class="nav-link" data-nav="dsa-patterns">DSA Patterns</a>
                                    <a href="/cheat-sheets/dsa/top-problems" class="nav-link" data-nav="dsa-problems">Top Problems</a>
                                </div>
                                <div class="nav-mega-label">Data Engineering · Behaviour</div>
                                <div class="nav-mega-grid">
                                    <a href="/cheat-sheets/data-engineering/kafka" class="nav-link" data-nav="de-kafka">Kafka</a>
                                    <a href="/cheat-sheets/data-engineering/spark" class="nav-link" data-nav="de-spark">Spark</a>
                                    <a href="/cheat-sheets/behaviour/star" class="nav-link" data-nav="beh-star">STAR</a>
                                    <a href="/cheat-sheets/behaviour/questions" class="nav-link" data-nav="beh-questions">Behavioral Qs</a>
                                </div>
                            </div>
                        </div>
                        <a href="/cheat-sheets/" class="nav-mega-footer">Browse all Study Material <i class="fas fa-arrow-right"></i></a>
                    </div>
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
                <li class="nav-dropdown" data-dropdown="tools">
                    <button type="button" class="nav-dropdown-toggle" aria-expanded="false">
                        Tools <i class="fas fa-chevron-down"></i>
                    </button>
                    <ul class="nav-dropdown-menu">
                        <li><a href="/tools/" class="nav-link" data-nav="dev-tools">JSON · JWT · Base64</a></li>
                        <li><a href="/git-commands/" class="nav-link" data-nav="git-commands">Git Commands</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </header>`;

    const CORE_SLUGS = [
        'load-balancing', 'api-gateway', 'service-discovery', 'cache-design', 'cdn', 'messaging-queue',
        'zookeeper', 'circuit-breaker', 'sharding', 'sql-vs-nosql', 'consistent-hashing', 'cap-theorem',
        'solid-principles', 'cdc', 'event-driven-architecture', 'serverless', 'inverted-indexing', 'websocket',
        'rate-limiting', 'data-warehouse', 'bloom-filter', 'hyperloglog', 'forward-reverse-proxy',
        'quadtree-geohashing', 'distributed-transaction', 'vector-db', 'outbox-pattern', 'materialized-view',
        'perceptual-hash', 'trie', 'lambda-architecture',
    ];

    const CHEAT_SHEET_NAV_MAP = {
        '/cheat-sheets/system-design': 'sd-hub',
        '/cheat-sheets/system-design/core': 'sd-core-hub',
        '/cheat-sheets/system-design/google': 'sd-google-hub',
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
        '/cheat-sheets/system-design/google-news': 'sd-google-news',
        '/cheat-sheets/system-design/google-feature-flags': 'sd-google-feature-flags',
        '/cheat-sheets/system-design/google-ads-bidding': 'sd-google-ads-bidding',
        '/cheat-sheets/system-design/google-photos-duplicate': 'sd-google-photos-duplicate',
        '/cheat-sheets/system-design/google-docs': 'sd-google-docs',
        '/cheat-sheets/system-design/chrome-malware-detection': 'sd-chrome-malware',
        '/cheat-sheets/system-design/gmail-search': 'sd-gmail-search',
        '/cheat-sheets/system-design/google-trends': 'sd-google-trends',
        '/cheat-sheets/system-design/google-street-view': 'sd-google-street-view',
        '/cheat-sheets/system-design/google-realtime-analytics': 'sd-google-realtime-analytics',
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
        '/cheat-sheets/dsa': 'dsa-hub',
        '/cheat-sheets/dsa/patterns': 'dsa-patterns',
        '/cheat-sheets/dsa/top-problems': 'dsa-problems',
        '/cheat-sheets/dsa/leetcode-25': 'dsa-leetcode-25',
        '/cheat-sheets/data-engineering/kafka': 'de-kafka',
        '/cheat-sheets/data-engineering/spark': 'de-spark',
        '/cheat-sheets/behaviour/star': 'beh-star',
        '/cheat-sheets/behaviour/questions': 'beh-questions',
        '/binodtech': 'binodtech',
    };

    CORE_SLUGS.forEach((slug) => {
        CHEAT_SHEET_NAV_MAP[`/cheat-sheets/system-design/core/${slug}`] = `sd-core-${slug}`;
    });

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
        } else if (path === '/tools' || path.endsWith('/tools')) {
            markChildActive('tools', 'dev-tools');
        } else if (path === '/git-commands' || path.endsWith('/git-commands')) {
            markChildActive('tools', 'git-commands');
        } else if (path.startsWith('/cheat-sheets')) {
            const navId = CHEAT_SHEET_NAV_MAP[path];
            if (navId) {
                markChildActive('cheat-sheets', navId);
                if (path.includes('/core/')) {
                    activateMegaTab('sd');
                } else if (path.includes('/google') || path.includes('google-') || path.endsWith('youtube-streaming')) {
                    activateMegaTab('sd');
                } else if (path.startsWith('/cheat-sheets/ai')) {
                    activateMegaTab('ai');
                }
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

        document.querySelectorAll('.nav-mega-tab').forEach((tab) => {
            tab.addEventListener('click', (e) => {
                e.stopPropagation();
                activateMegaTab(tab.getAttribute('data-mega-tab'));
            });
        });

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

        navMenu?.querySelectorAll('.nav-link, .nav-mega-hub').forEach(link => {
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

    function activateMegaTab(tabId) {
        document.querySelectorAll('.nav-mega-tab').forEach((t) => {
            const active = t.getAttribute('data-mega-tab') === tabId;
            t.classList.toggle('active', active);
            t.setAttribute('aria-selected', active);
        });
        document.querySelectorAll('.nav-mega-panel').forEach((p) => {
            const active = p.getAttribute('data-mega-panel') === tabId;
            p.classList.toggle('active', active);
            p.hidden = !active;
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
