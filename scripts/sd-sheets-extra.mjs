import {
  note,
  table,
  archDiagram,
  flow,
  layers,
  tags,
  diagram,
} from './sheet-helpers.mjs';

/** Compact factory — each topic still has unique content fields */
function mk(c) {
  return c;
}

export const extraSdConfigs = [
  mk({
    slug: 'distributed-search',
    title: 'Design Distributed Search',
    subtitle: 'Inverted index, sharding, replication, ranking, and query fan-out at billions of documents.',
    tip: 'Separate indexing pipeline (async) from query path (sync). Mention inverted index, BM25 ranking, shard routing, and replica load balancing for hot queries.',
    prompt: `You are a principal engineer interviewing a candidate on designing a distributed search system like Elasticsearch.

Clarify functional requirements (full-text search, filters, facets, autocomplete hooks) and non-functional (sub-200ms p99, horizontal scale, near-real-time indexing). Assume 10B documents, 5K queries/sec peak, 100K docs/sec ingest.

Require inverted index design, shard placement, query coordinator fan-out, merge/rank, and failure handling when a shard is slow. Deep dive on mapping updates, rebalancing, and consistency between primary and replica.

Challenge: viral query overloads one shard — how do you mitigate? Score on indexing vs query path separation and back-of-envelope math.`,
    functional: [
      'Index documents with JSON fields; support full-text search on title/body',
      'Filter by metadata (date range, category, geo bounding box)',
      'Return ranked results with snippets/highlights',
      'Faceted counts (e.g. brand, price bucket) alongside hits',
      'Near-real-time indexing — documents searchable within seconds',
      'Delete/update documents by ID',
    ],
    nonFunctional: [
      'Query p99 &lt; 200ms for 95% of queries',
      'Horizontally scale to 10B+ documents',
      '99.9% availability — tolerate shard replica loss',
      '5K QPS aggregate with burst to 20K',
      'Index throughput 100K docs/sec sustained',
    ],
    outOfScope: ['ML re-ranking models', 'Multi-language stemming tuning', 'Federated cross-cluster search'],
    scale: [
      '10B docs × 2KB avg inverted index overhead ≈ 20TB index data',
      '5K QPS × 50ms shard latency → ~250 concurrent shard queries',
      '100 shards × 100M docs each; 2 replicas → 300 shard copies',
      'Ingest 100K docs/sec → Kafka buffer + bulk index every 5s',
      'Hot query fan-out: coordinator hits all shards → merge top-K',
    ],
    scaleNote:
      'Use routing key (user_id or tenant) when queries are scoped — reduces fan-out from 100 shards to 1–3. Cache top queries at coordinator for 30s.',
    architecture:
      archDiagram('Distributed Search Cluster', [
        [{ text: 'Clients / API Gateway', class: 'gray' }],
        [{ text: 'Query Coordinator (scatter-gather)', class: 'purple' }],
        [
          { text: 'Shard 1 Primary + Replicas', class: 'green' },
          { text: 'Shard 2 Primary + Replicas', class: 'green' },
          { text: 'Shard N…', class: 'green' },
        ],
        [{ text: 'Ingest Pipeline (Kafka → bulk indexer)', class: 'orange' }],
        [{ text: 'Object store / segment files', class: 'gray' }],
      ]) +
      flow([
        { text: 'Query', class: 'gray' },
        { text: 'Coordinator', class: 'purple' },
        { text: 'Shard fan-out', class: 'green' },
        { text: 'Merge + rank', class: 'orange' },
      ]),
    archNotes:
      'Each shard holds inverted index segments (postings lists). Coordinator parses query → builds shard requests → gathers top-K per shard → global merge. Writes go to primary; replicas catch up asynchronously.',
    dataFlow:
      diagram(
        'Query execution path',
        flow([
          { text: '① Parse query', class: 'gray' },
          { text: '② Route shards', class: '' },
          { text: '③ Parallel shard search', class: 'purple' },
          { text: '④ Merge BM25 scores', class: 'green' },
          { text: '⑤ Return page', class: 'orange' },
        ])
      ) +
      layers([
        'Index path: Kafka → bulk buffer → segment build → refresh reader',
        'Query path: scatter to primaries/replicas → top-K heap per shard',
        'Slow shard: coordinator uses partial results + timeout cutoff',
        'Rebalance: relocate segments with dual-write window',
      ]),
    dataFlowNotes:
      'Walk both write and read paths. Emphasize that indexing is async and search reads immutable segments for predictable latency.',
    apis: [
      ['POST /index/{id}', 'Upsert document', 'Async ack after Kafka enqueue'],
      ['GET /search?q=…', 'Full-text search', 'Coordinator scatter-gather'],
      ['POST /search', 'Complex query DSL', 'Filters + facets in one request'],
      ['DELETE /index/{id}', 'Remove document', 'Tombstone in segment'],
      ['GET /health', 'Cluster status', 'Shard allocation + lag metrics'],
    ],
    dataModel: note(
      'Document: <code>id</code>, <code>fields</code> (text, keyword, numeric, geo). Inverted index: term → postings list (doc_id, positions, norms). Segment: immutable Lucene-style file set per shard.'
    ),
    storage: [
      ['Shard local disk', 'Inverted index segments', 'Fast random access; merge compactions'],
      ['Kafka', 'Ingest log', 'Durability before index'],
      ['ZooKeeper / etcd', 'Cluster metadata', 'Shard map, leader election'],
      ['S3 (optional)', 'Cold segment snapshots', 'Backup and rehydrate'],
    ],
    deepDives: [
      {
        title: 'Inverted index and BM25 ranking',
        body: note(
          'Tokenizer → terms → postings. BM25 balances term frequency and document length. Coordinator merges shard-level scores; optional second-stage reranker on top 100.'
        ),
      },
      {
        title: 'Shard routing and hot keys',
        body: note(
          'Default hash(doc_id) for even spread. Scoped queries use routing key to limit fan-out. Hot shard: add replica read preference + query cache; split shard if sustained hot.'
        ),
      },
    ],
    tradeoffs: [
      ['Shard count', 'More shards', 'Fewer shards', 'More shards = more fan-out overhead but smaller rebalance blast'],
      ['Consistency', 'Primary read', 'Replica read', 'Replica lowers load; primary for freshest writes'],
      ['Index refresh', '1s NRT', '30s batch', 'Faster refresh = more CPU on segment merges'],
      ['Coordinator cache', 'Cache query results', 'Always fan-out', 'Cache helps trending queries; stale risk'],
    ],
    script: [
      '0–5 min: Requirements — search, filter, facets, NRT indexing',
      '5–12 min: Scale math — docs, QPS, index size',
      '12–20 min: Architecture — coordinator, shards, ingest pipeline',
      '20–28 min: Query fan-out and merge ranking',
      '28–35 min: Indexing pipeline and segment merges',
      '35–42 min: Failure modes — slow shard, node loss, rebalance',
    ],
    followUps: [
      ['How handle typo tolerance?', 'Fuzzy query expansion, phonetic tokens, or dedicated spell-check index on query side'],
      ['Reindex mapping change on 10B docs?', 'Dual-write to new index version; alias swap when ready; background reindex from source'],
      ['Cross-field search vs per-field boosts?', 'Multi-match query with per-field weights in DSL; tune boosts via offline eval'],
    ],
    checklist: [
      'Inverted index + BM25',
      'Scatter-gather coordinator',
      'Shard primary + replicas',
      'Kafka ingest buffer',
      'Routing key for scoped queries',
      'Segment merges and refresh',
      'Query timeout + partial results',
      'Rebalance without downtime',
    ],
    tags: ['search', 'inverted-index', 'sharding', 'elasticsearch', 'ranking'],
  }),

  mk({
    slug: 'distributed-logging',
    title: 'Design Distributed Logging',
    subtitle: 'High-volume log ingestion, indexing, retention tiers, and search across petabytes.',
    tip: 'Separate hot write path (append-only) from query path. Mention Kafka, time-based indices, and retention (hot/warm/cold).',
    prompt: `Interview the candidate on a centralized logging platform like Splunk or ELK at scale.

Requirements: agents ship logs from 50K hosts, 2M events/sec peak, search last 7 days in seconds, retain 90 days cheaply. Walk ingestion, parsing, indexing, storage tiers, and query DSL.

Deep dive: backpressure when Kafka lags, cardinality explosion in fields, and securing multi-tenant log access.`,
    functional: [
      'Collect logs/metrics from services via agents or sidecars',
      'Parse structured and unstructured lines into fields',
      'Search by keyword, field filters, and time range',
      'Dashboards and saved queries',
      'Alerting on query thresholds (error rate spike)',
      'Per-team namespaces with ACLs',
    ],
    nonFunctional: [
      'Ingest 2M events/sec sustained',
      'Query p95 &lt; 5s for 24h window on common filters',
      '99.9% ingest availability',
      '90-day retention with tiered storage cost',
      'No single tenant can starve shared pipeline',
    ],
    scale: [
      '2M events/sec × 500 bytes ≈ 1 GB/sec raw',
      '7-day hot index ≈ 60TB before compression',
      'Time-based indices: hourly shards → easy drop/rollover',
      '20 query nodes for parallel scan',
      'Compression 5× on cold tier → S3 Glacier',
    ],
    architecture:
      archDiagram('Logging Platform', [
        [{ text: 'Log agents / Fluent Bit', class: 'gray' }],
        [{ text: 'Kafka (partition by service)', class: 'orange' }],
        [{ text: 'Stream parsers → enrich', class: 'purple' }],
        [{ text: 'Indexer cluster (hot)', class: 'green' }],
        [{ text: 'Object store (warm/cold)', class: 'gray' }],
        [{ text: 'Query API + UI', class: 'purple' }],
      ]),
    archNotes: 'Agents batch and compress. Kafka absorbs spikes. Indexers bulk-write time-sliced indices. ILM policy rolls hot → warm → delete.',
    dataFlow:
      diagram(
        'Log event lifecycle',
        flow([
          { text: '① Agent batch', class: 'gray' },
          { text: '② Kafka partition', class: 'orange' },
          { text: '③ Parse/enrich', class: 'purple' },
          { text: '④ Bulk index', class: 'green' },
          { text: '⑤ Query scan', class: '' },
        ])
      ) +
      layers([
        'At-least-once ingest with offset commits',
        'Schema-on-read for unstructured logs',
        'Hot tier: SSD indices last 48h',
        'Cold tier: S3 + async restore for forensics',
      ]),
    dataFlowNotes: 'Trace one ERROR log line from host to searchable index. Mention duplicate handling via event_id.',
    apis: [
      ['POST /v1/logs', 'Agent ingest', 'gzip batch; 202 accepted'],
      ['GET /search', 'Query DSL', 'time range + filters'],
      ['POST /alerts', 'Create alert', 'runs query every N minutes'],
      ['GET /indices', 'Retention status', 'per-tenant rollover'],
    ],
    dataModel: note('Event: timestamp, service, level, message, trace_id, host, custom fields. Index template per service family.'),
    storage: [
      ['Kafka', 'Ingest buffer', '24h retention for replay'],
      ['Hot Elasticsearch', 'Recent logs', 'Fast search'],
      ['S3', 'Cold archive', 'Cheap long retention'],
    ],
    deepDives: [
      {
        title: 'Cardinality and field explosion',
        body: note(
          'High-cardinality fields (user_id on every line) bloat indices. Use sampling for metrics, separate high-cardinality store, or indexed only on ERROR level.'
        ),
      },
      {
        title: 'Multi-tenant isolation',
        body: note(
          'Namespace per team; RBAC on indices. Rate limit ingest per tenant. Noisy neighbor: dedicated Kafka topic quotas.'
        ),
      },
    ],
    tradeoffs: [
      ['Ingest', 'Kafka', 'Direct HTTP', 'Kafka handles spikes and replay'],
      ['Index', 'Elasticsearch', 'ClickHouse', 'ES for text; CH for analytics aggregates'],
      ['Retention', 'Time indices', 'Single huge index', 'Time indices simplify delete'],
      ['Parsing', 'At ingest', 'At query', 'Ingest parsing speeds search; query parsing flexible'],
    ],
    script: [
      '0–5 min: Requirements and retention',
      '5–12 min: Volume math',
      '12–22 min: Pipeline diagram',
      '22–32 min: Indexing and ILM tiers',
      '32–40 min: Query performance and alerts',
    ],
    followUps: [
      ['Trace_id correlation across services?', 'Shared trace_id field indexed; join queries or trace store (Jaeger) linked from log UI'],
      ['PII scrubbing at ingest?', 'Regex + ML scrubber in parser stage before index; drop or hash sensitive fields'],
      ['Live tail vs search?', 'Live tail reads Kafka consumer lag stream; search hits indexed store — different paths'],
    ],
    checklist: [
      'Agent batching + compression',
      'Kafka backpressure',
      'Time-based indices',
      'ILM hot/warm/cold',
      'Tenant ACLs',
      'Cardinality controls',
      'Alerting on scheduled queries',
      'Replay from Kafka on indexer failure',
    ],
    tags: ['logging', 'elk', 'kafka', 'observability', 'retention'],
  }),

  mk({
    slug: 'distributed-task-scheduler',
    title: 'Design Distributed Task Scheduler',
    subtitle: 'Cron at scale — leader election, job queue, at-least-once execution, and idempotent workers.',
    tip: 'Split schedule metadata store from execution queue. Mention leader for cron tick, partition jobs by shard, and visibility timeout for stuck workers.',
    prompt: `Design a distributed scheduler running millions of cron jobs across a cluster (Airflow / internal cron service).

Cover: job registration, exactly-once schedule firing (per minute), worker pool execution, retries, DAG dependencies optional. Scale: 10M scheduled jobs, 50K executions/sec peak.`,
    functional: [
      'Register job with cron expression or fixed interval',
      'Trigger execution at scheduled time',
      'Retry failed runs with backoff',
      'Pause/resume and manual trigger',
      'View run history and status',
      'Optional DAG dependencies between jobs',
    ],
    nonFunctional: [
      'Fire within 1s of scheduled minute',
      '50K concurrent executions',
      'At-least-once execution with idempotent workers',
      'Survive scheduler leader failure in &lt;10s',
      'Fair scheduling across tenants',
    ],
    scale: [
      '10M jobs → minute tick evaluates subset via time buckets',
      '50K workers pull from partitioned queues',
      'Metadata DB: job defs + run records',
      'Leader scans next 60s window every second',
    ],
    architecture:
      archDiagram('Task Scheduler', [
        [{ text: 'API (job CRUD)', class: 'gray' }],
        [{ text: 'Metadata DB (jobs, runs)', class: 'green' }],
        [{ text: 'Leader scheduler (elected)', class: 'purple' }],
        [{ text: 'Execution queues (sharded)', class: 'orange' }],
        [{ text: 'Worker pool', class: 'gray' }],
      ]),
    archNotes: 'Only leader advances cron clock. Enqueues run_id to shard queue by hash(job_id). Workers ack after success; visibility timeout requeues on crash.',
    dataFlow:
      diagram(
        'Scheduled run execution',
        flow([
          { text: '① Leader tick', class: 'gray' },
          { text: '② Enqueue run', class: 'orange' },
          { text: '③ Worker pull', class: 'purple' },
          { text: '④ Execute + log', class: 'green' },
          { text: '⑤ Ack / retry', class: '' },
        ])
      ) +
      layers([
        'Leader election via etcd lease',
        'Time bucket index for O(log n) job lookup',
        'Idempotency key = run_id in worker',
        'DLQ after max retries',
      ]),
    dataFlowNotes: 'Explain how you avoid double-fire when leader fails mid-tick — transactional outbox or lease-bound tick version.',
    apis: [
      ['POST /jobs', 'Create scheduled job', 'cron + payload + retry policy'],
      ['POST /jobs/{id}/run', 'Manual trigger', 'enqueue immediately'],
      ['GET /runs/{id}', 'Run status', 'pending|running|success|failed'],
      ['DELETE /jobs/{id}', 'Remove schedule', 'soft delete + stop future runs'],
    ],
    dataModel: note('Job: id, cron, payload, tenant, next_run_at. Run: run_id, job_id, status, started_at, attempts.'),
    storage: [
      ['PostgreSQL', 'Job metadata + runs', 'ACID for schedule state'],
      ['Redis/SQS queues', 'Execution queue', 'Sharded by job_id hash'],
      ['etcd', 'Leader lock', 'Single active scheduler'],
    ],
    deepDives: [
      {
        title: 'Cron evaluation at 10M jobs',
        body: note(
          'Bucket jobs by next_run minute in Redis sorted set. Leader pulls due bucket only — not scan 10M rows. Pre-compute next_fire on each execution.'
        ),
      },
      {
        title: 'Exactly-once vs at-least-once',
        body: note(
          'True exactly-once hard — use at-least-once + idempotent workers (dedupe by run_id). Optional dedupe store with TTL for side effects.'
        ),
      },
    ],
    tradeoffs: [
      ['Queue', 'Kafka', 'SQS', 'Kafka ordering per partition; SQS simpler ops'],
      ['Leader', 'Single leader', 'Distributed tick', 'Single leader simpler; shard leaders for scale'],
      ['DAG', 'Built-in', 'External orchestrator', 'DAG adds complexity — scope carefully'],
      ['Storage', 'SQL', 'etcd only', 'SQL for history queries; etcd for small coordination'],
    ],
    script: [
      '0–5 min: Cron + execution requirements',
      '5–12 min: Scale — jobs vs executions/sec',
      '12–22 min: Leader + queue + workers',
      '22–32 min: Failure, retry, idempotency',
      '32–40 min: DAG mention if time',
    ],
    followUps: [
      ['Job runs long past next schedule?', 'Skip or queue overlapping run based on policy; max_concurrent_runs per job'],
      ['Timezone handling?', 'Store cron in UTC + tenant TZ; convert at schedule registration'],
      ['Priority queues?', 'Separate queues per priority tier; workers poll high first'],
    ],
    checklist: [
      'Leader election',
      'Time-bucket job index',
      'Sharded execution queues',
      'Visibility timeout',
      'Idempotent run_id',
      'Run history audit',
      'Tenant fair-share',
      'DLQ for poison jobs',
    ],
    tags: ['scheduler', 'cron', 'distributed', 'queue', 'leader-election'],
  }),

  mk({
    slug: 'shared-counter',
    title: 'Design Shared Counter',
    subtitle: 'Global view/like counters — sharding, aggregation, and read-your-writes at billions of events/day.',
    tip: 'Separate hot counter shards from periodic flush to DB. Mention local aggregation, Redis INCR, and handling counter rebuild after loss.',
    prompt: `Design a global counter service (video views, post likes) at YouTube/Twitter scale.

100B increments/day, read count any time, tolerate approximate counts briefly, minimize write amplification. Discuss sharding, batching, and fan-out reads.`,
    functional: [
      'increment(entity_id) — add 1 or N',
      'get_count(entity_id) — current total',
      'batch_get(entity_ids[]) — mget counts',
      'Optional decrement for unlike',
      'Admin reset / adjust count',
    ],
    nonFunctional: [
      '1M increments/sec peak',
      'get p99 &lt; 10ms',
      'Counts accurate within 1% or flush every few seconds',
      'Horizontally scalable',
      'Survive Redis node loss without permanent drift',
    ],
    scale: [
      '100B/day ≈ 1.2M incr/sec average; 3× peak → ~4M/sec',
      '1B entities — most cold, top 1% hot',
      'Batch flush every 5s reduces DB writes 100×',
      '100 counter shards × Redis cluster',
    ],
    architecture:
      archDiagram('Counter Service', [
        [{ text: 'Clients', class: 'gray' }],
        [{ text: 'Counter API', class: 'purple' }],
        [{ text: 'Redis shards (INCR)', class: 'green' }],
        [{ text: 'Flush workers → DB', class: 'orange' }],
        [{ text: 'Read cache / CDN edge', class: 'gray' }],
      ]),
    archNotes: 'increment always hits Redis shard. Periodic flush merges shard delta into Cassandra/DB. Cold entities read from DB + cache.',
    dataFlow:
      diagram(
        'Increment path',
        flow([
          { text: '① INCR shard', class: 'gray' },
          { text: '② Async flush', class: 'orange' },
          { text: '③ Merge DB total', class: 'green' },
          { text: '④ Read cache', class: 'purple' },
        ])
      ) +
      layers([
        'Hot path: Redis INCR only — no DB on write',
        'Flush: shard delta + persisted_total',
        'Read: Redis + DB persisted + delta',
        'Rebuild: replay increment log if Redis lost',
      ]),
    dataFlowNotes: 'Clarify acceptable staleness on read vs write cost. Viral video = hot key — local aggregator on API nodes.',
    apis: [
      ['POST /v1/incr/{id}', 'Increment', 'returns new approximate count'],
      ['GET /v1/count/{id}', 'Read count', 'cache-aside'],
      ['POST /v1/mget', 'Batch read', 'parallel shard fetch'],
    ],
    dataModel: note('Redis: counter_key → integer delta. DB: entity_id → persisted_total, flushed_at. Optional Kafka log for replay.'),
    storage: [
      ['Redis cluster', 'Hot counters', 'INCR atomic'],
      ['Cassandra', 'Persisted totals', 'Wide-column per entity'],
      ['Kafka', 'Increment log', 'Replay and analytics'],
    ],
    deepDives: [
      {
        title: 'Hot key mitigation',
        body: note(
          'Per-API-node local buffer aggregates 1000 increments before single INCR. Risk brief loss on crash — acceptable for views. Or replicate hot key across nodes with periodic merge.'
        ),
      },
      {
        title: 'Accuracy vs cost',
        body: note(
          'Flush every 5s: reads may lag few seconds. For likes show exact — shorter flush or read from Redis primary only.'
        ),
      },
    ],
    tradeoffs: [
      ['Store', 'Redis + DB', 'DB only', 'Redis for speed; DB for durability'],
      ['Flush', 'Time-based', 'Threshold-based', 'Time simpler; threshold fewer writes for cold keys'],
      ['Hot key', 'Local aggregate', 'Key replicate', 'Local aggregate lower Redis load'],
      ['Accuracy', 'Strong', 'Eventual', 'Views tolerate eventual; payments need strong'],
    ],
    script: [
      '0–5 min: incr/get requirements',
      '5–10 min: Scale math',
      '10–20 min: Redis shard + flush',
      '20–30 min: Hot key and accuracy',
      '30–38 min: Failure recovery',
    ],
    followUps: [
      ['Unique viewer vs raw views?', 'Separate dedupe set (HyperLogLog or bloom) for unique; raw incr for total views'],
      ['Global vs per-region counts?', 'Regional shards + periodic merge to global aggregate for display'],
      ['Counter reset attack?', 'Rate limit incr per IP/user; cap velocity; anomaly detection on spikes'],
    ],
    checklist: [
      'Redis INCR sharding',
      'Periodic DB flush',
      'Hot key local aggregation',
      'Kafka replay log',
      'batch_get parallel',
      'Read merge persisted + delta',
      'Monitoring shard balance',
      'Rate limit abusive incr',
    ],
    tags: ['counter', 'redis', 'hot-key', 'aggregation', 'scale'],
  }),

  mk({
    slug: 'quora',
    title: 'Design Quora',
    subtitle: 'Q&A feeds, topic graph, ranking, and moderation at hundreds of millions of questions.',
    tip: 'Model Question, Answer, Topic, User. Feed = mix of topic interest + social graph + quality score. Search overlaps with distributed search patterns.',
    prompt: `Design Quora — ask questions, write answers, follow topics, personalized home feed, voting, moderation.

Scale: 100M users, 50M questions, 200M answers, 10M DAU. Deep dive feed ranking and preventing low-quality answer spam.`,
    functional: [
      'Post question with topics',
      'Write/edit answers with rich text',
      'Upvote/downvote answers',
      'Follow topics and users',
      'Personalized home feed of questions',
      'Search questions and answers',
    ],
    nonFunctional: [
      'Feed generation p99 &lt; 300ms',
      '99.9% availability',
      'Moderation queue for flagged content',
      'Global CDN for read-heavy traffic',
      'Eventual consistency OK for vote counts',
    ],
    scale: [
      '10M DAU × 50 feed items = 500M feed cells/day precomputed',
      '200 writes/sec answers peak',
      'Vote bursts on viral answer: 10K/sec incr',
      'Search: 2K QPS',
    ],
    architecture:
      archDiagram('Quora Architecture', [
        [{ text: 'Web / mobile clients', class: 'gray' }],
        [{ text: 'API gateway', class: 'purple' }],
        [
          { text: 'Q&A service', class: 'green' },
          { text: 'Feed service', class: 'green' },
          { text: 'Vote/counter service', class: 'orange' },
        ],
        [{ text: 'Search index', class: 'purple' }],
        [{ text: 'PostgreSQL + Cassandra', class: 'gray' }],
      ]),
    archNotes: 'Questions/answers in SQL for ACID edits. Feed candidates precomputed on write fan-out to followers. Votes via counter service.',
    dataFlow:
      diagram(
        'New answer fan-out',
        flow([
          { text: '① Post answer', class: 'gray' },
          { text: '② Persist Q&A DB', class: 'green' },
          { text: '③ Fan-out feed cells', class: 'purple' },
          { text: '④ Index search', class: 'orange' },
          { text: '⑤ Notify followers', class: '' },
        ])
      ) +
      layers([
        'Feed read: pull precomputed cells + rank on read',
        'Topic graph expands candidate pool',
        'Quality score decays spam answers',
        'Async moderation ML scan',
      ]),
    dataFlowNotes: 'Contrast fan-out on write (followers) vs fan-in on read for home feed — pick hybrid for celebrity authors.',
    apis: [
      ['POST /questions', 'Create question', 'topics[] required'],
      ['POST /answers', 'Post answer', 'question_id + body'],
      ['GET /feed', 'Home feed', 'cursor pagination'],
      ['POST /vote', 'Upvote answer', 'idempotent per user'],
      ['GET /search', 'Search Q&A', 'delegates to search cluster'],
    ],
    dataModel: note('Question, Answer, Topic, UserTopic, Vote(user, answer), FeedCell(user, question, score, ts).'),
    storage: [
      ['PostgreSQL', 'Q&A content', 'ACID edits'],
      ['Cassandra', 'Feed cells per user', 'Wide rows by user_id'],
      ['Redis', 'Hot feeds cache', 'Top stories'],
      ['Search cluster', 'Full-text', 'Questions + answers'],
    ],
    deepDives: [
      {
        title: 'Feed ranking features',
        body: note(
          'Score = topic_match × author_quality × recency × social_proof (votes). Train logistic model offline; serve weighted sum online for speed.'
        ),
      },
      {
        title: 'Celebrity fan-out',
        body: note(
          'User with 10M followers: skip write fan-out — merge celebrity posts at read time from celebrity bucket.'
        ),
      },
    ],
    tradeoffs: [
      ['Feed', 'Fan-out write', 'Fan-in read', 'Hybrid for celebrities'],
      ['Votes', 'Counter service', 'DB row', 'Counter service for hot answers'],
      ['Content', 'SQL', 'NoSQL', 'SQL for editable rich text'],
      ['Moderation', 'Sync block', 'Async queue', 'Async ML + human review queue'],
    ],
    script: [
      '0–5 min: Q&A + feed requirements',
      '5–12 min: Scale and DAU math',
      '12–22 min: Services diagram',
      '22–32 min: Feed fan-out + ranking',
      '32–40 min: Search + moderation',
    ],
    followUps: [
      ['Duplicate questions merge?', 'Detect similar titles via embedding similarity; moderator merges canonical question'],
      ['Anonymous posting?', 'Pseudonymous user_id; still rate limit; reduced trust weight in ranking'],
      ['Multi-language?', 'Language detect on post; separate search indices or multilingual embeddings'],
    ],
    checklist: [
      'Q&A data model',
      'Topic graph',
      'Feed precomputation',
      'Celebrity hybrid fan-out',
      'Vote counter service',
      'Search indexing',
      'Moderation pipeline',
      'CDN for static assets',
    ],
    tags: ['quora', 'feed', 'qa', 'ranking', 'social'],
  }),

  mk({
    slug: 'google-maps',
    title: 'Design Google Maps',
    subtitle: 'Tiles, routing, geospatial index, real-time traffic, and global CDN delivery.',
    tip: 'Split map tiles (static CDN) from dynamic routing (graph search). Mention quadtree/geohash, A*/Dijkstra on contracted graphs, and traffic-weighted edges.',
    prompt: `Design Google Maps core: map display, search places, route from A to B, ETA with traffic.

Scale: 1B users, 10K route requests/sec, petabyte tile corpus. Deep dive routing graph preprocessing and tile pyramid.`,
    functional: [
      'Display map tiles at zoom levels',
      'Search places by name or category',
      'Compute driving route A → B',
      'ETA with live traffic',
      'Turn-by-turn navigation updates',
      'Save favorite places',
    ],
    nonFunctional: [
      'Route p99 &lt; 500ms for metro areas',
      'Tile load &lt; 100ms via CDN',
      'Global availability 99.99%',
      'Traffic data refreshed every 1–2 minutes',
      'Offline map packs for mobile',
    ],
    scale: [
      'Tile pyramid: zoom 0–20 → billions of tiles, mostly static CDN',
      'Routing graph: continental graph contracted to GB-scale in memory',
      '10K route QPS → GPU/CPU farm for path search',
      'Traffic: 100M road segments updated per minute',
    ],
    architecture:
      archDiagram('Google Maps', [
        [{ text: 'Mobile / web clients', class: 'gray' }],
        [{ text: 'CDN (map tiles)', class: 'green' }],
        [{ text: 'Places API + search', class: 'purple' }],
        [{ text: 'Routing service (graph)', class: 'orange' }],
        [{ text: 'Traffic ingestion pipeline', class: 'purple' }],
        [{ text: 'Geospatial index DB', class: 'gray' }],
      ]),
    archNotes: 'Tiles immutable — aggressive CDN cache. Routing uses preprocessed hierarchical graph (highways first). Traffic overlays edge weights.',
    dataFlow:
      diagram(
        'Route request path',
        flow([
          { text: '① Snap A,B to graph', class: 'gray' },
          { text: '② Load traffic weights', class: 'orange' },
          { text: '③ Bidirectional search', class: 'purple' },
          { text: '④ Polyline encode', class: 'green' },
          { text: '⑤ Return ETA + steps', class: '' },
        ])
      ) +
      layers([
        'Tile path: CDN cache hit → no origin',
        'Place search: geospatial index + text search',
        'Navigation: periodic reroute on traffic delta',
        'Mobile offline: bundled tile region packs',
      ]),
    dataFlowNotes: 'Separate static tile delivery from compute-heavy routing. Mention contraction hierarchies for interview depth.',
    apis: [
      ['GET /tiles/{z}/{x}/{y}', 'Map tile', 'CDN cached'],
      ['GET /places/search', 'Place search', 'lat,lng + query'],
      ['POST /routes', 'Compute route', 'mode=driving|walking'],
      ['GET /routes/{id}/traffic', 'Reroute hint', 'WebSocket for nav'],
    ],
    dataModel: note('Road graph: nodes, edges, speed limits. Tiles: z/x/y PNG/vector. Place: name, lat, lng, categories. Traffic: edge_id → speed_factor.'),
    storage: [
      ['CDN + S3', 'Map tiles', 'Immutable static'],
      ['In-memory graph', 'Routing', 'Preprocessed CH index'],
      ['PostGIS / S2', 'Place index', 'Geo queries'],
      ['Redis', 'Traffic overlay', 'TTL 2 min'],
    ],
    deepDives: [
      {
        title: 'Contraction hierarchies',
        body: note(
          'Preprocess graph offline to add shortcut edges. Query runs bidirectional search on hierarchy — ms on continental graphs vs seconds on raw Dijkstra.'
        ),
      },
      {
        title: 'Tile pyramid',
        body: note(
          'Web Mercator grid. Parent tile covers 4 children. Vector tiles reduce bandwidth vs raster. CDN cache keyed by tile URL forever (immutable version in path).'
        ),
      },
    ],
    tradeoffs: [
      ['Routing', 'CH preprocess', 'Live Dijkstra', 'CH fast query; heavy preprocess on map updates'],
      ['Tiles', 'Vector', 'Raster', 'Vector smaller + style client; raster simpler'],
      ['Traffic', 'Probe fusion', 'Fixed historical', 'Live traffic better ETA; fallback patterns'],
      ['Search', 'Geo first', 'Text first', 'Geo bias when lat/lng known'],
    ],
    script: [
      '0–5 min: Map + route + search',
      '5–12 min: Tile CDN vs routing compute',
      '12–22 min: Routing graph + traffic',
      '22–32 min: Place search geospatial',
      '32–40 min: Navigation reroute',
    ],
    followUps: [
      ['Multi-modal transit?', 'Layered graphs per mode; transfer edges at stations; longer compute budget'],
      ['Map update pipeline?', 'Probe + government feeds → traffic service; weekly graph rebuild for road changes'],
      ['Privacy on location history?', 'On-device storage option; server TTL; aggregate analytics only'],
    ],
    checklist: [
      'Tile CDN pyramid',
      'Road graph storage',
      'Contraction hierarchies',
      'Traffic-weighted edges',
      'Place geospatial index',
      'Route polyline encoding',
      'Reroute on traffic',
      'Offline region packs',
    ],
    tags: ['maps', 'routing', 'geospatial', 'cdn', 'traffic'],
  }),

  mk({
    slug: 'proximity-service',
    title: 'Design Proximity Service',
    subtitle: 'Nearby restaurants/places — geohash indexing, radius search, and ranking by distance + quality.',
    tip: 'Like Yelp nearby: GEORADIUS on Redis Geo or S2 cells. Clarify update frequency of business hours and duplicate listing merge.',
    prompt: `Design a proximity service: find businesses near lat/lng within radius, filter by category, sort by distance/rating.

Different from ride-matching — static POIs, read-heavy, periodic updates. 50M POIs, 20K QPS nearby search.`,
    functional: [
      'Search POIs within radius of point',
      'Filter by category, price, open_now',
      'Sort by distance, rating, or blended score',
      'Get POI details (hours, photos, reviews link)',
      'Business owner update listing',
      'Report closed or incorrect listing',
    ],
    nonFunctional: [
      'Search p99 &lt; 100ms',
      '50M POIs indexed',
      '20K nearby QPS',
      'Index updates within 5 minutes',
      '99.9% availability',
    ],
    scale: [
      '50M POIs × 200 bytes geo index ≈ 10GB geo index',
      '20K QPS → Redis cluster or partitioned cell index',
      'Top 20 results per query — early terminate radius expansion',
      'Updates 1K/sec peak (hours changes)',
    ],
    architecture:
      archDiagram('Proximity Service', [
        [{ text: 'Client apps', class: 'gray' }],
        [{ text: 'Nearby API', class: 'purple' }],
        [{ text: 'Geo index (Redis Geo / S2)', class: 'green' }],
        [{ text: 'POI metadata DB', class: 'gray' }],
        [{ text: 'Ranking service', class: 'orange' }],
      ]),
    archNotes: 'Geo index returns candidate IDs in radius. Fetch metadata batch from DB/cache. Ranker applies distance + rating + open_now boost.',
    dataFlow:
      diagram(
        'Nearby search',
        flow([
          { text: '① lat,lng,radius', class: 'gray' },
          { text: '② Geo index query', class: 'green' },
          { text: '③ Fetch POI batch', class: 'purple' },
          { text: '④ Rank + filter', class: 'orange' },
          { text: '⑤ Return top 20', class: '' },
        ])
      ) +
      layers([
        'Geohash cell covers query circle',
        'Expand cells if &lt;20 results',
        'open_now from precomputed bitmap per cell',
        'Cache popular downtown queries',
      ]),
    dataFlowNotes: 'Contrast with Uber live driver positions — POIs are mostly static; index rebuild batch vs streaming updates.',
    apis: [
      ['GET /nearby', 'Radius search', 'lat,lng,radius,category'],
      ['GET /poi/{id}', 'POI details', 'cacheable'],
      ['PUT /poi/{id}', 'Owner update', 'auth required'],
      ['POST /poi', 'Add listing', 'moderation queue'],
    ],
    dataModel: note('POI: id, lat, lng, categories[], rating, hours_bitmap, geohash. Geo index: geohash → poi_ids[] or Redis GEOADD.'),
    storage: [
      ['Redis Geo', 'Live geo index', 'GEORADIUS'],
      ['PostgreSQL', 'POI metadata', 'ACID updates'],
      ['CDN', 'Photos', 'Static assets'],
    ],
    deepDives: [
      {
        title: 'Geohash cell expansion',
        body: note(
          'Start with cell containing point. If results &lt;20, query neighbor cells ring until radius covered or cap cells. Avoid full table scan.'
        ),
      },
      {
        title: 'open_now filter',
        body: note(
          'Precompute open bitmap per POI for next 7 days in local TZ. At query, bitwise check — filter before rank to shrink candidate set.'
        ),
      },
    ],
    tradeoffs: [
      ['Index', 'Redis Geo', 'S2 cells', 'Redis ops-simple; S2 better at poles/spans'],
      ['Rank', 'Distance only', 'ML ranker', 'Distance cheap; ML for engagement'],
      ['Updates', 'Realtime index', 'Batch nightly', 'Batch OK for static POIs'],
      ['Cache', 'Query cache', 'No cache', 'Cache downtown lat/lng grids'],
    ],
    script: [
      '0–5 min: Nearby + filters',
      '5–10 min: POI scale',
      '10–20 min: Geo index query',
      '20–30 min: Ranking + open_now',
      '30–38 min: Updates + moderation',
    ],
    followUps: [
      ['Multi-radius pagination?', 'Cursor with last distance + id; expand radius if page empty'],
      ['Chain duplicate merge?', 'Canonical chain_id groups franchises; dedupe in ranker'],
      ['Ads in results?', 'Reserve slots 3,7; blend sponsored score with relevance cap'],
    ],
    checklist: [
      'GEORADIUS / S2',
      'Cell expansion algorithm',
      'Batch metadata fetch',
      'Distance + rating rank',
      'open_now precompute',
      'Query result cache',
      'Owner update path',
      'Moderation for new POI',
    ],
    tags: ['proximity', 'geospatial', 'yelp', 'geohash', 'nearby'],
  }),

  mk({
    slug: 'payment-system',
    title: 'Design Payment System',
    subtitle: 'Card charges, idempotency, double-entry ledger, PCI boundaries, and reconciliation.',
    tip: 'Never store raw PAN. Use idempotency keys, ledger entries (debit/credit), async capture with PSP, and reconciliation jobs.',
    prompt: `Design Stripe-like payments: charge card, refund, idempotent APIs, ledger, connect to card networks via PSP.

Scale: 10K TPS payments, strict correctness, audit trail. Deep dive idempotency, exactly-once money movement, and failure states.`,
    functional: [
      'Create payment intent with amount + currency',
      'Capture charge via card token',
      'Refund full or partial',
      'Idempotent API with client key',
      'Webhook to merchant on status change',
      'Merchant dashboard transaction history',
    ],
    nonFunctional: [
      '10K TPS authorization peak',
      'Strong consistency for balances — no double charge',
      'PCI DSS — card data only at PSP/token vault',
      'Audit log immutable 7+ years',
      '99.99% availability for authorize API',
    ],
    scale: [
      '10K TPS × $50 avg — high correctness not volume challenge',
      'Ledger append-only 100K entries/sec with sharding by merchant',
      'Idempotency store TTL 24h per key',
      'Reconciliation batch nightly with PSP settlement files',
    ],
    architecture:
      archDiagram('Payment Platform', [
        [{ text: 'Merchant apps', class: 'gray' }],
        [{ text: 'Payment API (idempotent)', class: 'purple' }],
        [{ text: 'Ledger service (double-entry)', class: 'green' }],
        [{ text: 'PSP / card network', class: 'orange' }],
        [{ text: 'Webhook dispatcher', class: 'purple' }],
        [{ text: 'Reconciliation jobs', class: 'gray' }],
      ]),
    archNotes: 'API stores idempotency record first. Ledger writes in same DB transaction as payment state transition. PSP call async with timeout + polling.',
    dataFlow:
      diagram(
        'Charge execution',
        flow([
          { text: '① Idempotency check', class: 'gray' },
          { text: '② Reserve ledger', class: 'green' },
          { text: '③ PSP authorize', class: 'orange' },
          { text: '④ Capture / void', class: 'purple' },
          { text: '⑤ Webhook merchant', class: '' },
        ])
      ) +
      layers([
        'States: created → authorized → captured | failed | refunded',
        'Double-entry: merchant_balance + platform_fees',
        'Outbox table for reliable webhooks',
        'Reconcile PSP settlement vs ledger daily',
      ]),
    dataFlowNotes: 'Walk failure at PSP timeout — payment stays authorized until expiry; merchant polls or webhook fires.',
    apis: [
      ['POST /v1/charges', 'Create charge', 'Idempotency-Key header'],
      ['POST /v1/refunds', 'Refund', 'links charge_id'],
      ['GET /v1/charges/{id}', 'Status', 'merchant scoped'],
      ['POST /v1/webhooks/test', 'Simulate event', 'sandbox only'],
    ],
    dataModel: note('Payment: id, merchant_id, amount, status, idempotency_key. LedgerEntry: account, debit, credit, payment_id. Outbox: event payload.'),
    storage: [
      ['PostgreSQL', 'Payments + ledger', 'ACID transactions'],
      ['Redis', 'Idempotency cache', 'fast duplicate detect'],
      ['S3', 'Settlement files', 'immutable audit'],
    ],
    deepDives: [
      {
        title: 'Idempotency and double charge prevention',
        body: note(
          'Idempotency-Key → unique index. First request inserts row processing; duplicate returns same response body. Never call PSP twice for same key.'
        ),
      },
      {
        title: 'Double-entry ledger',
        body: note(
          'Every money move = two entries balanced. Merchant +100 customer -100. Refund reverses entries. Audit reconstructs balance from entries only.'
        ),
      },
    ],
    tradeoffs: [
      ['PSP sync', 'Sync authorize', 'Async queue', 'Sync simpler UX; queue for resilience'],
      ['Ledger', 'SQL ACID', 'Event sourcing', 'SQL for financial correctness'],
      ['Token', 'PSP tokenization', 'Own vault', 'Never own PAN — PCI scope'],
      ['Webhook', 'At-least-once', 'Exactly-once', 'At-least-once + merchant idempotent'],
    ],
    script: [
      '0–5 min: Charge/refund requirements',
      '5–12 min: Correctness + PCI',
      '12–22 min: API + idempotency',
      '22–32 min: Ledger + states',
      '32–40 min: Webhooks + reconciliation',
    ],
    followUps: [
      ['Multi-currency FX?', 'FX rate table at authorize time; ledger in merchant settlement currency'],
      ['Dispute chargeback flow?', 'Separate dispute state; pull funds from merchant balance; evidence upload portal'],
      ['3DS authentication?', 'Redirect to issuer challenge before authorize; resume with session token'],
    ],
    checklist: [
      'Idempotency keys',
      'Payment state machine',
      'Double-entry ledger',
      'PSP token only',
      'Transactional outbox',
      'Webhook retries',
      'Reconciliation job',
      'Immutable audit log',
    ],
    tags: ['payments', 'fintech', 'ledger', 'idempotency', 'pci'],
  }),

  mk({
    slug: 'chatgpt-system',
    title: 'Design ChatGPT System',
    subtitle: 'LLM inference serving, conversation state, streaming tokens, GPU pool, and safety filters.',
    tip: 'Separate control plane (API, auth, billing) from data plane (GPU inference). Mention KV-cache, batching, streaming SSE, and rate limits per user.',
    prompt: `Design a ChatGPT-like system: multi-turn chat, streaming responses, model routing (fast vs smart), safety moderation, usage billing.

Scale: 1M concurrent chats, 50K tokens/sec generation aggregate. Deep dive inference GPU scheduling and context window management.`,
    functional: [
      'Multi-turn conversation with history',
      'Stream tokens to client (SSE)',
      'Model selection (fast/cheap vs capable)',
      'Stop/cancel generation',
      'Moderation on input and output',
      'Usage metering per user/org',
    ],
    nonFunctional: [
      'First token latency &lt; 500ms p95',
      '50K tokens/sec cluster throughput',
      '99.9% API availability',
      'Isolate tenants — no cross-leak in KV cache',
      'Graceful degradation when GPU saturated',
    ],
    scale: [
      '1M active sessions — history stored, not all on GPU',
      'Context 8K–128K tokens — KV cache dominates VRAM',
      '50K tok/sec ≈ hundreds of A100s with continuous batching',
      'Prompt cache for system prompts across users',
    ],
    architecture:
      archDiagram('ChatGPT Serving', [
        [{ text: 'Clients', class: 'gray' }],
        [{ text: 'Chat API + auth', class: 'purple' }],
        [{ text: 'Session / history store', class: 'green' }],
        [{ text: 'Router (model + GPU pool)', class: 'orange' }],
        [{ text: 'GPU inference workers', class: 'purple' }],
        [{ text: 'Moderation + billing', class: 'gray' }],
      ]),
    archNotes: 'API loads recent history from DB, builds prompt, routes to inference pod with capacity. Continuous batching merges requests on same model.',
    dataFlow:
      diagram(
        'Chat completion stream',
        flow([
          { text: '① Auth + rate limit', class: 'gray' },
          { text: '② Load history', class: 'green' },
          { text: '③ Moderate input', class: 'orange' },
          { text: '④ GPU generate stream', class: 'purple' },
          { text: '⑤ Persist + bill tokens', class: '' },
        ])
      ) +
      layers([
        'KV cache reused for prefix (system prompt)',
        'SSE chunk per token group',
        'Cancel propagates to inference worker',
        'Queue when GPUs full — return 429 or wait',
      ]),
    dataFlowNotes: 'Explain prefill vs decode phases. Prefill processes prompt in parallel; decode autoregressive — batch decode for efficiency.',
    apis: [
      ['POST /v1/chat/completions', 'Chat', 'stream=true SSE'],
      ['POST /v1/chat/completions/cancel', 'Cancel', 'generation_id'],
      ['GET /v1/models', 'List models', 'capability metadata'],
      ['GET /v1/usage', 'Token usage', 'billing dashboard'],
    ],
    dataModel: note('Conversation: id, user_id, messages[]. Inference job: model, prompt_tokens, max_tokens, status. Usage: user_id, tokens, cost.'),
    storage: [
      ['PostgreSQL', 'Conversation history', 'encrypted at rest'],
      ['Redis', 'Rate limits + session', 'token bucket'],
      ['GPU VRAM', 'KV cache per request', 'ephemeral'],
      ['Object store', 'Model weights', 'loaded per pod'],
    ],
    deepDives: [
      {
        title: 'Continuous batching and KV cache',
        body: note(
          'Orca/vLLM style: batch new requests into running decode batch. Prefix KV cache shared when system prompts identical. VRAM limit caps concurrent contexts.'
        ),
      },
      {
        title: 'Safety and abuse',
        body: note(
          'Input classifier before GPU — block jailbreak patterns. Output filter streaming — cut generation on policy hit. Per-user token rate limits.'
        ),
      },
    ],
    tradeoffs: [
      ['Serving', 'Dedicated GPU', 'Serverless burst', 'Dedicated for steady chat load'],
      ['History', 'Full context', 'Summarize old turns', 'Summarize saves tokens but may lose detail'],
      ['Model', 'Single big model', 'Router small/large', 'Router saves cost on simple queries'],
      ['Stream', 'Token stream', 'Full response', 'Stream better UX; harder output moderation'],
    ],
    script: [
      '0–5 min: Chat + stream requirements',
      '5–12 min: Token/sec GPU math',
      '12–22 min: API + session store',
      '22–32 min: Inference batching',
      '32–40 min: Moderation + billing',
    ],
    followUps: [
      ['RAG plugin architecture?', 'Tool retrieves docs → inject context chunk → model cites sources in reply'],
      ['Fine-tuned per tenant?', 'Dedicated adapter weights loaded per request via tenant_id routing'],
      ['Multi-region GPU pools?', 'Geo route to nearest pool; sticky session for long contexts; failover queue'],
    ],
    checklist: [
      'SSE streaming',
      'Conversation persistence',
      'GPU continuous batching',
      'KV cache / prefix cache',
      'Input/output moderation',
      'Rate limits per tier',
      'Cancel in-flight generation',
      'Token usage metering',
    ],
    tags: ['llm', 'chatgpt', 'inference', 'gpu', 'streaming'],
  }),
];
