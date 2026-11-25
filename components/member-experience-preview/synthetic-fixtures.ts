import type { SyntheticMember } from "./preview-model";

// An invented display fixture with no email, phone, profile ID or live member values.
export const SYNTHETIC_MEMBER: SyntheticMember = Object.freeze({
  fixtureKind: "synthetic",
  displayName: "Jordan Example",
  initials: "JE",
  locationLabel: "Sample City",
});
