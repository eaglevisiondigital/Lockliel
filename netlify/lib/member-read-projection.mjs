/** Explicit display projection. No raw provider response is returned or spread into a DTO. */
function record(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function text(value, max) { return typeof value === 'string' && value.length <= max && !/[\u0000-\u001f\u007f]/u.test(value); }
function oneOwnerRow(rows, field, owner) {
  if (!Array.isArray(rows) || rows.length > 1) return { status: 'unavailable' };
  if (!rows.length) return { status: 'missing' };
  const row = rows[0];
  if (!record(row) || row[field] !== owner) return { status: 'unavailable' };
  return { row };
}
export function projectMemberProfile(rows, owner) {
  const result = oneOwnerRow(rows, 'id', owner);
  if (!result.row) return result;
  const r = result.row;
  if (r.first_name !== null && !text(r.first_name, 120) || r.last_name !== null && !text(r.last_name, 120) || !text(r.onboarding_status, 80) || !r.onboarding_status.trim()) return { status: 'unavailable' };
  const firstName = r.first_name === null ? '' : r.first_name.trim();
  const lastName = r.last_name === null ? '' : r.last_name.trim();
  const displayName = `${firstName} ${lastName}`.trim() || 'Member';
  const initials = [firstName, lastName].filter(Boolean).map(part => Array.from(part)[0]).join('').toUpperCase() || 'M';
  return { status: 'ready', value: { displayName, initials, onboardingStatus: r.onboarding_status } };
}
export function projectMemberPreferences(rows, owner) {
  const result = oneOwnerRow(rows, 'profile_id', owner);
  if (!result.row) return result;
  const r = result.row;
  const pairs = [['ministry_email', 'ministryEmail'], ['faith_boost_email', 'faithBoostEmail'], ['book_release_email', 'bookReleaseEmail'], ['partner_email', 'partnerEmail'], ['sms_updates', 'smsUpdates']];
  if (!pairs.every(([key]) => typeof r[key] === 'boolean') || !text(r.updated_at, 64) || !/^\d{4}-\d\d-\d\dT/u.test(r.updated_at) || !Number.isFinite(Date.parse(r.updated_at))) return { status: 'unavailable' };
  const value = Object.fromEntries(pairs.map(([key, name]) => [name, r[key]]));
  value.revision = r.updated_at;
  return { status: 'ready', value };
}
export const PROFILE_SELECT = 'id,first_name,last_name,onboarding_status';
export const PREFERENCES_SELECT = 'profile_id,ministry_email,faith_boost_email,book_release_email,partner_email,sms_updates,updated_at';
