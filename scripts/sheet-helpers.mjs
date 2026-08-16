/** HTML building blocks for full-page cheat sheets */

export function table(headers, rows) {
  const th = headers.map((h) => `<th>${h}</th>`).join('');
  const tr = rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
  return `<div class="cs-table-wrap"><table class="cs-table"><tr>${th}</tr>${tr}</table></div>`;
}

export function note(html) {
  return `<div class="cs-note">${html}</div>`;
}

export function diagram(title, inner) {
  return `<div class="cs-diagram"><div class="cs-diagram-title">${title}</div>${inner}</div>`;
}

export function flow(boxes) {
  return `<div class="cs-flow">${boxes
    .map((b, i) => {
      const cls = b.class ? ` cs-box ${b.class}` : ' cs-box';
      const arrow = i < boxes.length - 1 ? '<span class="cs-arrow">→</span>' : '';
      return `<span class="${cls.trim()}">${b.text}</span>${arrow}`;
    })
    .join('')}</div>`;
}

export function layers(items) {
  return `<div class="cs-layer-diagram">${items
    .map((t, i) => `<div class="cs-layer l${(i % 4) + 1}">${t}</div>`)
    .join('')}</div>`;
}

export function archDiagram(title, rows) {
  return diagram(
    title,
    `<div class="cs-arch-grid">${rows
      .map((row) =>
        `<div class="cs-arch-row">${row
          .map((cell) => `<div class="cs-arch-cell ${cell.class || ''}">${cell.text}</div>`)
          .join('')}</div>`
      )
      .join('')}</div>`
  );
}

export function checklist(items) {
  return `<ul class="cs-checklist">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
}

export function tags(list) {
  return `<div class="cs-tags">${list.map((t) => `<span class="cs-tag">${t}</span>`).join('')}</div>`;
}

export function scaleBlock(lines) {
  return note(
    `<strong>Assumptions</strong><ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul>`
  );
}

export function enrichSdConfig(c) {
  const functional = [...(c.functional || [])];
  const nonFunctional = [...(c.nonFunctional || [])];
  while (functional.length < 3) {
    functional.push('Clarify additional functional edge cases with the interviewer before deep diving.');
  }
  while (nonFunctional.length < 3) {
    nonFunctional.push('Discuss observability, failure recovery, and security expectations explicitly.');
  }
  return { ...c, functional, nonFunctional };
}

export function buildSDPages(configs) {
  return configs.map((raw) => {
    const c = enrichSdConfig(raw);
    return {
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    tip: c.tip,
    prompt: c.prompt,
    papers: [
      {
        title: '① Functional requirements',
        body:
          note(`<ul>${c.functional.map((f) => `<li>${f}</li>`).join('')}</ul>`) +
          (c.outOfScope
            ? note(`<strong>Out of scope (state in interview)</strong><ul>${c.outOfScope.map((f) => `<li>${f}</li>`).join('')}</ul>`)
            : ''),
      },
      {
        title: '② Non-functional requirements',
        body: note(`<ul>${c.nonFunctional.map((f) => `<li>${f}</li>`).join('')}</ul>`),
      },
      {
        title: '③ Back-of-the-envelope scale',
        body: scaleBlock(c.scale) + (c.scaleNote ? note(c.scaleNote) : ''),
      },
      {
        title: '④ High-level architecture',
        body: c.architecture + (c.archNotes ? note(c.archNotes) : ''),
      },
      {
        title: '⑤ Data flow & execution path',
        body: c.dataFlow + (c.dataFlowNotes ? note(c.dataFlowNotes) : ''),
      },
      {
        title: '⑥ API & interfaces',
        body: table(['Endpoint / flow', 'Purpose', 'Notes'], c.apis),
      },
      {
        title: '⑦ Data model & storage',
        body: c.dataModel + (c.storage ? table(['Store', 'What', 'Why'], c.storage) : ''),
      },
      {
        title: '⑧ Deep dive — core components',
        body: c.deepDives.map((d) => `<h3 class="cs-subheading">${d.title}</h3>${d.body}`).join(''),
      },
      {
        title: '⑨ Trade-offs & alternatives',
        body: table(['Decision', 'Option A', 'Option B', 'Pick when'], c.tradeoffs),
      },
      {
        title: '⑩ 45-minute interview script',
        body: note(`<ol>${c.script.map((s) => `<li>${s}</li>`).join('')}</ol>`),
      },
      {
        title: '⑪ Likely follow-up questions',
        body: table(['Question', 'Short answer'], c.followUps),
      },
      {
        title: '⑫ Revision checklist',
        body: checklist(c.checklist) + tags(c.tags || []),
      },
    ],
  };
  });
}

export function buildAIPages(configs) {
  return configs.map((c) => ({
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    tip: c.tip,
    prompt: c.prompt,
    papers: [
      {
        title: '① What you must know (30 sec)',
        body: note(c.summary) + (c.analogy ? note(`<strong>Analogy:</strong> ${c.analogy}`) : ''),
      },
      {
        title: '② How it works',
        body: c.howItWorks + (c.flowNote ? note(c.flowNote) : ''),
      },
      {
        title: '③ Step-by-step (hands-on)',
        body: `<div class="cs-roadmap">${c.steps
          .map(
            (s, i) =>
              `<div class="cs-roadmap-step"><div><h4>Step ${i + 1} — ${s.title}</h4><p>${s.body}</p></div></div>`
          )
          .join('')}</div>`,
      },
      {
        title: '④ Code / config patterns',
        body: c.patterns + (c.codeHint ? `<div class="cs-code-block">${c.codeHint}</div>` : ''),
      },
      {
        title: '⑤ Production & pitfalls',
        body:
          table(['Pitfall', 'Why it hurts', 'Fix'], c.pitfalls) +
          (c.production ? note(`<strong>Production tips:</strong><ul>${c.production.map((p) => `<li>${p}</li>`).join('')}</ul>`) : ''),
      },
      {
        title: '⑥ Interview / on-the-job Q&A',
        body: table(['Question', 'Answer'], c.qa),
      },
      {
        title: '⑦ Tools & ecosystem',
        body: note(`<ul>${c.tools.map((t) => `<li>${t}</li>`).join('')}</ul>`) + tags(c.tags || []),
      },
      {
        title: '⑧ Revision checklist',
        body: checklist(c.checklist),
      },
    ],
  }));
}

export function buildCoreConceptPages(configs) {
  return configs.map((c) => ({
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    tip: c.tip,
    prompt: c.prompt,
    papers: [
      {
        title: '① What it is (30 seconds)',
        body: note(c.summary) + (c.analogy ? note(`<strong>Analogy:</strong> ${c.analogy}`) : ''),
      },
      {
        title: '② How it works in system design',
        body: c.howItWorks + (c.diagram ? c.diagram : ''),
      },
      {
        title: '③ Concrete system design example',
        body: c.example,
      },
      {
        title: '④ Important interview Q&A',
        body: table(['Question', 'Answer'], c.qa),
      },
      {
        title: '⑤ Seen in these system designs',
        body:
          note(
            `<ul>${c.usedIn
              .map((l) => `<li><a href="${l.href}">${l.label}</a> — ${l.why || 'core dependency'}</li>`)
              .join('')}</ul>`
          ) + (c.usedInNote ? note(c.usedInNote) : ''),
      },
      {
        title: '⑥ Revision checklist',
        body: checklist(c.checklist) + tags(c.tags || []),
      },
    ],
  }));
}
