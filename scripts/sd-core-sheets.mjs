import { note, diagram, flow, buildCoreConceptPages } from './sheet-helpers.mjs';
import { CORE_CONCEPT_DATA } from './sd-core-data.mjs';

const VIDEO_TITLES = {
  '612Y0jXmWKk': 'Vector Databases Explained',
  'yE3O28E38_E': 'Building Chat Systems',
  'cTMomjk1iRc': 'Task Scheduler Design',
  'P3FKlI86t3Q': 'Apache Kafka / Zookeeper',
  'Y1qxI-Df4Lk': 'CNN Architecture Deep Dive',
  'qcIQKYGvdgk': 'House Robber / Concurrency',
  '9Ppg8NLk4NE': 'Word2Vec in NLP',
};

function buildConceptConfigs() {
  return CORE_CONCEPT_DATA.map((d) => ({
    slug: d.slug,
    title: d.title,
    subtitle: d.summary.slice(0, 160),
    tip: `Lead with a 30-second definition, then one real system example and name 2–3 designs where ${d.title} is non-negotiable.`,
    prompt: `You are interviewing a senior candidate on the system design core concept: ${d.title}. Ask for a crisp definition, a concrete example from a large-scale system, trade-offs, and failure modes. Probe with 2 follow-up questions from the Q&A section. Score clarity, correct mapping to real architectures, and interview communication.`,
    summary: d.summary,
    analogy: d.analogy,
    howItWorks:
      note(d.mechanism) +
      diagram(
        'Typical placement',
        flow([
          { text: 'Client', class: 'gray' },
          { text: 'Edge / Gateway', class: '' },
          { text: d.title.split(' ')[0], class: 'purple' },
          { text: 'Services', class: 'green' },
          { text: 'Data stores', class: 'orange' },
        ])
      ),
    example: note(`<strong>Scenario:</strong> ${d.example}`),
    qa: d.qa,
    usedIn: d.usedIn,
    usedInNote: 'In interviews, after explaining the concept, say: "This shows up directly in …" and link two designs.',
    checklist: d.checklist,
    tags: d.tags,
    videos: d.videos,
  }));
}

export const coreConceptConfigs = buildConceptConfigs();
export const corePages = buildCoreConceptPages(coreConceptConfigs);

export const CORE_VIDEO_MAP = Object.fromEntries(
  coreConceptConfigs.map((c) => [
    `/cheat-sheets/system-design/core/${c.slug}`,
    (c.videos || []).map((id) => ({
      title: VIDEO_TITLES[id] || 'Binod Suman Tutorial',
      url: `https://youtu.be/${id}`,
      thumbId: id,
    })),
  ])
);
