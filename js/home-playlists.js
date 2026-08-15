/** Playlists from @binodsuman YouTube channel */
(function () {
    const PLAYLISTS = [
        { title: 'Apache Kafka', id: 'PLIRnO_sdVuEf1Ao9hnE9G8c0WHd0MbsOk', icon: 'fa-stream', color: '#231f20' },
        { title: 'Apache Spark', id: 'PLIRnO_sdVuEd1KxK5GtTDfZGQJt9XhH5i', icon: 'fa-fire', color: '#e65a1e' },
        { title: 'Apache Flink', id: 'PLIRnO_sdVuEd2T_WnQ6uoThZhvPhaSRyI', icon: 'fa-bolt', color: '#e6522f' },
        { title: 'AWS Cloud', id: 'PLIRnO_sdVuEdpP7A83Q-RQcJm60dV22GF', icon: 'fa-aws', color: '#ff9900' },
        { title: 'Azure Cloud', id: 'PLIRnO_sdVuEcRzO3R6En_wr7aW7qk_qTO', icon: 'fa-microsoft', color: '#0078d4' },
        { title: 'Azure Logic Apps', id: 'PLIRnO_sdVuEdjLdD_twbsbF6EjsXuxT_e', icon: 'fa-project-diagram', color: '#0078d4' },
        { title: 'Azure Machine Learning', id: 'PLIRnO_sdVuEd7XpMFxCt9EcP_tSIEuaP0', icon: 'fa-brain', color: '#0078d4' },
        { title: 'Apache Zookeeper', id: 'PLIRnO_sdVuEdSDgDBDU2QbDPiFfAIDB-Q', icon: 'fa-server', color: '#2d3748' },
        { title: 'System Design', id: 'PLIRnO_sdVuEeyqzwYfDoJ3vbvJB4JBU6n', icon: 'fa-sitemap', color: '#6366f1' },
        { title: 'ChatGPT', id: 'PLIRnO_sdVuEcNu_8_jEpmydZLlhKGtYMU', icon: 'fa-robot', color: '#10a37f' },
        { title: 'Vector Database', id: 'PLIRnO_sdVuEepipjxaaahvOY-1YxfhSG7', icon: 'fa-database', color: '#38bdf8' },
        { title: 'NLP', id: 'PLIRnO_sdVuEc-vh_vO_AWZ2IY_Nr_i4I0', icon: 'fa-language', color: '#8b5cf6' },
        { title: 'Data Science Videos', id: 'PLIRnO_sdVuEdUadqQFYNRa8qNqU176Kzv', icon: 'fa-chart-line', color: '#0ea5e9' },
        { title: 'Python for Data Science', id: 'PLIRnO_sdVuEe9akED_lteoLf78j6i4--c', icon: 'fa-python', iconBrand: true, color: '#3776ab' },
        { title: 'Pandas', id: 'PLIRnO_sdVuEd6Cp4vROmkIey8lx2wNW2p', icon: 'fa-table', color: '#150458' },
        { title: 'Numpy', id: 'PLIRnO_sdVuEdhZQfYGJINfBa0dwv0RmcD', icon: 'fa-th', color: '#4dabcf' },
        { title: 'DS & Algo — LeetCode', id: 'PLIRnO_sdVuEehloCrpt330PC6tZX6O-6a', icon: 'fa-code', color: '#f59e0b' },
        { title: 'Java', id: 'PLIRnO_sdVuEc-jKtDUhNIwwgYTgTFJ3ZM', icon: 'fa-coffee', color: '#f89820' },
        { title: 'Spring Boot', id: 'PLIRnO_sdVuEd7ooTCT6P6xraNXcweH1K0', icon: 'fa-leaf', color: '#6db33f' },
        { title: 'Spring Framework', id: 'PLIRnO_sdVuEcp98w5LD_ci-QbyILdshuJ', icon: 'fa-leaf', color: '#6db33f' },
        { title: 'Spring Cloud', id: 'PLIRnO_sdVuEcthvfV6qIHEbuAh7u4_0Qr', icon: 'fa-cloud', color: '#6db33f' },
        { title: 'Spring Security', id: 'PLIRnO_sdVuEfFaM65FSIz6oCD1WmgEqIL', icon: 'fa-shield-alt', color: '#6db33f' },
        { title: 'Spring AOP', id: 'PLIRnO_sdVuEebZD7qWFLe1GGT1nDtjF9Z', icon: 'fa-layer-group', color: '#6db33f' },
        { title: 'Spring ORM', id: 'PLIRnO_sdVuEcLDZ8m7EBa9N3D9W3bCOIm', icon: 'fa-database', color: '#6db33f' },
        { title: 'Spring MVC', id: 'PLIRnO_sdVuEcE9Ps9LkSTRaEffOgRCHjf', icon: 'fa-code-branch', color: '#6db33f' },
        { title: 'Spring — Dependency Injection', id: 'PLIRnO_sdVuEfGFQ5DJfdWCrJwpCTDCDz8', icon: 'fa-plug', color: '#6db33f' },
        { title: 'QUARKUS', id: 'PLIRnO_sdVuEfhis9ygf8o-OjIoUGolYEO', icon: 'fa-bolt', color: '#4695eb' },
        { title: 'Containerisation', id: 'PLIRnO_sdVuEequLA-XX_5Yvi2cWKi8yHF', icon: 'fa-box', color: '#2496ed' },
        { title: 'Jaeger Tracing', id: 'PLIRnO_sdVuEeiznEYq-HQpMIKECt_I1Qw', icon: 'fa-route', color: '#60d0e4' },
        { title: 'Recommendation System', id: 'PLIRnO_sdVuEfrL7ZO9C1DST5RCXHap4-B', icon: 'fa-star', color: '#ec4899' },
        { title: 'Web Scraping', id: 'PLIRnO_sdVuEc9R9sFe3eDxzLz_xuvVmGP', icon: 'fa-spider', color: '#64748b' },
        { title: 'Installation', id: 'PLIRnO_sdVuEeR-MCURAbMhB2HA9ZEELNn', icon: 'fa-download', color: '#475569' },
    ];

    function renderPlaylists() {
        const grid = document.getElementById('playlist-grid');
        if (!grid) return;

        grid.innerHTML = PLAYLISTS.map((p) => `
            <a href="https://www.youtube.com/playlist?list=${p.id}" target="_blank" rel="noopener" class="playlist-card" title="${p.title}">
                <div class="playlist-thumb" style="background: linear-gradient(135deg, ${p.color}, ${p.color}cc);">
                    <i class="${p.iconBrand ? 'fab' : 'fas'} ${p.icon}"></i>
                </div>
                <div class="playlist-body">
                    <h3 class="playlist-title">${p.title}</h3>
                    <span class="playlist-cta">Open playlist <i class="fas fa-external-link-alt"></i></span>
                </div>
            </a>`).join('');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderPlaylists);
    } else {
        renderPlaylists();
    }
})();
