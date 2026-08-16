/** Core SD concept definitions — imported by sd-core-sheets.mjs */
export const CORE_CONCEPT_DATA = [
  {
    slug: 'load-balancing',
    title: 'Load Balancing',
    summary:
      'Distributes incoming traffic across multiple servers so no single machine becomes a bottleneck and failures are isolated.',
    analogy: 'A restaurant host seating guests across waiters instead of one overloaded server.',
    mechanism:
      'Client hits a load balancer (L4 TCP or L7 HTTP). LB picks a healthy backend via round-robin, least connections, or weighted rules. Health checks remove dead nodes. SSL termination and sticky sessions optional.',
    example:
      'URL shortener at 50K RPS: 20 stateless API pods behind an AWS ALB. ALB terminates TLS, routes by path, drains unhealthy pods during deploy. Session-free redirects need no stickiness.',
    qa: [
      ['L4 vs L7 load balancer?', 'L4 routes by IP/port (fast, WebSocket-friendly). L7 routes by URL, headers, cookies (microservices, canary).'],
      ['What if one server is slow?', 'Least-connections beats round-robin when request durations vary widely.'],
      ['How handle deploy without downtime?', 'Rolling deploy + health check grace period; LB stops sending to old version.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/url-shortener', label: 'URL Shortener', why: 'redirect hot path' },
      { href: '/cheat-sheets/system-design/api-gateway', label: 'API Gateway', why: 'edge routing' },
      { href: '/cheat-sheets/system-design/chat-system', label: 'WhatsApp & Chat', why: 'WebSocket LB' },
    ],
    checklist: ['Named L4 vs L7', 'Health checks', 'SSL termination', 'Stateless vs sticky', 'Global + regional LB'],
    tags: ['load-balancer', 'scalability', 'high-availability'],
    videos: ['612Y0jXmWKk', 'yE3O28E38_E'],
  },
  {
    slug: 'api-gateway',
    title: 'API Gateway',
    summary: 'Single entry point that routes, authenticates, rate-limits, and aggregates calls to internal microservices.',
    mechanism:
      'Clients call one gateway URL. Gateway validates JWT, applies rate limits, routes to service mesh or direct HTTP. Can compose multiple backend calls into one response (BFF pattern).',
    example:
      'Mobile app home screen needs user profile + notifications + feed snippet. API gateway fans out three internal calls, merges JSON, caches public fragments at edge.',
    qa: [
      ['Gateway vs load balancer?', 'LB distributes to homogeneous servers; gateway is smart routing, auth, composition across different services.'],
      ['Where put rate limiting?', 'At gateway for coarse per-API-key limits; finer limits inside domain services.'],
      ['Single point of failure?', 'Run gateway cluster behind LB; cache auth tokens; circuit break on downstream failures.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/api-gateway', label: 'Design API Gateway', why: 'full topic' },
      { href: '/cheat-sheets/system-design/payment-system', label: 'Payment System', why: 'auth + idempotency at edge' },
      { href: '/cheat-sheets/system-design/chatgpt-system', label: 'ChatGPT System', why: 'token metering' },
    ],
    checklist: ['Auth at edge', 'Rate limit', 'Routing table', 'BFF aggregation', 'Circuit breaker on downstream'],
    tags: ['api-gateway', 'microservices', 'edge'],
    videos: ['yE3O28E38_E', '612Y0jXmWKk'],
  },
  {
    slug: 'service-discovery',
    title: 'Service Discovery',
    summary: 'Lets services find each other’s network locations dynamically as instances scale up, down, or move.',
    mechanism:
      'Services register name + IP/port with a registry (Consul, etcd, Kubernetes DNS). Clients resolve logical name → current instance list. Health checks deregister dead nodes.',
    example:
      'Payment service scales from 3 to 30 pods during Black Friday. Order service resolves <code>payment-svc</code> via K8s DNS and gets updated endpoints without config change.',
    qa: [
      ['Client-side vs server-side discovery?', 'Client pulls registry and picks instance (Eureka) vs client always hits LB that knows backends (K8s Service).'],
      ['Why not static IPs?', 'Auto-scaling and failures change IPs constantly in cloud.'],
      ['Split brain in registry?', 'Use consensus stores (etcd) or K8s control plane; avoid single-node registry.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/uber-rides', label: 'Uber / Rides', why: 'many microservices' },
      { href: '/cheat-sheets/system-design/distributed-task-scheduler', label: 'Task Scheduler', why: 'worker pool discovery' },
      { href: '/cheat-sheets/system-design/google-realtime-analytics', label: 'Google Real-time Analytics', why: 'fleet of collectors' },
    ],
    checklist: ['Registry choice', 'Health-based deregistration', 'DNS vs sidecar', 'Cache TTL on clients'],
    tags: ['service-discovery', 'microservices', 'kubernetes'],
    videos: ['P3FKlI86t3Q', 'cTMomjk1iRc'],
  },
  {
    slug: 'cache-design',
    title: 'Cache Design',
    summary: 'Stores hot data in fast memory to cut latency and database load — with explicit invalidation and eviction policies.',
    mechanism:
      'Cache-aside: app reads cache, on miss reads DB and populates. Writes update DB then delete cache key. TTL + LRU eviction. Watch hot keys and stampede (singleflight).',
    example:
      'News feed: precomputed feed cells cached in Redis per user_id with 60s TTL. On new post, fan-out worker deletes affected users’ cache keys.',
    qa: [
      ['Cache-aside vs read-through?', 'Cache-aside: app owns logic. Read-through: cache library fetches DB on miss — simpler app code.'],
      ['How prevent stale reads?', 'TTL safety net + delete-on-write + version keys for critical entities.'],
      ['Thundering herd?', 'Singleflight: one thread repopulates; others wait on same key.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/url-shortener', label: 'URL Shortener', why: 'redirect path' },
      { href: '/cheat-sheets/system-design/distributed-cache', label: 'Distributed Cache', why: 'full design' },
      { href: '/cheat-sheets/system-design/news-feed', label: 'News Feed', why: 'feed cells' },
    ],
    checklist: ['Pattern named', 'TTL + eviction', 'Invalidation on write', 'Hot key plan', 'Stampede mitigation'],
    tags: ['caching', 'redis', 'performance'],
    videos: ['cTMomjk1iRc', 'P3FKlI86t3Q'],
  },
  {
    slug: 'cdn',
    title: 'CDN (Content Delivery Network)',
    summary: 'Caches static and cacheable content at edge PoPs worldwide so users download from a nearby server.',
    mechanism:
      'DNS routes user to nearest edge. Edge serves cached object or fetches from origin on miss. Versioned asset URLs avoid purge storms. Great for video segments, images, JS bundles.',
    example:
      'YouTube video chunks: each 2s segment cached at edge; 90% of views never touch origin. Thumbnail and player JS served from CDN with immutable cache headers.',
    qa: [
      ['What not to put on CDN?', 'Personalized HTML, auth responses, POST bodies, private user data.'],
      ['Cache invalidation strategy?', 'Fingerprint URLs (<code>app.[hash].js</code>) instead of manual purge.'],
      ['CDN vs edge compute?', 'Workers at edge for redirects, A/B, geo routing without round-trip to origin.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/youtube-streaming', label: 'YouTube', why: 'video segments' },
      { href: '/cheat-sheets/system-design/google-maps', label: 'Google Maps', why: 'map tiles' },
      { href: '/cheat-sheets/system-design/instagram-photos', label: 'Instagram', why: 'photo delivery' },
    ],
    checklist: ['Edge PoP concept', 'Cache-Control headers', 'Versioned static assets', 'Origin shield', 'Geo DNS'],
    tags: ['cdn', 'edge', 'latency'],
    videos: ['Y1qxI-Df4Lk', '612Y0jXmWKk'],
  },
  {
    slug: 'messaging-queue',
    title: 'Messaging Queue',
    summary: 'Decouples producers and consumers with buffered, durable message delivery — async work off the critical path.',
    mechanism:
      'Producer publishes to topic/queue. Consumers pull or subscribe. At-least-once typical; idempotent consumers handle duplicates. Partitioning enables parallel scale.',
    example:
      'Notification system: post-like event → Kafka topic → email, push, SMS consumers at different speeds. User API returns before emails send.',
    qa: [
      ['Queue vs pub-sub?', 'Queue: one consumer per message (task). Pub-sub: many subscribers each get a copy (events).'],
      ['Ordering guarantees?', 'Single partition preserves order per key; global order needs single partition (limited scale).'],
      ['Poison message?', 'Retry with backoff → DLQ for manual inspection.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/notification-system', label: 'Notifications', why: 'multi-channel async' },
      { href: '/cheat-sheets/system-design/chat-system', label: 'WhatsApp & Chat', why: 'message pipeline' },
      { href: '/cheat-sheets/data-engineering/kafka', label: 'Apache Kafka', why: 'deep dive' },
    ],
    checklist: ['At-least-once + idempotency', 'Partition key', 'DLQ', 'Consumer lag monitoring', 'Backpressure'],
    tags: ['kafka', 'queue', 'async'],
    videos: ['P3FKlI86t3Q', 'yE3O28E38_E'],
  },
  {
    slug: 'zookeeper',
    title: 'Zookeeper',
    summary: 'Coordination service for distributed systems — leader election, config, locks, and membership with strong consistency.',
    mechanism:
      'Znodes in a hierarchical namespace. Watches notify clients of changes. Quorum writes for consistency (CP). Used for Kafka controller election, Hadoop, early service discovery.',
    example:
      'Distributed task scheduler: only one leader znode holder runs cron tick. Challenger watches leader node; on session timeout, new leader elected in seconds.',
    qa: [
      ['Zookeeper vs etcd?', 'Similar coordination; etcd common in Kubernetes; ZK legacy in Kafka ecosystem.'],
      ['Why not use DB for locks?', 'ZK optimized for small coordination data + watches; not for bulk storage.'],
      ['Split brain risk?', 'Requires quorum majority; never run even number of nodes in production.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/distributed-task-scheduler', label: 'Task Scheduler', why: 'leader election' },
      { href: '/cheat-sheets/data-engineering/kafka', label: 'Kafka', why: 'controller metadata' },
      { href: '/cheat-sheets/system-design/distributed-search', label: 'Distributed Search', why: 'cluster metadata' },
    ],
    checklist: ['Znode watches', 'Leader election', 'Quorum size', 'CP not AP', 'Session timeouts'],
    tags: ['zookeeper', 'coordination', 'consensus'],
    videos: ['P3FKlI86t3Q', 'cTMomjk1iRc'],
  },
  {
    slug: 'circuit-breaker',
    title: 'Circuit Breaker',
    summary: 'Stops calling a failing dependency after threshold failures — fails fast and allows recovery without cascade.',
    mechanism:
      'States: Closed (normal) → Open (reject calls) → Half-open (probe). Count failures in window; open circuit; after cooldown try single request. Prevents thread pile-up on timeouts.',
    example:
      'Payment service calls PSP API. After 5 timeouts in 10s, circuit opens — return graceful error to user, queue retry job instead of hanging 30s per request.',
    qa: [
      ['Circuit breaker vs retry?', 'Retry helps transient errors; breaker stops hammering dead dependency. Use both with limits.'],
      ['Fallback when open?', 'Cached quote, degraded mode, or queue for later — never silent wrong data for money.'],
      ['Half-open probes?', 'One trial request; success closes circuit; failure reopens.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/payment-system', label: 'Payment System', why: 'PSP failures' },
      { href: '/cheat-sheets/system-design/notification-system', label: 'Notifications', why: 'SMS provider down' },
      { href: '/cheat-sheets/system-design/api-gateway', label: 'API Gateway', why: 'downstream protection' },
    ],
    checklist: ['Three states', 'Failure threshold', 'Fallback defined', 'Half-open probe', 'Metrics on open events'],
    tags: ['circuit-breaker', 'resilience', 'microservices'],
    videos: ['yE3O28E38_E', 'qcIQKYGvdgk'],
  },
  {
    slug: 'sharding',
    title: 'Sharding',
    summary: 'Splits data across multiple database nodes by a shard key so write/read capacity scales beyond one machine.',
    mechanism:
      'Choose shard key (user_id, tenant_id). hash(key) → shard index. Cross-shard queries expensive — design access patterns per shard. Rebalancing moves ranges when adding nodes.',
    example:
      'Twitter timelines: tweets sharded by user_id. Write tweet to author shard; fan-out workers read follower lists and write to follower shard inboxes.',
    qa: [
      ['Shard key selection?', 'High cardinality, even distribution, aligns with query patterns — avoid cross-shard joins.'],
      ['Hot shard?', 'Split range, add read replicas, or reshard by sub-key.'],
      ['Shard vs read replica?', 'Replica scales reads on same data; sharding splits data for write scale.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/twitter-timeline', label: 'Twitter', why: 'timeline shards' },
      { href: '/cheat-sheets/system-design/chat-system', label: 'WhatsApp & Chat', why: 'message shards' },
      { href: '/cheat-sheets/system-design/distributed-search', label: 'Distributed Search', why: 'index shards' },
    ],
    checklist: ['Shard key justified', 'Cross-shard query plan', 'Rebalance strategy', 'Hot shard mitigation'],
    tags: ['sharding', 'database', 'scale'],
    videos: ['yE3O28E38_E', 'P3FKlI86t3Q'],
  },
  {
    slug: 'sql-vs-nosql',
    title: 'SQL vs NoSQL',
    summary: 'Pick the store based on access patterns — ACID transactions vs horizontal write scale and flexible schema.',
    mechanism:
      'SQL (PostgreSQL): joins, constraints, transactions. NoSQL families: wide-column (Cassandra writes), document (Mongo flexible JSON), key-value (Redis speed), search (Elasticsearch text).',
    example:
      'E-commerce: PostgreSQL for orders + payments (ACID). Redis for cart session. Elasticsearch for product search. S3 for product images.',
    qa: [
      ['When SQL wins?', 'Financial ledger, inventory, relationships needing joins and strong constraints.'],
      ['When Cassandra wins?', 'High write throughput, time-series, tolerate eventual consistency per row.'],
      ['Can you mix?', 'Polyglot persistence — each service owns its store optimized for its pattern.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/ticket-booking', label: 'Ticket Booking', why: 'ACID seats' },
      { href: '/cheat-sheets/system-design/news-feed', label: 'News Feed', why: 'Cassandra feeds' },
      { href: '/cheat-sheets/system-design/quora', label: 'Quora', why: 'SQL + Cassandra mix' },
    ],
    checklist: ['Access pattern first', 'ACID needs stated', 'Polyglot example', 'No buzzword-only picks'],
    tags: ['sql', 'nosql', 'database'],
    videos: ['612Y0jXmWKk', 'cTMomjk1iRc'],
  },
  {
    slug: 'consistent-hashing',
    title: 'Consistent Hashing',
    summary: 'Maps keys to nodes on a ring so adding/removing a server only moves ~1/N keys — not full rehash.',
    mechanism:
      'Hash nodes and keys onto ring. Key walks clockwise to first node. Virtual nodes balance load. Used for distributed cache, Dynamo-style storage, load balancers.',
    example:
      'Distributed cache cluster: 100 Redis shards. Add shard 101 — only keys between predecessor and new node migrate, not entire cache flush.',
    qa: [
      ['Why not mod N hashing?', 'mod N reshuffles almost all keys when N changes — cache avalanche.'],
      ['Virtual nodes?', 'Each physical node has many ring positions — evens out skew when few servers.'],
      ['Who uses it?', 'Redis Cluster, Cassandra partitions, CDNs, memcached proxies.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/distributed-cache', label: 'Distributed Cache', why: 'shard routing' },
      { href: '/cheat-sheets/system-design/rate-limiter', label: 'Rate Limiter', why: 'counter shards' },
      { href: '/cheat-sheets/system-design/shared-counter', label: 'Shared Counter', why: 'counter shards' },
    ],
    checklist: ['Ring intuition', 'vs mod N', 'Virtual nodes', 'Minimal key movement on rebalance'],
    tags: ['consistent-hashing', 'distributed', 'caching'],
    videos: ['cTMomjk1iRc', 'P3FKlI86t3Q'],
  },
  {
    slug: 'cap-theorem',
    title: 'CAP Theorem',
    summary: 'During a network partition, a distributed system must choose consistency or availability — partition tolerance is mandatory.',
    mechanism:
      'CP systems (ZK, HBase) reject writes or reads during partition to stay consistent. AP systems (Cassandra, Dynamo) accept writes on both sides and reconcile later.',
    example:
      'Social like count (AP): brief wrong count OK, always respond. Bank transfer (CP): block if quorum unavailable to prevent double spend.',
    qa: [
      ['PACELC?', 'Without partition, trade latency vs consistency — most web apps pick low latency.'],
      ['Is CAP outdated?', 'Still useful framing; modern systems offer tunable consistency per operation.'],
      ['Read-your-writes?', 'User sees own updates — route to primary or session version check.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/payment-system', label: 'Payment System', why: 'CP ledger' },
      { href: '/cheat-sheets/system-design/news-feed', label: 'News Feed', why: 'AP feeds' },
      { href: '/cheat-sheets/system-design/distributed-cache', label: 'Distributed Cache', why: 'replica lag' },
    ],
    checklist: ['Define C A P', 'CP vs AP example', 'PACELC mention', 'Problem-specific choice'],
    tags: ['cap', 'consistency', 'availability'],
    videos: ['yE3O28E38_E', '612Y0jXmWKk'],
  },
  {
    slug: 'solid-principles',
    title: 'SOLID Principles (for System Design)',
    summary: 'Design boundaries so services stay maintainable — single responsibility per service, stable interfaces, dependency inversion via APIs.',
    mechanism:
      'In SD interviews: decompose by domain capability (SRP). Extend via new services not fat classes (OCP). Interface contracts between teams (DIP). Bounded contexts prevent tight coupling.',
    example:
      'Uber: separate Location, Matching, Trip, Payment services. Payment team exposes charge API — Trip service never touches card data directly (interface segregation).',
    qa: [
      ['SOLID in microservices?', 'Each service one business capability; communicate via events/APIs not shared DB.'],
      ['When monolith OK?', 'Early MVP — still apply module boundaries inside monolith for later split.'],
      ['Anti-pattern?', 'Distributed monolith — many services deployed together sharing DB schema.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/uber-rides', label: 'Uber / Rides', why: 'service split' },
      { href: '/cheat-sheets/system-design/payment-system', label: 'Payment System', why: 'isolated PCI boundary' },
      { href: '/cheat-sheets/system-design/google-docs', label: 'Google Docs', why: 'editor vs storage' },
    ],
    checklist: ['Service boundaries', 'Stable APIs', 'No shared mutable DB across domains', 'MVP vs microservices trade-off'],
    tags: ['solid', 'architecture', 'microservices'],
    videos: ['yE3O28E38_E', 'cTMomjk1iRc'],
  },
  {
    slug: 'cdc',
    title: 'CDC (Change Data Capture)',
    summary: 'Streams row-level database changes to downstream systems — search indexes, warehouses, caches — without dual-write bugs.',
    mechanism:
      'Read DB transaction log (Debezium, Maxwell). Emit insert/update/delete events to Kafka. Consumers update Elasticsearch, Redis, analytics. Ordering per primary key.',
    example:
      'Product catalog: PostgreSQL is source of truth. CDC stream updates Elasticsearch for search and Redis for featured products — no app-level double write.',
    qa: [
      ['CDC vs application events?', 'CDC captures all DB changes including admin fixes; domain events only what app publishes.'],
      ['Lag handling?', 'Monitor consumer lag; scale consumers; idempotent upsert in search index.'],
      ['Deletes?', 'CDC tombstone events must delete from search index too.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/gmail-search', label: 'Gmail Search', why: 'index sync' },
      { href: '/cheat-sheets/system-design/distributed-search', label: 'Distributed Search', why: 'index pipeline' },
      { href: '/cheat-sheets/system-design/google-realtime-analytics', label: 'Google Analytics', why: 'event pipelines' },
    ],
    checklist: ['Log-based CDC', 'Ordering per key', 'Delete handling', 'Lag monitoring', 'vs dual write'],
    tags: ['cdc', 'kafka', 'data-pipeline'],
    videos: ['P3FKlI86t3Q', '612Y0jXmWKk'],
  },
  {
    slug: 'event-driven-architecture',
    title: 'Event-Driven Architecture',
    summary: 'Services communicate by publishing facts (events) — loose coupling, async scaling, and natural audit trails.',
    mechanism:
      'Event producer emits immutable event (OrderCreated). Multiple consumers react independently. Event bus (Kafka) stores history. Choreography vs orchestration for multi-step flows.',
    example:
      'Order placed → inventory reserved, payment charged, email sent, analytics updated — four consumers on OrderCreated without order service calling each synchronously.',
    qa: [
      ['Events vs commands?', 'Events are facts (past tense); commands request action — different retry semantics.'],
      ['Orchestration vs choreography?', 'Orchestrator coordinates saga steps; choreography each service listens and reacts — more decoupled but harder to trace.'],
      ['Event versioning?', 'Add fields compatibly; consumers ignore unknown fields; use schema registry.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/notification-system', label: 'Notifications', why: 'event triggers' },
      { href: '/cheat-sheets/system-design/payment-system', label: 'Payment System', why: 'outbox events' },
      { href: '/cheat-sheets/system-design/news-feed', label: 'News Feed', why: 'fan-out events' },
    ],
    checklist: ['Event naming', 'Choreography vs orchestration', 'Schema evolution', 'Idempotent consumers'],
    tags: ['events', 'kafka', 'eda'],
    videos: ['P3FKlI86t3Q', 'yE3O28E38_E'],
  },
  {
    slug: 'serverless',
    title: 'Serverless Architecture',
    summary: 'Run functions or containers on demand — no server management, auto-scale to zero, pay per invocation.',
    mechanism:
      'API Gateway → Lambda/Cloud Functions. Cold start latency trade-off. State in external DB/S3. Good for bursty, event-triggered work. Limit execution time and memory.',
    example:
      'Image thumbnail on upload: S3 event triggers Lambda, generates sizes, writes back to S3. Zero cost when no uploads; scales automatically on viral spike.',
    qa: [
      ['Cold start problem?', 'Provisioned concurrency, smaller runtimes (Go/Rust), or warm pools for latency-sensitive paths.'],
      ['When not serverless?', 'Long-running streams, WebSocket chat rooms, steady high QPS GPU inference.'],
      ['Stateless rule?', 'All state in DynamoDB/S3; function instance is ephemeral.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/instagram-photos', label: 'Instagram', why: 'thumbnail workers' },
      { href: '/cheat-sheets/system-design/notification-system', label: 'Notifications', why: 'email workers' },
      { href: '/cheat-sheets/system-design/google-photos-duplicate', label: 'Google Photos Duplicate', why: 'batch jobs' },
    ],
    checklist: ['Trigger source', 'Cold start awareness', 'State externalized', 'Timeout limits', 'Cost model'],
    tags: ['serverless', 'lambda', 'cloud'],
    videos: ['612Y0jXmWKk', 'Y1qxI-Df4Lk'],
  },
  {
    slug: 'inverted-indexing',
    title: 'Inverted Indexing',
    summary: 'Maps terms to document IDs — foundation of full-text search, autocomplete, and log analytics.',
    mechanism:
      'Tokenizer splits text → terms. Each term points to postings list (doc_id, positions). Query intersects posting lists. BM25 scores relevance. Segments immutable for fast search.',
    example:
      'Gmail search: index email body + headers. Query "invoice amazon" intersects posting lists for both terms, ranks by recency and term frequency.',
    qa: [
      ['Inverted vs forward index?', 'Forward: doc → terms. Inverted: term → docs. Search needs inverted.'],
      ['Why segments?', 'Immutable segments allow concurrent search during background merges.'],
      ['Prefix search?', 'Edge n-grams or dedicated trie/autocomplete index alongside inverted index.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/distributed-search', label: 'Distributed Search', why: 'core index' },
      { href: '/cheat-sheets/system-design/typeahead', label: 'Typeahead', why: 'prefix lookup' },
      { href: '/cheat-sheets/system-design/gmail-search', label: 'Gmail Search', why: 'mail index' },
    ],
    checklist: ['Term → postings', 'BM25 intuition', 'Segment merges', 'Prefix vs full-text'],
    tags: ['search', 'elasticsearch', 'indexing'],
    videos: ['612Y0jXmWKk', 'cTMomjk1iRc'],
  },
  {
    slug: 'websocket',
    title: 'WebSocket',
    summary: 'Persistent bidirectional TCP connection — low-latency push for chat, live maps, gaming, and streaming tokens.',
    mechanism:
      'HTTP upgrade handshake. Server pushes without client polling. Connection state per socket — needs sticky routing or shared pub/sub backplane (Redis) across servers.',
    example:
      'WhatsApp Web: WebSocket to chat server. Message arrives → push to recipient sockets subscribed to room channel via Redis pub/sub between nodes.',
    qa: [
      ['WebSocket vs SSE?', 'WebSocket bidirectional; SSE server→client only, simpler over HTTP/2.'],
      ['Scale WebSockets?', 'Millions of connections: connection registry sharded, pub/sub bridge between nodes, LB with TCP pass-through.'],
      ['Reconnect?', 'Client resubscribes with last_seen message_id; server replays missed from short buffer.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/chat-system', label: 'WhatsApp & Chat', why: 'real-time messages' },
      { href: '/cheat-sheets/system-design/uber-rides', label: 'Uber / Rides', why: 'live map' },
      { href: '/cheat-sheets/system-design/chatgpt-system', label: 'ChatGPT System', why: 'token streaming' },
    ],
    checklist: ['Upgrade handshake', 'Pub/sub backplane', 'Sticky vs shared state', 'Reconnect + replay'],
    tags: ['websocket', 'real-time', 'push'],
    videos: ['yE3O28E38_E', '612Y0jXmWKk'],
  },
  {
    slug: 'rate-limiting',
    title: 'Rate Limiting',
    summary: 'Caps request rate per client/API key/IP to protect services, ensure fairness, and prevent abuse.',
    mechanism:
      'Algorithms: token bucket (allows burst), leaky bucket (smooth), sliding window (accurate). Store counters in Redis with TTL. Return 429 + Retry-After header.',
    example:
      'Public API: 1000 req/min per API key. Redis INCR with sliding window per key. Gateway rejects before hitting expensive backend; monetize higher tiers.',
    qa: [
      ['Token bucket vs fixed window?', 'Fixed window has burst at window edges; sliding window or token bucket smoother.'],
      ['Distributed rate limit?', 'Central Redis cluster or approximate per-node limits with sync — trade accuracy vs speed.'],
      ['Rate limit vs throttle?', 'Limit rejects; throttle queues or delays excess requests.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/rate-limiter', label: 'Rate Limiter', why: 'full design' },
      { href: '/cheat-sheets/system-design/api-gateway', label: 'API Gateway', why: 'edge enforcement' },
      { href: '/cheat-sheets/system-design/chatgpt-system', label: 'ChatGPT System', why: 'token quotas' },
    ],
    checklist: ['Algorithm named', '429 response', 'Redis counter pattern', 'Burst handling', 'Per-tenant fairness'],
    tags: ['rate-limiting', 'api', 'redis'],
    videos: ['cTMomjk1iRc', 'P3FKlI86t3Q'],
  },
  {
    slug: 'data-warehouse',
    title: 'Data Warehouse',
    summary: 'Column-oriented analytics store for OLAP — aggregations across billions of rows, not transactional OLTP.',
    mechanism:
      'ETL/ELT pipelines load events from OLTP into warehouse (BigQuery, Snowflake, Redshift). Star schema: fact tables + dimension tables. Partition by date for prune.',
    example:
      'Google Trends: billions of search events land in BigQuery. Analysts query daily aggregates by region and term — separate from live search serving path.',
    qa: [
      ['Warehouse vs lake?', 'Warehouse structured schema + SQL; data lake raw files (S3) + schema-on-read.'],
      ['OLTP vs OLAP?', 'OLTP many small transactional writes; OLAP large scan aggregations — different engines.'],
      ['Real-time analytics?', 'Lambda architecture: speed layer (Flink) + batch layer (warehouse) merged at query.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/google-trends', label: 'Google Trends', why: 'aggregate queries' },
      { href: '/cheat-sheets/system-design/google-realtime-analytics', label: 'Real-time Analytics', why: 'lambda arch' },
      { href: '/cheat-sheets/data-engineering/spark', label: 'Apache Spark', why: 'batch processing' },
    ],
    checklist: ['OLTP vs OLAP', 'Partition strategy', 'ETL vs ELT', 'Star schema basics'],
    tags: ['warehouse', 'analytics', 'bigquery'],
    videos: ['612Y0jXmWKk', 'Y1qxI-Df4Lk'],
  },
  {
    slug: 'bloom-filter',
    title: 'Bloom Filter',
    summary: 'Space-efficient probabilistic set — answers "possibly in set" or "definitely not" with tunable false-positive rate.',
    mechanism:
      'Multiple hash functions set bits in bit array. Lookup: all bits set → maybe present. Any bit zero → definitely absent. No false negatives for standard insert-only use.',
    example:
      'Web crawler: Bloom filter of seen URLs avoids redundant fetches — 1% false positive just re-crawls a few duplicates, saves 90% DB lookups.',
    qa: [
      ['Can Bloom filter delete?', 'Standard no; counting Bloom or secondary structure needed.'],
      ['False positive rate?', 'More bits + more hash functions → lower FP rate, more memory.'],
      ['vs Hash set?', 'Bloom far smaller; hash set exact but memory heavy at billions of keys.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/web-crawler', label: 'Web Crawler', why: 'seen URL filter' },
      { href: '/cheat-sheets/system-design/gmail-search', label: 'Gmail Search', why: 'spam pre-filter' },
      { href: '/cheat-sheets/system-design/google-photos-duplicate', label: 'Google Photos Duplicate', why: 'candidate filter' },
    ],
    checklist: ['No false negatives (insert-only)', 'FP rate trade-off', 'Memory math', 'Use case vs exact set'],
    tags: ['bloom-filter', 'probabilistic', 'crawler'],
    videos: ['P3FKlI86t3Q', '612Y0jXmWKk'],
  },
  {
    slug: 'hyperloglog',
    title: 'HyperLogLog',
    summary: 'Estimates cardinality (unique count) in fixed memory — billions of unique visitors with ~1% error.',
    mechanism:
      'Hash values into registers; estimate unique count from bit patterns. Redis PFADD/PFCOUNT. Mergeable across nodes for distributed unique counts.',
    example:
      'Unique daily viewers per video: HyperLogLog per video_id instead of storing every viewer_id — 12KB per video vs GB of sets.',
    qa: [
      ['HLL vs exact set?', 'HLL approximate; exact set accurate but memory explodes at scale.'],
      ['Merge HLL?', 'Union of sketches estimates unique across shards — global UV from regional counts.'],
      ['vs Bloom filter?', 'Bloom membership test; HLL cardinality estimate — different questions.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/shared-counter', label: 'Shared Counter', why: 'unique viewers' },
      { href: '/cheat-sheets/system-design/youtube-streaming', label: 'YouTube', why: 'view metrics' },
      { href: '/cheat-sheets/system-design/google-realtime-analytics', label: 'Real-time Analytics', why: 'UV estimates' },
    ],
    checklist: ['Approximate cardinality', 'Fixed memory', 'PFMERGE across shards', 'Error ~1-2%'],
    tags: ['hyperloglog', 'cardinality', 'redis'],
    videos: ['Y1qxI-Df4Lk', '612Y0jXmWKk'],
  },
  {
    slug: 'forward-reverse-proxy',
    title: 'Forward & Reverse Proxy',
    summary: 'Forward proxy acts for clients (hide identity, filter). Reverse proxy acts for servers (LB, TLS, cache, WAF).',
    mechanism:
      'Forward: corporate proxy, VPN. Reverse: client thinks it talks to one server; nginx/ALB routes to fleet. Reverse proxy enables SSL, compression, rate limit at edge.',
    example:
      'All traffic to api.example.com hits nginx reverse proxy → routes /payments to payment cluster, /search to search cluster, blocks admin paths.',
    qa: [
      ['Reverse proxy vs API gateway?', 'Gateway adds auth, composition, developer portal; reverse proxy more transport-focused — often layered together.'],
      ['Forward proxy use?', 'Outbound filtering, geo bypass, developer debugging (Charles).'],
      ['CDN is reverse proxy?', 'Yes — edge reverse proxy caching static and cacheable responses.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/api-gateway', label: 'API Gateway', why: 'reverse proxy + logic' },
      { href: '/cheat-sheets/system-design/web-crawler', label: 'Web Crawler', why: 'forward proxy pools' },
      { href: '/cheat-sheets/system-design/chrome-malware-detection', label: 'Chrome Malware', why: 'safe browsing proxy' },
    ],
    checklist: ['Forward vs reverse defined', 'SSL termination', 'Path-based routing', 'CDN relationship'],
    tags: ['proxy', 'nginx', 'edge'],
    videos: ['yE3O28E38_E', '612Y0jXmWKk'],
  },
  {
    slug: 'quadtree-geohashing',
    title: 'Quadtree & Geohashing',
    summary: 'Spatial indexes for nearby search — split map into cells (quadtree) or encode lat/lng as string prefix (geohash).',
    mechanism:
      'Quadtree recursively subdivides until cell has few POIs. Geohash: lat/lng → base32 string; neighbors share prefix. Redis GEO uses geohash internally. S2 used at Google.',
    example:
      'Yelp nearby: query geohash cells covering search circle, fetch POI IDs, rank by distance. Uber: quadtree index for driver locations updated every second.',
    qa: [
      ['Geohash vs quadtree?', 'Geohash simple prefix queries; quadtree adaptive density for uneven POI distribution.'],
      ['Edge cases?', 'Geohash distortion near poles; S2 cells more uniform globally.'],
      ['Redis GEORADIUS?', 'Uses geohash-encoded sorted set — practical interview answer for proximity MVP.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/google-maps', label: 'Google Maps', why: 'spatial tiles' },
      { href: '/cheat-sheets/system-design/uber-rides', label: 'Uber / Rides', why: 'driver index' },
      { href: '/cheat-sheets/system-design/proximity-service', label: 'Proximity Service', why: 'nearby POI' },
    ],
    checklist: ['Geohash prefix search', 'Quadtree split rule', 'Redis Geo mention', 'S2 at scale'],
    tags: ['geohash', 'quadtree', 'geospatial'],
    videos: ['612Y0jXmWKk', 'yE3O28E38_E'],
  },
  {
    slug: 'distributed-transaction',
    title: 'Distributed Transaction',
    summary: 'Coordinates writes across multiple services/stores — 2PC for strong consistency or sagas for eventual consistency.',
    mechanism:
      '2PC: prepare + commit coordinator — blocks on failure. Saga: sequence of local transactions with compensating actions (cancel shipment if payment fails). Outbox ensures reliable event publish.',
    example:
      'Ticket booking: reserve seat (DB lock) + charge card (PSP). Saga: if charge fails, release seat compensating transaction. Avoid global 2PC across PSP and DB.',
    qa: [
      ['2PC problems?', 'Blocking, coordinator failure, not across heterogeneous systems well.'],
      ['Saga orchestration?', 'Central coordinator tracks steps; choreography uses events — pick based on visibility needs.'],
      ['Exactly-once illusion?', 'At-least-once + idempotent steps + dedupe keys = practical exactly-once business effect.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/ticket-booking', label: 'Ticket Booking', why: 'seat + payment' },
      { href: '/cheat-sheets/system-design/payment-system', label: 'Payment System', why: 'ledger + PSP' },
      { href: '/cheat-sheets/system-design/uber-rides', label: 'Uber / Rides', why: 'trip + payment saga' },
    ],
    checklist: ['2PC vs saga', 'Compensating actions', 'Idempotent steps', 'Outbox for events'],
    tags: ['saga', '2pc', 'transactions'],
    videos: ['qcIQKYGvdgk', 'cTMomjk1iRc'],
  },
  {
    slug: 'vector-db',
    title: 'Vector Database',
    summary: 'Stores embedding vectors and retrieves nearest neighbors — powers semantic search, RAG, and recommendations.',
    mechanism:
      'Embed text/image to float vector. Index with HNSW or IVF for approximate nearest neighbor. Query embed → top-K similar vectors → fetch original documents.',
    example:
      'RAG chatbot: chunk docs, embed, store in Pinecone. User question embedded → top-5 chunks retrieved → fed to LLM context window.',
    qa: [
      ['Vector DB vs Elasticsearch?', 'Vector DB optimized ANN on embeddings; ES adding vector but inverted index is lexical core.'],
      ['Same model for index and query?', 'Yes — dimension and semantic space must match.'],
      ['Metadata filters?', 'Pre-filter by tenant_id then vector search — common production pattern.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/ai/rag', label: 'RAG', why: 'retrieval layer' },
      { href: '/cheat-sheets/system-design/chatgpt-system', label: 'ChatGPT System', why: 'plugin search' },
      { href: '/cheat-sheets/system-design/google-photos-duplicate', label: 'Google Photos Duplicate', why: 'similarity' },
    ],
    checklist: ['Embedding pipeline', 'ANN index type', 'top-K recall', 'Metadata filters', 'Same model index/query'],
    tags: ['vector-db', 'embeddings', 'rag'],
    videos: ['612Y0jXmWKk', '9Ppg8NLk4NE'],
  },
  {
    slug: 'outbox-pattern',
    title: 'Outbox Pattern',
    summary: 'Writes domain event to same DB transaction as business data — reliable publish to message bus without dual-write bugs.',
    mechanism:
      'INSERT order + INSERT outbox row in one transaction. Poller or CDC reads outbox, publishes to Kafka, marks sent. Guarantees at-least-once delivery to bus.',
    example:
      'Payment captured: update payment row + outbox event PaymentCaptured in PostgreSQL commit. Worker publishes to Kafka for email receipt and analytics.',
    qa: [
      ['Outbox vs dual write?', 'Dual write DB then Kafka can fail between — outbox atomic in one transaction.'],
      ['Polling vs CDC?', 'CDC lower latency; polling simpler with indexed outbox table.'],
      ['Duplicate publish?', 'Consumers idempotent on event_id.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/payment-system', label: 'Payment System', why: 'webhooks' },
      { href: '/cheat-sheets/system-design/notification-system', label: 'Notifications', why: 'trigger events' },
      { href: '/cheat-sheets/system-design/notification-system', label: 'Notifications', why: 'reliable emit' },
    ],
    checklist: ['Same transaction', 'Poller or CDC', 'Idempotent consumers', 'vs dual write failure'],
    tags: ['outbox', 'reliability', 'kafka'],
    videos: ['P3FKlI86t3Q', 'yE3O28E38_E'],
  },
  {
    slug: 'materialized-view',
    title: 'Materialized View',
    summary: 'Precomputed query result stored as table — fast reads for dashboards, feeds, and aggregates at cost of staleness.',
    mechanism:
      'Periodic or trigger-based refresh. Cassandra feed cells, Redis precomputed home feed, ClickHouse rollup tables. Trade freshness vs read latency.',
    example:
      'Twitter home timeline: materialized inbox per user (fan-out on write). Read = single row fetch, not merge 1000 follows at read time.',
    qa: [
      ['Materialized view vs cache?', 'Materialized view in DB/storage layer with defined refresh; cache ephemeral with TTL.'],
      ['Refresh strategies?', 'On-write incremental, scheduled batch, or stream processing (Flink).'],
      ['Stale reads?', 'State acceptable staleness SLA — "timeline few seconds behind".'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/twitter-timeline', label: 'Twitter', why: 'timeline inbox' },
      { href: '/cheat-sheets/system-design/news-feed', label: 'News Feed', why: 'ranked feed cells' },
      { href: '/cheat-sheets/system-design/google-trends', label: 'Google Trends', why: 'daily rollups' },
    ],
    checklist: ['Precompute vs on-read', 'Refresh trigger', 'Staleness SLA', 'Incremental update'],
    tags: ['materialized-view', 'aggregation', 'feed'],
    videos: ['yE3O28E38_E', '612Y0jXmWKk'],
  },
  {
    slug: 'perceptual-hash',
    title: 'Perceptual Hash',
    summary: 'Fingerprint images/audio that are similar visually — detects near-duplicates despite resize, compression, or minor edits.',
    mechanism:
      'pHash, dHash reduce image to compact hash where similar images have close hamming distance. Compare hashes in buckets — not cryptographic security.',
    example:
      'Google Photos duplicate detection: perceptual hash of each photo → bucket similar hashes → ML refine duplicates for "same moment" suggestions.',
    qa: [
      ['Perceptual vs SHA256?', 'SHA changes completely on 1-bit flip; perceptual similar images → similar hashes.'],
      ['Hamming distance threshold?', 'Tune distance ≤ N as duplicate candidate; false positives need second-stage model.'],
      ['Video duplicates?', 'Hash per frame or keyframes; temporal alignment for clips.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/google-photos-duplicate', label: 'Google Photos Duplicate', why: 'core algo' },
      { href: '/cheat-sheets/system-design/instagram-photos', label: 'Instagram', why: 'CSAM/near-dup detection' },
      { href: '/cheat-sheets/system-design/chrome-malware-detection', label: 'Chrome Malware', why: 'binary similarity' },
    ],
    checklist: ['Near-duplicate not cryptographic', 'Hamming distance', 'Second-stage ML', 'Scale via bucketing'],
    tags: ['perceptual-hash', 'images', 'dedup'],
    videos: ['Y1qxI-Df4Lk', '612Y0jXmWKk'],
  },
  {
    slug: 'trie',
    title: 'Trie Data Structure',
    summary: 'Prefix tree for strings — O(key length) lookup powers autocomplete, IP routing, and typeahead.',
    mechanism:
      'Each node is a character or edge label. Path from root spells prefix. Terminal node marks complete word. Compressed trie (DAWG) saves memory for static dictionaries.',
    example:
      'Google search typeahead: trie of popular queries per locale. User types "sys" → traverse to node → collect top completions by weight.',
    qa: [
      ['Trie vs hash table?', 'Trie excels at prefix search; hash only exact key match.'],
      ['Memory at scale?', 'DAWG compression, shard trie by first character, or backend Elasticsearch completion suggester.'],
      ['Weighted trie?', 'Store frequency at terminal nodes; heap of top-K at prefix node for fast autocomplete.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/typeahead', label: 'Typeahead', why: 'prefix completion' },
      { href: '/cheat-sheets/system-design/gmail-search', label: 'Gmail Search', why: 'contact suggest' },
      { href: '/cheat-sheets/system-design/google-trends', label: 'Google Trends', why: 'query suggestions' },
    ],
    checklist: ['Prefix traversal', 'Top-K at node', 'Memory compression', 'vs inverted index prefix'],
    tags: ['trie', 'typeahead', 'autocomplete'],
    videos: ['cTMomjk1iRc', '612Y0jXmWKk'],
  },
  {
    slug: 'lambda-architecture',
    title: 'Lambda Architecture',
    summary: 'Batch layer (accurate, slow) + speed layer (real-time, approximate) + serving layer merging both for analytics.',
    mechanism:
      'Immutable event log (Kafka). Speed: Flink/Spark Streaming updates real-time views. Batch: nightly Spark job recomputes truth. Query merges batch + speed results for complete picture.',
    example:
      'Google Analytics real-time: streaming layer shows last 30 min active users; batch layer corrects counts overnight including late-arriving events.',
    qa: [
      ['Lambda vs Kappa?', 'Kappa: single stream processing retriggers on new code — simpler if replay affordable.'],
      ['Complexity cost?', 'Two pipelines to maintain; many teams move to unified stream-batch (Flink).'],
      ['Late data?', 'Batch layer reconciles what speed layer missed or approximated.'],
    ],
    usedIn: [
      { href: '/cheat-sheets/system-design/google-realtime-analytics', label: 'Google Real-time Analytics', why: 'speed + batch' },
      { href: '/cheat-sheets/system-design/google-trends', label: 'Google Trends', why: 'rollup pipeline' },
      { href: '/cheat-sheets/data-engineering/spark', label: 'Apache Spark', why: 'batch layer' },
    ],
    checklist: ['Speed vs batch layer', 'Immutable log', 'Merge at query', 'Late event handling', 'Kappa alternative'],
    tags: ['lambda', 'analytics', 'streaming'],
    videos: ['612Y0jXmWKk', 'P3FKlI86t3Q'],
  },
];
