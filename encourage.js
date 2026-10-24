// NextForm encouragement: a daily quote on Home and short, kind lines through the app (reward screen,
// rest timer, food page). Turn off in Profile ("Quotes and encouragement").
// Most lines are our own. The quotes are old, public-domain sayings with well-established sources.
(() => {
  const QUOTES = [
    ['The journey of a thousand miles begins with a single step.', 'Lao Tzu, Tao Te Ching'],
    ['First say to yourself what you would be; and then do what you have to do.', 'Epictetus, Discourses'],
    ['Waste no more time arguing what a good man should be. Be one.', 'Marcus Aurelius, Meditations'],
    ['We suffer more often in imagination than in reality.', 'Seneca, Letters to Lucilius'],
    ['Fall seven times, stand up eight.', 'Japanese proverb'],
    ['Little by little, one travels far.', 'Spanish proverb'],
    ['Well begun is half done.', 'Aristotle'],
    ['Rome wasn’t built in a day.', 'Proverb'],
    ['He who has health has hope, and he who has hope has everything.', 'Proverb'],
    ['Strong is built one ordinary session at a time.', 'NextForm'],
    ['You don’t need a perfect week. You need the next good choice.', 'NextForm'],
    ['Show up on the days you don’t feel like it. Those are the ones that count twice.', 'NextForm'],
    ['Progress hides in the boring reps.', 'NextForm'],
    ['Your body keeps the score of every small effort. Keep giving it good news.', 'NextForm'],
    ['Consistency beats intensity, every single time.', 'NextForm'],
    ['Rest is part of the plan, not a break from it.', 'NextForm'],
    ['Be patient with your body. It’s doing a lot for you.', 'NextForm'],
    ['Five minutes of something beats an hour of nothing.', 'NextForm'],
    ['The version of you a year from now is built today.', 'NextForm'],
    ['Discipline is just remembering what you want.', 'NextForm'],
    ['Eat like you care about yourself. Because you do.', 'NextForm'],
    ['Slow progress is still progress. Keep going.', 'NextForm'],
    ['You’ve done hard things before. This is another one.', 'NextForm'],
    ['Train for the life you want to live, not just the mirror.', 'NextForm'],
    ['Every expert was once a beginner who didn’t quit.', 'NextForm'],
    ['Small steps, every day. That’s the whole secret.', 'NextForm']
  ];
  const LINES = {
    reward: ['Proud of you for showing up.', 'That’s another one in the bank.', 'You kept your promise to yourself today.', 'Every session counts, and this one did.',
      'Stronger than yesterday. Literally.', 'Well earned. Refuel and rest up.', 'That’s how progress is built.', 'Nice work. Future you says thanks.'],
    rewardPB: ['New best! All that consistency is paying off.', 'A personal record. You earned every kilo of it.', 'You just did something you’ve never done before.'],
    rest: ['Breathe. You’ve got this next set.', 'Good set. Shake it out.', 'Slow breath in, slow breath out.', 'Stay with it. You’re doing great.',
      'Strong work. Reset and go again.', 'Quality over speed. Take your rest.', 'One set at a time.'],
    food: ['Nice logging. Awareness is the first step.', 'Fuel your body well today.', 'You’re building great habits.', 'Every meal logged is a vote for your goals.',
      'Protein, plants, water. You’ve got this.'],
    foodOver: ['One day doesn’t define your progress. Your weekly average is what counts.', 'No stress. Tomorrow is a fresh page.', 'Bodies aren’t calculators. Enjoyed it? Good. Move on.',
      'Over today is fine. Look at the week, not the day.'],
    foodDone: ['Right on target today. Brilliant.', 'Targets hit. Your consistency is showing.'],
    rest_day: ['Rest days build strength too.', 'Recovery is training. Enjoy it.']
  };
  const hash = s => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  const on = () => (window.NextForm?.data?.profile?.encourage ?? true) !== false;
  // Same quote all day, different each day, so it feels fresh without flickering on every render.
  const quote = (day = today()) => { const [text, by] = QUOTES[hash('q' + day) % QUOTES.length]; return { text, by }; };
  const line = (kind, seed = today()) => { const l = LINES[kind] || LINES.reward; return l[hash(kind + seed) % l.length]; };

  function renderHomeQuote() {
    const box = $('#dailyQuote'); if (!box) return;
    if (!on()) { box.classList.add('hidden'); return; }
    const q = quote();
    box.classList.remove('hidden');
    box.innerHTML = `<svg class="quoteMark" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 7H6.5A2.5 2.5 0 0 0 4 9.5V13h4v4H4M20 7h-3.5A2.5 2.5 0 0 0 14 9.5V13h4v4h-4"/></svg>
      <p class="quoteText">${esc(q.text)}</p>${q.by === 'NextForm' ? '' : `<p class="quoteBy">${esc(q.by)}</p>`}`;
  }
  window.Encourage = { on, quote, line, renderHomeQuote, QUOTES, LINES };
  renderHomeQuote(); // app.js renders before this file loads
})();
