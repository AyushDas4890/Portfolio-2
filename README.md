# Ayush Das — AI/ML Engineer Portfolio

<div align="center">

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://portfolio-website-zeta-topaz-84.vercel.app/)
[![GitHub Pages Deployment](https://img.shields.io/badge/Deploy-GitHub_Pages-blue?style=for-the-badge&logo=github&logoColor=white)](https://AyushDas4890.github.io/Portfolio-2/)

---

A premium, interactive, and editorial "aurora" portfolio showcasing end-to-end AI/ML pipelines, NLP systems, and generative applications.

[Live Vercel Site](https://portfolio-website-zeta-topaz-84.vercel.app/) &nbsp;•&nbsp; [GitHub Pages Mirror](https://AyushDas4890.github.io/Portfolio-2/) &nbsp;•&nbsp; [Download Résumé](https://portfolio-website-zeta-topaz-84.vercel.app/Ayush_Das_ML_Resume.pdf)

<!-- Vercel continuous deployment trigger -->

</div>

## 🛠️ Tech Stack & Skills

<div align="left">

- **Languages:** ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![C++](https://img.shields.io/badge/C++-00599C?style=flat-square&logo=c%2B%2B&logoColor=white) ![C](https://img.shields.io/badge/C-A8B9CC?style=flat-square&logo=c&logoColor=black) ![SQL](https://img.shields.io/badge/SQL-4479A1?style=flat-square&logo=postgresql&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
- **AI / Machine Learning:** ![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white) ![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=flat-square&logo=tensorflow&logoColor=white) ![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=flat-square&logo=scikit-learn&logoColor=white) ![XGBoost](https://img.shields.io/badge/XGBoost-1E8CFF?style=flat-square) ![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas&logoColor=white)
- **NLP & LLMs:** ![Transformers](https://img.shields.io/badge/Hugging_Face_Transformers-FFD21E?style=flat-square&logo=huggingface&logoColor=black) `DeBERTa-v3` `LangChain` `LangGraph (Multi-Agent)`
- **Frameworks & DBs:** ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) ![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=flat-square&logo=streamlit&logoColor=white) `ChromaDB` `Git/GitHub`
- **Frontend / Styling:** ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)

</div>

---

## 🚀 Selected Work & Pipelines

### 🤖 1. AI Research Assistant Pipeline
*An autonomous multi-agent system that researches any topic end-to-end—and remembers context across runs.*
*   **Agent Architecture:** Built using a 5-agent **LangGraph StateGraph** mapping out plan → search → read → critique → write loops.
*   **Self-Correction:** Critic evaluation checks findings and automatically triggers extra search cycles on coverage gaps.
*   **Memory Depth:** Uses local graph states combined with **ChromaDB** vector stores.
*   **API/UX:** FastAPI backend streaming live progress to a Streamlit front end.
*   [View Repository](https://github.com/AyushDas4890/AI-Research-Assistant-Pipeline)

### ⚖️ 2. Legal Clause Conflict Resolver
*An end-to-end Legal NLP pipeline that automatically detects contradictions across contracts.*
*   **Model:** Fine-tuned `DeBERTa-v3-large` for contradiction detection.
*   **Performance:** Achieved **87% validation accuracy** through custom threshold tuning.
*   **XAI:** Incorporated cross-attention heatmaps for extracting highlight clauses.
*   [View Repository](https://github.com/AyushDas4890/Legal-Conflict-Resolver)

---

## 💻 Local Setup & Development

To test the interactive components (such as custom smooth scrolling, the dynamic custom cursor, and the `Ctrl+K` command palette panel) locally:

1. Clone the project files:
   ```bash
   git clone https://github.com/AyushDas4890/Portfolio-2.git
   cd Portfolio-2
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## ⚡ Deployment Automation

- **GitHub Pages:** Runs automatically via `npm run deploy` to publish the output directory `/dist` directly to the `gh-pages` branch.
- **Vercel Integration:** Configured with continuous integration (CI) linking the repository. Every push to the `main` branch immediately triggers a production build.
