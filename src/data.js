// Central content source — edit here to update the whole site.
// v2 schema: projects drive cards (Work), case bands, and /work/:slug pages.

export const profile = {
  name: 'Ayush Das',
  firstName: 'AYUSH',
  lastName: 'DAS',
  role: 'AI / ML Engineer',
  discipline: 'GENERATIVE INTELLIGENCE',
  tagline: 'Generative AI · NLP · LLM Applications',
  location: 'Punjab, India',
  email: 'das.ayush4890@gmail.com',
  github: 'https://github.com/AyushDas4890',
  linkedin: 'https://linkedin.com/in/ayushdas4890',
  resume: '/Ayush_Das_ML_Resume.pdf',
  summary:
    'Computer Science undergraduate building end-to-end machine learning, NLP and Generative AI systems — from multi-agent research pipelines to legal document intelligence. Models that ship: explainable, measured, wrapped in interfaces people actually use.',
}

export const socials = [
  { label: 'GitHub', url: profile.github },
  { label: 'LinkedIn', url: profile.linkedin },
  { label: 'Email', url: `mailto:${profile.email}` },
]

// featured: true → 02 Work card row (4). caseBand: true → 03 case highlight band.
export const projects = [
  {
    slug: 'ai-research-assistant',
    index: '01',
    featured: true,
    caseBand: true,
    title: 'AI Research Assistant',
    caseTitle: ['RESEARCH', 'WITHOUT', 'HANDS'],
    monogram: 'A',
    label: 'MULTI-AGENT · LANGGRAPH',
    caseLabel: 'AUTONOMOUS SYSTEM',
    palette: { a: '#5a6cff', b: '#ff7a59' },
    artwork: '/artwork/ai-research-assistant.jpg',
    tagline:
      'An autonomous multi-agent system that researches any topic end-to-end — and remembers what it learned across sessions.',
    problem:
      'Deep research is slow, repetitive, and forgetful: every new question restarts from zero, and single-shot LLM answers hallucinate coverage they never did.',
    approach:
      'A five-agent LangGraph StateGraph — plan → search → read → critique → write — with a self-correcting critic loop that re-searches when it detects coverage gaps. Dual-layer memory pairs typed graph state with a ChromaDB vector store that persists across runs. A FastAPI backend streams live agent progress over Server-Sent Events.',
    stack: ['LangGraph', 'OpenAI GPT-4o', 'ChromaDB', 'FastAPI', 'Tavily'],
    screenshots: ['/projects/ai-research-assistant.png'],
    github: 'https://github.com/AyushDas4890/AI-Research-Assistant-Pipeline',
    demo: 'https://ayushdas4890-ai-research-assistant-pipeline-app-1sjuvf.streamlit.app/',
  },
  {
    slug: 'legal-conflict-resolver',
    index: '02',
    featured: true,
    caseBand: false,
    title: 'Legal Conflict Resolver',
    caseTitle: ['CLAUSE', 'VERSUS', 'CLAUSE'],
    monogram: 'L',
    label: 'LEGAL NLP · DEBERTA',
    caseLabel: 'EXPLAINABLE AI',
    palette: { a: '#8b9cff', b: '#c9d4ff' },
    artwork: '/artwork/legal-conflict-resolver.jpg',
    tagline:
      'An end-to-end Legal NLP pipeline that detects contradictions across legal and financial documents.',
    problem:
      'Contradictory clauses hide across hundreds of pages of contracts; manual review is expensive and misses cross-document conflicts.',
    approach:
      'DeBERTa-v3-large fine-tuned for contradiction detection reaches >85% validation accuracy via threshold tuning. Cross-attention heatmaps make every verdict explainable by pointing at the evidence spans. FastAPI backend plus an analytics dashboard deliver real-time conflict analysis.',
    stack: ['DeBERTa-v3', 'PyTorch', 'Transformers', 'FastAPI'],
    screenshots: ['/projects/legal-conflict-resolver.png'],
    github: 'https://github.com/AyushDas4890/Legal-Conflict-Resolver',
    demo: 'https://website-orpin-chi-25.vercel.app/',
  },
  {
    slug: 'rag-medical-assistant',
    index: '03',
    featured: true,
    caseBand: true,
    title: 'Healthcare Navigator',
    caseTitle: ['EVIDENCE', 'OVER', 'GUESSWORK'],
    monogram: 'H',
    label: 'RAG · HEALTHCARE',
    caseLabel: 'GROUNDED RETRIEVAL',
    palette: { a: '#2fb8a6', b: '#ffb27a' },
    artwork: '/artwork/rag-medical-assistant.jpg',
    tagline:
      'Evidence-based clinical answers grounded in a retrieved guideline text corpus.',
    problem:
      'Clinical questions demand sourced answers; a bare LLM invents citations and erodes trust exactly where stakes are highest.',
    approach:
      'Citation-grounded retrieval over a curated guideline corpus eliminates hallucinations: every answer carries the passages it stands on. Built with FastAPI, OpenAI and a ChromaDB vector store.',
    stack: ['Python', 'FastAPI', 'OpenAI', 'ChromaDB'],
    screenshots: ['/projects/rag-medical-assistant.png'],
    github: 'https://github.com/AyushDas4890/RAG-Medical_Assistant',
    demo: 'https://rag-medical-assistant-five.vercel.app',
  },
  {
    slug: 'cancer-tf-dashboard',
    index: '04',
    featured: true,
    caseBand: false,
    title: 'Cancer TF Atlas',
    caseTitle: ['READING', 'THE', 'GENOME'],
    monogram: 'C',
    label: 'BIOINFORMATICS · 3D',
    caseLabel: 'RNA-SEQ DISCOVERY',
    palette: { a: '#ff8a65', b: '#7afcd0' },
    artwork: '/artwork/cancer-tf-dashboard.jpg',
    tagline:
      'Predicting cancer cell growth type and discovering key Transcription Factors from RNA-Seq.',
    problem:
      'Transcription-factor signals relevant to cancer growth are buried in high-dimensional RNA-Seq data that resists manual exploration.',
    approach:
      'An optimized Random Forest classifier reaches 98.76% accuracy on growth-type prediction, with feature importance surfacing candidate transcription factors. An interactive 3D dashboard built with Next.js and Three.js makes the atlas explorable.',
    stack: ['Python', 'Random Forest', 'Next.js', 'Three.js'],
    screenshots: ['/projects/cancer-tf-dashboard.png'],
    github: 'https://github.com/AyushDas4890/cancer-tf-dashboard',
    demo: 'https://cancer-tf-dashboard.vercel.app',
  },
  {
    slug: 'carbon-footprint',
    index: '05',
    featured: false,
    caseBand: false,
    title: 'Carbon Footprint Generator',
    caseTitle: ['COUNTING', 'INVISIBLE', 'COSTS'],
    monogram: 'C',
    label: 'SUSTAINABILITY ML',
    caseLabel: 'CLIMATE ANALYTICS',
    palette: { a: '#ffd07a', b: '#2fb8a6' },
    artwork: '/artwork/carbon-footprint.jpg',
    tagline:
      'C4Future — an AI tool that estimates a product’s carbon footprint and shows how to offset it.',
    problem:
      'Product-level CO₂ impact is opaque to consumers and small manufacturers; existing calculators are coarse and unactionable.',
    approach:
      'A Random Forest regressor predicts CO₂ emissions from product attributes and decomposes them into materials, manufacturing and transport. Offset strategies plus real-world equivalencies (trees, car-km) make results tangible, served from a Django backend with Chart.js dashboards.',
    stack: ['Django', 'Scikit-Learn', 'Pandas', 'Chart.js'],
    screenshots: ['/projects/carbon-footprint.png'],
    github: 'https://github.com/AyushDas4890/Carbon_Footprint_Generator',
    demo: 'https://ad074890-c4future.hf.space/',
  },
  {
    slug: 'library-book-classifier',
    index: '06',
    featured: false,
    caseBand: false,
    title: 'Library Circulation Intelligence',
    caseTitle: ['SHELVES', 'THAT', 'THINK'],
    monogram: 'L',
    label: 'CLUSTERING · RAG',
    caseLabel: 'OPEN DATA',
    palette: { a: '#aed581', b: '#5a6cff' },
    artwork: '/artwork/library-book-classifier.jpg',
    tagline:
      'Unsupervised segmentation and semantic retrieval over real public-library open data.',
    problem:
      'Library circulation data holds usage archetypes no catalogue exposes; librarians lack tools to see or search them.',
    approach:
      'k-means clustering groups titles into circulation archetypes, and client-side semantic search mimics RAG retrieval directly in the browser. Python and Scikit-Learn power the modelling; FastAPI and Next.js deliver it.',
    stack: ['Python', 'Scikit-Learn', 'FastAPI', 'Next.js'],
    screenshots: ['/projects/library-book-classifier.png'],
    github: 'https://github.com/AyushDas4890/Library-book-classifier',
    demo: 'https://library-circulation-intelligence.vercel.app',
  },
]

