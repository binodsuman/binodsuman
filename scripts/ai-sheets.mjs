import { buildAIPages, note, table, flow, layers, diagram, checklist, tags } from './sheet-helpers.mjs';

const aiConfigs = [
  {
    slug: 'rag',
    title: 'RAG — Retrieval Augmented Generation',
    subtitle: 'Give your LLM a memory: retrieve facts from your data, then generate accurate answers.',
    tip: 'Say: "RAG = retrieve relevant chunks → stuff into prompt → LLM answers with grounded context." Mention vector DB + chunking + evaluation.',
    prompt: `You are a senior ML engineer running a mock interview on Retrieval Augmented Generation. Open by asking the candidate to explain RAG in 30 seconds without jargon. Then probe chunking: how would they chunk a 200-page PDF versus API reference docs? Ask why the same embedding model must be used at index and query time. Present a failure scenario: answers sound confident but citations point to wrong paragraphs — walk through debugging (recall@k, chunk boundaries, metadata filters, prompt instructions). Ask when RAG beats fine-tuning and when hybrid search or a reranker is worth the complexity. Hands-on twist: top-k=50 floods the context window and latency spikes — how do they fix it? Close with production concerns: eval datasets, re-index cadence, ACLs on documents, cost per query, and how to tell retrieval failure from generation hallucination. Score clarity, practical debugging, and production awareness.`,
    summary: `<strong>RAG</strong> augments an LLM at query time by retrieving relevant document chunks from your knowledge base, injecting them into the prompt, and asking the model to answer using only that context. Plain LLMs only know training data; RAG grounds answers in <em>your</em> wiki, tickets, codebase, or policies — reducing hallucinations and enabling fresh, citeable responses.`,
    analogy: 'Like an open-book exam: the LLM is the student, your vector DB is the textbook index, and retrieval finds the right pages before answering.',
    howItWorks:
      diagram('RAG pipeline', flow([
        { text: 'User question', class: 'gray' },
        { text: 'Embed query' },
        { text: 'Vector search', class: 'purple' },
        { text: 'Top-k chunks', class: 'green' },
        { text: 'LLM + prompt', class: 'orange' },
        { text: 'Answer + cites' },
      ])) +
      layers([
        'Ingestion — load docs (PDF, HTML, tickets), clean text, attach metadata',
        'Chunking — split into 300–800 token segments with 50–100 overlap',
        'Embedding — convert chunks to vectors; store in vector DB with IDs',
        'Retrieval — embed query, cosine similarity, optional BM25 hybrid + rerank',
        'Generation — system prompt: "Answer only from context below; cite sources"',
      ]),
    flowNote: 'Offline indexing (batch) is separate from online query path (real-time). Re-run ingestion when source docs change.',
    steps: [
      { title: 'Prepare documents', body: 'Collect sources (Notion export, Confluence, GitHub markdown). Strip boilerplate, preserve headings as metadata, and tag by team or product area for filtered retrieval.' },
      { title: 'Chunk intelligently', body: 'Use recursive character splitting on headings first, then paragraphs. Target 400–600 tokens with overlap so sentences are not cut mid-thought. Store source URL, page, and section in metadata.' },
      { title: 'Embed and index', body: 'Batch-embed chunks with text-embedding-3-small (or open alternative). Upsert into Pinecone, pgvector, Chroma, or Milvus. Verify dimension matches model output.' },
      { title: 'Build retrieval', body: 'Embed user query with the same model. Fetch top 5–8 by cosine similarity. Optionally merge BM25 keyword hits and rerank with cross-encoder for precision.' },
      { title: 'Craft the prompt', body: 'System: role + "use only provided context; say I don\'t know if missing." User: question + numbered context blocks with source IDs. Require citations in the answer format.' },
      { title: 'Evaluate and iterate', body: 'Create 30–50 labeled question→expected-doc pairs. Measure recall@k and answer faithfulness. Tune chunk size, k, and prompts until metrics plateau.' },
    ],
    patterns:
      table(['Pattern', 'When to use', 'Trade-off'], [
        ['Naive top-k', 'POC, small corpus', 'Fast; may miss nuance'],
        ['Hybrid (BM25 + vector)', 'Technical docs with exact terms', 'More infra; better recall'],
        ['Reranker (Cohere, bge)', 'High-stakes answers', '+latency, +cost'],
        ['Parent-child chunks', 'Long docs', 'Retrieve small, feed large parent'],
        ['Query rewriting', 'Vague user questions', 'Extra LLM call'],
      ]),
    codeHint: `<pre>// Minimal RAG query path
query_vec = embed(user_question)
chunks = vector_db.search(query_vec, top_k=6)
context = format_chunks(chunks)  // include source_id per chunk
messages = [
  { role: "system", content: "Answer only from context. Cite [source_id]." },
  { role: "user", content: f"Context:\\n{context}\\n\\nQ: {user_question}" }
]
answer = llm.chat(messages)</pre>`,
    pitfalls: [
      ['Wrong chunks retrieved', 'Confident but incorrect answers', 'Tune chunking, hybrid search, reranker, metadata filters'],
      ['Stale index', 'Outdated policies or APIs cited', 'Scheduled re-index; webhook on doc publish'],
      ['Context overflow', 'Truncated prompt, missed facts', 'Lower k, summarize chunks, parent-child retrieval'],
      ['No citations enforced', 'Users cannot verify claims', 'Require source IDs in prompt + UI links'],
      ['Mixed embedding models', 'Similarity scores meaningless', 'Re-embed entire index on model change'],
      ['Ignoring ACLs', 'Leaked confidential docs in answers', 'Filter by user permissions at retrieval time'],
    ],
    production: [
      'Log retrieval IDs and scores per query for debugging',
      'A/B test chunk sizes on a golden eval set before shipping',
      'Cache embeddings for frequent queries',
      'Monitor faithfulness with LLM-as-judge or human spot checks weekly',
    ],
    qa: [
      ['What is RAG?', 'Retrieve relevant docs at query time, inject into prompt, generate grounded answer — not retraining the model.'],
      ['RAG vs fine-tuning?', 'RAG for fresh facts and citations; fine-tune for style, format, or domain phrasing when examples are abundant.'],
      ['What is chunk overlap?', 'Repeated tokens between adjacent chunks so sentences split across boundaries are still retrievable.'],
      ['What is hybrid search?', 'Combine dense vector similarity with sparse keyword (BM25) retrieval, then merge or rerank results.'],
      ['How do you evaluate RAG?', 'Retrieval metrics (recall@k, MRR) plus answer quality (faithfulness, relevance) on labeled Q&A pairs.'],
      ['Why hallucinate with RAG?', 'Retrieved context irrelevant or empty; model fills gaps — fix retrieval or say "I don\'t know."'],
    ],
    tools: [
      '<strong>Vector DBs:</strong> Pinecone, pgvector, Weaviate, Chroma, Milvus, Qdrant',
      '<strong>Frameworks:</strong> LangChain, LlamaIndex, Haystack',
      '<strong>Embeddings:</strong> OpenAI text-embedding-3, Cohere embed-v3, BGE, Voyage',
      '<strong>Rerankers:</strong> Cohere Rerank, cross-encoder models (bge-reranker)',
      '<strong>Eval:</strong> RAGAS, TruLens, custom golden sets in spreadsheets',
    ],
    checklist: [
      'Same embedding model for index and queries',
      'Chunk size 300–800 tokens with overlap tested on sample docs',
      'Metadata includes source URL, title, section, access level',
      'System prompt forbids answering outside context',
      'Citations visible to end users',
      'Eval set of 30+ real questions with expected sources',
      'Re-index pipeline triggered on content updates',
      'Latency and cost per query logged (embed + LLM tokens)',
      'Hybrid or rerank considered if naive retrieval fails eval',
    ],
    tags: ['embeddings', 'vector-db', 'chunking', 'hybrid-search', 'evaluation'],
  },
  {
    slug: 'first-llm-integration',
    title: 'First LLM Integration',
    subtitle: 'From zero to a working API call — keys, prompts, streaming, and safe defaults.',
    tip: 'Walk through: pick provider → env vars for keys → one sync call → add streaming → add retries + timeouts.',
    prompt: `You are a hands-on tutor guiding a backend developer through their first LLM integration. Start by asking what they are building (chatbot, classifier, summarizer) and which provider they chose. Walk them through storing API keys in environment variables — never in git — and making a single synchronous call with one user message. Have them add a system prompt defining role and guardrails. Then introduce streaming for better UX and explain token usage fields in the response. Present a 429 rate-limit error: how do they implement exponential backoff? Ask why LLM calls must go through their backend, not the browser. Cover timeout values, max tokens, and logging latency plus cost from day one. End with a mini design: their app needs a fallback when the provider is down. Evaluate whether they understand security, observability, and incremental complexity rather than jumping straight to agents.`,
    summary: `Your first LLM integration is a <strong>backend API call</strong> to a provider (OpenAI, Anthropic, Google) with a structured prompt and safe defaults. Master the basics — keys in env vars, system + user messages, parsing the response, handling errors — before adding RAG, agents, or fine-tuning. Always proxy through your server to protect credentials and enforce rate limits.`,
    analogy: 'Like adding a payment gateway: start with one successful charge, then add webhooks, retries, and monitoring — not a custom bank on day one.',
    howItWorks:
      diagram('Request flow', flow([
        { text: 'Frontend / client' },
        { text: 'Your API (auth, rate limit)', class: 'purple' },
        { text: 'LLM provider', class: 'green' },
        { text: 'Stream or JSON response', class: 'orange' },
      ])) +
      layers([
        'Client sends user input to your endpoint — never the raw API key',
        'Your server validates input, applies auth, checks quotas',
        'Build messages array: system (role) + user (content) + optional history',
        'Call provider SDK with model, temperature, max_tokens, timeout',
        'Return text to client; log tokens, latency, and errors',
      ]),
    flowNote: 'Use a fast/cheap model (gpt-4o-mini, Claude Haiku, Gemini Flash) for development; swap to smarter models only where quality demands it.',
    steps: [
      { title: 'Create provider account and key', body: 'Sign up, generate API key, set billing alerts. Store key in .env locally and in your secrets manager (AWS Secrets Manager, Vault) in production.' },
      { title: 'Install SDK and hello-world', body: 'pip install openai or npm @anthropic-ai/sdk. One function: send "Hello" → print response. Confirm key works before building UI.' },
      { title: 'Add system prompt', body: 'Define persona, output format, and boundaries: "You are a support bot. Answer in 3 bullets. Do not invent refund policies."' },
      { title: 'Expose via your API', body: 'POST /api/chat with body { message }. Validate length, sanitize input, attach user ID for rate limiting. Return { reply, usage }.' },
      { title: 'Add streaming (optional)', body: 'Use SSE or WebSocket so tokens appear incrementally. Flush chunks to client; handle client disconnect to cancel upstream.' },
      { title: 'Harden for production', body: 'Retries with backoff on 429/5xx, 30–60s timeout, structured logging, PII scrubbing in logs, and a circuit breaker or fallback model.' },
    ],
    patterns:
      table(['Concern', 'Dev default', 'Production'], [
        ['Model', 'gpt-4o-mini / Haiku', 'Tier by task complexity'],
        ['Temperature', '0–0.3 for facts', '0 for deterministic; higher for creative'],
        ['Max tokens', '512–1024', 'Cap to control cost'],
        ['Retries', 'None', '3 attempts, exponential backoff'],
        ['Timeout', '60s', '30s with cancel on client disconnect'],
      ]),
    codeHint: `<pre>// Node.js — minimal chat endpoint
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const res = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: userMessage }
  ],
  max_tokens: 512,
  temperature: 0.2
});
return res.choices[0].message.content;</pre>`,
    pitfalls: [
      ['API key in frontend', 'Key stolen, unlimited spend', 'Always call LLM from backend; use session auth'],
      ['No timeout', 'Hung requests pile up', 'Set client timeout; cancel on disconnect'],
      ['Ignoring token usage', 'Surprise bills', 'Log prompt + completion tokens per request'],
      ['No input validation', 'Prompt injection, huge payloads', 'Max length, block patterns, rate limit per user'],
      ['Blind retries on 400', 'Amplified errors and cost', 'Retry only 429/5xx with backoff'],
      ['Logging raw PII', 'Compliance violations', 'Redact emails, SSNs before logging'],
    ],
    production: [
      'Feature flag to disable LLM calls without deploy',
      'Per-user and global rate limits',
      'Cost dashboard by endpoint and model',
      'Content moderation layer for user-generated prompts',
    ],
    qa: [
      ['Why backend-only?', 'Protects API keys, enables rate limits, audit logs, and prompt templates you control.'],
      ['What is a system prompt?', 'Instructions to the model defining role, tone, format, and constraints — not shown as user input.'],
      ['Streaming vs non-streaming?', 'Streaming improves perceived latency for chat UIs; batch is fine for background jobs.'],
      ['What is temperature?', 'Randomness knob: 0 = deterministic, higher = more creative variation.'],
      ['How handle 429?', 'Exponential backoff, queue requests, or route to fallback model/provider.'],
      ['What to log?', 'Latency, model, token counts, error codes — not full prompts if they contain secrets.'],
    ],
    tools: [
      '<strong>SDKs:</strong> openai (Python/Node), anthropic, google-generativeai',
      '<strong>Proxies:</strong> LiteLLM, Portkey — unified API across providers',
      '<strong>Observability:</strong> LangSmith, Helicone, OpenTelemetry spans',
      '<strong>Secrets:</strong> dotenv (dev), AWS/GCP secret managers (prod)',
    ],
    checklist: [
      'API key in environment variable, never committed',
      'Hello-world call works from backend script',
      'System prompt defines role and output format',
      'Endpoint behind authentication',
      'Input length and rate limits enforced',
      'Timeout and retry policy documented',
      'Token usage logged per request',
      'Error responses user-friendly without leaking internals',
      'Billing alerts configured on provider dashboard',
    ],
    tags: ['api', 'openai', 'streaming', 'security', 'observability'],
  },
  {
    slug: 'agents-intro',
    title: 'What is an AI Agent?',
    subtitle: 'LLM + tools + loop: the model plans, acts, observes, and repeats until the task is done.',
    tip: 'Contrast: chatbot = one-shot. Agent = multi-step with tools (search, code run, API calls). Mention human-in-the-loop for risky actions.',
    prompt: `You are interviewing a candidate on AI agents. Ask them to contrast a chatbot with an agent in one sentence. Then describe a support ticket workflow: classify urgency, look up account, draft reply, escalate if needed — which steps need tools? Probe the core loop: plan, act, observe, repeat. Ask what happens when the agent calls a tool with wrong arguments. Present a runaway scenario: 50 steps, $20 in API costs — what guardrails prevent this? Discuss when agents are overkill versus a single RAG call. Ask about human-in-the-loop for destructive actions (delete, refund, send email). Cover observability: how do you debug a failed multi-step run? Hands-on: design an agent with exactly two tools for "research competitor pricing." Score understanding of control, cost, and safety — not buzzword fluency.`,
    summary: `An <strong>AI agent</strong> is an LLM that runs in a <strong>loop</strong>: it receives a goal, decides the next action (often a tool call), executes it, observes the result, and repeats until it produces a final answer or hits a limit. Unlike a one-shot chatbot, agents can search the web, query databases, run code, and call APIs — with variable cost and risk.`,
    analogy: 'A chatbot is a consultant who answers from memory; an agent is an intern with a laptop who can look things up, send emails, and run spreadsheets until the task is done.',
    howItWorks:
      diagram('Agent loop', flow([
        { text: 'User goal', class: 'gray' },
        { text: 'LLM plans action', class: 'purple' },
        { text: 'Tool executes', class: 'green' },
        { text: 'Observation', class: 'orange' },
        { text: 'Final answer or repeat' },
      ])) +
      layers([
        '1. User goal — natural language task with success criteria',
        '2. LLM planner — chooses tool + arguments or returns final answer',
        '3. Tool runtime — validates args, executes allowlisted function',
        '4. Observation — tool output appended to conversation history',
        '5. Termination — final answer, max_steps, timeout, or human approval',
      ]),
    flowNote: 'ReAct (Reason + Act) is the most common pattern: the model explicitly reasons before each tool call.',
    steps: [
      { title: 'Define the goal and success criteria', body: '"Summarize open Jira tickets for team X and post to Slack" — clear done state prevents infinite loops.' },
      { title: 'Inventory tools', body: 'List capabilities the LLM cannot do alone: search, SQL, calendar, send_message. One tool = one well-documented function with JSON schema.' },
      { title: 'Write planner prompt', body: 'Explain available tools, output format (JSON action or final answer), and rules: "Never guess account IDs; use lookup tool."' },
      { title: 'Implement the loop', body: 'Call LLM → parse tool call → execute → append result → repeat. Cap at 5–15 steps and 2–5 minute timeout.' },
      { title: 'Add guardrails', body: 'Allowlist tools, validate parameters, require approval for writes, sandbox code execution, audit log every action.' },
      { title: 'Observe and evaluate', body: 'Trace each step (LangSmith, OpenTelemetry). Measure task success rate and cost per run on a test suite.' },
    ],
    patterns:
      table(['Pattern', 'Description', 'Best for'], [
        ['ReAct', 'Reason then act with tools', 'General-purpose agents'],
        ['Plan-and-execute', 'Plan all steps upfront, then run', 'Predictable multi-step workflows'],
        ['Router', 'Classify intent → specialized sub-agent', 'Multi-domain assistants'],
        ['Human-in-the-loop', 'Pause for approval on risky actions', 'Finance, healthcare, prod changes'],
      ]),
    codeHint: `<pre>while not done and steps < MAX_STEPS:
    response = llm(messages, tools=tool_definitions)
    if response.finish_reason == "final":
        return response.text
    args = validate(response.tool_call)
    result = TOOL_REGISTRY[response.tool_name](**args)
    messages.append({"role": "tool", "content": result})
    steps += 1
raise TimeoutError("Agent exceeded step limit")</pre>`,
    pitfalls: [
      ['Unbounded loops', 'Runaway cost and latency', 'max_steps, timeout, token budget per run'],
      ['Arbitrary code execution', 'RCE, data exfiltration', 'Sandbox, allowlist commands, no shell by default'],
      ['Tool description ambiguity', 'Wrong tool chosen repeatedly', 'Clear names, examples, negative cases in schema'],
      ['No argument validation', 'SQL injection, bad API calls', 'Schema validation before execution'],
      ['Agent for simple FAQ', '10× cost vs one RAG call', 'Use single LLM call when no tools needed'],
      ['Opaque failures', 'Cannot debug bad runs', 'Structured traces per step with inputs/outputs'],
    ],
    production: [
      'Separate read-only and write tools; gate writes behind approval',
      'Idempotent tools where possible so retries are safe',
      'Per-tenant tool permissions and data isolation',
      'Kill switch to disable agent features without full outage',
    ],
    qa: [
      ['Agent vs chatbot?', 'Chatbot: one LLM call, no side effects. Agent: multi-step loop with tool execution.'],
      ['What is a tool?', 'A function the LLM can invoke — search, SQL, API — described by name, description, and JSON schema.'],
      ['What is max_steps?', 'Hard cap on loop iterations to prevent runaway cost and infinite retries.'],
      ['When not to use agents?', 'Simple Q&A, single retrieval, or deterministic workflows better handled by code.'],
      ['What is human-in-the-loop?', 'Pause before irreversible actions (send email, charge card) for human approval.'],
      ['How debug agents?', 'Step-by-step traces: prompt, tool chosen, args, result, and final answer per run.'],
    ],
    tools: [
      '<strong>Frameworks:</strong> LangGraph, CrewAI, OpenAI Assistants, Anthropic tool use',
      '<strong>Tracing:</strong> LangSmith, Arize, Weights & Biases',
      '<strong>Sandbox:</strong> E2B, Docker, Modal for code execution',
      '<strong>Protocols:</strong> MCP for standardized tool connections',
    ],
    checklist: [
      'Clear success criteria defined before building loop',
      'Tools have JSON schemas with descriptions and examples',
      'max_steps and timeout configured',
      'Write/destructive tools require approval',
      'All tool calls audit-logged with user and timestamp',
      'Argument validation before execution',
      'Traces captured for every run',
      'Eval suite of 10+ multi-step tasks',
      'Cost per successful task measured and acceptable',
    ],
    tags: ['agents', 'tools', 'react', 'guardrails', 'tracing'],
  },
  {
    slug: 'create-first-agent',
    title: 'Create Your First Agent',
    subtitle: 'Hands-on path: one tool, one loop, one success criteria — then add complexity.',
    tip: 'Demo: agent that answers "What\'s the weather in X?" using a weather API tool. Shows plan + tool + parse.',
    prompt: `You are a pair-programming tutor helping someone build their first AI agent. Insist they start with exactly one tool — a weather API — before adding anything else. Walk through defining the tool JSON schema: name, description, parameters (city string, units enum). Have them write the planner prompt that forces JSON output: either a tool call or a final answer. Implement the loop together: parse response, call the function, append observation. Introduce a deliberate bug: the model invents a city name not in the API — how does validation catch it? Add stop conditions: final answer, 5 steps max, 30s timeout. Ask them to log every iteration to stdout. Then challenge: add a second tool (timezone lookup) — what breaks in the prompt? Close by comparing framework (LangGraph) versus 40 lines of Python. Grade incremental discipline and debugging skill, not framework memorization.`,
    summary: `Build your first agent by combining <strong>one LLM</strong>, <strong>one tool</strong>, and a <strong>simple while-loop</strong>. The weather-bot pattern — user asks a question, model calls <code>get_weather(city)</code>, result returns to the model, model answers — teaches everything you need before scaling to multi-tool agents.`,
    analogy: 'Training wheels: one tool is like learning to ride with stabilizers before tackling a multi-tool BMX course.',
    howItWorks:
      diagram('First agent architecture', flow([
        { text: 'User: weather in Paris?', class: 'gray' },
        { text: 'LLM → get_weather', class: 'purple' },
        { text: 'API returns 18°C', class: 'green' },
        { text: 'LLM final reply', class: 'orange' },
      ])) +
      note('<strong>Minimum viable agent:</strong> tool definitions in the API call, loop until <code>stop_reason</code> is final or step limit hit.'),
    flowNote: 'Test the tool function independently before wiring it to the LLM — unit test the API wrapper first.',
    steps: [
      { title: 'Pick one concrete tool', body: 'Weather API, stock price, or internal "get_user_by_email" — something with a clear JSON request/response you can mock.' },
      { title: 'Write the tool schema', body: '{"name":"get_weather","description":"Current weather for a city","parameters":{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}}' },
      { title: 'Implement the function', body: 'Python def get_weather(city) -> str that calls the API, handles 404, returns a short string the LLM can read.' },
      { title: 'Craft the planner prompt', body: '"You have get_weather. Return a tool call to answer weather questions. For greetings, reply directly without tools."' },
      { title: 'Build the loop', body: 'messages = [system, user]; while steps < 5: response = llm(messages, tools); if no tool: return text; else run tool, append tool result.' },
      { title: 'Test edge cases', body: 'Invalid city, API timeout, ambiguous "here" without location — verify graceful errors in observations.' },
      { title: 'Add logging and limits', body: 'Print each step; set timeout; track total tokens. Only then add a second tool.' },
    ],
    patterns:
      note('<strong>Tool schema tips:</strong> Description is what the model reads — be explicit: "City name in English, e.g. London, UK. Do not pass coordinates." Include <code>enum</code> for fixed choices. Mark required fields. Bad descriptions cause wrong tool selection more than bad code.'),
    codeHint: `<pre>TOOLS = [{"type": "function", "function": {
  "name": "get_weather",
  "description": "Get current weather for a city name",
  "parameters": {"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}
}}]

def run_agent(user_msg):
    messages = [{"role":"system","content":PLANNER_PROMPT},
                {"role":"user","content":user_msg}]
    for _ in range(5):
        r = client.chat.completions.create(model="gpt-4o-mini", messages=messages, tools=TOOLS)
        msg = r.choices[0].message
        if not msg.tool_calls:
            return msg.content
        for tc in msg.tool_calls:
            result = get_weather(**json.loads(tc.function.arguments))
            messages.append({"role":"tool","tool_call_id":tc.id,"content":result})
    return "Sorry, I could not complete that."</pre>`,
    pitfalls: [
      ['Too many tools on day one', 'Confused planner, flaky demos', 'Start with one tool; add second only when first is reliable'],
      ['Vague tool descriptions', 'Model calls wrong tool or bad args', 'Examples in description; test with 20 prompts'],
      ['No independent tool tests', 'Cannot tell if bug is LLM or API', 'Unit test tool functions with mocks first'],
      ['Parsing free-text actions', 'Fragile JSON extraction', 'Use native tool/function calling API'],
      ['Missing error in observation', 'Model hallucinates success', 'Return "Error: city not found" as tool output'],
      ['No step limit', 'Infinite loop on stuck task', 'Hard cap at 5 steps for first agent'],
    ],
    production: [
      'Wrap external API calls with circuit breaker and caching',
      'Return structured tool errors the model can relay to users',
      'Version tool schemas; breaking changes need migration',
    ],
    qa: [
      ['First tool to build?', 'Read-only lookup with clear params — weather, stock, or internal GET endpoint.'],
      ['Why JSON schema?', 'Provider validates structure; model knows required fields and types.'],
      ['What goes in observation?', 'Concise tool output string or JSON — not raw HTTP dumps.'],
      ['How many steps for v1?', '5 is enough for weather; increase only with eval evidence.'],
      ['Framework or raw loop?', 'Raw loop teaches fundamentals; framework when you need persistence and branching.'],
      ['How test the agent?', 'Script of 15 prompts: happy path, invalid input, no-tool chitchat, API failure.'],
    ],
    tools: [
      '<strong>APIs for practice:</strong> OpenWeatherMap, exchangerate-api',
      '<strong>Frameworks:</strong> LangGraph, OpenAI function calling, Anthropic tool use',
      '<strong>Testing:</strong> pytest with mocked HTTP responses',
    ],
    checklist: [
      'One tool with tested API wrapper',
      'JSON schema with clear description and required fields',
      'Planner system prompt explains when to use tool vs answer directly',
      'Loop with max 5 steps implemented',
      'Tool errors returned as observations, not exceptions',
      'Each step logged (tool name, args, result length)',
      '15-prompt manual test script passes',
      'Timeout on external API calls',
      'Second tool deferred until first is stable',
    ],
    tags: ['hands-on', 'function-calling', 'weather-api', 'loop', 'beginner'],
  },
  {
    slug: 'langchain-basics',
    title: 'LangChain Basics',
    subtitle: 'Chains, prompts, retrievers, and agents — the popular Python framework for LLM apps.',
    tip: 'Know: LCEL (pipe syntax), ChatModel vs LLM, RunnableSequence. Say when you\'d use LangChain vs raw SDK.',
    prompt: `You are interviewing a developer on LangChain fundamentals. Ask what LCEL is and have them sketch prompt | model | parser. Contrast ChatOpenAI with the legacy LLM class. Present a RAG prototype: how do they wire a vector store retriever into a chain? Ask when LangChain adds value versus calling OpenAI SDK directly. Discuss RunnableParallel for branching and .invoke() vs .stream(). Mention pain points: version churn, abstraction leaks, debugging deep stacks. Hands-on: they need a chain that takes a question, retrieves docs, and returns a string answer — what components? Ask about LangGraph for agents versus AgentExecutor. Score whether they know the right layer to use (LCEL chain vs raw API) and can explain trade-offs honestly.`,
    summary: `<strong>LangChain</strong> is a Python/JS framework that composes LLM apps from reusable pieces: <strong>prompts</strong>, <strong>models</strong>, <strong>retrievers</strong>, <strong>parsers</strong>, and <strong>agents</strong>. <strong>LCEL</strong> (LangChain Expression Language) chains them with the pipe operator: <code>chain = prompt | model | parser</code>. Ideal for RAG and agent prototypes; consider raw SDK for minimal latency microservices.`,
    analogy: 'LangChain is like React for LLM apps — components and composition — whereas raw SDK is vanilla JS when you want zero dependencies.',
    howItWorks:
      diagram('LCEL chain', flow([
        { text: 'Input dict' },
        { text: 'PromptTemplate', class: 'purple' },
        { text: 'ChatModel', class: 'green' },
        { text: 'OutputParser', class: 'orange' },
        { text: 'String / JSON' },
      ])) +
      layers([
        'Models — ChatOpenAI, ChatAnthropic wrappers with unified .invoke()',
        'Prompts — ChatPromptTemplate with {variables}',
        'Retrievers — vector store .as_retriever() for RAG',
        'Output parsers — StrOutputParser, JsonOutputParser, Pydantic',
        'Agents — LangGraph or create_react_agent with tool binding',
      ]),
    flowNote: 'LangChain v0.2+ favors LCEL and langchain-core; avoid deprecated Chain classes in new code.',
    steps: [
      { title: 'Install core packages', body: 'pip install langchain langchain-openai langchain-community. Set OPENAI_API_KEY in environment.' },
      { title: 'Build a simple chain', body: 'from langchain_core.prompts import ChatPromptTemplate; from langchain_openai import ChatOpenAI; chain = prompt | ChatOpenAI() | StrOutputParser()' },
      { title: 'Invoke with dict', body: 'result = chain.invoke({"question": "What is RAG?"}) — input keys match prompt variables.' },
      { title: 'Add a retriever for RAG', body: 'retriever = vectorstore.as_retriever(search_kwargs={"k": 4}); use create_retrieval_chain or custom LCEL with RunnablePassthrough.' },
      { title: 'Stream tokens', body: 'for chunk in chain.stream({"question": "..."}): print(chunk, end="") — same chain, streaming API.' },
      { title: 'Move agents to LangGraph', body: 'For multi-step agents, prefer langgraph StateGraph over legacy AgentExecutor for control and checkpoints.' },
    ],
    patterns:
      table(['Use LangChain', 'Use raw SDK'], [
        ['RAG + agent prototypes', 'Single chat completion endpoint'],
        ['Many third-party integrations', 'Latency-critical microservice'],
        ['Team standardizes on LC', 'Minimal dependencies, full control'],
        ['LangSmith tracing out of box', 'Simple CRUD wrapper around GPT'],
      ]),
    codeHint: `<pre>from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_messages([
    ("system", "Answer concisely."),
    ("human", "{question}")
])
chain = prompt | ChatOpenAI(model="gpt-4o-mini") | StrOutputParser()
answer = chain.invoke({"question": "What is LCEL?"})</pre>`,
    pitfalls: [
      ['Deprecated APIs in tutorials', 'Copy-paste breaks on upgrade', 'Check docs version; prefer langchain-core LCEL'],
      ['Over-abstraction for one call', 'Harder debug than 10-line SDK', 'Raw SDK for trivial endpoints'],
      ['Implicit prompt injection via retriever', 'Malicious doc content in context', 'Sanitize retrieved text; system guardrails'],
      ['No tracing enabled', 'Black box failures', 'LangSmith or custom callbacks on chain'],
      ['Giant monolithic chains', 'Untestable spaghetti', 'Split into named sub-chains with unit tests'],
      ['Wrong retriever k', 'Noise or missed context', 'Tune k on eval set; add reranker'],
    ],
    production: [
      'Pin langchain package versions; test upgrades in staging',
      'Use RunnableConfig for run_name and metadata in traces',
      'Cache embeddings and frequent retrievals',
      'LangGraph checkpoints for resumable long agents',
    ],
    qa: [
      ['What is LCEL?', 'Pipe syntax to compose Runnables: prompt | model | parser with .invoke() and .stream().'],
      ['ChatModel vs LLM?', 'ChatModel uses message objects (system/user/assistant); legacy LLM uses plain strings.'],
      ['LangChain vs LlamaIndex?', 'LangChain general composition; LlamaIndex indexing/retrieval focus. Many use both.'],
      ['What is a retriever?', 'Interface that returns relevant documents for a query — wraps vector store search.'],
      ['AgentExecutor vs LangGraph?', 'LangGraph offers explicit state machine, persistence, and human-in-the-loop — preferred for prod agents.'],
      ['How debug chains?', 'LangSmith traces, verbose=True on older chains, or log intermediate Runnable outputs.'],
    ],
    tools: [
      '<strong>Core:</strong> langchain-core, langchain-openai, langchain-anthropic',
      '<strong>Vector:</strong> langchain-chroma, langchain-pinecone, langchain-postgres',
      '<strong>Agents:</strong> langgraph, langchain-community tools',
      '<strong>Observability:</strong> LangSmith',
    ],
    checklist: [
      'Using LCEL pipe syntax, not deprecated LLMChain',
      'ChatPromptTemplate variables match .invoke() keys',
      'StrOutputParser or JsonOutputParser on chain end',
      'Retriever k tuned on sample questions',
      'Package versions pinned in requirements.txt',
      'LangSmith or logging enabled for dev',
      'Agents use LangGraph for new projects',
      'Simple endpoints evaluated for raw SDK alternative',
      'Integration tests on chain with mocked model',
    ],
    tags: ['langchain', 'lcel', 'python', 'rag', 'langgraph'],
  },
  {
    slug: 'google-adk',
    title: 'Google ADK (Agent Development Kit)',
    subtitle: 'Google\'s toolkit for building agents on Gemini — tools, sessions, and deployment paths.',
    tip: 'Mention Gemini models, Google Cloud auth, and how ADK structures agents similarly to other frameworks.',
    prompt: `You are a cloud architect discussing Google's Agent Development Kit with a developer already familiar with OpenAI function calling. Ask what problem ADK solves on top of raw Gemini API calls. Walk through agent definition: instructions, model selection (Flash vs Pro), and tool registration. Compare AI Studio experiments versus Vertex AI production deployment. Ask how they would add Google Search or custom Python tools. Discuss session memory for multi-turn support tickets. Present deployment choices: Cloud Run versus Agent Engine. Probe GCP auth: service accounts, workload identity, API keys. Ask when ADK is the right choice versus LangGraph on GCP. Evaluate understanding of Google ecosystem integration and production deployment path.`,
    summary: `The <strong>Agent Development Kit (ADK)</strong> is Google's framework for building <strong>Gemini-powered agents</strong> with tools, multi-turn sessions, and first-class deployment to <strong>Vertex AI</strong> and <strong>Cloud Run</strong>. It structures agents similarly to other frameworks — instructions + model + tools + loop — but optimized for Google Cloud auth, grounding, and enterprise compliance.`,
    analogy: 'ADK is to Gemini agents what Firebase is to mobile apps — opinionated tooling that pairs naturally with Google\'s cloud stack.',
    howItWorks:
      diagram('ADK components', flow([
        { text: 'Agent definition', class: 'gray' },
        { text: 'Gemini model', class: 'purple' },
        { text: 'Tools (custom + Google)', class: 'green' },
        { text: 'Session state', class: 'orange' },
        { text: 'Deploy (Vertex / Run)' },
      ])) +
      layers([
        'Agent — system instructions, model (gemini-2.0-flash / pro), tool registry',
        'Tools — Python functions, Google Search grounding, code execution',
        'Session — multi-turn memory keyed by user or conversation ID',
        'Runner — orchestrates agent loop with callbacks and safety settings',
        'Deploy — package agent to Vertex AI Agent Engine or Cloud Run container',
      ]),
    flowNote: 'Start in Google AI Studio for rapid prototyping; migrate to Vertex AI for VPC, IAM, audit logs, and SLA.',
    steps: [
      { title: 'Set up GCP project', body: 'Enable Vertex AI API, create service account with aiplatform.user role. For experiments, AI Studio API key is faster.' },
      { title: 'Install ADK', body: 'Follow Google quickstart — pip install google-adk (or current package name per docs). Verify Gemini model access in your region.' },
      { title: 'Define one agent', body: 'Instructions, model=gemini-2.0-flash, description of persona and constraints. Mirror your first-agent pattern.' },
      { title: 'Register a custom tool', body: 'Python function with type hints and docstring — ADK generates schema. Test tool independently first.' },
      { title: 'Add session handling', body: 'Persist conversation state across turns for support or coaching use cases.' },
      { title: 'Deploy to Vertex or Cloud Run', body: 'Containerize agent, configure IAM, set min instances for latency, enable Cloud Logging and Monitoring.' },
    ],
    patterns:
      table(['Surface', 'Use case', 'Auth'], [
        ['AI Studio', 'Prototypes, personal projects', 'API key'],
        ['Vertex AI', 'Production, enterprise', 'Service account / IAM'],
        ['Agent Engine', 'Managed agent hosting', 'GCP IAM + VPC-SC'],
        ['Cloud Run', 'Custom scaling, HTTP API', 'Workload identity'],
      ]),
    codeHint: `<pre># Conceptual ADK agent sketch
agent = Agent(
    model="gemini-2.0-flash",
    instruction="You are a helpful support agent. Use tools when needed.",
    tools=[get_order_status, search_kb]
)
session = agent.create_session(user_id="u123")
response = session.send("Where is order 45678?")
# Tool loop handled by ADK runner</pre>`,
    pitfalls: [
      ['API key in production', 'No IAM audit trail', 'Vertex AI with service accounts on prod'],
      ['Region/model availability mismatch', '404 or quota errors', 'Check model list per region before design'],
      ['Unbounded tool access', 'Data leaks across tenants', 'Scope tools by user context in function'],
      ['Skipping safety settings', 'Harmful or off-brand outputs', 'Configure Gemini safety filters and system instructions'],
      ['No Cloud Logging', 'Cannot debug prod agent runs', 'Structured logs per session and tool call'],
      ['Framework lock-in without eval', 'Hard to swap models later', 'Benchmark against raw Gemini API baseline'],
    ],
    production: [
      'VPC Service Controls for sensitive data on Vertex',
      'Quota and budget alerts per project',
      'Grounding with Google Search for factual queries where appropriate',
      'Canary deploy new agent versions with traffic split',
    ],
    qa: [
      ['What is ADK?', 'Google toolkit to define, test, and deploy Gemini agents with tools and sessions.'],
      ['ADK vs raw Gemini API?', 'ADK adds agent loop, tool wiring, session management, and deployment helpers.'],
      ['AI Studio vs Vertex?', 'Studio for fast experiments; Vertex for production IAM, compliance, and scale.'],
      ['Which Gemini model?', 'Flash for speed/cost; Pro for complex reasoning — match to task eval.'],
      ['How add custom tools?', 'Register Python functions; ADK exposes them to the model like function calling.'],
      ['Deployment options?', 'Vertex Agent Engine (managed), Cloud Run (containers), or self-hosted with ADK runner.'],
    ],
    tools: [
      '<strong>Platform:</strong> Google AI Studio, Vertex AI, Cloud Run',
      '<strong>Models:</strong> gemini-2.0-flash, gemini-2.0-pro',
      '<strong>Grounding:</strong> Google Search, Vertex AI Search',
      '<strong>Observability:</strong> Cloud Logging, Cloud Monitoring',
    ],
    checklist: [
      'GCP project with Vertex AI API enabled',
      'Auth strategy chosen (API key dev, IAM prod)',
      'One agent with one custom tool working locally',
      'Session persistence tested across 3+ turns',
      'Safety settings and instructions reviewed',
      'Tools scoped to authenticated user context',
      'Cloud Logging enabled before prod deploy',
      'Budget alerts configured',
      'Eval compared Flash vs Pro on representative tasks',
    ],
    tags: ['google', 'gemini', 'vertex-ai', 'adk', 'gcp'],
  },
  {
    slug: 'n8n-basics',
    title: 'n8n Basics for AI Workflows',
    subtitle: 'Low-code automation: connect APIs, LLMs, Slack, and databases without writing a full app.',
    tip: 'Great for ops automations: "new email → summarize with LLM → post to Slack." Not for core product logic at scale.',
    prompt: `You are advising an ops lead who wants to automate workflows with n8n and LLMs. Ask what problem they're solving — one-off automations versus core product features. Walk through a concrete flow: webhook trigger → HTTP fetch doc → OpenAI summarize → Slack post. Explain how data passes as JSON between nodes. Ask about error handling: what if the LLM node fails mid-workflow? Discuss credentials storage in n8n versus hardcoding keys. When would they migrate to Python? Cover limits: versioning, testing, high-volume cost. Hands-on design: "Every morning, pull GitHub issues, classify priority with LLM, post digest to Slack with human approval step." Score practical workflow thinking and knowing n8n's sweet spot versus code.`,
    summary: `<strong>n8n</strong> is a visual workflow automation tool where <strong>nodes</strong> are triggers (webhook, schedule, email) and actions (HTTP, OpenAI, Google Sheets, Slack). Data flows as JSON between nodes — ideal for <strong>ops automations</strong>, internal tools, and AI-assisted glue code without deploying a full backend.`,
    analogy: 'n8n is Zapier with a wiring diagram and self-host option — connect boxes instead of writing integration boilerplate.',
    howItWorks:
      diagram('Typical AI workflow', flow([
        { text: 'Trigger', class: 'gray' },
        { text: 'Fetch data' },
        { text: 'Transform JSON', class: 'purple' },
        { text: 'LLM node', class: 'green' },
        { text: 'Slack / DB / Email', class: 'orange' },
      ])) +
      note('Each node receives items from the previous node. Use <strong>Set</strong> and <strong>Code</strong> nodes to shape fields before the LLM prompt.'),
    flowNote: 'Self-host n8n for data privacy; n8n Cloud for fastest start. Credentials are encrypted per workflow.',
    steps: [
      { title: 'Install or sign up', body: 'n8n Cloud for POC; Docker self-host for internal data: docker run n8nio/n8n. Create admin account.' },
      { title: 'Add credentials', body: 'Store OpenAI, Slack, and Gmail credentials in n8n Credentials — never paste keys in node fields.' },
      { title: 'Build trigger → action', body: 'Start with Schedule Trigger (daily 9am) or Webhook. Add one action node; execute to verify data shape.' },
      { title: 'Insert LLM node', body: 'OpenAI node: map {{ $json.body }} into prompt template. Set model, max tokens, and system message.' },
      { title: 'Branch and error handling', body: 'Use IF node for conditions; Error Trigger workflow for failures; Send alert to Slack on error.' },
      { title: 'Add human approval', body: 'Slack node with "wait for approval" or manual trigger before send — critical for customer-facing messages.' },
    ],
    patterns:
      table(['Pattern', 'Nodes', 'Use case'], [
        ['Scheduled digest', 'Cron → HTTP → LLM → Slack', 'Daily reports'],
        ['Event-driven', 'Webhook → LLM classify → DB', 'Ticket triage'],
        ['RAG-lite', 'Google Drive → extract text → LLM → Notion', 'Doc summarization'],
        ['Human gate', 'LLM draft → Wait → Send email', 'Outbound comms'],
      ]),
    codeHint: `<pre>// Code node (JavaScript) — shape data before LLM
const items = $input.all();
return items.map(item => ({
  json: {
    prompt: \`Summarize in 3 bullets:\\n\${item.json.text}\`,
    source_id: item.json.id
  }
}));</pre>`,
    pitfalls: [
      ['Core product on n8n', 'Hard to test, version, scale', 'Migrate critical paths to code; keep ops on n8n'],
      ['No error workflow', 'Silent failures overnight', 'Error Trigger + Slack alert on every workflow'],
      ['Huge payloads to LLM', 'Cost spikes, context overflow', 'Truncate/summarize in Code node first'],
      ['Credentials in exported JSON', 'Leaked keys in git', 'Use credential refs; scrub exports'],
      ['No idempotency', 'Duplicate Slack posts on retry', 'Track processed IDs in DB node'],
      ['Unreviewed LLM output sent', 'Embarrassing or wrong messages', 'Human approval node before send'],
    ],
    production: [
      'Export workflows to git for version control',
      'Separate dev and prod n8n instances',
      'Rate limit webhook triggers at reverse proxy',
      'Monitor execution history and failure rate weekly',
    ],
    qa: [
      ['What is n8n?', 'Open-source workflow automation with visual node editor and 400+ integrations.'],
      ['How does data flow?', 'JSON items pass node to node; access fields with {{ $json.field }} expressions.'],
      ['n8n vs Zapier?', 'n8n is self-hostable, more flexible Code nodes, better for technical teams.'],
      ['When use LLM node?', 'Classification, summarization, extraction — not real-time chat at scale.'],
      ['Self-host vs cloud?', 'Self-host for PII/compliance; cloud for speed and zero ops.'],
      ['When migrate to code?', 'Need unit tests, CI/CD, high QPS, or complex business logic.'],
    ],
    tools: [
      '<strong>LLM nodes:</strong> OpenAI, Anthropic (HTTP), Ollama (local)',
      '<strong>Triggers:</strong> Webhook, Schedule, Gmail, GitHub',
      '<strong>Actions:</strong> Slack, Notion, Airtable, Postgres',
      '<strong>Hosting:</strong> n8n Cloud, Docker, Kubernetes',
    ],
    checklist: [
      'Credentials stored in n8n vault, not inline',
      'Workflow exported to git',
      'Error Trigger workflow sends alerts',
      'LLM prompts tested with 5 sample inputs',
      'Human approval before external sends',
      'Payload size limited before LLM node',
      'Schedule timezone documented',
      'Dev/prod instances separated',
      'Execution failure rate monitored',
    ],
    tags: ['n8n', 'automation', 'low-code', 'slack', 'workflows'],
  },
  {
    slug: 'cursor-guide',
    title: 'How to Use Cursor',
    subtitle: 'AI-native IDE: chat, inline edit, Composer, rules, and repo-aware coding.',
    tip: 'Power moves: @file context, .cursorrules, Composer for multi-file features, terminal commands with approval.',
    prompt: `You are mentoring a developer new to Cursor. Start with the three modes: Chat (questions), Inline Edit (selection changes), and Agent/Composer (multi-file features). Explain @ mentions — @file, @folder, @docs, @web — and why context quality beats prompt length. Walk through .cursor/rules for project conventions. Discuss when to write a spec in chat before codegen. Cover terminal integration: AI can propose commands but user should approve. Ask about privacy mode and what code leaves their machine. Present a scenario: refactor auth across 8 files — which mode and what context do they attach? Warn against blind accept of diffs. Share workflow: small task → review diff → run tests → commit. Grade practical workflow habits, not feature memorization.`,
    summary: `<strong>Cursor</strong> is an AI-native IDE (VS Code fork) with <strong>Chat</strong> for Q&A, <strong>Inline Edit (Cmd+K)</strong> for selection changes, and <strong>Agent/Composer</strong> for multi-file features. Use <strong>@ mentions</strong> to pin files and docs into context, and <strong>.cursor/rules</strong> to enforce project conventions across sessions.`,
    analogy: 'Cursor is pair programming with someone who has read your whole repo — but you still review every line before merge.',
    howItWorks:
      table(['Feature', 'Shortcut / access', 'Best for'], [
        ['Chat', 'Cmd+L', 'Explain code, small edits, debugging questions'],
        ['Inline Edit', 'Cmd+K on selection', 'Rename, refactor one function, fix lint in place'],
        ['Agent / Composer', 'Cmd+I', 'Multi-file features, tests + implementation'],
        ['@ mentions', 'Type @ in chat', 'Pin files, folders, docs, web to context'],
        ['Rules', '.cursor/rules/*.md', 'Persistent project conventions'],
        ['Terminal', 'Agent proposes commands', 'Run tests, installs — always review first'],
      ]),
    flowNote: 'Smaller scoped tasks get better results: "add unit tests for UserService" then "implement caching" beats one giant vague prompt.',
    steps: [
      { title: 'Open project and index', body: 'Open repo root so Cursor indexes the codebase. Wait for indexing on large monorepos before heavy Agent tasks.' },
      { title: 'Set up rules', body: 'Create .cursor/rules with stack, test commands, naming conventions, and "never commit secrets."' },
      { title: 'Chat for orientation', body: 'Ask "how does auth work?" with @src/auth/ attached. Read answer before changing code.' },
      { title: 'Inline for local edits', body: 'Select function → Cmd+K → "add error handling for null user". Review diff hunk by hunk.' },
      { title: 'Agent for features', body: 'Write spec: goal, files likely touched, test plan. Agent edits multiple files; run tests after.' },
      { title: 'Review and iterate', body: 'Never accept all blindly. Run linter and tests. Follow up chat: "fix failing test X".' },
    ],
    patterns:
      note('<strong>Effective prompt template:</strong> Goal → Constraints → @files → Test command → "Do not modify unrelated files." Example: "Add rate limiting to POST /api/chat. Use existing Redis client. @src/api/chat.ts @src/lib/redis.ts. Run npm test. Minimal diff only."'),
    codeHint: `<pre># .cursor/rules/project.md
- Stack: Next.js 14, TypeScript, Tailwind
- Run tests: npm test
- Never commit .env or API keys
- Match existing error handling in src/lib/errors.ts
- Prefer small PRs; one feature per Agent session</pre>`,
    pitfalls: [
      ['Vague giant prompts', 'Wrong files changed, broken build', 'Scope one task; attach @files explicitly'],
      ['No rules file', 'Inconsistent style every session', 'Commit .cursor/rules to repo'],
      ['Blind accept all diffs', 'Subtle bugs, deleted logic', 'Review every hunk; run tests'],
      ['Missing @ context', 'Hallucinated APIs not in codebase', 'Pin relevant files and types'],
      ['Secrets in chat', 'Keys in model context/logs', 'Use env vars; never paste credentials'],
      ['Agent without test command', 'Regressions ship', 'Always specify how to verify in prompt'],
    ],
    production: [
      'Enable privacy mode if code cannot leave your machine',
      'Use team rules for shared conventions across developers',
      'Treat Agent output like a junior PR — full review required',
      'Document which models your org allows for compliance',
    ],
    qa: [
      ['Chat vs Composer?', 'Chat for Q&A and small edits; Composer/Agent for multi-file implementation.'],
      ['What are @ mentions?', 'Attach files, folders, documentation, or web pages to the model context.'],
      ['What are Cursor rules?', 'Persistent instructions in .cursor/rules applied to every session in the project.'],
      ['Is code sent to the cloud?', 'Depends on privacy settings and plan — check Cursor privacy docs for your tier.'],
      ['Best workflow?', 'Spec → attach context → small scope → review diff → run tests → commit.'],
      ['When use Inline vs Agent?', 'Inline for one function; Agent when touching 3+ files or adding a feature end-to-end.'],
    ],
    tools: [
      '<strong>Modes:</strong> Chat, Inline Edit, Agent/Composer',
      '<strong>Context:</strong> @file, @folder, @codebase, @docs, @web',
      '<strong>Config:</strong> .cursor/rules, .cursorignore',
      '<strong>Models:</strong> GPT-4o, Claude Sonnet, Composer models (settings)',
    ],
    checklist: [
      '.cursor/rules committed with stack and test commands',
      'Understand Chat vs Inline vs Agent use cases',
      '@ mentions used for relevant files on every task',
      'Prompts scoped to one feature or fix',
      'Every diff reviewed before accept',
      'Tests run after Agent sessions',
      'No secrets pasted into chat',
      'Privacy settings checked for work repos',
      '.cursorignore excludes node_modules and secrets',
    ],
    tags: ['cursor', 'ide', 'composer', 'rules', 'productivity'],
  },
  {
    slug: 'claude-guide',
    title: 'How to Use Claude',
    subtitle: 'Anthropic\'s Claude for chat, Projects, API, and long-context reasoning.',
    tip: 'Claude strengths: long context, careful reasoning, structured output. Use Projects for persistent knowledge.',
    prompt: `You are coaching someone to get maximum value from Claude across claude.ai, API, and Claude Code. Compare Opus, Sonnet, and Haiku for a coding vs writing vs speed task. Explain Projects: uploaded docs persist as knowledge for every chat in that project. Teach XML tag structure for long prompts: context, task, output format. Ask when to use extended thinking or step-by-step before final answer. Cover API Messages format and tool use for agents. Discuss Claude Code for terminal-based repo work versus IDE tools. Present scenario: 200-page policy PDF — how do they use long context effectively? Mention data handling and enterprise options. Score prompt structure skill and knowing which surface fits which job.`,
    summary: `<strong>Claude</strong> (by Anthropic) excels at <strong>long-context reasoning</strong>, careful analysis, and structured writing. Surfaces: <strong>claude.ai</strong> (chat, Projects, Artifacts), <strong>API</strong> (Messages API, tool use, batch), and <strong>Claude Code</strong> (terminal agent for repositories). Models: <strong>Opus</strong> (best), <strong>Sonnet</strong> (balance), <strong>Haiku</strong> (fast/cheap).`,
    analogy: 'Claude Projects are like giving the assistant a permanent filing cabinet for one client or codebase — not re-uploading docs every chat.',
    howItWorks:
      layers([
        'claude.ai — browser chat, Artifacts (live docs/code), Projects with persistent knowledge',
        'API — Messages API with system/user/assistant roles, streaming, tool_use blocks',
        'Claude Code — CLI agent that reads, edits, and commits in your git repo',
        'Long context — 200K+ tokens for full codebases or document sets in one prompt',
        'Structured output — XML tags, JSON mode, and tool schemas for reliable parsing',
      ]) +
      diagram('API message flow', flow([
        { text: 'System prompt', class: 'gray' },
        { text: 'User + context', class: 'purple' },
        { text: 'Claude response', class: 'green' },
        { text: 'Tool result (optional)', class: 'orange' },
        { text: 'Final answer' },
      ])),
    flowNote: 'Put critical instructions at the beginning AND end of long system prompts — Claude weighs both positions heavily.',
    steps: [
      { title: 'Pick the right surface', body: 'Quick questions → claude.ai. Automation → API. Large repo refactor → Claude Code. Batch jobs → Batch API (50% cost).' },
      { title: 'Choose model tier', body: 'Haiku for classification/speed; Sonnet for daily dev; Opus for architecture and hard reasoning.' },
      { title: 'Structure prompts with XML', body: '<context>...</context><task>...</task><output_format>...</output_format> — reduces ambiguity.' },
      { title: 'Use Projects for persistence', body: 'Upload specs, style guides, API docs once. Every chat in the Project inherits that knowledge.' },
      { title: 'API integration', body: 'anthropic SDK, messages.create with model, max_tokens, system. Handle stop_reason for tool_use.' },
      { title: 'Evaluate outputs', body: 'For critical work, ask Claude to critique its own answer against a rubric before you accept.' },
    ],
    patterns:
      table(['Technique', 'When', 'Example'], [
        ['XML tags', 'Long or multi-part prompts', '<document>...</document>'],
        ['Chain of thought', 'Math, logic, debugging', '"Think step by step, then answer"'],
        ['Few-shot', 'Fixed output format', '2 examples of input → JSON output'],
        ['Tool use', 'Agents, API actions', 'Define tools in API call'],
        ['Projects', 'Repeat work same domain', 'Client docs always in context'],
      ]),
    codeHint: `<pre>import anthropic
client = anthropic.Anthropic()
msg = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system="You are a code reviewer. Be concise.",
    messages=[{"role":"user","content":"Review this diff: ..."}]
)
print(msg.content[0].text)</pre>`,
    pitfalls: [
      ['Wall of text prompts', 'Missed constraints', 'Use XML sections and bullet constraints'],
      ['Wrong model for task', 'Slow or shallow answers', 'Haiku for simple; Opus only when needed'],
      ['Ignoring context limits', 'Truncated middle of huge paste', 'Use Projects or file references; summarize first'],
      ['No output format specified', 'Unparseable responses in pipelines', 'Request JSON, markdown table, or max words'],
      ['Skipping API streaming', 'Poor UX for long answers', 'Use stream=True for chat interfaces'],
      ['Assuming web access', 'Stale facts unless tools enabled', 'Use search tools or RAG for current data'],
    ],
    production: [
      'Batch API for offline eval and bulk processing',
      'Rate limit handling with retries on 529/overloaded',
      'Log request IDs for Anthropic support escalation',
      'Enterprise for SSO, audit logs, and data retention controls',
    ],
    qa: [
      ['Opus vs Sonnet vs Haiku?', 'Opus: hardest tasks. Sonnet: best balance. Haiku: speed and cost.'],
      ['What are Projects?', 'Workspaces with persistent uploaded knowledge applied to every chat.'],
      ['What are Artifacts?', 'Side-panel live documents/code Claude generates you can edit and export.'],
      ['Claude Code vs Cursor?', 'Claude Code is terminal-first autonomous repo agent; Cursor is IDE-integrated.'],
      ['How long is context?', '200K+ tokens on recent models — full books or large codebases.'],
      ['What is tool use?', 'API feature where Claude returns structured tool calls your app executes.'],
    ],
    tools: [
      '<strong>Surfaces:</strong> claude.ai, Anthropic API, Claude Code CLI',
      '<strong>SDKs:</strong> anthropic (Python/TS)',
      '<strong>Integrations:</strong> Amazon Bedrock, Google Vertex (Claude models)',
      '<strong>Features:</strong> Batch API, tool use, prompt caching',
    ],
    checklist: [
      'Model tier matched to task complexity',
      'Prompts use XML or clear sections for long context',
      'Projects set up for recurring domain work',
      'Output format specified for pipeline use',
      'API keys in env vars, not client-side',
      'Streaming enabled for user-facing chat',
      'Tool use for actions requiring fresh data',
      'Self-check step for high-stakes outputs',
      'Data policy reviewed for sensitive content',
    ],
    tags: ['claude', 'anthropic', 'projects', 'api', 'long-context'],
  },
  {
    slug: 'cursor-vs-claude-code',
    title: 'Cursor vs Claude Code',
    subtitle: 'Two AI coding assistants — IDE-integrated vs terminal-first. Pick by workflow, not hype.',
    tip: 'Cursor = daily IDE pair programmer. Claude Code = deep repo tasks from terminal / CI. Many devs use both.',
    prompt: `You are advising a team choosing between Cursor and Claude Code. Ask about their daily workflow: IDE all day versus terminal-heavy? Compare side by side: Cursor is VS Code fork with inline edit and Composer; Claude Code is CLI agent with git-aware file edits. Discuss model flexibility — Cursor multi-model versus Claude-only. Present task: migrate a module across 20 files with tests — which tool and why? Ask about diff review: Cursor visual UI versus terminal git diff. Cover headless/CI use cases where Claude Code shines. Mention cost and subscription models at high level. When would they use both? Score pragmatic workflow fit, not fanboy picks.`,
    summary: `<strong>Cursor</strong> embeds AI in your <strong>IDE</strong> for interactive coding — inline edits, chat, and multi-file Composer with visual diffs. <strong>Claude Code</strong> runs from the <strong>terminal</strong> as an autonomous agent focused on Anthropic Claude, ideal for large refactors, scripts, and headless workflows. Many developers use <strong>both</strong>: Cursor for daily feature work, Claude Code for heavy migration jobs.`,
    analogy: 'Cursor is a smart co-pilot in the cockpit; Claude Code is an autonomous drone you launch for a specific survey mission.',
    howItWorks:
      table(['Dimension', 'Cursor', 'Claude Code'], [
        ['Interface', 'VS Code fork IDE', 'Terminal CLI'],
        ['Primary interaction', 'Chat, Cmd+K, Agent', 'Natural language commands'],
        ['Models', 'GPT, Claude, others', 'Anthropic Claude'],
        ['Diff review', 'Visual side-by-side', 'git diff in terminal'],
        ['Best for', 'Interactive daily dev', 'Batch refactors, automation'],
        ['Context', '@file, @codebase', 'Full repo via agent tools'],
        ['CI / headless', 'Limited', 'Stronger scriptable potential'],
      ]),
    flowNote: 'Decision is workflow-shaped: if you live in the IDE, start Cursor; if you live in tmux and git, try Claude Code first.',
    steps: [
      { title: 'Map your typical tasks', body: 'List last week: bug fixes, new features, refactors, code review. Interactive vs batch ratio guides the tool.' },
      { title: 'Try Cursor for a feature', body: 'Small feature with @files, rules, test run. Note how fast inline edit feels for local changes.' },
      { title: 'Try Claude Code for a refactor', body: '"Rename UserService to AccountService across repo and fix imports." Review git diff scope.' },
      { title: 'Compare review experience', body: 'Which diff UI helps you catch mistakes? Speed of accept/reject loop matters more than raw model IQ.' },
      { title: 'Evaluate team constraints', body: 'Security: where does code go? Budget: seats vs API usage? Standardize or allow both?' },
      { title: 'Define a combined playbook', body: 'Example: Cursor for features; Claude Code for "migrate X to Y" Friday jobs with PR template.' },
    ],
    patterns:
      note('<strong>Choose Cursor if:</strong> you want AI inside the editor all day, multi-model flexibility, and visual diff review.<br><strong>Choose Claude Code if:</strong> you prefer terminal, large autonomous repo tasks, or Claude-specific reasoning.<br><strong>Use both:</strong> Cursor for interactive dev; Claude Code for migrations and scripted agent runs.'),
    pitfalls: [
      ['Picking by hype not workflow', 'Wrong tool frustrates team', 'Trial both on real tasks for one week'],
      ['No review discipline', 'Both can ship bad code fast', 'Same PR review standards regardless of tool'],
      ['Duplicate subscriptions', 'Unnecessary cost', 'Team policy: primary + optional second tool'],
      ['Ignoring data policies', 'Code leaves approved boundary', 'Check enterprise options per vendor'],
      ['Huge autonomous jobs unchecked', 'Wide blast radius', 'Scope refactors; branch per agent run'],
      ['Skipping tests after either tool', 'Regressions', 'CI must pass before merge — non-negotiable'],
    ],
    production: [
      'Document approved AI tools in engineering handbook',
      'Require human review on all agent-generated PRs',
      'Use branch protection and CI gates unchanged',
      'Track velocity and defect rate — adjust tool policy with data',
    ],
    qa: [
      ['Main difference?', 'Cursor: IDE-integrated. Claude Code: terminal-first autonomous agent.'],
      ['Can I use both?', 'Yes — common pattern: Cursor daily, Claude Code for big refactors.'],
      ['Which is better for beginners?', 'Cursor — familiar VS Code UI and smaller scoped edits.'],
      ['Which for monorepo migration?', 'Claude Code often handles wide refactors well; still review full diff.'],
      ['Model choice?', 'Cursor: multi-provider. Claude Code: Anthropic only.'],
      ['Security comparison?', 'Depends on plan and settings — evaluate data retention per org policy.'],
    ],
    tools: [
      '<strong>Cursor:</strong> Chat, Composer, .cursor/rules',
      '<strong>Claude Code:</strong> claude CLI, git integration',
      '<strong>Shared:</strong> git, CI, code review (GitHub/GitLab)',
    ],
    checklist: [
      'Tried both on real repo tasks',
      'Workflow mapped (IDE vs terminal heavy)',
      'Diff review process defined for agent output',
      'Data/privacy policy checked for each tool',
      'Team playbook documents when to use which',
      'CI and tests required post-agent edits',
      'Subscription/budget aligned to usage',
      'No blind merge of large agent PRs',
      'Periodic retro on tool effectiveness',
    ],
    tags: ['cursor', 'claude-code', 'comparison', 'workflow', 'ide'],
  },
  {
    slug: 'prompt-engineering-basics',
    title: 'Prompt Engineering Basics',
    subtitle: 'Clear instructions, examples, structure, and evaluation — the foundation before fancy RAG.',
    tip: 'Framework: Role + Task + Context + Format + Constraints. Always show 1–2 few-shot examples for structured output.',
    prompt: `You are interviewing on prompt engineering fundamentals before the candidate touches RAG or agents. Ask them to improve a bad prompt: "summarize this." Introduce RTCF: Role, Task, Context, Format, Constraints. When do few-shot examples beat chain-of-thought? Ask about temperature choices for factual vs creative tasks. Present failure: model outputs valid JSON but wrong schema — how do they fix it? Discuss evaluation: how do you know a prompt change helped? Mention prompt injection risks in user-facing apps. Hands-on: write a prompt that classifies support tickets into {billing, bug, feature} with exactly one label and a confidence score. Score structure, eval mindset, and knowing limits of prompting versus retrieval.`,
    summary: `<strong>Prompt engineering</strong> is designing inputs so LLMs reliably produce the output you need — without retraining. Core framework: <strong>Role</strong> (who), <strong>Task</strong> (what), <strong>Context</strong> (background), <strong>Format</strong> (shape), <strong>Constraints</strong> (rules). Techniques: few-shot examples, chain-of-thought, self-check, and temperature tuning.`,
    analogy: 'Prompting is like writing a great brief for a freelancer — vague briefs get vague work; precise briefs with examples get repeatable results.',
    howItWorks:
      layers([
        'Role — "You are a senior backend engineer reviewing PRs"',
        'Task — "List security issues in the diff below"',
        'Context — requirements, audience, data the model needs',
        'Format — JSON schema, bullet count, markdown table, max words',
        'Constraints — "Only use provided context; say unknown if missing"',
      ]) +
      diagram('Technique picker', flow([
        { text: 'Need structure?', class: 'gray' },
        { text: 'Few-shot examples', class: 'purple' },
        { text: 'Need reasoning?', class: 'gray' },
        { text: 'Chain-of-thought', class: 'green' },
        { text: 'Need facts?', class: 'gray' },
        { text: 'RAG or tools', class: 'orange' },
      ])),
    flowNote: 'Always A/B test prompt changes on a fixed eval set — intuition lies; metrics don\'t.',
    steps: [
      { title: 'Define success criteria', body: 'What does good output look like? Write 5 ideal examples before crafting the prompt.' },
      { title: 'Draft RTCF prompt', body: 'Role + Task + Context + Format + Constraints in clear sections or XML tags.' },
      { title: 'Add 1–2 few-shot examples', body: 'Show input → expected output for classification, extraction, or formatting tasks.' },
      { title: 'Tune parameters', body: 'temperature=0 for deterministic facts; higher for brainstorming. Set max_tokens to prevent rambling.' },
      { title: 'Build eval set', body: '20–50 inputs with golden outputs. Run prompt v1 and v2; compare accuracy or use LLM-as-judge.' },
      { title: 'Harden for production', body: 'Separate system vs user content; defend against injection; version prompts in git.' },
    ],
    patterns:
      table(['Technique', 'Purpose', 'Example phrase'], [
        ['Few-shot', 'Teach format by example', 'Input: ... Output: ...'],
        ['Chain-of-thought', 'Multi-step reasoning', '"Think step by step"'],
        ['Self-check', 'Reduce errors', '"Verify against rules before answering"'],
        ['Delimiters', 'Separate sections', '### Context ### ... ### Task ###'],
        ['Negative constraints', 'Prevent bad behavior', '"Do not invent citations"'],
      ]),
    codeHint: `<pre>SYSTEM = """You are a ticket classifier.
Output JSON only: {"label": "billing|bug|feature", "confidence": 0-1}

Example:
Input: "I was charged twice"
Output: {"label": "billing", "confidence": 0.95}
"""
USER = f"Input: {ticket_text}"</pre>`,
    pitfalls: [
      ['Vague instructions', 'Inconsistent outputs', 'RTCF framework; explicit format'],
      ['No examples for structured output', 'JSON syntax errors', 'Few-shot 2–3 examples in prompt'],
      ['High temperature for facts', 'Hallucinations', 'temperature 0–0.2 for extraction/classification'],
      ['Prompt too long without hierarchy', 'Model ignores middle', 'XML tags; repeat key rules at end'],
      ['No eval loop', 'Regression on "improvements"', 'Fixed test set before/after changes'],
      ['User content in system prompt', 'Injection overrides instructions', 'Sanitize user input; delimiter boundaries'],
    ],
    production: [
      'Store prompts in version control with changelog',
      'Prompt templates with variable slots — not string concat in app code',
      'Monitor output format parse failure rate',
      'Fallback prompt or smaller model when primary fails',
    ],
    qa: [
      ['What is few-shot prompting?', 'Including example input/output pairs in the prompt to teach format and behavior.'],
      ['What is chain-of-thought?', 'Asking the model to reason step by step before the final answer — improves logic tasks.'],
      ['Temperature 0 vs 1?', '0 = more deterministic; 1 = more random/creative.'],
      ['When is prompting not enough?', 'Need fresh facts (RAG), actions (tools), or consistent niche style at scale (fine-tune).'],
      ['What is prompt injection?', 'User text that tricks the model to ignore system instructions — mitigate with separation and validation.'],
      ['How evaluate prompts?', 'Labeled test set, accuracy/F1, human review, or LLM-as-judge with rubric.'],
    ],
    tools: [
      '<strong>Playgrounds:</strong> OpenAI Playground, Claude console',
      '<strong>Eval:</strong> Promptfoo, LangSmith datasets',
      '<strong>Libraries:</strong> Guidance, Instructor (structured output)',
      '<strong>Versioning:</strong> git, PromptLayer',
    ],
    checklist: [
      'RTCF sections present in system prompt',
      '2+ few-shot examples for structured tasks',
      'Temperature appropriate for task type',
      'max_tokens set to prevent runaway output',
      'Eval set of 20+ examples created',
      'Prompts versioned in git',
      'User input separated from system instructions',
      'Parse failures logged and monitored',
      'Documented when to escalate to RAG/tools',
    ],
    tags: ['prompting', 'few-shot', 'cot', 'evaluation', 'rtcf'],
  },
  {
    slug: 'embeddings-basics',
    title: 'Embeddings Basics',
    subtitle: 'Turn text into vectors so similarity search powers RAG, recommendations, and clustering.',
    tip: 'Explain: same embedding model for index + query; cosine similarity; dimension size affects cost.',
    prompt: `You are teaching embeddings to a developer building their first RAG system. Ask them to explain embeddings in one sentence without saying "AI magic." Cover: text → vector of floats, similar meaning → close in space. Why must index and query use the same model? Explain cosine similarity versus Euclidean distance. Ask about dimension trade-offs: 1536 vs 384 dims for cost and quality. Present bug: search returns irrelevant chunks — is it embedding quality or chunking? Discuss normalization before dot product. Hands-on: they have 10K product descriptions — walk through batch embedding and upsert. Ask about multimodal embeddings briefly. Close with eval: recall@5 on labeled pairs. Score conceptual clarity and practical indexing knowledge.`,
    summary: `An <strong>embedding</strong> is a dense vector (list of floats) representing text semantics. <strong>Similar meanings map to nearby vectors</strong>, enabling similarity search, clustering, deduplication, and RAG retrieval. Use the <strong>same model</strong> when indexing documents and embedding queries; compare with <strong>cosine similarity</strong> (or dot product on normalized vectors).`,
    analogy: 'Embeddings are GPS coordinates for meaning — "puppy" and "dog" sit close; "dog" and "airplane" are far apart.',
    howItWorks:
      diagram('Similarity in vector space', flow([
        { text: '"refund policy"' },
        { text: 'Embed', class: 'purple' },
        { text: '[0.02, -0.15, ...]', class: 'green' },
        { text: 'Nearest neighbors', class: 'orange' },
        { text: 'Top matches' },
      ])) +
      note('<strong>Cosine similarity</strong> measures angle between vectors (0–1). <strong>Euclidean distance</strong> measures straight-line distance — cosine is standard for text because magnitude matters less than direction.'),
    flowNote: 'Batch embed documents offline (cheap, parallel); embed queries online (low latency, one string at a time).',
    steps: [
      { title: 'Choose an embedding model', body: 'OpenAI text-embedding-3-small/large, Cohere embed-v3, BGE, Voyage — pick one and stick with it for the index.' },
      { title: 'Preprocess text', body: 'Lowercase optional; strip HTML; keep meaningful headers. Very short strings embed poorly — add context prefix.' },
      { title: 'Batch embed documents', body: 'Send 100–500 chunks per API call. Store vector + metadata (doc_id, chunk_index, text snippet).' },
      { title: 'Index in vector store', body: 'Pinecone, pgvector, Chroma — create index with correct dimension count from model spec.' },
      { title: 'Embed query at search time', body: 'Same model, same dimensions. Normalize if using dot product as cosine proxy.' },
      { title: 'Evaluate retrieval', body: 'Labeled question → relevant doc pairs. Measure recall@k and MRR before tuning chunking or model.' },
    ],
    patterns:
      table(['Model tier', 'Dims (approx)', 'Trade-off'], [
        ['Small / fast', '384–768', 'Lower cost, good for POC'],
        ['Standard', '1024–1536', 'Best balance for RAG'],
        ['Large', '3072+', 'Higher quality, storage cost'],
        ['Multimodal', 'Varies', 'Image + text same space (CLIP-style)'],
      ]),
    codeHint: `<pre>from openai import OpenAI
client = OpenAI()
# Index time (batch)
resp = client.embeddings.create(
    model="text-embedding-3-small",
    input=["chunk one text", "chunk two text"]
)
vectors = [d.embedding for d in resp.data]
# Query time — same model
q_vec = client.embeddings.create(
    model="text-embedding-3-small", input=[user_query]
).data[0].embedding
scores = cosine_similarity(q_vec, indexed_vectors)</pre>`,
    pitfalls: [
      ['Mixed models in one index', 'Nonsense similarity scores', 'Re-embed entire corpus on model change'],
      ['Not normalizing vectors', 'Wrong ranking with dot product', 'L2-normalize or use cosine metric in DB'],
      ['Embedding tiny chunks', 'Weak semantic signal', 'Minimum ~50 tokens or prepend title/context'],
      ['Ignoring multilingual needs', 'Poor cross-language retrieval', 'Use multilingual model (e.g. multilingual-e5)'],
      ['No retrieval eval', 'Blind chunk/model tweaks', 'recall@k on 50+ labeled pairs'],
      ['Storing only vectors', 'Cannot show user source text', 'Keep text or doc_id in metadata'],
    ],
    production: [
      'Cache query embeddings for frequent searches',
      'Quantization (PQ) for large indexes to cut memory',
      'Monitor embedding API latency and error rate',
      'Version index when model changes — blue/green re-index',
    ],
    qa: [
      ['What is an embedding?', 'Fixed-size vector capturing semantic meaning of text for similarity comparison.'],
      ['Cosine vs Euclidean?', 'Cosine compares direction (standard for text); Euclidean compares magnitude and direction.'],
      ['Why same model for index and query?', 'Different models use incompatible vector spaces — similarity would be meaningless.'],
      ['What affects embedding quality?', 'Model choice, text preprocessing, chunk size, and domain match.'],
      ['Embeddings vs keywords?', 'Embeddings capture semantic similarity; keywords need exact term overlap (BM25).'],
      ['How many dimensions?', 'Set by model — trade storage/cost vs quality; cannot mix dims in one index.'],
    ],
    tools: [
      '<strong>APIs:</strong> OpenAI embeddings, Cohere, Voyage AI',
      '<strong>Open models:</strong> sentence-transformers, BGE, E5',
      '<strong>Stores:</strong> Pinecone, pgvector, Weaviate, FAISS (local)',
      '<strong>Eval:</strong> custom recall@k scripts, RAGAS',
    ],
    checklist: [
      'Single embedding model chosen and documented',
      'Dimension matches vector DB index config',
      'Documents batch-embedded with metadata',
      'Queries embedded with identical model',
      'Cosine similarity or normalized dot product used',
      'Chunk size tested — not too small',
      'recall@k measured on labeled set',
      'Re-index plan documented for model upgrades',
      'Query embedding cache considered for hot queries',
    ],
    tags: ['embeddings', 'vectors', 'cosine-similarity', 'rag', 'semantic-search'],
  },
  {
    slug: 'openai-api-basics',
    title: 'OpenAI API Basics',
    subtitle: 'Chat Completions, responses API, tools, embeddings, and billing gotchas.',
    tip: 'Know message roles (system/user/assistant), token limits, structured outputs, and function calling flow.',
    prompt: `You are conducting a technical screen on the OpenAI API. Ask the candidate to diagram a chat completion request: roles, model, messages array. Contrast Chat Completions with the newer Responses API at a high level. Walk through function calling: model returns tool_calls, app executes, sends tool result back. Ask about structured outputs / JSON schema mode versus hoping for valid JSON in text. Cover token limits: context window, max_tokens, and counting with tiktoken. Present billing surprise: dev left streaming on in a loop — how prevent? Discuss Batch API for 50% discount use cases. Ask about embeddings endpoint versus chat. Score API mechanics, cost awareness, and production error handling.`,
    summary: `The <strong>OpenAI API</strong> provides programmatic access to GPT models via <strong>Chat Completions</strong> (and newer <strong>Responses API</strong>), plus <strong>Embeddings</strong>, <strong>Images</strong>, <strong>Audio</strong>, and <strong>Batch</strong> endpoints. Core concepts: <strong>message roles</strong> (system, user, assistant, tool), <strong>token limits</strong>, <strong>function/tool calling</strong>, and <strong>structured outputs</strong> for reliable JSON.`,
    analogy: 'The API is a vending machine for intelligence — you insert tokens (paid), select the model SKU, and get formatted output if you specify the slot correctly.',
    howItWorks:
      diagram('Function calling flow', flow([
        { text: 'User message', class: 'gray' },
        { text: 'Model', class: 'purple' },
        { text: 'tool_calls JSON', class: 'green' },
        { text: 'Your function', class: 'orange' },
        { text: 'Tool result → final reply' },
      ])) +
      layers([
        'Authentication — Bearer API key from platform.openai.com',
        'Chat Completions — POST /v1/chat/completions with model + messages',
        'Streaming — stream: true yields SSE token deltas for UX',
        'Tools — pass tools[] schema; model may return tool_calls to execute',
        'Embeddings — separate endpoint for vector generation; Batch API for async 50% off',
      ]),
    flowNote: 'gpt-4o and gpt-4o-mini are default choices in 2025 — verify current model IDs in OpenAI docs before hardcoding.',
    steps: [
      { title: 'Get API key and set env', body: 'export OPENAI_API_KEY=sk-... — use secrets manager in production. Set usage limits and alerts on dashboard.' },
      { title: 'First chat completion', body: 'messages=[{role:"system",...},{role:"user",...}]. Parse choices[0].message.content.' },
      { title: 'Add streaming', body: 'stream=True; iterate chunks for choices[0].delta.content. Handle [DONE] and connection drops.' },
      { title: 'Implement tool calling', body: 'Define tools array; if message.tool_calls, run functions, append role:"tool" messages, call API again.' },
      { title: 'Structured outputs', body: 'Use response_format json_schema for guaranteed schema compliance on supported models.' },
      { title: 'Monitor usage', body: 'Log response.usage.prompt_tokens and completion_tokens. Aggregate daily cost per feature.' },
    ],
    patterns:
      table(['Endpoint', 'Use case', 'Cost note'], [
        ['Chat Completions', 'Interactive chat, agents', 'Per input + output token'],
        ['Embeddings', 'RAG indexing', 'Cheaper per token than chat'],
        ['Batch API', 'Offline eval, bulk jobs', '~50% discount, 24h window'],
        ['Images / Audio', 'Multimodal products', 'Separate pricing table'],
        ['Fine-tuning', 'Custom model weights', 'Training + inference premium'],
      ]),
    codeHint: `<pre>from openai import OpenAI
client = OpenAI()
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are helpful."},
        {"role": "user", "content": user_input}
    ],
    tools=TOOLS,  # optional
    response_format={"type": "json_schema", "json_schema": SCHEMA},
    max_tokens=1024,
    temperature=0.2
)
text = response.choices[0].message.content
usage = response.usage</pre>`,
    pitfalls: [
      ['Exposed API key', 'Account drained by bots', 'Backend only; rotate key if leaked'],
      ['No max_tokens cap', 'Runaway completion cost', 'Set max_tokens per request type'],
      ['Ignoring 429 errors', 'Cascading failures', 'Exponential backoff; request queue'],
      ['Wrong message role order', 'Confused multi-turn context', 'Alternate user/assistant; tool after assistant tool_calls'],
      ['Parsing JSON from free text', 'Fragile pipelines', 'Use structured outputs / json_schema mode'],
      ['Not counting tokens pre-call', 'Context overflow errors', 'tiktoken estimate; trim or summarize history'],
    ],
    production: [
      'Organization-level API keys per environment',
      'Idempotency keys for payment-critical flows if supported',
      'Fallback model (4o-mini) when flagship model overloaded',
      'Redact PII before sending to API',
    ],
    qa: [
      ['Message roles?', 'system (instructions), user, assistant (model), tool (function results).'],
      ['What is max_tokens?', 'Cap on tokens the model generates in the response — controls cost and length.'],
      ['Function calling flow?', 'Model returns tool_calls → you execute → send tool message → model final answer.'],
      ['Batch API benefit?', '~50% cheaper for non-urgent jobs completed within 24 hours.'],
      ['Structured outputs?', 'JSON schema enforcement so output always matches your schema.'],
      ['How estimate cost?', 'prompt_tokens + completion_tokens × price per 1M tokens for model tier.'],
    ],
    tools: [
      '<strong>SDK:</strong> openai Python/Node official library',
      '<strong>Token counting:</strong> tiktoken',
      '<strong>Proxies:</strong> LiteLLM, Portkey',
      '<strong>Dashboard:</strong> platform.openai.com usage & limits',
    ],
    checklist: [
      'API key in env var, not source code',
      'Usage limits and billing alerts set',
      'max_tokens configured per endpoint',
      'Streaming implemented for user-facing chat',
      '429/5xx retry with backoff',
      'Token usage logged per request',
      'Structured outputs for JSON pipelines',
      'Tool calling loop tested end-to-end',
      'Model IDs verified against current docs',
    ],
    tags: ['openai', 'api', 'function-calling', 'tokens', 'structured-output'],
  },
  {
    slug: 'fine-tuning-basics',
    title: 'Fine-Tuning Basics',
    subtitle: 'When to train vs prompt — customize behavior, tone, or format on your examples.',
    tip: 'Default order: prompt engineering → RAG → fine-tune. Fine-tune for style/format or niche domain with lots of examples.',
    prompt: `You are advising a product team tempted to fine-tune immediately. Establish the ladder: prompt engineering first, then RAG for facts, then fine-tune for behavior at scale. Ask when fine-tuning wins: consistent JSON format, brand tone, specialized classification with 500+ examples. When is it wrong? Needing fresh facts — that's RAG. Walk through data prep: JSONL with messages or prompt/completion pairs, diverse edge cases, holdout set. Ask about overfitting and evaluating fine-tuned vs base on same prompts. Cover cost: training job + higher inference on custom model. Mention alternatives: few-shot, structured outputs, distillation. Hands-on: they have 50 support reply examples — fine-tune or prompt? Score judgment on when NOT to fine-tune and data quality awareness.`,
    summary: `<strong>Fine-tuning</strong> continues training a base model on <strong>your labeled examples</strong> so it internalizes style, format, or domain patterns. Default path: <strong>prompt engineering → RAG → fine-tune</strong>. Fine-tune when you have hundreds of quality examples and need consistent behavior at scale — not when you need up-to-date facts (use RAG).`,
    analogy: 'Fine-tuning is hiring someone who already studied your company style guide — versus giving them the guide every morning (prompting) or a searchable wiki (RAG).',
    howItWorks:
      diagram('Fine-tune pipeline', flow([
        { text: 'Curate JSONL', class: 'gray' },
        { text: 'Upload + train', class: 'purple' },
        { text: 'Eval holdout', class: 'green' },
        { text: 'Deploy model ID', class: 'orange' },
        { text: 'Monitor drift' },
      ])) +
      layers([
        'Data — 100–10K+ high-quality input→output pairs in JSONL format',
        'Train — provider fine-tuning job (OpenAI, Anthropic, open models on GPU)',
        'Validate — compare fine-tuned vs base on held-out prompts',
        'Deploy — custom model name in API calls',
        'Maintain — re-train when product, policies, or format change',
      ]),
    flowNote: 'Garbage in, garbage out — 200 perfect examples beat 2000 noisy ones. Audit labels before uploading.',
    steps: [
      { title: 'Confirm fine-tune is needed', body: 'Try structured outputs, few-shot, and RAG first. Document failure cases fine-tuning must fix.' },
      { title: 'Curate training data', body: 'JSONL: each line messages array or prompt/completion. Cover edge cases, refusals, and diverse phrasing.' },
      { title: 'Hold out test set', body: '10–20% never seen in training. Define metrics: exact match, F1, human preference, or LLM judge.' },
      { title: 'Run training job', body: 'Upload via API or dashboard. Note job ID, hyperparameters, and base model version.' },
      { title: 'Evaluate vs baseline', body: 'Same prompts on base model and fine-tuned model. Fine-tune must win clearly to justify cost.' },
      { title: 'Deploy and monitor', body: 'Route traffic to ft model; track quality regressions; schedule re-train quarterly or on policy change.' },
    ],
    patterns:
      table(['Fine-tune when', 'Don\'t fine-tune yet'], [
        ['Consistent output format at scale', 'Need current facts → RAG'],
        ['Brand tone across millions of calls', '< 100 quality examples'],
        ['Niche classification with labels', 'Prompt + few-shot works on eval'],
        ['Reduce prompt length/cost', 'Can solve with structured outputs'],
      ]),
    codeHint: `<pre># OpenAI fine-tune data format (chat)
{"messages": [
  {"role": "system", "content": "You are support bot."},
  {"role": "user", "content": "Where is my order?"},
  {"role": "assistant", "content": "Please share order ID..."}
]}
# After training:
client.chat.completions.create(
    model="ft:gpt-4o-mini:org:custom:abc123",
    messages=[...]
)</pre>`,
    pitfalls: [
      ['Fine-tuning for facts', 'Model still hallucinates dates', 'RAG for knowledge; fine-tune for behavior'],
      ['Too few examples', 'Overfits, poor generalization', '500+ diverse examples or stay with prompting'],
      ['Noisy labels', 'Learns wrong patterns', 'Human review sample; inter-annotator agreement'],
      ['No holdout eval', 'False confidence from train set', 'Blind test set compared to base model'],
      ['Skipping version control on data', 'Cannot reproduce model', 'Git LFS or DVC for JSONL datasets'],
      ['Ignoring inference cost', 'Custom model may cost more per token', 'Calculate TCO vs long prompts'],
    ],
    production: [
      'A/B test fine-tuned vs base in production',
      'Rollback to base model via feature flag',
      'Document training data provenance for compliance',
      'Re-train pipeline triggered on labeled data threshold',
    ],
    qa: [
      ['Fine-tune vs RAG?', 'Fine-tune: behavior/style. RAG: fresh external facts at query time.'],
      ['How many examples?', 'Rough guide: 100 minimum viable, 500+ for solid classification, quality > quantity.'],
      ['What format?', 'Provider-specific JSONL — chat messages or prompt/completion pairs.'],
      ['How evaluate?', 'Held-out set vs base model on same metrics; human eval for tone tasks.'],
      ['When re-train?', 'Policy change, product pivot, or measured quality drift.'],
      ['Open vs API fine-tune?', 'API fine-tune easy; open models (LoRA) need GPU ops but more control.'],
    ],
    tools: [
      '<strong>API fine-tune:</strong> OpenAI, Anthropic (where offered)',
      '<strong>Open:</strong> Hugging Face, Axolotl, LoRA/QLoRA',
      '<strong>Data:</strong> Label Studio, spreadsheets → JSONL scripts',
      '<strong>Eval:</strong> promptfoo, human review panels',
    ],
    checklist: [
      'Prompting and RAG attempted first',
      'Clear success metric defined',
      '500+ curated examples OR strong justification for fewer',
      '10–20% holdout test set locked',
      'Labels audited for consistency',
      'Fine-tuned model beats base on holdout',
      'Training data versioned in git/DVC',
      'Rollback to base model planned',
      'Inference cost compared to long-prompt baseline',
    ],
    tags: ['fine-tuning', 'training-data', 'lora', 'evaluation', 'jsonl'],
  },
  {
    slug: 'mcp-basics',
    title: 'MCP (Model Context Protocol) Basics',
    subtitle: 'Standard way to plug tools, data sources, and IDEs into LLM clients — one protocol, many servers.',
    tip: 'MCP = USB-C for AI tools. Host (Cursor, Claude) connects to MCP servers (GitHub, DB, filesystem).',
    prompt: `You are explaining MCP to a developer who built custom tool integrations for one app and now maintains three copies. Describe MCP as a standard host↔server protocol. Ask them to name MCP host vs server vs tool vs resource. Walk through connection flow: host discovers capabilities at startup. Why does this beat bespoke plugins per IDE? Discuss building a custom MCP server for an internal API. Cover security: what can a malicious server do? Ask about stdio versus SSE transport. Present scenario: Cursor needs GitHub issues + Postgres read-only — two MCP servers. Compare briefly to function calling inside one app. Score understanding of ecosystem value and security boundaries.`,
    summary: `<strong>MCP (Model Context Protocol)</strong> is an open standard connecting <strong>hosts</strong> (Cursor, Claude Desktop, custom apps) to <strong>MCP servers</strong> that expose <strong>tools</strong> (actions) and <strong>resources</strong> (readable data). One server implementation works across any MCP-compatible host — like USB-C for AI integrations.`,
    analogy: 'MCP is USB-C for AI tools: one port on the host (IDE), many peripherals (servers) that plug in without custom drivers per app.',
    howItWorks:
      diagram('MCP architecture', flow([
        { text: 'MCP Host', class: 'gray' },
        { text: '↔ protocol', class: 'purple' },
        { text: 'MCP Server', class: 'green' },
        { text: 'Tools + Resources', class: 'orange' },
      ])) +
      layers([
        'Host — LLM client (Cursor, Claude Desktop) that runs the agent loop',
        'Server — process exposing tools (run query) and resources (read file, fetch doc)',
        'Discovery — host lists available tools/resources at connection time',
        'Invocation — model selects tool; host routes call to correct server',
        'Transports — stdio (local) or SSE/HTTP (remote servers)',
      ]),
    flowNote: 'Community servers exist for GitHub, Postgres, Slack, Brave Search — check official MCP registry before building custom.',
    steps: [
      { title: 'Identify host and needs', body: 'Cursor or Claude Desktop — list data sources and actions the agent needs (repo, DB, tickets).' },
      { title: 'Install community servers', body: 'Configure mcp.json with server command, args, and env vars. Restart host to discover tools.' },
      { title: 'Authenticate safely', body: 'Pass API tokens via env — not committed. Use read-only DB credentials where possible.' },
      { title: 'Test tool discovery', body: 'Ask agent "what tools do you have?" Verify expected tools appear before real tasks.' },
      { title: 'Build custom server (optional)', body: 'Use MCP SDK (TypeScript/Python) to wrap internal API as tools with JSON schemas.' },
      { title: 'Harden for team rollout', body: 'Allowlist approved servers; document each tool capability; audit logs on sensitive tools.' },
    ],
    patterns:
      table(['Concept', 'Description', 'Example'], [
        ['Host', 'Runs LLM + connects servers', 'Cursor IDE'],
        ['Server', 'Exposes capabilities', 'github-mcp-server'],
        ['Tool', 'Action with side effects', 'create_issue, run_query'],
        ['Resource', 'Readable data URI', 'file://, db schema'],
        ['Transport', 'Connection channel', 'stdio, SSE'],
      ]),
    codeHint: `<pre>// ~/.cursor/mcp.json (conceptual)
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "\${GITHUB_TOKEN}" }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "DATABASE_URL": "\${DATABASE_URL}" }
    }
  }
}</pre>`,
    pitfalls: [
      ['Over-permissioned servers', 'Agent deletes prod data', 'Read-only creds; separate write tools with approval'],
      ['Unvetted community servers', 'Malicious code in server process', 'Allowlist; review server source'],
      ['Secrets in mcp.json committed', 'Token leak in git', 'Env var references only; .gitignore config'],
      ['Too many tools enabled', 'Model picks wrong tool', 'Enable minimal set per project'],
      ['No transport security (remote)', 'MITM on SSE', 'TLS, auth tokens, private network'],
      ['Confusing MCP with function calling', 'MCP is cross-app standard; function calling is per-API', 'Use MCP for reusable integrations'],
    ],
    production: [
      'Central IT-approved server catalog for enterprise',
      'Per-team mcp.json templates with least privilege',
      'Log every tool invocation with user and args (redacted)',
      'Sandbox custom servers before org-wide deploy',
    ],
    qa: [
      ['What is MCP?', 'Open protocol for LLM hosts to connect to external tools and data via MCP servers.'],
      ['Host vs server?', 'Host runs the AI client; server exposes tools/resources the host can call.'],
      ['Tool vs resource?', 'Tool performs an action; resource is addressable read-only data.'],
      ['Why not custom plugins?', 'Write once, use in Cursor, Claude, and other MCP hosts.'],
      ['stdio vs SSE?', 'stdio for local subprocess servers; SSE/HTTP for remote networked servers.'],
      ['Security concern?', 'Servers run with your credentials — treat like installing software with API access.'],
    ],
    tools: [
      '<strong>Hosts:</strong> Cursor, Claude Desktop, custom MCP clients',
      '<strong>SDK:</strong> @modelcontextprotocol/sdk (TS), mcp Python',
      '<strong>Servers:</strong> GitHub, Postgres, filesystem, Brave Search, Slack',
      '<strong>Registry:</strong> MCP server directory (official/community)',
    ],
    checklist: [
      'MCP host configured (Cursor mcp.json or Claude config)',
      'Only required servers enabled',
      'Credentials via environment variables',
      'Read-only access for exploratory DB tools',
      'Tool list verified after host restart',
      'Custom servers code-reviewed before use',
      'Team allowlist of approved MCP servers',
      'Sensitive tool calls audit-logged',
      'Understand difference from in-app function calling',
    ],
    tags: ['mcp', 'tools', 'cursor', 'integration', 'protocol'],
  },
];

export const aiPages = buildAIPages(aiConfigs);
