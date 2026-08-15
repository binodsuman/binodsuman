import {
  note,
  table,
  archDiagram,
  flow,
  layers,
  diagram,
  checklist,
  tags,
  scaleBlock,
} from './sheet-helpers.mjs';

export const legacyPages = [
  // ─── 1. System Design Fundamentals ───────────────────────────────────
  {
    path: 'system-design/fundamentals',
    badge: 'System Design',
    badgeClass: 'system-design',
    title: 'System Design Fundamentals',
    subtitle: 'Core building blocks every senior interview expects — scalability, CAP, caching, load balancing, databases, CDN, and estimation.',
    breadcrumb:
      '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · <a href="/cheat-sheets/system-design/">System Design</a> · Fundamentals',
    tip: 'Start every answer: requirements (functional + non-functional) → estimate scale → high-level diagram → deep dive 2 components → trade-offs.',
    prompt: `You are a senior staff engineer conducting a 45-minute system design fundamentals interview. The candidate must demonstrate mastery of scalability (vertical vs horizontal), stateless services, load balancing algorithms, caching strategies (cache-aside, write-through, TTL, eviction), the CAP theorem with real examples, SQL vs NoSQL trade-offs, CDN placement, and back-of-envelope math.

Begin by asking them to design the read path for a simple web app at 10M DAU. Push them to calculate requests/sec, storage, and bandwidth. Ask them to draw a diagram: Client → CDN → LB → App → Cache → DB. Probe on what happens when the cache misses, when a partition occurs, and when traffic spikes 10× overnight.

Deep dive on two topics of your choice: e.g. consistent hashing for cache nodes, or read replicas vs sharding. Challenge weak answers — "just use Redis" without eviction policy or hot-key mitigation is insufficient. Ask about monitoring and SLOs.

Give hints only when stuck. Score on structured thinking, accurate estimation, depth on trade-offs, and awareness of failure modes. End with: "What would you cut if you had only 2 weeks to ship?"`,
    papers: [
      {
        title: '① The 45-minute interview framework',
        body:
          note(
            `<strong>Every system design answer follows the same skeleton:</strong><ol>` +
              `<li><strong>Clarify (5 min):</strong> functional requirements, non-functional (latency, availability, consistency, scale), out of scope</li>` +
              `<li><strong>Estimate (5 min):</strong> DAU, QPS, storage, bandwidth — round numbers, state assumptions</li>` +
              `<li><strong>High-level design (10 min):</strong> boxes and arrows — client, CDN, LB, services, cache, DB, async queues</li>` +
              `<li><strong>Deep dive (15 min):</strong> pick 2 components the interviewer cares about — data model, hot path, sharding</li>` +
              `<li><strong>Trade-offs (5 min):</strong> SQL vs NoSQL, sync vs async, strong vs eventual consistency</li>` +
              `<li><strong>Wrap-up (5 min):</strong> failure modes, monitoring, future scale</li></ol>`
          ) +
          note(
            `<strong>Say aloud:</strong> "I'll start with requirements and scale, then draw the architecture, then go deep on X and Y." Interviewers reward structure over jumping to Redis.`
          ),
      },
      {
        title: '② Scalability — vertical vs horizontal',
        body:
          table(['Approach', 'How', 'Pros', 'Cons'], [
            ['Vertical scale', 'Bigger CPU/RAM/disk on one machine', 'Simple, no code changes', 'Hard ceiling, single point of failure, expensive at top tier'],
            ['Horizontal scale', 'More machines behind a load balancer', 'Near-unlimited, fault tolerant', 'Needs stateless apps, data partitioning, ops complexity'],
            ['Auto-scaling', 'Add/remove instances on metrics', 'Handles traffic spikes', 'Cold start latency, config tuning'],
            ['Read replicas', 'Copy DB for read-heavy workloads', 'Offload reads from primary', 'Replication lag, write still on primary'],
          ]) +
          note(
            `<strong>Stateless services scale easily:</strong> session data lives in Redis or DB, not in app memory. Sticky sessions reduce flexibility — prefer shared session store.<br><br>` +
              `<strong>Stateful services</strong> (WebSocket rooms, in-memory counters) need sharding, consistent hashing, or dedicated state stores.`
          ) +
          diagram(
            'Scaling decision tree',
            flow([
              { text: 'Traffic growing?', class: 'gray' },
              { text: 'Optimize first', class: '' },
              { text: 'Cache + CDN', class: 'purple' },
              { text: 'Scale reads', class: 'green' },
              { text: 'Scale writes', class: 'orange' },
            ])
          ),
      },
      {
        title: '③ Back-of-envelope estimation',
        body:
          scaleBlock([
            '1M DAU × 10 requests/day = 10M req/day ≈ 116 req/s average',
            'Plan for 10× peak → ~1,200 req/s at peak',
            'Avg request 1 KB in + 5 KB out → 1.2K × 6 KB ≈ 7 MB/s bandwidth',
            '100 bytes per record × 1B records = 100 GB raw (plus indexes ~2–3×)',
            '1 photo 200 KB × 10M uploads/month ≈ 2 TB/month storage growth',
          ]) +
          table(['Resource', 'Formula', 'Example'], [
            ['QPS', 'DAU × actions/day ÷ 86,400', '10M DAU × 20 ÷ 86,400 ≈ 2,300 avg'],
            ['Storage', 'records × size × retention', '1B users × 500 B × 5 yr'],
            ['Bandwidth', 'QPS × avg payload', '5K RPS × 50 KB = 250 MB/s'],
            ['Memory (cache)', 'hot data % × total dataset', '20% of 100 GB = 20 GB Redis'],
          ]) +
          note(
            `<strong>Rules of thumb:</strong> round to nearest power of 10; state assumptions ("assuming 10:1 read:write"); latency budget: CDN 10ms + LB 5ms + app 50ms + cache 1ms + DB 10ms = ~76ms p99 target.`
          ),
      },
      {
        title: '④ Load balancing',
        body:
          table(['Algorithm', 'Behavior', 'Best for'], [
            ['Round robin', 'Rotate requests evenly', 'Homogeneous stateless servers'],
            ['Least connections', 'Send to server with fewest active conns', 'Long-lived connections, varying request times'],
            ['Weighted round robin', 'More traffic to stronger machines', 'Mixed hardware capacity'],
            ['IP hash / consistent hash', 'Same client → same server', 'Session affinity without shared store (limited)'],
            ['Layer 4 (TCP)', 'Route by IP/port, fast', 'Raw throughput, WebSocket'],
            ['Layer 7 (HTTP)', 'Route by URL, headers, cookies', 'Microservices, A/B tests, canary'],
          ]) +
          archDiagram('Load balancer placement', [
            [{ text: 'Clients', class: 'gray' }],
            [{ text: 'DNS (geo-routing)', class: '' }, { text: 'Global LB', class: 'purple' }],
            [{ text: 'Regional LB (L7)', class: '' }],
            [{ text: 'App Server 1', class: 'green' }, { text: 'App Server 2', class: 'green' }, { text: 'App Server N', class: 'green' }],
          ]) +
          note(
            `<strong>Health checks:</strong> LB polls <code>/health</code> — remove unhealthy nodes within seconds. <strong>SSL termination</strong> at LB offloads crypto from app servers. <strong>Active-passive</strong> for stateful components; <strong>active-active</strong> for stateless.`
          ),
      },
      {
        title: '⑤ Caching strategies',
        body:
          table(['Pattern', 'Read path', 'Write path', 'Risk'], [
            ['Cache-aside', 'App → cache → miss → DB → populate cache', 'App writes DB, invalidates cache', 'Stale data if invalidation missed'],
            ['Read-through', 'Cache fetches from DB on miss', 'Same as cache-aside writes', 'Cache library must support it'],
            ['Write-through', 'Read from cache', 'Write cache + DB together', 'Write latency; cache and DB must sync'],
            ['Write-behind', 'Read from cache', 'Write cache; async flush to DB', 'Data loss if cache crashes before flush'],
          ]) +
          note(
            `<strong>Always set TTL</strong> — even with invalidation, TTL is your safety net. <strong>Eviction:</strong> LRU (common), LFU (frequency), TTL-based.<br><br>` +
              `<strong>Hot key problem:</strong> one viral key hammers a single Redis shard — replicate hot keys, local in-process cache, or pre-warm.<br><br>` +
              `<strong>Cache stampede:</strong> many requests miss simultaneously — use singleflight/locking so only one thread repopulates.`
          ) +
          diagram(
            'Cache-aside flow',
            flow([
              { text: 'Read request', class: 'gray' },
              { text: 'Check Redis', class: 'purple' },
              { text: 'Hit → return', class: 'green' },
              { text: 'Miss → DB', class: 'orange' },
              { text: 'Set cache + return', class: '' },
            ])
          ),
      },
      {
        title: '⑥ CAP theorem & consistency',
        body:
          note(
            `<strong>CAP:</strong> During a network partition, you choose between <strong>Consistency</strong> (all nodes see same data) and <strong>Availability</strong> (every request gets a response). Partition tolerance is non-negotiable in distributed systems — so you pick CP or AP.`
          ) +
          table(['Choice', 'Example systems', 'Use when'], [
            ['CP (Consistency + Partition)', 'ZooKeeper, etcd, HBase', 'Banking, inventory, leader election'],
            ['AP (Availability + Partition)', 'Cassandra, DynamoDB, CouchDB', 'Social feeds, shopping carts, analytics'],
            ['Strong consistency', 'Single-leader replication, sync writes', 'Financial transactions, unique constraints'],
            ['Eventual consistency', 'Async replication, quorum reads', 'User profiles, like counts, metrics'],
          ]) +
          note(
            `<strong>PACELC extension:</strong> Else (no partition), choose Latency vs Consistency. Most web apps pick low latency with eventual consistency for non-critical reads.<br><br>` +
              `<strong>Read-your-writes:</strong> user sees their own updates immediately — route to primary or use session stickiness + version checks.`
          ),
      },
      {
        title: '⑦ Database types — when to use what',
        body:
          table(['Type', 'Examples', 'Strengths', 'Weak for'], [
            ['Relational (SQL)', 'PostgreSQL, MySQL', 'ACID, joins, complex queries', 'Massive horizontal write scale'],
            ['Wide-column', 'Cassandra, HBase', 'High write throughput, time-series', 'Ad-hoc joins, transactions'],
            ['Document', 'MongoDB, DynamoDB', 'Flexible schema, nested JSON', 'Multi-document ACID (improving)'],
            ['Key-value', 'Redis, Memcached', 'Sub-ms reads, sessions, counters', 'Complex queries, durability (Redis)'],
            ['Search', 'Elasticsearch, OpenSearch', 'Full-text, aggregations, logs', 'Primary transactional store'],
            ['Graph', 'Neo4j, Neptune', 'Relationship traversals', 'Simple CRUD at huge scale'],
            ['Vector', 'Pinecone, pgvector', 'Similarity search, RAG', 'Exact lookups by primary key'],
          ]) +
          note(
            `<strong>Polyglot persistence:</strong> PostgreSQL for orders, Redis for sessions, Elasticsearch for search, S3 for blobs — each store optimized for its access pattern.<br><br>` +
              `<strong>Sharding:</strong> split rows by user_id hash or range when single-node limits hit (~10K writes/sec PG, higher with Citus/Cockroach).`
          ),
      },
      {
        title: '⑧ CDN & edge delivery',
        body:
          layers([
            'Origin server — your app or object storage (S3)',
            'CDN edge PoPs — cache static assets and cacheable API responses globally',
            'DNS / anycast — route user to nearest edge',
            'Client — receives content from edge, not origin (lower latency, less origin load)',
          ]) +
          note(
            `<strong>Cache at CDN:</strong> static files (JS, CSS, images), video segments, and cacheable GET responses with <code>Cache-Control</code> headers.<br><br>` +
              `<strong>Do NOT cache:</strong> personalized pages, auth tokens, POST responses, data with <code>Cache-Control: private/no-store</code>.<br><br>` +
              `<strong>Invalidation:</strong> versioned URLs (<code>app.v2.js</code>) beat purge APIs. Edge compute (Cloudflare Workers) for redirects and A/B at edge.`
          ) +
          archDiagram('CDN in request path', [
            [{ text: 'User (Tokyo)', class: 'gray' }, { text: 'User (London)', class: 'gray' }],
            [{ text: 'CDN Edge Tokyo', class: 'purple' }, { text: 'CDN Edge London', class: 'purple' }],
            [{ text: 'Origin / API (US)', class: 'green' }],
          ]),
      },
      {
        title: '⑨ End-to-end request path',
        body:
          diagram(
            'Typical web request path',
            flow([
              { text: 'Client', class: 'gray' },
              { text: 'DNS', class: '' },
              { text: 'CDN', class: 'purple' },
              { text: 'Load Balancer', class: '' },
              { text: 'App Server', class: 'green' },
              { text: 'Cache', class: 'orange' },
              { text: 'Database', class: 'green' },
            ])
          ) +
          note(
            `<strong>Latency budget example (p99 &lt; 200ms):</strong><ul>` +
              `<li>DNS + TLS: 20ms</li><li>CDN hit: 10ms (miss adds origin round-trip)</li>` +
              `<li>LB + routing: 5ms</li><li>App logic: 30ms</li><li>Redis: 1ms</li>` +
              `<li>DB query (indexed): 10ms</li><li>Serialization + network: 20ms</li></ul>`
          ) +
          note(
            `<strong>Async off critical path:</strong> analytics, emails, search indexing → message queue (Kafka/SQS) → workers. User-facing response returns before side effects complete.`
          ),
      },
      {
        title: '⑩ Revision checklist',
        body:
          checklist([
            'Opened with functional + non-functional requirements',
            'Calculated QPS, storage, bandwidth with stated assumptions',
            'Drew CDN → LB → App → Cache → DB diagram',
            'Explained vertical vs horizontal scaling choice',
            'Named caching strategy and invalidation approach',
            'Applied CAP with CP vs AP example relevant to the problem',
            'Picked SQL vs NoSQL with access-pattern justification',
            'Mentioned CDN for static assets and cacheable reads',
            'Identified async processing for non-critical work',
            'Discussed failure modes: DB down, cache stampede, hot keys',
          ]) +
          tags(['scalability', 'CAP', 'caching', 'load-balancing', 'estimation', 'CDN']),
      },
    ],
    related: [
      { href: '/cheat-sheets/system-design/', label: 'SD Top 15 Hub' },
      { href: '/cheat-sheets/system-design/patterns', label: 'SD Interview Patterns' },
      { href: '/cheat-sheets/system-design/url-shortener', label: 'URL Shortener' },
    ],
  },

  // ─── 2. System Design Patterns ───────────────────────────────────────
  {
    path: 'system-design/patterns',
    badge: 'System Design',
    badgeClass: 'system-design',
    title: 'System Design Interview Patterns',
    subtitle: 'Reusable patterns for fan-out, sharding, queues, idempotency, sagas, circuit breakers — and when to apply each.',
    breadcrumb:
      '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · <a href="/cheat-sheets/system-design/">System Design</a> · Patterns',
    tip: 'For any scenario, name 2–3 patterns aloud: "fan-out on write for notifications, idempotent consumers, circuit breaker on payment API."',
    prompt: `You are a senior system design interviewer focused on distributed patterns. Present the candidate with: "Design a notification system for 100M users — push, email, SMS on new follower, post like, and mention."

Ask which patterns apply: fan-out on write vs fan-out on read, message queues for decoupling, idempotency keys for duplicate delivery, circuit breakers on third-party SMS APIs, and rate limiting per channel. Then pivot: "Now the payment service calls 3 downstream services — how do you handle partial failure?" Expect saga vs 2PC discussion.

Probe sharding: partition notification inbox by user_id, consistent hashing when adding cache nodes. Challenge: "Consumer processed a message twice — what broke?" and "SMS provider is down — what happens to the queue?"

Score on pattern vocabulary, correct pattern-to-problem mapping, failure handling, and trade-off articulation. Give one hint if they conflate queue with pub-sub. End with: "Which pattern would you remove in an MVP?"`,
    papers: [
      {
        title: '① Pattern map — quick reference',
        body:
          table(['Pattern', 'Problem it solves', 'Watch out for'], [
            ['Fan-out on write', 'Precompute feeds/notifications at write time', 'Celebrity problem — too many followers'],
            ['Fan-out on read', 'Merge at read time — simpler writes', 'Slow reads for users following many accounts'],
            ['Sharding', 'Split data across nodes by key', 'Cross-shard queries, rebalancing pain'],
            ['Consistent hashing', 'Minimal key redistribution when nodes change', 'Hot spots if key distribution skewed'],
            ['Message queue', 'Decouple producers/consumers, absorb spikes', 'Ordering, duplicate delivery, poison messages'],
            ['Idempotency', 'Safe retries without duplicate side effects', 'Key storage TTL, scope of "same" operation'],
            ['Saga', 'Multi-step workflow without 2PC locks', 'Compensating transactions complexity'],
            ['Circuit breaker', 'Stop calling failing dependency', 'Half-open state tuning, cascading if misconfigured'],
          ]),
      },
      {
        title: '② Fan-out on write vs read',
        body:
          note(
            `<strong>Fan-out on write (push model):</strong> When user A posts, push post ID into every follower's feed cache (Redis sorted set). Read = O(1) fetch prebuilt feed. Write = O(followers) — expensive for celebrities.`
          ) +
          note(
            `<strong>Fan-out on read (pull model):</strong> Store posts by user; at read time merge posts from all followed users. Write = O(1). Read = O(following count) — slow for users following 10K accounts.`
          ) +
          diagram(
            'Hybrid (Twitter-style)',
            flow([
              { text: 'New post', class: 'gray' },
              { text: 'Fan-out write', class: 'purple' },
              { text: '&lt;10K followers', class: 'green' },
              { text: 'Fan-out read', class: 'orange' },
              { text: 'Celebrity accounts', class: '' },
            ])
          ) +
          note(
            `<strong>Hybrid:</strong> fan-out on write for normal users; celebrities fetched separately at read time. Precompute for active users only.`
          ),
      },
      {
        title: '③ Sharding & consistent hashing',
        body:
          note(
            `<strong>Sharding strategies:</strong><ul>` +
              `<li><strong>Hash sharding:</strong> <code>shard = hash(user_id) % N</code> — even spread; changing N requires resharding</li>` +
              `<li><strong>Range sharding:</strong> user_id 1–1M on shard A — range queries easy; hot ranges possible</li>` +
              `<li><strong>Directory sharding:</strong> lookup service maps key → shard — flexible; lookup service is bottleneck</li></ul>`
          ) +
          diagram(
            'Consistent hashing ring',
            flow([
              { text: 'Key hash', class: 'gray' },
              { text: 'Clockwise to node', class: 'purple' },
              { text: 'Virtual nodes', class: 'green' },
              { text: 'Even load', class: '' },
            ])
          ) +
          note(
            `<strong>Virtual nodes:</strong> each physical node owns multiple points on the ring — better load balance. Adding a node only moves ~1/N keys. Used in: Cassandra, DynamoDB, Redis Cluster, CDNs.`
          ),
      },
      {
        title: '④ Message queues & event streaming',
        body:
          table(['System', 'Model', 'Ordering', 'Retention'], [
            ['RabbitMQ / SQS', 'Queue — one consumer per message', 'Single consumer: yes; competing: no guarantee', 'Until ack / TTL'],
            ['Kafka', 'Log — multiple consumer groups', 'Per-partition ordering', 'Configurable retention (days)'],
            ['Redis Streams', 'Lightweight log', 'Per stream', 'Memory-bound'],
          ]) +
          archDiagram('Queue decoupling', [
            [{ text: 'API Server (producer)', class: 'gray' }],
            [{ text: 'Message Queue / Kafka', class: 'purple' }],
            [{ text: 'Email Worker', class: 'green' }, { text: 'Push Worker', class: 'green' }, { text: 'Analytics', class: '' }],
          ]) +
          note(
            `<strong>At-least-once delivery</strong> is default — consumers must be idempotent. <strong>Dead letter queue (DLQ)</strong> for poison messages after N retries. <strong>Backpressure:</strong> slow consumers → queue depth grows → alert and scale workers.`
          ),
      },
      {
        title: '⑤ Idempotency',
        body:
          note(
            `<strong>Idempotent operation:</strong> performing it multiple times has the same effect as once. Critical for retries, network duplicates, and at-least-once queues.`
          ) +
          table(['Technique', 'How', 'Example'], [
            ['Idempotency key', 'Client sends UUID; server stores result keyed by it', 'Stripe <code>Idempotency-Key</code> header'],
            ['Natural idempotency', 'Operation is inherently safe to repeat', 'PUT /users/123 with full body'],
            ['DB unique constraint', 'Duplicate insert fails cleanly', 'UNIQUE(order_id, payment_id)'],
            ['State check', 'Only act if status is PENDING', 'Charge only if order.status != PAID'],
          ]) +
          note(
            `<strong>Store idempotency keys</strong> in Redis/DB with TTL (24–72h). Return cached response on duplicate key. Payment APIs: never double-charge — idempotency is non-negotiable.`
          ),
      },
      {
        title: '⑥ Sagas vs two-phase commit',
        body:
          table(['Approach', 'Mechanism', 'Pros', 'Cons'], [
            ['2PC', 'Coordinator locks all participants; commit or abort', 'Strong atomicity', 'Blocking, coordinator SPOF, does not scale'],
            ['Choreography saga', 'Each service emits events; others react', 'Decoupled, no coordinator', 'Hard to trace, cyclic risk'],
            ['Orchestration saga', 'Central saga manager calls steps + compensations', 'Clear flow, easier debug', 'Orchestrator is dependency'],
          ]) +
          diagram(
            'Saga: book flight + hotel',
            flow([
              { text: 'Book flight ✓', class: 'green' },
              { text: 'Book hotel ✗', class: 'orange' },
              { text: 'Compensate: cancel flight', class: 'purple' },
            ])
          ) +
          note(
            `<strong>Compensating transactions</strong> undo prior steps (cancel reservation, refund). Not all steps are compensatable (email sent). Prefer sagas for microservices; 2PC rare outside databases.`
          ),
      },
      {
        title: '⑦ Circuit breaker',
        body:
          note(
            `<strong>States:</strong> <strong>Closed</strong> (normal) → failures exceed threshold → <strong>Open</strong> (fail fast, no calls) → after timeout → <strong>Half-open</strong> (trial request) → success → Closed; failure → Open.`
          ) +
          archDiagram('Circuit breaker in call chain', [
            [{ text: 'Your Service', class: 'gray' }],
            [{ text: 'Circuit Breaker', class: 'purple' }],
            [{ text: 'Payment API (healthy)', class: 'green' }, { text: 'Payment API (down → open)', class: 'orange' }],
          ]) +
          table(['Setting', 'Typical value', 'Purpose'], [
            ['Failure threshold', '5 failures in 10s', 'Trip to open'],
            ['Open duration', '30–60s', 'Let dependency recover'],
            ['Half-open probes', '1–3 requests', 'Test recovery'],
            ['Fallback', 'Cached response / queue for retry', 'Graceful degradation'],
          ]) +
          note(`Libraries: Resilience4j (Java), Polly (.NET), Hystrix (legacy). Pair with timeouts — circuit breaker without timeout still hangs threads.`),
      },
      {
        title: '⑧ Rate limiting (companion pattern)',
        body:
          table(['Algorithm', 'Behavior', 'Use case'], [
            ['Token bucket', 'Burst allowed up to bucket size; steady refill rate', 'API rate limits with burst tolerance'],
            ['Leaky bucket', 'Smooth output rate regardless of input spikes', 'Traffic shaping'],
            ['Fixed window', 'Count requests per window (e.g. per minute)', 'Simple; boundary spike at window edges'],
            ['Sliding window', 'Rolling count over last N seconds', 'Smoother than fixed window'],
          ]) +
          note(
            `<strong>Distributed rate limiting:</strong> Redis INCR + EXPIRE or sliding window in Redis (Lua for atomicity). Return <code>429 Too Many Requests</code> with <code>Retry-After</code> header. Per-user, per-IP, per-API-key tiers.`
          ),
      },
      {
        title: '⑨ Scenario — notification system patterns',
        body:
          layers([
            'Write path: event → Kafka topic (partitioned by user_id)',
            'Fan-out workers: read event, lookup preferences, enqueue per-channel jobs',
            'Idempotent consumers: dedupe by (user_id, event_id, channel)',
            'Circuit breaker on Twilio/SendGrid — fallback to in-app only',
            'Rate limit: max 10 push/hour/user to prevent spam',
            'Inbox storage: sharded by user_id, sorted by timestamp',
          ]) +
          note(
            `<strong>Interview script:</strong> "I'd use a queue to decouple the write path from delivery, idempotency keys to handle retries, circuit breakers on external providers, and shard the inbox by user_id."`
          ),
      },
      {
        title: '⑩ Revision checklist',
        body:
          checklist([
            'Named fan-out on write vs read with celebrity/hybrid mitigation',
            'Explained sharding strategy and consistent hashing for cache/cluster',
            'Used message queue for async decoupling with at-least-once semantics',
            'Designed idempotency for payments or duplicate-prone operations',
            'Contrasted saga vs 2PC for distributed transactions',
            'Described circuit breaker states and fallback behavior',
            'Mentioned rate limiting with algorithm choice',
            'Mapped patterns to a concrete scenario (feed, payments, notifications)',
          ]) +
          tags(['fan-out', 'sharding', 'queues', 'idempotency', 'saga', 'circuit-breaker']),
      },
    ],
    related: [
      { href: '/cheat-sheets/system-design/fundamentals', label: 'SD Fundamentals' },
      { href: '/cheat-sheets/system-design/notification-system', label: 'Notification System' },
      { href: '/cheat-sheets/system-design/rate-limiter', label: 'Rate Limiter' },
    ],
  },

  // ─── 3. AI Master Roadmap ────────────────────────────────────────────
  {
    path: 'ai/roadmap',
    badge: 'AI',
    badgeClass: 'ai',
    title: 'AI Master Roadmap',
    subtitle: 'From math foundations to LLMs and MLOps — phased learning path with projects and interview milestones.',
    breadcrumb:
      '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · <a href="/cheat-sheets/ai/">AI</a> · Master Roadmap',
    tip: 'Pick ONE phase to go deep this month. Ship a project per phase — hiring managers care about demos, not certificates.',
    prompt: `You are an AI/ML career coach conducting a diagnostic session. Ask 5 questions spanning linear algebra (what is an eigenvector used for?), classical ML (bias-variance tradeoff), deep learning (why batch norm?), and LLMs (what is attention?). Based on answers, assess whether the candidate is Beginner, Intermediate, or Advanced.

Then build a personalized 12-week plan from the roadmap phases: Math → Classical ML → Deep Learning → LLMs → MLOps. Assign one concrete project per phase (e.g. MNIST classifier, sentiment RAG app, fine-tuned chatbot). Include weekly hours (10–15 realistic), resources (fast.ai, Andrew Ng, papers), and interview prep milestones.

Push back if they want to skip to LLM agents without understanding embeddings or evaluation. Ask what role they target: ML engineer, data scientist, or AI application developer — adjust depth accordingly.

Review their GitHub and project portfolio if they mention one — ask what they would rebuild with hindsight. Recommend two cheat sheets from this site to study next based on gaps. End with: "What is the single biggest gap in your current profile?" and a concrete action for this week.`,
    papers: [
      {
        title: '① Roadmap overview — five phases',
        body:
          diagram(
            'AI learning path',
            flow([
              { text: 'Math & Stats', class: 'gray' },
              { text: 'Classical ML', class: '' },
              { text: 'Deep Learning', class: 'purple' },
              { text: 'LLMs & Apps', class: 'green' },
              { text: 'MLOps', class: 'orange' },
            ])
          ) +
          table(['Phase', 'Duration', 'Outcome', 'Project'], [
            ['0 — Foundations', '4–6 weeks', 'Linear algebra, probability, Python', 'NumPy matrix ops + EDA notebook'],
            ['1 — Classical ML', '6–8 weeks', 'Supervised/unsupervised, sklearn', 'Kaggle tabular competition top 50%'],
            ['2 — Deep Learning', '8–10 weeks', 'CNNs, RNNs, training loops', 'Image classifier or seq2seq model'],
            ['3 — LLMs & GenAI', '6–8 weeks', 'Transformers, RAG, agents, fine-tuning', 'RAG chatbot over your docs'],
            ['4 — MLOps', '4–6 weeks', 'Deploy, monitor, CI/CD for models', 'API endpoint + drift monitoring'],
          ]),
      },
      {
        title: '② Phase 0 — Math & programming foundations',
        body:
          checklist([
            'Linear algebra: vectors, matrices, dot product, eigenvalues (PCA intuition)',
            'Calculus: derivatives, chain rule (backprop intuition)',
            'Probability: Bayes, distributions, expectation, variance',
            'Statistics: hypothesis testing, confidence intervals',
            'Python: NumPy, pandas, matplotlib; comfortable with Jupyter',
            'Git basics: commit, branch, push — all projects in GitHub',
          ]) +
          note(
            `<strong>Resources:</strong> 3Blue1Brown (Essence of LA), StatQuest (YouTube), Khan Academy, "Mathematics for ML" (Deisenroth). Don't get stuck — 80% intuition, move on when you can follow ML lectures.`
          ),
      },
      {
        title: '③ Phase 1 — Classical machine learning',
        body:
          table(['Topic', 'Key concepts', 'Interview must-know'], [
            ['Supervised', 'Regression, classification, train/val/test split', 'Bias-variance, cross-validation'],
            ['Algorithms', 'Linear/logistic regression, trees, RF, XGBoost, SVM', 'When to use which; interpretability'],
            ['Unsupervised', 'K-means, PCA, anomaly detection', 'Choosing k; PCA for dimensionality reduction'],
            ['Evaluation', 'Accuracy, precision, recall, F1, ROC-AUC', 'Imbalanced classes → do not trust accuracy'],
            ['Feature eng', 'Scaling, encoding, missing values, leakage', 'Target leakage is a common interview trap'],
          ]) +
          note(`<strong>Project:</strong> End-to-end sklearn pipeline on a real dataset — document EDA, feature choices, and why you picked the final model. Deploy nothing yet; focus on methodology.`),
      },
      {
        title: '④ Phase 2 — Deep learning',
        body:
          layers([
            'Neural network basics — layers, activations, loss, optimizer',
            'Backpropagation intuition — chain rule through the graph',
            'CNNs — conv, pool, ResNet; image classification',
            'RNNs/LSTMs — sequences, vanishing gradient; time-series/NLP pre-transformer',
            'Training — batch size, learning rate schedule, regularization (dropout, weight decay)',
            'Frameworks — PyTorch preferred for research/jobs; TensorFlow for some enterprise',
          ]) +
          note(
            `<strong>Resources:</strong> fast.ai Practical Deep Learning, Andrew Ng Deep Learning Specialization, PyTorch tutorials. <strong>Project:</strong> Train a CNN on CIFAR-10 or fine-tune a small model — log metrics in TensorBoard or W&B.`
          ),
      },
      {
        title: '⑤ Phase 3 — LLMs & generative AI',
        body:
          table(['Topic', 'What to learn', 'Hands-on'], [
            ['Transformers', 'Self-attention, positional encoding, encoder-decoder', 'Read "Attention Is All You Need" summary'],
            ['Pre-trained models', 'GPT, BERT, T5 — pretrain vs fine-tune vs prompt', 'Hugging Face model hub experiments'],
            ['Prompt engineering', 'System prompts, few-shot, chain-of-thought', 'Build eval set of 20 prompts'],
            ['RAG', 'Embeddings, chunking, vector DB, retrieval + generation', 'Chatbot over PDF/wiki'],
            ['Fine-tuning', 'LoRA, RLHF concept, when to fine-tune vs RAG', 'Fine-tune small model on domain data'],
            ['Agents', 'Tool use, ReAct loop, guardrails', 'Agent with 2 tools (search + calculator)'],
          ]) +
          note(`Use cheat sheets on this site: RAG, First LLM Integration, Agents Intro, Prompt Engineering.`),
      },
      {
        title: '⑥ Phase 4 — MLOps & production',
        body:
          checklist([
            'Model serving: FastAPI + ONNX/TorchServe/vLLM for LLMs',
            'Containerization: Docker basics; deploy to AWS/GCP/Fly.io',
            'Monitoring: latency, error rate, data drift, model drift',
            'CI/CD: retrain pipeline triggered on new data',
            'Cost: token usage, GPU hours, cache embeddings',
            'Security: API keys in secrets manager, input validation, PII in logs',
          ]) +
          archDiagram('Minimal ML production stack', [
            [{ text: 'Client / App', class: 'gray' }],
            [{ text: 'API Gateway + Auth', class: '' }],
            [{ text: 'Model Server (GPU/CPU)', class: 'purple' }],
            [{ text: 'Vector DB + Feature Store', class: 'green' }],
            [{ text: 'Logging / Metrics (Prometheus, Grafana)', class: 'orange' }],
          ]),
      },
      {
        title: '⑦ Role-specific tracks',
        body:
          table(['Target role', 'Emphasize', 'De-emphasize'], [
            ['ML Engineer', 'Training pipelines, distributed training, model optimization', 'Heavy frontend'],
            ['Data Scientist', 'EDA, experimentation, causal inference, storytelling', 'CUDA kernel tuning'],
            ['AI App Developer', 'LLM APIs, RAG, agents, product UX', 'Proof of convergence theorems'],
            ['Research Scientist', 'Paper reading, novel architectures, benchmarks', 'CRUD app building'],
          ]) +
          note(`Most industry roles in 2025–2026 are <strong>AI application + ML engineering hybrid</strong> — strong Python, LLM integration, and evaluation beat pure theory.`),
      },
      {
        title: '⑧ 12-week sprint plan (template)',
        body:
          table(['Weeks', 'Focus', 'Deliverable'], [
            ['1–2', 'Math refresh + Python', 'GitHub repo with NumPy exercises'],
            ['3–4', 'Classical ML + Kaggle', 'One competition submission + write-up'],
            ['5–6', 'PyTorch + CNN project', 'Image model with training curves logged'],
            ['7–8', 'Transformers + Hugging Face', 'Fine-tune or zero-shot eval notebook'],
            ['9–10', 'RAG application', 'Deployed chatbot (even on free tier)'],
            ['11', 'Mock ML interviews', '5 timed Q&A sessions recorded'],
            ['12', 'Portfolio polish', 'README, demo video, LinkedIn post'],
          ]) +
          note(`Adjust pace: 10–15 hrs/week realistic alongside a job. Double timeline if &lt;8 hrs/week.`),
      },
      {
        title: '⑨ Interview prep milestones',
        body:
          checklist([
            'Explain bias-variance without notes in under 2 minutes',
            'Whiteboard: train/val/test split and k-fold CV',
            'Describe attention mechanism at high level',
            'Compare RAG vs fine-tuning with a concrete example',
            'Walk through one project end-to-end (problem → data → model → metric → result)',
            'Answer "what would you do with imbalanced classes?" with 3 techniques',
            'Discuss one failure: wrong metric, data leakage, or overfitting you fixed',
          ]) +
          tags(['roadmap', 'ML', 'deep-learning', 'LLM', 'MLOps', 'career']),
      },
      {
        title: '⑩ Revision checklist',
        body:
          checklist([
            'Identified current phase and next project',
            'Balanced theory with shipped projects on GitHub',
            'Know which role track to optimize for',
            'Have 12-week plan with weekly deliverables',
            'Prepared 2-minute project stories for interviews',
            'Connected roadmap to site cheat sheets (RAG, agents, etc.)',
          ]),
      },
    ],
    related: [
      { href: '/cheat-sheets/ai/', label: 'All AI cheat sheets' },
      { href: '/cheat-sheets/ai/ml-interview', label: 'ML/DL Interview Guide' },
      { href: '/cheat-sheets/ai/rag', label: 'RAG' },
    ],
  },

  // ─── 4. ML/DL Interview Guide ────────────────────────────────────────
  {
    path: 'ai/ml-interview',
    badge: 'AI',
    badgeClass: 'ai',
    title: 'ML / Deep Learning Interview Guide',
    subtitle: 'CNN, RNN, Transformers, metrics, training pitfalls, and the Q&A senior ML interviews expect.',
    breadcrumb:
      '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · <a href="/cheat-sheets/ai/">AI</a> · ML/DL Interview',
    tip: 'For architecture questions: input shape → layers → output shape → loss → why this beats baseline.',
    prompt: `You are a senior ML engineer running a 60-minute ML/DL technical interview. Cover four blocks: (1) fundamentals — bias-variance, regularization, gradient descent variants; (2) architectures — explain CNN vs RNN vs Transformer with one use case each; (3) metrics — when accuracy fails, precision/recall tradeoff, ROC-AUC intuition; (4) training — batch norm, dropout, vanishing gradients, learning rate scheduling.

Ask one whiteboard-style question: "Design metrics for a fraud detection model where false negatives cost 10× false positives." Then one system question: "How would you serve a transformer model with 100ms p99 latency at 1K QPS?"

Include one coding-intuition question: "Write pseudocode for attention scores." Push for depth on follow-ups — do not accept buzzwords without mechanism. If they mention transformers only, ask how attention complexity scales with sequence length and one mitigation.

Provide rubric feedback: clarity, correctness, production awareness, and communication. Compare their fraud-detection metric design against a cost-weighted approach. End with top 3 gaps, prioritized reading, and one architecture whiteboard they should practice.`,
    papers: [
      {
        title: '① ML fundamentals — must know cold',
        body:
          table(['Concept', 'One-liner', 'Follow-up they ask'], [
            ['Bias-variance', 'Underfit = high bias; overfit = high variance', 'How detect on learning curves?'],
            ['Regularization', 'Penalize complexity — L1 sparsity, L2 weight decay, dropout', 'L1 vs L2 when?'],
            ['Gradient descent', 'SGD, mini-batch, Adam — update weights via loss gradient', 'Why Adam over SGD?'],
            ['Cross-validation', 'k-fold estimates generalization', 'Leakage if preprocess on full data?'],
            ['Imbalanced data', 'SMOTE, class weights, threshold tuning', 'Why accuracy misleading?'],
          ]) +
          note(
            `<strong>Learning curves:</strong> train loss ↓ but val loss ↑ = overfitting → more data, regularization, simpler model. Both high = underfitting → bigger model, more features, train longer.`
          ),
      },
      {
        title: '② CNN — convolutional neural networks',
        body:
          layers([
            'Conv layer — learn local filters (edges, textures, parts)',
            'Pooling — reduce spatial size (max/avg pool)',
            'Stack depth — VGG, ResNet skip connections solve vanishing gradient',
            'Output — flatten + FC layers or global average pool',
            'Use cases — image classification, detection, segmentation',
          ]) +
          table(['Layer', 'Typical effect', 'Param intuition'], [
            ['Conv 3×3', 'Local feature detection', 'C_out × C_in × 3 × 3 weights'],
            ['MaxPool 2×2', 'Translation invariance, downsampling', 'No learnable params'],
            ['BatchNorm', 'Stabilize training, allow higher LR', 'Per-channel scale/shift'],
            ['ResNet block', 'Skip connection — gradient flows directly', 'Enables very deep nets'],
          ]) +
          note(`Interview: "Why CNN for images?" — local connectivity, parameter sharing, translation equivariance.`),
      },
      {
        title: '③ RNN / LSTM — sequential models',
        body:
          note(
            `<strong>RNN:</strong> hidden state carries information across time steps. <strong>Problem:</strong> vanishing/exploding gradients on long sequences.<br><br>` +
              `<strong>LSTM/GRU:</strong> gating mechanisms (forget, input, output) preserve long-range dependencies. Still sequential — hard to parallelize on GPU.`
          ) +
          diagram(
            'RNN unrolled',
            flow([
              { text: 'x₁', class: 'gray' },
              { text: 'h₁', class: 'purple' },
              { text: 'x₂', class: 'gray' },
              { text: 'h₂', class: 'purple' },
              { text: 'y', class: 'green' },
            ])
          ) +
          table(['Architecture', 'Best for', 'Limitation'], [
            ['RNN/LSTM', 'Short sequences, small data, time-series', 'Slow training, long-range still hard'],
            ['Transformer', 'Long context, parallel training, NLP/SOTA', 'Quadratic memory in sequence length'],
            ['1D CNN', 'Fixed-length sequences, audio', 'Limited receptive field without dilated conv'],
          ]),
      },
      {
        title: '④ Transformers & attention',
        body:
          note(
            `<strong>Self-attention:</strong> each token attends to all tokens — computes Query, Key, Value; attention weights = softmax(QKᵀ/√d); output = weighted sum of Values. Parallelizable; captures long-range deps.`
          ) +
          diagram(
            'Transformer block',
            flow([
              { text: 'Multi-head attention', class: 'purple' },
              { text: 'Add & Norm', class: '' },
              { text: 'Feed-forward', class: 'green' },
              { text: 'Add & Norm', class: '' },
            ])
          ) +
          table(['Component', 'Purpose'], [
            ['Positional encoding', 'Inject order — sin/cos or learned'],
            ['Multi-head attention', 'Multiple representation subspaces'],
            ['Layer norm', 'Stabilize activations'],
            ['Encoder-decoder', 'T5, original Transformer — seq2seq'],
            ['Decoder-only', 'GPT — autoregressive generation'],
            ['Encoder-only', 'BERT — classification, embeddings'],
          ]),
      },
      {
        title: '⑤ Evaluation metrics',
        body:
          table(['Metric', 'Formula / meaning', 'Use when'], [
            ['Accuracy', 'Correct / total', 'Balanced classes only'],
            ['Precision', 'TP / (TP+FP)', 'Cost of false positives high (spam filter)'],
            ['Recall', 'TP / (TP+FN)', 'Cost of false negatives high (cancer screening)'],
            ['F1', 'Harmonic mean P & R', 'Balance both'],
            ['ROC-AUC', 'Area under TPR vs FPR curve', 'Threshold-independent ranking'],
            ['RMSE / MAE', 'Regression error', 'MAE robust to outliers'],
          ]) +
          note(
            `<strong>Confusion matrix</strong> is your friend — draw it in interviews. <strong>Calibration:</strong> predicted probabilities match true frequencies — important for threshold tuning.`
          ),
      },
      {
        title: '⑥ Training — optimization & pitfalls',
        body:
          table(['Technique', 'What it does', 'When'], [
            ['Learning rate schedule', 'Warmup, cosine decay, step decay', 'Transformers need warmup'],
            ['Batch normalization', 'Normalize activations per batch', 'CNNs; less common in LLMs (LayerNorm)'],
            ['Dropout', 'Randomly zero neurons — regularization', 'FC layers; 0.1–0.5 typical'],
            ['Early stopping', 'Stop when val loss stops improving', 'Default regularization'],
            ['Data augmentation', 'Flip, crop, noise — synthetic diversity', 'Images, text paraphrase'],
            ['Gradient clipping', 'Cap gradient norm', 'RNNs, unstable training'],
          ]) +
          note(
            `<strong>Debugging:</strong> loss NaN → LR too high, bad initialization, label errors. Val train gap → overfit. Both flat → underfit or bug in pipeline.`
          ),
      },
      {
        title: '⑦ Model serving (system design angle)',
        body:
          archDiagram('Model serving at scale', [
            [{ text: 'Clients', class: 'gray' }],
            [{ text: 'API Gateway + batching', class: '' }],
            [{ text: 'Model servers (GPU pool)', class: 'purple' }],
            [{ text: 'Feature store / embedding cache', class: 'green' }],
          ]) +
          checklist([
            'Batch requests for GPU efficiency (dynamic batching)',
            'Quantization (INT8) and distillation for latency',
            'Cache frequent queries / embeddings',
            'A/B test model versions with shadow traffic',
            'Monitor: latency p99, throughput, prediction drift',
          ]),
      },
      {
        title: '⑧ Interview Q&A — rapid fire',
        body:
          table(['Question', 'Strong answer sketch'], [
            ['Explain backprop', 'Chain rule applied layer-by-layer; compute gradients via computational graph'],
            ['Batch vs layer norm', 'BatchNorm across batch dim; LayerNorm across features — LLMs use LayerNorm'],
            ['Why transformers beat RNNs?', 'Parallel training, long-range attention, scaled pretraining'],
            ['Transfer learning?', 'Pretrain on large dataset, fine-tune head on small target task'],
            ['Overfitting fixes?', 'More data, regularization, dropout, simpler model, early stopping'],
            ['Attention complexity?', 'O(n²) in sequence length — sparse/local attention variants'],
          ]),
      },
      {
        title: '⑨ Whiteboard problem — fraud detection metrics',
        body:
          note(
            `<strong>Scenario:</strong> fraud is 0.1% of transactions. False negative = lost money. False positive = customer friction.<br><br>` +
              `<strong>Answer structure:</strong> Don't use accuracy (99.9% by predicting all legit). Optimize recall at acceptable precision, or cost-sensitive metric: <code>Cost = 10×FN + 1×FP</code>. Use PR curve not ROC when imbalanced. Threshold tune on validation set with business cost matrix.`
          ),
      },
      {
        title: '⑩ Revision checklist',
        body:
          checklist([
            'Explained bias-variance with learning curve interpretation',
            'Compared CNN, RNN, Transformer with use cases',
            'Drew confusion matrix and picked metrics for imbalanced problem',
            'Named 3 overfitting fixes and 3 training debug steps',
            'Described attention mechanism without hand-waving',
            'Outlined model serving architecture for latency SLA',
          ]) +
          tags(['CNN', 'RNN', 'transformer', 'metrics', 'training', 'interview']),
      },
    ],
    related: [
      { href: '/cheat-sheets/ai/roadmap', label: 'AI Master Roadmap' },
      { href: '/cheat-sheets/ai/rag', label: 'RAG' },
      { href: '/cheat-sheets/ai/embeddings-basics', label: 'Embeddings Basics' },
    ],
  },

  // ─── 5. Java Core ──────────────────────────────────────────────────────
  {
    path: 'java/core',
    badge: 'Java',
    badgeClass: 'java',
    title: 'Java Core — Interview Cheat Sheet',
    subtitle: 'OOP, JVM memory model, garbage collection, String internals, equals/hashCode — senior Java interview essentials.',
    breadcrumb:
      '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · <a href="/cheat-sheets/java/">Java</a> · Core',
    tip: 'For equals/hashCode: "Equal objects MUST have equal hash codes; override both together or neither."',
    prompt: `You are a senior Java engineer interviewing for a backend role. Cover OOP pillars with Java-specific examples (abstract class vs interface, default methods). Deep dive JVM: heap vs stack, object layout, when GC runs, generational hypothesis. String questions: immutability, string pool, String vs StringBuilder vs StringBuffer.

Ask equals/hashCode: write the contract and what breaks HashMap if violated. Present a bug: mutable object as HashMap key that changes after insert — what happens?

Cover common pitfalls: == vs equals, autoboxing NPE, final vs immutable. Ask about Java 8+ features briefly (streams, Optional, records). Probe garbage collection: when would you choose G1 vs ZGC, and what is a minor vs major GC pause?

Push until they show depth on memory and correctness, not syntax recitation. Ask one code-review style question about a broken equals implementation missing hashCode. Summarize strengths and gaps with a hire/no-hire leaning. End with: "Design a thread-safe counter — what are three approaches?"`,
    papers: [
      {
        title: '① OOP pillars in Java',
        body:
          table(['Pillar', 'Java mechanism', 'Interview example'], [
            ['Encapsulation', 'private fields + getters/setters', 'Hide internal state; validate in setter'],
            ['Inheritance', 'extends — is-a relationship', 'Dog extends Animal; favor composition over inheritance'],
            ['Polymorphism', 'Method overriding, interfaces', 'List ref = new ArrayList(); runtime dispatch'],
            ['Abstraction', 'abstract class, interface', 'PaymentProcessor interface; Stripe impl'],
          ]) +
          table(['Abstract class vs Interface', 'Abstract class', 'Interface'], [
            ['State', 'Can have fields, constructors', 'Only constants (before Java 8)'],
            ['Methods', 'Abstract + concrete', 'Abstract (impl classes) + default/static (Java 8+)'],
            ['Multiple inheritance', 'Single extends', 'Multiple implements'],
            ['Use when', 'Shared base implementation', 'Capability contract (Comparable, Runnable)'],
          ]),
      },
      {
        title: '② JVM memory model',
        body:
          archDiagram('JVM memory (simplified)', [
            [{ text: 'Stack (per thread)', class: 'purple' }, { text: 'Heap (shared)', class: 'green' }],
            [{ text: 'Local vars, frames', class: '' }, { text: 'Young Gen (Eden, S0, S1)', class: 'orange' }],
            [{ text: 'Method area / Metaspace', class: 'gray' }, { text: 'Old Gen (Tenured)', class: 'green' }],
          ]) +
          note(
            `<strong>Stack:</strong> method frames, local primitives and references — thread-private, fast alloc/dealloc.<br><br>` +
              `<strong>Heap:</strong> all objects and arrays — shared, GC-managed.<br><br>` +
              `<strong>Metaspace:</strong> class metadata (Java 8+ replaced PermGen).`
          ),
      },
      {
        title: '③ Garbage collection basics',
        body:
          table(['Collector', 'Strategy', 'Typical use'], [
            ['Serial', 'Single thread, stop-the-world', 'Small apps, client'],
            ['Parallel (Throughput)', 'Multi-thread young/old GC', 'Batch, throughput priority'],
            ['G1 (default Java 9+)', 'Region-based, predictable pauses', 'General server default'],
            ['ZGC / Shenandoah', 'Low-latency, concurrent', 'Large heaps, strict p99 latency'],
          ]) +
          note(
            `<strong>Generational hypothesis:</strong> most objects die young → Eden collection frequent (minor GC); survivors promote to Old Gen (major GC less frequent, costlier).<br><br>` +
              `<strong>Triggers:</strong> Eden full, Old Gen threshold, System.gc() (hint only), metaspace pressure.`
          ) +
          checklist([
            'Strong references — normal objects; GC when unreachable',
            'Soft — cleared before OOM (caches)',
            'Weak — GC at next cycle (WeakHashMap keys)',
            'Phantom — post-mortem cleanup (reference queues)',
          ]),
      },
      {
        title: '④ String immutability & pool',
        body:
          note(
            `<strong>String is immutable</strong> — internal char array (byte[] since Java 9) cannot change after creation. Thread-safe, cacheable hashCode, safe as HashMap key.<br><br>` +
              `<strong>String pool:</strong> literals (<code>"hello"</code>) interned in pool. <code>new String("hello")</code> creates heap object NOT in pool unless <code>intern()</code> called.`
          ) +
          table(['Type', 'Thread-safe', 'Use'], [
            ['String', 'Yes (immutable)', 'Constants, keys, short concat'],
            ['StringBuilder', 'No', 'Single-thread string building — preferred'],
            ['StringBuffer', 'Yes (synchronized)', 'Legacy; rarely needed'],
          ]) +
          note(
            `<strong>Performance trap:</strong> <code>String s = ""; for(...) s += x;</code> creates O(n²) objects — use StringBuilder.`
          ),
      },
      {
        title: '⑤ equals() and hashCode() contract',
        body:
          checklist([
            'Reflexive: x.equals(x) is true',
            'Symmetric: x.equals(y) ↔ y.equals(x)',
            'Transitive: x.equals(y) and y.equals(z) → x.equals(z)',
            'Consistent: repeated calls same result (unless mutated)',
            'x.equals(null) is false',
            '<strong>Critical:</strong> if x.equals(y) then x.hashCode() == y.hashCode()',
            'Unequal objects MAY have same hash (collision) — OK',
          ]) +
          note(
            `<strong>HashMap lookup:</strong> hashCode → bucket; equals → exact match. Break contract → lost entries, duplicates.<br><br>` +
              `<strong>Never use mutable fields in equals/hashCode</strong> if object used as map key — or make fields final.`
          ),
      },
      {
        title: '⑥ == vs equals & common pitfalls',
        body:
          table(['Comparison', 'Compares', 'Example'], [
            ['== (primitives)', 'Values', 'int a=1, b=1 → true'],
            ['== (objects)', 'Reference identity', 'new String("a") == new String("a") → false'],
            ['equals()', 'Logical equality (override)', 'Objects with same field values'],
            ['Objects.equals(a,b)', 'Null-safe', 'null-safe equals check'],
          ]) +
          note(
            `<strong>Autoboxing NPE:</strong> <code>Integer a = null; a == 1</code> throws NPE on unboxing.<br><br>` +
              `<strong>Integer cache:</strong> -128 to 127 cached — <code>Integer.valueOf(127) == Integer.valueOf(127)</code> true; 128 false.`
          ),
      },
      {
        title: '⑦ Java 8+ essentials',
        body:
          table(['Feature', 'Purpose', 'Interview note'], [
            ['Lambda / streams', 'Functional-style collection ops', 'Lazy; terminal ops trigger; parallelStream cautiously'],
            ['Optional', 'Explicit absence vs null', 'Do not use as field or method param — return type OK'],
            ['Default methods', 'Interface evolution', 'Diamond problem if two defaults — must override'],
            ['Records (Java 16+)', 'Immutable data carriers', 'Auto equals/hashCode/toString'],
            ['Sealed classes', 'Restricted inheritance', 'Exhaustive pattern matching (Java 21+)'],
          ]),
      },
      {
        title: '⑧ Object lifecycle & initialization',
        body:
          diagram(
            'Object creation order',
            flow([
              { text: 'Static init', class: 'gray' },
              { text: 'Instance init blocks', class: '' },
              { text: 'Constructor', class: 'purple' },
              { text: 'Object ready', class: 'green' },
            ])
          ) +
          note(
            `<strong>Shallow vs deep copy:</strong> clone() default is shallow — mutable fields shared. Deep copy requires manual or serialization libraries.`
          ),
      },
      {
        title: '⑨ Interview Q&A',
        body:
          table(['Question', 'Answer sketch'], [
            ['Why String immutable?', 'Security, thread safety, pool interning, stable hashCode for keys'],
            ['finalize()?', 'Deprecated — unreliable; use try-with-resources, Cleaner'],
            ['fail-fast vs fail-safe?', 'Fail-fast (ArrayList iter) throws on concurrent mod; fail-safe (ConcurrentHashMap iter) snapshot'],
            ['Checked vs unchecked exception?', 'Checked must declare/catch (IOException); unchecked extends RuntimeException'],
            ['Composition vs inheritance?', 'Composition — has-a, flexible; inheritance — is-a, tight coupling'],
          ]),
      },
      {
        title: '⑩ Revision checklist',
        body:
          checklist([
            'Explained heap vs stack with GC role',
            'Named default GC (G1) and generational model',
            'String immutability + pool + StringBuilder for concat',
            'Stated equals/hashCode contract and HashMap impact',
            '== vs equals with Integer cache example',
            'Abstract class vs interface with Java 8 defaults',
          ]) +
          tags(['OOP', 'JVM', 'GC', 'String', 'equals', 'hashCode']),
      },
    ],
    related: [
      { href: '/cheat-sheets/java/collections', label: 'Java Collections' },
    ],
  },

  // ─── 6. Java Collections ───────────────────────────────────────────────
  {
    path: 'java/collections',
    badge: 'Java',
    badgeClass: 'java',
    title: 'Java Collections & Concurrency',
    subtitle: 'List, Set, Map implementations, time complexity, ConcurrentHashMap, iterators, and thread-safe patterns.',
    breadcrumb:
      '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · <a href="/cheat-sheets/java/">Java</a> · Collections',
    tip: 'Say complexity aloud: "HashMap get/put O(1) average; ArrayList get O(1), insert middle O(n)."',
    prompt: `You are a senior Java backend engineer running a collections and concurrency interview. Start with: "When ArrayList vs LinkedList?" then Map hierarchy: HashMap vs TreeMap vs LinkedHashMap. Deep dive ConcurrentHashMap — segments/buckets, why not Collections.synchronizedMap for high concurrency.

Ask about fail-fast ConcurrentModificationException — when does it happen and how ConcurrentHashMap iterators differ. Thread pools: core vs max pool size, queue types, rejection policies. Design question: worker pool consuming from BlockingQueue — which queue type and why?

Include synchronized vs ReentrantLock, volatile keyword limits. Challenge: "Two threads increment a shared int — what goes wrong?" Expect lost updates; fix with AtomicInteger or synchronized block.

Follow up with an LRU cache design using LinkedHashMap or HashMap plus doubly linked list — expected O(1) operations. Ask about Iterator remove vs Collection remove during foreach. Score on complexity knowledge, concurrency correctness, and API choice justification. End with one gap, recommended reading, and whether they are ready for senior backend loops.`,
    papers: [
      {
        title: '① Collection hierarchy overview',
        body:
          layers([
            'Iterable → Collection → List, Set, Queue',
            'List — ordered, allows duplicates (ArrayList, LinkedList)',
            'Set — no duplicates (HashSet, LinkedHashSet, TreeSet)',
            'Queue / Deque — FIFO, LIFO (ArrayDeque, PriorityQueue, BlockingQueue)',
            'Map — key-value (separate hierarchy): HashMap, TreeMap, LinkedHashMap, ConcurrentHashMap',
          ]) +
          note(`Prefer interfaces in API signatures: <code>List&lt;T&gt;</code>, <code>Map&lt;K,V&gt;</code> — swap implementations without breaking callers.`),
      },
      {
        title: '② List implementations',
        body:
          table(['Implementation', 'Backing', 'get', 'add/end', 'add/middle', 'Use when'], [
            ['ArrayList', 'Dynamic array', 'O(1)', 'O(1)* amortized', 'O(n)', 'Default list — random access'],
            ['LinkedList', 'Doubly linked nodes', 'O(n)', 'O(1)', 'O(1)* with iterator', 'Deque ops, rare — ArrayDeque often better'],
            ['CopyOnWriteArrayList', 'Copy on write', 'O(1)', 'O(n) copy', 'O(n)', 'Read-heavy, rare writes (listeners)'],
          ]) +
          note(`*LinkedList rarely wins — cache-unfriendly; ArrayDeque for queue/stack.`),
      },
      {
        title: '③ Set implementations',
        body:
          table(['Implementation', 'Order', 'Complexity', 'Notes'], [
            ['HashSet', 'None', 'O(1) avg add/contains', 'Backed by HashMap'],
            ['LinkedHashSet', 'Insertion order', 'O(1) avg', 'Predictable iteration'],
            ['TreeSet', 'Sorted (natural/Comparator)', 'O(log n)', 'Red-black tree; no null'],
            ['EnumSet', 'Enum declaration order', 'O(1)', 'Bit vector — very compact'],
          ]),
      },
      {
        title: '④ Map implementations',
        body:
          table(['Implementation', 'Order', 'Null key/value', 'Thread-safe', 'Use'], [
            ['HashMap', 'None', '1 null key, null values OK', 'No', 'Default map'],
            ['LinkedHashMap', 'Insertion or access order', 'Same as HashMap', 'No', 'LRU cache with removeEldestEntry'],
            ['TreeMap', 'Sorted keys', 'No null key', 'No', 'Range queries, navigableMap'],
            ['ConcurrentHashMap', 'None', 'No nulls', 'Yes', 'Concurrent reads/writes'],
            ['Hashtable', 'None', 'No nulls', 'Yes (legacy)', 'Avoid — use ConcurrentHashMap'],
          ]) +
          note(
            `<strong>HashMap internals (Java 8+):</strong> array of buckets → linked list or tree (if bucket &gt; 8 nodes). Load factor 0.75; resize 2× when threshold exceeded.`
          ),
      },
      {
        title: '⑤ ConcurrentHashMap deep dive',
        body:
          note(
            `<strong>Java 8+ ConcurrentHashMap:</strong> bucket-level locking (synchronized first node) or CAS for empty buckets — finer granularity than pre-8 segment locks. Reads generally lock-free.<br><br>` +
              `<strong>No null keys/values</strong> — ambiguity in concurrent context.<br><br>` +
              `<strong>Atomic operations:</strong> <code>putIfAbsent</code>, <code>compute</code>, <code>merge</code> — atomic read-modify-write.`
          ) +
          table([' vs ', 'Collections.synchronizedMap', 'ConcurrentHashMap'], [
            ['Lock scope', 'Entire map', 'Per-bucket / CAS'],
            ['Read concurrency', 'One at a time', 'Multiple concurrent reads'],
            ['Iteration', 'Must external sync', 'Weakly consistent iterator'],
            ['Nulls', 'Allowed (HashMap)', 'Not allowed'],
          ]),
      },
      {
        title: '⑥ Iterators — fail-fast vs weakly consistent',
        body:
          note(
            `<strong>Fail-fast:</strong> ArrayList, HashMap iterators throw <code>ConcurrentModificationException</code> if collection structurally modified during iteration (except iterator's own remove). Detected via modCount.<br><br>` +
              `<strong>Fix:</strong> use iterator.remove(), copy collection, or concurrent collection.`
          ) +
          note(
            `<strong>Weakly consistent:</strong> ConcurrentHashMap, CopyOnWriteArrayList — iterator reflects state at creation time; may or may not see concurrent updates; never throws CME.`
          ),
      },
      {
        title: '⑦ Concurrency essentials',
        body:
          table(['Mechanism', 'Purpose', 'Pitfall'], [
            ['synchronized', 'Mutual exclusion on object monitor', 'Deadlock if lock order inconsistent'],
            ['ReentrantLock', 'Explicit lock, tryLock, fairness', 'Must unlock in finally'],
            ['volatile', 'Visibility across threads', 'Not atomic for i++ — use AtomicInteger'],
            ['Atomic* classes', 'Lock-free CAS operations', 'ABA problem rare in Java util'],
            ['ExecutorService', 'Thread pool abstraction', 'Unbounded queue → OOM under load'],
          ]) +
          archDiagram('Thread pool pattern', [
            [{ text: 'Producer threads', class: 'gray' }],
            [{ text: 'BlockingQueue', class: 'purple' }],
            [{ text: 'ThreadPoolExecutor', class: 'green' }],
            [{ text: 'Worker tasks', class: '' }],
          ]),
      },
      {
        title: '⑧ BlockingQueue types',
        body:
          table(['Queue', 'Behavior', 'Use'], [
            ['ArrayBlockingQueue', 'Bounded array, one lock', 'Fixed capacity backpressure'],
            ['LinkedBlockingQueue', 'Optional bounded linked nodes', 'Common in Executors — watch unbounded'],
            ['SynchronousQueue', 'Zero capacity — handoff', 'CachedThreadPool direct transfer'],
            ['PriorityBlockingQueue', 'Unbounded priority heap', 'Scheduled tasks by priority'],
            ['DelayQueue', 'Elements available after delay', 'Scheduled execution'],
          ]) +
          note(
            `<strong>Design pattern:</strong> producers <code>put()</code>, worker pool <code>take()</code> — decouples rate; bounded queue prevents memory blowup.`
          ),
      },
      {
        title: '⑨ Interview Q&A',
        body:
          table(['Question', 'Answer sketch'], [
            ['HashMap vs Hashtable?', 'HashMap not sync, allows null key; Hashtable legacy synchronized — use ConcurrentHashMap'],
            ['Comparable vs Comparator?', 'Comparable natural order in class; Comparator external, multiple sort orders'],
            ['How HashSet stores elements?', 'HashMap with dummy PRESENT value — uniqueness via keys'],
            ['LRU cache in Java?', 'LinkedHashMap(accessOrder=true) + removeEldestEntry override'],
            ['CopyOnWriteArrayList when?', 'Many readers, few writers — snapshot iteration, expensive writes'],
          ]),
      },
      {
        title: '⑩ Revision checklist',
        body:
          checklist([
            'Picked List/Set/Map impl with complexity justification',
            'Explained HashMap bucket → list/tree structure',
            'Contrasted ConcurrentHashMap vs synchronizedMap',
            'Described fail-fast CME cause and fixes',
            'Designed worker pool with BlockingQueue type choice',
            'Named atomic classes vs volatile for counters',
          ]) +
          tags(['ArrayList', 'HashMap', 'ConcurrentHashMap', 'BlockingQueue', 'concurrency']),
      },
    ],
    related: [
      { href: '/cheat-sheets/java/core', label: 'Java Core' },
    ],
  },

  // ─── 7. DSA Patterns ───────────────────────────────────────────────────
  {
    path: 'dsa/patterns',
    badge: 'DSA',
    badgeClass: 'dsa',
    title: 'DSA Patterns — Interview Cheat Sheet',
    subtitle: '14 essential patterns — recognize the signal, apply the template, solve in 20 minutes.',
    breadcrumb:
      '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · <a href="/cheat-sheets/dsa/">DSA</a> · Patterns',
    tip: 'Say the pattern aloud: "Sorted array + pair sum → two pointers from both ends."',
    prompt: `You are a FAANG-style DSA interviewer using a teach-then-test approach. Briefly explain that most interview problems map to ~14 patterns. Give three problems one at a time — e.g. "3Sum", "Longest substring without repeating chars", "Course schedule" — and ask the candidate to name the pattern before outlining approach and complexity.

For each answer, require: pattern name, why it fits (signal words), algorithm steps, time/space complexity, and one edge case. If they jump to code without pattern, stop them: "Which pattern and why?"

After three problems, assign homework: one problem per pattern category they missed. Score on pattern recognition speed, correct complexity analysis, and communication. Interrupt once to ask for optimization or O(1) space variant.

If they brute-force first, acknowledge it then require the pattern-based improvement. Mention that top candidates name the pattern within 60 seconds of reading the problem. End with prioritized study order based on weak patterns and a timed practice plan for the next two weeks.`,
    papers: [
      {
        title: '① Master pattern table — 14 patterns',
        body:
          table(['#', 'Pattern', 'Signal', 'Template idea'], [
            ['1', 'Two pointers', 'Sorted array, pairs, palindrome', 'Left/right converge based on condition'],
            ['2', 'Sliding window', 'Subarray/substring with constraint', 'Expand R, shrink L while invalid'],
            ['3', 'Binary search', 'Monotonic answer space', 'Mid, discard half where property fails'],
            ['4', 'Fast & slow pointers', 'Linked list cycle, middle', 'Tortoise/hare meet or fast reaches end'],
            ['5', 'Merge intervals', 'Overlapping ranges', 'Sort by start, merge if overlap'],
            ['6', 'Cyclic sort', 'Array 1..n, missing/duplicate', 'Place num at index num-1'],
            ['7', 'In-place reversal', 'Reverse list/subarray', 'Prev/curr/next pointer swap'],
            ['8', 'Tree BFS', 'Level order, shortest path tree', 'Queue level-by-level'],
            ['9', 'Tree DFS', 'Paths, sums, validate BST', 'Recursion with state passed down/up'],
            ['10', 'Two heaps', 'Stream median, balance', 'Max-heap lower half + min-heap upper'],
            ['11', 'Subsets / backtracking', 'Combinations, permutations', 'Include/exclude each element'],
            ['12', 'Modified BFS', 'Grid shortest path', 'Queue + visited matrix + 4/8 dirs'],
            ['13', 'Topological sort', 'Dependencies, prerequisites', 'Kahn indegree zero or DFS post-order'],
            ['14', 'Dynamic programming', 'Optimal substructure + overlap', 'Define state, recurrence, base, order'],
          ]),
      },
      {
        title: '② Two pointers & sliding window',
        body:
          diagram(
            'Sliding window [L ... R]',
            flow([
              { text: 'L', class: 'gray' },
              { text: 'window', class: 'purple' },
              { text: 'R', class: 'gray' },
            ])
          ) +
          note(
            `<strong>Two pointers:</strong> 3Sum — sort, fix i, two pointers on rest for sum zero. O(n²).<br><br>` +
              `<strong>Sliding window:</strong> expand R until constraint violated → shrink L until valid → track best. Longest substring without repeat — HashMap of last index. O(n).`
          ) +
          table(['Problem type', 'Pattern', 'Complexity'], [
            ['Pair sum sorted', 'Two pointers', 'O(n)'],
            ['Container most water', 'Two pointers', 'O(n)'],
            ['Min size subarray sum ≥ K', 'Sliding window', 'O(n)'],
            ['Max in each window of size K', 'Deque monotonic queue', 'O(n)'],
          ]),
      },
      {
        title: '③ Binary search & monotonic space',
        body:
          note(
            `<strong>Not just sorted arrays:</strong> binary search on <em>answer space</em> — e.g. "minimum capacity to ship in D days" where feasible(cap) is monotonic false→true.`
          ) +
          checklist([
            'Identify monotonic predicate can(x) or cannot(x)',
            'Lo = min possible, Hi = max possible answer',
            'While lo < hi: mid = lo + (hi-lo)/2; shrink range',
            'Watch off-by-one: lower vs upper bound variants',
          ]) +
          table(['Classic', 'Search space'], [
            ['Search rotated sorted array', 'Index in array'],
            ['Koko eating bananas', 'Eating speed k'],
            ['Median of two sorted arrays', 'Partition position'],
          ]),
      },
      {
        title: '④ Linked list & interval patterns',
        body:
          note(
            `<strong>Fast/slow:</strong> cycle detection — if slow meets fast, cycle exists. Find cycle start: reset slow to head, advance both 1 step.<br><br>` +
              `<strong>Merge intervals:</strong> sort by start; if curr.start ≤ prev.end merge else append new.`
          ) +
          diagram(
            'In-place list reversal',
            flow([
              { text: 'prev=null', class: 'gray' },
              { text: 'curr=head', class: 'purple' },
              { text: 'next=curr.next', class: '' },
              { text: 'curr.next=prev', class: 'green' },
            ])
          ),
      },
      {
        title: '⑤ Tree patterns — BFS vs DFS',
        body:
          table(['Goal', 'Pattern', 'Structure'], [
            ['Level order', 'BFS queue', 'Process size at each level'],
            ['Max depth', 'DFS', '1 + max(left, right)'],
            ['Validate BST', 'DFS', 'Pass min/max bounds down'],
            ['Lowest common ancestor', 'DFS', 'Return node if match or both subtrees found'],
            ['Serialize tree', 'BFS or DFS preorder', 'Null markers for reconstruction'],
          ]) +
          note(`BFS = shortest path in <strong>unweighted</strong> tree/graph. DFS = path enumeration, backtracking on trees.`),
      },
      {
        title: '⑥ Graph — BFS, topo sort, union-find',
        body:
          table(['Pattern', 'Algorithm', 'Problems'], [
            ['Modified BFS', 'Queue + visited', 'Rotting oranges, word ladder, grid islands'],
            ['Topological sort', 'Kahn BFS or DFS post-order', 'Course schedule, alien dictionary'],
            ['Union-Find', 'Parent array + rank', 'Number of provinces, redundant connection'],
            ['Dijkstra', 'Min-heap by distance', 'Weighted shortest path (non-negative)'],
          ]) +
          note(
            `<strong>Course schedule:</strong> build adjacency list + indegree; queue nodes with indegree 0; if processed count &lt; n → cycle.`
          ),
      },
      {
        title: '⑦ Heaps & top-K',
        body:
          note(
            `<strong>Top K largest:</strong> min-heap of size K — O(n log K). <strong>Top K smallest:</strong> max-heap of size K.<br><br>` +
              `<strong>Two heaps:</strong> max-heap stores lower half, min-heap upper half — median in O(log n) insert.`
          ) +
          table(['Problem', 'Heap type', 'Size'], [
            ['Kth largest element', 'Min-heap', 'K'],
            ['Merge K sorted lists', 'Min-heap of heads', 'K'],
            ['Find median stream', 'Two heaps', 'Balanced sizes'],
          ]),
      },
      {
        title: '⑧ Backtracking & subsets',
        body:
          note(
            `<strong>Template:</strong> choose → explore → unchoose. Subsets: at each index include or skip. Permutations: swap or used[] array.`
          ) +
          checklist([
            'Define base case — index == n or path.len == k',
            'Prune early if invalid partial state',
            'Copy path when adding to result (new ArrayList<>(path))',
            'Watch duplicate subsets — sort + skip same value at same depth',
          ]),
      },
      {
        title: '⑨ Dynamic programming framework',
        body:
          layers([
            '1. Define state dp[i] or dp[i][j] — what subproblem?',
            '2. Recurrence — how state relates to smaller states',
            '3. Base cases — dp[0], empty string, etc.',
            '4. Order of computation — iterate so dependencies ready',
            '5. Space optimize — rolling array if only dp[i-1] needed',
          ]) +
          table(['Type', 'Examples', 'State'], [
            ['1D linear', 'Climbing stairs, house robber', 'dp[i] best at i'],
            ['2D grid', 'Unique paths, min path sum', 'dp[r][c]'],
            ['String DP', 'LCS, edit distance', 'dp[i][j] on prefixes'],
            ['Knapsack', '0/1 knapsack, coin change', 'dp[i][w] capacity'],
          ]),
      },
      {
        title: '⑩ Pattern selection cheat sheet',
        body:
          table(['You see…', 'Reach for…'], [
            ['Sorted + pair/triplet', 'Two pointers'],
            ['Contiguous + constraint', 'Sliding window'],
            ['Min/max feasible value', 'Binary search on answer'],
            ['Linked list cycle/middle', 'Fast/slow pointers'],
            ['Overlapping intervals', 'Merge intervals'],
            ['1..n missing dup', 'Cyclic sort'],
            ['Dependencies', 'Topological sort'],
            ['Shortest path grid', 'BFS'],
            ['All combinations', 'Backtracking'],
            ['Optimize over choices', 'DP'],
          ]) +
          tags(['two-pointers', 'sliding-window', 'BFS', 'DFS', 'DP', 'heap']),
      },
    ],
    related: [
      { href: '/cheat-sheets/dsa/top-problems', label: 'Top Interview Problems' },
    ],
  },

  // ─── 8. DSA Top Problems ───────────────────────────────────────────────
  {
    path: 'dsa/top-problems',
    badge: 'DSA',
    badgeClass: 'dsa',
    title: 'Top DSA Interview Problems',
    subtitle: 'High-frequency problems with pattern tags, approach hints, and complexity — your prioritized study list.',
    breadcrumb:
      '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · <a href="/cheat-sheets/dsa/">DSA</a> · Top Problems',
    tip: 'For each problem: pattern → brute force → optimized → complexity → edge cases (empty, single, duplicates).',
    prompt: `You are running a DSA mock interview focused on high-frequency problems. Pick 4 problems across categories: one array, one tree, one graph, one DP. For each, the candidate must explain approach, time/space complexity, and edge cases before pseudocode.

Suggested rotation: Two Sum → LRU Cache → Number of Islands → Coin Change. Interrupt once: "Can you do it in O(1) space?" or "What if input does not fit in memory?"

After each problem, score: pattern recognition, correctness, complexity, communication. If they memorize code without understanding, probe with a variant (e.g. 3Sum instead of Two Sum).

Ask them to verbalize edge cases before coding: empty input, duplicates, overflow, cycles in graphs. Require Big-O for both time and auxiliary space on every problem. End with a prioritized 2-week study list from this sheet based on misses. Recommend solving 2 problems per day in 25-minute timed sessions with pattern labels in a spreadsheet.`,
    papers: [
      {
        title: '① Arrays & hashing — top problems',
        body:
          table(['Problem', 'Pattern', 'Approach hint', 'Complexity'], [
            ['Two Sum', 'Hash map', 'Store complement as you scan', 'O(n) time O(n) space'],
            ['3Sum', 'Sort + two pointers', 'Fix i, two-pointer rest for zero sum', 'O(n²)'],
            ['Container With Most Water', 'Two pointers', 'Move shorter line inward', 'O(n)'],
            ['Longest Substring Without Repeating', 'Sliding window', 'Map char → last index; shrink on dup', 'O(n)'],
            ['Product of Array Except Self', 'Prefix/suffix', 'Output[i] = left product × right product', 'O(n) O(1)* extra'],
            ['Merge Intervals', 'Sort + merge', 'Sort by start; merge overlaps', 'O(n log n)'],
            ['Trapping Rain Water', 'Two pointers / stack', 'Max left/right height at each index', 'O(n)'],
          ]),
      },
      {
        title: '② Linked lists',
        body:
          table(['Problem', 'Pattern', 'Approach hint', 'Complexity'], [
            ['Reverse Linked List', 'In-place reversal', 'prev/curr/next iteration', 'O(n) O(1)'],
            ['Merge Two Sorted Lists', 'Dummy head', 'Compare heads, attach smaller', 'O(n+m)'],
            ['Linked List Cycle', 'Fast/slow', 'Floyd detection', 'O(n) O(1)'],
            ['Reorder List', 'Multi-step', 'Find middle, reverse 2nd half, merge', 'O(n)'],
            ['LRU Cache', 'HashMap + DLL', 'Get/put O(1); evict tail on capacity', 'O(1) per op'],
          ]) +
          note(`LRU Cache is a <strong>design + DSA</strong> favorite — practice implementing from scratch.`),
      },
      {
        title: '③ Trees & graphs',
        body:
          table(['Problem', 'Pattern', 'Approach hint', 'Complexity'], [
            ['Invert Binary Tree', 'DFS/BFS', 'Swap children recursively', 'O(n)'],
            ['Validate BST', 'DFS bounds', 'Pass (min, max) down', 'O(n)'],
            ['Lowest Common Ancestor', 'DFS', 'Return node if p/q found in subtrees', 'O(n)'],
            ['Binary Tree Level Order', 'BFS', 'Queue per level', 'O(n)'],
            ['Serialize/Deserialize BT', 'BFS/DFS', 'Include null markers', 'O(n)'],
            ['Number of Islands', 'DFS/BFS grid', 'Mark visited; flood fill', 'O(m×n)'],
            ['Course Schedule', 'Topo sort', 'Kahn or cycle detect DFS', 'O(V+E)'],
            ['Word Ladder', 'BFS', 'Bidirectional BFS optional', 'O(N×L²)'],
          ]),
      },
      {
        title: '④ Dynamic programming',
        body:
          table(['Problem', 'Pattern', 'State / recurrence', 'Complexity'], [
            ['Climbing Stairs', '1D DP', 'dp[i]=dp[i-1]+dp[i-2]', 'O(n) O(1)'],
            ['House Robber', '1D DP', 'dp[i]=max(dp[i-1], nums[i]+dp[i-2])', 'O(n)'],
            ['Coin Change', 'Unbounded knapsack', 'dp[a]=min coins for amount a', 'O(amount×coins)'],
            ['Longest Increasing Subsequence', 'DP or patience', 'O(n²) DP or O(n log n) binary search on tails'],
            ['Word Break', 'String DP', 'dp[i]=true if prefix breakable', 'O(n²×dict)'],
            ['Edit Distance', '2D string DP', 'Insert/delete/replace min ops', 'O(m×n)'],
            ['Unique Paths', 'Grid DP', 'dp[r][c]=dp[r-1][c]+dp[r][c-1]', 'O(m×n)'],
          ]),
      },
      {
        title: '⑤ Heaps & design',
        body:
          table(['Problem', 'Pattern', 'Key idea'], [
            ['Kth Largest Element', 'Min-heap size K', 'Or quickselect O(n) avg'],
            ['Merge K Sorted Lists', 'Min-heap of heads', 'Pop min, push next from that list'],
            ['Find Median from Data Stream', 'Two heaps', 'Balance sizes after each add'],
            ['Top K Frequent Elements', 'Heap or bucket sort', 'Bucket by frequency O(n)'],
            ['Task Scheduler', 'Greedy + math', 'Cooldown slots or heap simulation'],
          ]),
      },
      {
        title: '⑥ Binary search classics',
        body:
          table(['Problem', 'Search space', 'Predicate'], [
            ['Search in Rotated Sorted Array', 'Index', 'Which half is sorted?'],
            ['Find Minimum in Rotated Sorted Array', 'Index', 'Compare mid with right'],
            ['Koko Eating Bananas', 'Speed k', 'Can finish in H hours?'],
            ['Median of Two Sorted Arrays', 'Partition i', 'Left parts ≤ right parts'],
          ]),
      },
      {
        title: '⑦ How to practice each problem',
        body:
          checklist([
            'Read problem — restate in own words',
            'Name pattern before coding',
            'Brute force first if stuck — then optimize',
            'State time and space complexity aloud',
            'List edge cases: empty, one element, duplicates, negatives',
            'Write clean pseudocode or code in 20–25 min timed',
            'Re-solve from memory next day without hints',
          ]) +
          note(`Quality &gt; quantity: 50 well-understood problems beat 200 shallow solves.`),
      },
      {
        title: '⑧ 2-week prioritized study plan',
        body:
          table(['Week', 'Focus', 'Problems (daily 2)'], [
            ['Week 1', 'Arrays, hash, two pointers', 'Two Sum, 3Sum, Container, Longest Substring, Merge Intervals'],
            ['Week 1', 'Trees BFS/DFS', 'Invert, Validate BST, LCA, Level Order'],
            ['Week 2', 'Graphs + topo', 'Islands, Course Schedule, Word Ladder'],
            ['Week 2', 'DP + heap', 'Coin Change, LIS, LRU Cache, Kth Largest'],
          ]),
      },
      {
        title: '⑨ Complexity quick reference',
        body:
          table(['Structure', 'Access', 'Search', 'Insert', 'Delete'], [
            ['Array', 'O(1)', 'O(n)', 'O(n)', 'O(n)'],
            ['Hash map', '—', 'O(1)*', 'O(1)*', 'O(1)*'],
            ['Balanced BST', 'O(log n)', 'O(log n)', 'O(log n)', 'O(log n)'],
            ['Heap', 'min/max O(1)', '—', 'O(log n)', 'O(log n)'],
          ]),
      },
      {
        title: '⑩ Revision checklist',
        body:
          checklist([
            'Can solve Two Sum, LRU, Islands, Coin Change from memory',
            'State pattern and complexity without hesitation',
            'Handled follow-ups: 3Sum, follow-up space optimization',
            'Practiced timed 25-min sessions',
            'Reviewed wrong answers in error log notebook',
          ]) +
          tags(['arrays', 'trees', 'graphs', 'DP', 'heap', 'interview']),
      },
    ],
    related: [
      { href: '/cheat-sheets/dsa/patterns', label: 'DSA Patterns' },
    ],
  },

  // ─── 9. Apache Kafka ───────────────────────────────────────────────────
  {
    path: 'data-engineering/kafka',
    badge: 'Data Engineering',
    badgeClass: 'data-engineering',
    title: 'Apache Kafka — Interview Cheat Sheet',
    subtitle: 'Producers, consumers, partitions, consumer groups, replication, and exactly-once semantics.',
    breadcrumb:
      '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · <a href="/cheat-sheets/data-engineering/">Data Engineering</a> · Kafka',
    tip: 'Draw: Producer → Topic (partitions) → Consumer Group. Mention offset, replication factor, and why partitions enable parallelism.',
    prompt: `You are a senior data platform engineer interviewing on Apache Kafka. Start with: "Explain Kafka in 60 seconds to a backend dev." Expect log-based messaging, topics, partitions, consumer groups.

Deep dive: producer acks (0, 1, all), partition key routing, consumer group rebalancing, offset commit strategies (auto vs manual). Scenario: design an order events pipeline — order-created, payment-captured, shipment-dispatched topics. How many partitions? What keys? How handle duplicate events?

Challenge failure modes: broker down, consumer lag spike, rebalance storm during deploy, poison message in a DLQ. Ask about exactly-once semantics — idempotent producer plus transactional writes plus read-process-write.

Compare Kafka vs RabbitMQ or SQS briefly on replay, throughput, and ordering. Ask how they would migrate consumers without downtime during a partition count increase. Score on architecture drawing, ordering guarantees per partition, and operational awareness. End with tuning: consumer lag is 1M messages — what metrics and configs do you check first?`,
    papers: [
      {
        title: '① Core concepts',
        body:
          table(['Term', 'One-liner'], [
            ['Topic', 'Logical stream of records, split into partitions'],
            ['Partition', 'Ordered, immutable append-only log — unit of parallelism'],
            ['Offset', 'Monotonic position in partition — consumer tracks progress'],
            ['Consumer group', 'Consumers cooperate — one consumer per partition max per group'],
            ['Broker', 'Kafka server storing partition logs'],
            ['Replication factor', 'Copies per partition — leader + followers (ISR)'],
            ['ISR', 'In-sync replicas — caught up with leader'],
            ['ZooKeeper / KRaft', 'Cluster metadata and controller election (KRaft replaces ZK)'],
          ]),
      },
      {
        title: '② Architecture diagram',
        body:
          archDiagram('Kafka cluster (simplified)', [
            [{ text: 'Producers', class: 'green' }],
            [{ text: 'Brokers — Topic A (P0, P1, P2)', class: 'purple' }],
            [{ text: 'Consumer Group A', class: '' }, { text: 'Consumer Group B', class: '' }],
          ]) +
          diagram(
            'Data flow',
            flow([
              { text: 'Producer', class: 'gray' },
              { text: 'Partition by key', class: 'purple' },
              { text: 'Replicated log', class: 'green' },
              { text: 'Consumer poll', class: 'orange' },
              { text: 'Commit offset', class: '' },
            ])
          ),
      },
      {
        title: '③ Producers — acks, keys, batching',
        body:
          table(['acks setting', 'Behavior', 'Durability'], [
            ['acks=0', 'Fire and forget', 'May lose messages'],
            ['acks=1', 'Leader ack only', 'Lost if leader dies before replicate'],
            ['acks=all (-1)', 'All ISR ack', 'Strongest — wait for min.insync.replicas'],
          ]) +
          note(
            `<strong>Partition key:</strong> same key → same partition → ordering per key guaranteed.<br><br>` +
              `<strong>Null key:</strong> round-robin across partitions — no ordering guarantee.<br><br>` +
              `<strong>Batching:</strong> linger.ms + batch.size trade latency for throughput.`
          ),
      },
      {
        title: '④ Consumers & consumer groups',
        body:
          note(
            `<strong>Consumer group:</strong> each partition assigned to at most one consumer in group — scale consumers up to partition count. More consumers than partitions → idle consumers.<br><br>` +
              `<strong>Rebalance:</strong> triggered on consumer join/leave/crash — partitions reassigned (range, round-robin, sticky, cooperative sticky strategies).`
          ) +
          table(['Commit mode', 'Pros', 'Cons'], [
            ['Auto commit', 'Simple', 'May commit before processing — at-most-once risk on crash'],
            ['Manual sync commit', 'After successful process', 'Slower; still at-least-once without idempotency'],
            ['Manual async commit', 'Non-blocking', 'Ordering of commits not guaranteed'],
          ]),
      },
      {
        title: '⑤ Ordering, retention & delivery semantics',
        body:
          table(['Guarantee', 'Scope', 'Requirement'], [
            ['Order', 'Within single partition only', 'Same key → same partition'],
            ['At-most-once', 'Messages may be lost', 'Commit before process'],
            ['At-least-once', 'Duplicates possible', 'Commit after process + idempotent consumer'],
            ['Exactly-once', 'No dup, no loss (within Kafka txn scope)', 'Idempotent producer + transactions'],
          ]) +
          note(
            `<strong>Retention:</strong> time-based (log.retention.hours) or size-based — Kafka is a log, not a traditional queue that deletes on read. Consumers track their own offsets.`
          ),
      },
      {
        title: '⑥ Replication & fault tolerance',
        body:
          layers([
            'Leader partition serves reads/writes on a broker',
            'Followers replicate from leader — join ISR when caught up',
            'Leader failure → controller elects new leader from ISR',
            'unclean.leader.election.enable=false — prefer availability vs data loss trade-off',
            'min.insync.replicas + acks=all — prevent commit if too few replicas',
          ]) +
          note(`Replication factor 3 in production — tolerate 2 broker failures with careful min.insync.replicas config.`),
      },
      {
        title: '⑦ Exactly-once semantics',
        body:
          diagram(
            'EOS building blocks',
            flow([
              { text: 'Idempotent producer', class: 'purple' },
              { text: 'Transactional API', class: 'green' },
              { text: 'Read-process-write', class: 'orange' },
            ])
          ) +
          note(
            `<strong>Idempotent producer:</strong> PID + sequence number dedupes retries on broker.<br><br>` +
              `<strong>Transactions:</strong> atomic write to multiple partitions + consumer offset commit in same transaction — read-process-write pipelines.<br><br>` +
              `<strong>Limit:</strong> EOS within Kafka ecosystem; external side effects still need idempotent sinks.`
          ),
      },
      {
        title: '⑧ Kafka vs traditional queues',
        body:
          table(['Aspect', 'Kafka', 'RabbitMQ / SQS'], [
            ['Model', 'Distributed commit log', 'Queue — message deleted after ack'],
            ['Replay', 'Yes — reset offset', 'No (unless DLQ/replay pattern)'],
            ['Throughput', 'Very high sequential writes', 'Lower for very high volume'],
            ['Ordering', 'Per partition', 'Single consumer per queue typically'],
            ['Use case', 'Event streaming, analytics, CDC', 'Task queues, RPC-style messaging'],
          ]),
      },
      {
        title: '⑨ Scenario — order processing pipeline',
        body:
          archDiagram('Order events', [
            [{ text: 'Order Service (producer)', class: 'gray' }],
            [{ text: 'Topic: orders (key=order_id)', class: 'purple' }],
            [{ text: 'Payment consumer', class: 'green' }, { text: 'Inventory consumer', class: 'green' }, { text: 'Analytics sink', class: '' }],
          ]) +
          checklist([
            'Partition by order_id — all events for one order ordered',
            'Enough partitions for peak throughput (measure bytes/sec)',
            'Idempotent consumers — dedupe by event_id in store',
            'DLQ topic for poison messages after N retries',
            'Monitor consumer lag per partition',
          ]),
      },
      {
        title: '⑩ Tuning & interview Q&A',
        body:
          table(['Question', 'Answer sketch'], [
            ['Consumer lag high?', 'Scale consumers (≤ partitions), optimize processing, check rebalance storms, broker disk'],
            ['Hot partition?', 'Skewed keys — salt keys or custom partitioner'],
            ['How many partitions?', 'Target throughput / single partition throughput; plan ahead — hard to reduce'],
            ['Why not exceed consumers vs partitions?', 'Extra consumers idle — wasted resources'],
          ]) +
          checklist([
            'Drew producer → topic/partitions → consumer group',
            'Explained acks=all and ISR',
            'Ordering per partition + key choice',
            'At-least-once vs exactly-once trade-offs',
            'Retention vs queue semantics',
          ]) +
          tags(['kafka', 'streaming', 'partitions', 'exactly-once', 'consumer-groups']),
      },
    ],
    related: [
      { href: '/cheat-sheets/data-engineering/spark', label: 'Apache Spark' },
    ],
  },

  // ─── 10. Apache Spark ──────────────────────────────────────────────────
  {
    path: 'data-engineering/spark',
    badge: 'Data Engineering',
    badgeClass: 'data-engineering',
    title: 'Apache Spark — Interview Cheat Sheet',
    subtitle: 'RDD vs DataFrame, lazy evaluation, shuffle, partitioning, caching, and job optimization.',
    breadcrumb:
      '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · <a href="/cheat-sheets/data-engineering/">Data Engineering</a> · Spark',
    tip: 'Shuffle is the enemy — explain wide transformations (groupBy, join) vs narrow (map, filter) and how to minimize data movement.',
    prompt: `You are a senior data engineer interviewing on Apache Spark. Cover: RDD vs DataFrame vs Dataset, lazy evaluation and DAG, narrow vs wide transformations, shuffle mechanics, partitioning (hash/range/coalesce), caching/persistence levels, and Catalyst optimizer at high level.

Present debugging scenario: a join job takes 4 hours and one executor OOMs — walk through diagnosis: skewed key, too many partitions, no broadcast hint, cartesian join bug, and executor memory settings. Ask how broadcast join works, when it helps, and what happens if the small table is not actually small.

Compare Spark Streaming micro-batch vs Kafka consumer structured streaming briefly. Question on data skew mitigation: salting keys, adaptive query execution, isolating hot keys.

Score on shuffle understanding, optimization vocabulary, and practical tuning. Ask when Spark beats pandas or SQL warehouses and when a plain SQL engine is the better choice. End with: "Your join job OOMs — walk me through Spark UI stages, executor logs, and your fix order step by step."`,
    papers: [
      {
        title: '① Spark architecture overview',
        body:
          archDiagram('Spark cluster', [
            [{ text: 'Driver (SparkContext / SparkSession)', class: 'purple' }],
            [{ text: 'Cluster Manager (YARN / K8s / standalone)', class: '' }],
            [{ text: 'Executor 1', class: 'green' }, { text: 'Executor 2', class: 'green' }, { text: 'Executor N', class: 'green' }],
          ]) +
          note(
            `<strong>Driver:</strong> builds DAG, schedules tasks, tracks stages.<br><br>` +
              `<strong>Executors:</strong> run tasks, store cached data, shuffle read/write.<br><br>` +
              `<strong>Lazy evaluation:</strong> transformations build plan; actions (count, collect, write) trigger execution.`
          ),
      },
      {
        title: '② RDD vs DataFrame vs Dataset',
        body:
          table(['API', 'Typing', 'Optimization', 'Status'], [
            ['RDD', 'Low-level, opaque objects', 'Manual — you optimize', 'Legacy — use when need fine control'],
            ['DataFrame', 'Untyped rows + schema (Spark SQL)', 'Catalyst optimizer + Tungsten', 'Default for ETL'],
            ['Dataset', 'Typed (Scala/Java)', 'Catalyst + encoder', 'Scala/Java — type-safe'],
          ]) +
          note(`Python PySpark uses DataFrame API almost exclusively. Prefer DataFrame over RDD unless you need custom partition-level logic.`),
      },
      {
        title: '③ Transformations — narrow vs wide',
        body:
          table(['Type', 'Examples', 'Shuffle?'], [
            ['Narrow', 'map, filter, select, union (same partition count)', 'No — pipelined in same stage'],
            ['Wide', 'groupByKey, reduceByKey, join, repartition, distinct', 'Yes — shuffle exchange'],
          ]) +
          diagram(
            'Shuffle exchange',
            flow([
              { text: 'Map side write', class: 'purple' },
              { text: 'Shuffle files', class: 'orange' },
              { text: 'Reduce side read', class: 'green' },
            ])
          ) +
          note(
            `<strong>groupByKey vs reduceByKey:</strong> reduceByKey combines locally before shuffle — almost always prefer reduceByKey over groupByKey + mapValues.`
          ),
      },
      {
        title: '④ Partitioning & parallelism',
        body:
          table(['Operation', 'Effect'], [
            ['repartition(n)', 'Full shuffle — increase/decrease partitions evenly'],
            ['coalesce(n)', 'Narrow — decrease partitions without full shuffle (if shuffle=false)'],
            ['partitionBy(col)', 'Hash/range partition on write'],
            ['spark.default.parallelism', 'Default partitions for shuffle operations'],
          ]) +
          note(
            `<strong>Rule of thumb:</strong> 2–3× cores for partition count; too many tiny partitions → task overhead; too few → skew and memory pressure. Target 128MB–256MB per partition.`
          ),
      },
      {
        title: '⑤ Join strategies',
        body:
          table(['Strategy', 'When', 'Risk'], [
            ['Broadcast hash join', 'Small table fits in memory (spark.sql.autoBroadcastJoinThreshold)', 'Driver/executor OOM if table too large'],
            ['Sort-merge join', 'Large-large join', 'Expensive shuffle — both sides sorted'],
            ['Shuffle hash join', 'Medium tables', 'Memory for hash table'],
            ['Cartesian', 'Missing join condition bug', 'Explosion — always avoid accidentally'],
          ]) +
          note(`Fix skew: salting hot keys, AQE skew join (Spark 3), isolate heavy key to separate processing.`),
      },
      {
        title: '⑥ Caching & persistence',
        body:
          table(['Level', 'Storage', 'Use'], [
            ['MEMORY_ONLY', 'Deserialized JVM objects', 'Fast if fits RAM'],
            ['MEMORY_AND_DISK', 'Spill to disk on overflow', 'Default safe choice for iterative'],
            ['DISK_ONLY', 'Disk', 'Too large for memory'],
            ['MEMORY_ONLY_SER', 'Serialized bytes', 'Less memory, more CPU deserialize'],
          ]) +
          note(
            `<strong>When to cache:</strong> DataFrame reused in multiple downstream branches (ML iterations, graph loops). Unpersist when done. <code>df.cache()</code> = MEMORY_AND_DISK.`
          ),
      },
      {
        title: '⑦ Structured Streaming (brief)',
        body:
          note(
            `<strong>Micro-batch model:</strong> treat stream as append table — trigger queries on new data. Checkpoint dir for fault tolerance and exactly-once sinks.<br><br>` +
              `<strong>Watermark:</strong> handle late-arriving events in windowed aggregations.<br><br>` +
              `<strong>Output modes:</strong> append, complete, update.`
          ) +
          diagram(
            'Streaming pipeline',
            flow([
              { text: 'Kafka source', class: 'gray' },
              { text: 'Spark transform', class: 'purple' },
              { text: 'Checkpoint', class: 'orange' },
              { text: 'Delta / Parquet sink', class: 'green' },
            ]),
          ),
      },
      {
        title: '⑧ Optimization checklist',
        body:
          checklist([
            'Filter early — push predicates before join',
            'Select only needed columns — avoid SELECT *',
            'Broadcast small dimension tables explicitly',
            'Replace UDFs with Spark SQL built-ins (Catalyst cannot optimize UDFs well)',
            'Avoid collect() on large data — use write or take/sample',
            'Enable AQE (Adaptive Query Execution) Spark 3+',
            'Fix data skew before scaling cluster',
          ]),
      },
      {
        title: '⑨ Debugging slow jobs',
        body:
          table(['Symptom', 'Likely cause', 'Fix'], [
            ['One task much slower', 'Data skew on key', 'Salt keys, AQE, isolate hot key'],
            ['Executor OOM', 'Too much data per partition, large broadcast', 'Repartition, increase memory, reduce broadcast size'],
            ['Many small tasks', 'Too many partitions', 'coalesce after filter'],
            ['4+ hour shuffle', 'Cartesian or missing filter', 'Check join condition, filter early'],
            ['Spill to disk', 'Memory pressure', 'Increase executor memory or reduce partition size'],
          ]) +
          note(`Use Spark UI: Stages tab → skewed task duration histogram; SQL tab → physical plan (broadcast hint visible).`),
      },
      {
        title: '⑩ Interview Q&A & revision',
        body:
          table(['Question', 'Answer sketch'], [
            ['What triggers shuffle?', 'Wide transformation requiring data redistribution across partitions'],
            ['Lazy evaluation benefit?', 'Optimize full DAG — predicate pushdown, combine filters'],
            ['RDD lineage?', 'Graph of transformations — rebuild lost partitions from lineage + checkpoints'],
            ['Spark vs MapReduce?', 'In-memory iteratives, DAG scheduler, 10–100× faster for iterative ML/ETL'],
            ['When Spark over pandas?', 'Data does not fit in memory, distributed cluster, production ETL pipelines'],
          ]) +
          checklist([
            'Explained narrow vs wide transformations',
            'Named shuffle cause and mitigation',
            'Compared RDD vs DataFrame',
            'Described broadcast join use case',
            'Listed skew debugging steps',
          ]) +
          tags(['spark', 'shuffle', 'dataframe', 'partitioning', 'optimization']),
      },
    ],
    related: [
      { href: '/cheat-sheets/data-engineering/kafka', label: 'Apache Kafka' },
    ],
  },

  // ─── 11. STAR Method ───────────────────────────────────────────────────
  {
    path: 'behaviour/star',
    badge: 'Behaviour',
    badgeClass: 'behaviour',
    title: 'STAR Method — Behavioral Interview Guide',
    subtitle: 'Structure every behavioral answer: Situation, Task, Action, Result — with examples and senior-level dos and donts.',
    breadcrumb:
      '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · <a href="/cheat-sheets/behaviour/">Behaviour</a> · STAR Method',
    tip: 'Spend 20% on Situation/Task, 60% on Action (what YOU did), 20% on Result with numbers.',
    prompt: `You are a behavioral interviewer for senior software engineer roles. Ask 5 questions covering leadership, conflict, failure, ambiguity, and measurable business impact. After each answer, enforce STAR format — interrupt if they use "we" without clarifying their role.

Score each response 1–5 on: structure (STAR), specificity (names, dates, metrics), ownership (I vs we), and senior signals (trade-offs, stakeholder management, learning). After question 3 on failure, coach them: "Your Result was vague — add a metric."

Provide a rewritten stronger version of their weakest answer with concrete metrics and a clearer Action section. Cover dos: quantify results, show reflection; donts: blame others, no result, ramble ten minutes.

Enforce 2–3 minute answers per question. Note when they should use Amazon Leadership Principle framing even for non-Amazon companies. Ask them to trim one answer live by removing excess Situation detail. End with scorecard, hire recommendation, and top 2 stories to refine before onsite.`,
    papers: [
      {
        title: '① STAR framework explained',
        body:
          diagram(
            'STAR flow',
            flow([
              { text: 'Situation', class: 'gray' },
              { text: 'Task', class: '' },
              { text: 'Action', class: 'purple' },
              { text: 'Result', class: 'green' },
            ])
          ) +
          table(['Letter', 'What to include', 'Time %'], [
            ['S — Situation', 'Brief context — team, company, stakes (2–3 sentences)', '~15%'],
            ['T — Task', 'Your specific responsibility or goal', '~10%'],
            ['A — Action', 'Steps YOU took — decisions, trade-offs, influence', '~55%'],
            ['R — Result', 'Outcome with metrics; what you learned', '~20%'],
          ]) +
          note(`Interviewers remember <strong>Action + Result</strong>. Skip long backstory — they will ask follow-ups if needed.`),
      },
      {
        title: '② Strong example — production incident',
        body:
          note(
            `<strong>S:</strong> E-commerce checkout API p99 latency jumped from 200ms to 3s during Black Friday — $50K/hour revenue at risk.<br><br>` +
              `<strong>T:</strong> As on-call senior, I led triage and coordinated fix without full outage.<br><br>` +
              `<strong>A:</strong> I pulled dashboards, identified Redis hot key on promo banner cache, implemented singleflight + local cache on redirect service, rolled canary to 10% then 100%, wrote postmortem with 3 action items.<br><br>` +
              `<strong>R:</strong> Latency back to 180ms p99 within 45 min; zero customer-facing downtime; hot-key guard added to CI load tests — no repeat next quarter.`
          ),
      },
      {
        title: '③ Strong example — conflict with stakeholder',
        body:
          note(
            `<strong>S:</strong> Product wanted 6 features in one sprint; team capacity allowed 3.<br><br>` +
              `<strong>T:</strong> I needed to align scope with engineering reality without damaging trust.<br><br>` +
              `<strong>A:</strong> I built RICE score sheet with PM, mapped dependencies, proposed MVP slice shipping 2 high-impact features + tech debt for flaky pipeline; offered phased rollout dates with risk flags.<br><br>` +
              `<strong>R:</strong> Shipped MVP on time; NPS +8 on shipped features; PM adopted RICE for future planning; team overtime dropped from 20% to 5% that quarter.`
          ),
      },
      {
        title: '④ Strong example — failure and learning',
        body:
          note(
            `<strong>S:</strong> I led migration to new auth provider; underestimated session edge cases.<br><br>` +
              `<strong>T:</strong> Own rollback decision and communication during partial login failures affecting 2% users.<br><br>` +
              `<strong>A:</strong> Triggered feature flag rollback within 20 min, posted status page update, paired with support on user comms, added integration test suite for session refresh paths before retry.<br><br>` +
              `<strong>R:</strong> Full recovery in 1 hour; zero data loss; retry succeeded with 100% test coverage on auth paths; I now require dark-launch checklist for identity changes.`
          ),
      },
      {
        title: '⑤ Dos — senior engineer signals',
        body:
          checklist([
            'Use "I" for your decisions — clarify team context separately',
            'Quantify: latency, revenue, users, time saved, error rate',
            'Show trade-offs considered before action',
            'Mention stakeholders: PM, design, ops, leadership',
            'End with reflection or process improvement',
            'Prepare 8–10 stories mapping to common themes',
            'Keep answers 2–3 minutes — pause for follow-ups',
          ]),
      },
      {
        title: '⑥ Donts — instant red flags',
        body:
          checklist([
            'Blame teammates or " toxic manager " without ownership',
            'No result — story trails off at "and then we fixed it"',
            'Hypothetical — "I would…" without real example',
            'Too much Situation — 2 minutes of context, 30 seconds of action',
            'Confidential details — use anonymized metrics',
            'Humble-bragging without substance',
            'Same story for every question — show range',
          ]),
      },
      {
        title: '⑦ Story bank — themes to prepare',
        body:
          table(['Theme', 'What they probe', 'Story angle'], [
            ['Leadership', 'Influence without authority', 'Led initiative across teams'],
            ['Conflict', 'Disagreement resolution', 'Data-driven scope negotiation'],
            ['Failure', 'Accountability + learning', 'Rollback, postmortem, prevention'],
            ['Ambiguity', 'Undefined problem', 'Clarified requirements, shipped MVP'],
            ['Impact', 'Business outcome', 'Metric improvement you drove'],
            ['Mentoring', 'Growing others', 'Junior promoted after your coaching'],
            ['Deadline pressure', 'Prioritization', 'Cut scope, communicated early'],
            ['Ethics / integrity', 'Hard choice', 'Pushed back on shady shortcut'],
          ]),
      },
      {
        title: '⑧ Follow-up handling',
        body:
          note(
            `<strong>"What would you do differently?"</strong> — honest improvement, not fake perfection.<br><br>` +
              `<strong>"What did others do?"</strong> — credit team, restate your specific contribution.<br><br>` +
              `<strong>"Why that decision?"</strong> — trade-offs, constraints, data at the time.<br><br>` +
              `<strong>Deeper drill:</strong> interviewer zooms into Action — have technical detail ready without jargon dump.`
          ),
      },
      {
        title: '⑨ Self-scoring rubric',
        body:
          table(['Score', 'Structure', 'Specificity', 'Ownership'], [
            ['5', 'Clear STAR, timed well', 'Metrics, names, tools', 'Clear I decisions + team context'],
            ['3', 'Some STAR, rambles', 'Generic outcomes', 'Mostly "we"'],
            ['1', 'No structure', 'Vague, hypothetical', 'Blame or no role clarity'],
          ]) +
          note(`Record yourself answering 3 stories — most candidates overestimate clarity.`),
      },
      {
        title: '⑩ Revision checklist',
        body:
          checklist([
            'Prepared 8+ STAR stories across themes',
            'Each story has at least one metric in Result',
            'Action section names YOUR decisions explicitly',
            'Answers fit 2–3 minutes spoken',
            'Practiced follow-ups: differently, others role, lessons',
            'Removed blame and confidential details',
          ]) +
          tags(['STAR', 'behavioral', 'leadership', 'interview']),
      },
    ],
    related: [
      { href: '/cheat-sheets/behaviour/questions', label: 'Top Behavioral Questions' },
    ],
  },

  // ─── 12. Top Behavioral Questions ──────────────────────────────────────
  {
    path: 'behaviour/questions',
    badge: 'Behaviour',
    badgeClass: 'behaviour',
    title: 'Top Behavioral Interview Questions',
    subtitle: 'High-frequency questions with STAR outlines — teamwork, pressure, disagreement, mentoring, and ethics.',
    breadcrumb:
      '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · <a href="/cheat-sheets/behaviour/">Behaviour</a> · Top Questions',
    tip: 'Map each question to a pre-written STAR story — never invent on the spot under pressure.',
    prompt: `You are running a behavioral mock for a senior software engineer onsite. Ask 8 questions from the top behavioral list: teamwork, tight deadline, disagreeing with manager, mentoring, biggest failure, handling ambiguity, ethical dilemma, and proudest accomplishment.

After each answer, rate 1–5 and note missing STAR elements. Push for metrics: "You said it improved — by how much?" If they reuse the same story, ask for a different example on question 5.

Enforce 2–3 minute time box. For disagreement and ethics questions, probe whether they escalated appropriately and preserved relationships.

Ask one unexpected follow-up per story: "What would you do differently?" or "How did your manager react?" Rate overall readiness for senior behavioral loops on a 1–5 scale with one sentence justification. End with scorecard table: question, score, fix. Provide STAR outline templates for two weakest answers. Tell them which 5 stories to memorize for LP-style loops vs general FAANG onsite.`,
    papers: [
      {
        title: '① Leadership & influence',
        body:
          table(['Question', 'STAR outline hint'], [
            ['Tell me about a time you led without authority', 'S: cross-team problem · T: unowned gap · A: rallied, documented, drove sync · R: shipped, adoption metric'],
            ['Describe your most impactful project', 'S: business problem · T: your scope · A: key technical/strategic calls · R: revenue/latency/users'],
            ['When did you improve a process?', 'S: pain point (deploys, incidents) · T: propose fix · A: automation, docs · R: frequency/time saved'],
          ]),
      },
      {
        title: '② Teamwork & collaboration',
        body:
          table(['Question', 'STAR outline hint'], [
            ['Difficult teammate — how handled?', 'S: friction context · T: deliver despite · A: 1:1, align on goals, split work · R: delivered, relationship improved'],
            ['Helped someone succeed', 'S: junior struggling · T: mentor · A: pairing, code review, growth plan · R: their promotion or quality metric'],
            ['Cross-functional conflict with PM/design', 'S: scope disagreement · T: find alignment · A: user data, prototype, compromise · R: shipped MVP, NPS or adoption'],
          ]),
      },
      {
        title: '③ Pressure & deadlines',
        body:
          table(['Question', 'STAR outline hint'], [
            ['Tight deadline — what did you cut?', 'S: immovable date · T: scope vs quality · A: prioritized MVP, communicated risks early · R: on-time ship, known deferrals'],
            ['Multiple priorities — how decided?', 'S: competing asks · T: rank work · A: RICE/impact matrix, stakeholder sync · R: critical path met'],
            ['Worked under significant stress', 'S: incident or crunch · T: stay effective · A: triage, delegate, self-care boundary · R: stability restored, no burnout repeat'],
          ]),
      },
      {
        title: '④ Disagreement & feedback',
        body:
          table(['Question', 'STAR outline hint'], [
            ['Disagreed with manager', 'S: technical or priority split · T: right outcome · A: data, prototype, respectful pushback · R: adopted approach or documented dissent'],
            ['Received harsh feedback', 'S: review or incident · T: improve · A: listened, action plan, follow-up · R: measurable behavior change'],
            ['Had to push back on stakeholder', 'S: unrealistic ask · T: protect team quality · A: trade-off doc, alternatives · R: agreed scope, trust maintained'],
          ]),
      },
      {
        title: '⑤ Failure & learning',
        body:
          table(['Question', 'STAR outline hint'], [
            ['Biggest failure', 'S: what went wrong · T: your ownership · A: fix, comms, prevention · R: recovery metric + process change'],
            ['Missed a deadline', 'S: why slip · T: communicate · A: early flag, replan · R: partial delivery or lessons'],
            ['Made a wrong technical decision', 'S: bad bet · T: detect and pivot · A: rollback, postmortem · R: cost of delay vs worse outcome avoided'],
          ]),
      },
      {
        title: '⑥ Ambiguity & ownership',
        body:
          table(['Question', 'STAR outline hint'], [
            ['Ambiguous problem — how started?', 'S: vague ask · T: define success · A: interviews, spikes, MVP · R: clarity doc, shipped iteration'],
            ['Went above and beyond', 'S: gap outside job · T: saw need · A: extra work off roadmap · R: team/customer benefit quantified'],
            ['Inherited messy codebase/system', 'S: tech debt pain · T: stabilize · A: tests, observability, incremental refactor · R: incident drop, velocity up'],
          ]),
      },
      {
        title: '⑦ Ethics & integrity',
        body:
          table(['Question', 'STAR outline hint'], [
            ['Ethical dilemma at work', 'S: pressure to cut corner · T: uphold standard · A: escalated, documented, alternative · R: compliant ship, no downstream harm'],
            ['Saw someone else cut corners', 'S: quality/safety risk · T: address · A: private convo or escalate per severity · R: issue fixed, relationship handled'],
          ]) +
          note(`Pick real but safe examples — interviewers want judgment, not drama.`),
      },
      {
        title: '⑧ Amazon LP mapping (optional prep)',
        body:
          table(['Leadership Principle', 'Question flavor'], [
            ['Customer Obsession', 'Hardest customer problem you solved'],
            ['Ownership', 'End-to-end beyond your lane'],
            ['Dive Deep', 'Debugged complex production issue'],
            ['Deliver Results', 'Shipped despite obstacles'],
            ['Learn and Be Curious', 'Self-taught skill applied at work'],
            ['Earn Trust', 'Admitted mistake, rebuilt confidence'],
          ]) +
          note(`One story can map to 2–3 LPs — prepare flexible angles, not 16 unique stories.`),
      },
      {
        title: '⑨ Answer timing & delivery',
        body:
          checklist([
            'Pause 3 seconds — pick best story from bank',
            'Headline first: "I will share a time when I…"',
            'Watch interviewer — stop when they nod for follow-up',
            '2–3 minutes max initial answer',
            'Bring notebook with story titles only — not scripts',
          ]) +
          diagram(
            'Prep workflow',
            flow([
              { text: 'List 8 themes', class: 'gray' },
              { text: 'Write STAR bullets', class: 'purple' },
              { text: 'Add metrics', class: 'green' },
              { text: 'Practice aloud', class: 'orange' },
            ]),
          ),
      },
      {
        title: '⑩ Revision checklist',
        body:
          checklist([
            'Mapped top 15 questions to specific stories',
            'Each story has metric in Result',
            'Practiced disagreement and failure without blame',
            'Timed answers under 3 minutes',
            'Prepared follow-ups for each core story',
            'Reviewed STAR method cheat sheet',
          ]) +
          tags(['behavioral', 'STAR', 'leadership', 'teamwork', 'interview']),
      },
    ],
    related: [
      { href: '/cheat-sheets/behaviour/star', label: 'STAR Method Guide' },
    ],
  },
];