export const featuredProjects = projects.filter((p) => p.featured)
export const caseBandProjects = projects.filter((p) => p.caseBand)

// Additional repos for the all-work list (beyond the 6 main projects).
export const moreWork = [
  { name: 'LangChain Experiments', description: 'Chains, agents and retrieval workflows.', url: 'https://github.com/AyushDas4890/LANGCHAIN' },
  { name: 'Weather Clustering', description: 'Unsupervised weather patterns, interactive front end.', url: 'https://github.com/AyushDas4890/Weather_Clustering_Project' },
  { name: 'Grocery Sales Predictor', description: 'Gradient-boosted demand forecasting, Streamlit app.', url: 'https://github.com/AyushDas4890/Grocery-sales-predictor' },
  { name: 'YouTube Chatbot', description: 'Q&A over YouTube video content.', url: 'https://github.com/AyushDas4890/yt_chatbot' },
]

export const experience = [
  {
    index: '01',
    role: 'Skill Training & Android Development Intern',
    company: 'VanillaKart',
    org: 'Subsidiary of Emvity Brushflicks Creative Hub Pvt. Ltd.',
    period: 'Nov 2025 — Jan 2026',
    summary:
      'One month of intensive training followed by one month of practical internship. Developed an Android Hybrid Application and contributed to real-world company projects.',
    cert: '/certificates/vanillakart-android-app.png',
  },
  {
    index: '02',
    role: 'Web Development Intern',
    company: 'VanillaKart',
    org: 'Subsidiary of Emvity Brushflicks Creative Hub Pvt. Ltd.',
    period: 'Sep 2025 — Nov 2025',
    summary:
      'Managed client websites through a two-month web development internship — WordPress development and user-experience enhancement on production sites.',
    cert: '/certificates/vanillakart-web-dev.png',
  },
]

