// Device sniffing kept in one place.

/** Phone / tablet: a finger is the only pointer (no mouse or trackpad).
 *  ?touch / ?notouch in the URL force it either way (for testing). */
export function isTouchDevice() {
  const q = new URLSearchParams(location.search);
  if (q.has('touch')) return true;
  if (q.has('notouch')) return false;
  return matchMedia('(hover: none) and (pointer: coarse)').matches;
}
