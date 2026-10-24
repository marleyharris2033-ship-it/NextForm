// NextForm form videos: chosen YouTube tutorials played with YouTube's own embedded player.
// YouTube's terms allow embedding through its player only when the video's owner allows it. If the owner
// has turned embedding off (player errors 101/150) or the video is gone (100), we don't play it here and
// show a link to watch it on YouTube instead. Videos only load when someone taps "Watch how".
(() => {
  const VIDEOS = {
    'Back Squat': 'irA7MTz96ho', 'Front Squat': 'npVgCT7NznU', 'Goblet Squat': 'MeIiIdhvXT4',
    'Deadlift': 'ntr64W6ZWB0', 'Romanian Deadlift': 'KTME4qWcvTM', 'Dumbbell Romanian Deadlift': 'hQgFixeXdZo',
    'Bench Press': 'gBZkSn-zsD0', 'Dumbbell Bench Press': 'Y_7aHqXeCfQ', 'Incline Dumbbell Press': 'sh5ZsRpEZCw',
    'Overhead Press': 'nNMR9fRGRjQ', 'Dumbbell Shoulder Press': 'WKEl69bIGus', 'Lateral Raise': 'pzj8pmSH8d4',
    'Barbell Row': 'G8l_8chR5BE', 'Dumbbell Row': 'ZRSGpBUVcNw', 'One-Arm Dumbbell Row': 'ZRSGpBUVcNw',
    'Seated Cable Row': 'f_r95UajQcg', 'Pull-Up': 'TMnxKjdYcME', 'Lat Pulldown': 'AOpi-p0cJkc',
    'Face Pull': '4CXhdbWOdzQ', 'Push-Up': 'WDIpL0pjun0', 'Dip': 'C2I5gRA8hAY',
    'Dumbbell Curl': 'ykJmrZ5v0Oo', 'Triceps Pushdown': 'ChbWX35gD44',
    'Hip Thrust': 'rcb2aZMuGCk', 'Glute Bridge': 'EEtd0uY-bMw', 'Bulgarian Split Squat': 'EiBXgDJ_g-Q',
    'Walking Lunge': 'I34ysEkPK7w', 'Leg Press': 'oB3lpMSis_4', 'Kettlebell Swing': 'B_x0tp3HIbk',
    'Plank': 'BQu26ABuVS0', 'Hanging Leg Raise': 'JXztA3fLp50'
  };
  const watchUrl = id => 'https://www.youtube.com/watch?v=' + id;
  const searchUrl = name => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(name + ' exercise form');
  let api = null, player = null;
  const loadApi = () => api || (api = new Promise((ok, fail) => {
    if (window.YT?.Player) return ok(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); ok(window.YT); };
    const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => { api = null; fail(new Error('offline')); }; document.head.appendChild(s);
  }));

  function sheet() {
    let el = document.getElementById('videoSheet');
    if (el) return el;
    el = document.createElement('div'); el.id = 'videoSheet'; el.className = 'videoSheet hidden';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.addEventListener('click', e => { if (e.target === el || e.target.closest('[data-v=close]')) close(); });
    document.body.appendChild(el); return el;
  }
  function fallback(name, id, why) {
    const box = document.querySelector('#videoSheet .videoFrame'); if (!box) return;
    box.innerHTML = `<div class="videoMsg"><p>${why}</p><a class="primary" href="${watchUrl(id)}" target="_blank" rel="noopener">Watch on YouTube</a></div>`;
  }
  function open(name) {
    const id = VIDEOS[name]; if (!id) { window.open(searchUrl(name), '_blank', 'noopener'); return; }
    const el = sheet();
    el.innerHTML = `<div class="videoCard"><div class="videoHead"><b>${esc(name)}</b><button type="button" class="ghost" data-v="close" aria-label="Close">✕</button></div>
      <div class="videoFrame"><div id="videoPlayer"></div></div>
      <p class="tiny muted">Video by its creator on YouTube. NextForm isn't linked to them. <a href="${watchUrl(id)}" target="_blank" rel="noopener">Open in YouTube</a></p></div>`;
    el.classList.remove('hidden');
    loadApi().then(YT => {
      if (el.classList.contains('hidden')) return;
      player = new YT.Player('videoPlayer', { videoId: id, host: 'https://www.youtube-nocookie.com', width: '100%', height: '100%',
        playerVars: { rel: 0, playsinline: 1, modestbranding: 1 },
        events: { onError: e => fallback(name, id, [101, 150].includes(e.data) ? 'This video’s owner doesn’t allow it to play inside other apps.' : 'This video isn’t available any more.') } });
    }).catch(() => fallback(name, id, 'Videos need an internet connection.'));
  }
  function close() {
    try { player?.destroy(); } catch {} player = null;
    const el = document.getElementById('videoSheet'); if (el) { el.classList.add('hidden'); el.innerHTML = ''; }
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !document.getElementById('videoSheet')?.classList.contains('hidden')) close(); });
  // A button for any exercise: plays our chosen video, or searches YouTube if we haven't picked one yet.
  const button = name => VIDEOS[name]
    ? `<button type="button" class="watchBtn" data-watch="${esc(name)}">▶ Watch how</button>`
    : `<a class="watchBtn" href="${searchUrl(name)}" target="_blank" rel="noopener">▶ Find a video on YouTube</a>`;
  document.addEventListener('click', e => { const b = e.target.closest('[data-watch]'); if (b) { e.preventDefault(); open(b.dataset.watch); } });
  window.FormVideos = { VIDEOS, open, close, button, has: name => !!VIDEOS[name] };
})();
