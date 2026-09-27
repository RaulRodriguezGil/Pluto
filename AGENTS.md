<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules

- The frontend talks only to the Bujji backend through `src/api/*` (client/agent/conversations/system); UI components never call `fetch` directly, so the backend contract can change in one place.
- Backend URL and mock mode come from `src/api/config.ts` (`VITE_BUJJI_URL`, `VITE_USE_MOCKS`); never hardcode either elsewhere and never put provider keys in the frontend.
- Global UI/agent state lives in the single store `src/lib/pluto/store.ts` (useSyncExternalStore); components read via `usePluto` and mutate via `actions` to avoid duplicated state.
