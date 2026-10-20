# SkFormula

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkFormula.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkFormula.vue`

KaTeX renderer (`katex.renderToString`, `throwOnError: false`, `trust: false`; `block` selects display mode). Ported as-is, including `katex/dist/katex.min.css`. Invalid TeX renders as KaTeX's error text rather than throwing.

## Not wired
Upstream MkMfm renders `mathInline`/`mathBlock` as `<code>`. Wiring SkFormula into MkMfm is deferred (stock behavior kept).
