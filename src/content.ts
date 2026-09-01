// Content sourced from Ayush's live portfolio + GitHub. No facts invented.

const PF = 'https://portfolio-website-zeta-topaz-84.vercel.app'

export const LINKS = {
  email: 'das.ayush4890@gmail.com',
  github: 'https://github.com/AyushDas4890',
  portfolio: PF,
  linkedin: 'https://linkedin.com/in/ayushdas4890',
  resume: `${PF}/Ayush_Das_ML_Resume.pdf`,
}

export interface Experience {
  role: string
  org: string
  suborg?: string
  period: string
  description: string
  certificate: string
}

export const EXPERIENCE: Experience[] = [
  {
    role: 'Skill Training & Android Development Intern',
    org: 'VanillaKart',
    suborg: 'Emvity Brushflicks Creative Hub Pvt. Ltd.',
    period: 'Nov 2025 — Jan 2026',
    description:
      'One month of intensive training followed by one month of practical internship. Built an Android hybrid application and contributed to real-world company projects.',
    certificate: `${PF}/certificates/vanillakart-android-app.png`,
  },
  {
    role: 'Web Development Intern',
    org: 'VanillaKart',
    suborg: 'Emvity Brushflicks Creative Hub Pvt. Ltd.',
    period: 'Sep 2025 — Nov 2025',
    description:
      'Two-month web development internship managing client websites — WordPress development and user-experience enhancement on production sites.',
    certificate: `${PF}/certificates/vanillakart-web-dev.png`,
  },
]

export interface CaseStudy {
  problem: string
  approach: string
  highlights: string[]
}

export interface Project {
  id: string
  index: string
  title: string
  tagline: string
  blurb: string
  tech: string[]
  github: string
  demo?: string
  caseStudy: CaseStudy
}

export const PROJECTS: Project[] = [
  {
    id: '01',
    index: '01',
    title: 'AI Research Assistant Pipeline',
    tagline: 'Autonomous, self-critiquing research agents',
    blurb:
      'Five-agent LangGraph system that plans, searches, reads, self-critiques, and writes structured research reports. Dual-layer ChromaDB memory; results stream over SSE, cutting perceived latency ~87%.',
    tech: ['LangGraph', 'OpenAI', 'ChromaDB', 'FastAPI', 'Tavily'],
    github: 'https://github.com/AyushDas4890/AI-Research-Assistant-Pipeline',
    demo: 'https://ayushdas4890-ai-research-assistant-pipeline-app-1sjuvf.streamlit.app/',
    caseStudy: {
      problem:
        'A single LLM call is a guess — it cannot tell you how confident it is, go find what it is missing, or notice it answered the wrong question. Linear plan → search → write chains produce confident nonsense when retrieval comes back thin.',
      approach:
        'A cyclic LangGraph of five agents — planner, search, read, critic, write — over a dual-layer ChromaDB memory (episodic context scoped per run, semantic context surviving across runs). The critic is a routing node, not a post-processing step: it can send the graph back for more evidence before it ever writes.',
      highlights: [
        'Critique as an explicit routing node — the graph decides retry vs. terminate',
        'Dual-layer vector memory: per-run episodic + cross-run semantic',
        'Results stream to the client over SSE — ~87% lower perceived latency',
        'Structured, sourced research reports rather than a single generation',
      ],
    },
  },
  {
    id: '02',
    index: '02',
    title: 'Legal-Financial Conflict Resolver',
    tagline: 'Explainable contradiction detection for legal docs',
    blurb:
      'Five-phase NLP pipeline detecting contradictions between legal documents. DeBERTa-v3-large for entailment, FAISS for clause alignment, cross-attention heatmaps so a reviewer sees which spans drove the call.',
    tech: ['DeBERTa-v3', 'HuggingFace', 'FAISS', 'spaCy', 'FastAPI', 'React'],
    github: 'https://github.com/AyushDas4890/Legal-Conflict-Resolver',
    demo: 'https://website-orpin-chi-25.vercel.app',
    caseStudy: {
      problem:
        'Contradictions between legal or financial documents are high-stakes and easy to miss. A black-box classifier that just says "conflict" is not usable in a legal context — a reviewer has to see why.',
      approach:
        'A five-phase pipeline: segment and align clauses with FAISS, run DeBERTa-v3-large for natural-language entailment between aligned spans, then surface cross-attention heatmaps so the exact spans that drove each decision are visible.',
      highlights: [
        'DeBERTa-v3-large entailment over FAISS-aligned clause pairs',
        'Cross-attention heatmaps make every call auditable',
        'Explainability treated as non-optional, not an add-on',
        'FastAPI + React front end for reviewer workflows',
      ],
    },
  },
  {
    id: '03',
    index: '03',
    title: 'Cancer TF Discovery Atlas',
    tagline: 'Pan-cancer transcription-factor discovery in 3D',
    blurb:
      'Pan-cancer transcription-factor analysis over TCGA RNA-Seq data as an interactive 3D dashboard. Surfaces 19 lineage-specific TFs at 98.76% accuracy and rediscovers known master regulators (HNF1B, GATA3, NKX2-1).',
    tech: ['Next.js', 'Three.js', 'scikit-learn', 'Python', 'Tailwind'],
    github: 'https://github.com/AyushDas4890/cancer-tf-dashboard',
    demo: 'https://cancer-tf-dashboard.vercel.app',
    caseStudy: {
      problem:
        'Transcription-factor signals that distinguish cancer lineages are buried in high-dimensional TCGA RNA-Seq data — and any pipeline claiming to find them has to prove it is finding biology, not fitting noise.',
      approach:
        'Classify lineages from RNA-Seq expression, extract the transcription factors driving the separation, and surface everything in an interactive 3D dashboard for exploration.',
      highlights: [
        '19 lineage-specific transcription factors at 98.76% classifier accuracy',
        'Independently rediscovers known master regulators — HNF1B, GATA3, NKX2-1',
        'Interactive 3D exploration built with Three.js',
        'That rediscovery is the result that says the pipeline finds real biology',
      ],
    },
  },
  {
    id: '04',
    index: '04',
    title: 'Carbon Footprint Generator — C4Future',
    tagline: 'Carbon accounting with calibrated uncertainty',
    blurb:
      'Production carbon-accounting platform: XGBoost predictions wrapped in conformal intervals, a RAG sustainability advisor over real LCA data, an agentic bill-of-materials decomposer, and SHAP attributions on every prediction.',
    tech: ['Django', 'XGBoost', 'LangChain', 'ChromaDB', 'OpenAI', 'Docker'],
    github: 'https://github.com/AyushDas4890/Carbon_Footprint_Generator',
    demo: 'https://ad074890-c4future.hf.space',
    caseStudy: {
      problem:
        'A bare point estimate for a carbon footprint is not actionable — decision-makers need a calibrated range and a reason to trust each number.',
      approach:
        'XGBoost predictions wrapped in conformal intervals for calibrated uncertainty, a RAG advisor grounded in real life-cycle-assessment data, an agentic bill-of-materials decomposer, and SHAP attributions on every prediction.',
      highlights: [
        'Conformal intervals — every prediction ships a calibrated uncertainty range',
        'RAG sustainability advisor grounded in real LCA data',
        'Agentic bill-of-materials decomposition',
        'SHAP attributions on every prediction for transparency',
      ],
    },
  },
]

