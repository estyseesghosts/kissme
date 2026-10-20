# sk-reaction-rules

- Donor: none directly. Donor `utility/check-reaction-permissions.ts` is identical to upstream and lacks likeOnly handling. Written new for the Sk viewer.
- Target: `packages/frontend/src/utility/sk-reaction-rules.ts`, test `packages/frontend/test/unit/sk-reaction-rules.test.ts`

## What it does
Pure decisions: `canReactWith` (likeOnly blocks all emoji reactions; sensitive emoji blocked for nonSensitiveOnly and nonSensitiveOnlyForLocalLikeOnlyForRemote; localOnly host rule; role restriction; remote-custom `:x@host:` guard; unknown emoji blocked), `canGetEmojiInfo`, `reactionEmojiName`, `isReactionMuted`, `partitionMutedReactions` (own reaction never hidden).

## Changes vs donor
Takes plain data (hosts, role ids) instead of Misskey entities. Upstream `check-reaction-permissions.ts` is untouched.

## Prefs read
None.

## Known gaps
No emoji-mute store exists in the donor or in this repo; the mute list is supplied by the caller.
