import { ArabicSpeechEngine } from './speech-engine.js';
import { loadProgress, saveProgress, resetProgress } from './storage.js';

const speech = new ArabicSpeechEngine();
let progress = loadProgress();
let letter;
let shortTarget = null;
let lengthTarget = null;
let spellAnswer = [];
const targetWord = ['كَ', 'تَ', 'بَ'];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

async function init() {
  const data = await fetch('./data/letters.json').then(r => r.json());
  letter = data.letters[0];
  renderShort();
  renderLong();
  renderPositions();
  renderBlend();
  renderSpell();
  bindNavigation();
  bindSpeechSettings();
  updateMastery();

  $('#heroLetter').addEventListener('click', () => speech.speak(letter.name.speech));
  $('#shortChallengePlay').addEventListener('click', startShortChallenge);
  $('#lengthChallengePlay').addEventListener('click', startLengthChallenge);
  $$('#long .choice[data-length]').forEach(btn => btn.addEventListener('click', () => checkLength(btn.dataset.length, btn)));
  $('#blendSequence').addEventListener('click', () => {
    progress.blend.attempts++;
    saveProgress(progress);
    speech.speakSequence(targetWord, 240);
    updateMastery();
  });
  $('#blendWhole').addEventListener('click', async () => {
    await speech.speak('كَتَبَ');
    progress.blend.success++;
    saveProgress(progress);
    updateMastery();
  });
  $('#blendWord').addEventListener('click', () => speech.speak('كَتَبَ'));
  $('#spellWord').addEventListener('click', () => speech.speak('كَتَبَ'));
  $('#resetSpell').addEventListener('click', resetSpellUI);
  $('#checkSpell').addEventListener('click', checkSpell);
  $('#resetProgress').addEventListener('click', () => {
    if (confirm('هل تريد تصفير تقدم النموذج التجريبي؟')) {
      progress = resetProgress();
      renderShort(); renderLong(); renderPositions(); resetSpellUI(); updateMastery();
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(console.warn);
  }
}

function renderShort() {
  const grid = $('#shortGrid');
  grid.innerHTML = '';
  letter.shortVowels.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'sound-card' + (progress.short.learned.includes(item.id) ? ' learned' : '');
    btn.innerHTML = `<span class="sound-glyph">${item.display}</span><span class="sound-label">${item.label} · اضغط واسمع</span>`;
    btn.addEventListener('click', async () => {
      await speech.speak(item.speech);
      if (!progress.short.learned.includes(item.id)) progress.short.learned.push(item.id);
      saveProgress(progress); renderShort(); updateMastery();
    });
    grid.appendChild(btn);
  });
  $('#shortScore').textContent = `${progress.short.learned.length}/3`;
  renderShortOptions();
}

function renderShortOptions() {
  const wrap = $('#shortOptions');
  if (!wrap) return;
  wrap.innerHTML = '';
  letter.shortVowels.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = item.display;
    btn.addEventListener('click', () => checkShort(item.id, btn));
    wrap.appendChild(btn);
  });
}

function startShortChallenge() {
  $$('#shortOptions .choice').forEach(b => b.classList.remove('correct', 'wrong'));
  $('#shortFeedback').textContent = '';
  shortTarget = letter.shortVowels[Math.floor(Math.random() * letter.shortVowels.length)];
  speech.speak(shortTarget.speech);
}

function checkShort(id, btn) {
  if (!shortTarget) { startShortChallenge(); return; }
  progress.short.attempts++;
  const ok = id === shortTarget.id;
  if (ok) {
    progress.short.correct++;
    btn.classList.add('correct');
    $('#shortFeedback').textContent = 'أحسنت! هذا هو الصوت الصحيح.';
    $('#shortFeedback').style.color = 'var(--success)';
  } else {
    btn.classList.add('wrong');
    $('#shortFeedback').textContent = 'جرّب مرة أخرى واستمع جيدًا.';
    $('#shortFeedback').style.color = 'var(--danger)';
    speech.speak(shortTarget.speech);
  }
  saveProgress(progress); updateMastery();
}

