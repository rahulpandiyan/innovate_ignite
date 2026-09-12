// Default avatar for every account (admin, coordinator, participant/event
// user) when the user does not provide their own photoUrl.
//
// DiceBear "gaze" style, deterministic per identity so each account keeps a
// stable, distinct avatar. Seed by a stable identifier (email, or email+role
// for same-email role rows) so SUPER_ADMIN/coordinator/judge never collide
// into identical faces.
const GAZE_URL = "https://api.dicebear.com/10.x/gaze/svg";

export function avatarSeedFor(seedKey: string): string {
  return encodeURIComponent(seedKey.trim().toLowerCase());
}

export function avatarUrlFor(seedKey: string): string {
  return `${GAZE_URL}?seed=${avatarSeedFor(seedKey)}`;
}

// Same-seed variant used when two rows share an email but not a role, so an
// admin and a coordinator of the same account still differ visually.
export function avatarUrlForRole(email: string, role: string): string {
  return avatarUrlFor(`${email}|${role}`);
}
