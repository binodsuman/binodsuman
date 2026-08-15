import fs from 'fs';
import path from 'path';
import { aiPages } from './ai-sheets.mjs';
import { sdPages } from './sd-sheets.mjs';
import { legacyPages } from './legacy-sheets.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');

const HEAD = (title, desc) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Binod Suman Cheat Sheet</title>
    <meta name="description" content="${desc.replace(/"/g, '&quot;')}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Kalam:wght@400;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/site-nav.css">
    <link rel="stylesheet" href="/css/cheat-sheet.css">
</head>
<body class="cheat-sheet-page">
<main class="cheat-sheet-page">
<div class="cs-container">`;

const FOOT = `
</div>
</main>
<script src="/js/cheat-sheet-videos.js"></script>
<script src="/js/cheat-sheet-prompts.js"></script>
<script src="/js/cheat-sheet.js"></script>
<script src="/js/site-nav.js"></script>
</body>
</html>`;

function tocHtml(papers) {
  return `<nav class="cs-toc" aria-label="On this page">
    <div class="cs-toc-title">On this page</div>
    <ol>${papers.map((p, i) => `<li><a href="#cs-section-${i}">${p.title}</a></li>`).join('')}</ol>
  </nav>`;
}

function page({ badge, badgeClass, title, subtitle, breadcrumb, tip, papers, related }) {
  const papersHtml = papers
    .map(
      (p, i) => `
    <div class="cs-paper" id="cs-section-${i}">
        <h2 class="cs-section-title">${p.title}</h2>
        ${p.body}
    </div>`
    )
    .join('');

  const relatedHtml = related?.length
    ? `<div class="cs-related"><h3>More in this category</h3><div class="cs-related-links">${related
        .map((r) => `<a href="${r.href}">${r.label}</a>`)
        .join('')}</div></div>`
    : '';

  return `${HEAD(title, subtitle)}
    <nav class="cs-breadcrumb">${breadcrumb}</nav>
    <header class="cs-hero">
        <span class="cs-category-badge ${badgeClass}">${badge}</span>
        <h1 class="cs-title">${title}</h1>
        <p class="cs-subtitle">${subtitle}</p>
    </header>
    <div class="cs-interview-tip"><strong>Interview tip</strong> ${tip}</div>
    ${tocHtml(papers)}
    ${papersHtml}
    ${relatedHtml}
${FOOT}`;
}

function hubPage({ title, subtitle, badge, badgeClass, breadcrumb, sections }) {
  const sectionsHtml = sections
    .map(
      (s) =>
        `<div class="cs-hub-card"><h2>${s.label}</h2><ul>${s.links
          .map((l) => `<li><a href="${l.href}">${l.label}</a></li>`)
          .join('')}</ul></div>`
    )
    .join('');

  return `${HEAD(title, subtitle)}
    <nav class="cs-breadcrumb">${breadcrumb}</nav>
    <header class="cs-hero">
        <span class="cs-category-badge ${badgeClass}">${badge}</span>
        <h1 class="cs-title">${title}</h1>
        <p class="cs-subtitle">${subtitle}</p>
    </header>
    <div class="cs-hub-grid">${sectionsHtml}</div>
