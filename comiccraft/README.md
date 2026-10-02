# ComicCraft (static, no server)

Pick a mood -> matching open-source stories -> pick one -> edit dialogue -> save (browser) -> download PNG/PDF.

## Run
`cd client && npm install && npm run dev` (open http://localhost:5173)
Deploy: `npm run build`, upload `client/dist` to any static host (Netlify, GitHub Pages, Vercel).

## Story source
- Default: `client/public/stories.json`. Add your own stories there.
- Or paste any public JSON link in the app (needs CORS, e.g. raw.githubusercontent.com or cdn.jsdelivr.net).
- Format: `[{ "emotion": "Happy", "title", "summary", "characters": [{"name","role"}], "panels": [{"scene", "dialogue": [{"speaker","text"}]}] }]`
