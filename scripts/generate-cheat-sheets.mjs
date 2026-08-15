import fs from 'fs';
import path from 'path';

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
<script src="/js/cheat-sheet.js"></script>
<script src="/js/site-nav.js"></script>
</body>
</html>`;

function page({ badge, badgeClass, title, subtitle, breadcrumb, tip, papers, related }) {
  const papersHtml = papers.map((p) => `
    <div class="cs-paper">
        <h2 class="cs-section-title">${p.title}</h2>
        ${p.body}
    </div>`).join('');

  const relatedHtml = related?.length
    ? `<div class="cs-related"><h3>More in this category</h3><div class="cs-related-links">${related.map((r) => `<a href="${r.href}">${r.label}</a>`).join('')}</div></div>`
    : '';

  return `${HEAD(title, subtitle)}
    <nav class="cs-breadcrumb">${breadcrumb}</nav>
    <header class="cs-hero">
        <span class="cs-category-badge ${badgeClass}">${badge}</span>
        <h1 class="cs-title">${title}</h1>
        <p class="cs-subtitle">${subtitle}</p>
    </header>
    <div class="cs-interview-tip"><strong>Interview tip</strong> ${tip}</div>
    ${papersHtml}
    ${relatedHtml}
${FOOT}`;
}

function hubPage({ title, subtitle, badge, badgeClass, breadcrumb, sections }) {
  const sectionsHtml = sections.map((s) => `
    <div class="cs-hub-card"><h2>${s.label}</h2><ul>${s.links.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join('')}</ul></div>`).join('');

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

// ——— AI pages ———
const aiPages = [
  {
    slug: 'rag',
    title: 'RAG — Retrieval Augmented Generation',
    subtitle: 'Give your LLM a memory: retrieve facts from your data, then generate accurate answers.',
    tip: 'Say: "RAG = retrieve relevant chunks → stuff into prompt → LLM answers with grounded context." Mention vector DB + chunking + evaluation.',
    papers: [
      {
        title: 'What is RAG? (30-second version)',
        body: `<div class="cs-note">Plain LLMs only know training data. <strong>RAG</strong> fetches fresh documents at query time, so answers cite your wiki, tickets, or codebase — fewer hallucinations.</div>
        <div class="cs-diagram"><div class="cs-diagram-title">RAG pipeline</div>
        <div class="cs-flow"><span class="cs-box gray">User question</span><span class="cs-arrow">→</span>
        <span class="cs-box">Embed query</span><span class="cs-arrow">→</span>
        <span class="cs-box purple">Vector search</span><span class="cs-arrow">→</span>
        <span class="cs-box green">Top-k chunks</span><span class="cs-arrow">→</span>
        <span class="cs-box orange">LLM + prompt</span><span class="cs-arrow">→</span>
        <span class="cs-box">Answer</span></div></div>`
      },
      {
        title: 'Build steps (beginner)',
        body: `<div class="cs-note"><ol>
        <li><strong>Chunk docs</strong> — 300–800 tokens, overlap 50–100</li>
        <li><strong>Embed</strong> — OpenAI, Cohere, or open models</li>
        <li><strong>Store</strong> — Pinecone, pgvector, Chroma, Milvus</li>
        <li><strong>Retrieve</strong> — cosine similarity, top 3–8 chunks</li>
        <li><strong>Prompt</strong> — "Use only context below…" + cite sources</li>
        </ol></div>
        <div class="cs-tags"><span class="cs-tag">embeddings</span><span class="cs-tag">vector DB</span><span class="cs-tag">chunking</span></div>`
      },
      {
        title: 'Gotchas & trade-offs',
        body: `<div class="cs-table-wrap"><table class="cs-table"><tr><th>Problem</th><th>Fix</th></tr>
        <tr><td>Wrong chunks retrieved</td><td>Better chunking, hybrid search (BM25 + vectors)</td></tr>
        <tr><td>Stale data</td><td>Re-index pipeline, TTL on embeddings</td></tr>
        <tr><td>Huge context</td><td>Rerankers, MMR diversity, summarize chunks</td></tr>
        <tr><td>No citations</td><td>Force source IDs in prompt + UI</td></tr></table></div>`
      }
    ]
  },
  {
    slug: 'first-llm-integration',
    title: 'First LLM Integration',
    subtitle: 'From zero to a working API call — keys, prompts, streaming, and safe defaults.',
    tip: 'Walk through: pick provider → env vars for keys → one sync call → add streaming → add retries + timeouts.',
    papers: [
      {
        title: 'Minimal integration checklist',
        body: `<div class="cs-note"><ul>
        <li>Create API key; never commit — use <code>.env</code></li>
        <li>Pick model tier (fast vs smart): gpt-4o-mini, Claude Haiku, Gemini Flash for dev</li>
        <li>Start with <strong>one user message</strong> → string response</li>
        <li>Add <strong>system prompt</strong> for role + guardrails</li>
        <li>Log token usage & latency from day one</li>
        </ul></div>`
      },
      {
        title: 'Request flow',
        body: `<div class="cs-diagram"><div class="cs-diagram-title">Your app → LLM</div>
        <div class="cs-flow"><span class="cs-box">Frontend</span><span class="cs-arrow">→</span>
        <span class="cs-box purple">Your API</span><span class="cs-arrow">→</span>
        <span class="cs-box green">LLM provider</span><span class="cs-arrow">→</span>
        <span class="cs-box orange">Response</span></div></div>
        <div class="cs-note">Always call LLMs from <strong>your backend</strong> — not browser — to protect keys and apply rate limits.</div>`
      },
      {
        title: 'Production basics',
        body: `<div class="cs-note"><strong>Retries:</strong> exponential backoff on 429/5xx<br>
        <strong>Timeout:</strong> 30–60s max<br>
        <strong>Fallback:</strong> smaller model or cached answer<br>
        <strong>PII:</strong> scrub logs; consider data residency</div>`
      }
    ]
  },
  {
    slug: 'agents-intro',
    title: 'What is an AI Agent?',
    subtitle: 'LLM + tools + loop: the model plans, acts, observes, and repeats until the task is done.',
    tip: 'Contrast: chatbot = one-shot. Agent = multi-step with tools (search, code run, API calls). Mention human-in-the-loop for risky actions.',
    papers: [
      {
        title: 'Agent vs chatbot',
        body: `<div class="cs-table-wrap"><table class="cs-table"><tr><th>Chatbot</th><th>Agent</th></tr>
        <tr><td>Single LLM call</td><td>Loop: think → act → observe</td></tr>
        <tr><td>No side effects</td><td>Calls tools / APIs</td></tr>
        <tr><td>Predictable cost</td><td>Variable steps — cap max iterations</td></tr></table></div>`
      },
      {
        title: 'Core loop',
        body: `<div class="cs-layer-diagram">
        <div class="cs-layer l1">1. User goal</div>
        <div class="cs-layer l2">2. LLM plans next action</div>
        <div class="cs-layer l3">3. Tool executes (search, SQL, shell)</div>
        <div class="cs-layer l4">4. Result back to LLM → repeat or finish</div></div>`
      },
      {
        title: 'When to use agents',
        body: `<div class="cs-note"><ul>
        <li>Multi-step research, ticket triage, data analysis</li>
        <li>NOT for simple FAQ — use RAG + one call</li>
        <li>Always set <strong>max_steps</strong> and approval for writes/deletes</li>
        </ul></div>`
      }
    ]
  },
  {
    slug: 'create-first-agent',
    title: 'Create Your First Agent',
    subtitle: 'Hands-on path: one tool, one loop, one success criteria — then add complexity.',
    tip: 'Demo: agent that answers "What\'s the weather in X?" using a weather API tool. Shows plan + tool + parse.',
    papers: [
      {
        title: 'Step-by-step build',
        body: `<div class="cs-roadmap">
        <div class="cs-roadmap-step"><div><h4>Step 1 — Define tools</h4><p>JSON schema: name, description, parameters. One tool only first.</p></div></div>
        <div class="cs-roadmap-step"><div><h4>Step 2 — Prompt the planner</h4><p>"You have tools: … Return JSON action or final answer."</p></div></div>
        <div class="cs-roadmap-step"><div><h4>Step 3 — Run loop</h4><p>Parse action → invoke tool → append observation to context.</p></div></div>
        <div class="cs-roadmap-step"><div><h4>Step 4 — Stop conditions</h4><p>Final answer OR max 5 steps OR timeout.</p></div></div></div>`
      },
      {
        title: 'Pseudo-code sketch',
        body: `<div class="cs-note cs-handwritten">while not done and steps &lt; 5:<br>
        &nbsp;&nbsp;response = llm(messages + tool_defs)<br>
        &nbsp;&nbsp;if response.is_final: return response.text<br>
        &nbsp;&nbsp;result = run_tool(response.tool, response.args)<br>
        &nbsp;&nbsp;messages.append(observation=result)</div>`
      },
      {
        title: 'Safety checklist',
        body: `<div class="cs-note"><ul>
        <li>Allowlist tools — no arbitrary shell</li>
        <li>Validate tool args (types, ranges)</li>
        <li>Audit log every tool call</li>
        <li>Sandbox code execution</li>
        </ul></div>`
      }
    ]
  },
  {
    slug: 'langchain-basics',
    title: 'LangChain Basics',
    subtitle: 'Chains, prompts, retrievers, and agents — the popular Python framework for LLM apps.',
    tip: 'Know: LCEL (pipe syntax), ChatModel vs LLM, RunnableSequence. Say when you\'d use LangChain vs raw SDK.',
    papers: [
      {
        title: 'Key concepts',
        body: `<div class="cs-note"><ul>
        <li><strong>Models:</strong> ChatOpenAI, ChatAnthropic wrappers</li>
        <li><strong>Prompts:</strong> PromptTemplate, ChatPromptTemplate</li>
        <li><strong>Chains:</strong> prompt | model | parser</li>
        <li><strong>Retrievers:</strong> wrap vector stores for RAG</li>
        <li><strong>Agents:</strong> AgentExecutor + toolkits</li>
        </ul></div>`
      },
      {
        title: 'LCEL pipe example',
        body: `<div class="cs-note cs-handwritten">chain = prompt | model | StrOutputParser()<br>
        answer = chain.invoke({"question": "..."})</div>
        <div class="cs-diagram"><div class="cs-diagram-title">Chain flow</div>
        <div class="cs-flow"><span class="cs-box">Input dict</span><span class="cs-arrow">→</span>
        <span class="cs-box purple">Prompt</span><span class="cs-arrow">→</span>
        <span class="cs-box green">Model</span><span class="cs-arrow">→</span>
        <span class="cs-box orange">Parser</span></div></div>`
      },
      {
        title: 'LangChain vs raw API',
        body: `<div class="cs-table-wrap"><table class="cs-table"><tr><th>Use LangChain</th><th>Use raw SDK</th></tr>
        <tr><td>RAG + agents prototypes</td><td>Simple one-off calls</td></tr>
        <tr><td>Many integrations</td><td>Full control, less deps</td></tr>
        <tr><td>Team already uses it</td><td>Latency-critical microservice</td></tr></table></div>`
      }
    ]
  },
  {
    slug: 'google-adk',
    title: 'Google ADK (Agent Development Kit)',
    subtitle: 'Google\'s toolkit for building agents on Gemini — tools, sessions, and deployment paths.',
    tip: 'Mention Gemini models, Google Cloud auth, and how ADK structures agents similarly to other frameworks.',
    papers: [
      {
        title: 'What is ADK?',
        body: `<div class="cs-note">Google's <strong>Agent Development Kit</strong> helps you define agents with tools, orchestration, and testing — optimized for <strong>Gemini</strong> on Vertex AI / AI Studio.</div>`
      },
      {
        title: 'Typical pieces',
        body: `<div class="cs-note"><ul>
        <li><strong>Agent definition</strong> — instructions + model (Gemini)</li>
        <li><strong>Tools</strong> — custom functions, Google Search, code exec</li>
        <li><strong>Session / memory</strong> — multi-turn state</li>
        <li><strong>Deploy</strong> — Cloud Run, Agent Engine</li>
        </ul></div>
        <div class="cs-tags"><span class="cs-tag">Gemini</span><span class="cs-tag">Vertex AI</span><span class="cs-tag">tools</span></div>`
      },
      {
        title: 'Getting started',
        body: `<div class="cs-roadmap">
        <div class="cs-roadmap-step"><div><h4>1. API key / GCP project</h4><p>AI Studio for experiments; Vertex for production.</p></div></div>
        <div class="cs-roadmap-step"><div><h4>2. Install ADK</h4><p>Follow Google quickstart — Python package.</p></div></div>
        <div class="cs-roadmap-step"><div><h4>3. One agent + one tool</h4><p>Mirror your first-agent cheat sheet pattern.</p></div></div></div>`
      }
    ]
  },
  {
    slug: 'n8n-basics',
    title: 'n8n Basics for AI Workflows',
    subtitle: 'Low-code automation: connect APIs, LLMs, Slack, and databases without writing a full app.',
    tip: 'Great for ops automations: "new email → summarize with LLM → post to Slack." Not for core product logic at scale.',
    papers: [
      {
        title: 'What n8n does',
        body: `<div class="cs-note">Visual workflow builder. Nodes = triggers (webhook, schedule) + actions (HTTP, OpenAI, Google Sheets). Data passes as JSON between nodes.</div>
        <div class="cs-flow"><span class="cs-box gray">Trigger</span><span class="cs-arrow">→</span>
        <span class="cs-box">Transform</span><span class="cs-arrow">→</span>
        <span class="cs-box purple">LLM node</span><span class="cs-arrow">→</span>
        <span class="cs-box green">Slack / DB</span></div>`
      },
      {
        title: 'AI use cases',
        body: `<div class="cs-note"><ul>
        <li>RAG-lite: fetch URL → LLM summarize → store</li>
        <li>Support ticket classification</li>
        <li>Scheduled report generation</li>
        <li>Human approval step before send</li>
        </ul></div>`
      },
      {
        title: 'Limits',
        body: `<div class="cs-note"><strong>Pros:</strong> fast POC, non-dev friendly<br>
        <strong>Cons:</strong> versioning, testing, high-volume cost — migrate critical paths to code later.</div>`
      }
    ]
  },
  {
    slug: 'cursor-guide',
    title: 'How to Use Cursor',
    subtitle: 'AI-native IDE: chat, inline edit, Composer, rules, and repo-aware coding.',
    tip: 'Power moves: @file context, .cursorrules, Composer for multi-file features, terminal commands with approval.',
    papers: [
      {
        title: 'Core features',
        body: `<div class="cs-table-wrap"><table class="cs-table"><tr><th>Feature</th><th>Use for</th></tr>
        <tr><td>Chat (Ctrl+L)</td><td>Questions, small edits</td></tr>
        <tr><td>Inline (Ctrl+K)</td><td>Edit selection in place</td></tr>
        <tr><td>Composer</td><td>Multi-file features, refactors</td></tr>
        <tr><td>@ mentions</td><td>Pin files, docs, web to context</td></tr>
        <tr><td>Terminal</td><td>Run tests with AI assist</td></tr></table></div>`
      },
      {
        title: 'Workflow tips',
        body: `<div class="cs-note"><ul>
        <li>Write a <strong>spec</strong> in chat before codegen</li>
        <li>Add <code>.cursor/rules</code> for project conventions</li>
        <li>Review diffs — don't blindly accept</li>
        <li>Use smaller tasks: "add tests" then "implement"</li>
        </ul></div>`
      },
      {
        title: 'Privacy note',
        body: `<div class="cs-note">Check privacy mode / which models see your code. Don't paste secrets. Enterprise plans offer different data policies.</div>`
      }
    ]
  },
  {
    slug: 'claude-guide',
    title: 'How to Use Claude',
    subtitle: 'Anthropic\'s Claude for chat, Projects, API, and long-context reasoning.',
    tip: 'Claude strengths: long context, careful reasoning, structured output. Use Projects for persistent knowledge.',
    papers: [
      {
        title: 'Claude surfaces',
        body: `<div class="cs-note"><ul>
        <li><strong>claude.ai</strong> — chat, Projects, artifacts</li>
        <li><strong>API</strong> — Messages API, tool use, batch</li>
        <li><strong>Claude Code</strong> — terminal agent for repos</li>
        <li><strong>Models:</strong> Opus (best), Sonnet (balance), Haiku (fast)</li>
        </ul></div>`
      },
      {
        title: 'Prompt patterns',
        body: `<div class="cs-note"><ul>
        <li>Put instructions at top + bottom for long prompts</li>
        <li>Use XML tags: &lt;context&gt;, &lt;task&gt;, &lt;output&gt;</li>
        <li>Ask for step-by-step before final answer</li>
        <li>Tool use for structured actions in API</li>
        </ul></div>`
      },
      {
        title: 'When Claude fits best',
        body: `<div class="cs-note">Long documents, policy-heavy writing, code review with nuance, agentic coding with Claude Code.</div>`
      }
    ]
  },
  {
    slug: 'cursor-vs-claude-code',
    title: 'Cursor vs Claude Code',
    subtitle: 'Two AI coding assistants — IDE-integrated vs terminal-first. Pick by workflow, not hype.',
    tip: 'Cursor = daily IDE pair programmer. Claude Code = deep repo tasks from terminal / CI. Many devs use both.',
    papers: [
      {
        title: 'Side-by-side',
        body: `<div class="cs-table-wrap"><table class="cs-table"><tr><th>Cursor</th><th>Claude Code</th></tr>
        <tr><td>VS Code fork IDE</td><td>CLI / terminal agent</td></tr>
        <tr><td>Inline + Composer UI</td><td>Autonomous file edits</td></tr>
        <tr><td>Multi-model (GPT, Claude, …)</td><td>Anthropic Claude focused</td></tr>
        <tr><td>Best for interactive dev</td><td>Best for batch refactors, scripts</td></tr>
        <tr><td>Visual diff review</td><td>Git-aware terminal flow</td></tr></table></div>`
      },
      {
        title: 'Decision guide',
        body: `<div class="cs-note"><strong>Choose Cursor if:</strong> you want AI inside your editor all day.<br>
        <strong>Choose Claude Code if:</strong> you prefer terminal, large autonomous tasks, or headless automation.<br>
        <strong>Use both:</strong> Cursor for feature work; Claude Code for "migrate this module" jobs.</div>`
      }
    ]
  },
  {
    slug: 'prompt-engineering-basics',
    title: 'Prompt Engineering Basics',
    subtitle: 'Clear instructions, examples, structure, and evaluation — the foundation before fancy RAG.',
    tip: 'Framework: Role + Task + Context + Format + Constraints. Always show 1–2 few-shot examples for structured output.',
    papers: [
      {
        title: 'Anatomy of a good prompt',
        body: `<div class="cs-layer-diagram">
        <div class="cs-layer l1">Role — "You are a senior SD interviewer"</div>
        <div class="cs-layer l2">Task — "Design URL shortener in 5 bullets"</div>
        <div class="cs-layer l3">Context — requirements, constraints</div>
        <div class="cs-layer l4">Format — JSON, markdown table, max words</div></div>`
      },
      {
        title: 'Techniques',
        body: `<div class="cs-note"><ul>
        <li><strong>Few-shot</strong> — input/output examples</li>
        <li><strong>Chain-of-thought</strong> — "think step by step"</li>
        <li><strong>Self-check</strong> — "verify against rules before answer"</li>
        <li><strong>Temperature</strong> — 0 for facts, higher for creative</li>
        </ul></div>`
      }
    ]
  },
  {
    slug: 'embeddings-basics',
    title: 'Embeddings Basics',
    subtitle: 'Turn text into vectors so similarity search powers RAG, recommendations, and clustering.',
    tip: 'Explain: same embedding model for index + query; cosine similarity; dimension size affects cost.',
    papers: [
      {
        title: 'Core idea',
        body: `<div class="cs-note">Embedding model maps sentence → vector (e.g. 1536 floats). <strong>Similar meaning → close vectors.</strong> Used for search, dedup, classification.</div>
        <div class="cs-diagram"><div class="cs-diagram-title">Similarity</div>
        <div class="cs-flow"><span class="cs-box">"dog"</span><span class="cs-arrow">≈</span>
        <span class="cs-box purple">"puppy"</span><span class="cs-arrow">≠</span>
        <span class="cs-box orange">"car"</span></div></div>`
      },
      {
        title: 'Practical tips',
        body: `<div class="cs-note"><ul>
        <li>Normalize vectors for cosine dot product</li>
        <li>Batch embed for indexing speed</li>
        <li>Don't mix models in one index</li>
        <li>Evaluate retrieval with labeled Q→doc pairs</li>
        </ul></div>`
      }
    ]
  },
  {
    slug: 'openai-api-basics',
    title: 'OpenAI API Basics',
    subtitle: 'Chat Completions, responses API, tools, embeddings, and billing gotchas.',
    tip: 'Know message roles (system/user/assistant), token limits, structured outputs, and function calling flow.',
    papers: [
      {
        title: 'API surfaces',
        body: `<div class="cs-note"><ul>
        <li><strong>Chat / Responses</strong> — conversational apps</li>
        <li><strong>Embeddings</strong> — text-embedding-3-small/large</li>
        <li><strong>Images / Audio</strong> — separate endpoints</li>
        <li><strong>Batch API</strong> — 50% cost, 24h window</li>
        </ul></div>`
      },
      {
        title: 'Function calling',
        body: `<div class="cs-flow"><span class="cs-box">User</span><span class="cs-arrow">→</span>
        <span class="cs-box purple">Model</span><span class="cs-arrow">→</span>
        <span class="cs-box green">tool_call JSON</span><span class="cs-arrow">→</span>
        <span class="cs-box orange">Your function</span><span class="cs-arrow">→</span>
        <span class="cs-box">Final reply</span></div>`
      }
    ]
  },
  {
    slug: 'fine-tuning-basics',
    title: 'Fine-Tuning Basics',
    subtitle: 'When to train vs prompt — customize behavior, tone, or format on your examples.',
    tip: 'Default order: prompt engineering → RAG → fine-tune. Fine-tune for style/format or niche domain with lots of examples.',
    papers: [
      {
        title: 'When to fine-tune',
        body: `<div class="cs-table-wrap"><table class="cs-table"><tr><th>Fine-tune</th><th>Don't fine-tune yet</th></tr>
        <tr><td>Consistent output format</td><td>Need fresh facts → RAG</td></tr>
        <tr><td>Brand tone at scale</td><td>&lt; 100 good examples</td></tr>
        <tr><td>Specialized classification</td><td>Can solve with prompt</td></tr></table></div>`
      },
      {
        title: 'Process sketch',
        body: `<div class="cs-roadmap">
        <div class="cs-roadmap-step"><div><h4>Curate JSONL examples</h4><p>input → ideal output, diverse edge cases.</p></div></div>
        <div class="cs-roadmap-step"><div><h4>Train + validate holdout</h4><p>Compare vs base model on same prompts.</p></div></div>
        <div class="cs-roadmap-step"><div><h4>Deploy + monitor drift</h4><p>Re-train when product changes.</p></div></div></div>`
      }
    ]
  },
  {
    slug: 'mcp-basics',
    title: 'MCP (Model Context Protocol) Basics',
    subtitle: 'Standard way to plug tools, data sources, and IDEs into LLM clients — one protocol, many servers.',
    tip: 'MCP = USB-C for AI tools. Host (Cursor, Claude) connects to MCP servers (GitHub, DB, filesystem).',
    papers: [
      {
        title: 'Architecture',
        body: `<div class="cs-diagram"><div class="cs-diagram-title">MCP flow</div>
        <div class="cs-flow"><span class="cs-box">MCP Host</span><span class="cs-arrow">↔</span>
        <span class="cs-box purple">MCP Server</span><span class="cs-arrow">↔</span>
        <span class="cs-box green">Tool / Data</span></div></div>
        <div class="cs-note">Servers expose <strong>resources</strong> (read data) and <strong>tools</strong> (actions). Host discovers capabilities at connect time.</div>`
      },
      {
        title: 'Why it matters',
        body: `<div class="cs-note"><ul>
        <li>Reuse integrations across Cursor, Claude Desktop, custom apps</li>
        <li>Community servers: Postgres, Slack, Brave search</li>
        <li>Build your own server for internal APIs</li>
        </ul></div>`
      }
    ]
  }
];

