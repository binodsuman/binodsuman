#!/usr/bin/env python3
"""Run JS generator logic by executing the mjs file with a minimal Node-like shim — or write files from embedded module."""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MJS = ROOT / "scripts" / "generate-cheat-sheets.mjs"

# Try node via common mac paths
NODE_PATHS = [
    "/usr/local/bin/node",
    "/opt/homebrew/bin/node",
    "/usr/bin/node",
]


def find_node():
    for p in NODE_PATHS:
        if Path(p).is_file():
            return p
    return None


def run_with_node():
    node = find_node()
    if not node:
        return False
    subprocess.run([node, str(MJS)], check=True, cwd=ROOT)
    return True


def run_with_python_fallback():
    """Parse aiPages and sdPages from mjs and write HTML using same templates."""
    text = MJS.read_text(encoding="utf-8")

    def extract_array(name):
        pattern = rf"const {name} = (\[.*?\n\];)"
        m = re.search(pattern, text, re.DOTALL)
        if not m:
            raise RuntimeError(f"Could not find {name}")
        raw = m.group(1)
        # Convert JS to JSON-ish: quote keys, remove trailing commas before ] }
        raw = raw.replace("const ", "").rstrip(";")
        # Use demjson3 or manual - try json after replacements
        s = raw
        s = re.sub(r"(\w+):", r'"\1":', s)  # keys
        s = s.replace("'", '"')
        s = re.sub(r",\s*]", "]", s)
        s = re.sub(r",\s*}", "}", s)
        try:
            return json.loads(s)
        except json.JSONDecodeError as e:
            raise RuntimeError(f"JSON parse failed for {name}: {e}")

    # Templates from mjs
    HEAD_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Binod Suman Cheat Sheet</title>
    <meta name="description" content="{desc}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Kalam:wght@400;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/site-nav.css">
    <script src="/js/theme-boot.js"></script>
    <link rel="stylesheet" href="/css/cheat-sheet.css">
</head>
<body class="cheat-sheet-page">
<main class="cheat-sheet-page">
<div class="cs-container">"""

    FOOT = """
</div>
</main>
<script src="/js/cheat-sheet-videos.js"></script>
<script src="/js/cheat-sheet.js"></script>
<script src="/js/site-nav.js"></script>
</body>
</html>"""

    def make_page(badge, badge_class, title, subtitle, breadcrumb, tip, papers, related):
        papers_html = ""
        for p in papers:
            papers_html += f"""
    <div class="cs-paper">
        <h2 class="cs-section-title">{p['title']}</h2>
        {p['body']}
    </div>"""
        related_html = ""
        if related:
            links = "".join(f'<a href="{r["href"]}">{r["label"]}</a>' for r in related)
            related_html = f'<div class="cs-related"><h3>More in this category</h3><div class="cs-related-links">{links}</div></div>'
        desc = subtitle.replace('"', "&quot;")
        return (
            HEAD_TMPL.format(title=title, desc=desc)
            + f"""
    <nav class="cs-breadcrumb">{breadcrumb}</nav>
    <header class="cs-hero">
        <span class="cs-category-badge {badge_class}">{badge}</span>
        <h1 class="cs-title">{title}</h1>
        <p class="cs-subtitle">{subtitle}</p>
    </header>
    <div class="cs-interview-tip"><strong>Interview tip</strong> {tip}</div>
    {papers_html}
    {related_html}
