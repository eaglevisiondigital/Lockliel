import { unavailableMemberRead } from '../lib/member-read-server.mjs';
/** Deliberately CLOSED candidate. No env value or browser flag activates this route.
 * Hosted composition requires separately approved exact source/deploy binding and sessions.
 */
export default async function memberRead() { return unavailableMemberRead(); }
export const config = { path: '/api/lockliel/member-read' };
