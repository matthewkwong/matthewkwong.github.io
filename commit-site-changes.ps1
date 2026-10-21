# Commit the portfolio changes as three stacked, reviewable PRs.
# Run from the site folder in PowerShell:  .\commit-site-changes.ps1
# It only creates local branches and commits. Nothing is pushed, and your files
# on disk are not changed: you finish on the last branch, which has everything.
#
#   PR A  design-system-and-pages   tokens + design system, restyled nav/footer, home/about/motion/music pages, media
#   PR B  product-page-grid         product.html cards: 2/3 column grid, hover tags      (base: A)
#   PR C  case-study-layout         shared side nav + details row, every case study     (base: B)
#
# Each branch is created from the one before it, so merge them in order A, B, C.

$ErrorActionPreference = 'Stop'

$base = git rev-parse --abbrev-ref HEAD
if ($base -ne 'developer') { throw "Expected to start on 'developer', but you are on '$base'." }
if (git diff --cached --name-only) { throw 'You have staged changes already. Commit or unstage them first.' }

function Save-Commit($files, $title, $body) {
    git add -- $files
    git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) { Write-Host "Nothing to commit for: $title"; return }
    git commit -m $title -m $body
    if ($LASTEXITCODE -ne 0) { throw "Commit failed: $title" }
}

# ---------------- PR A: design system and pages ----------------
git switch -c design-system-and-pages

Save-Commit @('tokens.css','design-system.css','segmented.js','journey-panels.js','video-loader.js','script.js','nav.css','footer.css','styles.css') `
  'Add design tokens and shared design system' `
  "Add tokens.css and design-system.css (type, colour, spacing, tags, buttons, segmented control) and restyle the navbar, footer and base styles to use them. The mobile menu has no active state and uses the desktop underline hover. script.js no longer errors on pages without jQuery. video-loader.js lazy-loads recordings."

Save-Commit @('index.html','about.html','about.css','motion.html','motion.css','music.html','music.css','spotify.html','spotify.css','aidin.html','aidin.css','toybox.html') `
  'Apply the design system to home, about, motion and music pages' `
  "Load tokens.css and design-system.css on each page, drop the Poppins font link, and add video-loader.js. Home: 'Open to new opportunities' is an h2; on mobile the Build App video comes first."

if (Test-Path img) {
    Save-Commit @('img') `
      'Add media for the redesigned pages' `
      'New and updated images and videos referenced by the pages above.'
}

# ---------------- PR B: product page ----------------
git switch -c product-page-grid  # from design-system-and-pages

Save-Commit @('product.html','product.css') `
  'Product page: two-column grid and hover tags' `
  "The work grid is 2 columns (3 above 1920px, 1 on mobile). Card tags sit over the top-right of the image and fade in on hover or keyboard focus; on touch screens they stay below the description. The page h2 uses the body text colour."

# ---------------- PR C: case studies ----------------
git switch -c case-study-layout

Save-Commit @('case-study.css','case-study-sidebar.js','45fremont.css','covid.css','linkedin.css','playtest.css','salesforce.css','toybox.css','toybox-cad-v2.css') `
  'Shared case study layout: side nav, eyebrows and details row' `
  "Side nav with a Back link (hidden with the nav under 1024px), semi-bold active and hover states, an active dot, an eased hover, and scroll tracking that follows the section being read. Eyebrows use each case study's accent colour (45 Fremont is navy, Salesforce blue is #00a1e0). The project details list has no boxes and spreads evenly; it shrinks and wraps instead of overflowing, and toybox pages show four per row with the fifth below."

Save-Commit @('covid.html','45fremont-ibm.html','45fremont.html','linkedin-circles.html','playtest.html','salesforce.html','toybox-search.html','toybox-cad.html','toybox-cad-v2.html') `
  'Move every case study onto the shared layout' `
  "All case studies use the same sidebar markup (Back to product.html plus section links) and the f4 banner background. Salesforce and PlayTest headings use h4 eyebrows and the same text styles as the others. The Toybox search chart fills its section."

Write-Host ''
Write-Host 'Done. You are on case-study-layout, which has all of your changes.'
Write-Host "Branches (in order): design-system-and-pages -> product-page-grid -> case-study-layout, based on '$base'."
Write-Host 'Next, for each branch:  git push -u origin <branch>   then open a PR into the branch before it (the first into developer).'
