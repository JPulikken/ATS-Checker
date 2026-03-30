# 🎯 ATS Resume Checker

> **Beat the ATS. Land the Interview.**

A full-stack, production-ready ATS (Applicant Tracking System) Resume Checker that analyzes your resume against job descriptions using NLP, TF-IDF similarity, and optional AI-powered suggestions.

![ATS Score](https://img.shields.io/badge/ATS%20Score-0--100-6366f1)
![Tech](https://img.shields.io/badge/Stack-React%20%2B%20Express%20%2B%20NLP-8b5cf6)
![License](https://img.shields.io/badge/License-MIT-06b6d4)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📤 **Upload Resume** | PDF, DOCX, DOC, or TXT — text extracted automatically |
| 🎯 **ATS Score** | Composite 0–100 score based on keyword match + TF-IDF + sections |
| 🔑 **Keyword Analysis** | Matched and missing keywords from the job description |
| 📊 **Section Breakdown** | Weighted scoring: Skills (40%), Experience (30%), Tools (20%), Education (10%) |
| 💡 **Smart Suggestions** | Rule-based improvement tips + optional OpenAI GPT suggestions |
| 🧠 **NLP Engine** | TF-IDF cosine similarity + tokenization + stopword removal |
| 🔒 **Privacy-First** | Files deleted immediately after analysis |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** v18+ and **npm** v9+
- (Optional) OpenAI API key for AI suggestions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ats-resume-checker.git
cd ats-resume-checker
```

### 2. Setup the Backend

```bash
cd server
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY if desired
npm install
npm run dev
```

The API will start at **http://localhost:5000**

### 3. Setup the Frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The app will start at **http://localhost:5173**

### 4. Open the App
Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
ats-resume-checker/
├── client/                          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUploader.jsx     # Drag & drop resume upload
│   │   │   ├── ScoreCard.jsx        # Animated circular ATS score
│   │   │   ├── KeywordList.jsx      # Matched/missing keyword chips
│   │   │   ├── SectionScores.jsx    # Weighted progress bars
│   │   │   ├── SuggestionsPanel.jsx # Improvement tips
│   │   │   └── LoadingSpinner.jsx   # Analysis loading state
│   │   ├── pages/
│   │   │   ├── HomePage.jsx         # Landing page with hero
│   │   │   ├── UploadPage.jsx       # Upload + JD form
│   │   │   └── ResultsPage.jsx      # Full analysis results
│   │   ├── utils/
│   │   │   ├── api.js               # Axios client
│   │   │   └── helpers.js           # Formatting utilities
│   │   ├── App.jsx                  # Router setup
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles + design tokens
│   ├── index.html
│   ├── vite.config.js               # Tailwind v4 + proxy
│   └── package.json
│
└── server/                          # Express API
    ├── controllers/
    │   └── analyzeController.js     # Request orchestration
    ├── routes/
    │   └── analyze.js               # POST /api/analyze + multer
    ├── services/
    │   ├── extractionService.js     # PDF/DOCX text extraction
    │   ├── scoringService.js        # NLP scoring engine (L1–L4)
    │   └── suggestionService.js     # Rule-based + AI suggestions
    ├── utils/
    │   ├── textUtils.js             # Tokenizer, stopwords, sections
    │   └── keywords.js              # Domain keyword lists
    ├── uploads/                     # Temp upload directory (auto-cleaned)
    ├── server.js                    # Express entry point
    ├── .env.example
    └── package.json
```

---

## ⚙️ API Reference

### `POST /api/analyze`

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `resume` | File | Resume file (PDF/DOCX/DOC/TXT, max 5MB) |
| `jobDescription` | String | Full job description text (min 50 chars) |

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 74,
    "matched_keywords": ["react", "node.js", "typescript", "..."],
    "missing_keywords": ["kubernetes", "terraform", "..."],
    "section_scores": {
      "skills": 82,
      "experience": 71,
      "tools": 65,
      "education": 90
    },
    "similarity_score": 68,
    "keyword_match_pct": 71,
    "resume_word_count": 542,
    "jd_word_count": 387,
    "suggestions": {
      "rule_based": ["Add these missing keywords...", "..."],
      "ai": ["(GPT suggestions if OPENAI_API_KEY is set)"]
    },
    "meta": {
      "filename": "resume.pdf",
      "file_size_kb": 124,
      "analyzed_at": "2024-01-15T10:30:00.000Z",
      "ai_enabled": false
    }
  }
}
```

### `GET /health`

Returns server status and configuration.

---

## 🧠 Scoring Engine

The scoring engine implements 4 levels:

### Level 1 — Tokenization & Keyword Extraction
- Tokenize both resume and JD texts
- Remove English stopwords
- Extract unigrams + bigrams (for multi-word terms like "machine learning")

### Level 2 — Keyword Match Percentage
- Compare JD keywords against resume keywords
- Handle partial matches and synonym-like overlaps
- Returns matched%, matched[], missing[]

### Level 3 — Weighted Section Scoring

| Section | Weight | What's Measured |
|---------|--------|----------------|
| Skills | **40%** | Tech skills, frameworks, languages vs. JD |
| Experience | **30%** | Action verbs, metrics, role alignment |
| Tools | **20%** | Cloud, DevOps, databases, platforms |
| Education | **10%** | Degree presence, education keywords |

### Level 4 — TF-IDF Cosine Similarity
- Uses the `natural` npm package's TfIdf class
- Builds term vectors for resume + JD
- Computes cosine similarity as semantic relevance score

### Final Score Formula
```
Final Score = (Keyword Match % × 0.40) + (Weighted Section Score × 0.40) + (TF-IDF Similarity × 0.20)
```

---

## 🔐 Environment Variables

### Server (`server/.env`)

```env
PORT=5000
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=            # Optional — enables AI suggestions
NODE_ENV=development
```

### Client (`client/.env.local`)

```env
VITE_API_URL=              # Leave empty for local proxy, set for production
```

---

## 🚀 Deployment

### Frontend → Vercel

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Set **Root Directory** to `client`
4. Set environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
5. Deploy!

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your repo
3. Set **Root Directory** to `server`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add environment variables:
   - `PORT=10000`
   - `CLIENT_URL=https://your-frontend.vercel.app`
   - `OPENAI_API_KEY=sk-...` (optional)
   - `NODE_ENV=production`
7. Deploy!

### Backend → Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Set working directory to `/server`
3. Add environment variables (same as Render above)
4. Railway auto-detects Node.js and deploys

### Connecting Frontend to Deployed Backend

After deploying the backend, update your Vercel frontend:
1. Go to Vercel project → Settings → Environment Variables
2. Add: `VITE_API_URL=https://your-backend-url.onrender.com/api`
3. Redeploy the frontend

---

## 🧪 Sample Test Data

### Sample Job Description
```
We're hiring a Senior Full-Stack Engineer to build scalable microservices.

Requirements:
• 5+ years React and TypeScript experience
• Node.js and Express REST API development  
• AWS (EC2, S3, Lambda, RDS), Docker, Kubernetes
• PostgreSQL and Redis
• CI/CD with GitHub Actions
• Agile/Scrum experience
• Experience with GraphQL preferred
• Strong problem-solving skills
```

### Expected Results (for a well-matched resume)
- ATS Score: 70–85
- Skills Score: 75–90
- Keyword Match: 65–80%
- Matched Keywords: react, typescript, node.js, express, aws, docker, postgresql, redis

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| File Upload | react-dropzone |
| Backend | Node.js, Express 5 |
| File Parsing | pdf-parse, mammoth |
| NLP | natural (TF-IDF, tokenization) |
| AI Suggestions | OpenAI GPT-3.5-turbo |
| File Upload | multer |
| CORS | cors package |

---

## 📝 License

MIT License — feel free to use, modify, and deploy.

---

**Built with ❤️ using React + Express + NLP**
#   A T S - C h e c k e r  
 