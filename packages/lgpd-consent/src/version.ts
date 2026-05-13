/**
 * Returns true if the stored policy version is older than the current one.
 * When stale, the manager surfaces `status: 'expired'` and re-prompts.
 */
export function isPolicyStale(storedVersion: number | null, currentVersion: number): boolean {
  if (storedVersion === null) return true;
  return storedVersion < currentVersion;
}