export const certificates = [
  { index: '01', title: 'Fundamentals of AI & ML', issuer: 'MICROSOFT', file: '/certificates/microsoft-ai-ml-fundamentals.pdf' },
  { index: '02', title: 'Python for Data Science & AI', issuer: 'IBM', file: '/certificates/python-for-data-science-ibm.pdf' },
  { index: '03', title: 'Introduction to RAG', issuer: 'COURSERA', file: '/certificates/intro-to-rag.pdf' },
  { index: '04', title: 'Master Generative AI', issuer: 'UDEMY', file: '/certificates/master-gen-ai.pdf' },
  { index: '05', title: 'GenAI Apps with No-Code Tools', issuer: 'COURSERA', file: '/certificates/genai-no-code-tools.pdf' },
  { index: '06', title: 'ChatGPT Prompt Engineering', issuer: 'IBM', file: '/certificates/chatgpt-prompt-engineering.pdf' },
  { index: '07', title: 'ChatGPT Essentials', issuer: 'IBM', file: '/certificates/chatgpt-essentials.pdf' },
  { index: '08', title: 'Data Science', issuer: 'CIPHERSCHOOLS', file: '/certificates/data-science-cipherschools.pdf' },
  { index: '09', title: 'Python Essentials', issuer: 'COURSERA', file: '/certificates/coursera-python.pdf' },
]

export const education = {
  school: 'Lovely Professional University',
  location: 'Punjab, India',
  degree: 'B.Tech, Computer Science & Engineering',
  detail: 'CGPA 8.08',
  period: 'Aug 2023 — Present',
}

export const sections = [
  { id: 'hero', num: '01', name: 'INTRO' },
  { id: 'about', num: '02', name: 'ABOUT' },
  { id: 'work', num: '03', name: 'WORK' },
  { id: 'case', num: '04', name: 'CASE' },
  { id: 'experience', num: '05', name: 'EXPERIENCE' },
  { id: 'credentials', num: '06', name: 'CREDENTIALS' },
  { id: 'contact', num: '07', name: 'CONTACT' },
]

// Resolve paths for all assets dynamically to support subpath hosting (GitHub Pages) and root domain hosting (Vercel)
const base = import.meta.env.BASE_URL || '/'
const resolvePath = (path) => {
  if (!path || path.startsWith('http') || path.startsWith('mailto')) return path
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return base + cleanPath
}

profile.resume = resolvePath(profile.resume)

projects.forEach((p) => {
  if (p.artwork) p.artwork = resolvePath(p.artwork)
  if (p.screenshots) p.screenshots = p.screenshots.map(resolvePath)
})

experience.forEach((e) => {
  if (e.cert) e.cert = resolvePath(e.cert)
})

certificates.forEach((c) => {
  if (c.file) c.file = resolvePath(c.file)
})
