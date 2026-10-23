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

// ---------- Split backup ----------
// The cloud copy is a small main document (profile, settings, plans...) plus "chunks": workouts grouped
// by year ("w-2026") and food grouped by month ("f-2026-10"). One document has a ~1 MB limit, which a
// year of daily food logging would reach; chunks keep every document far below it.
const yearOf = d => (/^\d{4}/.test(String(d || '')) ? String(d).slice(0, 4) : '0000');
const monthOf = d => (/^\d{4}-\d{2}/.test(String(d || '')) ? String(d).slice(0, 7) : '0000-00');
export function chunkKeyFor(kind, entry) { return kind === 'w' ? `w-${yearOf(entry.date)}` : `f-${monthOf(entry.date)}`; }

// data -> { base, chunks: { key: [entries] } }. base.chunkKeys lists every chunk.
export function splitData(data) {
  const { workouts = [], foodLog = [], ...rest } = data || {};
  const chunks = {};
  for (const w of workouts) (chunks[chunkKeyFor('w', w)] ||= []).push(w);
  for (const f of foodLog) (chunks[chunkKeyFor('f', f)] ||= []).push(f);
  for (const list of Object.values(chunks)) list.sort(byDateThenId); // stable order, so unchanged chunks aren't rewritten
  return { base: { ...rest, chunkKeys: Object.keys(chunks).sort() }, chunks };
}
// { base, chunks } -> data (base without chunkKeys, workouts and food put back together).
export function joinData(base, chunks = {}) {
  if (!base) return null;
  const { chunkKeys, ...rest } = base;
  const workouts = [...(rest.workouts || [])], foodLog = [...(rest.foodLog || [])];
  for (const [key, list] of Object.entries(chunks)) {
    if (!Array.isArray(list)) continue;
    if (key.startsWith('w-')) workouts.push(...list); else if (key.startsWith('f-')) foodLog.push(...list);
  }
  return { ...rest, workouts: workouts.sort(byDateThenId), foodLog: foodLog.sort(byDateThenId) };
}

// One backup round inside a transaction: read the cloud copy (main + chunks), merge with this device,
// write back only what changed. tx: { get(ref) -> {exists, payload}, set(ref, value), delete(ref) }.
// refs: { main, chunk(key) }. chunked=false writes everything into the main document (old format).
export async function mergeIntoCloud(tx, refs, local, { challengeXp = {}, chunked = true, now = Date.now() } = {}) {
  const main = await tx.get(refs.main);
  let base = null; const remoteChunks = {}, remoteRaw = {};
  if (main.exists) {
    try { base = JSON.parse(main.payload); } catch { base = null; }
  }
  const keys = Array.isArray(base?.chunkKeys) ? base.chunkKeys : [];
  for (const key of keys) {
    const c = await tx.get(refs.chunk(key));
    if (!c.exists) continue;
    remoteRaw[key] = c.payload;
    try { remoteChunks[key] = JSON.parse(c.payload); } catch { remoteChunks[key] = []; }
  }
  const remote = base ? joinData(base, remoteChunks) : null;
  const next = remote ? mergeData(local, remote, challengeXp) : { ...local };
  next.updatedAt = Math.max(next.updatedAt || 0, now);
  if (!chunked) {
    tx.set(refs.main, { payload: JSON.stringify(next), updatedAt: next.updatedAt, schema: 1 });
    return { data: next, wrote: ['main'] };
  }
  const { base: nb, chunks } = splitData(next), wrote = [];
  for (const [key, list] of Object.entries(chunks)) {
    const payload = JSON.stringify(list);
    if (remoteRaw[key] !== payload) { tx.set(refs.chunk(key), { payload, updatedAt: next.updatedAt }); wrote.push(key); }
  }
  for (const key of keys) if (!chunks[key]) { tx.delete(refs.chunk(key)); wrote.push('-' + key); }
  tx.set(refs.main, { payload: JSON.stringify(nb), updatedAt: next.updatedAt, schema: 2 });
  wrote.push('main');
  return { data: next, wrote };
}
