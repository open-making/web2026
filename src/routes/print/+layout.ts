// Print/collateral routes are prerendered like the rest of the site so the
// Playwright exporter can hit static HTML. No client interactivity is needed on
// a poster, but CSR stays on so fonts/filters hydrate identically to the site.
export const prerender = true;