// ——— System Design top 15 ———
const sdPages = [
  {
    slug: 'url-shortener',
    title: 'Design URL Shortener',
    subtitle: 'bit.ly / TinyURL — hash or counter IDs, redirects, analytics, and collision handling.',
    tip: 'Clarify: custom aliases? expiration? 100M URLs/month? Read path is 100× write — cache hot redirects.',
    papers: [
      {
        title: 'Requirements',
        body: `<div class="cs-note"><strong>Functional:</strong> shorten long URL → short code; redirect; optional custom slug; analytics clicks<br>
        <strong>Non-functional:</strong> low latency redirect (&lt;100ms); high availability; unique codes</div>`
      },
      {
        title: 'High-level design',
        body: `<div class="cs-flow"><span class="cs-box gray">Client</span><span class="cs-arrow">→</span>
        <span class="cs-box">API</span><span class="cs-arrow">→</span>
        <span class="cs-box purple">ID service</span><span class="cs-arrow">→</span>
        <span class="cs-box green">DB (long↔short)</span><br><br>
        <span class="cs-box gray">Redirect</span><span class="cs-arrow">→</span>
        <span class="cs-box">CDN/Cache</span><span class="cs-arrow">→</span>
        <span class="cs-box orange">302 to long URL</span></div>`
      },
      {
        title: 'Key decisions',
        body: `<div class="cs-note"><ul>
        <li><strong>ID:</strong> base62 counter (Snowflake) or hash (collision check)</li>
        <li><strong>Cache:</strong> Redis for top 20% URLs = 80% traffic</li>
        <li><strong>DB:</strong> SQL for strong uniqueness or NoSQL at scale</li>
        <li><strong>Analytics:</strong> async queue → click stream store</li>
        </ul></div>`
      }
    ]
  },
  {
    slug: 'rate-limiter',
    title: 'Design Rate Limiter',
    subtitle: 'Protect APIs with token bucket, sliding window, or leaky bucket — per user, IP, or API key.',
    tip: 'Compare algorithms. Mention distributed rate limit with Redis + atomic INCR or Lua scripts.',
    papers: [
      {
        title: 'Requirements',
        body: `<div class="cs-note">Limit N requests per window per client. Return 429 + Retry-After. Must work across multiple API servers (distributed).</div>`
      },
      {
        title: 'Algorithms',
        body: `<div class="cs-table-wrap"><table class="cs-table"><tr><th>Algorithm</th><th>Pros</th><th>Cons</th></tr>
        <tr><td>Token bucket</td><td>Bursts allowed</td><td>Config tokens/refill</td></tr>
        <tr><td>Fixed window</td><td>Simple</td><td>Spike at window edge</td></tr>
        <tr><td>Sliding window log</td><td>Accurate</td><td>Memory per user</td></tr>
        <tr><td>Sliding window counter</td><td>Good balance</td><td>Slight approximation</td></tr></table></div>`
      },
      {
        title: 'Distributed pattern',
        body: `<div class="cs-flow"><span class="cs-box">API server</span><span class="cs-arrow">→</span>
        <span class="cs-box purple">Redis</span><span class="cs-arrow">→</span>
        <span class="cs-box green">allow / deny</span></div>
        <div class="cs-note">Optional local cache for hot keys; sync with Redis for accuracy on strict limits.</div>`
      }
    ]
  },
  {
    slug: 'chat-system',
    title: 'Design Chat / Messaging System',
    subtitle: 'WhatsApp-scale messaging — WebSockets, delivery guarantees, and group chat.',
    tip: 'Cover: online presence, message ordering, at-least-once + idempotency, fan-out for groups.',
    papers: [
      {
        title: 'Requirements',
        body: `<div class="cs-note">1:1 and group chat, online status, read receipts, push when offline, message history, media attachments.</div>`
      },
      {
        title: 'Architecture',
        body: `<div class="cs-layer-diagram">
        <div class="cs-layer l1">Clients ↔ WebSocket gateway</div>
        <div class="cs-layer l2">Chat service (routing, seq IDs)</div>
        <div class="cs-layer l3">Message store (per-user inbox copies)</div>
        <div class="cs-layer l4">Push notification service</div></div>`
      },
      {
        title: 'Deep dives',
        body: `<div class="cs-note"><ul>
        <li><strong>Ordering:</strong> per-channel sequence number</li>
        <li><strong>Groups:</strong> fan-out on write vs read — pick based on group size</li>
        <li><strong>Presence:</strong> heartbeat + Redis TTL</li>
        <li><strong>Idempotency:</strong> client message UUID dedupe</li>
        </ul></div>`
      }
    ]
  },
  {
    slug: 'news-feed',
    title: 'Design News Feed',
    subtitle: 'Facebook/Instagram feed — fan-out on write vs read, ranking, and pagination.',
    tip: 'Classic trade-off: push model for normal users, pull for celebrities with millions of followers.',
    papers: [
      {
        title: 'Requirements',
        body: `<div class="cs-note">Users post; followers see ranked feed; infinite scroll; real-time-ish updates.</div>`
      },
      {
        title: 'Fan-out strategies',
        body: `<div class="cs-table-wrap"><table class="cs-table"><tr><th>Fan-out on write</th><th>Fan-out on read</th></tr>
        <tr><td>Precompute feed at post time</td><td>Merge timelines at read time</td></tr>
        <tr><td>Fast reads</td><td>Slow for hot users</td></tr>
        <tr><td>Heavy writes for celebs</td><td>Hybrid: push normal, pull celeb</td></tr></table></div>`
      },
      {
        title: 'Ranking',
        body: `<div class="cs-note">Score = f(recency, engagement, affinity). Precompute features; ML ranker offline; cache ranked slices per user.</div>`
      }
    ]
  },
  {
    slug: 'twitter-timeline',
    title: 'Design Twitter Timeline',
    subtitle: 'Home timeline, tweets, retweets, trending — hybrid fan-out and search.',
    tip: 'Same fan-out hybrid as news feed. Add tweet ID as snowflake, search index for @mentions and hashtags.',
    papers: [
      {
        title: 'Entities',
        body: `<div class="cs-note">User, Tweet, Follow graph, Timeline cache, Social graph service, Search index (Elasticsearch).</div>`
      },
      {
        title: 'Tweet write path',
        body: `<div class="cs-flow"><span class="cs-box">Post tweet</span><span class="cs-arrow">→</span>
        <span class="cs-box purple">Tweet DB</span><span class="cs-arrow">→</span>
        <span class="cs-box green">Fan-out workers</span><span class="cs-arrow">→</span>
        <span class="cs-box orange">Follower timeline caches</span></div>`
      },
      {
        title: 'Scale notes',
        body: `<div class="cs-note">Celebrity problem → don't fan-out to millions; merge on read. Rate limit tweets. CDN for media.</div>`
      }
    ]
  },
  {
    slug: 'youtube-streaming',
    title: 'Design YouTube / Video Streaming',
    subtitle: 'Upload pipeline, transcoding, CDN delivery, and view counting at scale.',
    tip: 'Separate upload path (blob storage + queue + workers) from read path (CDN + adaptive bitrate).',
    papers: [
      {
        title: 'Upload flow',
        body: `<div class="cs-flow"><span class="cs-box gray">Upload</span><span class="cs-arrow">→</span>
        <span class="cs-box">Object store</span><span class="cs-arrow">→</span>
        <span class="cs-box purple">Transcode queue</span><span class="cs-arrow">→</span>
        <span class="cs-box green">Multiple resolutions</span><span class="cs-arrow">→</span>
        <span class="cs-box orange">CDN</span></div>`
      },
      {
        title: 'Watch flow',
        body: `<div class="cs-note">Client picks bitrate based on bandwidth (HLS/DASH). Edge CDN serves 95%+ requests. Origin only on cache miss.</div>`
      },
      {
        title: 'View counts',
        body: `<div class="cs-note">Aggregate in memory → flush batches to DB. Approximate counts OK for display. Separate hot counters in Redis.</div>`
      }
    ]
  },
  {
    slug: 'instagram-photos',
    title: 'Design Instagram / Photo Sharing',
    subtitle: 'Photo upload, feed, likes, comments, and object storage at global scale.',
    tip: 'Photos → S3 + CDN thumbnails. Metadata in SQL/NoSQL. Feed same as news feed patterns.',
    papers: [
      {
        title: 'Components',
        body: `<div class="cs-note"><ul>
        <li>Media service — resize, filter, store variants</li>
        <li>Feed service — ranked photo stream</li>
        <li>Social graph — follows</li>
        <li>Notification — likes/comments</li>
        </ul></div>`
      },
      {
        title: 'Upload path',
        body: `<div class="cs-flow"><span class="cs-box">Mobile</span><span class="cs-arrow">→</span>
        <span class="cs-box purple">API</span><span class="cs-arrow">→</span>
        <span class="cs-box green">S3 + workers</span><span class="cs-arrow">→</span>
        <span class="cs-box orange">CDN URLs in DB</span></div>`
      }
    ]
  },
  {
    slug: 'web-crawler',
    title: 'Design Web Crawler',
    subtitle: 'Distributed crawl frontier, politeness, deduplication, and storing billions of pages.',
    tip: 'BFS frontier in queue, robots.txt respect, bloom filter for seen URLs, separate fetch vs parse workers.',
    papers: [
      {
        title: 'Requirements',
        body: `<div class="cs-note">Discover URLs from seeds, fetch HTML, extract links, store content, respect rate per domain, avoid duplicates.</div>`
      },
      {
        title: 'Architecture',
        body: `<div class="cs-flow"><span class="cs-box gray">URL frontier</span><span class="cs-arrow">→</span>
        <span class="cs-box">Fetcher pool</span><span class="cs-arrow">→</span>
        <span class="cs-box purple">Parser</span><span class="cs-arrow">→</span>
        <span class="cs-box green">Link extractor</span><span class="cs-arrow">→</span>
        <span class="cs-box orange">Document store</span></div>`
      },
      {
        title: 'Politeness',
        body: `<div class="cs-note">Per-domain queue + delay. robots.txt cache. Max depth / domain caps. Priority for important sites.</div>`
      }
    ]
  },
  {
    slug: 'file-storage',
    title: 'Design Dropbox / File Storage',
    subtitle: 'Sync, versioning, metadata vs blob split, and multi-device consistency.',
    tip: 'Metadata in DB, files in object storage. Chunk large files for delta sync. Eventual consistency across devices.',
    papers: [
      {
        title: 'Split storage',
        body: `<div class="cs-table-wrap"><table class="cs-table"><tr><th>Metadata DB</th><th>Blob store</th></tr>
        <tr><td>path, owner, versions</td><td>actual file bytes</td></tr>
        <tr><td>permissions, shares</td><td>S3 / GCS with CDN</td></tr></table></div>`
      },
      {
        title: 'Sync model',
        body: `<div class="cs-note">Client uploads chunks with hashes → server detects what changed → only transfer deltas. Conflict: last-write-wins or version branches.</div>`
      }
    ]
  },
  {
    slug: 'typeahead',
    title: 'Design Typeahead / Autocomplete',
    subtitle: 'Search suggestions as you type — prefix indexes, trie, and ranking at low latency.',
    tip: 'Target &lt;100ms p99. Precompute top queries. Trie or Elasticsearch completion suggester. Cache hot prefixes.',
    papers: [
      {
        title: 'Data prep',
        body: `<div class="cs-note">Aggregate query logs → top K suggestions per prefix. Periodic batch job refreshes. Filter NSFW / stale terms.</div>`
      },
      {
        title: 'Query path',
        body: `<div class="cs-flow"><span class="cs-box gray">"appl"</span><span class="cs-arrow">→</span>
        <span class="cs-box">Cache</span><span class="cs-arrow">→</span>
        <span class="cs-box purple">Trie / ES</span><span class="cs-arrow">→</span>
        <span class="cs-box green">Ranked list</span></div>`
      },
      {
        title: 'Ranking signals',
        body: `<div class="cs-note">Popularity, personalization (optional), recency, prefix match quality.</div>`
      }
    ]
  },
  {
    slug: 'api-gateway',
    title: 'Design API Gateway',
    subtitle: 'Single entry point — auth, routing, rate limits, SSL termination, and observability.',
    tip: 'Gateway vs service mesh: gateway at edge; mesh for internal east-west. Mention Kong, AWS API GW patterns.',
    papers: [
      {
        title: 'Responsibilities',
        body: `<div class="cs-note"><ul>
        <li>Authentication / JWT validation</li>
        <li>Rate limiting & quotas</li>
        <li>Request routing to microservices</li>
        <li>SSL, compression, request logging</li>
        <li>Circuit breaker to unhealthy backends</li>
        </ul></div>`
      },
      {
        title: 'Architecture',
        body: `<div class="cs-flow"><span class="cs-box gray">Clients</span><span class="cs-arrow">→</span>
        <span class="cs-box purple">API Gateway</span><span class="cs-arrow">→</span>
        <span class="cs-box green">Service A</span>
        <span class="cs-box green">Service B</span>
        <span class="cs-box green">Service C</span></div>`
      }
    ]
  },
  {
    slug: 'notification-system',
    title: 'Design Notification System',
    subtitle: 'Push, email, SMS — templates, preferences, queues, and delivery guarantees.',
    tip: 'Multi-channel fan-out from one event. User prefs table. Retry with DLQ. Idempotent notification IDs.',
    papers: [
      {
        title: 'Flow',
        body: `<div class="cs-flow"><span class="cs-box gray">Event</span><span class="cs-arrow">→</span>
        <span class="cs-box">Notification service</span><span class="cs-arrow">→</span>
        <span class="cs-box purple">Queue per channel</span><span class="cs-arrow">→</span>
        <span class="cs-box green">Workers</span><span class="cs-arrow">→</span>
        <span class="cs-box orange">APNs / FCM / SES</span></div>`
      },
      {
        title: 'Design points',
        body: `<div class="cs-note"><ul>
        <li>Template engine + localization</li>
        <li>User channel preferences & quiet hours</li>
        <li>Priority queues for transactional vs marketing</li>
        <li>Delivery tracking & analytics</li>
        </ul></div>`
      }
    ]
  },
  {
    slug: 'distributed-cache',
    title: 'Design Distributed Cache',
    subtitle: 'Redis cluster, consistent hashing, replication, and cache invalidation strategies.',
    tip: 'Explain sharding, replication for HA, cache-aside vs read-through, and thundering herd mitigation.',
    papers: [
      {
        title: 'Why distributed',
        body: `<div class="cs-note">Single Redis hits memory limit. Shard by key hash across nodes. Each shard primary + replica.</div>`
      },
      {
        title: 'Consistent hashing',
        body: `<div class="cs-note">Keys → hash ring → node. Add node = minimal key movement. Virtual nodes for balance.</div>`
      },
      {
        title: 'Invalidation',
        body: `<div class="cs-table-wrap"><table class="cs-table"><tr><th>Strategy</th><th>When</th></tr>
        <tr><td>TTL</td><td>Stale OK briefly</td></tr>
        <tr><td>Delete on write</td><td>Strong consistency need</td></tr>
        <tr><td>Pub/sub invalidate</td><td>Multi-region caches</td></tr></table></div>`
      }
    ]
  },
  {
    slug: 'ticket-booking',
    title: 'Design Ticket Booking (Ticketmaster)',
    subtitle: 'Seat inventory, concurrency, holds, and preventing double booking.',
    tip: 'Core problem: atomic seat reservation. Redis lock or DB row lock + transactional booking flow.',
    papers: [
      {
        title: 'Requirements',
        body: `<div class="cs-note">Browse events, view seat map, temporary hold (5 min), payment, no double book, high spike on sale start.</div>`
      },
      {
        title: 'Booking flow',
        body: `<div class="cs-flow"><span class="cs-box">Select seats</span><span class="cs-arrow">→</span>
        <span class="cs-box purple">Hold (locked)</span><span class="cs-arrow">→</span>
        <span class="cs-box green">Payment</span><span class="cs-arrow">→</span>
        <span class="cs-box orange">Confirm / release hold</span></div>`
      },
      {
        title: 'Concurrency',
        body: `<div class="cs-note"><strong>Optimistic locking</strong> on seat row version<br>
        <strong>Or</strong> distributed lock per seat in Redis<br>
        Queue users at sale open — virtual waiting room</div>`
      }
    ]
  },
  {
    slug: 'uber-rides',
    title: 'Design Uber / Ride Sharing',
    subtitle: 'Matching drivers and riders, real-time location, pricing, and trip lifecycle.',
    tip: 'Geospatial index (quadtree/geohash) for nearby drivers. State machine for trip. Separate matching service.',
    papers: [
      {
        title: 'Core services',
        body: `<div class="cs-note"><ul>
        <li>Location service — driver GPS streams</li>
        <li>Matching — find nearest available driver</li>
        <li>Trip service — state: requested → accepted → ongoing → complete</li>
        <li>Pricing — surge, distance, time</li>
        <li>Payment — after trip</li>
        </ul></div>`
      },
      {
        title: 'Matching',
        body: `<div class="cs-flow"><span class="cs-box gray">Rider request</span><span class="cs-arrow">→</span>
        <span class="cs-box purple">Geo index query</span><span class="cs-arrow">→</span>
        <span class="cs-box green">Rank drivers</span><span class="cs-arrow">→</span>
        <span class="cs-box orange">Offer / accept</span></div>`
      },
      {
        title: 'Real-time',
        body: `<div class="cs-note">WebSocket for driver location to rider app. Kafka for location firehose. TTL on stale driver positions.</div>`
      }
    ]
  }
];

