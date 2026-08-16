import { note, table, archDiagram, flow, layers, diagram } from './sheet-helpers.mjs';

/** Condensed Google-scale SD configs */
function g(c) {
  return {
    group: 'google',
    ...c,
    storage: c.storage || [
      ['Distributed store', 'Primary data', 'Sharded for scale'],
      ['Kafka / Pub/Sub', 'Event log', 'Async pipelines'],
      ['Object store', 'Media / blobs', 'GCS-style durability'],
    ],
    dataModel: c.dataModel || note('Domain-specific entities sharded by user_id or geographic key.'),
    followUps: c.followUps || [['How roll out globally?', 'Regional cells + gradual feature rollout']],
    script: c.script || [
      '0–5 min: Requirements + Google-scale assumptions',
      '5–12 min: Back-of-envelope QPS and storage',
      '12–22 min: Architecture diagram',
      '22–35 min: Deep dive on hot path',
      '35–42 min: Failure modes and trade-offs',
    ],
  };
}

export const googleSdConfigs = [
  g({
    slug: 'google-news',
    title: 'Design Google News',
    subtitle: 'Personalized news aggregation — crawl, classify, rank, and serve breaking stories at global scale.',
    tip: 'Separate ingestion (crawl + NLP) from serving (ranked feed). Mention edition by locale, dedup across publishers, and freshness vs quality ranking.',
    prompt: 'Interview: Design Google News — aggregate from publishers, personalize, low-latency home feed, breaking news boost.',
    functional: [
      'Aggregate articles from publisher feeds and crawlers',
      'Personalized "For you" and topic feeds',
      'Full-text search across news corpus',
      'Breaking news detection and boost',
      'Multi-language and locale editions',
      'Publisher attribution and canonical URLs',
    ],
    nonFunctional: [
      'Feed p99 &lt; 300ms',
      'Index new articles within minutes',
      '99.9% availability',
      'Handle viral traffic spikes on breaking news',
      'Respect publisher crawl policies',
    ],
    scale: ['1M articles/day ingested', '500M DAU', '10K QPS feed reads', 'Petabyte historical corpus'],
    architecture: archDiagram('Google News', [
      [{ text: 'Crawler + RSS ingest', class: 'orange' }],
      [{ text: 'NLP classify + dedup', class: 'purple' }],
      [{ text: 'Search index + ranker', class: 'green' }],
      [{ text: 'Feed API + CDN', class: 'gray' }],
    ]),
    dataFlow:
      diagram('Article pipeline', flow([
        { text: 'Crawl', class: 'gray' },
        { text: 'Extract + NLP', class: 'purple' },
        { text: 'Index', class: 'green' },
        { text: 'Rank feed', class: 'orange' },
      ])) + layers(['Dedup by URL hash', 'Embeddings for near-duplicate', 'User interest model offline']),
    apis: [
      ['GET /feed', 'Personalized feed', 'cursor pagination'],
      ['GET /search', 'News search', 'full-text + filters'],
      ['POST /internal/index', 'Publisher push', 'authenticated'],
    ],
    deepDives: [
      { title: 'Ranking', body: note('Blend recency, source authority, user clicks, diversity — logistic model trained offline, served in ms.') },
      { title: 'Dedup', body: note('Canonical URL + simhash on body text to cluster same story from multiple outlets.') },
    ],
    tradeoffs: [
      ['Personalization', 'Deep model', 'Heuristic', 'Deep better CTR; heuristic faster to ship'],
      ['Freshness', 'Stream index', 'Batch', 'Stream for breaking; batch cheaper'],
    ],
    followUps: [
      ['Fake news?', 'Source trust scores + human review queue + user feedback loop'],
      ['Publisher paywall?', 'Show headline/snippet only; link out to publisher'],
    ],
    checklist: ['Crawl + ingest', 'Dedup', 'Ranker features', 'Breaking boost', 'Locale editions'],
    tags: ['google', 'news', 'feed', 'search'],
  }),

  g({
    slug: 'google-feature-flags',
    title: 'Design Google Global Feature Flags',
    subtitle: 'Rollout %, targeting rules, and consistent evaluation across millions of servers worldwide.',
    tip: 'Mention evaluation at client vs server, cache with TTL, sticky bucketing by user_id, and kill switch propagation in seconds.',
    prompt: 'Design global feature flag system for Google-scale — percentage rollout, geo targeting, instant kill switch.',
    functional: [
      'Define flags with on/off and percentage rollout',
      'Target by user_id, country, app version, cohort',
      'Real-time kill switch',
      'Audit who changed flag config',
      'SDK for servers and mobile clients',
      'Consistent assignment (same user always same variant)',
    ],
    nonFunctional: [
      'Evaluation &lt; 1ms local cache',
      'Config propagation &lt; 30s globally',
      '99.99% availability — fail open or closed per flag',
      'Millions of flag reads per second',
    ],
    scale: ['10K flags', '1B devices', 'Consistent hash user → bucket for % rollout'],
    architecture: archDiagram('Feature Flags', [
      [{ text: 'Admin UI', class: 'gray' }],
      [{ text: 'Config service (CP)', class: 'purple' }],
      [{ text: 'CDN / edge cache', class: 'green' }],
      [{ text: 'App SDK evaluate', class: 'gray' }],
    ]),
    dataFlow:
      diagram('Flag evaluation', flow([
        { text: 'Load cached rules', class: 'gray' },
        { text: 'Hash user_id', class: 'purple' },
        { text: 'Match rules', class: 'green' },
        { text: 'Return variant', class: '' },
      ])) + layers(['Push config deltas to edges', 'Sticky bucket: hash(user_id, flag_id)']),
    apis: [
      ['GET /flags/{name}', 'Evaluate', 'SDK batches'],
      ['PUT /admin/flags', 'Update rollout', 'audit log'],
    ],
    deepDives: [
      { title: 'Sticky bucketing', body: note('hash(user_id, flag_name) % 100 &lt; rollout_percent — user stays in cohort when % changes slightly.') },
      { title: 'Kill switch', body: note('Push empty allow list to all CDN edges; SDK polls every 30s or uses push channel.') },
    ],
    tradeoffs: [
      ['Eval location', 'Client', 'Server', 'Client fewer RPCs; server more control'],
      ['Fail mode', 'Fail closed', 'Fail open', 'Payments fail closed; UI experiments fail open'],
    ],
    checklist: ['Sticky hashing', 'Propagation speed', 'Audit trail', 'SDK cache TTL', 'Kill switch tested'],
    tags: ['google', 'feature-flags', 'rollout'],
  }),

  g({
    slug: 'google-ads-bidding',
    title: 'Design Google Ads Bidding System',
    subtitle: 'Real-time ad auction — relevance, bid, quality score, and millisecond ranking at search scale.',
    tip: 'Clarify GSP vs VCG auction, quality score, budget pacing, and fraud filtering before ranking.',
    prompt: 'Design ad bidding for search ads — advertisers bid on keywords, auction on each search query in &lt;100ms.',
    functional: [
      'Advertisers set bids and budgets',
      'Match ads to query keywords + intent',
      'Run auction per search impression',
      'Track clicks and conversions',
      'Budget pacing through the day',
      'Policy and fraud filtering',
    ],
    nonFunctional: [
      'Auction p99 &lt; 50ms',
      '100K QPS auction peak',
      'Billing accuracy — no double charge',
      'Global multi-currency',
    ],
    scale: ['100K auctions/sec', 'Millions of active campaigns', 'Inverted index ads by keyword'],
    architecture: archDiagram('Ads Auction', [
      [{ text: 'Search query', class: 'gray' }],
      [{ text: 'Ad retrieval index', class: 'green' }],
      [{ text: 'Auction ranker', class: 'purple' }],
      [{ text: 'Impression log → billing', class: 'orange' }],
    ]),
    dataFlow:
      diagram('Per-query auction', flow([
        { text: 'Keyword match', class: 'gray' },
        { text: 'Filter policy', class: 'orange' },
        { text: 'Score = bid × quality', class: 'purple' },
        { text: 'GSP pricing', class: 'green' },
      ])) + layers(['Quality score from CTR history', 'Budget decrement async']),
    apis: [
      ['POST /auction', 'Run auction', 'internal only'],
      ['POST /campaigns', 'Advertiser CRUD', 'budget caps'],
    ],
    deepDives: [
      { title: 'Generalized second price', body: note('Winner pays second-price + epsilon — incentivizes truthful bidding.') },
      { title: 'Budget pacing', body: note('Throttle impressions when spend rate exceeds daily budget curve.') },
    ],
    tradeoffs: [
      ['Auction', 'GSP', 'VCG', 'GSP industry standard for search'],
      ['Retrieval', 'Broad match', 'Exact', 'Broad more revenue; exact more relevance'],
    ],
    checklist: ['GSP explained', 'Quality score', 'Budget pacing', 'Fraud filter', 'Impression logging'],
    tags: ['google', 'ads', 'auction'],
  }),

  g({
    slug: 'google-photos-duplicate',
    title: 'Design Google Photos Duplicate Detection',
    subtitle: 'Find near-duplicate and burst photos — perceptual hashing, clustering, and user-facing suggestions.',
    tip: 'Pipeline: hash → bucket candidates → ML refine. Mention privacy (on-device vs cloud) and scale of billions of images.',
    prompt: 'Design duplicate detection for Google Photos — same moment, resized, filtered versions grouped.',
    functional: [
      'Detect visually similar photos and videos',
      'Group bursts into stacks',
      'Suggest "best" photo to keep',
      'On-upload processing',
      'User can dismiss suggestions',
      'Works across resolutions and crops',
    ],
    nonFunctional: [
      'Process upload within seconds',
      'Billions of photos corpus',
      'Low false positive on faces',
      'Privacy — user data isolated',
    ],
    scale: ['5B photos', '50M uploads/day', 'pHash 64-bit per image'],
    architecture: archDiagram('Photos Duplicate', [
      [{ text: 'Upload', class: 'gray' }],
      [{ text: 'Perceptual hash worker', class: 'purple' }],
      [{ text: 'Similarity index', class: 'green' }],
      [{ text: 'Cluster + rank best', class: 'orange' }],
    ]),
    dataFlow:
      diagram('Duplicate pipeline', flow([
        { text: 'Generate pHash', class: 'gray' },
        { text: 'Hamming bucket', class: 'purple' },
        { text: 'ML verify', class: 'green' },
        { text: 'Suggest stack', class: '' },
      ])) + layers(['On-device hash optional', 'Embeddings for semantic similarity']),
    apis: [
      ['POST /photos', 'Upload triggers pipeline', 'async'],
      ['GET /stacks', 'Duplicate groups', 'user scoped'],
    ],
    deepDives: [
      { title: 'Perceptual hash bucketing', body: note('Hamming distance ≤ 5 → candidate pair; CNN embedding for final merge.') },
      { title: 'Best photo selection', body: note('Score sharpness, faces smiling, exposure — lightweight on-device model.') },
    ],
    tradeoffs: [
      ['Where compute', 'Cloud', 'On-device', 'On-device privacy; cloud more accurate'],
      ['Index', 'LSH', 'Brute on recent', 'Recent window brute; archive LSH'],
    ],
    checklist: ['pHash', 'Hamming threshold', 'ML second stage', 'Privacy boundary', 'User dismiss'],
    tags: ['google', 'photos', 'perceptual-hash'],
  }),

  g({
    slug: 'google-docs',
    title: 'Design Google Docs',
    subtitle: 'Collaborative real-time editing — OT/CRDT, presence, revision history, and permission model.',
    tip: 'Deep dive operational transform or CRDT for concurrent edits; WebSocket fan-out; snapshot + ops log storage.',
    prompt: 'Design real-time collaborative document editor like Google Docs.',
    functional: [
      'Rich text editing with formatting',
      'Multiple users edit simultaneously',
      'Cursor presence and selection highlights',
      'Revision history and restore',
      'Share with view/comment/edit roles',
      'Offline edit with sync',
    ],
    nonFunctional: [
      'Edit latency &lt; 100ms perceived',
      '100 collaborators per doc (practical limit)',
      '99.9% availability',
      'No lost edits on conflict',
    ],
    scale: ['1B docs', '10K edits/sec on hot doc', 'Op log grows — compact snapshots'],
    architecture: archDiagram('Google Docs', [
      [{ text: 'WebSocket clients', class: 'gray' }],
      [{ text: 'Doc session server', class: 'purple' }],
      [{ text: 'OT/CRDT merge', class: 'green' }],
      [{ text: 'Op log + snapshot store', class: 'orange' }],
    ]),
    dataFlow:
      diagram('Edit propagation', flow([
        { text: 'Local op', class: 'gray' },
        { text: 'Send op', class: 'purple' },
        { text: 'Transform + apply', class: 'green' },
        { text: 'Broadcast ops', class: 'orange' },
      ])) + layers(['Snapshot every N ops', 'Compaction of history']),
    apis: [
      ['WS /doc/{id}', 'Real-time channel', 'ops stream'],
      ['GET /doc/{id}', 'Load snapshot', 'version vector'],
    ],
    deepDives: [
      { title: 'OT vs CRDT', body: note('OT smaller ops for text; CRDT better for offline — Google uses OT-style with central server ordering.') },
      { title: 'Storage', body: note('Snapshot + append op log in Colossus/Bigtable; replay ops after snapshot for load.') },
    ],
    tradeoffs: [
      ['Sync model', 'Central server', 'Peer CRDT', 'Central simpler permissions'],
      ['History', 'Full op log', 'Periodic squash', 'Log accurate; squash saves space'],
    ],
    checklist: ['OT/CRDT mention', 'WebSocket fan-out', 'Presence', 'Permissions', 'Snapshot + log'],
    tags: ['google', 'docs', 'collaboration', 'websocket'],
  }),

  g({
    slug: 'chrome-malware-detection',
    title: 'Design Chrome Malware Detection',
    subtitle: 'Safe Browsing — URL reputation, download scanning, and real-time updates to billions of clients.',
    tip: 'Hash prefix matching (privacy), bloom filters on client, backend full hash verify, update propagation via component updates.',
    prompt: 'Design Safe Browsing for Chrome — warn on phishing/malware URLs and risky downloads.',
    functional: [
      'Check URL before navigation',
      'Scan downloaded files',
      'Warn or block dangerous sites',
      'Push updated threat lists to browsers',
      'Report new threats from crawlers and users',
      'Privacy-preserving hash checks',
    ],
    nonFunctional: [
      'Check adds &lt; 5ms client-side',
      'List updates every 30 min',
      'False positive rate extremely low',
      'Scale to 4B Chrome installs',
    ],
    scale: ['500M malicious URLs', '4B clients poll updates', 'Prefix bloom ~1MB client cache'],
    architecture: archDiagram('Safe Browsing', [
      [{ text: 'Chrome client bloom', class: 'gray' }],
      [{ text: 'Prefix hash API', class: 'purple' }],
      [{ text: 'Threat intel DB', class: 'green' }],
      [{ text: 'Crawler + reports', class: 'orange' }],
    ]),
    dataFlow:
      diagram('URL check', flow([
        { text: 'Hash URL prefix', class: 'gray' },
        { text: 'Local bloom', class: 'purple' },
        { text: 'Maybe → full hash API', class: 'green' },
        { text: 'Block or allow', class: 'orange' },
      ])) + layers(['No full URL leaked — prefix + hash', 'Download scan sandbox']),
    apis: [
      ['GET /hash/{prefix}', 'Full hash lookup', 'privacy API'],
      ['POST /reports', 'User report URL', 'rate limited'],
    ],
    deepDives: [
      { title: 'Privacy-preserving lookup', body: note('Client sends 4-byte hash prefix; server returns full-hash matches only for that prefix bucket.') },
      { title: 'List distribution', body: note('Component updater pushes bloom filter deltas — same model as feature flags at scale.') },
    ],
    tradeoffs: [
      ['Client filter', 'Bloom', 'Full list', 'Bloom tiny; rare false positive full check'],
      ['Block vs warn', 'Hard block malware', 'Warn phishing', 'Policy per threat class'],
    ],
    checklist: ['Prefix hash privacy', 'Bloom on client', 'Update mechanism', 'Sandbox downloads', 'False positive handling'],
    tags: ['google', 'chrome', 'security'],
  }),

  g({
    slug: 'gmail-search',
    title: 'Design Gmail Fast Search',
    subtitle: 'Search billions of mailboxes — inverted index per user, sharding, and instant query completion.',
    tip: 'User mailbox shard, inverted index segments, async indexing on delivery, prefix suggest trie + ranking by recency.',
    prompt: 'Design Gmail search — sub-second search across a user mailbox with filters (from, label, date).',
    functional: [
      'Full-text search in mailbox',
      'Filter by sender, label, attachment, date',
      'Autocomplete query suggestions',
      'Search as you type',
      'Snippets with highlights',
      'Include spam/trash optional',
    ],
    nonFunctional: [
      'p99 &lt; 200ms per user search',
      'Index new mail within seconds',
      'Petabyte total corpus',
      'Per-user data isolation',
    ],
    scale: ['1.5B users', 'Sharding by user_id', 'Average 10GB mailbox index overhead'],
    architecture: archDiagram('Gmail Search', [
      [{ text: 'Mail delivery', class: 'gray' }],
      [{ text: 'Per-user index shard', class: 'green' }],
      [{ text: 'Query coordinator', class: 'purple' }],
      [{ text: 'Suggest trie', class: 'orange' }],
    ]),
    dataFlow:
      diagram('Search query', flow([
        { text: 'Parse query', class: 'gray' },
        { text: 'Route user shard', class: 'purple' },
        { text: 'Intersect postings', class: 'green' },
        { text: 'Rank + snippet', class: '' },
      ])) + layers(['CDC from mail store to index', 'Bloom pre-filter spam corpus']),
    apis: [
      ['GET /mail/search', 'Query DSL', 'user auth'],
      ['GET /suggest', 'Prefix complete', 'cached'],
    ],
    deepDives: [
      { title: 'Per-user sharding', body: note('All mail for user_id on same index shard — query never cross-shard fan-out.') },
      { title: 'Ranking', body: note('BM25 + strong recency boost + personal signals (frequent correspondents).') },
    ],
    tradeoffs: [
      ['Index', 'Per-user', 'Global', 'Per-user isolates blast radius'],
      ['Suggest', 'Trie', 'ML rank', 'Trie fast; ML for quality'],
    ],
    checklist: ['User shard', 'Inverted index', 'CDC indexing', 'Query DSL', 'Suggest trie'],
    tags: ['google', 'gmail', 'search'],
  }),

  g({
    slug: 'google-trends',
    title: 'Design Google Trends',
    subtitle: 'Aggregate search interest over time — anonymized counts, normalization, and geographic breakdown.',
    tip: 'Explain scaling counts (0–100 index), spike smoothing, sampling at query time, and batch rollups in warehouse.',
    prompt: 'Design Google Trends — show search interest for terms over time and geography.',
    functional: [
      'Plot search interest over time',
      'Compare multiple terms',
      'Geographic breakdown',
      'Related queries and topics',
      'Export data',
      'Anonymize — no raw counts exposed',
    ],
    nonFunctional: [
      'Query warehouse in seconds',
      'Data refreshed daily/hourly',
      'Privacy — no individual queries revealed',
      'Global scale aggregation',
    ],
    scale: ['Trillions of queries logged', 'Batch rollups to BigQuery', 'Materialized daily cubes'],
    architecture: archDiagram('Google Trends', [
      [{ text: 'Search log stream', class: 'orange' }],
      [{ text: 'Batch rollup jobs', class: 'purple' }],
      [{ text: 'Trends serving DB', class: 'green' }],
      [{ text: 'Trends UI API', class: 'gray' }],
    ]),
    dataFlow:
      diagram('Trend computation', flow([
        { text: 'Raw logs', class: 'gray' },
        { text: 'Anonymize sample', class: 'orange' },
        { text: 'Daily aggregate', class: 'purple' },
        { text: 'Normalize 0-100', class: 'green' },
      ])) + layers(['Lambda: speed layer for today', 'Batch corrects yesterday']),
    apis: [
      ['GET /trends', 'Term + geo + range', 'normalized index'],
      ['GET /related', 'Related queries', 'from co-occurrence'],
    ],
    deepDives: [
      { title: 'Normalization', body: note('Scale to max=100 in window — hides absolute volume, preserves shape.') },
      { title: 'Privacy', body: note('Threshold small regions — suppress low volume to prevent re-identification.') },
    ],
    tradeoffs: [
      ['Freshness', 'Hourly speed', 'Daily batch', 'Hybrid lambda architecture'],
      ['Granularity', 'City', 'Country', 'Fine geo risks privacy'],
    ],
    checklist: ['Anonymization', 'Normalization 0-100', 'Materialized rollups', 'Privacy thresholds', 'Lambda layers'],
    tags: ['google', 'trends', 'analytics'],
  }),

  g({
    slug: 'google-street-view',
    title: 'Design Google Street View',
    subtitle: 'Capture, stitch, index, and serve immersive street-level imagery globally.',
    tip: 'Panorama tiles pyramid, geospatial index for coverage map, car fleet ingest pipeline, face/blur privacy processing.',
    prompt: 'Design Street View — 360° imagery tied to lat/lng, served as tiled panoramas worldwide.',
    functional: [
      'Display panorama at GPS location',
      'Navigate along roads',
      'Search places and jump to view',
      'Time travel (historical captures)',
      'Blur faces and license plates',
      'Download tiles for smooth pan',
    ],
    nonFunctional: [
      'Tile load &lt; 100ms from CDN',
      'Petabytes of imagery',
      'Global coverage metadata index',
      'Privacy compliance per region',
    ],
    scale: ['Petabyte imagery', 'Billions of panoramas', 'CDN serves 99% of tile requests'],
    architecture: archDiagram('Street View', [
      [{ text: 'Fleet ingest + SfM stitch', class: 'orange' }],
      [{ text: 'Blur privacy ML', class: 'purple' }],
      [{ text: 'Geo index + tile store', class: 'green' }],
      [{ text: 'CDN tile delivery', class: 'gray' }],
    ]),
    dataFlow:
      diagram('Panorama view', flow([
        { text: 'lat/lng → panorama id', class: 'gray' },
        { text: 'Geo index lookup', class: 'purple' },
        { text: 'Tile pyramid CDN', class: 'green' },
        { text: 'Client WebGL', class: '' },
      ])) + layers(['S2 cells for spatial index', 'Historical versions per location']),
    apis: [
      ['GET /panorama', 'lat,lng', 'returns pano id + tiles'],
      ['GET /tiles/{id}/{face}/{z}/{x}/{y}', 'Cube face tiles', 'CDN cached'],
    ],
    deepDives: [
      { title: 'Tile pyramid', body: note('Cube map 6 faces × zoom levels — same pattern as map tiles.') },
      { title: 'Privacy blur', body: note('ML detects faces/plates before publish — automated + human QA sample.') },
    ],
    tradeoffs: [
      ['Storage', 'Raw + tiles', 'Tiles only', 'Tiles for serve; raw for reprocess'],
      ['Index', 'S2', 'Geohash', 'S2 uniform cells globally'],
    ],
    checklist: ['Panorama tiles', 'Geo index', 'CDN delivery', 'Privacy blur', 'Historical versions'],
    tags: ['google', 'street-view', 'imagery', 'cdn'],
  }),

  g({
    slug: 'google-realtime-analytics',
    title: 'Design Google Global Real-time Analytics',
    subtitle: 'Unified metrics across Search, Ads, YouTube — stream processing + batch correction at planetary scale.',
    tip: 'Lambda architecture: Kafka/Pub/Sub → Flink speed layer + BigQuery batch; mention exactly-once, regional aggregation, global merge.',
    prompt: 'Design real-time analytics pipeline used across Google products for dashboards and alerting.',
    functional: [
      'Collect events from all product surfaces',
      'Real-time dashboards (last hour)',
      'Accurate daily reports',
      'Alerting on anomaly thresholds',
      'Per-product and global views',
      'Role-based access to metrics',
    ],
    nonFunctional: [
      'Speed layer latency &lt; 1 minute',
      'Trillions of events/day',
      'No double-count in aggregates',
      'Regional fault isolation',
    ],
    scale: ['Trillions events/day', 'Flink on Kafka', 'BigQuery batch reconcile nightly'],
    architecture: archDiagram('Global Analytics', [
      [{ text: 'Product event collectors', class: 'gray' }],
      [{ text: 'Pub/Sub global bus', class: 'orange' }],
      [{ text: 'Flink speed layer', class: 'purple' }],
      [{ text: 'BigQuery batch layer', class: 'green' }],
      [{ text: 'Serving + dashboards', class: 'gray' }],
    ]),
    dataFlow:
      diagram('Event to metric', flow([
        { text: 'Event', class: 'gray' },
        { text: 'Regional aggregate', class: 'purple' },
        { text: 'Global merge', class: 'green' },
        { text: 'Dashboard', class: '' },
      ])) + layers(['Watermarks for late events', 'Batch layer fixes speed approximations']),
    apis: [
      ['POST /events', 'High-volume ingest', 'batched'],
      ['GET /metrics', 'Query API', 'scoped by product'],
    ],
    deepDives: [
      { title: 'Lambda merge', body: note('Dashboard queries sum speed layer (today) + batch tables (history) with documented staleness.') },
      { title: 'Cardinality control', body: note('HyperLogLog for UV; rollups pre-aggregate high-cardinality dimensions.') },
    ],
    tradeoffs: [
      ['Processing', 'Flink', 'Spark Streaming', 'Flink lower latency ops'],
      ['Accuracy', 'Approximate RT', 'Exact batch', 'Standard lambda trade-off'],
    ],
    checklist: ['Pub/Sub ingest', 'Flink speed', 'BigQuery batch', 'Lambda merge', 'HLL for UV', 'Late data'],
    tags: ['google', 'analytics', 'lambda', 'flink'],
  }),
];

export const GOOGLE_SD_SLUGS = [
  'youtube-streaming',
  'google-maps',
  ...googleSdConfigs.map((c) => c.slug),
];
