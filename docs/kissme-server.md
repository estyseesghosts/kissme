# kissme-server — Sharkey port workstream status

Porting selected Sharkey endpoints to upstream Misskey. One row per endpoint.
Backend-only: no frontend / locales / docs-frontend changes.

| Endpoint | Upstream status | kissme-server status | Notes |
|---|---|---|---|
| `notes/like` | missing | ported (this branch) | Donor: Sharkey `notes/like`. `kind: write:reactions`, limit 2/sec. `override ?? ❤️` (donor `Meta.defaultLike` DB default `❤️` = U+2764 U+FE0F; upstream `MiMeta` has no such column, so the default is a constant — see `DEFAULT_LIKE` in the endpoint file). Already-reacted (`51c42bb4…`) toggles off via `ReactionService.delete` instead of erroring. `ReactionService` normalizes `❤️` → `❤` (U+2764) when stored. Error UUIDs are new (donor UUIDs collide with existing `notes/reactions/create` errors). |

## Frontend / backend contract (`notes/like`)

- Request: `{ noteId: string, override?: string | null }` (`override` = custom reaction; default like when omitted/null).
- Auth: credential required, `write:reactions` permission. `prohibitMoved: true`.
- Response: `204` empty on success (like created, or existing like removed on toggle).
- Errors: `NO_SUCH_NOTE`, `YOU_HAVE_BEEN_BLOCKED`, `CANNOT_REACT_TO_RENOTE` (all 400 client errors).
- Rate limit: max 2 req/sec.

Example:

```sh
curl -X POST https://your-instance.example/api/notes/like \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"noteId":"<NOTE_ID>"}'
```

(Note: verified shape only via E2E tests against a local dev server, not via a public instance.)