const aiHubLinks = [
  { href: '/cheat-sheets/ai/roadmap', label: 'AI Master Roadmap' },
  { href: '/cheat-sheets/ai/ml-interview', label: 'ML/DL Interview Guide' },
  ...aiPages.map((p) => ({ href: `/cheat-sheets/ai/${p.slug}`, label: p.title }))
];

const sdHubLinks = [
  { href: '/cheat-sheets/system-design/fundamentals', label: 'SD Fundamentals' },
  { href: '/cheat-sheets/system-design/patterns', label: 'SD Interview Patterns' },
  ...sdPages.map((p) => ({ href: `/cheat-sheets/system-design/${p.slug}`, label: p.title }))
];

// Write AI pages
for (const p of aiPages) {
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
      { href: '/cheat-sheets/ai/agents-intro', label: 'What is an Agent?' }
    ]
  });
  writePage(path.join(ROOT, 'cheat-sheets/ai', p.slug, 'index.html'), html);
}

// Write SD pages
for (const p of sdPages) {
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
      { href: '/cheat-sheets/system-design/url-shortener', label: 'URL Shortener' }
    ]
  });
  writePage(path.join(ROOT, 'cheat-sheets/system-design', p.slug, 'index.html'), html);
}

// AI hub
writePage(
  path.join(ROOT, 'cheat-sheets/ai/index.html'),
  hubPage({
    title: 'AI Cheat Sheets',
    subtitle: 'Basics to advanced — RAG, agents, LangChain, Cursor, Claude, MCP, and more. Handwritten-style notes for quick revision.',
    badge: 'AI',
    badgeClass: 'ai',
    breadcrumb: '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · AI',
    sections: [
      { label: 'Foundations', links: aiHubLinks.filter((l) => /roadmap|ml-interview|prompt-engineering|embeddings|openai/.test(l.href)) },
      { label: 'LLM Apps', links: aiHubLinks.filter((l) => /rag|first-llm|fine-tuning/.test(l.href)) },
      { label: 'Agents & Frameworks', links: aiHubLinks.filter((l) => /agents|langchain|google-adk|n8n|mcp/.test(l.href)) },
      { label: 'Developer Tools', links: aiHubLinks.filter((l) => /cursor|claude/.test(l.href)) }
    ]
  })
);

// SD hub
writePage(
  path.join(ROOT, 'cheat-sheets/system-design/index.html'),
  hubPage({
    title: 'System Design Cheat Sheets',
    subtitle: 'Top 15 interview questions with requirements, diagrams, scale estimates, and trade-offs — revision notes style.',
    badge: 'System Design',
    badgeClass: 'system-design',
    breadcrumb: '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · System Design',
    sections: [
      { label: 'Core', links: sdHubLinks.slice(0, 2) },
      { label: 'Top 15 Interview Questions', links: sdHubLinks.slice(2) }
    ]
  })
);

console.log(`Generated ${aiPages.length} AI + ${sdPages.length} SD pages + 2 hubs`);