${FOOT}`;
}

function writePage(filePath, html) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, html, 'utf8');
  console.log('written', filePath);
}

function writePromptsFile(entries) {
  const obj = Object.fromEntries(entries);
  const js = `/** Auto-generated LLM practice prompts per cheat sheet path */\nwindow.CHEAT_SHEET_PROMPTS = ${JSON.stringify(obj, null, 2)};\n`;
  fs.writeFileSync(path.join(ROOT, 'js/cheat-sheet-prompts.js'), js, 'utf8');
  console.log('written js/cheat-sheet-prompts.js', Object.keys(obj).length, 'prompts');
}

const promptEntries = [];

for (const p of aiPages) {
  const pathKey = `/cheat-sheets/ai/${p.slug}`;
  if (p.prompt) promptEntries.push([pathKey, p.prompt]);
  const html = page({
    badge: 'AI',
    badgeClass: 'ai',
    title: p.title,
    subtitle: p.subtitle,
    breadcrumb: `<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · <a href="/cheat-sheets/ai/">AI</a> · ${p.title}`,
    tip: p.tip,
    papers: p.papers,
    related: [
      { href: '/cheat-sheets/ai/', label: 'All AI cheat sheets' },
      { href: '/cheat-sheets/ai/rag', label: 'RAG' },
      { href: '/cheat-sheets/ai/agents-intro', label: 'What is an Agent?' },
    ],
  });
  writePage(path.join(ROOT, 'cheat-sheets/ai', p.slug, 'index.html'), html);
}

for (const p of sdPages) {
  const pathKey = `/cheat-sheets/system-design/${p.slug}`;
  if (p.prompt) promptEntries.push([pathKey, p.prompt]);
  const html = page({
    badge: 'System Design',
    badgeClass: 'system-design',
    title: p.title,
    subtitle: p.subtitle,
    breadcrumb: `<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · <a href="/cheat-sheets/system-design/">System Design</a> · ${p.title}`,
    tip: p.tip,
    papers: p.papers,
    related: [
      { href: '/cheat-sheets/system-design/', label: 'All SD cheat sheets' },
      { href: '/cheat-sheets/system-design/fundamentals', label: 'SD Fundamentals' },
      { href: '/cheat-sheets/system-design/url-shortener', label: 'URL Shortener' },
    ],
  });
  writePage(path.join(ROOT, 'cheat-sheets/system-design', p.slug, 'index.html'), html);
}

const aiHubLinks = [
  { href: '/cheat-sheets/ai/roadmap', label: 'AI Master Roadmap' },
  { href: '/cheat-sheets/ai/ml-interview', label: 'ML/DL Interview Guide' },
  ...aiPages.map((p) => ({ href: `/cheat-sheets/ai/${p.slug}`, label: p.title })),
];

const sdHubLinks = [
  { href: '/cheat-sheets/system-design/fundamentals', label: 'SD Fundamentals' },
  { href: '/cheat-sheets/system-design/patterns', label: 'SD Interview Patterns' },
  ...sdPages.map((p) => ({ href: `/cheat-sheets/system-design/${p.slug}`, label: p.title })),
];

writePage(
  path.join(ROOT, 'cheat-sheets/ai/index.html'),
  hubPage({
    title: 'AI Cheat Sheets',
    subtitle: 'Full-page revision notes — RAG, agents, LangChain, Cursor, Claude, MCP, and more.',
    badge: 'AI',
    badgeClass: 'ai',
    breadcrumb: '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · AI',
    sections: [
      { label: 'Foundations', links: aiHubLinks.filter((l) => /roadmap|ml-interview|prompt-engineering|embeddings|openai/.test(l.href)) },
      { label: 'LLM Apps', links: aiHubLinks.filter((l) => /rag|first-llm|fine-tuning/.test(l.href)) },
      { label: 'Agents & Frameworks', links: aiHubLinks.filter((l) => /agents|langchain|google-adk|n8n|mcp/.test(l.href)) },
      { label: 'Developer Tools', links: aiHubLinks.filter((l) => /cursor|claude/.test(l.href)) },
    ],
  })
);

writePage(
  path.join(ROOT, 'cheat-sheets/system-design/index.html'),
  hubPage({
    title: 'System Design Cheat Sheets',
    subtitle: 'Top 15 interview questions — full revision sheets with diagrams, scale math, and trade-offs.',
    badge: 'System Design',
    badgeClass: 'system-design',
    breadcrumb: '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · System Design',
    sections: [
      { label: 'Core', links: sdHubLinks.slice(0, 2) },
      { label: 'Top 15 Interview Questions', links: sdHubLinks.slice(2) },
    ],
  })
);

for (const lp of legacyPages) {
  const pathKey = `/cheat-sheets/${lp.path}`;
  if (lp.prompt) promptEntries.push([pathKey, lp.prompt]);
  const html = page({
    badge: lp.badge,
    badgeClass: lp.badgeClass,
    title: lp.title,
    subtitle: lp.subtitle,
    breadcrumb: lp.breadcrumb,
    tip: lp.tip,
    papers: lp.papers,
    related: lp.related || [],
  });
  writePage(path.join(ROOT, 'cheat-sheets', lp.path, 'index.html'), html);
}

writePromptsFile(promptEntries);

console.log(`Generated ${aiPages.length} AI + ${sdPages.length} SD + ${legacyPages.length} legacy pages + 2 hubs + ${promptEntries.length} prompts`);
