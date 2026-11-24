# Resident home brief

This draft defines what an invited resident can describe to the Tower builder. It is an authoring contract under review. The invitation endpoint continues to accept the existing v0.1 HomeBundle application. The brief does not change that endpoint, the residency database or the public directory.

## The parts of a home

| Part | The resident supplies | The Tower supplies |
| --- | --- | --- |
| Entry | Home name and a welcome in their own words. | The assigned unit address, verified resident identity and private access. |
| Rooms | Any names, purposes, order and starter text. An empty room list is valid. | A readable, responsive way to enter and navigate the rooms. |
| Appearance | An optional style description, any hex colors, an optional layout preference and an optional description of a cover image. | Rendering, accessible contrast, and defaults for choices the resident leaves open. |
| Door card | An optional decision after move-in to list the home name, resident display name and address. | A separate, revocable directory entry. Room content and appearance instructions remain private. |

A reading room, workshop or journal is one resident's choice. No specific room, preset theme or visual genre is required. Residents can write their brief in their preferred language.

## Prepare a submission

1. Complete the [draft JSON schema](home-brief-v0.1.schema.json). `displayName`, `welcome` and `rooms` are required. The array order is the room order. A room requires a title and body. The purpose is optional.
2. Use `appearance` only for choices you want the builder to follow. `style` and `layout` are free text. `palette` roles accept any six-digit RGB hex color. `coverImageBrief` is a description the builder can use to propose an image.
3. Use text for content and design directions. The builder treats instructions as design input and renders resident content as text. Uploads, executable markup, remote assets and custom CSS are outside this draft.
4. Submit the brief when the versioned intake is available. The builder will validate it and produce a private preview using the supplied choices and defaults. If accessibility or supported layouts require visible adjustments, the preview must show them before approval.
5. Review and approve the exact preview before the builder uses it for setup. The Tower assigns the unit and hands it to the verified resident. After handoff, changes use resident authority and revision checks. Directory listing is a separate explicit choice.

The builder must preserve the authored brief alongside the generated representation so a later revision can reuse the resident's choices. A portable export for this version must round-trip the brief. Existing v0.1 HomeBundles remain readable and exportable with their original content and optional theme. The storage model, intake API and private renderer need implementation and acceptance before real submissions.

## View two fictional homes locally

Run `node scripts/render-home-previews.mjs` from the repository root. Open `artifacts/home-previews/lantern-library.html` or `artifacts/home-previews/signal-deck.html`. The files are self-contained and render offline.

The same renderer validates [The Lantern Library](examples/home-briefs/lantern-library.json) and [The Signal Deck](examples/home-briefs/signal-deck.json). It applies the source palette, preserves room order and embeds the original brief as a download. The two sample compositions, type styles and cover images are builder choices based on the free-text directions. These fictional examples run locally. The authenticated intake, preview approval and persistence workflow is still planned.
