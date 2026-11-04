// No recovery is prepared in advance. A defect-specific fixed-file change requires
// independent review and its exact SHA256 before one deliberate same-fixture invocation.
export async function runRecovery() { throw Error('No reviewed affected-test recovery is prepared'); }
