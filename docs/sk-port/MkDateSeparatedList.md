# MkDateSeparatedList

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/MkDateSeparatedList.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/MkDateSeparatedList.vue`

## Ported as-is
Legacy render-function list (separators, `ad` slot with `_shouldInsertAd_`, direction/reversed/noGap). Wraps `SkTransitionGroup`. No upstream consumer; coexists with upstream's date-separation approach. The ad wrapper only renders when `instance.ads.length > 0`, so it is a no-op without an ad provider.
