import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, cpSync, existsSync, readdirSync } from 'fs'
import { extname, join, resolve } from 'path'
import trafficHandler from './api/traffic.js'
import githubHandler from './api/github.js'
import repoHandler from './api/repo.js'

const STATIC_EXTENSIONS = new Set(['.mp4', '.webp', '.png', '.jpg', '.jpeg', '.pdf', '.mp3', '.svg'])
const STATIC_DIRS = ['assets']
const SKIP_ENTRIES = new Set(['dist', 'node_modules', 'api', 'netlify', '.git'])

function copyClassicScripts() {
  return {
    name: 'copy-static-shell-assets',
    closeBundle() {
      const dist = resolve('dist')

      copyFileSync(resolve('script.js'), join(dist, 'script.js'))
      copyFileSync(resolve('styles.css'), join(dist, 'styles.css'))

      for (const entry of readdirSync('.')) {
        if (SKIP_ENTRIES.has(entry) || entry.startsWith('.')) continue

        const src = resolve(entry)
        if (STATIC_DIRS.includes(entry) && existsSync(src)) {
          cpSync(src, join(dist, entry), { recursive: true })
          continue
        }

        if (STATIC_EXTENSIONS.has(extname(entry))) {
          copyFileSync(src, join(dist, entry))
        }
      }
    },
  }
}

function localApiRoutes() {
  return {
    name: 'local-api-routes',
    configureServer(server) {
      server.middlewares.use('/api/traffic', (req, res) => {
        trafficHandler(req, res).catch((err) => {
          console.error('Traffic API error:', err)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: 'Traffic API failed' }))
          }
        })
      })

      server.middlewares.use('/api/github', (req, res) => {
        githubHandler(req, res).catch((err) => {
          console.error('GitHub API error:', err)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: 'GitHub API failed' }))
          }
        })
      })

      server.middlewares.use('/api/repo', (req, res) => {
        repoHandler(req, res).catch((err) => {
          console.error('GitHub Repo API error:', err)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: 'GitHub Repo API failed' }))
          }
        })
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), localApiRoutes(), copyClassicScripts()],
  server: {
    port: 3000
  }
})
