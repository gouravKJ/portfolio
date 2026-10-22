# Gourav Kumar Jaiswal — Portfolio

Personal portfolio for Gourav Kumar Jaiswal, full-stack developer and AI/ML engineer.

**Resume:** [resume.pdf](resume.pdf)

## Featured Projects

- **DataForge AI** — AI data intelligence platform (Next.js, Groq LLM, Prisma, provenance pipeline)
- **AI Study Assistant** — RAG-based study workspace (LangChain, Groq LLM, FAISS, Streamlit)
- **CollabCo** — Real-time collaborative code editor (MERN, Socket.IO, JWT)

## Tech Stack

- HTML5, CSS3, JavaScript
- Vite (build)
- Netlify (hosting + serverless functions)

## Local Development

```bash
npm install
npm run dev
```

The site runs at http://localhost:3000. API routes are served by Vite middleware during development.

## Deploy

This project is configured for [Netlify](https://www.netlify.com/) via `netlify.toml`:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions:** `netlify/functions`

Connect this repo in Netlify to deploy automatically on every push.

## Environment Variables (optional)

| Variable | Purpose |
|----------|---------|
| `UPSTASH_REDIS_REST_URL` | Live visitor analytics |
| `UPSTASH_REDIS_REST_TOKEN` | Live visitor analytics |
| `GITHUB_TOKEN` | GitHub heatmap and repo stats |
