# Sanya Arora — Portfolio

Personal portfolio website for Sanya Arora, Software Engineer.

**Resume:** [resume.pdf](resume.pdf)

## Tech Stack

- HTML5, CSS3, JavaScript
- Vite (build)
- Netlify (hosting + serverless functions)

## Local Development

```bash
npm install
npm run dev
```

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