function renderLong() {
  const wrap = $('#longPairs');
  wrap.innerHTML = '';
  letter.longVowels.forEach(item => {
    const row = document.createElement('div');
    row.className = 'compare-row';
    row.innerHTML = `
      <button class="compare-btn" data-say="${item.short}"><strong>${item.short}</strong><span>قصير</span></button>
      <div class="length-visual">● ━━━</div>
      <button class="compare-btn" data-say="${item.speech}"><strong>${item.display}</strong><span>${item.label}</span></button>`;
    row.querySelectorAll('[data-say]').forEach(btn => btn.addEventListener('click', async () => {
      await speech.speak(btn.dataset.say);
      if (btn.dataset.say === item.speech && !progress.long.learned.includes(item.id)) {
        progress.long.learned.push(item.id);
        saveProgress(progress); renderLong(); updateMastery();
      }
    }));
    wrap.appendChild(row);
  });
  $('#longScore').textContent = `${progress.long.learned.length}/3`;
}

function startLengthChallenge() {
  $$('#long .choice[data-length]').forEach(b => b.classList.remove('correct', 'wrong'));
  $('#lengthFeedback').textContent = '';
  const long = Math.random() >= .5;
  const idx = Math.floor(Math.random() * 3);
  lengthTarget = {
    type: long ? 'long' : 'short',
    speech: long ? letter.longVowels[idx].speech : letter.shortVowels[idx].speech
  };
  speech.speak(lengthTarget.speech);
}

function checkLength(answer, btn) {
  if (!lengthTarget) { startLengthChallenge(); return; }
  progress.long.attempts++;
  const ok = answer === lengthTarget.type;
  if (ok) {
    progress.long.correct++;
    btn.classList.add('correct');
    $('#lengthFeedback').textContent = 'صحيح 👏';
    $('#lengthFeedback').style.color = 'var(--success)';
  } else {
    btn.classList.add('wrong');
    $('#lengthFeedback').textContent = lengthTarget.type === 'long' ? 'استمع إلى امتداد الصوت.' : 'هذا صوت قصير؛ لا يوجد امتداد.';
    $('#lengthFeedback').style.color = 'var(--danger)';
    speech.speak(lengthTarget.speech);
  }
  saveProgress(progress); updateMastery();
}

function renderPositions() {
  const grid = $('#positionGrid');
  grid.innerHTML = '';
  letter.positions.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'position-card';
    btn.innerHTML = `<div class="position-form">${item.form}</div><div class="position-label">${item.label}</div><div class="position-word">${item.word}</div>`;
    btn.addEventListener('click', async () => {
      await speech.speak(item.speech);
      if (!progress.positions.learned.includes(item.id)) progress.positions.learned.push(item.id);
      saveProgress(progress); updateMastery();
    });
    grid.appendChild(btn);
  });
}

function renderBlend() {
  const wrap = $('#blendSyllables');
  wrap.innerHTML = '';
  targetWord.forEach(part => {
    const btn = document.createElement('button');
    btn.className = 'syllable';
    btn.textContent = part;
    btn.addEventListener('click', () => speech.speak(part));
    wrap.appendChild(btn);
  });
}

function renderSpell() {
  const pool = $('#spellPool');
  const slots = $('#spellSlots');
  slots.innerHTML = '<div class="spell-slot"></div><div class="spell-slot"></div><div class="spell-slot"></div>';
  pool.innerHTML = '';
  spellAnswer = [];
  shuffle([...targetWord]).forEach(part => {
    const btn = document.createElement('button');
    btn.className = 'spell-token';
    btn.textContent = part;
    btn.addEventListener('click', () => placeSpellToken(btn, part));
    pool.appendChild(btn);
  });
}

