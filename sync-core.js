// Pure merge logic for cloud backup. No DOM or Firebase here so it can be tested on its own.

const byDateThenId = (a, b) =>
  String(a.date || '').localeCompare(String(b.date || '')) || String(a.id).localeCompare(String(b.id));

export function hasContent(d) {
  return !!(d && ((d.workouts || []).length || (d.weights || []).length || (d.foodLog || []).length || d.profile?.setupComplete));
}

// Combine this device's data with the cloud copy without losing anything either side added.
// challengeXp maps a challenge id to the XP it awards, so total XP can be recalculated exactly.
export function mergeData(local, remote, challengeXp = {}) {
  if (!remote) return local;
  if (!local) return remote;
  // Entries keyed by id; newest edit wins; deletions on either device stick.
  const mergeEntries = (key, tombKey) => {
    const tombs = [...new Set([...(local[tombKey] || []), ...(remote[tombKey] || [])].map(String))];
    const dead = new Set(tombs);
    const byId = new Map();
    for (const e of [...(remote[key] || []), ...(local[key] || [])]) {
      const id = String(e.id);
      if (dead.has(id)) continue;
      const prev = byId.get(id);
      if (!prev || (e.updatedAt || 0) >= (prev.updatedAt || 0)) byId.set(id, e);
    }
    return { list: [...byId.values()].sort(byDateThenId), tombs: tombs.slice(-500) };
  };
  const w = mergeEntries('workouts', 'deletedWorkouts');
  const food = mergeEntries('foodLog', 'deletedFood');
  const plans = mergeEntries('plans', 'deletedPlans');

  const weights = new Map();
  for (const w of [...(remote.weights || []), ...(local.weights || [])]) weights.set(`${w.date}|${w.value}`, w);

  const newer = (local.updatedAt || 0) >= (remote.updatedAt || 0) ? local : remote;
  const older = newer === local ? remote : local;
  const profile = { ...older.profile, ...newer.profile };
  if (!profile.photo) profile.photo = older.profile?.photo || '';
  profile.setupComplete = !!(local.profile?.setupComplete || remote.profile?.setupComplete);

  const claimedChallenges = [...new Set([...(local.claimedChallenges || []), ...(remote.claimedChallenges || [])])];
  const mergedWorkouts = w.list;
  const xp = mergedWorkouts.reduce((s, w) => s + (w.result?.xp || 0), 0) +
    claimedChallenges.reduce((s, id) => s + (challengeXp[id] || 0), 0);

  return {
    ...older,
    ...newer,
    profile,
    workouts: mergedWorkouts,
    weights: [...weights.values()].sort((a, b) => String(a.date).localeCompare(String(b.date))),
    claimedChallenges,
    deletedWorkouts: w.tombs,
    foodLog: food.list,
    deletedFood: food.tombs,
    plans: plans.list,
    deletedPlans: plans.tombs,
    xp,
    lastExport: Math.max(local.lastExport || 0, remote.lastExport || 0) || null,
    updatedAt: Math.max(local.updatedAt || 0, remote.updatedAt || 0)
  };
}

// Decide what to do when a user signs in on this device.
// owner: account id this device's data belongs to (null for guest data).
// Returns { action: 'upload' | 'download' | 'merge' | 'replace-foreign', data }.
export function planSignIn({ uid, owner, dirty, local, remote }, challengeXp = {}) {
  if (owner && owner !== uid) {
    // Another account's data is on this device. Never mix accounts.
    return remote ? { action: 'replace-foreign', data: remote } : { action: 'replace-foreign', data: null };
  }
  if (!remote) return { action: 'upload', data: local };
  if (!owner) {
    return hasContent(local) ? { action: 'merge', data: mergeData(local, remote, challengeXp) } : { action: 'download', data: remote };
  }
  if (dirty) return { action: 'merge', data: mergeData(local, remote, challengeXp) };
  if ((remote.updatedAt || 0) >= (local.updatedAt || 0)) return { action: 'download', data: remote };
  return { action: 'upload', data: local };
}
