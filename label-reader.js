// NextForm label reader: turns photos of packaging into food data, on the phone (no server, photos stay put).
//  - Nutrition label photo -> calories, protein, carbs, fat, fibre, sugar, salt per 100 g, plus serving size.
//  - Front-of-pack photo  -> the biggest words (brand, product) to search with.
// Text recognition is Tesseract (open source), downloaded once on first use. The parsing below is written
// for the messy text phone photos give: glare, misread units ("9.99" for "9.9g"), lost labels and decimals.
// It reads both columns (per 100 g and per serving) and keeps only numbers that agree with each other.
(() => {
  const ORDER = ['fat', 'satfat', 'carbs', 'sugar', 'fibre', 'protein', 'salt'];
  const KEYS = [ // checked in this order; first match wins
    ['satfat', /satur|saturat|\bsat\b|which\s*s[a-z]{0,3}t|aturai|atura/i],
    ['sugar', /sugar|ugars|sugur|sucres?\b/i],
    ['fibre', /fib(re|er)|fbre|fibr|f[il1]bre/i],
    ['protein', /prot|otein|rotei|\btein|stein/i],
    ['salt', /\bsa[l1i]t|^\W*sal\b|sodium/i],
    ['carbs', /carb|hydr|ohyd|bohy/i],
    ['fat', /\bfat\b|^\W*fat|fats\b|\bf[a@]t\b/i]
  ];
  const isEnd = l => /reference|intake|this pack contains|ingredient|allerg|average adult|portions?\s+per|servings?\s+per/i.test(l);
  const num = s => parseFloat(String(s).replace(',', '.'));
  const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;

  function clean(text) {
    return String(text || '')
      .replace(/(\d),(\d)/g, '$1.$2')
      .replace(/[“”"’'`]/g, '')
      .replace(/(\d)\s*[oO](?=\s*g)/g, '$10'); // "1Og" -> "10g"
  }
  // Numbers in a row, in reading order, with likely misreads offered as alternatives.
  function tokens(line) {
    // A number followed by "(14%*)" is in the per-serving column: only that column shows reference intakes.
    const l = line.replace(/(\d+(?:\.\d+)?\s*(?:mg|g|9|e|¢|q)?)\s*\(\s*<?\s*\d+\s*%[^)]*\)?/gi, '$1§ ')
      .replace(/\([^)]*%[^)]*\)?/g, ' ').replace(/\d+\s*%\*?/g, ' ');
    const out = [];
    const re = /(<\s*)?(\d{1,4}(?:\.\d{1,3})?)\s*(mg|g|9|e|¢|q|kcal|kj)?(§)?/gi;
    let m;
    while ((m = re.exec(l))) {
      const raw = m[2], unit = (m[3] || '').toLowerCase(), v = num(raw);
      if (unit === 'kcal' || unit === 'kj') continue;
      const alts = new Set([v]);
      if (unit === '9') alts.add(v); // "17 9"
      if (/\.\d9$/.test(raw) && !unit) alts.add(num(raw.slice(0, -1))); // "9.99" = "9.9g"
      if (/\.\d[2]$/.test(raw) && !unit) alts.add(num(raw.slice(0, -1))); // "0.82" = "0.8g"
      if (/^\d9$/.test(raw) && !unit) alts.add(num(raw[0])); // "39" = "3g"
      if (/^\d{2,3}$/.test(raw)) alts.add(num(raw.slice(0, -1) + '.' + raw.slice(-1))); // lost decimal: "64g" = "6.4g"
      if (unit === 'mg') { alts.clear(); alts.add(v / 1000); }
      out.push({ v, alts: [...alts].filter(x => x >= 0 && x <= 100), sure: unit === 'g' || unit === 'mg', lt: !!m[1], ri: !!m[4] });
    }
    return out;
  }
  function servingCandidates(lines) {
    const set = new Set();
    for (const l of lines) {
      const hdr = /per|serving|portion|pack|bag|bar|slice/i.test(l);
      if (!hdr) continue;
      const re = /(\d{1,3}(?:\.\d{1,2})?)\s*(g|9|ml)/gi; let m;
      while ((m = re.exec(l))) {
        const raw = m[1], v = num(raw);
        if (v === 100 || v < 5 || v > 600) continue;
        set.add(v);
        if (m[2] === '9' || /\.\d9$/.test(raw)) { const w = num(raw.replace(/9$/, '')); if (w >= 5) set.add(w); }
      }
    }
    return [...set];
  }
  function kcalCandidates(lines) {
    const kcal = [], kj = [];
    for (const l of lines) {
      if (/reference|intake|adult|8400|2000\s*kcal/i.test(l)) continue;
      let m; const rc = /(\d{2,4}(?:\.\d)?)\s*[a-z]?\s*k\s*[cсe]?\s*[a@]?\s*[l1i]\b/gi;
      while ((m = rc.exec(l))) kcal.push(num(m[1]));
      const rj = /(\d{2,4})\s*k\s*[jJ5i\\3]/g;
      while ((m = rj.exec(l))) kj.push(num(m[1]));
    }
    return { kcal: kcal.filter(v => v > 0 && v <= 950), kj: kj.filter(v => v > 0 && v <= 4000) };
  }
  // Which column is per 100 g? Usually the first. Look at the header line.
  function hundredFirst(lines) {
    for (const l of lines) {
      const i100 = l.search(/100\s*(g|9|ml|m1)/i);
      if (i100 < 0) continue;
      const other = l.replace(/100\s*(g|9|ml|m1)/i, '').search(/\d{1,3}(?:\.\d+)?\s*(g|9|ml)|serving|portion|pack|bar|slice/i);
      return other < 0 || other > i100 - 1 || l.indexOf('100') < other;
    }
    return true;
  }

  // texts: one or more OCR passes of the same label. Returns per-100 g values and which ones look certain.
  function parseLabel(texts) {
    texts = (Array.isArray(texts) ? texts : [texts]).map(clean);
    const rows = {}; ORDER.forEach(k => (rows[k] = { a: [], b: [], lines: [] }));
    let servings = [], kc = { kcal: [], kj: [] }, firstIs100 = true, name = '';
    for (const text of texts) {
      const lines = text.split(/\n/).map(s => s.trim()).filter(Boolean);
      firstIs100 = hundredFirst(lines);
      servings = servings.concat(servingCandidates(lines));
      const k = kcalCandidates(lines); kc.kcal.push(...k.kcal); kc.kj.push(...k.kj);
      if (!name) { const i = lines.findIndex(l => /^ingredients?\b/i.test(l)); if (i > 0 && /^[A-Za-z][A-Za-z '&-]{5,60}$/.test(lines[i - 1])) name = lines[i - 1]; }
      // rows between the energy line and the footnotes
      const start = Math.max(0, lines.findIndex(l => /energ|kcal|k\s*j/i.test(l)));
      const found = [];
      for (let i = start; i < lines.length; i++) {
        const l = lines[i]; if (isEnd(l)) break;
        if (/energ|kcal|\bk\s*j\b/i.test(l) && !/fat|carb|prot|salt|sugar|fib/i.test(l)) continue;
        const t = tokens(l); if (!t.length) continue;
        const key = (KEYS.find(([, re]) => re.test(l)) || [null])[0];
        found.push({ key, t, sodium: /sodium/i.test(l) });
      }
      // Rows whose label was unreadable: place them by the standard order between their neighbours.
      found.forEach((f, i) => {
        if (f.key) return;
        const prev = found.slice(0, i).reverse().find(x => x.key), next = found.slice(i + 1).find(x => x.key);
        const lo = prev ? ORDER.indexOf(prev.key) : -1, hi = next ? ORDER.indexOf(next.key) : ORDER.length;
        const used = new Set(found.map(x => x.key));
        const gap = ORDER.slice(lo + 1, hi).filter(k => !used.has(k));
        const between = found.slice(found.indexOf(prev) + 1, next ? found.indexOf(next) : undefined).filter(x => !x.key).length;
        if (gap.length === 1 || (gap.length && gap.length === between)) f.key = gap[0];
        else if (between === 1 && gap.includes('protein')) f.key = 'protein'; // protein is always on the label; fibre often isn't
      });
      for (const f of found) {
        if (!f.key) continue;
        let [a, b] = firstIs100 ? [f.t[0], f.t[1]] : [f.t[1], f.t[0]];
        if (f.t.length === 1 && f.t[0].ri) [a, b] = [null, f.t[0]]; // only the per-serving number survived
        const conv = x => x && (f.sodium ? { ...x, alts: x.alts.map(v => v * 2.5) } : x);
        if (a) rows[f.key].a.push(conv(a)); if (b) rows[f.key].b.push(conv(b));
      }
    }
    servings = [...new Set(servings)];
    // Pick the serving size that makes the most rows agree across the two columns.
    const agree = (a, b, r) => Math.abs(a * r - b) <= Math.max(0.15, b * 0.12);
    let best = { s: null, n: 0 };
    for (const s of servings) {
      const r = s / 100; let n = 0;
      for (const k of ORDER) if (rows[k].a.some(x => rows[k].b.some(y => x.alts.some(a => y.alts.some(b => agree(a, b, r)))))) n++;
      if (n > best.n || (n === best.n && best.s && s < best.s)) best = { s, n };
    }
    const servingG = best.s ?? (servings.length === 1 ? servings[0] : null), r = servingG ? servingG / 100 : null;
    const per = {}, sure = {};
    for (const k of ORDER) {
      const { a, b } = rows[k];
      let val = null, ok = false;
      if (r) { // both columns agree -> confident; prefer the reading that needs no correction
        outer: for (const x of a) for (const av of x.alts) for (const y of b) for (const bv of y.alts) if (agree(av, bv, r)) { val = av; ok = true; break outer; }
      }
      if (val == null && a.length) { const x = a.find(t => t.sure) || a[0]; val = x.v <= 100 ? x.v : null; }
      if (val == null && b.length && r) { const y = b.find(t => t.sure) || b[0]; val = r1(y.v / r); }
      if (val != null) { per[k] = k === 'salt' ? r2(val) : r1(val); sure[k] = ok || (!r && !!a.find(t => t.sure)); }
      // Unsure: remember every reading (as per 100 g, or as per serving scaled up) for the energy check below.
      if (!ok) rows[k].opts = [...new Set([...a.flatMap(x => x.alts), ...(r ? b.flatMap(y => y.alts.map(v => r1(v / r))) : []), ...(r ? a.flatMap(x => x.alts.map(v => r1(v / r))) : [])])].filter(v => v <= 100);
    }
    // Energy: candidates from the kcal and kJ readings (per 100 g, or per serving scaled up), then pick the
    // combination of energy and any unsure fat/carbs/protein readings that best fits 4/4/9 kcal per gram.
    const ks = [...new Set(kc.kcal)], js = [...new Set(kc.kj)];
    const kcands = new Set(), sureK = new Set();
    for (const v of ks) kcands.add(v);
    for (const v of js) kcands.add(Math.round(v / 4.184));
    if (r) {
      for (const a of ks) for (const b of ks) if (a !== b && Math.abs(a * r - b) <= Math.max(3, b * 0.04)) { sureK.add(a); sureK.add(Math.round(b / r)); kcands.add(Math.round(b / r)); }
      for (const a of js) for (const b of js) if (a !== b && Math.abs(a * r - b) <= Math.max(10, b * 0.04)) { const k = Math.round(a / 4.184); sureK.add(k); kcands.add(k); }
      for (const b of ks) if (b / r <= 950) kcands.add(Math.round(b / r));
      for (const b of js) if (b / r <= 4000) kcands.add(Math.round(b / r / 4.184));
    }
    const MAC = ['fat', 'carbs', 'protein'];
    const choices = MAC.map(k => sure[k] || per[k] == null ? [per[k] ?? null] : [...new Set([per[k], ...(rows[k].opts || [])])]);
    const est = (f, c, p) => 9 * f + 4 * c + 4 * p + 2 * (per.fibre || 0);
    let bestFit = null;
    for (const f of choices[0]) for (const c of choices[1]) for (const p of choices[2]) {
      if (f == null || c == null || p == null) continue;
      const m = est(f, c, p);
      for (const k of kcands.size ? kcands : [Math.round(m)]) {
        const err = Math.abs(k - m) / Math.max(m, 1) + (sureK.has(k) ? 0 : 0.02);
        if (!bestFit || err < bestFit.err) bestFit = { err, f, c, p, k };
      }
    }
    let kcal = null, kcalSure = false;
    if (bestFit && bestFit.err <= 0.12) {
      [per.fat, per.carbs, per.protein] = [bestFit.f, bestFit.c, bestFit.p];
      kcal = bestFit.k; kcalSure = true;
      MAC.forEach((k, i) => { if (!sure[k] && choices[i].length > 1) sure[k] = true; });
    } else if (sureK.size) { kcal = [...sureK][0]; kcalSure = true; }
    else if (ks.length) kcal = Math.max(...ks);
    else if (js.length) kcal = Math.round(Math.max(...js) / 4.184);
    else if (per.fat != null && per.carbs != null && per.protein != null) kcal = Math.round(est(per.fat, per.carbs, per.protein));
    if (kcal != null) { per.kcal = Math.round(kcal); sure.kcal = kcalSure; }
    if (per.satfat != null) delete per.satfat;
    delete sure.satfat;
    const found = ['kcal', 'protein', 'carbs', 'fat'].filter(k => per[k] != null).length;
    return { per, sure, servingG, name: name.replace(/\s+/g, ' ').trim(), ok: per.kcal != null && found >= 3 };
  }

  // Front of pack: the largest text is usually the brand and product name.
  function frontQuery(lines) {
    const STOP = /^(the|and|with|new|now|only|per|serving|pack|bag|grab|share|sharing|great|taste|tasty|deliciously|crunchy|less|more|than|for|our|from|made|real|natural|naturally|no|free|suitable|vegetarians?|vegans?|kcal|energy|of|in|a|an|recipe|best|ever|flavour|flavor|size|value|limited|edition)$/i;
    const ws = [];
    let use = lines.filter(l => l.text && l.h > 0);
    if (use.some(l => (l.conf ?? 100) >= 70)) use = use.filter(l => (l.conf ?? 100) >= 70); // skip garbled readings
    for (const l of use.sort((a, b) => b.h - a.h).slice(0, 4))
      for (const w of l.text.split(/\s+/)) { const c = w.replace(/[^A-Za-z&'-]/g, ''); if (c.length >= 3 && !STOP.test(c) && !ws.some(x => x.toLowerCase() === c.toLowerCase())) ws.push(c); }
    return ws.slice(0, 5).join(' ');
  }

  // ---------- browser side: image clean-up and Tesseract ----------
  const TESS = 'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js';
  let worker = null, loading = null;
  function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('download failed')); document.head.appendChild(s); }); }
  async function getWorker(progress) {
    if (worker) return worker;
    if (!loading) loading = (async () => {
      if (!window.Tesseract) await loadScript(TESS);
      const w = await window.Tesseract.createWorker('eng', 1, { logger: m => { if (m.status === 'recognizing text') progress?.(m.progress); else if (/load|initializ/i.test(m.status || '')) progress?.(-1); } });
      worker = w; return w;
    })().catch(e => { loading = null; throw e; });
    return loading;
  }
  async function fileToCanvas(file, max = 1600) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('not an image')); i.src = url; });
      const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      return c;
    } finally { URL.revokeObjectURL(url); }
  }
  // Greyscale, then divide by a blurred copy: flattens glare and shadows on shiny packets.
  function flatten(src) {
    const w = src.width, h = src.height, c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); x.drawImage(src, 0, 0);
    const small = document.createElement('canvas'); small.width = Math.max(8, Math.round(w / 28)); small.height = Math.max(8, Math.round(h / 28));
    const sx = small.getContext('2d'); sx.imageSmoothingEnabled = true; sx.drawImage(src, 0, 0, small.width, small.height);
    const big = document.createElement('canvas'); big.width = w; big.height = h;
    const bx = big.getContext('2d'); bx.imageSmoothingEnabled = true; bx.imageSmoothingQuality = 'high'; bx.drawImage(small, 0, 0, w, h);
    const img = x.getImageData(0, 0, w, h), bg = bx.getImageData(0, 0, w, h).data, d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2], b = 0.299 * bg[i] + 0.587 * bg[i + 1] + 0.114 * bg[i + 2] + 1;
      const v = Math.max(0, Math.min(255, (g / b) * 235));
      d[i] = d[i + 1] = d[i + 2] = v;
    }
    x.putImageData(img, 0, 0); return c;
  }
  async function recognize(canvas, psm, progress, withLines = false) {
    const w = await getWorker(progress);
    await w.setParameters({ tessedit_pageseg_mode: String(psm) });
    const { data } = await w.recognize(canvas, {}, { text: true, blocks: withLines });
    const lines = [];
    if (withLines) for (const b of data.blocks || []) for (const p of b.paragraphs || []) for (const l of p.lines || []) lines.push({ text: l.text.trim(), h: (l.bbox?.y1 || 0) - (l.bbox?.y0 || 0), conf: l.confidence ?? 100 });
    return { text: data.text || '', lines };
  }
  async function readLabel(file, progress) {
    const c = await fileToCanvas(file), flat = flatten(c);
    const a = await recognize(flat, 6, p => progress?.(p < 0 ? p : p * 0.5));
    let res = parseLabel([a.text]);
    const allSure = ['kcal', 'protein', 'carbs', 'fat'].every(k => res.sure[k]);
    if (!allSure) { // second look at the original photo, then combine both readings
      const b = await recognize(c, 4, p => progress?.(p < 0 ? p : 0.5 + p * 0.5));
      res = parseLabel([a.text, b.text]);
    }
    res.preview = c.toDataURL('image/jpeg', 0.6);
    return res;
  }
  async function readFront(file, progress) {
    const c = await fileToCanvas(file, 1400);
    // Two looks (as taken, and with glare flattened): logos and coloured text read better in one or the other.
    const a = await recognize(c, 11, p => progress?.(p < 0 ? p : p * 0.5), true);
    const b = await recognize(flatten(c), 11, p => progress?.(p < 0 ? p : 0.5 + p * 0.5), true);
    const seen = new Set(), lines = [...a.lines, ...b.lines].filter(l => { const k = l.text.toLowerCase().replace(/\W+/g, ''); if (!k || seen.has(k)) return false; seen.add(k); return true; });
    return { query: frontQuery(lines), text: a.text + '\n' + b.text };
  }
  const api = { parseLabel, frontQuery, readLabel, readFront, tokens };
  if (typeof window !== 'undefined') window.LabelReader = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
