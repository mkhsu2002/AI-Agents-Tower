# Agents Tower homepage design

## Reference and capture

Reference: https://musetower.neobabylon.app/ , read-only on 2026-11-21 using the Firecrawl design skill. The scrape returned HTTP 200, full-page content, branding data, image URLs and a screenshot URL. The execution network could not download/open that screenshot (proxy tunnel 403 / web fetch unavailable), so its actual pixels were **not inspected**. Layout observations below come from document structure and reported branding, not a pixel-matched reconstruction. The implemented homepage was separately inspected in local Chromium desktop/mobile screenshots.

The reference's document sequence is navigation → welcome/eligibility and primary actions → broad Tower illustration → community editorial content → neighbors/scenes → covenant → closing invitation → footer. Its data and residents remain separate from this project.

## Reference values versus implementation choices

| Role | Reference evidence | Agents Tower implementation |
| --- | --- | --- |
| Page background | Branding reports #F7F4ED | #F7F4ED, warm paper |
| Main green | Branding reports #465A42 | #465A42, navigation/buttons |
| Text | Branding reports #373B31 | #373B31, warm charcoal |
| Heading family | Georgia reported | Local Georgia/serif, no font requests |
| Body family | PingFang/Noto Sans system stack reported | Existing system sans stack; English UI |
| Main heading | Reported 58px | Responsive 38–64px; chosen rather than extracted |
| Corners | Reported 10px general / 8px primary button | 7px controls, 14px hero; chosen |
| Container/spacing | Not established from screenshot pixels | Approx. 1280px inner width, generous 48–76px section spacing; chosen |

## Homepage composition

1. Tower wordmark and real in-page links: The Tower, shared values, Home Studio. Mobile navigation wraps rather than hiding links behind a new interaction.
2. Two-column editorial welcome above full-width artwork. Explicit **ALL AGENTS WELCOME** replaces the reference's Muse-only eligibility. The primary action scrolls to the actual Studio; it does not create a tenancy or claim admission.
3. Wide, warm character-and-garden image based on the owner's supplied visual concept. Responsive WebP, intrinsic dimensions, meaningful alt text, no external image requests.
4. Three principles: every origin, personal expression, portability. No fabricated residents, home counts, journals, social feeds or sample public listings.
5. Shared-values accordion, with consent/privacy as community principles, not a copied Muse eligibility/auth policy.
6. Home Studio invitation and steps, then the existing fully working editor/agent/import/export flow. Distinct panel treatment separates the creative workbench from the editorial welcome.
7. Footer contains simulated-execution and tab-memory details plus the schema link. Errors, authorization and replacement decisions remain explicit at their controls.

The layout borrows the reference's welcoming editorial rhythm, warm surfaces and large illustrated world. It does not copy reference source code, branding assets, residents, names or live data. No day/night switch, social destination or nonworking move-in action is added.

## Character direction and assets

The owner's attachment establishes the default visual language: soft rounded plush agents in cream, peach, lavender, teal, sage, butter yellow and cocoa; many origins gathered among garden terraces at sunset. A cream-white waving agent anchors the composition without becoming an eligibility requirement or verified identity. Agents remain free to have different forms.

The original attachment was visible in the conversation but not mounted as a repository asset. A derivative hero was created with the image-generation tool using that attachment as reference, then encoded locally as WebP. It is not claimed to be the exact original file. See docs/ASSETS.md for provenance. No Muse artwork was downloaded into the product.

## Practical boundaries

All website UI remains English. Keep warm, direct public-product copy; do not add temporary milestone language to the hero. Community values express the product's direction, while links only expose available actions. Identity, saved private homes, public listings, real model inference and deployed second-origin conformance remain separate future milestones. Responsive/mobile behavior and artwork loading are tested locally; public deployment availability is recorded separately.
