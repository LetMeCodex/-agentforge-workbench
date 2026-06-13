# AgentForge Evaluation Harness (AIOPL Track 1 Workbench)

AgentForge is a hackathon-grade enterprise AI evaluation platform designed for testing, optimizing, and monitoring LLM agent performance.

## Key Features

1. **Overview Dashboard**: Interactive performance graphs (dual-line SVGs), preference win distributions (donut charts), and top failure mode frequencies to quickly compare baseline vs. optimized models.
2. **Dataset Import**: Support for importing real evaluation datasets (containing support tickets, logic riddles, or customer prompts) with validation.
3. **Trace Node Graph**: Dynamic React Flow graph tracking LLM agent trajectories (Triage -> RAG Context -> LLM Judge -> Scoring -> Verifier Auditor).
4. **Evaluation Lab**: Side-by-side pairwise arena evaluations with detailed dimension grading metrics.
5. **Prompt Optimizer Matrix**: A comparison workbench showing score, latency, and cost improvements between legacy prompts and optimized prompts.
6. **Tuning Playground**: Interactive sandbox testing environments for debugging judge system prompts.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone <your-github-repo-url>
   cd Hackathon
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory and add your Google Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Note: If no API key is provided, AgentForge automatically defaults to **Simulation Mode** using local deterministic heuristics and cached dataset distributions.*

### Running the App
Start the local Vite development server:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### Building for Production
To compile and build the static assets:
```bash
npm run build
```
The output will be stored in the `dist/` directory.

---

## Security Warning
Do **NOT** commit your API keys directly to the codebase. The application is configured to read the Gemini key from `import.meta.env.VITE_GEMINI_API_KEY`. Keep this key in `.env.local` which is ignored by Git in `.gitignore`.
