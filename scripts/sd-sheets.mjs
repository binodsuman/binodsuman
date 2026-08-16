import {
  buildSDPages,
  note,
  table,
  archDiagram,
  flow,
  layers,
  checklist,
  tags,
  diagram,
} from './sheet-helpers.mjs';
import { extraSdConfigs } from './sd-sheets-extra.mjs';

const baseSdConfigs = [
  // ─── 1. URL Shortener ───────────────────────────────────────────────
  {
    slug: 'url-shortener',
    title: 'Design URL Shortener',
    subtitle: 'bit.ly / TinyURL — hash or counter IDs, redirects, analytics, and collision handling at billions of clicks.',
    tip: 'Clarify read vs write ratio first (typically 100:1). Redirect path must be &lt;100ms — cache hot URLs. Mention base62 encoding and 302 vs 301.',
    prompt: `You are a senior staff engineer conducting a 45-minute system design interview. The candidate must design a URL shortener like bit.ly or TinyURL.

Start by asking them to clarify functional requirements (shorten, redirect, optional custom alias, expiration, analytics) and non-functional requirements (availability, latency, uniqueness). Push them to estimate scale: assume 100M new URLs/month, 10:1 read-to-write ratio, and 5-year retention.

Guide them through: API design, ID generation strategy (counter vs hash), database schema, caching layer for redirects, CDN placement, and async analytics pipeline. Ask them to draw a high-level architecture diagram with separate read and write paths.

Probe on collision handling, custom slug conflicts, hot-key problems on viral links, and geographic distribution. Discuss trade-offs between SQL and NoSQL, 301 vs 302 redirects, and eventual consistency for click counts.

Give hints only when stuck. Score on structured thinking, back-of-envelope math, depth on the redirect hot path, and awareness of failure modes. End with one follow-up: "How would you support 10× traffic overnight?"`,
    functional: [
      'Given a long URL, return a unique short code (e.g. <code>abc12X</code>)',
      'Redirect <code>GET /{code}</code> → original long URL (HTTP 302 or 301)',
      'Optional custom alias if not taken (e.g. <code>/go/sale</code>)',
      'Optional expiration date per short link',
      'Click analytics: count + timestamp + referrer (async, not on critical path)',
      'Authenticated users can list and delete their links',
    ],
    nonFunctional: [
      'Redirect latency p99 &lt; 100ms globally',
      '99.99% availability on read path',
      'Short codes must be globally unique',
      'Durable storage — no lost mappings',
      'Horizontally scalable writes (~40 URLs/sec avg, spikes 10×)',
    ],
    outOfScope: [
      'User authentication / OAuth (mention API keys only)',
      'Malware scanning of destination URLs',
      'Full-text search across all shortened URLs',
      'Editing long URL after creation',
    ],
    scale: [
      '100M new URLs/month → ~40 writes/sec avg, ~400/sec peak',
      'Read:write ratio 10:1 → ~400 reads/sec avg, ~4K/sec peak',
      'Avg long URL ~2 KB metadata; 5-year retention → ~6B URLs',
      'Storage: 6B × (8B code + 2KB URL + metadata) ≈ 12 TB+',
      'Redirect bandwidth: 4K RPS × 500B response ≈ 2 MB/s (tiny — CPU/cache bound)',
      'Analytics: 4K clicks/sec → ~350M events/day → Kafka → columnar store',
    ],
    scaleNote:
      'The read path dominates cost and engineering focus. Cache the top 20% of codes (Pareto) in Redis + CDN edge to serve ~80% of redirects without hitting origin DB.',
    architecture:
      archDiagram('URL Shortener — read/write split', [
        [
          { text: 'Clients / Browsers', class: 'gray' },
          { text: 'Mobile Apps', class: 'gray' },
        ],
        [
          { text: 'CDN / Edge Cache (redirects)', class: 'purple' },
          { text: 'Load Balancer', class: '' },
        ],
        [
          { text: 'API Servers (create, manage)', class: '' },
          { text: 'Redirect Servers (lookup)', class: 'green' },
        ],
        [
          { text: 'Redis Cache (hot codes)', class: 'orange' },
          { text: 'Primary DB (code ↔ URL)', class: 'green' },
          { text: 'ID Generator (Snowflake / counter)', class: 'purple' },
        ],
        [
          { text: 'Kafka → Click Analytics DB', class: 'gray' },
        ],
      ]) +
      flow([
        { text: 'POST /shorten', class: 'gray' },
        { text: 'Generate ID', class: '' },
        { text: 'Persist mapping', class: 'purple' },
        { text: 'Return short URL', class: 'green' },
      ]),
    archNotes:
      'Separate redirect fleet from API fleet — redirects are cache-friendly and need different autoscaling. Use 302 for flexibility (change destination); 301 only if permanent and SEO matters.',
    apis: [
      ['POST /api/v1/urls', 'Create short URL', 'Body: {longUrl, customAlias?, expiresAt?} → 201 {shortUrl, code}'],
      ['GET /{code}', 'Redirect', '302 to long URL; 404 if expired/missing; cache headers for CDN'],
      ['GET /api/v1/urls/{code}/stats', 'Analytics', 'Auth required; returns click count, time series'],
      ['DELETE /api/v1/urls/{code}', 'Delete mapping', 'Soft-delete + cache invalidation'],
      ['GET /api/v1/urls?userId=', 'List user links', 'Paginated; cursor-based'],
    ],
    dataModel: note(
      `<strong>urls</strong> table: <code>id</code> (PK bigint), <code>short_code</code> (unique index, 7 chars base62), <code>long_url</code> (varchar 2048), <code>user_id</code>, <code>created_at</code>, <code>expires_at</code>, <code>is_active</code><br><br>` +
        `<strong>clicks</strong> (analytics): <code>code</code>, <code>timestamp</code>, <code>referrer</code>, <code>country</code> — partitioned by day in ClickHouse/BigQuery`
    ),
    storage: [
      ['PostgreSQL / Cassandra', 'URL mappings', 'Strong uniqueness on short_code; Cassandra if write scale exceeds single-shard SQL'],
      ['Redis Cluster', 'Hot redirect cache', 'TTL 24h; cache-aside on miss; pub/sub invalidation on delete'],
      ['S3 + CDN', 'Static redirect responses (optional)', 'Edge workers for ultra-low-latency redirects at scale'],
      ['Kafka + ClickHouse', 'Click stream', 'Append-only; batch ingest; rollups for dashboards'],
    ],
    deepDives: [
      {
        title: 'ID generation — counter vs hash',
        body:
          note(
            `<strong>Counter + Base62:</strong> Distributed ID service (Snowflake-style: timestamp + machine ID + sequence) guarantees uniqueness without DB round-trip for collision check. 7 base62 chars = 62⁷ ≈ 3.5 trillion codes — plenty for 6B URLs. Pros: no collisions, sortable by time. Cons: predictable (security through obscurity weak — use random suffix if needed).`
          ) +
          note(
            `<strong>Hash (MD5/SHA truncated):</strong> Hash long URL + salt → first 7 chars. Pros: same long URL → same short URL (dedup). Cons: collisions require probing or lengthening code; not sequential. Use bloom filter + DB check on write.`
          ),
      },
      {
        title: 'Redirect hot path optimization',
        body:
          note(
            `On <code>GET /{code}</code>: (1) Check CDN edge — if cached 302, return immediately. (2) Check local Redis — sub-ms. (3) DB lookup on miss; populate Redis + CDN. Set <code>Cache-Control: max-age=3600</code> for popular links. Viral link mitigation: singleflight pattern — only one DB query per cache miss storm.`
          ) +
          note(
            `Geo-routing: anycast DNS to nearest redirect POP. For global 100ms p99, edge compute (Cloudflare Workers) can hold top-10K codes in KV store updated via pub/sub from origin.`
          ),
      },
      {
        title: 'Analytics pipeline (off critical path)',
        body:
          note(
            `Redirect server fires async event to Kafka: <code>{code, ts, ip_hash, referrer, ua}</code>. No synchronous write to analytics DB on redirect — would kill latency. Consumers aggregate into hourly rollups in ClickHouse. Display "approximate" counts with ±1% freshness lag acceptable for dashboards.`
          ) +
          note(
            `Privacy: hash IPs, truncate referrer, GDPR delete propagates to analytics store via compaction jobs.`
          ),
      },
      {
        title: 'Custom alias & expiration',
        body:
          note(
            `Custom alias: check uniqueness in DB with unique index; reserve abusive words via blocklist. Expiration: lazy delete on read (if expired → 410 Gone) + nightly cron to purge + invalidate cache. TTL index in Redis mirrors DB expiration for hot codes.`
          ),
      },
    ],
    tradeoffs: [
      ['ID strategy', 'Monotonic counter', 'Hash of URL', 'Counter for scale; hash if dedup matters'],
      ['Redirect code', '302 Found', '301 Moved Permanently', '302 default; 301 only for permanent marketing links'],
      ['Database', 'PostgreSQL', 'Cassandra', 'PG until ~10K writes/sec; Cassandra for global multi-DC'],
      ['Cache invalidation', 'TTL only', 'Delete on write', 'TTL for simplicity; delete-on-write for correctness'],
      ['Analytics', 'Real-time stream', 'Batch hourly', 'Stream for dashboards; batch cheaper at huge scale'],
    ],
    script: [
      '0–5 min: Clarify functional + non-functional requirements; confirm analytics and custom aliases',
      '5–10 min: Back-of-envelope — writes/sec, reads/sec, storage for 5 years',
      '10–20 min: High-level diagram — API, redirect, DB, cache, CDN; separate read/write paths',
      '20–30 min: Deep dive ID generation and redirect hot path with latency budget',
      '30–38 min: Data model, API contracts, analytics async pipeline',
      '38–42 min: Trade-offs — 302 vs 301, SQL vs NoSQL, cache strategy',
      '42–45 min: Failure modes — DB down (serve from cache), hot key, ID collision',
    ],
    followUps: [
      ['What if two users want the same custom alias?', 'First-write-wins; DB unique constraint returns 409 Conflict'],
      ['How handle a viral link hitting one Redis shard?', 'Local in-process cache + CDN; replicate hot key to all nodes; singleflight on miss'],
      ['301 vs 302?', '302 allows changing destination and avoids SEO credit transfer; 301 caches aggressively at browsers'],
      ['How to prevent abuse (spam URLs)?', 'Rate limit per IP/API key; blocklist domains; optional manual review for custom aliases'],
      ['Multi-region deployment?', 'Cassandra or CockroachDB multi-DC; Redis per region with async replication; CDN handles most reads'],
      ['How to migrate from 6-char to 7-char codes?', 'Dual-read: try 6 then 7; new codes get 7; no migration needed for old'],
    ],
    checklist: [
      'Stated read:write ratio and why read path is optimized',
      'Calculated writes/sec and storage (TB scale)',
      'Chose ID strategy with collision handling',
      'Drew separate redirect vs API path',
      'Redis + CDN on redirect hot path',
      'Analytics async (not blocking redirect)',
      'API: POST shorten, GET redirect, optional stats',
      'Discussed 302 vs 301 trade-off',
      'Custom alias uniqueness constraint',
      'Failure mode: DB down, cache stampede',
    ],
    tags: ['caching', 'CDN', 'hashing', 'read-heavy', 'analytics'],
  },

  // ─── 2. Rate Limiter ────────────────────────────────────────────────
  {
    slug: 'rate-limiter',
    title: 'Design Rate Limiter',
    subtitle: 'Protect APIs with token bucket, sliding window, or leaky bucket — per user, IP, or API key across distributed servers.',
    tip: 'Compare algorithms with a table. Mention Redis INCR + TTL, Lua scripts for atomicity, and returning 429 with Retry-After header.',
    prompt: `You are a senior backend engineer running a 45-minute system design interview. The candidate must design a distributed rate limiter for a public API platform serving thousands of microservices.

Begin with requirements: limit requests per client identity (API key, user ID, or IP), configurable rules (e.g. 1000 req/min), distributed across 100+ API gateway nodes, low overhead (&lt;5ms), and standard 429 responses with Retry-After.

Walk them through algorithm choices (fixed window, sliding window, token bucket, leaky bucket), data structures, and where the limiter sits (edge gateway vs sidecar vs middleware). Ask for back-of-envelope: 1M API keys, 50K RPS aggregate, rules updated without redeploy.

Require a diagram showing API servers, rate limiter service, and shared store (Redis). Deep dive on race conditions in distributed environment, clock skew, and burst handling.

Challenge with: different limits per endpoint tier, global vs per-region limits, and behavior when Redis is unavailable (fail open vs closed). Evaluate clarity of algorithm explanation and production operability.`,
    functional: [
      'Define rules: {identifier, limit, window} e.g. 100 req/min per API key',
      'On each request, return allow or deny before reaching backend',
      'Support multiple rule dimensions: per key, per IP, per endpoint',
      'Return HTTP 429 with Retry-After header when throttled',
      'Admin API to create/update/delete rules at runtime',
      'Expose metrics: throttle rate, top offenders',
    ],
    nonFunctional: [
      'Decision latency &lt; 5ms p99 added to request path',
      'Accurate across all gateway nodes (distributed consistency)',
      'Highly available — limiter failure should not take down API',
      'Support 50K+ RPS checks across cluster',
      'Memory efficient — millions of keys with sparse activity',
    ],
    outOfScope: [
      'DDoS protection at network layer (WAF / Cloudflare)',
      'Billing / quota enforcement with payment',
      'Per-payload-size limits (only request count)',
      'ML-based anomaly detection',
    ],
    scale: [
      '50K RPS aggregate across all APIs',
      '1M registered API keys; ~100K active/hour',
      'Average 2 rate-limit checks per request (global + endpoint rule)',
      '100K checks/sec → Redis must handle 100K+ ops/sec',
      'Memory: sliding window log worst case 100 timestamps × 100K keys ≈ 80MB (bounded)',
      'Rules config: ~10K rules, cached in gateway memory, refresh every 30s',
    ],
    scaleNote:
      'Prefer approximate sliding window counter over per-request log storage — 1 Redis key per (identifier, window_bucket) with INCR + EXPIRE uses ~50 bytes per active key.',
    architecture:
      archDiagram('Distributed Rate Limiter', [
        [
          { text: 'Clients', class: 'gray' },
        ],
        [
          { text: 'API Gateway / Envoy (rate limit filter)', class: 'purple' },
        ],
        [
          { text: 'Rate Limiter Service (optional central)', class: '' },
          { text: 'Local LRU Cache (hot keys)', class: 'orange' },
        ],
        [
          { text: 'Redis Cluster (counters)', class: 'green' },
          { text: 'Rules Config Store (etcd / DB)', class: 'gray' },
        ],
        [
          { text: 'Backend Microservices', class: 'green' },
        ],
      ]) +
      flow([
        { text: 'Request', class: 'gray' },
        { text: 'Check local cache', class: '' },
        { text: 'Redis INCR', class: 'purple' },
        { text: 'Allow / 429', class: 'green' },
      ]),
    archNotes:
      'Embed limiter in API gateway (Envoy rate limit service, Kong plugin) to avoid extra hop. Redis Cluster with hash tags per API key for locality. Lua script ensures atomic INCR + compare + TTL.',
    apis: [
      ['Internal: check(key, rule)', 'Allow/deny decision', 'Returns {allowed, remaining, resetAt}; called by gateway middleware'],
      ['POST /admin/rules', 'Create rule', '{scope, identifier_pattern, limit, window_sec, action}'],
      ['GET /admin/rules/{id}', 'Read rule', 'For dashboard'],
      ['GET /metrics/throttled', 'Observability', 'Prometheus: rate_limit_exceeded_total{key, rule}'],
      ['gRPC RateLimitService/ShouldAllow', 'Low-latency check', 'Used by sidecar; batch checks supported'],
    ],
    dataModel: note(
      `<strong>rules:</strong> <code>id</code>, <code>scope</code> (global|key|ip|endpoint), <code>pattern</code>, <code>limit</code>, <code>window_sec</code>, <code>action</code> (reject|queue)<br><br>` +
        `<strong>Redis keys:</strong> <code>rl:{rule_id}:{identifier}:{window_bucket}</code> → integer counter, TTL = window_sec<br><br>` +
        `<strong>Token bucket variant:</strong> <code>rl:tb:{id}</code> → hash {tokens, last_refill_ts}`
    ),
    storage: [
      ['Redis Cluster', 'Request counters', 'Sub-ms; atomic Lua; TTL auto-expires stale keys'],
      ['PostgreSQL / etcd', 'Rule definitions', 'Source of truth; gateways poll or watch changes'],
      ['Local process cache', 'Hot key decisions', '100ms TTL; reduces Redis load 60–80%'],
    ],
    deepDives: [
      {
        title: 'Algorithm comparison',
        body:
          note(
            `<strong>Fixed window:</strong> INCR key <code>rl:user123:1692000000</code> (minute bucket). Simple, 1 Redis op. Flaw: 2× burst at window boundary (100 at 0:59 + 100 at 1:00).`
          ) +
          note(
            `<strong>Sliding window log:</strong> Store sorted set of timestamps per key. Accurate but O(n) memory per key. Use only for strict tiers.`
          ) +
          note(
            `<strong>Sliding window counter:</strong> Weighted avg of current + previous window: <code>count = prev_count × (1 - elapsed/window) + curr_count</code>. ~2 Redis keys, good accuracy, industry standard (Cloudflare, Stripe).`
          ) +
          note(
            `<strong>Token bucket:</strong> Refill tokens at steady rate; allow bursts up to bucket size. Best when burst tolerance is a product requirement. Implement with Redis hash + Lua atomic refill.`
          ),
      },
      {
        title: 'Distributed correctness',
        body:
          note(
            `Race condition: two gateways read count=99, both allow request 100 and 101. Fix: atomic INCR in Redis Lua script — increment first, then compare to limit. Never read-then-write from app code.`
          ) +
          note(
            `Clock skew: use Redis TIME or centralized window buckets keyed by floor(timestamp/window), not local clock. For token bucket, store last_refill in Redis, not gateway.`
          ),
      },
      {
        title: 'Fail-open vs fail-closed',
        body:
          note(
            `<strong>Fail-open</strong> (allow on Redis down): API stays up; risk of abuse during outage. Use for consumer APIs with other protections.`
          ) +
          note(
            `<strong>Fail-closed</strong> (deny on Redis down): safer for paid/premium tiers. Mitigate with local token bucket fallback (conservative limit) when Redis unreachable &gt; 1s.`
          ) +
          note(
            `Hybrid: fail-open for 99% traffic, fail-closed for admin/write endpoints. Circuit breaker on Redis client with half-open retry.`
          ),
      },
      {
        title: 'Performance at 100K checks/sec',
        body:
          note(
            `Batch checks: gateway collects N requests, single Redis pipeline MGET/MINCR. Local cache with stale-while-revalidate — if local says "5 remaining", skip Redis until 0.`
          ) +
          note(
            `Shard Redis by API key hash. Avoid hot keys from shared NAT IPs — use API key over IP when possible; for IP limits, use /24 subnet aggregation.`
          ),
      },
    ],
    tradeoffs: [
      ['Algorithm', 'Fixed window', 'Sliding window counter', 'Fixed for dev; sliding for production APIs'],
      ['Placement', 'Gateway middleware', 'Dedicated sidecar', 'Gateway simpler; sidecar for polyglot meshes'],
      ['Store', 'Redis', 'In-memory only', 'Redis for distributed; local only for single-node dev'],
      ['On Redis failure', 'Fail-open', 'Fail-closed', 'Open for availability; closed for security'],
      ['Burst', 'Token bucket', 'Strict sliding', 'Token bucket if product allows bursts'],
    ],
    script: [
      '0–5 min: Clarify dimensions (key, IP, endpoint), limits, and 429 contract',
      '5–10 min: Compare algorithms — draw timeline of fixed-window edge burst',
      '10–18 min: Architecture — gateway, Redis, rules store; diagram',
      '18–28 min: Deep dive atomic Redis Lua script; sliding window counter math',
      '28–35 min: Fail-open vs closed; local cache layer',
      '35–40 min: Admin API, metrics, rule hot-reload',
      '40–45 min: Scale to 100K checks/sec — pipelining, sharding',
    ],
    followUps: [
      ['Fixed window burst at boundary?', '100 req last second of window + 100 first second = 200 in 2 sec; fix with sliding window'],
      ['How to rate limit by IP behind NAT?', 'Prefer API keys; for IP use X-Forwarded-For carefully; /24 subnet bucketing'],
      ['Different limits per user tier?', 'Rule priority chain: check tier rule first, then global; merge in gateway config'],
      ['Redis down?', 'Local fallback bucket at 50% limit; or fail-open with alert; never silent unlimited'],
      ['Global rate limit across regions?', 'Central Redis (latency cost) or CRDT counters (complex); often per-region + global cap in single DC'],
      ['How to test rate limiter?', 'Chaos: kill Redis; load test boundary; verify 429 Retry-After accuracy'],
    ],
    checklist: [
      'Named 3+ algorithms with pros/cons',
      'Explained fixed-window boundary burst problem',
      'Redis atomic INCR/Lua for distributed correctness',
      '429 + Retry-After response contract',
      'Diagram: gateway → Redis → backend',
      'Fail-open vs fail-closed decision',
      'Local cache to reduce Redis load',
      'Rules admin without redeploy',
      'Memory estimate per active key',
      'Metrics for throttle rate monitoring',
    ],
    tags: ['Redis', 'algorithms', 'API gateway', 'distributed systems'],
  },

  // ─── 3. Chat System ─────────────────────────────────────────────────
  {
    slug: 'chat-system',
    title: 'Design WhatsApp & Chat System',
    subtitle: 'WhatsApp-scale messaging — WebSockets, delivery guarantees, group chat fan-out, and presence at 500M+ users.',
    tip: 'Cover online presence, per-channel message ordering, at-least-once delivery + client idempotency, and fan-out on write vs read for groups.',
    prompt: `You are a principal engineer conducting a 45-minute system design interview on a real-time chat system like WhatsApp or Messenger.

Ask the candidate to clarify: 1:1 chat, group chat (max 256 members), online/offline presence, read receipts, message history sync, media attachments, and push notifications when offline. Scale: 500M DAU, 50B messages/day, median group size 10, some groups up to 256.

Guide them through WebSocket connection management, message routing, storage model (per-user inbox vs per-conversation), sequence numbers for ordering, and group fan-out strategy. Require architecture diagram with gateway, chat service, message store, and push service.

Probe delivery semantics (at-least-once vs exactly-once), idempotency keys, handling offline users, and presence heartbeats. Discuss trade-offs for fan-out on write vs read based on group size.

End with: "Design message sync for a user who was offline for 3 days on a new device." Score on real-time systems intuition and consistency models.`,
    functional: [
      'Send/receive text messages in 1:1 and group conversations',
      'Message history: paginated fetch on login and scroll-up',
      'Delivery status: sent → delivered → read receipts',
      'Online/offline presence and "last seen" (privacy configurable)',
      'Push notification when recipient offline',
      'Media attachments (images, files) via separate upload flow',
      'Group chat: create, add/remove members, admin roles',
    ],
    nonFunctional: [
      'Message delivery latency &lt; 500ms p99 for online users',
      '99.9% availability; messages never lost (durable)',
      'Support 50B messages/day (~580K msg/sec avg)',
      'Per-conversation ordering guarantee',
      'End-to-end encryption (mention as optional advanced feature)',
    ],
    outOfScope: [
      'Voice/video calls (signaling only mention)',
      'Full E2E encryption implementation details',
      'Message editing/deletion sync (brief mention)',
      'Federation across providers',
    ],
    scale: [
      '500M DAU, 50B messages/day → ~580K writes/sec avg, ~2M/sec peak',
      'Avg message 200 bytes text; 10% with 500KB media metadata',
      'Storage: 50B × 200B × 365 × 5yr ≈ 1.8 PB text (replication 3× → 5+ PB)',
      'WebSocket connections: 100M concurrent (20% DAU online)',
      'Group fan-out: avg 10 recipients × 580K = 5.8M inbox writes/sec',
      'Presence updates: 100M users × heartbeat/30s ≈ 3.3M updates/sec',
    ],
    scaleNote:
      'Group fan-out dominates write amplification. Hybrid: fan-out on write for groups &lt; 100 members; fan-out on read for larger channels. Presence uses Redis with TTL — approximate is OK.',
    architecture:
      archDiagram('Chat System Architecture', [
        [
          { text: 'Mobile / Web Clients', class: 'gray' },
        ],
        [
          { text: 'WebSocket Gateway (sticky sessions)', class: 'purple' },
          { text: 'REST API (history, groups)', class: '' },
        ],
        [
          { text: 'Chat Service (route, seq IDs)', class: 'green' },
          { text: 'Presence Service (Redis)', class: 'orange' },
        ],
        [
          { text: 'Message Queue (Kafka)', class: 'purple' },
          { text: 'Group Fan-out Workers', class: '' },
        ],
        [
          { text: 'Message Store (Cassandra)', class: 'green' },
          { text: 'Push Service (APNs/FCM)', class: 'orange' },
          { text: 'Media Store (S3 + CDN)', class: 'gray' },
        ],
      ]) +
      flow([
        { text: 'Send msg', class: 'gray' },
        { text: 'Assign seq ID', class: '' },
        { text: 'Persist + fan-out', class: 'purple' },
        { text: 'Push to online clients', class: 'green' },
      ]) +
      layers([
        'Layer 1 — WebSocket Gateway (connection state)',
        'Layer 2 — Chat Service (routing, seq IDs)',
        'Layer 3 — Message Store + Fan-out Queue',
        'Layer 4 — Push / Media / Presence',
      ]),
    archNotes:
      'WebSocket gateway is stateful — sticky load balancing by connection ID. Chat service is stateless. Each conversation has monotonic sequence number assigned by chat service (or per-sender for 1:1).',
    apis: [
      ['WS: send_message', 'Real-time send', '{convId, clientMsgId, body, type} → ack with serverMsgId + seq'],
      ['WS: message_delivery', 'Server push', '{serverMsgId, seq, sender, body, timestamp}'],
      ['GET /v1/conversations/{id}/messages?before_seq=', 'History', 'Paginated 50 msgs; cursor on seq number'],
      ['POST /v1/conversations', 'Create 1:1 or group', 'Returns convId; dedupe 1:1 by sorted user pair'],
      ['POST /v1/media/upload', 'Attachment', 'Presigned S3 URL; attach mediaId to message'],
      ['GET /v1/users/{id}/presence', 'Online status', 'Returns online|offline|last_seen (privacy filtered)'],
    ],
    dataModel: note(
      `<strong>messages</strong> (Cassandra, partition by conv_id): <code>conv_id</code>, <code>seq</code> (clustering), <code>sender_id</code>, <code>body</code>, <code>media_ref</code>, <code>ts</code><br><br>` +
        `<strong>user_inbox</strong> (fan-out): <code>user_id</code>, <code>conv_id</code>, <code>last_seq</code>, <code>unread_count</code><br><br>` +
        `<strong>user_devices</strong>: <code>user_id</code>, <code>device_id</code>, <code>push_token</code>, <code>ws_gateway</code>`
    ),
    storage: [
      ['Cassandra / HBase', 'Messages by conversation', 'Wide-column; partition conv_id; seq ordering native'],
      ['Redis', 'Presence + unread counts', 'TTL heartbeat keys; pub/sub for online events'],
      ['Kafka', 'Fan-out + push events', 'Durable buffer; replay on consumer failure'],
      ['S3', 'Media blobs', 'Presigned upload; CDN for download'],
    ],
    deepDives: [
      {
        title: 'Message ordering & idempotency',
        body:
          note(
            `Per-conversation monotonic <code>seq</code> assigned by chat service (single partition per conv or lightweight lock). Clients send <code>clientMsgId</code> UUID — server dedupes on (sender_id, clientMsgId) to handle retries. Display order = seq, not client timestamp (clock skew).`
          ) +
          note(
            `Delivery: at-least-once over WebSocket. Client acks <code>serverMsgId</code>; server retries unacked for 30s. Idempotent handler on client prevents duplicate display.`
          ),
      },
      {
        title: 'Group fan-out strategy',
        body:
          note(
            `<strong>Fan-out on write:</strong> For each message, write to each member's inbox table. Fast reads (just read inbox). Write cost = O(group_size). Good for groups &lt; 100.`
          ) +
          note(
            `<strong>Fan-out on read:</strong> Store message once per conversation; on read, merge conversations user belongs to. Good for large channels. Hybrid: write fan-out for small groups, read fan-out for &gt; 256 members.`
          ),
      },
      {
        title: 'WebSocket connection management',
        body:
          note(
            `100M concurrent connections → ~50K connections per gateway node (2K nodes). Sticky sessions via consistent hash on user_id. Gateway maintains user_id → socket map in memory. On disconnect, presence TTL expires in 60s.`
          ) +
          note(
            `Cross-gateway delivery: chat service publishes to Kafka topic partitioned by user_id; target gateway consumes and pushes to local socket. Alternative: Redis pub/sub per gateway for lower latency.`
          ),
      },
      {
        title: 'Offline sync & push',
        body:
          note(
            `Offline user: message written to inbox; push service sends FCM/APNs with payload {convId, preview}. On reconnect, client calls <code>GET messages?after_seq=last_known</code> to catch up.`
          ) +
          note(
            `New device: full inbox sync from <code>user_inbox</code> table, then per-conversation history paginated. Compress with gzip; delta sync using seq cursors.`
          ),
      },
    ],
    tradeoffs: [
      ['Group delivery', 'Fan-out on write', 'Fan-out on read', 'Write for small groups; read for broadcast channels'],
      ['Ordering', 'Global seq per conv', 'Lamport timestamps', 'Seq simpler; Lamport for multi-master geo'],
      ['Presence', 'Heartbeat + Redis TTL', 'Exact connection tracking', 'TTL approximate; exact costly at scale'],
      ['Storage', 'Per-user inbox copy', 'Per-conversation only', 'Inbox copy for fast read; conv-only saves writes'],
      ['Protocol', 'WebSocket', 'Long polling', 'WebSocket for real-time; polling fallback only'],
    ],
    script: [
      '0–5 min: Clarify 1:1 vs group, receipts, presence, offline behavior',
      '5–12 min: Scale — messages/day, concurrent connections, fan-out math',
      '12–22 min: Architecture diagram — gateway, chat service, store, push',
      '22–32 min: Deep dive ordering, seq IDs, idempotency',
      '32–38 min: Group fan-out hybrid strategy',
      '38–42 min: Presence, WebSocket scaling, cross-gateway routing',
      '42–45 min: Offline sync on new device',
    ],
    followUps: [
      ['Exactly-once delivery possible?', 'Practically no over unreliable network; at-least-once + idempotent client is standard'],
      ['How to handle 10K-member group?', 'Fan-out on read only; store single message; members pull on open'],
      ['Message deleted for everyone?', 'Tombstone message with deleted flag; push delete event; clients purge locally'],
      ['End-to-end encryption impact?', 'Server cannot read body; push shows "new message"; key exchange out of band'],
      ['Gateway crashes with 50K connections?', 'Clients reconnect to another gateway; exponential backoff; resume from last seq'],
      ['Read receipt privacy?', 'User setting controls send/read; server strips receipt if recipient disabled'],
    ],
    checklist: [
      'WebSocket gateway with sticky sessions',
      'Per-conversation sequence numbers',
      'Client message UUID for dedup',
      'Fan-out on write vs read trade-off',
      'Cassandra partitioned by conversation',
      'Presence via Redis TTL heartbeat',
      'Push for offline users (FCM/APNs)',
      'Delivery ack and retry semantics',
      'Scale: 50B msgs/day math',
      'Cross-gateway message routing',
    ],
    tags: ['WebSocket', 'messaging', 'fan-out', 'real-time', 'Cassandra'],
  },

  // ─── 4. News Feed ───────────────────────────────────────────────────
  {
    slug: 'news-feed',
    title: 'Design News Feed',
    subtitle: 'Facebook/Instagram feed — fan-out on write vs read, ranking, pagination, and the celebrity problem.',
    tip: 'Classic trade-off: push model for normal users, pull for celebrities with millions of followers. Mention hybrid approach and precomputed ranking features.',
    prompt: `You are a senior engineer at a social media company conducting a 45-minute system design interview on a news feed like Facebook or Instagram.

Have the candidate clarify: users post text/photos, followers see a ranked chronological+engagement feed, infinite scroll, pull-to-refresh, and approximate real-time updates. Scale: 300M DAU, 50M posts/day, avg 500 followers, some users have 50M followers.

Walk through fan-out on write vs fan-out on read, the celebrity/hot user problem, feed storage schema, ranking pipeline, and caching. Require diagram with post service, social graph, feed service, and cache.

Deep dive on hybrid fan-out, feed pagination cursors, and how to rank posts (ML features vs heuristic). Ask about cold start for new users and feed staleness SLAs.

Challenge: "A celebrity with 50M followers posts — what happens?" and "How to show feed within 2 seconds of opening app?" Evaluate trade-off articulation and scale awareness.`,
    functional: [
      'Users create posts (text, image refs, metadata)',
      'Follow/unfollow other users (asymmetric graph)',
      'Home feed: ranked list of posts from followed users',
      'Infinite scroll pagination (cursor-based)',
      'Pull-to-refresh fetches new posts since last visit',
      'Like/comment counts displayed on feed cards (can be eventually consistent)',
      'Hide/mute users or posts',
    ],
    nonFunctional: [
      'Feed load &lt; 2 seconds p99 on app open',
      'Support 300M DAU, 50M new posts/day',
      'Feed ranking refreshed within minutes of new engagement',
      'Highly available read path (99.9%)',
      'Eventual consistency acceptable for like counts',
    ],
    outOfScope: [
      'Ads insertion and auction system',
      'Stories/ephemeral content (24h)',
      'Full comment thread rendering',
      'Content moderation ML pipeline',
    ],
    scale: [
      '300M DAU, 50M posts/day → ~580 posts/sec',
      'Avg 500 followers → fan-out on write: 580 × 500 = 290K writes/sec (heavy)',
      'Feed reads: 300M DAU × 5 opens/day = 1.5B reads/day → ~17K/sec',
      'Celebrity: 1 user × 50M followers = 50M fan-out writes per post (infeasible)',
      'Feed cache per user: 500 post IDs × 8B × 300M users = 1.2 TB (only active users cached)',
      'Post storage: 50M/day × 1KB × 365 × 3yr ≈ 55 TB',
    ],
    scaleNote:
      'Hybrid fan-out is mandatory: push to follower feeds for users with &lt; 10K followers; pull-merge at read time for celebrity posts. Precompute "celebrity list" (~1K users) dynamically by follower count.',
    architecture:
      archDiagram('News Feed System', [
        [
          { text: 'Mobile / Web Clients', class: 'gray' },
        ],
        [
          { text: 'API Gateway', class: '' },
        ],
        [
          { text: 'Post Service', class: 'green' },
          { text: 'Social Graph Service', class: 'purple' },
          { text: 'Feed Service', class: 'green' },
        ],
        [
          { text: 'Fan-out Workers (Kafka)', class: 'orange' },
          { text: 'Feed Cache (Redis)', class: 'orange' },
        ],
        [
          { text: 'Post DB (Cassandra)', class: 'green' },
          { text: 'Graph DB / adjacency lists', class: 'purple' },
          { text: 'Ranking Service (ML features)', class: 'gray' },
        ],
      ]) +
      flow([
        { text: 'New post', class: 'gray' },
        { text: 'Persist post', class: '' },
        { text: 'Fan-out worker', class: 'purple' },
        { text: 'Update follower feeds', class: 'green' },
      ]),
    archNotes:
      'Feed cache stores sorted list of post IDs (not full posts). On read: fetch IDs from cache → batch get post details from post service. Ranking score computed at fan-out time or lazily on read.',
    apis: [
      ['POST /v1/posts', 'Create post', '{body, mediaIds[]} → postId; triggers async fan-out'],
      ['GET /v1/feed?cursor=&limit=20', 'Home feed', 'Returns ranked posts + next_cursor; merges celebrity pull'],
      ['POST /v1/follow/{userId}', 'Follow user', 'Updates graph; may backfill recent posts to feed'],
      ['DELETE /v1/follow/{userId}', 'Unfollow', 'Remove user posts from feed cache lazily'],
      ['GET /v1/users/{id}/posts', 'Profile timeline', 'User\'s own posts; simpler than home feed'],
    ],
    dataModel: note(
      `<strong>posts</strong>: <code>post_id</code>, <code>user_id</code>, <code>content</code>, <code>media_refs</code>, <code>created_at</code>, <code>like_count</code><br><br>` +
        `<strong>follows</strong>: <code>follower_id</code>, <code>followee_id</code>, <code>created_at</code> — adjacency list or graph DB<br><br>` +
        `<strong>user_feed</strong> (Redis sorted set): <code>user_id</code> → {post_id: rank_score} top 1000 entries`
    ),
    storage: [
      ['Cassandra', 'Posts by post_id and user_id', 'Durable post content; time-series per author'],
      ['Redis Sorted Sets', 'Precomputed user feeds', 'ZADD on fan-out; ZREVRANGE on read; trim to 1000'],
      ['PostgreSQL / Neo4j', 'Social graph', 'Follow relationships; follower count for celebrity detection'],
      ['Kafka', 'Fan-out job queue', 'Decouple post write from feed update; retry failed fan-outs'],
    ],
    deepDives: [
      {
        title: 'Hybrid fan-out (celebrity problem)',
        body:
          note(
            `When user posts, check follower count. If &lt; 10K: enqueue fan-out job — for each follower, ZADD post_id to their Redis feed sorted set. If ≥ 10K ("celebrity"): skip fan-out; store post only in author's timeline.`
          ) +
          note(
            `On feed read for user U: (1) ZREVRANGE U's precomputed feed. (2) Fetch recent posts from celebrities U follows (pull, max 50 celebs, last 24h). (3) Merge + re-rank by score. Cache merged result 60s.`
          ),
      },
      {
        title: 'Ranking pipeline',
        body:
          note(
            `Score = w1×recency_decay + w2×engagement_rate + w3×affinity(user, author) + w4×content_type_boost. Precompute affinity from interaction history (likes, comments, DMs) nightly.`
          ) +
          note(
            `ML ranker (optional): gradient boosted trees on 100+ features; inference at read time &lt; 50ms. A/B test ranking models. For interview: heuristic scoring at fan-out is sufficient.`
          ),
      },
      {
        title: 'Pagination & consistency',
        body:
          note(
            `Cursor = (score, post_id) tuple for stable pagination under concurrent inserts. Not offset-based (breaks with new posts). "New posts" banner: compare client last_seen_ts with server max feed ts.`
          ) +
          note(
            `Staleness: fan-out async may lag 1–5s. Acceptable for social feed. Pull-to-refresh forces merge + bypass 60s read cache.`
          ),
      },
      {
        title: 'Unfollow and deleted posts',
        body:
          note(
            `Unfollow: lazy removal — on next feed read, filter posts from unfollowed users; background job scrubs from Redis feed. Deleted post: tombstone in post DB; feed service filters tombstoned IDs on read; async purge from all feeds.`
          ),
      },
    ],
    tradeoffs: [
      ['Fan-out', 'On write (push)', 'On read (pull)', 'Push for normal users; pull for celebrities'],
      ['Feed storage', 'Redis sorted set', 'DB per-user table', 'Redis for speed; DB if Redis memory costly'],
      ['Ranking', 'At fan-out time', 'At read time', 'Fan-out pre-rank for fast read; read-time for fresh engagement'],
      ['Graph store', 'Adjacency lists in SQL', 'Dedicated graph DB', 'SQL to 1B edges; graph DB for complex queries'],
      ['Consistency', 'Eventual feed update', 'Synchronous fan-out', 'Async fan-out standard; sync too slow'],
    ],
    script: [
      '0–5 min: Clarify post types, follow model, ranking vs chronological',
      '5–12 min: Scale math — posts/sec, fan-out writes, celebrity edge case',
      '12–22 min: Draw architecture — post, graph, feed, fan-out workers',
      '22–32 min: Deep dive hybrid fan-out; explain celebrity pull merge',
      '32–38 min: Ranking signals, feed cache schema (sorted set)',
      '38–42 min: Pagination cursors, pull-to-refresh',
      '42–45 min: Unfollow, delete post propagation',
    ],
    followUps: [
      ['50M follower celebrity posts?', 'No fan-out; followers pull celebrity posts at read time; merge with precomputed feed'],
      ['New user cold start?', 'Suggest popular accounts; content-based recommendations until graph builds'],
      ['Feed shows stale like counts?', 'Acceptable; fetch fresh counts async; display cached with ~refresh icon'],
      ['Mutual follow vs one-way?', 'This design is asymmetric (Twitter-style); symmetric requires different graph'],
      ['How to backfill after follow?', 'Fetch followee\'s last N posts; ZADD to follower feed; async job'],
      ['Sharding user feeds?', 'Shard Redis by user_id hash; each user feed entirely on one shard'],
    ],
    checklist: [
      'Fan-out on write vs read explained',
      'Celebrity hybrid approach',
      'Fan-out write math (posts × followers)',
      'Redis sorted set for feed cache',
      'Store post IDs not full posts in feed',
      'Ranking score formula mentioned',
      'Cursor-based pagination',
      'Kafka for async fan-out workers',
      'Feed load &lt; 2s strategy (precompute)',
      'Unfollow lazy cleanup',
    ],
    tags: ['fan-out', 'social graph', 'caching', 'ranking', 'Redis'],
  },

  // ─── 5. Twitter Timeline ────────────────────────────────────────────
  {
    slug: 'twitter-timeline',
    title: 'Design Twitter',
    subtitle: 'Home timeline, tweets, retweets, search, and trending — hybrid fan-out with Snowflake IDs and real-time search.',
    tip: 'Same fan-out hybrid as news feed. Add tweet ID as Snowflake, separate search index for @mentions and hashtags, and retweet deduplication in timeline.',
    prompt: `You are a staff engineer conducting a 45-minute system design interview to design Twitter (X) — tweets, home timeline, search, and trending topics.

Clarify requirements: post tweets (280 chars), follow users, home timeline, retweet/quote, @mentions, #hashtags, search tweets, trending topics. Scale: 400M MAU, 500M tweets/day, avg 200 followers, top users have 100M+ followers.

Guide through tweet write path, Snowflake tweet IDs, hybrid fan-out for timeline, search indexing (Elasticsearch), and trending aggregation. Require architecture with tweet service, timeline service, search service, and graph service.

Deep dive on retweet handling in fan-out, timeline pagination, and search freshness. Ask how to handle a viral tweet and hashtag trending computation.

Evaluate understanding of hybrid push/pull, search vs feed separation, and hot key mitigation.`,
    functional: [
      'Post tweet (text, optional media, reply_to tweet_id)',
      'Retweet and quote-tweet',
      'Home timeline: tweets from followed users, ranked by recency + engagement',
      'User profile timeline (all tweets by user)',
      'Search tweets by keyword, hashtag, @mention',
      'Trending topics (top hashtags by velocity in last hour)',
      'Like, reply counts on tweet cards',
    ],
    nonFunctional: [
      'Timeline load &lt; 2s p99',
      'Tweet post acknowledged &lt; 500ms',
      'Search results &lt; 500ms for recent tweets',
      '500M tweets/day write throughput',
      'Durable — tweets never lost after ack',
    ],
    outOfScope: [
      'Direct messages (separate system)',
      'Ads and promoted tweets',
      'Spaces / live audio',
      'Algorithmic "For You" feed ML (mention only)',
    ],
    scale: [
      '500M tweets/day → ~5.8K tweets/sec avg, ~30K/sec peak',
      'Avg 200 followers → 5.8K × 200 = 1.16M timeline writes/sec (push fan-out)',
      'Timeline reads: 400M MAU × 10 sessions/day × 3 timeline loads = 12B/day → ~140K/sec',
      'Search index: 500M new docs/day; index size ~500GB/year compressed',
      'Trending: aggregate 50M unique hashtags/hour from stream',
      'Snowflake IDs: 64-bit, time-sortable, 4096 IDs/ms per machine',
    ],
    scaleNote:
      'Users with &gt; 1M followers skip push fan-out (pull at read). Timeline cache stores tweet IDs in Redis; hydrate tweet bodies from tweet store on read. Retweets stored as lightweight reference, not full copy.',
    architecture:
      archDiagram('Twitter Architecture', [
        [
          { text: 'Clients', class: 'gray' },
        ],
        [
          { text: 'API Layer', class: '' },
        ],
        [
          { text: 'Tweet Service', class: 'green' },
          { text: 'Timeline Service', class: 'green' },
          { text: 'Search Service (Elasticsearch)', class: 'purple' },
          { text: 'Graph Service', class: 'orange' },
        ],
        [
          { text: 'Fan-out Workers', class: 'orange' },
          { text: 'Trending Aggregator (Flink)', class: 'purple' },
        ],
        [
          { text: 'Tweet Store (MySQL/Cassandra)', class: 'green' },
          { text: 'Timeline Cache (Redis)', class: 'orange' },
          { text: 'Media CDN', class: 'gray' },
        ],
      ]) +
      flow([
        { text: 'Post tweet', class: 'gray' },
        { text: 'Snowflake ID', class: '' },
        { text: 'Store + index', class: 'purple' },
        { text: 'Fan-out timelines', class: 'green' },
      ]),
    archNotes:
      'Tweet service owns tweet CRUD. Timeline service owns fan-out and read merge. Search is async index via Kafka → Elasticsearch. Graph service stores follow edges and follower counts for celebrity detection.',
    apis: [
      ['POST /v1/tweets', 'Create tweet', '{text, mediaIds?, replyTo?, quoteOf?} → tweetId'],
      ['POST /v1/tweets/{id}/retweet', 'Retweet', 'Creates retweet reference; fan-out retweet ID to followers'],
      ['GET /v1/timeline/home?cursor=', 'Home timeline', 'Merged push+pull; cursor = last tweetId'],
      ['GET /v1/users/{id}/tweets', 'Profile timeline', 'Chronological tweets by user'],
      ['GET /v1/search?q=&type=', 'Search', 'Full-text + hashtag + mention filters'],
      ['GET /v1/trends', 'Trending', 'Top 20 hashtags by velocity; cached 60s'],
    ],
    dataModel: note(
      `<strong>tweets</strong>: <code>tweet_id</code> (Snowflake PK), <code>user_id</code>, <code>text</code>, <code>type</code> (original|retweet|reply|quote), <code>ref_tweet_id</code>, <code>created_at</code><br><br>` +
        `<strong>timeline</strong> (Redis list per user): ordered tweet_ids, max 800 entries<br><br>` +
        `<strong>follows</strong>: <code>follower_id</code>, <code>followee_id</code>, <code>followee_follower_count</code> (denormalized)`
    ),
    storage: [
      ['MySQL / Cassandra', 'Tweet bodies', 'Snowflake PK; secondary index by user_id + time'],
      ['Redis Lists / Sorted Sets', 'Home timelines', 'LPUSH on fan-out; LRU trim to 800 tweets'],
      ['Elasticsearch', 'Search index', 'Inverted index on text, hashtags, mentions; near-real-time'],
      ['Kafka + Flink', 'Trending pipeline', 'Windowed count of hashtags; top-K every minute'],
    ],
    deepDives: [
      {
        title: 'Snowflake tweet IDs',
        body:
          note(
            `64-bit ID: 41 bits timestamp (ms) + 10 bits machine ID + 12 bits sequence. Time-sortable — timeline pagination by tweet_id works as cursor. 4096 tweets/ms per machine; scale machines horizontally. Clock rollback handling: wait or use spare bits.`
          ),
      },
      {
        title: 'Hybrid timeline fan-out',
        body:
          note(
            `On tweet: if author has &lt; 1M followers, fan-out worker LPUSH tweet_id to each follower's Redis timeline. If ≥ 1M, skip fan-out — mark author as "celebrity".`
          ) +
          note(
            `On home timeline read: (1) LRANGE follower Redis timeline (800 ids). (2) For each celebrity followed, fetch last 20 tweets from celebrity timeline. (3) Merge by tweet_id desc, dedupe retweets, return page.`
          ),
      },
      {
        title: 'Search & trending',
        body:
          note(
            `Tweet creation event → Kafka → Elasticsearch indexer. Index fields: text (analyzed), hashtags (keyword), mentions (keyword), user_id, created_at. Search within 5s of tweet post (near-real-time ES refresh).`
          ) +
          note(
            `Trending: Flink tumbling 5-min window counts hashtag occurrences; score = count × velocity_boost; top 20 stored in Redis; global + per-location trends.`
          ),
      },
      {
        title: 'Retweet handling',
        body:
          note(
            `Retweet stores only <code>ref_tweet_id</code> + retweeter user_id — no text duplication. Fan-out pushes retweet's Snowflake ID to followers. On display, hydrate original tweet. Dedupe: if follower already has original in timeline, optionally skip retweet (product decision).`
          ),
      },
    ],
    tradeoffs: [
      ['Timeline', 'Push fan-out', 'Pull on read', 'Push for normal; pull celebrities only'],
      ['Tweet store', 'MySQL sharded', 'Cassandra', 'MySQL to ~50K writes/sec/shard; Cassandra beyond'],
      ['Search', 'Elasticsearch', 'Custom inverted index', 'ES standard; custom only at extreme scale'],
      ['Retweet storage', 'Reference only', 'Full copy', 'Reference saves storage; copy faster read'],
      ['Trending', 'Stream (Flink)', 'Batch hourly', 'Stream for real-time trends; batch cheaper'],
    ],
    script: [
      '0–5 min: Clarify tweet types, timeline vs search, trending',
      '5–12 min: Scale — 500M/day, fan-out math, celebrity threshold',
      '12–22 min: Architecture — tweet, timeline, search, graph services',
      '22–30 min: Snowflake IDs and hybrid fan-out deep dive',
      '30–36 min: Search indexing path; trending pipeline',
      '36–42 min: Retweet model, timeline pagination',
      '42–45 min: Viral tweet hot key mitigation',
    ],
    followUps: [
      ['Delete tweet propagation?', 'Tombstone in tweet store; async purge from timelines; search index delete'],
      ['@mention notification?', 'Parse mentions on write; async notify mentioned users via notification service'],
      ['Timeline for user following 5000 accounts?', 'Cap pull celebrities; sample; or rank follows by engagement'],
      ['Elasticsearch falls behind?', 'Degrade search to recent-only from tweet DB; alert ops; scale indexers'],
      ['Quote tweet in timeline?', 'Fan-out quote tweet ID; display embeds original with quoted context'],
      ['Rate limit tweets?', 'Per user 100/day API limit; 2400/day for verified; token bucket in tweet service'],
    ],
    checklist: [
      'Snowflake ID for tweets explained',
      'Hybrid push/pull fan-out',
      'Celebrity threshold (~1M followers)',
      'Separate search index (Elasticsearch)',
      'Trending via stream aggregation',
      'Retweet as reference not copy',
      'Timeline stores IDs not bodies',
      '500M tweets/day scale math',
      'Graph service for follow edges',
      'Kafka for async indexing + fan-out',
    ],
    tags: ['fan-out', 'Snowflake', 'search', 'Elasticsearch', 'social'],
  },

  // ─── 6. YouTube Streaming ─────────────────────────────────────────────
  {
    slug: 'youtube-streaming',
    title: 'Design YouTube',
    subtitle: 'Upload pipeline, transcoding, CDN delivery, adaptive bitrate, and view counting at billions of views.',
    tip: 'Separate upload path (blob storage + queue + workers) from read path (CDN + HLS/DASH). View counts are approximate — batch aggregate, never sync increment per view.',
    prompt: `You are a principal engineer interviewing a candidate on designing a video platform like YouTube at scale.

Clarify: video upload, transcoding to multiple resolutions, streaming playback with adaptive bitrate, search/discovery, view counts, comments, and recommendations (out of scope detail). Scale: 2B users, 500 hours of video uploaded/minute, 5B views/day.

Walk through upload flow (chunked, resumable), object storage, transcoding pipeline, CDN delivery, and metadata DB. Require diagram separating write (upload/transcode) and read (CDN stream) paths.

Deep dive on adaptive bitrate streaming (HLS/DASH), view count aggregation, and handling viral videos. Discuss storage costs and CDN cache hit ratios.

Ask: "How do you ensure smooth playback on 3G vs fiber?" and "Upload of a 4GB file fails at 90% — how to resume?" Score on media pipeline knowledge and read/write separation.`,
    functional: [
      'Upload video (resumable, chunked); support up to 12-hour videos',
      'Transcode to multiple resolutions (144p–4K) and formats (H.264, VP9)',
      'Stream playback with adaptive bitrate (HLS/DASH)',
      'Video metadata: title, description, tags, thumbnail',
      'View count display (approximate, eventually consistent)',
      'Search videos by title/tags',
      'Comments on videos (basic; separate service)',
    ],
    nonFunctional: [
      'Playback start &lt; 2s (time to first frame)',
      'Upload supports resume after network failure',
      '99.9% availability on read (CDN)',
      'Transcoding completes within 2× video duration',
      'Global delivery — low buffering across regions',
    ],
    outOfScope: [
      'Live streaming (RTMP/WebRTC)',
      'Recommendation algorithm / ML ranking',
      'Content ID / copyright detection',
      'Monetization and ads insertion',
    ],
    scale: [
      '500 hours video uploaded/min → ~30K uploads/hour → ~8 uploads/sec (avg), 50/sec peak',
      'Avg upload 500MB raw; 5B views/day → ~58K views/sec',
      'Storage: 500hr/min × 60 × 24 × 500MB × 365 ≈ 65 EB/year raw (use aggressive compression)',
      'Transcoding: 8 uploads/sec × 5 renditions × 2 min avg transcode = 80 concurrent transcode jobs',
      'CDN egress: 58K views/sec × 5 Mbps avg = 290 Tbps peak (CDN handles 95%+)',
      'Metadata DB: 8 uploads/sec; 5B view events/day for aggregation',
    ],
    scaleNote:
      'CDN serves 95%+ of video bytes — origin only on cache miss. View counts aggregated in memory (per-video counter shard) and flushed to DB every 10–60 seconds. Exact counts not required for display.',
    architecture:
      archDiagram('YouTube Video Platform', [
        [
          { text: 'Upload Clients', class: 'gray' },
          { text: 'Playback Clients', class: 'gray' },
        ],
        [
          { text: 'Upload API (chunked)', class: 'purple' },
          { text: 'Video API (metadata)', class: '' },
        ],
        [
          { text: 'Object Storage (S3 raw)', class: 'green' },
          { text: 'Transcode Queue + Workers', class: 'orange' },
        ],
        [
          { text: 'Transcoded Storage + CDN', class: 'green' },
          { text: 'Metadata DB', class: '' },
          { text: 'Search Index', class: 'purple' },
        ],
        [
          { text: 'View Counter Service (Redis)', class: 'orange' },
          { text: 'Analytics Pipeline', class: 'gray' },
        ],
      ]) +
      flow([
        { text: 'Chunk upload', class: 'gray' },
        { text: 'S3 assemble', class: '' },
        { text: 'Transcode', class: 'purple' },
        { text: 'CDN publish', class: 'green' },
      ]),
    archNotes:
      'Upload and playback are completely separate paths. Client uploads chunks to S3 via presigned URLs; API tracks upload session state. Transcoding is async — video unavailable until all renditions ready (or publish low-res first).',
    apis: [
      ['POST /v1/uploads/init', 'Start upload', 'Returns uploadId, presigned chunk URLs; {filename, size, checksum}'],
      ['PUT /v1/uploads/{id}/chunks/{n}', 'Upload chunk', 'Direct to S3 multipart; API tracks completed parts'],
      ['POST /v1/uploads/{id}/complete', 'Finalize upload', 'Triggers transcode job; returns videoId when processing'],
      ['GET /v1/videos/{id}/manifest.m3u8', 'Playback', 'HLS manifest listing rendition URLs on CDN'],
      ['POST /v1/videos/{id}/view', 'Record view', 'Async; dedupe by user/session per 24h; increments counter'],
      ['GET /v1/videos/search?q=', 'Search', 'Elasticsearch; ranked by relevance + view count'],
    ],
    dataModel: note(
      `<strong>videos</strong>: <code>video_id</code>, <code>user_id</code>, <code>title</code>, <code>description</code>, <code>status</code> (uploading|processing|ready), <code>view_count</code>, <code>created_at</code><br><br>` +
        `<strong>renditions</strong>: <code>video_id</code>, <code>resolution</code>, <code>codec</code>, <code>cdn_url</code>, <code>bitrate</code><br><br>` +
        `<strong>upload_sessions</strong>: <code>upload_id</code>, <code>completed_parts[]</code>, <code>expires_at</code>`
    ),
    storage: [
      ['S3 / GCS', 'Raw + transcoded video blobs', 'Multipart upload; lifecycle to Glacier for old raw'],
      ['CDN (CloudFront/Akamai)', 'Video delivery', 'Edge cache; 95%+ hit ratio; origin shield'],
      ['PostgreSQL', 'Video metadata', 'Sharded by video_id; read replicas for search hydration'],
      ['Redis', 'Hot view counters', 'INCR per video; flush batch to DB; shard by video_id'],
      ['Elasticsearch', 'Video search index', 'Title, tags, description; updated on publish'],
    ],
    deepDives: [
      {
        title: 'Resumable chunked upload',
        body:
          note(
            `Client requests upload session → receives video_id + presigned S3 multipart URLs for 5MB chunks. Uploads chunks in parallel (4–8 concurrent). On failure, resume from last completed part (tracked in upload_sessions DB). Complete call assembles S3 multipart and enqueues transcode.`
          ),
      },
      {
        title: 'Transcoding pipeline',
        body:
          note(
            `Kafka job: {video_id, s3_raw_path, renditions: [360p, 720p, 1080p]}. Worker pool (FFmpeg on GPU instances) produces H.264 segments. Output to S3 transcoded bucket; CDN invalidation/warm. Publish low-res (360p) first for faster time-to-view; upgrade manifest as higher renditions complete.`
          ) +
          note(
            `Priority queue: premium creators transcoded first. Auto-scale workers on queue depth. Dead letter for corrupt uploads.`
          ),
      },
      {
        title: 'Adaptive bitrate streaming (ABR)',
        body:
          note(
            `HLS: video split into 6-sec .ts segments per rendition. Client downloads .m3u8 manifest listing all renditions. Player monitors buffer + bandwidth; switches rendition without rebuffering. DASH is similar with .mp4 segments.`
          ) +
          note(
            `CDN caches segments at edge — same segment requested by millions. Origin only on cold start. For viral video: proactive CDN prefetch to top POPs.`
          ),
      },
      {
        title: 'View count at scale',
        body:
          note(
            `Never sync DB increment per view. Client beacons view event → API → Redis INCR video:{id}:views. Dedupe: SET video:{id}:viewers:{user_id} NX EX 86400. Flush aggregator every 30s: batch UPDATE videos SET view_count += delta. Display "~1.2M views" with rounding.`
          ),
      },
    ],
    tradeoffs: [
      ['Upload', 'Direct S3 presigned', 'Through API server', 'Presigned offloads bandwidth from API'],
      ['Transcode', 'Sync (wait)', 'Async queue', 'Async mandatory; sync blocks user minutes'],
      ['Streaming', 'HLS', 'Progressive MP4', 'HLS for ABR; progressive only for short clips'],
      ['View count', 'Approximate batch', 'Exact real-time', 'Approximate standard; exact too expensive'],
      ['Storage', 'Delete raw after transcode', 'Keep raw forever', 'Delete saves 50%+ storage cost'],
    ],
    script: [
      '0–5 min: Clarify upload, playback, view counts, search',
      '5–12 min: Scale — upload rate, views/day, CDN egress',
      '12–22 min: Diagram upload vs playback paths separately',
      '22–30 min: Chunked resumable upload deep dive',
      '30–38 min: Transcoding pipeline and ABR/HLS',
      '38–42 min: View count aggregation strategy',
      '42–45 min: Viral video CDN prefetch',
    ],
    followUps: [
      ['4GB upload fails at 90%?', 'Resume from part list in upload_sessions; S3 multipart complete with existing parts'],
      ['Transcode backlog during viral upload spike?', 'Auto-scale GPU workers; priority queue; publish 360p first'],
      ['View bot inflation?', 'Dedupe per user/session; CAPTCHA on suspicious patterns; rate limit view API'],
      ['Copyright on upload?', 'Out of scope but mention Content ID fingerprint pipeline async'],
      ['Global users, one region S3?', 'Multi-region S3 replication; CDN has global POPs; transcode near upload region'],
      ['Thumbnail generation?', 'Extract frame at 10% duration during transcode; store in CDN; separate from video pipeline'],
    ],
    checklist: [
      'Separate upload and playback paths',
      'Resumable chunked upload to S3',
      'Async transcode queue (FFmpeg workers)',
      'Multiple renditions (360p–1080p)',
      'HLS/DASH adaptive bitrate explained',
      'CDN for 95%+ video delivery',
      'Approximate view count via Redis batch',
      'View dedupe per user per 24h',
      'Metadata DB separate from blob storage',
      'Publish low-res first for faster availability',
    ],
    tags: ['CDN', 'video', 'transcoding', 'HLS', 'object storage'],
  },

  // ─── 7. Instagram Photos ────────────────────────────────────────────
  {
    slug: 'instagram-photos',
    title: 'Design Instagram',
    subtitle: 'Photo upload, feed, likes, comments, stories, and object storage at 2B+ users with global CDN delivery.',
    tip: 'Photos → S3 + CDN thumbnails (multiple sizes). Metadata in Cassandra. Feed uses same hybrid fan-out as news feed. Separate hot path for image bytes vs metadata.',
    prompt: `You are a senior engineer conducting a 45-minute system design interview on an Instagram-like photo sharing platform.

Clarify: upload photos (with filters), home feed of followed users' photos, likes, comments, user profiles, and follower graph. Scale: 2B MAU, 100M photos/day, avg 300 followers, images avg 2MB raw compressed to 200KB.

Guide through media upload pipeline (resize, filter, multi-resolution thumbnails), metadata storage, feed generation (hybrid fan-out), and CDN delivery. Require diagram with media service, feed service, graph service, and notification service.

Deep dive on image processing workers, storing multiple thumbnail sizes, and feed ranking for photos. Discuss storage costs and CDN strategy for global users.

Ask about like count consistency and comment threading at scale. Evaluate media pipeline design and feed architecture reuse.`,
    functional: [
      'Upload photo with optional filter applied client-side or server-side',
      'Generate thumbnails: 150px, 320px, 640px, 1080px',
      'Home feed: photos from followed users, ranked',
      'Like and unlike photos; display like count',
      'Comment on photos (flat comments, paginated)',
      'User profile: grid of user\'s photos',
      'Follow/unfollow users',
    ],
    nonFunctional: [
      'Photo upload complete &lt; 5s on 4G',
      'Feed load &lt; 2s; images load progressively',
      '99.9% availability on image CDN',
      '100M photos/day (~1.2K uploads/sec)',
      'Global low-latency image delivery',
    ],
    outOfScope: [
      'Stories (24h ephemeral)',
      'Reels / video (brief mention)',
      'Direct messaging',
      'Explore/discovery algorithm',
    ],
    scale: [
      '100M photos/day → ~1.2K uploads/sec avg, ~5K/sec peak',
      'Avg 2MB raw → 200KB JPEG after compression; 4 thumbnail sizes ≈ 400KB total per photo',
      'Storage: 100M × 400KB × 365 ≈ 14.6 PB/year (CDN + S3)',
      'Feed reads: 2B MAU × 3 sessions × 2 feed loads = 12B/day → ~140K/sec',
      'Likes: 10 likes/photo avg → 1B likes/day → ~12K writes/sec',
      'Avg 300 followers → fan-out: 1.2K × 300 = 360K feed writes/sec',
    ],
    scaleNote:
      'Store photo IDs in feed cache (not URLs). CDN URLs derived from photo_id + size template. Image processing async — show placeholder until thumbnails ready. Hybrid fan-out for users with &gt; 100K followers.',
    architecture:
      archDiagram('Instagram Photo Platform', [
        [
          { text: 'Mobile Clients', class: 'gray' },
        ],
        [
          { text: 'API Gateway', class: '' },
        ],
        [
          { text: 'Media Service (upload)', class: 'purple' },
          { text: 'Photo Service (metadata)', class: 'green' },
          { text: 'Feed Service', class: 'green' },
          { text: 'Social Graph', class: 'orange' },
        ],
        [
          { text: 'Image Processing Workers', class: 'orange' },
          { text: 'Fan-out Workers', class: 'purple' },
        ],
        [
          { text: 'S3 + CDN', class: 'green' },
          { text: 'Cassandra (photos, feeds)', class: 'green' },
          { text: 'Redis (feed cache)', class: 'orange' },
        ],
      ]) +
      flow([
        { text: 'Upload photo', class: 'gray' },
        { text: 'S3 raw', class: '' },
        { text: 'Resize + CDN', class: 'purple' },
        { text: 'Fan-out feed', class: 'green' },
      ]),
    archNotes:
      'Upload flow: presigned S3 URL → client uploads → webhook triggers image workers → multiple sizes to CDN → photo metadata written → fan-out to follower feeds. Client polls or push notification when processing complete.',
    apis: [
      ['POST /v1/photos/upload-url', 'Get presigned URL', 'Returns {uploadUrl, photoId, expiresAt}'],
      ['POST /v1/photos/{id}/complete', 'Finalize upload', 'Triggers processing; returns status processing|ready'],
      ['GET /v1/feed?cursor=', 'Home feed', 'Photo cards with CDN URLs for thumbnails'],
      ['POST /v1/photos/{id}/like', 'Like photo', 'Idempotent; async counter increment'],
      ['GET /v1/photos/{id}/comments?cursor=', 'Comments', 'Paginated; newest first'],
      ['POST /v1/photos/{id}/comments', 'Add comment', 'Returns commentId; notifies photo owner'],
    ],
    dataModel: note(
      `<strong>photos</strong>: <code>photo_id</code>, <code>user_id</code>, <code>caption</code>, <code>filter</code>, <code>cdn_paths</code> {150,320,640,1080}, <code>like_count</code>, <code>created_at</code><br><br>` +
        `<strong>likes</strong>: <code>photo_id</code>, <code>user_id</code> (composite PK for idempotency)<br><br>` +
        `<strong>comments</strong>: <code>comment_id</code>, <code>photo_id</code>, <code>user_id</code>, <code>text</code>, <code>created_at</code>`
    ),
    storage: [
      ['S3 + CloudFront CDN', 'Image blobs (all sizes)', 'Immutable; cache 1 year; geo-distributed'],
      ['Cassandra', 'Photos, comments, likes', 'Partition by photo_id; high write throughput'],
      ['Redis Sorted Sets', 'User feed cache', 'Photo IDs ranked by score; hybrid fan-out'],
      ['Kafka', 'Processing + fan-out queue', 'Decouple upload from feed update'],
    ],
    deepDives: [
      {
        title: 'Image processing pipeline',
        body:
          note(
            `On upload complete: worker downloads raw from S3, applies filter (if server-side), generates 4 JPEG sizes with ImageMagick/libvips, uploads each to CDN path <code>/photos/{photo_id}/{size}.jpg</code>. Update photo record status=ready. Typical processing: 2–5 seconds.`
          ) +
          note(
            `Client shows blurred placeholder (LQIP — low-quality image placeholder, 20×20 base64) until ready. Webhook or polling on <code>GET /photos/{id}/status</code>.`
          ),
      },
      {
        title: 'Feed with photo metadata hydration',
        body:
          note(
            `Feed cache stores photo_ids in ranked order. On feed read: batch MGET photo metadata from Cassandra (or local cache). Construct CDN URLs from template — no URL stored per feed entry. Progressive loading: 150px in feed list, 640px on tap.`
          ),
      },
      {
        title: 'Like count consistency',
        body:
          note(
            `Like write: INSERT into likes table (idempotent PK). Async: Redis INCR photo:{id}:likes. Display count from Redis (stale OK by seconds). Periodic reconciliation job syncs Redis → Cassandra like_count. Unlike: DELETE from likes + DECR.`
          ),
      },
      {
        title: 'Storage cost optimization',
        body:
          note(
            `CDN caches hot images at edge — S3 egress minimal. Lifecycle: move originals to Glacier after 90 days if only thumbnails needed. WebP format saves 30% vs JPEG for supported clients. Deduplicate identical uploads via perceptual hash (optional).`
          ),
      },
    ],
    tradeoffs: [
      ['Filter', 'Client-side', 'Server-side', 'Client saves server CPU; server for consistency'],
      ['Feed fan-out', 'Push (write)', 'Pull (read)', 'Push for normal; pull for celebrities'],
      ['Like count', 'Eventually consistent', 'Strongly consistent', 'Eventual standard for social; strong overkill'],
      ['Image format', 'JPEG', 'WebP/AVIF', 'JPEG universal; WebP for bandwidth savings'],
      ['Comment model', 'Flat list', 'Threaded tree', 'Flat simpler; threaded for Twitter-style'],
    ],
    script: [
      '0–5 min: Clarify upload, feed, likes, comments, followers',
      '5–12 min: Scale — photos/day, storage PB, fan-out math',
      '12–22 min: Architecture — media, photo, feed, graph services',
      '22–30 min: Image processing pipeline and CDN strategy',
      '30–36 min: Hybrid feed fan-out (reuse news feed pattern)',
      '36–42 min: Like count async increment',
      '42–45 min: Storage cost and multi-resolution thumbnails',
    ],
    followUps: [
      ['Photo upload on slow 3G?', 'Client-side resize before upload; chunked upload; retry with exponential backoff'],
      ['Celebrity with 50M followers posts?', 'Skip fan-out; pull at read time; merge with precomputed feed'],
      ['Delete photo?', 'Mark deleted in DB; CDN cache expires via TTL; purge from feeds async'],
      ['Duplicate photo detection?', 'Perceptual hash on upload; flag or block duplicates'],
      ['Comments on viral photo (1M comments)?', 'Paginate; cache top comments; rate limit comment writes'],
      ['Multi-region users?', 'S3 cross-region replication; CDN global; Cassandra multi-DC'],
    ],
    checklist: [
      'Presigned S3 upload flow',
      'Multiple thumbnail sizes (150–1080px)',
      'Async image processing workers',
      'CDN for all image delivery',
      'Feed stores photo IDs not blobs',
      'Hybrid fan-out for celebrity users',
      'Like idempotency via composite PK',
      'Eventually consistent like counts',
      '100M photos/day scale math',
      'Progressive image loading strategy',
    ],
    tags: ['media', 'CDN', 'fan-out', 'image processing', 'Cassandra'],
  },

  // ─── 8. Web Crawler ─────────────────────────────────────────────────
  {
    slug: 'web-crawler',
    title: 'Design Web Crawler',
    subtitle: 'Distributed crawl frontier, robots.txt politeness, deduplication, and storing billions of web pages.',
    tip: 'BFS frontier in priority queue, robots.txt cache, Bloom filter for seen URLs, separate fetcher vs parser workers. Per-domain rate limiting is critical.',
    prompt: `You are a principal engineer interviewing a candidate on designing a large-scale web crawler like Googlebot.

Clarify: discover URLs from seed list, fetch HTML, extract links, store page content, respect robots.txt and crawl-delay, deduplicate URLs, prioritize important pages. Scale: crawl 1B pages/day, 100M unique domains, avg page 50KB.

Walk through URL frontier design, fetcher pool, parser workers, link extractor, document store, and deduplication. Require diagram with scheduler, fetchers, parsers, and storage.

Deep dive on politeness (per-domain rate limit), Bloom filter vs exact dedup, handling redirects and JavaScript-rendered pages (brief). Discuss distributed coordination and failure recovery.

Ask: "How to prioritize crawling news sites vs static blogs?" and "What if a domain returns infinite URLs?" Score on distributed systems and politeness awareness.`,
    functional: [
      'Start from seed URLs; discover new URLs by parsing HTML links',
      'Fetch page content (HTML); follow redirects (max 5 hops)',
      'Extract and normalize URLs (canonical form)',
      'Respect robots.txt and crawl-delay per domain',
      'Deduplicate URLs — never fetch same URL twice',
      'Store raw HTML + metadata (URL, fetch time, status code, checksum)',
      'Priority queue: important domains/pages crawled first',
    ],
    nonFunctional: [
      'Crawl 1B pages/day (~11.5K pages/sec sustained)',
      'Politeness: default 1 request/sec per domain',
      'Fault tolerant — failed fetches retried with backoff',
      'Horizontally scalable fetcher workers',
      'Detect and avoid spider traps (infinite URL spaces)',
    ],
    outOfScope: [
      'JavaScript rendering (headless browser — mention as extension)',
      'Full-text search index building',
      'Image/binary file crawling',
      'Authentication / login walls',
    ],
    scale: [
      '1B pages/day → ~11.5K fetches/sec average, ~50K/sec peak',
      'Avg page 50KB HTML → 50GB/sec raw bandwidth at peak',
      'Storage: 1B × 50KB × 365 ≈ 18 PB/year',
      'URL frontier: ~10B unique URLs discovered; Bloom filter 10B @ 1% FP ≈ 12 GB',
      '100M domains → robots.txt cache ~5 GB',
      'DNS lookups: 11.5K/sec → dedicated DNS resolver pool',
    ],
    scaleNote:
      'Per-domain queues are the key scaling unit — 100M domain queues managed by consistent hashing to scheduler shards. Bloom filter gives O(1) "probably seen" check; exact dedup DB for confirmation on Bloom positive.',
    architecture:
      archDiagram('Distributed Web Crawler', [
        [
          { text: 'Seed URL Injector', class: 'gray' },
        ],
        [
          { text: 'URL Frontier (priority queues per domain)', class: 'purple' },
          { text: 'Scheduler / Coordinator', class: 'green' },
        ],
        [
          { text: 'Fetcher Pool (10K workers)', class: 'orange' },
          { text: 'Robots.txt Cache', class: '' },
        ],
        [
          { text: 'Parser + Link Extractor', class: 'green' },
          { text: 'URL Dedup (Bloom + DB)', class: 'purple' },
        ],
        [
          { text: 'Document Store (HDFS/S3)', class: 'green' },
          { text: 'URL Metadata DB', class: 'gray' },
        ],
      ]) +
      flow([
        { text: 'Dequeue URL', class: 'gray' },
        { text: 'Check robots.txt', class: '' },
        { text: 'HTTP fetch', class: 'purple' },
        { text: 'Parse + store', class: 'green' },
      ]),
    archNotes:
      'Scheduler assigns URLs to fetchers respecting per-domain rate limits. Fetchers are stateless — pull work from domain-specific Kafka topics. Parser is CPU-bound, separate pool from network-bound fetchers.',
    apis: [
      ['Internal: enqueue(url, priority)', 'Add URL to frontier', 'Normalize; Bloom check; assign to domain queue'],
      ['Internal: fetch(url)', 'HTTP GET', 'Returns {status, headers, body, redirect_chain}'],
      ['Internal: parse(html, base_url)', 'Extract links', 'Returns normalized absolute URLs[]'],
      ['GET /crawl/status/{domain}', 'Ops dashboard', 'Queue depth, last fetch time, error rate per domain'],
      ['POST /crawl/seeds', 'Inject seed URLs', 'Bootstrap or recrawl specific domains'],
    ],
    dataModel: note(
      `<strong>url_metadata</strong>: <code>url_hash</code> (PK), <code>canonical_url</code>, <code>first_seen</code>, <code>last_crawled</code>, <code>status_code</code>, <code>content_hash</code>, <code>priority</code><br><br>` +
        `<strong>domain_state</strong>: <code>domain</code>, <code>last_fetch_ts</code>, <code>crawl_delay_ms</code>, <code>robots_txt</code>, <code>queue_depth</code><br><br>` +
        `<strong>documents</strong> (object store): path = <code>/{yyyy}/{mm}/{dd}/{url_hash}.html</code>`
    ),
    storage: [
      ['Kafka (per-domain topics)', 'URL frontier queues', 'Backpressure; replay on failure'],
      ['Redis + Bloom filter', 'URL deduplication', 'Bloom in-memory per scheduler shard; Redis for exact check'],
      ['HDFS / S3', 'Raw HTML documents', 'Cheap bulk storage; immutable append'],
      ['PostgreSQL', 'URL metadata + domain state', 'Robots.txt cache; crawl history'],
    ],
    deepDives: [
      {
        title: 'URL frontier & politeness',
        body:
          note(
            `Each domain has a priority queue in Kafka (topic = domain hash). Scheduler tracks <code>last_fetch_ts</code> per domain — won't dequeue until <code>crawl_delay</code> elapsed (from robots.txt or default 1s). High-priority domains (news, gov) get dedicated fetcher capacity.`
          ) +
          note(
            `Consistent hash domains to scheduler shards — each shard manages ~1M domains. On scheduler failure, Kafka retains unconsumed URLs.`
          ),
      },
      {
        title: 'URL normalization & deduplication',
        body:
          note(
            `Normalize: lowercase host, remove default port, resolve relative paths, strip fragments (#), sort query params, remove tracking params (utm_*). Canonical URL hash (SHA256) as dedup key.`
          ) +
          note(
            `Two-stage dedup: (1) Bloom filter — if "not seen", definitely new. (2) If "maybe seen", check URL metadata DB. False positive rate 1% acceptable — occasional re-fetch wastes bandwidth but not correctness.`
          ),
      },
      {
        title: 'Spider trap prevention',
        body:
          note(
            `Detect: same domain queue depth &gt; 100K; URL path depth &gt; 20; calendar/archive pattern generating infinite dates. Action: cap URLs per domain per day; skip URLs matching trap patterns; alert ops.`
          ) +
          note(
            `robots.txt Disallow paths honored before fetch. Max redirect chain = 5. Reject non-HTTP(S) schemes.`
          ),
      },
      {
        title: 'Fetcher design & fault tolerance',
        body:
          note(
            `Fetcher pool: stateless workers, connection pooling per domain (respect Keep-Alive). Timeout: connect 5s, read 30s. Retry: 3 attempts with exponential backoff for 5xx/timeout. 4xx (except 429): don't retry, log and skip.`
          ) +
          note(
            `DNS caching per fetcher (TTL 300s). User-Agent string identifies crawler. Handle 429 with Retry-After header — requeue with delay.`
          ),
      },
    ],
    tradeoffs: [
      ['Dedup', 'Bloom filter', 'Exact DB only', 'Bloom + DB confirm; DB-only too slow at 11K/sec'],
      ['Frontier', 'Kafka per domain', 'Central priority queue', 'Kafka scales; central queue bottleneck'],
      ['Politeness', 'Strict 1 req/sec', 'Adaptive rate', 'Strict default; adaptive for trusted domains'],
      ['Storage', 'Raw HTML', 'Extracted text only', 'Raw for reprocessing; text saves 80% storage'],
      ['Priority', 'PageRank-style', 'FIFO per domain', 'PageRank for important pages first'],
    ],
    script: [
      '0–5 min: Clarify crawl goals, politeness, dedup, storage',
      '5–12 min: Scale — pages/day, bandwidth, storage PB',
      '12–22 min: Architecture — frontier, fetcher, parser, store',
      '22–30 min: Per-domain rate limiting and robots.txt',
      '30–36 min: URL normalization and Bloom filter dedup',
      '36–42 min: Spider trap detection',
      '42–45 min: Priority crawling for news vs static sites',
    ],
    followUps: [
      ['JavaScript-rendered pages?', 'Headless browser pool (Puppeteer) — 10× slower; only for whitelisted domains'],
      ['How to recrawl changed pages?', 'Store content_hash; recrawl based on Last-Modified header or periodic schedule by PageRank'],
      ['Crawler banned by domain?', 'Backoff crawl rate; rotate IP (ethical gray area); respect 403 as stop signal'],
      ['Duplicate content different URLs?', 'Canonical link tag parsing; content_hash dedup across URLs'],
      ['Distributed robots.txt fetch?', 'Cache robots.txt 24h per domain; refresh on 404/expiry'],
      ['How to crawl 10× more tomorrow?', 'Add fetcher workers linearly; Kafka partitions scale; Bloom filter sharded'],
    ],
    checklist: [
      'BFS/priority URL frontier explained',
      'Per-domain rate limiting (robots.txt)',
      'URL normalization rules listed',
      'Bloom filter + exact dedup two-stage',
      'Separate fetcher and parser workers',
      'Spider trap detection mentioned',
      '1B pages/day bandwidth math',
      'Fault tolerance: retry, Kafka replay',
      'Document store on HDFS/S3',
      'DNS caching and connection pooling',
    ],
    tags: ['crawler', 'distributed', 'Bloom filter', 'politeness', 'BFS'],
  },

  // ─── 9. File Storage ────────────────────────────────────────────────
  {
    slug: 'file-storage',
    title: 'Design Dropbox / File Storage',
    subtitle: 'Sync, versioning, metadata vs blob split, chunking, delta sync, and multi-device consistency.',
    tip: 'Metadata in DB, files in object storage. Chunk large files (4MB blocks) with content-hash for dedup and delta sync. Eventual consistency across devices with conflict resolution.',
    prompt: `You are a staff engineer conducting a 45-minute system design interview on a cloud file storage and sync system like Dropbox.

Clarify: upload/download files, sync across devices, folder hierarchy, file versioning, sharing with permissions, and offline access. Scale: 500M users, 100B files, avg file 500KB, 10M sync operations/day.

Walk through metadata vs blob separation, chunking strategy, sync protocol (what changed since last sync), conflict resolution, and sharing permissions. Require diagram with sync service, metadata DB, blob store, and notification service.

Deep dive on content-defined chunking for dedup, delta sync (only transfer changed chunks), and handling concurrent edits on two devices. Discuss storage deduplication across users.

Ask: "Two devices edit the same file offline — what happens?" Score on sync protocol design and consistency models.`,
    functional: [
      'Upload, download, delete files and folders',
      'Sync changes across user\'s devices automatically',
      'File versioning — keep last N versions (default 30 days)',
      'Share files/folders with other users (read/write permissions)',
      'Offline access — sync when back online',
      'Block-level dedup: same content stored once globally',
      'Search files by name (metadata only)',
    ],
    nonFunctional: [
      'Sync notification &lt; 5s after change on another device',
      'Upload/download utilizes available bandwidth',
      '99.9% durability — no data loss',
      'Support files up to 50GB',
      'Efficient sync — only changed chunks transferred',
    ],
    outOfScope: [
      'Real-time collaborative editing (Google Docs style)',
      'End-to-end encryption (mention as premium feature)',
      'Desktop full-disk backup',
      'Video streaming from storage',
    ],
    scale: [
      '500M users, 100B files, avg 500KB → 50 PB logical (before dedup)',
      'Dedup ratio ~3:1 → ~17 PB physical blob storage',
      '10M sync ops/day → ~115/sec; peak 10× during work hours',
      'Chunk size 4MB → avg file = 1–2 chunks; 100B chunks metadata entries',
      'Metadata: 100B files × 500B metadata ≈ 50 TB index',
      'Notification: 115 sync events/sec → long-polling or WebSocket per device',
    ],
    scaleNote:
      'Content-addressable storage: chunk identified by SHA256 hash. Same chunk uploaded by different users stored once. Metadata DB is the bottleneck — shard by user_id. Blob store (S3) is cheap and unlimited.',
    architecture:
      archDiagram('Dropbox File Sync System', [
        [
          { text: 'Desktop / Mobile Clients', class: 'gray' },
        ],
        [
          { text: 'Sync API + WebSocket Notifications', class: 'purple' },
          { text: 'Upload/Download API', class: '' },
        ],
        [
          { text: 'Metadata Service', class: 'green' },
          { text: 'Block Service (chunking)', class: 'orange' },
          { text: 'Sharing & Permissions', class: '' },
        ],
        [
          { text: 'Metadata DB (sharded SQL)', class: 'green' },
          { text: 'Block Storage (S3, content-addressed)', class: 'green' },
        ],
        [
          { text: 'Notification Service (long-poll/WS)', class: 'orange' },
          { text: 'Version History Store', class: 'gray' },
        ],
      ]) +
      flow([
        { text: 'File change', class: 'gray' },
        { text: 'Chunk + hash', class: '' },
        { text: 'Upload new chunks', class: 'purple' },
        { text: 'Update metadata', class: 'green' },
      ]),
    archNotes:
      'Client splits file into 4MB chunks, hashes each (SHA256). Uploads only chunks not already on server (check hash existence). Metadata service records file → chunk list mapping. Sync = exchange metadata diff, then fetch missing chunks.',
    apis: [
      ['POST /v1/blocks/check', 'Check chunk existence', 'Body: {hashes[]} → {missing[]} — client uploads only missing'],
      ['PUT /v1/blocks/{hash}', 'Upload chunk', 'Content-addressed; idempotent; returns 200 if exists'],
      ['POST /v1/files', 'Create/update file metadata', '{path, chunks[], parent_folder, device_id} → version'],
      ['GET /v1/sync/cursor', 'Get changes since cursor', 'Returns changed files/folders since last sync cursor'],
      ['GET /v1/files/{id}/download', 'Download file', 'Returns presigned URLs for chunk assembly'],
      ['POST /v1/shares', 'Share folder', '{folder_id, user_email, permission: read|write}'],
    ],
    dataModel: note(
      `<strong>files</strong>: <code>file_id</code>, <code>user_id</code>, <code>path</code>, <code>parent_id</code>, <code>chunk_hashes[]</code>, <code>version</code>, <code>modified_at</code>, <code>device_id</code><br><br>` +
        `<strong>blocks</strong>: <code>hash</code> (PK SHA256), <code>s3_path</code>, <code>size</code>, <code>ref_count</code><br><br>` +
        `<strong>shares</strong>: <code>resource_id</code>, <code>owner_id</code>, <code>grantee_id</code>, <code>permission</code>`
    ),
    storage: [
      ['S3 (content-addressed)', 'File chunks/blocks', 'SHA256 key; dedup across all users; 11 nines durability'],
      ['PostgreSQL (sharded by user_id)', 'File metadata, folder tree', 'ACID for metadata; shard at 100M users'],
      ['Redis', 'Sync cursors + notifications', 'Pub/sub per user for change notifications'],
      ['S3 Glacier', 'Old versions', 'Lifecycle policy after 30 days'],
    ],
    deepDives: [
      {
        title: 'Block-level dedup and delta sync',
        body:
          note(
            `Client computes rolling hash (Rabin fingerprint) for content-defined chunking — boundaries shift minimally on small edits (vs fixed 4MB blocks where any edit changes all subsequent chunks). Each chunk SHA256 checked against server — upload only new chunks. 1MB edit in 1GB file → upload ~1–2 chunks (4–8MB) not 1GB.`
          ),
      },
      {
        title: 'Sync protocol',
        body:
          note(
            `Each device maintains sync cursor (server monotonic version per user). On change: client pushes metadata + new chunks. Server increments user version, notifies other devices via WebSocket. Other devices: <code>GET /sync?since=cursor</code> → list of changed paths → download missing chunks.`
          ) +
          note(
            `Initial sync on new device: full metadata tree download, then parallel chunk download for all files.`
          ),
      },
      {
        title: 'Conflict resolution',
        body:
          note(
            `Two devices edit same file offline: both push on reconnect. Server detects version conflict (expected_version mismatch). Strategy: <strong>last-write-wins</strong> (simpler) OR <strong>conflict copies</strong> (Dropbox model — save both as "file (conflicted copy).ext"). User resolves manually.`
          ) +
          note(
            `For folders: rename/move conflicts create duplicate paths. Operational transform not needed — file-level granularity sufficient for sync (not real-time co-editing).`
          ),
      },
      {
        title: 'Sharing and permissions',
        body:
          note(
            `Share grants grantee read/write on folder subtree. Permission check on every API call: traverse parent chain for ACL. Cache ACL in Redis per (user, resource). Shared files reference owner's chunks — no duplication. Revoke: delete share record; async cache invalidation.`
          ),
      },
    ],
    tradeoffs: [
      ['Chunking', 'Fixed 4MB', 'Content-defined (Rabin)', 'Content-defined for better delta sync'],
      ['Conflict', 'Last-write-wins', 'Conflict copies', 'LWW simple; copies safer for users'],
      ['Sync notify', 'WebSocket', 'Long polling', 'WebSocket lower latency; polling simpler'],
      ['Dedup scope', 'Global cross-user', 'Per-user only', 'Global saves 60%+ storage; privacy consideration'],
      ['Versioning', '30-day window', 'Unlimited versions', '30-day balances storage; unlimited costly'],
    ],
    script: [
      '0–5 min: Clarify sync, sharing, versioning, offline',
      '5–12 min: Scale — files, storage PB, dedup ratio',
      '12–22 min: Metadata vs blob split architecture',
      '22–30 min: Chunking and content-hash dedup deep dive',
      '30–36 min: Sync protocol with cursors',
      '36–42 min: Conflict resolution strategies',
      '42–45 min: Sharing permissions model',
    ],
    followUps: [
      ['Two devices edit offline?', 'Conflict copies saved; user picks winner; or last-write-wins with timestamp'],
      ['Delete file — chunks garbage collected?', 'Decrement ref_count on chunks; GC worker deletes ref_count=0 from S3'],
      ['User deletes account?', 'Mark metadata deleted; async chunk GC if ref_count hits 0 globally'],
      ['50GB file upload?', 'Multipart chunk upload; resume from last confirmed chunk hash'],
      ['Malware in shared file?', 'Out of scope; mention async virus scan on upload'],
      ['Cross-region sync latency?', 'Multi-region S3 replication; metadata DB primary in user home region'],
    ],
    checklist: [
      'Metadata vs blob storage separation',
      'Content-addressed chunks (SHA256)',
      'Delta sync — upload only changed chunks',
      'Sync cursor / changelog protocol',
      'Conflict resolution strategy stated',
      'Block dedup across users',
      'WebSocket notification for sync',
      'File versioning with retention',
      'Sharing ACL model',
      'ref_count for chunk garbage collection',
    ],
    tags: ['sync', 'dedup', 'object storage', 'metadata', 'chunking'],
  },

  // ─── 10. Typeahead ──────────────────────────────────────────────────
  {
    slug: 'typeahead',
    title: 'Design Typeahead / Autocomplete',
    subtitle: 'Search suggestions as you type — prefix indexes, trie, Elasticsearch, and ranking at &lt;100ms p99.',
    tip: 'Target &lt;100ms p99. Precompute top queries offline. Trie or ES completion suggester. Cache hot prefixes in Redis. Debounce client requests (200ms).',
    prompt: `You are a senior engineer conducting a 45-minute system design interview on a typeahead/autocomplete system like Google Search suggestions.

Clarify: as user types, return top 10 suggestions ranked by popularity and relevance; support personalization (optional); update suggestions daily from query logs; filter NSFW and stale terms. Scale: 5B searches/day, avg 5 keystrokes per search, 100M unique queries in corpus.

Walk through offline data pipeline (aggregate query logs → build prefix index), online query path (prefix lookup → rank → return), caching strategy, and latency budget. Require diagram with offline batch job, trie/ES index, cache layer, and API.

Deep dive on trie vs Elasticsearch completion vs precomputed hash map trade-offs. Discuss prefix length limits, fuzzy matching, and personalization without killing cache hit rate.

Ask: "User types 'a' — how to return useful results in 50ms?" Score on latency optimization and data structure choices.`,
    functional: [
      'Return top 10 suggestions for a given prefix (min 1 char)',
      'Rank by popularity (query frequency) + recency',
      'Optional personalization based on user search history',
      'Debounce-friendly: fast response for partial prefixes',
      'Filter blocked terms (NSFW, policy violations)',
      'Support multiple languages/locales',
      'Refresh suggestion corpus daily from query logs',
    ],
    nonFunctional: [
      'Latency p99 &lt; 100ms end-to-end',
      'Support 5B searches/day → ~58K typeahead requests/sec (5× per search)',
      'Highly available (99.9%) — degrade gracefully if index slow',
      'Corpus of 100M unique queries with prefix index',
      'Consistent suggestions within a daily batch window',
    ],
    outOfScope: [
      'Full search results page',
      'Spell correction (mention as extension)',
      'Voice input',
      'Real-time trending (sub-minute updates)',
    ],
    scale: [
      '5B searches/day × 5 keystrokes = 25B typeahead requests/day → ~290K RPS',
      'Corpus: 100M unique queries; avg 20 chars → trie ~2GB in memory',
      'Top 10 suggestions per prefix; avg prefix depth 3 chars → ~50K active prefixes hot',
      'Cache: 50K hot prefixes × 10 suggestions × 50B ≈ 25 MB Redis',
      'Offline job: process 5B query logs/day → aggregate top 10M queries → build trie in ~2 hours',
      'Read:write ratio ∞ — entirely read-optimized',
    ],
    scaleNote:
      'Precompute everything offline. Online path is pure lookup + optional personalization overlay. Redis caches top 50K prefixes (covers 90% of traffic). Trie kept in memory on each API server (2GB replicated).',
    architecture:
      archDiagram('Typeahead System', [
        [
          { text: 'Search Clients', class: 'gray' },
        ],
        [
          { text: 'Typeahead API (stateless)', class: 'purple' },
        ],
        [
          { text: 'Redis Cache (hot prefixes)', class: 'orange' },
          { text: 'In-Memory Trie (per server)', class: 'green' },
        ],
        [
          { text: 'Personalization Service (optional)', class: '' },
        ],
        [
          { text: 'Offline: Query Log Aggregator', class: 'gray' },
          { text: 'Trie Builder (daily batch)', class: 'purple' },
          { text: 'Query Log Store (S3/HDFS)', class: 'gray' },
        ],
      ]) +
      flow([
        { text: 'Prefix "app"', class: 'gray' },
        { text: 'Redis cache hit?', class: '' },
        { text: 'Trie lookup', class: 'purple' },
        { text: 'Top 10 ranked', class: 'green' },
      ]),
    archNotes:
      'Client debounces 200ms before sending request. API normalizes prefix (lowercase, trim). Cache key = locale + prefix. On cache miss, trie lookup O(k) where k = prefix length. Personalization reorders top 10 if user history available.',
    apis: [
      ['GET /v1/suggest?q={prefix}&limit=10&locale=en', 'Get suggestions', 'Returns [{text, score, type}] in &lt;100ms'],
      ['Internal: rebuild_index()', 'Daily batch job', 'Reads aggregated queries; builds trie; rolling deploy to API servers'],
      ['GET /v1/admin/corpus/stats', 'Ops', 'Corpus size, last rebuild time, cache hit rate'],
      ['POST /v1/admin/blocklist', 'Block term', 'Adds term to filter; applies on next rebuild'],
    ],
    dataModel: note(
      `<strong>query_corpus</strong> (offline): <code>query_text</code>, <code>count</code>, <code>last_seen</code>, <code>locale</code> — top 10M by count<br><br>` +
        `<strong>trie_node</strong> (in-memory): <code>char</code>, <code>children{}</code>, <code>top_queries[]</code> (heap of top 10 by count at this prefix)<br><br>` +
        `<strong>blocklist</strong>: <code>term</code>, <code>reason</code> — filtered during trie build`
    ),
    storage: [
      ['In-memory Trie (per API pod)', 'Prefix index', '2GB RAM; rebuilt daily; blue-green deploy'],
      ['Redis', 'Hot prefix cache', 'TTL 1h; 50K keys; 90%+ hit rate'],
      ['S3 / HDFS', 'Raw query logs', 'Daily batch input for corpus aggregation'],
      ['PostgreSQL', 'Blocklist + corpus metadata', 'Admin operations; corpus version tracking'],
    ],
    deepDives: [
      {
        title: 'Trie with top-K at each node',
        body:
          note(
            `Build trie from corpus: for each query, walk trie inserting chars; at each node maintain min-heap of top 10 queries by count seen through this prefix. Lookup: walk trie for prefix → return node's top 10 heap. O(k) lookup, k = prefix length. Space: ~2GB for 100M queries.`
          ) +
          note(
            `Alternative: Elasticsearch completion suggester with edge n-grams — easier to operate but 50–100ms vs 5ms trie. Use ES if corpus &gt; 500M or need fuzzy matching.`
          ),
      },
      {
        title: 'Offline aggregation pipeline',
        body:
          note(
            `Daily Spark job: read 5B query logs from S3 → normalize (lowercase, trim, dedupe session repeats) → count frequency → filter blocklist → keep top 10M → serialize trie → push to API servers via rolling update (blue-green, zero downtime).`
          ) +
          note(
            `Incremental updates (hourly) possible for trending terms: merge delta into trie or overlay trending layer in Redis with 1h TTL.`
          ),
      },
      {
        title: 'Caching and latency budget',
        body:
          note(
            `Latency budget: network 20ms + API 5ms + cache/trie 5ms + serialization 5ms = 35ms p50. Redis hit (90%): &lt;10ms. Trie miss on long tail prefix: &lt;20ms. Personalization adds 15ms — only for logged-in users, async overlay.`
          ) +
          note(
            `CDN edge caching for anonymous users with common prefixes ("a", "th") — cache 60s at edge.`
          ),
      },
      {
        title: 'Personalization without killing cache',
        body:
          note(
            `Base suggestions from global trie (cacheable). Personalization: fetch user's top 20 historical queries from user profile service; if any match current prefix, boost in re-ranking. Personalization layer is per-user (not cacheable) but only reorders 10 items — cheap.`
          ),
      },
    ],
    tradeoffs: [
      ['Index', 'In-memory trie', 'Elasticsearch', 'Trie for speed; ES for scale/fuzzy'],
      ['Update freq', 'Daily batch', 'Real-time stream', 'Daily sufficient; stream for trending'],
      ['Personalization', 'Re-rank overlay', 'Separate index per user', 'Overlay preserves cache; per-user index impossible'],
      ['Prefix min length', '1 char', '3 chars', '1 char better UX; 3 chars reduces load 100×'],
      ['Fuzzy match', 'No (exact prefix)', 'Yes (edit distance)', 'Exact for speed; fuzzy for typo tolerance'],
    ],
    script: [
      '0–5 min: Clarify suggestion count, ranking, personalization, latency SLA',
      '5–10 min: Scale — 290K RPS, corpus size, read-heavy',
      '10–20 min: Offline pipeline — log aggregation → trie build',
      '20–28 min: Online path — cache → trie lookup → rank',
      '28–35 min: Trie data structure with top-K heaps',
      '35–40 min: Personalization overlay approach',
      '40–45 min: Daily rebuild zero-downtime deploy',
    ],
    followUps: [
      ['User types single char "a"?', 'Trie root children return top 10 global queries starting with "a"; heavily cached'],
      ['Trie too big for memory?', 'Shard trie by first 2 chars across servers; or use ES completion'],
      ['NSFW term in suggestions?', 'Blocklist filtered at build time; human review queue for flagged terms'],
      ['Stale suggestions (old news)?', 'Recency decay in ranking score; boost queries from last 7 days'],
      ['Multi-language?', 'Separate trie per locale; route by Accept-Language header'],
      ['How to A/B test ranking?', 'Shadow traffic to variant trie; compare CTR offline'],
    ],
    checklist: [
      'Offline batch aggregation from query logs',
      'Trie with top-K heap at each node',
      'p99 &lt; 100ms latency budget',
      'Redis cache for hot prefixes',
      'Client debounce mentioned',
      '290K RPS scale math',
      'Daily corpus rebuild strategy',
      'Blocklist filtering',
      'Personalization as re-rank overlay',
      'Blue-green trie deployment',
    ],
    tags: ['trie', 'autocomplete', 'caching', 'batch processing', 'low latency'],
  },

  // ─── 11. API Gateway ──────────────────────────────────────────────────
  {
    slug: 'api-gateway',
    title: 'Design API Gateway',
    subtitle: 'Single entry point — auth, routing, rate limits, SSL termination, circuit breaking, and observability.',
    tip: 'Gateway vs service mesh: gateway at edge for north-south traffic; mesh for internal east-west. Mention Kong, AWS API Gateway, Envoy patterns. Keep gateway thin — no business logic.',
    prompt: `You are a principal engineer interviewing a candidate on designing an API Gateway for a microservices platform with 200+ backend services.

Clarify: single entry point for all client traffic, authentication (JWT/OAuth), request routing to backend services, rate limiting, SSL termination, request/response transformation, circuit breaking, and centralized logging/metrics. Scale: 100K RPS, 50K registered API consumers, 200 backend services.

Walk through gateway architecture, plugin/middleware pipeline, service discovery integration, and how to avoid gateway becoming a bottleneck. Require diagram with clients, gateway cluster, service registry, and backend services.

Deep dive on JWT validation caching, circuit breaker states, and canary routing. Compare build vs buy (Kong, Envoy, AWS API Gateway).

Ask: "Backend service is down — what does gateway do?" and "How to deploy gateway config without downtime?" Score on edge architecture and operational maturity.`,
    functional: [
      'Route requests to correct backend service by path/host/header',
      'Authenticate requests (JWT, API key, OAuth2)',
      'Rate limit per consumer/API key',
      'SSL/TLS termination at gateway',
      'Request/response transformation (header injection, path rewrite)',
      'Circuit breaker: fail fast when backend unhealthy',
      'Centralized access logging and distributed tracing',
      'Canary routing: send 5% traffic to new service version',
    ],
    nonFunctional: [
      'Gateway overhead &lt; 10ms p99 added latency',
      '99.99% gateway availability (no single point of failure)',
      '100K RPS across gateway cluster',
      'Config changes deployed without downtime in &lt; 60s',
      'Horizontally scalable — add nodes linearly',
    ],
    outOfScope: [
      'Service mesh (Istio/Linkerd) for internal traffic',
      'Backend service implementation',
      'API versioning strategy (brief mention)',
      'GraphQL federation (mention as alternative)',
    ],
    scale: [
      '100K RPS peak across all APIs',
      '200 backend services; avg 500 RPS per service',
      '50K API consumers with individual rate limits',
      'JWT validation: 100K crypto ops/sec → cache validated tokens 5 min',
      'Gateway cluster: 20 nodes × 5K RPS each = 100K capacity',
      'Config: 500 routes, 200 service definitions — 2MB total config',
    ],
    scaleNote:
      'Gateway is stateless — scale horizontally behind LB. JWT public key cached locally; token validation cached in Redis (token_hash → claims, TTL = token expiry). Config pushed from control plane (etcd/Consul) with watch-based hot reload.',
    architecture:
      archDiagram('API Gateway Architecture', [
        [
          { text: 'External Clients', class: 'gray' },
          { text: 'Mobile Apps', class: 'gray' },
        ],
        [
          { text: 'Cloud LB (TLS termination option)', class: 'purple' },
        ],
        [
          { text: 'API Gateway Cluster (Envoy/Kong)', class: 'green' },
        ],
        [
          { text: 'Auth Service (JWT/OAuth)', class: 'orange' },
          { text: 'Rate Limiter (Redis)', class: 'orange' },
          { text: 'Service Registry (Consul/etcd)', class: '' },
        ],
        [
          { text: 'Service A', class: 'green' },
          { text: 'Service B', class: 'green' },
          { text: 'Service C…', class: 'green' },
        ],
        [
          { text: 'Logging (Kafka) + Tracing (Jaeger)', class: 'gray' },
        ],
      ]) +
      flow([
        { text: 'Request', class: 'gray' },
        { text: 'Auth + rate limit', class: '' },
        { text: 'Route to service', class: 'purple' },
        { text: 'Response + log', class: 'green' },
      ]),
    archNotes:
      'Request pipeline (middleware chain): TLS → access log → auth → rate limit → route → circuit breaker → proxy → response transform → metrics. Each plugin &lt; 2ms. Config hot-reloaded via file watch or xDS (Envoy).',
    apis: [
      ['/* (all client traffic)', 'Proxy to backend', 'Route table: path prefix → service name → upstream endpoints'],
      ['POST /admin/routes', 'Add/update route', '{path, service, methods, rate_limit, auth_required}'],
      ['POST /admin/circuit-breaker/{service}', 'Configure CB', '{failure_threshold, timeout_ms, half_open_requests}'],
      ['GET /admin/health', 'Gateway health', 'Per-node status, config version, upstream health'],
      ['GET /metrics (Prometheus)', 'Observability', 'request_count, latency_histogram, cb_state per service'],
    ],
    dataModel: note(
      `<strong>routes</strong>: <code>id</code>, <code>path_pattern</code>, <code>service_id</code>, <code>methods[]</code>, <code>auth_policy</code>, <code>rate_limit_id</code>, <code>canary_weight</code><br><br>` +
        `<strong>services</strong>: <code>service_id</code>, <code>endpoints[]</code>, <code>health_check_url</code>, <code>cb_config</code><br><br>` +
        `<strong>consumers</strong>: <code>consumer_id</code>, <code>api_key_hash</code>, <code>rate_limit_tier</code>, <code>jwt_issuer</code>`
    ),
    storage: [
      ['etcd / Consul', 'Route + service config', 'Watch-based push to all gateway nodes; versioned'],
      ['Redis', 'Rate limit counters + JWT cache', 'Shared across gateway cluster'],
      ['Kafka', 'Access logs', 'Async; every request logged with trace_id'],
      ['Prometheus + Jaeger', 'Metrics + distributed traces', 'trace_id injected at gateway; propagated to backends'],
    ],
    deepDives: [
      {
        title: 'Authentication pipeline',
        body:
          note(
            `JWT validation: extract Bearer token → check Redis cache (token_jti → claims) → on miss, verify signature with cached public key (fetched from auth service JWKS endpoint, refreshed hourly) → cache claims with TTL = token exp. API key: hash key → lookup consumer in local cache (30s TTL).`
          ) +
          note(
            `OAuth2: gateway redirects to auth service for token exchange; gateway never stores passwords. mTLS for service-to-service (optional layer).`
          ),
      },
      {
        title: 'Circuit breaker pattern',
        body:
          note(
            `Per upstream service: CLOSED (normal) → OPEN (fail fast, return 503) after N failures in window → HALF_OPEN (allow 1 probe request) → CLOSED on success. Prevents cascade failure. Config: 5 failures in 10s → open for 30s.`
          ) +
          note(
            `Health checks: active probe every 10s + passive (track 5xx rate). Unhealthy endpoints removed from load balancer pool automatically.`
          ),
      },
      {
        title: 'Service discovery and routing',
        body:
          note(
            `Gateway watches Consul/etcd for service endpoint changes. Route: <code>/api/users/*</code> → user-service endpoints (round-robin). Canary: 95% to v1 endpoints, 5% to v2 (weighted random). Blue-green: flip weight 0→100 in one config update.`
          ),
      },
      {
        title: 'Zero-downtime config deployment',
        body:
          note(
            `Config versioned in etcd. Gateway nodes watch for changes → validate new config locally → atomic swap (double-buffering). Invalid config rejected — old config remains active. Rollback: revert etcd version; all nodes reload in &lt;5s.`
          ),
      },
    ],
    tradeoffs: [
      ['Gateway product', 'Envoy/Kong (self-hosted)', 'AWS API Gateway (managed)', 'Self-hosted for control; managed for ops simplicity'],
      ['Auth', 'Gateway validates JWT', 'Backend validates', 'Gateway for defense-in-depth; backend still checks claims'],
      ['TLS', 'At gateway', 'At LB + gateway', 'LB termination reduces gateway CPU'],
      ['Config', 'etcd watch (push)', 'Poll every 30s', 'Push for fast updates; poll simpler'],
      ['Logging', 'Sync log per request', 'Async Kafka', 'Async mandatory at 100K RPS'],
    ],
    script: [
      '0–5 min: Clarify routing, auth, rate limit, observability needs',
      '5–10 min: Scale — 100K RPS, 200 services, gateway cluster sizing',
      '10–20 min: Architecture diagram — LB, gateway, registry, backends',
      '20–28 min: Middleware pipeline walkthrough',
      '28–35 min: JWT caching and circuit breaker deep dive',
      '35–40 min: Service discovery and canary routing',
      '40–45 min: Zero-downtime config deployment',
    ],
    followUps: [
      ['Backend down?', 'Circuit breaker opens; return 503 with Retry-After; alert ops; probe half-open after 30s'],
      ['Gateway itself is bottleneck?', 'Add nodes horizontally; optimize hot plugins; move TLS to LB'],
      ['How to handle 10MB request body?', 'Stream request to backend; don\'t buffer in gateway; set body size limit'],
      ['Gateway vs service mesh?', 'Gateway: north-south client traffic; mesh: east-west service-to-service mTLS'],
      ['DDoS at gateway?', 'WAF in front; global rate limit; IP blocklist; Cloudflare before gateway'],
      ['API versioning at gateway?', 'Path prefix /v1/, /v2/ routes to different service versions; header-based alternative'],
    ],
    checklist: [
      'Single entry point for all client traffic',
      'Middleware pipeline defined',
      'JWT validation with caching',
      'Rate limiting per consumer',
      'Circuit breaker per upstream service',
      'Service discovery integration (Consul/etcd)',
      'Distributed tracing trace_id injection',
      '100K RPS cluster sizing',
      'Config hot-reload without downtime',
      'Gateway vs service mesh distinction',
    ],
    tags: ['API gateway', 'microservices', 'auth', 'circuit breaker', 'Envoy'],
  },

  // ─── 12. Notification System ────────────────────────────────────────
  {
    slug: 'notification-system',
    title: 'Design Notification System',
    subtitle: 'Push, email, SMS — templates, user preferences, priority queues, retries, and delivery guarantees.',
    tip: 'Multi-channel fan-out from one event. User prefs table gates each channel. Retry with exponential backoff + DLQ. Idempotent notification IDs prevent duplicate sends.',
    prompt: `You are a staff engineer conducting a 45-minute system design interview on a multi-channel notification system like what powers Facebook or Uber notifications.

Clarify: send notifications via push (iOS/Android), email, and SMS from a single event API; user channel preferences and quiet hours; template engine with localization; priority levels (transactional vs marketing); delivery tracking and retry. Scale: 1B notifications/day, 500M users, 3 channels.

Walk through event ingestion, notification service, per-channel queues, worker pools, and third-party integrations (FCM, APNs, SendGrid, Twilio). Require diagram with event API, scheduler, channel queues, and delivery workers.

Deep dive on idempotency, retry/DLQ, rate limits from third-party providers, and quiet hours scheduling. Discuss at-least-once delivery semantics.

Ask: "User disables push but enables email — how to route?" and "SMS provider rate limits at 100/sec — how to handle 10K/sec spike?" Score on queue design and delivery reliability.`,
    functional: [
      'Send notification via push, email, or SMS from single API call',
      'User preferences: enable/disable per channel; quiet hours (no push 10pm–8am)',
      'Template engine: parameterized templates with i18n/locale support',
      'Priority: transactional (OTP, receipt) vs marketing (promo)',
      'Schedule future notifications (reminder in 24h)',
      'Delivery status tracking: sent, delivered, failed, bounced',
      'Batch notifications (digest email: "5 friends liked your photo")',
    ],
    nonFunctional: [
      'Transactional notifications delivered &lt; 30s p99',
      '1B notifications/day → ~12K/sec avg, ~100K/sec peak',
      'At-least-once delivery with idempotency (no duplicate user-visible sends)',
      '99.9% availability on ingestion API',
      'Graceful degradation if one channel provider is down',
    ],
    outOfScope: [
      'In-app notification inbox UI',
      'A/B testing notification content',
      'Rich push (images, actions) — mention only',
      'Notification analytics dashboard (brief)',
    ],
    scale: [
      '1B notifications/day → ~12K/sec avg; peak 100K/sec (flash sale, viral event)',
      '500M users; avg 2 devices/user → 1B push tokens',
      'Channel split: 60% push, 30% email, 10% SMS',
      'Email: 3.6K/sec → SendGrid limit ~10K/sec (OK with batching)',
      'SMS: 1.2K/sec avg; Twilio ~100/sec/account → need 12 accounts or queue smoothing',
      'Template storage: 10K templates × 50 locales = 500K rendered variants (cached)',
    ],
    scaleNote:
      'Priority queues: transactional traffic on dedicated high-priority Kafka topic processed first. Marketing batched into digests (reduce 10 events → 1 email). SMS always queued with rate limiter matching provider capacity.',
    architecture:
      archDiagram('Notification System', [
        [
          { text: 'Backend Services (events)', class: 'gray' },
        ],
        [
          { text: 'Notification API (ingest)', class: 'purple' },
          { text: 'Scheduler (delayed notifications)', class: '' },
        ],
        [
          { text: 'Notification Service (route + template)', class: 'green' },
          { text: 'User Preferences DB', class: 'orange' },
        ],
        [
          { text: 'Push Queue', class: 'green' },
          { text: 'Email Queue', class: 'green' },
          { text: 'SMS Queue (rate limited)', class: 'orange' },
        ],
        [
          { text: 'Push Workers → FCM/APNs', class: 'green' },
          { text: 'Email Workers → SendGrid', class: 'green' },
          { text: 'SMS Workers → Twilio', class: 'orange' },
        ],
        [
          { text: 'Delivery Status DB + DLQ', class: 'gray' },
        ],
      ]) +
      flow([
        { text: 'Event', class: 'gray' },
        { text: 'Check prefs', class: '' },
        { text: 'Render template', class: 'purple' },
        { text: 'Enqueue channel', class: 'green' },
      ]),
    archNotes:
      'Ingestion API is sync (ack immediately after Kafka write). All delivery async. notification_id (UUID) dedupes — check delivery_status DB before send. Quiet hours: scheduler holds push until window opens.',
    apis: [
      ['POST /v1/notifications/send', 'Send notification', '{userId, templateId, data{}, channels[], priority, idempotencyKey}'],
      ['POST /v1/notifications/schedule', 'Schedule future', '{sendAt, ...sendPayload}'],
      ['GET /v1/users/{id}/preferences', 'Get channel prefs', 'Returns {push, email, sms, quietHours}'],
      ['PUT /v1/users/{id}/preferences', 'Update prefs', 'Opt-in/out per channel'],
      ['GET /v1/notifications/{id}/status', 'Delivery status', 'Per channel: queued|sent|delivered|failed'],
      ['POST /v1/templates', 'Create template', '{name, channels: {push, email, sms}, locales{}}'],
    ],
    dataModel: note(
      `<strong>notifications</strong>: <code>notification_id</code>, <code>user_id</code>, <code>template_id</code>, <code>data JSON</code>, <code>priority</code>, <code>status</code>, <code>created_at</code><br><br>` +
        `<strong>delivery_attempts</strong>: <code>notification_id</code>, <code>channel</code>, <code>attempt</code>, <code>status</code>, <code>provider_id</code>, <code>error</code><br><br>` +
        `<strong>user_preferences</strong>: <code>user_id</code>, <code>push_enabled</code>, <code>email_enabled</code>, <code>sms_enabled</code>, <code>quiet_hours</code>, <code>locale</code>`
    ),
    storage: [
      ['Kafka (per-priority topics)', 'Notification queue', 'Transactional topic prioritized; marketing batched'],
      ['PostgreSQL', 'Delivery status + idempotency', 'notification_id unique; track per-channel attempts'],
      ['Redis', 'User prefs cache + SMS rate limiter', 'Prefs cached 5 min; SMS token bucket per provider'],
      ['S3', 'Rendered template cache', 'Pre-rendered locale variants; invalidate on template update'],
    ],
    deepDives: [
      {
        title: 'Idempotency and deduplication',
        body:
          note(
            `Client sends <code>idempotencyKey</code> (or server generates notification_id). On ingest: INSERT INTO notifications ON CONFLICT DO NOTHING. Workers check delivery_attempts before sending — if status=sent, skip. Prevents duplicate on Kafka replay or worker retry.`
          ),
      },
      {
        title: 'Template rendering and i18n',
        body:
          note(
            `Templates stored as Handlebars/Jinja with variables: <code>"{{userName}} liked your photo"</code>. On send: fetch user locale → load template variant → render with data → cache rendered output keyed by (template_id, locale, data_hash) for 5 min.`
          ) +
          note(
            `Batch digest: accumulator groups N similar events per user per hour → single "5 people liked your photo" email instead of 5 separate emails.`
          ),
      },
      {
        title: 'Retry, backoff, and DLQ',
        body:
          note(
            `On delivery failure (provider 5xx, timeout): retry 3× with exponential backoff (1s, 10s, 60s). After max retries → Dead Letter Queue (DLQ). Ops dashboard alerts on DLQ depth. Manual replay tool for DLQ after provider recovery.`
          ) +
          note(
            `Provider-specific: APNs invalid token → mark device token inactive (don't retry). Email bounce → suppress email channel for user.`
          ),
      },
      {
        title: 'Quiet hours and scheduling',
        body:
          note(
            `Push during quiet hours (10pm–8am user local time): scheduler writes to delayed queue with <code>execute_at</code>. Cron worker scans due notifications every minute. Transactional (OTP) bypasses quiet hours. Timezone stored per user.`
          ),
      },
    ],
    tradeoffs: [
      ['Delivery', 'At-least-once + idempotent', 'Exactly-once', 'At-least-once practical; exactly-once needs distributed tx'],
      ['Marketing', 'Batch digest', 'Real-time per event', 'Digest reduces fatigue and email cost'],
      ['SMS rate limit', 'Queue + smooth', 'Multiple provider accounts', 'Queue simpler; multi-account for burst'],
      ['Template', 'Pre-rendered cache', 'Render on send', 'Cache for repeated templates; render for dynamic'],
      ['Priority', 'Separate Kafka topics', 'Single queue with priority field', 'Separate topics guarantee transactional SLA'],
    ],
    script: [
      '0–5 min: Clarify channels, preferences, priorities, templates',
      '5–12 min: Scale — 1B/day, channel split, provider limits',
      '12–22 min: Architecture — ingest, service, per-channel queues, workers',
      '22–30 min: Idempotency and dedup deep dive',
      '30–36 min: Retry/DLQ and provider failure handling',
      '36–42 min: Quiet hours scheduler; batch digest',
      '42–45 min: SMS rate limit smoothing',
    ],
    followUps: [
      ['User disables push?', 'Check preferences before enqueue; skip push channel; still send email if enabled'],
      ['10K SMS/sec spike?', 'Queue all; rate limiter drains at 100/sec; delay acceptable for marketing; alert ops'],
      ['Push token invalid?', 'APNs/FCM returns 410; mark token dead; stop future push to that device'],
      ['Duplicate notification on retry?', 'idempotencyKey + delivery_attempts table prevents re-send'],
      ['Global quiet hours vs per-user timezone?', 'Per-user timezone stored; scheduler converts to UTC execute_at'],
      ['How to test without sending real SMS?', 'Sandbox provider mode; override recipient in staging; mock workers'],
    ],
    checklist: [
      'Multi-channel from single event API',
      'User preferences gate each channel',
      'Idempotency key prevents duplicates',
      'Separate queues per channel',
      'Priority: transactional vs marketing',
      'Retry with exponential backoff + DLQ',
      'Template engine with i18n',
      'Quiet hours scheduler',
      'Batch digest for marketing',
      'SMS rate limit smoothing',
    ],
    tags: ['notifications', 'queues', 'push', 'email', 'reliability'],
  },

  // ─── 13. Distributed Cache ──────────────────────────────────────────
  {
    slug: 'distributed-cache',
    title: 'Design Distributed Cache',
    subtitle: 'Redis cluster, consistent hashing, replication, cache-aside vs read-through, and invalidation at scale.',
    tip: 'Explain sharding with consistent hashing, replication for HA, cache-aside pattern, thundering herd mitigation (singleflight), and cache invalidation strategies (TTL vs delete-on-write).',
    prompt: `You are a principal engineer interviewing a candidate on designing a distributed caching layer for a high-traffic web application.

Clarify: cache sits between application servers and database; support get/set/delete with TTL; horizontally scalable to 10TB memory; highly available with replication; cache-aside pattern; handle cache miss thundering herd. Scale: 1M RPS cache operations, 100M unique keys, avg value 10KB.

Walk through consistent hashing for sharding, replication strategy, cache-aside vs read-through vs write-through, eviction policies, and invalidation. Require diagram with app servers, cache cluster, and database.

Deep dive on consistent hashing with virtual nodes, thundering herd problem and solutions (singleflight, probabilistic early expiration), and what happens when a cache node fails.

Ask: "Popular key expires and 10K requests hit DB simultaneously — how to prevent?" Score on distributed hashing knowledge and cache failure modes.`,
    functional: [
      'get(key) → value or miss',
      'set(key, value, ttl_sec) — store with optional expiration',
      'delete(key) — explicit invalidation',
      'Support cache-aside pattern (app manages cache)',
      'Atomic increment/decrement for counters',
      'Batch get (mget) for multiple keys',
      'Namespace/prefix support for logical isolation',
    ],
    nonFunctional: [
      '1M operations/sec across cluster',
      'get latency p99 &lt; 5ms',
      '99.99% availability — survive single node failure',
      'Horizontally scalable to 10TB total memory',
      'Consistent performance under node add/remove (minimal key redistribution)',
    ],
    outOfScope: [
      'Redis-specific commands (focus on concepts)',
      'Cache warming strategies (brief mention)',
      'Multi-region cache coherence',
      'Persistent cache (AOF/RDB backup — brief)',
    ],
    scale: [
      '1M ops/sec: 80% get, 20% set → 800K gets/sec, 200K sets/sec',
      '100M unique keys × 10KB avg = 1TB data (10TB with replication factor 3)',
      'Cache hit ratio target: 95% → 50K DB queries/sec on miss',
      'Cluster: 100 nodes × 100GB RAM = 10TB; ~10K ops/sec per node',
      'Network: 1M ops × 10KB = 10 GB/sec aggregate bandwidth',
      'Consistent hash: 100 physical nodes × 150 virtual nodes = 15K ring positions',
    ],
    scaleNote:
      'Each shard: 1 primary + 2 replicas. On primary failure, replica promoted in &lt;30s. Client library handles topology changes via gossip protocol. Hot keys: replicate to all nodes or local L1 cache on app servers.',
    architecture:
      archDiagram('Distributed Cache Cluster', [
        [
          { text: 'Application Servers', class: 'gray' },
        ],
        [
          { text: 'Cache Client Library (consistent hash router)', class: 'purple' },
        ],
        [
          { text: 'Shard 1 (Primary + 2 Replicas)', class: 'green' },
          { text: 'Shard 2 (Primary + 2 Replicas)', class: 'green' },
          { text: 'Shard N…', class: 'green' },
        ],
        [
          { text: 'Gossip Protocol (cluster membership)', class: 'orange' },
        ],
        [
          { text: 'Database (on cache miss)', class: 'gray' },
        ],
      ]) +
      flow([
        { text: 'get(key)', class: 'gray' },
        { text: 'Hash → shard', class: '' },
        { text: 'Hit / miss', class: 'purple' },
        { text: 'DB on miss', class: 'green' },
      ]),
    archNotes:
      'Client library computes shard = consistent_hash(key) → routes to primary. On miss: app fetches DB, populates cache (cache-aside). Replication: primary streams writes to replicas asynchronously (eventual consistency within shard).',
    apis: [
      ['GET key', 'Retrieve value', 'Returns value or nil; p99 &lt;5ms'],
      ['SET key value EX ttl', 'Store with TTL', 'Atomic; replicates to replicas async'],
      ['DEL key', 'Delete / invalidate', 'Propagates to replicas; returns count deleted'],
      ['MGET key1 key2 …', 'Batch get', 'Routes to multiple shards in parallel; merges results'],
      ['INCR key', 'Atomic counter', 'Used for rate limiting, view counts'],
      ['CLUSTER NODES', 'Topology discovery', 'Client bootstraps shard map; refreshed on MOVED redirect'],
    ],
    dataModel: note(
      `<strong>Cache entry</strong> (in-memory per shard): <code>key</code> (string, max 512MB value), <code>value</code> (bytes), <code>ttl_expiry</code> (absolute timestamp), <code>access_count</code> (for LFU eviction)<br><br>` +
        `<strong>Cluster metadata</strong>: <code>node_id</code>, <code>ip:port</code>, <code>role</code> (primary|replica), <code>hash_slots[]</code>, <code>status</code> (online|fail|handshake)`
    ),
    storage: [
      ['In-memory (per shard node)', 'Cache data', 'RAM; eviction when maxmemory reached'],
      ['AOF (append-only file)', 'Durability (optional)', 'fsync every sec; rebuild on restart — most caches skip for speed'],
      ['Gossip state', 'Cluster topology', 'In-memory; exchanged every 1s between nodes'],
    ],
    deepDives: [
      {
        title: 'Consistent hashing with virtual nodes',
        body:
          diagram(
            'Hash ring (conceptual)',
            note(
              'Keys A, B, C hash onto ring → walk clockwise to nearest vnode → physical node owns key. Adding Node D only moves keys between C and D.'
            )
          ) +
          note(
            `Hash ring: 0 to 2³². Each physical node has 150 virtual nodes on ring (better balance). key → hash(key) → walk clockwise to first virtual node → that physical node owns the key. Add node: only keys between predecessor and new node move (~1/N keys). Remove node: keys redistributed to next node.`
          ) +
          note(
            `Without virtual nodes: uneven distribution when few nodes. With 150 vnodes per node: std deviation &lt; 5% key distribution.`
          ),
      },
      {
        title: 'Cache-aside pattern and thundering herd',
        body:
          note(
            `<strong>Cache-aside:</strong> App checks cache → on miss, read DB → write to cache → return. App owns consistency. On write: update DB first, then delete cache key (not update — avoids race).`
          ) +
          note(
            `<strong>Thundering herd:</strong> Hot key expires → 10K concurrent requests miss → all hit DB. Fixes: (1) <strong>Singleflight</strong> — only one request fetches DB, others wait. (2) <strong>Probabilistic early expiration</strong> — expire at random time before TTL. (3) <strong>Never expire hot keys</strong> — background refresh before TTL.`
          ),
      },
      {
        title: 'Replication and failover',
        body:
          note(
            `Each shard: 1 primary + 2 replicas. Writes go to primary → replicated via command stream. Reads: default from primary (strong); can read from replica (eventual, lower load). Primary failure: replicas gossip elect new primary in &lt;30s. Clients receive MOVED/ASK redirects during rebalancing.`
          ),
      },
      {
        title: 'Eviction policies',
        body:
          note(
            `When maxmemory reached: <strong>allkeys-lru</strong> (evict least recently used — general purpose), <strong>volatile-lru</strong> (only keys with TTL), <strong>allkeys-lfu</strong> (least frequently used — better for hot key retention). Never <strong>noeviction</strong> in production cache — causes OOM errors. Monitor eviction rate; scale if &gt; 100/sec.`
          ),
      },
    ],
    tradeoffs: [
      ['Pattern', 'Cache-aside', 'Read-through', 'Cache-aside: app control; read-through: simpler app code'],
      ['Write', 'Delete on write', 'Update cache on write', 'Delete safer; update risks stale if DB write fails'],
      ['Consistency', 'Eventual (replicas)', 'Strong (primary only)', 'Primary reads for strong; replicas for scale'],
      ['Eviction', 'LRU', 'LFU', 'LRU general; LFU better for skewed access patterns'],
      ['Hot key', 'Local L1 cache', 'Replicate key to all nodes', 'L1 simpler; replicate for extreme hot keys'],
    ],
    script: [
      '0–5 min: Clarify cache-aside, TTL, scale, availability requirements',
      '5–12 min: Scale — 1M ops/sec, 1TB data, hit ratio math',
      '12–22 min: Consistent hashing diagram with virtual nodes',
      '22–30 min: Cache-aside pattern; delete vs update on write',
      '30–36 min: Thundering herd — singleflight and early expiration',
      '36–42 min: Replication and failover',
      '42–45 min: Eviction policy selection',
    ],
    followUps: [
      ['Hot key on one shard?', 'Local L1 cache on app; or replicate hot key to all shards; client-side hash override'],
      ['Cache node dies?', 'Replica promoted; ~1/N keys unavailable for 30s; clients retry with redirect'],
      ['Cache and DB inconsistent?', 'TTL bounds staleness; delete-on-write for critical data; accept eventual for most'],
      ['10TB — all in RAM?', 'Yes for Redis-class; larger: tiered cache (hot in RAM, warm on SSD with Redis on Flash)'],
      ['How to monitor cache health?', 'Hit ratio, eviction rate, memory usage, p99 latency, replication lag per shard'],
      ['Add node without downtime?', 'Add node → reshard slots gradually → each slot migration moves keys live with dual-write period'],
    ],
    checklist: [
      'Consistent hashing with virtual nodes',
      'Cache-aside pattern explained',
      'Delete-on-write (not update-on-write)',
      'Thundering herd + singleflight solution',
      'Primary + replica per shard',
      'Failover and MOVED redirects',
      '95% hit ratio → DB load calculation',
      'Eviction policy (LRU/LFU)',
      '1M ops/sec cluster sizing',
      'Hot key mitigation strategies',
    ],
    tags: ['Redis', 'consistent hashing', 'caching', 'replication', 'performance'],
  },

  // ─── 14. Ticket Booking ─────────────────────────────────────────────
  {
    slug: 'ticket-booking',
    title: 'Design Ticket Booking (Ticketmaster)',
    subtitle: 'Seat inventory, concurrency, temporary holds, payment, and preventing double booking at sale spikes.',
    tip: 'Core problem: atomic seat reservation. Use DB row lock or distributed lock (Redis) + transactional booking flow. Virtual waiting room for on-sale spikes. Hold expires in 5–10 minutes.',
    prompt: `You are a staff engineer conducting a 45-minute system design interview on a ticket booking system like Ticketmaster.

Clarify: browse events, view interactive seat map, select seats, temporary hold (5–10 min), payment, confirmation, no double booking, handle 1M users hitting sale at same second. Scale: 10K events, avg 10K seats/event, 50M tickets sold/year, flash sales with 100K concurrent users.

Walk through seat inventory model, hold mechanism, booking transaction, payment integration, and waiting room for spikes. Require diagram with booking service, inventory DB, hold store, payment service, and queue.

Deep dive on preventing double booking (optimistic vs pessimistic locking), hold expiration, and virtual waiting room token system. Discuss read vs write scaling for seat map.

Ask: "Sale opens at 10am — 500K users hit refresh — what happens?" Score on concurrency control and spike handling.`,
    functional: [
      'Browse events and view available seats on interactive map',
      'Select one or more seats; system holds them temporarily (5–10 min)',
      'Complete payment within hold window to confirm booking',
      'Release hold automatically on timeout or user cancel',
      'Prevent double booking — seat sold to only one user',
      'Send confirmation email with tickets (QR code)',
      'Waitlist when event sold out',
    ],
    nonFunctional: [
      'Zero double bookings (correctness &gt; availability)',
      'Hold + payment flow completes in &lt; 10 minutes',
      'Support 100K concurrent users at sale opening',
      'Seat map loads in &lt; 2s',
      'Booking confirmation within 30s of payment',
    ],
    outOfScope: [
      'Dynamic pricing / surge pricing algorithm',
      'Resale marketplace',
      'Venue management / seat configuration UI',
      'Fraud detection (brief mention)',
    ],
    scale: [
      '50M tickets/year → ~1.6 tickets/sec avg; flash sale: 10K seats in 60s → 167 seats/sec',
      '100K concurrent users at sale open → 100K seat map loads + selection attempts',
      'Seat inventory: 10K events × 10K seats = 100M seat records',
      'Holds: 100K concurrent × 4 seats avg = 400K active holds in Redis',
      'Payment: 167 payments/sec peak → payment gateway handles 1K/sec (OK)',
      'Seat map read: 100K concurrent → CDN cache static map; availability overlay from Redis',
    ],
    scaleNote:
      'Virtual waiting room queues 100K users; admit 10K at a time with random queue tokens. Seat availability in Redis (SET per seat status) for sub-ms atomic check-and-hold. PostgreSQL for confirmed bookings (ACID).',
    architecture:
      archDiagram('Ticket Booking System', [
        [
          { text: 'Users (flash sale spike)', class: 'gray' },
        ],
        [
          { text: 'Virtual Waiting Room (queue)', class: 'orange' },
          { text: 'CDN (seat map static assets)', class: 'gray' },
        ],
        [
          { text: 'Booking API', class: 'purple' },
          { text: 'Seat Map Service', class: '' },
        ],
        [
          { text: 'Hold Service (Redis atomic)', class: 'green' },
          { text: 'Inventory DB (PostgreSQL)', class: 'green' },
        ],
        [
          { text: 'Payment Service', class: 'orange' },
          { text: 'Confirmation + QR Generator', class: '' },
        ],
        [
          { text: 'Notification (email ticket)', class: 'gray' },
        ],
      ]) +
      flow([
        { text: 'Select seats', class: 'gray' },
        { text: 'Atomic hold', class: '' },
        { text: 'Payment', class: 'purple' },
        { text: 'Confirm booking', class: 'green' },
      ]),
    archNotes:
      'Hold flow: Redis SET seat:{eventId}:{seatId} = userId NX EX 600 (set only if not exists, 10 min TTL). If OK → hold granted. Payment success → DB transaction: INSERT booking, UPDATE seat status=booked, DELETE Redis hold. All in one DB transaction.',
    apis: [
      ['GET /v1/events/{id}/seats', 'Seat map + availability', 'Static layout from CDN; availability overlay from Redis (available|held|booked)'],
      ['POST /v1/events/{id}/holds', 'Hold seats', '{seatIds[]} → {holdId, expiresAt}; atomic; 409 if taken'],
      ['DELETE /v1/holds/{holdId}', 'Release hold', 'Frees seats in Redis; idempotent'],
      ['POST /v1/bookings', 'Confirm booking', '{holdId, paymentToken} → bookingId; transactional'],
      ['GET /v1/bookings/{id}', 'Booking details', 'QR code, seat info, event details'],
      ['GET /v1/events/{id}/queue', 'Waiting room status', '{position, estimatedWait} — admit when position &lt; threshold'],
    ],
    dataModel: note(
      `<strong>seats</strong>: <code>event_id</code>, <code>seat_id</code>, <code>section</code>, <code>row</code>, <code>number</code>, <code>status</code> (available|held|booked), <code>version</code> (optimistic lock)<br><br>` +
        `<strong>holds</strong> (Redis): <code>hold:{holdId}</code> → {userId, seatIds[], expiresAt}<br><br>` +
        `<strong>bookings</strong>: <code>booking_id</code>, <code>user_id</code>, <code>event_id</code>, <code>seat_ids[]</code>, <code>payment_id</code>, <code>status</code>, <code>qr_code</code>`
    ),
    storage: [
      ['Redis', 'Seat holds + availability cache', 'Atomic SET NX; TTL auto-expires holds; 400K concurrent holds'],
      ['PostgreSQL', 'Bookings + seat inventory (source of truth)', 'ACID transactions; row-level lock on confirm'],
      ['CDN', 'Static seat map SVG/layout', 'Event layout immutable; availability fetched separately'],
      ['Kafka', 'Booking events', 'Payment confirm → async QR generation + email'],
    ],
    deepDives: [
      {
        title: 'Atomic seat hold with Redis',
        body:
          note(
            `Lua script (atomic): for each seatId, SET seat:{eventId}:{seatId} {userId} NX EX 600. If any SET fails (already held/booked), rollback all previous SETs in script (DEL). Return success only if all seats held. Prevents partial hold race.`
          ) +
          note(
            `Hold expiration: Redis TTL auto-releases. Backup: cron scans holds expiring in 30s, proactively DEL. On expiry event (Redis keyspace notification), update seat map availability.`
          ),
      },
      {
        title: 'Booking confirmation transaction',
        body:
          note(
            `On payment success: BEGIN TRANSACTION → verify holds still valid (check Redis) → UPDATE seats SET status=booked, version=version+1 WHERE seat_id IN (...) AND version=expected → INSERT booking → COMMIT → DEL Redis holds → emit booking event.`
          ) +
          note(
            `Optimistic locking: if version mismatch (concurrent booking somehow passed hold), ROLLBACK and refund payment. Pessimistic: SELECT FOR UPDATE on seat rows — slower but simpler for interview.`
          ),
      },
      {
        title: 'Virtual waiting room',
        body:
          note(
            `Sale opens: all users land on waiting room. Enqueue user_id in Kafka/Redis queue with timestamp. Admit users at rate of 10K/min (protect backend). Client polls queue position every 5s. When admitted: receive session token (30 min validity) → access seat map. Token validated on every API call.`
          ) +
          note(
            `Bots: CAPTCHA on queue entry; rate limit per IP; device fingerprint. Queue token non-transferable (bound to session).`
          ),
      },
      {
        title: 'Seat map at scale',
        body:
          note(
            `Static seat layout (SVG coordinates) served from CDN — never changes. Availability overlay: lightweight API returns {seatId: status} map from Redis (~100KB for 10K seats). Client merges locally. WebSocket push for availability changes (optional — polling every 5s sufficient).`
          ),
      },
    ],
    tradeoffs: [
      ['Hold lock', 'Redis SET NX (pessimistic)', 'DB optimistic version', 'Redis faster for hold; DB for final confirm'],
      ['Sale spike', 'Virtual waiting room', 'Scale backend 100×', 'Waiting room standard; over-provisioning expensive'],
      ['Hold duration', '5 min', '15 min', '5 min reduces inventory lock; 15 min better UX for slow payers'],
      ['Availability', 'Redis cache', 'Direct DB read', 'Redis for speed; DB authoritative on booking'],
      ['Payment fail', 'Release hold immediately', 'Retry payment 3×', 'Release prevents inventory lock; retry better UX'],
    ],
    script: [
      '0–5 min: Clarify browse, hold, pay, confirm flow; flash sale scenario',
      '5–12 min: Scale — 100K concurrent, 10K seats in 60s',
      '12–22 min: Architecture — waiting room, hold service, inventory, payment',
      '22–32 min: Deep dive Redis atomic hold Lua script',
      '32–38 min: Booking confirmation DB transaction',
      '38–42 min: Virtual waiting room for spike',
      '42–45 min: Double-booking prevention guarantee',
    ],
    followUps: [
      ['Two users click same seat simultaneously?', 'Redis SET NX — only one succeeds; other gets 409 Seat Unavailable'],
      ['Payment succeeds but DB commit fails?', 'Idempotent payment ref; retry commit; if hold expired, refund automatically'],
      ['Hold expires during payment?', 'Extend hold on payment initiation; payment gateway webhook confirms within extended window'],
      ['Bot buys all tickets?', 'Waiting room + CAPTCHA + per-user purchase limit (4 tickets) + rate limit'],
      ['Event cancelled after sale?', 'Bulk refund job; UPDATE bookings status=cancelled; notify all bookers'],
      ['How to load test?', 'Simulate 100K queue entries; verify zero double bookings with concurrent hold attempts'],
    ],
    checklist: [
      'Atomic hold with Redis SET NX',
      'Hold TTL auto-expiration (5–10 min)',
      'DB transaction on booking confirm',
      'Optimistic or pessimistic locking explained',
      'Virtual waiting room for flash sales',
      'Zero double booking guarantee',
      'Seat map: static CDN + availability overlay',
      'Payment failure → hold release',
      '100K concurrent users handling',
      'Lua script for multi-seat atomic hold',
    ],
    tags: ['concurrency', 'locking', 'Redis', 'transactions', 'flash sale'],
  },

  // ─── 15. Uber Rides ─────────────────────────────────────────────────
  {
    slug: 'uber-rides',
    title: 'Design Uber / Ride Sharing',
    subtitle: 'Matching drivers and riders, real-time location, surge pricing, trip state machine, and payment.',
    tip: 'Geospatial index (geohash/quadtree) for nearby drivers. Trip state machine: requested → accepted → arrived → ongoing → completed. Separate location service (high write) from trip service.',
    prompt: `You are a principal engineer conducting a 45-minute system design interview on a ride-sharing platform like Uber.

Clarify: rider requests ride, system matches nearby available driver, real-time location tracking, ETA, surge pricing, trip lifecycle, payment after trip, ratings. Scale: 100M riders, 10M drivers, 20M rides/day, location updates every 4 seconds per active driver.

Walk through location service, matching service, trip state machine, pricing, and payment. Require diagram with rider app, driver app, location service, matching service, trip service, and payment.

Deep dive on geospatial indexing for driver search, handling driver location updates at scale, and matching algorithm. Discuss surge pricing and trip state consistency.

Ask: "Rider requests ride in downtown at 5pm Friday — walk through the full flow" and "Driver location updates 250K/sec — how to handle?" Score on geospatial systems and state machine design.`,
    functional: [
      'Rider requests ride: pickup, dropoff, ride type (economy/premium)',
      'Match with nearest available driver (ETA &lt; 5 min)',
      'Real-time driver location on map during trip',
      'Trip lifecycle: requested → accepted → arrived → in-progress → completed',
      'Surge pricing during high demand',
      'Payment charged after trip completion',
      'Ratings for driver and rider after trip',
      'Ride history for rider and driver',
    ],
    nonFunctional: [
      'Match driver within 30s of request p99',
      'Location updates reflected on map within 4s',
      '20M rides/day → ~230 rides/sec avg, ~2K/sec peak (rush hour)',
      '250K location updates/sec (2M active drivers × 1 update/4s)',
      '99.9% availability on matching service',
    ],
    outOfScope: [
      'Driver onboarding and background checks',
      'Food delivery (Uber Eats — mention as extension)',
      'Route optimization / navigation engine',
      'Pool/shared rides matching',
    ],
    scale: [
      '20M rides/day → ~230/sec avg, ~2K/sec peak',
      '10M drivers; 20% active peak = 2M drivers online',
      'Location updates: 2M × 0.25/sec = 500K updates/sec',
      'Geospatial index: 2M active driver locations in memory',
      'Matching queries: 2K/sec peak; each queries ~50 nearby drivers',
      'Trip state storage: 20M trips/day × 30 days = 600M active trip records',
    ],
    scaleNote:
      'Location service is write-heavy and separate from trip service. Geohash grid (precision 6 ≈ 1.2km × 0.6km cells) indexes drivers. Matching: query 9 surrounding cells → rank by distance + ETA + driver rating.',
    architecture:
      archDiagram('Uber Ride-Sharing Platform', [
        [
          { text: 'Rider App', class: 'gray' },
          { text: 'Driver App', class: 'gray' },
        ],
        [
          { text: 'API Gateway + WebSocket', class: 'purple' },
        ],
        [
          { text: 'Trip Service (state machine)', class: 'green' },
          { text: 'Matching Service', class: 'green' },
          { text: 'Location Service', class: 'orange' },
          { text: 'Pricing Service', class: '' },
        ],
        [
          { text: 'Geospatial Index (Redis Geo)', class: 'orange' },
          { text: 'Kafka (location stream)', class: 'purple' },
        ],
        [
          { text: 'Trip DB (Cassandra)', class: 'green' },
          { text: 'Payment Service', class: 'orange' },
          { text: 'Notification Service', class: 'gray' },
        ],
      ]) +
      flow([
        { text: 'Request ride', class: 'gray' },
        { text: 'Geo search drivers', class: '' },
        { text: 'Offer + accept', class: 'purple' },
        { text: 'Trip in progress', class: 'green' },
      ]),
    archNotes:
      'Driver app sends GPS every 4s → Location Service → update Redis Geo index + publish to Kafka → rider app WebSocket subscribes to trip topic. Matching is stateless — queries geo index at request time. Trip state in Cassandra with optimistic locking.',
    apis: [
      ['POST /v1/trips/request', 'Request ride', '{pickup, dropoff, rideType} → {tripId, estimatedFare, surgeMultiplier}'],
      ['POST /v1/trips/{id}/accept', 'Driver accepts', 'Driver only; transitions requested→accepted; notifies rider'],
      ['POST /v1/trips/{id}/status', 'Update trip status', 'arrived|started|completed — state machine validated'],
      ['PUT /v1/drivers/{id}/location', 'Driver GPS update', '{lat, lng, heading, ts} — high frequency, async'],
      ['GET /v1/trips/{id}/location', 'Real-time driver location', 'WebSocket stream or poll; from Kafka trip topic'],
      ['POST /v1/trips/{id}/rate', 'Rate trip', '{rating, comment} — after completion only'],
    ],
    dataModel: note(
      `<strong>trips</strong>: <code>trip_id</code>, <code>rider_id</code>, <code>driver_id</code>, <code>status</code>, <code>pickup</code>, <code>dropoff</code>, <code>fare</code>, <code>surge</code>, <code>created_at</code>, <code>version</code><br><br>` +
        `<strong>driver_locations</strong> (Redis Geo): GEOADD drivers {lng} {lat} {driver_id}; GEORADIUS for search<br><br>` +
        `<strong>drivers</strong>: <code>driver_id</code>, <code>status</code> (available|busy|offline), <code>vehicle_type</code>, <code>rating</code>`
    ),
    storage: [
      ['Redis Geo', 'Active driver locations', 'GEOADD/GEORADIUS; TTL 30s — stale drivers auto-removed'],
      ['Kafka', 'Location stream + trip events', '500K msgs/sec location; trip events for analytics'],
      ['Cassandra', 'Trip records', 'Partition by trip_id; status history; high write throughput'],
      ['PostgreSQL', 'Driver/rider profiles, payments', 'ACID for payment; trip references payment_id'],
    ],
    deepDives: [
      {
        title: 'Geospatial matching',
        body:
          note(
            `On ride request: GEORADIUS pickup_lat_lng 5km WITHDIST COUNT 50 ASC → 50 nearest drivers. Filter: status=available, vehicle_type matches, rating &gt; 4.0. Rank by: ETA (distance/avg_speed) + driver acceptance rate. Send offer to top 3 simultaneously; first accept wins; cancel others.`
          ) +
          note(
            `Geohash precision: 6 chars = ~1.2km cell. Query cell + 8 neighbors. Index update: driver moves → GEOADD overwrites previous position atomically.`
          ),
      },
      {
        title: 'Location update pipeline at 500K/sec',
        body:
          note(
            `Driver app → Location API (async, fire-and-forget) → Kafka topic partitioned by driver_id → consumers: (1) update Redis Geo, (2) if driver in active trip, publish to trip WebSocket topic for rider. API responds 202 immediately — no blocking.`
          ) +
          note(
            `Stale location: Redis TTL 30s on driver key. If no update in 30s, driver marked offline in matching. Driver heartbeat every 4s keeps TTL alive.`
          ),
      },
      {
        title: 'Trip state machine',
        body:
          note(
            `States: REQUESTED → ACCEPTED → ARRIVED → IN_PROGRESS → COMPLETED | CANCELLED. Transitions validated server-side (can't COMPLETE from REQUESTED). Each transition: UPDATE trip SET status=new, version=version+1 WHERE version=expected. Failed transition → 409 Conflict (concurrent update).`
          ) +
          note(
            `Cancellation: rider can cancel before ACCEPTED (free); after ACCEPTED (fee). Driver cancel → re-match rider automatically.`
          ),
      },
      {
        title: 'Surge pricing',
        body:
          note(
            `Surge = f(demand/supply ratio in geohash cell). Demand: ride requests in last 5 min. Supply: available drivers in cell. Ratio &gt; 2.0 → 1.5× surge; &gt; 4.0 → 2.5×. Computed every 1 min by pricing service; cached in Redis per cell. Shown to rider before confirm.`
          ),
      },
    ],
    tradeoffs: [
      ['Geo index', 'Redis Geo (geohash)', 'Quadtree in memory', 'Redis Geo ops-managed; quadtree custom but flexible'],
      ['Matching', 'Broadcast to top 3', 'Sequential offer', 'Broadcast faster; sequential less driver annoyance'],
      ['Location', 'WebSocket push', 'Client poll 4s', 'WebSocket for smooth map; poll simpler'],
      ['Trip storage', 'Cassandra', 'PostgreSQL', 'Cassandra for write scale; PG for simpler ACID'],
      ['Surge', 'Geohash cell', 'City-wide', 'Cell granular; city-wide simpler but unfair'],
    ],
    script: [
      '0–5 min: Clarify request, match, trip lifecycle, payment, location',
      '5–12 min: Scale — 20M rides/day, 500K location updates/sec',
      '12–22 min: Architecture — location, matching, trip, payment services',
      '22–30 min: Geospatial index and matching algorithm deep dive',
      '30–36 min: Location update pipeline (Kafka + Redis Geo)',
      '36–42 min: Trip state machine with version locking',
      '42–45 min: Surge pricing model',
    ],
    followUps: [
      ['No drivers available?', 'Expand search radius incrementally; after 5km show "no drivers"; suggest schedule later'],
      ['Driver accepts then cancels?', 'Trip back to REQUESTED; re-match; penalize driver acceptance rate'],
      ['Rider and driver see different locations?', 'Location eventually consistent; 4s staleness acceptable; rider sees last known'],
      ['Payment fails after trip?', 'Retry 3×; mark trip PAYMENT_PENDING; block rider next request until resolved'],
      ['Driver in tunnel (no GPS)?', 'Last known location used; interpolate; mark low-confidence on map'],
      ['Match during New Year surge?', 'Surge pricing reduces demand; waiting room for riders; incentive bonus for drivers'],
    ],
    checklist: [
      'Geospatial index (Redis Geo / geohash)',
      'GEORADIUS for nearby driver search',
      'Location update async via Kafka',
      'Trip state machine with valid transitions',
      'Optimistic locking on trip status',
      'Broadcast offer to top N drivers',
      '500K location updates/sec handling',
      'Stale driver TTL (30s heartbeat)',
      'Surge pricing by geohash cell',
      'WebSocket for real-time rider map',
    ],
    tags: ['geospatial', 'real-time', 'matching', 'state machine', 'location'],
  },
];

function withDataFlow(c) {
  if (c.dataFlow) return c;
  return {
    ...c,
    dataFlow:
      diagram(
        'End-to-end execution flow',
        flow([
          { text: '① Client', class: 'gray' },
          { text: '② API / LB', class: '' },
          { text: '③ Core services', class: 'purple' },
          { text: '④ Cache + DB', class: 'green' },
          { text: '⑤ Message queue', class: 'orange' },
          { text: '⑥ Async workers', class: 'purple' },
        ])
      ) +
      layers([
        'Sync path: validate → authorize → read/write primary store',
        'Async path: publish domain events → consumers (email, analytics, search index)',
        'Read-heavy path: CDN / edge cache → regional cache → DB replica',
        'Failure path: retry with backoff, DLQ, idempotent handlers',
      ]),
    dataFlowNotes:
      'In interviews, trace one user action through this diagram. State what is synchronous (user waits) vs asynchronous (background), and where you enforce idempotency.',
  };
}

export const sdConfigs = [...baseSdConfigs, ...extraSdConfigs].map(withDataFlow);

export const sdPages = buildSDPages(sdConfigs);

