# Grassland Resilience Lab

Quarto source for https://resil-lab.com. The Opportunities page contains the current graduate student advertisement.

## Launch

Follow [LAUNCH.md](LAUNCH.md). GitHub Pages must use **GitHub Actions** as its publishing source. This repository contains editable source and assets; the workflow renders the website rather than publishing the repository root.

## Make later edits

Edit the corresponding `.qmd` file on a new branch and open a pull request. The advertisement itself is in `includes/bison-ms-opportunity.html`. Teaching is in `outreach.qmd`; the footer is in `includes/footer.html`. Review the change before approving a merge to `main`. Merging triggers a fresh build and publication.

For local work, open `Ratajczak_Lab.Rproj` in RStudio. Install Quarto 1.8.27, then run `quarto preview` or `quarto render`. No R packages or executable R chunks are required. Rendered pages go into `_site/`, which is not tracked in Git. Never edit generated HTML as the source of truth.

## What is included

- Thirteen reviewed pages, with the dark green theme.
- Photos, figures, video, and the downloadable CV.
- The Konza 2020 landcover map, watershed fire intervals, and grazing perimeters.
- Leaflet and its existing license in `map/vendor/`.
- A workflow that builds pull requests and deploys only approved changes merged to `main` (or a manual run on `main`).

The PVC02 analysis module, its scripts, inputs, results, and figures are excluded. It must remain private until Zak explicitly authorizes release. Passing time is not authorization.

Website credit and reuse terms appear in the shared footer. Third-party materials retain their original licenses. Follow `AGENTS.md` for AI-assisted changes.
