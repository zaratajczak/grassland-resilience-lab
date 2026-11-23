# Launch resil-lab.com

## 1. Choose repository visibility

The repository is currently private. GitHub Free supports Pages from public repositories; GitHub Pro supports Pages from private repositories too. To keep this repository private, use a plan that supports private-repository Pages. For the free option, make this website repository public in Settings > General > Danger Zone > Change repository visibility. This exposes the repository and its history, so review them first. Do not upload the separate private PVC02 archive.

## 2. Enable Pages before merging the launch pull request

Open https://github.com/zaratajczak/grassland-resilience-lab/settings/pages . Under Build and deployment, choose **GitHub Actions** as Source. No template needs to be added: `.github/workflows/publish.yml` is included already. If GitHub says Pages is unavailable for this private repository, complete step 1 first.

Set **Custom domain** to `resil-lab.com` and Save when that field is available. If it appears only after the first deployment, return to it after step 3, before changing DNS. Domain verification at the account level is already complete; keep the existing verification TXT record.

## 3. Approve the upload

Open the launch pull request and review its summary and file changes. If the build check is available, wait for it to pass. Click **Merge pull request**, then **Confirm merge**. This is the approval that puts the website source on `main` and starts publication.

Open the repository's Actions tab and wait for **Build and publish website** to finish. If an earlier run failed because Pages was not configured, configure it, then open the workflow and choose **Run workflow** on `main`.

## 4. Point Cloudflare at GitHub Pages

After setting the custom domain in GitHub Pages, open Cloudflare > resil-lab.com > DNS > Records. Use these records, TTL Auto, with Proxy status **DNS only** (gray cloud):

| Type | Name | Content |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | zaratajczak.github.io |

Replace only conflicting website records for `@` or `www`; leave the GitHub verification TXT record and unrelated email/DNS records intact. Do not enter `https://` or a repository path in the CNAME target. No wildcard record is needed.

## 5. Enable HTTPS and check the advertisement

Return to GitHub Settings > Pages. Wait for the DNS check and certificate provisioning, then select **Enforce HTTPS**. DNS and certificate changes may take up to 24 hours.

Check:

- https://resil-lab.com/
- https://resil-lab.com/opportunities.html
- https://resil-lab.com/data.html
- CV download, research slideshows, and navigation on a phone.
- On Data: pan/zoom, toggles, transparency slider, watershed hover/tap, and Reset view.

Share the Opportunities URL after it loads correctly over HTTPS. Do not share the ZIP or preview file as the public advertisement.

## Backup / manual upload

The launch ZIP contains a `grassland-resilience-lab` folder. Its contents belong at the repository root, so `_quarto.yml` is at the top level, not inside a second nested folder. The ZIP includes `.github/workflows/publish.yml` and `.gitignore`; macOS hides dotfiles by default (Command+Shift+period shows them).

Prefer merging the prepared pull request rather than uploading the ZIP. If you need a manual recovery, use GitHub Desktop to clone the repository, create a new branch, copy the folder contents while preserving existing files, commit, push, and open a pull request. Do not commit a ZIP as a substitute for its contents. Follow `AGENTS.md`.

## Sources

- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- https://quarto.org/docs/publishing/github-pages.html