function placeSpellToken(btn, part) {
  if (spellAnswer.length >= targetWord.length) return;
  const slot = $$('#spellSlots .spell-slot')[spellAnswer.length];
  spellAnswer.push(part);
  slot.textContent = part;
  btn.disabled = true;
  btn.style.opacity = .35;
  speech.speak(part);
}

function resetSpellUI() {
  $('#spellFeedback').textContent = '';
  renderSpell();
}

function checkSpell() {
  progress.spell.attempts++;
  const ok = spellAnswer.join('|') === targetWord.join('|');
  if (ok) {
    progress.spell.success++;
    $('#spellFeedback').textContent = 'ممتاز! كَ + تَ + بَ = كَتَبَ';
    $('#spellFeedback').style.color = 'var(--success)';
    speech.speak('كَتَبَ');
  } else {
    $('#spellFeedback').textContent = 'لم يكتمل الترتيب الصحيح بعد. أعد المحاولة.';
    $('#spellFeedback').style.color = 'var(--danger)';
  }
  saveProgress(progress); updateMastery();
}

function bindNavigation() {
  $$('.tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.tab').forEach(t => t.classList.toggle('active', t === tab));
    $$('.lesson-view').forEach(view => view.classList.toggle('active', view.id === tab.dataset.view));
    document.getElementById(tab.dataset.view).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
}

function bindSpeechSettings() {
  const dialog = $('#settingsDialog');
  const select = $('#voiceSelect');
  const rate = $('#rateInput');
  const rateLabel = $('#rateLabel');
  rate.value = speech.rate;
  rateLabel.textContent = speech.rate.toFixed(2);

  $('#settingsBtn').addEventListener('click', () => dialog.showModal());
  rate.addEventListener('input', () => {
    rateLabel.textContent = Number(rate.value).toFixed(2);
    speech.setRate(rate.value);
  });
  select.addEventListener('change', () => speech.setVoice(select.value));
  speech.onVoicesChanged(voices => {
    select.innerHTML = '';
    if (!voices.length) {
      select.add(new Option('لا يوجد صوت عربي ظاهر حاليًا', ''));
      return;
    }
    voices.forEach(v => {
      const opt = new Option(`${v.name} — ${v.lang}${v.localService ? ' · محلي' : ''}`, v.voiceURI);
      opt.selected = v.voiceURI === speech.voiceURI;
      select.add(opt);
    });
  });
  $$('.lab-buttons [data-say]').forEach(btn => btn.addEventListener('click', () => speech.speak(btn.dataset.say)));
}

function updateMastery() {
  const percent = (n, d) => d ? Math.round((n / d) * 100) : 0;
  const scores = {
    'الحركات': Math.max(percent(progress.short.learned.length, 3), percent(progress.short.correct, progress.short.attempts)),
    'المدود': Math.max(percent(progress.long.learned.length, 3), percent(progress.long.correct, progress.long.attempts)),
    'المواضع': percent(progress.positions.learned.length, 4),
    'الدمج': progress.blend.success ? 100 : (progress.blend.attempts ? 50 : 0),
    'التهجئة': percent(progress.spell.success, progress.spell.attempts)
  };
  const grid = $('#masteryGrid');
  grid.innerHTML = Object.entries(scores).map(([label, score]) => `<div class="mastery-item"><span>${label}</span><strong>${Math.min(100, score)}%</strong></div>`).join('');
  const overall = Math.round(Object.values(scores).reduce((a,b) => a + Math.min(100,b), 0) / Object.keys(scores).length);
  $('#progressBar').style.width = `${overall}%`;
  $('#progressText').textContent = `${overall}%`;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

init().catch(err => {
  console.error(err);
  document.body.insertAdjacentHTML('beforeend', '<p style="padding:20px;text-align:center">تعذر تحميل بيانات الدرس. أعد فتح التطبيق.</p>');
});
