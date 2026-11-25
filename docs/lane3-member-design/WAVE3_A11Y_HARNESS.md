# Local accessibility review tools and limits

November 1, 2026. These tools were prepared only in the temporary local harness at
`/private/tmp/lockliel-w3-wave3-20261101/`, outside product code. They are not a
shipped toolbar, global stylesheet or device/browser override.

The actual React component bundle is served on 127.0.0.1:4318 with an OS policy
allowing only localhost networking. CSP blocks API connections, forms, frames and
external assets. No credentials or real data are loaded. `/member-experience`
shows the headless component under one harness shell; `/standalone` exercises the
preserved synthetic standalone entry.

The temporary harness contains explicit controls for synthetic owner A/B/unknown,
external next-step states, incomplete display model, absent callback and resetKey.
These exercise component boundaries using invented display information only.

The following review helpers are local simulations, not conformance certificates:

| Helper | Actual behavior | Does not establish |
| --- | --- | --- |
| Font scale 150%/200% | Captures current computed font sizes in the local harness DOM and applies an inline multiplier to that snapshot. It changes neither browser zoom nor global settings. Refresh restores source styles; dynamic new elements require a fresh application. | Actual 200% browser zoom, native control zoom, DPI/font rendering or a complete resize-text test. |
| Text spacing | Adds a harness-only style for line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em and paragraph bottom spacing 2em. | Every assistive-technology/user-style combination or universal reflow. |
| Reduced-motion CSS simulation | Forces local animation/transition/scroll behavior to none/auto. | The actual operating-system preference or a runtime prefers-reduced-motion media-query observation. |

The coordinator owns browser operation. Do not use a developer-tool override,
internal browser policy workaround or this CSS simulation to claim actual zoom or
OS preference testing. If an authorized supported normal-browser control is used,
record its real result separately from these simulations.

Full screen-reader acceptance remains unverified. Source/SSR labelled controls,
unique IDs, status/busy semantics, selected contrast math and scoped browser checks
are useful evidence with separate scopes. The existing palette remains unchanged;
Wave2 contrast evidence remains historical and is not rewritten for Wave3.

The coordinator chose to perform browser QA on the actual local Next integration
route. Therefore the lane does not claim that these temporary simulation controls
were browser-tested. The harness/listener/dependency symlink are retired after the
local component handoff. Product components contain none of these review tools.