"""
            + FOOT
        )

    def write_page(file_path, html):
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(html, encoding="utf-8")
        print("written", file_path)

    ai_pages = extract_array("aiPages")
    sd_pages = extract_array("sdPages")

    for p in ai_pages:
        html = make_page(
            "AI",
            "ai",
            p["title"],
            p["subtitle"],
            f'<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · <a href="/cheat-sheets/ai/">AI</a> · {p["title"]}',
            p["tip"],
            p["papers"],
            [
                {"href": "/cheat-sheets/ai/", "label": "All AI cheat sheets"},
                {"href": "/cheat-sheets/ai/rag", "label": "RAG"},
                {"href": "/cheat-sheets/ai/agents-intro", "label": "What is an Agent?"},
            ],
        )
        write_page(ROOT / "cheat-sheets/ai" / p["slug"] / "index.html", html)

    for p in sd_pages:
        html = make_page(
            "System Design",
            "system-design",
            p["title"],
            p["subtitle"],
            f'<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · <a href="/cheat-sheets/system-design/">System Design</a> · {p["title"]}',
            p["tip"],
            p["papers"],
            [
                {"href": "/cheat-sheets/system-design/", "label": "All SD cheat sheets"},
                {"href": "/cheat-sheets/system-design/fundamentals", "label": "SD Fundamentals"},
                {"href": "/cheat-sheets/system-design/url-shortener", "label": "URL Shortener"},
            ],
        )
        write_page(ROOT / "cheat-sheets/system-design" / p["slug"] / "index.html", html)

    # Hubs
    ai_hub_links = [
        {"href": "/cheat-sheets/ai/roadmap", "label": "AI Master Roadmap"},
        {"href": "/cheat-sheets/ai/ml-interview", "label": "ML/DL Interview Guide"},
    ] + [{"href": f"/cheat-sheets/ai/{p['slug']}", "label": p["title"]} for p in ai_pages]

    sd_hub_links = [
        {"href": "/cheat-sheets/system-design/fundamentals", "label": "SD Fundamentals"},
        {"href": "/cheat-sheets/system-design/patterns", "label": "SD Interview Patterns"},
    ] + [{"href": f"/cheat-sheets/system-design/{p['slug']}", "label": p["title"]} for p in sd_pages]

    def make_hub(title, subtitle, badge, badge_class, breadcrumb, sections):
        cards = ""
        for s in sections:
            items = "".join(f"<li><a href=\"{l['href']}\">{l['label']}</a></li>" for l in s["links"])
            cards += f'<div class="cs-hub-card"><h2>{s["label"]}</h2><ul>{items}</ul></div>'
        desc = subtitle.replace('"', "&quot;")
        return (
            HEAD_TMPL.format(title=title, desc=desc)
            + f"""
    <nav class="cs-breadcrumb">{breadcrumb}</nav>
    <header class="cs-hero">
        <span class="cs-category-badge {badge_class}">{badge}</span>
        <h1 class="cs-title">{title}</h1>
        <p class="cs-subtitle">{subtitle}</p>
    </header>
    <div class="cs-hub-grid">{cards}</div>
"""
            + FOOT
        )

    ai_sections = [
        {"label": "Foundations", "links": [l for l in ai_hub_links if re.search(r"roadmap|ml-interview|prompt-engineering|embeddings|openai", l["href"])]},
        {"label": "LLM Apps", "links": [l for l in ai_hub_links if re.search(r"rag|first-llm|fine-tuning", l["href"])]},
        {"label": "Agents & Frameworks", "links": [l for l in ai_hub_links if re.search(r"agents|langchain|google-adk|n8n|mcp", l["href"])]},
        {"label": "Developer Tools", "links": [l for l in ai_hub_links if re.search(r"cursor|claude", l["href"])]},
    ]

    write_page(
        ROOT / "cheat-sheets/ai/index.html",
        make_hub(
            "AI Cheat Sheets",
            "Basics to advanced — RAG, agents, LangChain, Cursor, Claude, MCP, and more.",
            "AI",
            "ai",
            '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · AI',
            ai_sections,
        ),
    )

    write_page(
        ROOT / "cheat-sheets/system-design/index.html",
        make_hub(
            "System Design Cheat Sheets",
            "Top 15 interview questions with requirements, diagrams, and trade-offs.",
            "System Design",
            "system-design",
            '<a href="/">Home</a> · <a href="/cheat-sheets/">Cheat Sheets</a> · System Design',
            [
                {"label": "Core", "links": sd_hub_links[:2]},
                {"label": "Top 15 Interview Questions", "links": sd_hub_links[2:]},
            ],
        ),
    )

    print(f"Generated {len(ai_pages)} AI + {len(sd_pages)} SD pages + 2 hubs")


if __name__ == "__main__":
    if run_with_node():
        sys.exit(0)
    print("Node not found, using Python fallback...")
    run_with_python_fallback()
