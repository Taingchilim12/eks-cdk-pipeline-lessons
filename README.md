# EKS + CDK Pipelines — Lesson Site

A Docusaurus site that teaches other developers how a CDK Pipelines + GitFlow
+ EKS + Karpenter setup works, built from the architecture described in your
`my-pipeline` project's README.

## Run locally

```bash
npm ci
npm start
```

Opens at http://localhost:3000/eks-pipeline-lessons/

## Before you deploy: edit two values

Open `docusaurus.config.js` and set:

```js
const GITHUB_ORG = 'your-github-org';   // your GitHub username or org
const GITHUB_REPO = 'eks-pipeline-lessons'; // your repo name
```

These control the GitHub Pages URL (`https://GITHUB_ORG.github.io/GITHUB_REPO/`)
and the sidebar's "GitHub" links.

## Deploy to GitHub Pages

1. Push this project to a GitHub repo named `GITHUB_REPO` (or update the
   config to match whatever you name it) on the `main` branch.
2. In the repo, go to **Settings → Pages** and set **Source** to
   **"GitHub Actions"**.
3. Push to `main` — `.github/workflows/deploy.yml` builds the site and
   deploys it automatically. Check the **Actions** tab for progress.
4. Your site will be live at `https://GITHUB_ORG.github.io/GITHUB_REPO/`.

No manual `docusaurus deploy` / `gh-pages` branch juggling needed — the
Actions workflow handles build + deploy on every push to `main`.

## Editing content

All lessons are plain Markdown in `docs/`, in the order set by
`sidebars.js`. Diagrams use [Mermaid](https://mermaid.js.org/) — just write a
` ```mermaid ` fenced code block and it renders automatically, both locally
and on GitHub Pages.

To add a new lesson:

1. Create `docs/my-new-lesson.md` with frontmatter:
   ```md
   ---
   id: my-new-lesson
   title: My New Lesson
   slug: /my-new-lesson
   ---
   ```
2. Add `'my-new-lesson'` to the `tutorialSidebar` array in `sidebars.js`
   wherever you want it to appear.

## Adding real source code walkthroughs

The lessons currently describe the architecture from the project README. If
you want line-by-line code walkthroughs (e.g. annotating
`lib/my-pipeline-eks-stack.ts`), drop the relevant `.ts` files in and ask for
a lesson page that embeds and explains them — fenced ` ```typescript ` code
blocks render with syntax highlighting out of the box.

## Project structure

```
eks-pipeline-lessons/
├── docs/                     # All lesson content (Markdown + Mermaid)
├── src/
│   ├── pages/index.js        # Landing page
│   └── css/custom.css        # Theme overrides
├── static/img/                # Logo, favicon, social card — replace as desired
├── docusaurus.config.js      # Site config — EDIT GITHUB_ORG / GITHUB_REPO here
├── sidebars.js               # Lesson ordering
└── .github/workflows/deploy.yml  # Auto-deploy to GitHub Pages on push to main
```
