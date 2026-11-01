# Headless member workspace API

November 1, 2026. Wave 3 local component contract. Integration and release remain
coordinator-owned; this file grants no production authority.

Import from `components/member-experience-preview/index.ts`:

```tsx
import { MemberExperienceWorkspace } from "./components/member-experience-preview";
import type { MemberWorkspaceDisplayModel, MemberReviewIdentity, MemberIntent }
  from "./components/member-experience-preview";

const identity: MemberReviewIdentity = {
  status: "synthetic-owner",
  boundaryKey: "review-member-a",
};
const displayModel: MemberWorkspaceDisplayModel = {
  member: {
    displayName: "Jordan Example",
    initials: "JE",
    locationLabel: "Sample City",
    faithBanner: "Take the next faithful step.",
  },
  nextStep: {
    status: "ready",
    title: "A small next step",
    description: "Review this synthetic example without changing any account.",
    actionLabel: "Review the example",
  },
};

<MemberExperienceWorkspace
  identity={identity}
  displayModel={displayModel}
  resetKey="synthetic-record-revision-1"
  idPrefix="review-member"
  onIntent={(intent: MemberIntent) => {
    // Host owns any separately reviewed effect. No display/private field values arrive here.
    // This synthetic review should only record metadata or update local view state.
  }}
/>
```

## Props and boundaries

| Prop | Contract |
| --- | --- |
| `identity` | Required `{status: "synthetic-owner", boundaryKey: string}` or `{status: "unknown"}`. This is an isolated host-review marker, not Auth, AAL, tenant or role authorization. Unknown/malformed identity renders no member data or interactive descendants and does not inspect the supplied model. |
| `displayModel` | Required, privacy-safe display DTO. Member requires a bounded plain-text displayName. Optional initials/location/banner remain private in the local visibility model. No image URL, profile ID, contact, prayer, assessment, finance, role, token or destination field belongs here. |
| `resetKey` | Required bounded string. Change whenever the host changes the reviewed record/model revision or needs to discard local choices. Together with boundaryKey it remounts the local state. Do not reuse one boundary across different owners. Unknown identity unmounts the known view. |
| `idPrefix` | Optional simple identifier. Distinct workspaces must use distinct explicit prefixes; otherwise a React-generated instance prefix avoids collisions. No shell IDs or navigation are created. |
| `onIntent` | Optional callback. Host action buttons are disabled when absent or not a function. No action occurs during render. Callback failure yields an unavailable message, never a saved/sent claim. |

`MemberNextStepDisplay` is a discriminated union:

- `ready`: required `title`, `description` and `actionLabel`; optional `accent` and
  `supportingLabel`, all bounded plain text.
- `loading`, `empty`, `denied` or `error`: status only. Extra reason/grade/data
  fields are discarded rather than displayed. Loading and unavailable do not
  become empty-account or completion claims.

`MemberWorkspaceDisplayModel` contains only `member` and `nextStep`.
`normalizeMemberWorkspaceDisplay(unknown)` explicitly reconstructs allowlisted
fields, returns null for malformed inputs, and escapes no HTML itself because
React performs text rendering. It never interprets supplied text as HTML.
Unknown keys, photo/destination URL fields and sensitive extras are not forwarded.
It cannot determine whether prose placed inside an allowed display field contains
sensitive information. The host must supply an already reviewed, privacy-safe DTO.
Do not pass a raw profile or private-domain record and rely on UI filtering.

Current Banner values remain the three synthetic approved preview presets in
`preview-model.ts`; arbitrary verse, assessment or prayer content is not accepted.
No full Scripture/provider/content integration is introduced.

## Callback envelope

`MemberIntent` is exactly `{kind, boundaryKey}`. Allowed kinds:

- `member:continue`
- `member:review-profile`
- `member:retry`

The boundary key is an opaque non-sensitive synthetic marker, never a user ID,
email, token or credential. No member/card text, photo, visibility choice, prayer,
note, assessment, financial value or arbitrary object is included. Runtime checks
reject object-to-string coercion, invented kinds and unknown identity. A frozen
fresh payload is emitted only for a valid action. Callback failure returns false.

Optional field controls operate only in component memory and do not emit write or
sharing payloads. Photo state changes reset photo visibility to private. Public
visitors receive no card; non-owner removed/unavailable/private photo states remain
indistinguishable. No uploaded image exists.

## Public exports

- `MemberExperienceWorkspace`, `MemberExperienceWorkspaceProps`.
- `MemberSelect`, an alias of the reusable native labelled select.
- `MemberReviewIdentity`, `MemberWorkspaceDisplayModel`, `MemberNextStepDisplay`.
- `MemberIntent`, `MemberIntentKind`, `MemberIntentHandler`.
- `normalizeMemberWorkspaceDisplay`, `readMemberReviewIdentity`, `emitMemberIntent`.

The workspace creates no application header, main, navigation or footer. It reuses
only owned module CSS and presentation components. Its host supplies the shell and
explicit local-review flag. Existing standalone `MemberExperiencePreview` now uses
this same workspace with synthetic inputs and retains its own shell/signup demos.
No live route, Auth infrastructure or global design token is copied.

## Integration acceptance still required

Import the exact local committed snapshot into the coordinator's separate local
integration tree. Run full Next build/route validation there, then test unknown
identity, malformed model, unavailable/missing callback, metadata-only intents,
record/reset boundary changes, private defaults, public denial, keyboard/focus,
reflow and review flag OFF. The component's synthetic marker is not a substitute
for server-side authorization when any future live integration is proposed.
