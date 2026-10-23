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
  const savedMeals = mergeEntries('savedMeals', 'deletedSavedMeals');

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
    savedMeals: savedMeals.list,
    deletedSavedMeals: savedMeals.tombs,
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
  const { chunkKeys, chunkFps, ...rest } = base;
  const workouts = [...(rest.workouts || [])], foodLog = [...(rest.foodLog || [])];
  for (const [key, list] of Object.entries(chunks)) {
    if (!Array.isArray(list)) continue;
    if (key.startsWith('w-')) workouts.push(...list); else if (key.startsWith('f-')) foodLog.push(...list);
  }
  return { ...rest, workouts: workouts.sort(byDateThenId), foodLog: foodLog.sort(byDateThenId) };
}

// Short fingerprint of a chunk's text (cyrb53). The main document stores one per chunk, so a device whose
// own copy of a chunk has the same fingerprint already has exactly that chunk and needn't download it.
export function fingerprint(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
// This device's own chunks as { key: { list, payload, fp } }.
export function localChunks(data) {
  const out = {};
  for (const [key, list] of Object.entries(splitData(data || {}).chunks)) { const payload = JSON.stringify(list); out[key] = { list, payload, fp: fingerprint(payload) }; }
  return out;
}
// The whole cloud copy from its main document, reading only chunks this device doesn't already have.
// getChunk(key) -> { exists, payload }. Returns { data, raw: { key: payload }, fps: { key: fingerprint } } or null.
export async function readCloud(mainPayload, getChunk, local) {
  let base; try { base = JSON.parse(mainPayload); } catch { return null; }
  const keys = Array.isArray(base.chunkKeys) ? base.chunkKeys : [], fps = base.chunkFps || {}, mine = localChunks(local);
  const chunks = {}, raw = {}, skipped = [];
  await Promise.all(keys.map(async key => {
    if (fps[key] && mine[key]?.fp === fps[key]) { chunks[key] = mine[key].list; raw[key] = mine[key].payload; skipped.push(key); return; }
    const c = await getChunk(key);
    if (!c.exists) return;
    raw[key] = c.payload;
    try { chunks[key] = JSON.parse(c.payload); } catch { chunks[key] = []; }
  }));
  return { data: joinData(base, chunks), raw, fps, keys, skipped };
}

// One backup round inside a transaction: read the cloud copy (main + any chunks this device doesn't
// already have), merge with this device, write back only what changed. Every write also rewrites the main
// document, which the transaction reads, so a change from another device always forces a retry.
// tx: { get(ref) -> {exists, payload}, set(ref, value), delete(ref) }. refs: { main, chunk(key) }.
// chunked=false writes everything into the main document (old format, before the split rules are published).
export async function mergeIntoCloud(tx, refs, local, { challengeXp = {}, chunked = true, now = Date.now() } = {}) {
  const main = await tx.get(refs.main);
  const cloud = main.exists ? await readCloud(main.payload, key => tx.get(refs.chunk(key)), local) : null;
  const next = cloud ? mergeData(local, cloud.data, challengeXp) : { ...local };
  next.updatedAt = Math.max(next.updatedAt || 0, now);
  if (!chunked) {
    tx.set(refs.main, { payload: JSON.stringify(next), updatedAt: next.updatedAt, schema: 1 });
    return { data: next, wrote: ['main'], skipped: cloud?.skipped || [] };
  }
  const { base: nb } = splitData(next), mine = localChunks(next), wrote = [], keys = cloud?.keys || [];
  nb.chunkFps = {};
  for (const [key, c] of Object.entries(mine)) {
    nb.chunkFps[key] = c.fp;
    if (cloud?.raw[key] !== c.payload) { tx.set(refs.chunk(key), { payload: c.payload, updatedAt: next.updatedAt }); wrote.push(key); }
  }
  for (const key of keys) if (!mine[key]) { tx.delete(refs.chunk(key)); wrote.push('-' + key); }
  tx.set(refs.main, { payload: JSON.stringify(nb), updatedAt: next.updatedAt, schema: 2 });
  wrote.push('main');
  return { data: next, wrote, skipped: cloud?.skipped || [] };
}
