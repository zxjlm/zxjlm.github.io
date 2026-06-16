# Harumonia Blog UX Audit

Date: 2026-06-16
Site: https://blog.harumonia.moe/
Browser: Chrome

## Scope

This audit covers the core reader journey:

1. First visit to the home page.
2. Scanning the post list.
3. Opening the newest article.
4. Using article navigation and search/floating controls.

Mobile-specific behavior was not fully verified because this Chrome session used the current desktop viewport.

## Evidence

- `01-home-viewport.png`: home page first viewport.
- `01-home-fullpage.png`: home page full-page capture.
- `02-home-list-viewport.png`: home page after scrolling into the post list.
- `03-article-top-viewport.png`: article reading view with table of contents.
- `04-search-entry-viewport.png`: floating article controls after clicking one visible control.
- `05-search-after-click-viewport.png`: right search icon click attempt.

## Step Health

1. Home first viewport: visually memorable, but weak orientation. The full-screen image and vertical title create atmosphere, yet there is little immediate indication of topics, recent writing, or how to start reading.
2. Post list: content-rich, but scanning is slow. Long excerpts, low contrast over the image background, and uneven article heights make it hard to compare posts quickly.
3. Article page: generally healthy for long-form reading. The table of contents is useful, headings are clear, and the dark reading surface improves contrast compared with the list.
4. Navigation and search controls: functional intent is unclear. Several icon-only links have empty accessible text, the search entry is visually subtle, and floating controls are easy to confuse.

## Strengths

- The site has a strong personal visual identity. The starry background, vertical Chinese title, and dark article style feel distinctive.
- Article pages support long-form reading better than many personal blogs because the table of contents is persistent and detailed.
- Metadata, categories, and tags are present, which gives the site a good base for discovery.
- Recent technical posts are exposed on the home page without requiring an archive click.

## UX Risks

1. First-screen value is too implicit.
   The opening viewport is beautiful but mostly atmospheric. A new visitor cannot quickly tell whether the blog is about engineering, anime/media, personal notes, or mixed writing.

2. The post list asks too much work from scanners.
   The first article excerpt is very long and visually competes with the background. Subsequent cards vary greatly in height, so the reader has to scroll a lot before understanding the archive.

3. Home page contrast is fragile.
   In the scrolled list state, article text appears over the background with a translucent panel. Some text is readable only with effort, especially over bright blue regions.

4. Article layout is wide but not fully balanced.
   On desktop, the left table of contents is helpful but visually heavy. The main reading column starts far to the right, and the page can feel like two competing surfaces rather than one reading experience.

5. Search is not discoverable enough for a 150-post blog.
   The DOM exposes archive, category, and tag counts, but the search affordance is only an icon. Clicking search during this audit did not produce a clear modal or page transition in the captured state.

6. The navigation model relies heavily on icons.
   Several links and social/navigation controls have no visible or accessible text. Sighted users may learn them by hovering; keyboard and screen-reader users get much less context.

## Accessibility Risks

- Icon-only links need accessible names, such as `aria-label="搜索"` or visible text hidden with a screen-reader-only class.
- The home/post-list text contrast should be checked against WCAG contrast targets. The current translucent overlay may fail over bright parts of the image.
- Floating controls should expose focus states and keyboard order. From screenshots alone, focus visibility could not be verified.
- The search control should announce whether it opens an overlay, navigates to Google site search, or expands an input.
- The article table of contents should have a clear label and skip behavior so keyboard users can move directly to the article body.

## Recommendations

1. Add a compact identity strip below or within the hero.
   Keep the cinematic first screen, but add one concise line such as "AI, software engineering, tools, and personal notes" plus small links to Latest, Tags, Archives, and About.

2. Make the home list denser and more scannable.
   Cap excerpts to 2-3 lines, add a "阅读全文" link, and keep date/category/tags in a consistent row. This will let readers compare 6-8 posts without excessive scrolling.

3. Strengthen the list readability layer.
   Use a darker solid or near-solid content surface behind article cards, or reduce background brightness/blur only behind the reading area. Preserve the image as atmosphere, not as the text canvas.

4. Rebalance the article page layout.
   Keep the table of contents, but make it narrower, collapsible, or less visually dominant. Let the main column sit closer to center with a comfortable max width around 720-820px.

5. Promote archive exploration.
   Add a visible "Latest / Categories / Tags / Archive" row near the post list. The site already has counts; expose them as meaningful navigation instead of mostly icon/number links.

6. Fix icon labels and hit targets.
   Every icon-only link or button should have an accessible name, hover title, visible focus ring, and at least a 44px interaction target where possible.

7. Make search explicit.
   Replace the bare icon with an obvious search button or input on desktop. If it uses Google site search, label it as site search and open a predictable result page.

8. Add reading utilities only where they reduce friction.
   Useful additions: reading time, updated date when different from publish date, "copy article link", and previous/next article. Avoid adding too many floating buttons.

## Priority

High:
- Improve home/list contrast.
- Add accessible labels to icon-only controls.
- Make search behavior clear.

Medium:
- Shorten home excerpts.
- Rebalance article TOC and main column.
- Add visible topic/navigation entry points.

Low:
- Add reading time and previous/next article polish.
- Refine hero copy while preserving the current visual identity.