export interface Stat {
  value: string
  label: string
}

export const ABOUT = {
  blurb:
    'Computer Science undergraduate building end-to-end machine learning, NLP and Generative AI systems — from multi-agent research pipelines to legal document intelligence. Models that ship: explainable, measured, wrapped in interfaces people actually use.',
  stats: [
    { value: '6+', label: 'Projects shipped' },
    { value: '8.08', label: 'CGPA' },
    { value: '2', label: 'Internships' },
    { value: '9', label: 'Certifications' },
  ] as Stat[],
  competencies: [
    { title: 'LangGraph & Multi-Agent', detail: 'Autonomous agent orchestration' },
    { title: 'NLP & Transformers', detail: 'DeBERTa, BERT, fine-tuning' },
    { title: 'RAG Systems', detail: 'ChromaDB, vector retrieval' },
    { title: 'Full-Stack ML', detail: 'FastAPI, React, deployment' },
  ],
  education:
    'B.Tech, Computer Science & Engineering · Lovely Professional University',
  focus: 'Generative AI · NLP · LLM Applications · Multi-agent systems · RAG',
  based: 'Punjab, India',
}

export interface Credential {
  issuer: string
  title: string
  href: string
}

export const CREDENTIALS: Credential[] = [
  { issuer: 'Microsoft', title: 'Fundamentals of AI & ML', href: `${PF}/certificates/microsoft-ai-ml-fundamentals.pdf` },
  { issuer: 'IBM', title: 'Python for Data Science & AI', href: `${PF}/certificates/python-for-data-science-ibm.pdf` },
  { issuer: 'Coursera', title: 'Introduction to RAG', href: `${PF}/certificates/intro-to-rag.pdf` },
  { issuer: 'Udemy', title: 'Master Generative AI', href: `${PF}/certificates/master-gen-ai.pdf` },
  { issuer: 'Coursera', title: 'GenAI Apps with No-Code Tools', href: `${PF}/certificates/genai-no-code-tools.pdf` },
  { issuer: 'IBM', title: 'ChatGPT Prompt Engineering', href: `${PF}/certificates/chatgpt-prompt-engineering.pdf` },
  { issuer: 'IBM', title: 'ChatGPT Essentials', href: `${PF}/certificates/chatgpt-essentials.pdf` },
  { issuer: 'CipherSchools', title: 'Data Science', href: `${PF}/certificates/data-science-cipherschools.pdf` },
  { issuer: 'Coursera', title: 'Python Essentials', href: `${PF}/certificates/coursera-python.pdf` },
]
