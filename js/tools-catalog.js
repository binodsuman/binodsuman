/** Tool registry — grouped by user-facing category */
const TOOL_CATEGORIES = [
    { id: 'formatters', name: 'Formatters', icon: 'fa-align-left' },
    { id: 'converters', name: 'Converters', icon: 'fa-exchange-alt' },
    { id: 'generators', name: 'Generators', icon: 'fa-magic' },
    { id: 'api', name: 'HTTP & API', icon: 'fa-plug' },
    { id: 'commands', name: 'Command cheat sheets', icon: 'fa-terminal' },
    { id: 'utilities', name: 'Utilities', icon: 'fa-wrench' },
    { id: 'ai', name: 'AI tools', icon: 'fa-robot' },
];

const TOOL_CATALOG = [
    /* Formatters */
    { id: 'json', cat: 'formatters', label: 'JSON Formatter', blurb: 'Pretty-print, minify, or validate JSON from APIs and config files.' },
    { id: 'markdown', cat: 'formatters', label: 'Markdown Preview', blurb: 'Write Markdown on the left; see rendered HTML on the right.' },
    { id: 'sql', cat: 'formatters', label: 'SQL Formatter', blurb: 'Indent SQL queries for readability before code review.' },
    { id: 'xml', cat: 'formatters', label: 'XML Formatter', blurb: 'Pretty-print XML from SOAP responses or config files.' },
    { id: 'yaml', cat: 'formatters', label: 'YAML Formatter', blurb: 'Format and validate Kubernetes, Docker Compose, and CI YAML.' },

    /* Converters */
    { id: 'csv2json', cat: 'converters', label: 'CSV → JSON', blurb: 'Turn spreadsheet exports into JSON arrays.' },
    { id: 'json2csv', cat: 'converters', label: 'JSON → CSV', blurb: 'Flatten a JSON array into CSV for Excel.' },
    { id: 'base64', cat: 'converters', label: 'Base64', blurb: 'Encode or decode text for JSON and Basic Auth.' },
    { id: 'url', cat: 'converters', label: 'URL Encode', blurb: 'Make query strings URL-safe (%20 for spaces).' },
    { id: 'jwt', cat: 'converters', label: 'JWT Decoder', blurb: 'Inspect login tokens locally — never upload them.' },
    { id: 'curl-postman', cat: 'converters', label: 'cURL ↔ Postman', blurb: 'Convert cURL commands to Postman collection JSON.' },

    /* Generators */
    { id: 'uuid', cat: 'generators', label: 'UUID Generator', blurb: 'Generate up to 100 v4 UUIDs at once.' },
    { id: 'password', cat: 'generators', label: 'Password Generator', blurb: 'Strong random passwords with custom length.' },
    { id: 'json-schema', cat: 'generators', label: 'JSON Schema', blurb: 'Infer schema from sample JSON.' },
    { id: 'hash', cat: 'generators', label: 'Hash (SHA)', blurb: 'SHA-256 / SHA-1 / SHA-512 checksum.' },
    { id: 'k8s-yaml', cat: 'generators', label: 'Kubernetes YAML', blurb: 'Form → Deployment + Service manifest.' },

    /* HTTP & API */
    { id: 'http-status', cat: 'api', label: 'HTTP Status Codes', blurb: 'Search 401 vs 403, 429, 502, and more.' },
    { id: 'api-builder', cat: 'api', label: 'API Request Builder', blurb: 'Build requests → copy as cURL or fetch.' },

    /* Command cheat sheets */
    { id: 'git-commands', cat: 'commands', label: 'Git Commands', blurb: '100 everyday Git commands — search and copy.' },
    { id: 'unix-commands', cat: 'commands', label: 'Unix / Linux', blurb: 'Shell commands — find, grep, chmod, tail.' },
    { id: 'docker-commands', cat: 'commands', label: 'Docker Commands', blurb: 'Containers, images, compose, logs.' },
    { id: 'kubernetes-commands', cat: 'commands', label: 'Kubernetes (kubectl)', blurb: 'Pods, deploy, logs, scale, debug.' },

    /* Utilities */
    { id: 'timestamp', cat: 'utilities', label: 'Unix Timestamp', blurb: 'Live epoch clock, timestamp ↔ date, GMT and local time.' },
    { id: 'cron', cat: 'utilities', label: 'Cron Explainer', blurb: 'Crontab expressions in plain English.' },
    { id: 'regex', cat: 'utilities', label: 'Regex Tester', blurb: 'Test patterns before putting them in code.' },
    { id: 'diff', cat: 'utilities', label: 'Text Diff', blurb: 'Compare two configs line by line.' },

    /* AI */
    { id: 'tokens', cat: 'ai', label: 'LLM Token Estimate', blurb: 'Estimate prompt size and rough API cost.' },
];
