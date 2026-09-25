(() => {
  "use strict";

  const LETTERS = [
    ["ا","ألف",false,["ابن","باب","عصا"]],
    ["ب","باء",true,["بيت","حبل","كتاب"]],
    ["ت","تاء",true,["تمر","كتاب","بنت"]],
    ["ث","ثاء",true,["ثوب","مثل","مثلث"]],
    ["ج","جيم",true,["جبل","شجرة","ثلج"]],
    ["ح","حاء",true,["حوت","بحر","تفاح"]],
    ["خ","خاء",true,["خبز","نخلة","بطيخ"]],
    ["د","دال",false,["دب","مدرسة","يد"]],
    ["ذ","ذال",false,["ذئب","حذاء","تلميذ"]],
    ["ر","راء",false,["رمان","فراشة","قمر"]],
    ["ز","زاي",false,["زهرة","ميزان","أرز"]],
    ["س","سين",true,["سمك","مسجد","جرس"]],
    ["ش","شين",true,["شمس","فراش","ريش"]],
    ["ص","صاد",true,["صقر","عصير","قفص"]],
    ["ض","ضاد",true,["ضفدع","خضار","بيض"]],
    ["ط","طاء",true,["طائرة","مطر","قط"]],
    ["ظ","ظاء",true,["ظرف","مظلة","حظ"]],
    ["ع","عين",true,["عين","ملعب","شمع"]],
    ["غ","غين",true,["غزال","صغير","صمغ"]],
    ["ف","فاء",true,["فراشة","دفتر","أنف"]],
    ["ق","قاف",true,["قمر","بقرة","ورق"]],
    ["ك","كاف",true,["كتاب","مكتب","سمك"]],
    ["ل","لام",true,["ليمون","قلم","جبل"]],
    ["م","ميم",true,["موز","قمر","علم"]],
    ["ن","نون",true,["نجم","عنب","حصان"]],
    ["ه","هاء",true,["هلال","نهر","وجه"]],
    ["و","واو",false,["ورد","حوت","دلو"]],
    ["ي","ياء",true,["يد","بيت","كرسي"]]
  ].map(([letter,name,joinsNext,words], index) => ({ id:index, letter,name,joinsNext,words }));

  const POSITIONS = [
    { id:"start", label:"أول الكلمة" },
    { id:"middle", label:"وسط الكلمة" },
    { id:"end", label:"آخر الكلمة" },
    { id:"isolated", label:"منفصل" }
  ];

  const APP_VERSION = "1.2.0";
  const STORE_KEY = "hurufi-progress:v1";
  const state = {
    screen:"home",
    previous:"home",
    selectedLetter:0,
    sound:true,
    quiz:null,
    pathQuiz:null,
    progress:loadProgress()
  };

  const screen = document.getElementById("screen");
  const backBtn = document.getElementById("backBtn");
  const soundBtn = document.getElementById("soundBtn");
  const bottomNav = document.getElementById("bottomNav");

  function loadProgress(){
    try{
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      return {
        xp:Number(saved.xp)||0,
        correct:Number(saved.correct)||0,
        total:Number(saved.total)||0,
        best:Number(saved.best)||0,
        letters:saved.letters && typeof saved.letters==="object" ? saved.letters : {},
        path:saved.path && typeof saved.path==="object" ? saved.path : {}
      };
    }catch{
      return {xp:0,correct:0,total:0,best:0,letters:{},path:{}};
    }
  }

  function saveProgress(){
    try{ localStorage.setItem(STORE_KEY, JSON.stringify(state.progress)); }catch{}
  }

  function pathData(letter){
    const p=(state.progress.path||{})[letter]||{};
    return {discover:!!p.discover,identify:!!p.identify,position:!!p.position,mastery:!!p.mastery,best:Number(p.best)||0};
  }

  function savePath(letter, patch){
    if(!state.progress.path) state.progress.path={};
    state.progress.path[letter]={...pathData(letter),...patch};
    saveProgress();
  }

  function isPathUnlocked(index){
    return index===0 || pathData(LETTERS[index-1].letter).mastery;
  }

  function pathCompletedCount(){
    return LETTERS.filter(item=>pathData(item.letter).mastery).length;
  }

  function currentPathIndex(){
    const first=LETTERS.findIndex((item,i)=>isPathUnlocked(i) && !pathData(item.letter).mastery);
    return first<0 ? LETTERS.length-1 : first;
  }

  function levelFor(letter){
    const item = state.progress.letters[letter] || {correct:0,total:0};
    if(item.correct >= 8 && item.correct / Math.max(item.total,1) >= .8) return 3;
    if(item.correct >= 4) return 2;
    if(item.correct >= 1) return 1;
    return 0;
  }

  function record(letter, correct){
    const current = state.progress.letters[letter] || {correct:0,total:0};
    current.total += 1;
    if(correct) current.correct += 1;
    state.progress.letters[letter] = current;
    state.progress.total += 1;
    if(correct){ state.progress.correct += 1; state.progress.xp += 10; }
    saveProgress();
  }

  function setScreen(next, payload){
    if(next !== state.screen) state.previous = state.screen;
    state.screen = next;
    if(typeof payload === "number") state.selectedLetter = payload;
    render();
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function escapeHTML(value){
    return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));
  }

  function highlight(word, letter){
    const chars=[...word];
    const targetIndex=chars.indexOf(letter);
    return chars.map((ch,index)=>{
      const forms=ARABIC_FORMS[ch];
      if(!forms) return escapeHTML(ch);
      const prev=chars[index-1];
      const next=chars[index+1];
      const prevJoins=!!prev && joinsToNext(prev);
      const joinsPrev=prevJoins;
      const joinsNext=!!next && joinsToNext(ch);
      const formIndex=joinsPrev && joinsNext ? 2 : joinsNext ? 1 : joinsPrev ? 3 : 0;
      const glyph=forms[formIndex];
      return index===targetIndex ? '<span class="target contextual-target">'+glyph+'</span>' : glyph;
    }).join("");
  }

  function joinsToNext(ch){
    const item=LETTERS.find(x=>x.letter===ch);
    if(item) return item.joinsNext;
    return !["ا","أ","إ","آ","د","ذ","ر","ز","و","ؤ","ة","ى"].includes(ch);
  }

  const ARABIC_FORMS = {
    "ا":["ﺍ","ﺍ","ﺎ","ﺎ"],
    "أ":["ﺃ","ﺃ","ﺄ","ﺄ"],
    "إ":["ﺇ","ﺇ","ﺈ","ﺈ"],
    "آ":["ﺁ","ﺁ","ﺂ","ﺂ"],
    "ب":["ﺏ","ﺑ","ﺒ","ﺐ"],
    "ت":["ﺕ","ﺗ","ﺘ","ﺖ"],
    "ث":["ﺙ","ﺛ","ﺜ","ﺚ"],
    "ج":["ﺝ","ﺟ","ﺠ","ﺞ"],
    "ح":["ﺡ","ﺣ","ﺤ","ﺢ"],
    "خ":["ﺥ","ﺧ","ﺨ","ﺦ"],
    "د":["ﺩ","ﺩ","ﺪ","ﺪ"],
    "ذ":["ﺫ","ﺫ","ﺬ","ﺬ"],
    "ر":["ﺭ","ﺭ","ﺮ","ﺮ"],
    "ز":["ﺯ","ﺯ","ﺰ","ﺰ"],
    "س":["ﺱ","ﺳ","ﺴ","ﺲ"],
    "ش":["ﺵ","ﺷ","ﺸ","ﺶ"],
    "ص":["ﺹ","ﺻ","ﺼ","ﺺ"],
    "ض":["ﺽ","ﺿ","ﻀ","ﺾ"],
    "ط":["ﻁ","ﻃ","ﻄ","ﻂ"],
    "ظ":["ﻅ","ﻇ","ﻈ","ﻆ"],
    "ع":["ﻉ","ﻋ","ﻌ","ﻊ"],
    "غ":["ﻍ","ﻏ","ﻐ","ﻎ"],
    "ف":["ﻑ","ﻓ","ﻔ","ﻒ"],
    "ق":["ﻕ","ﻗ","ﻘ","ﻖ"],
    "ك":["ﻙ","ﻛ","ﻜ","ﻚ"],
    "ل":["ﻝ","ﻟ","ﻠ","ﻞ"],
    "م":["ﻡ","ﻣ","ﻤ","ﻢ"],
    "ن":["ﻥ","ﻧ","ﻨ","ﻦ"],
    "ه":["ﻩ","ﻫ","ﻬ","ﻪ"],
    "ة":["ﺓ","ﺓ","ﺔ","ﺔ"],
    "و":["ﻭ","ﻭ","ﻮ","ﻮ"],
    "ي":["ﻱ","ﻳ","ﻴ","ﻲ"]
  };

  function formsFor(item){
    const forms = ARABIC_FORMS[item.letter] || [item.letter,item.letter,item.letter,item.letter];
    return [
      ["منفصل", forms[0]],
      ["أول", forms[1]],
      ["وسط", forms[2]],
      ["آخر", forms[3]]
    ];
  }

  function speak(text){
    if(!state.sound || !("speechSynthesis" in window)) return;
    try{
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ar-SA";
      u.rate = .72;
      const voice = speechSynthesis.getVoices().find(v => /^ar/i.test(v.lang));
      if(voice) u.voice = voice;
      speechSynthesis.speak(u);
    }catch{}
  }

  function masteredCount(){
    return LETTERS.filter(item => levelFor(item.letter) >= 3).length;
  }

  function homeView(){
    const accuracy = state.progress.total ? Math.round(state.progress.correct/state.progress.total*100) : 0;
    return `
      <section class="hero">
        <small>مسار الحروف العربية</small>
        <h1>نتعرّف على الحرف<br>ثم نكتشف مكانه</h1>
        <p>تعلّم بصري بسيط يبدأ من شكل الحرف، ثم ينتقل إلى تمييزه داخل الكلمة واختبار موقعه.</p>
        <div class="hero-actions">
          <button class="btn primary" data-action="open-path">${pathCompletedCount() ? "واصل المسار" : "ابدأ من الصفر"} ←</button>
          <button class="btn secondary" data-action="start-quiz">اختبار سريع ✓</button>
        </div>
      </section>
      <div class="stats">
        <div class="stat"><strong>${pathCompletedCount()}/28</strong><small>في مسار الإتقان</small></div>
        <div class="stat"><strong>${state.progress.xp}</strong><small>نقطة تعلم</small></div>
        <div class="stat"><strong>${accuracy}٪</strong><small>دقة الإجابات</small></div>
      </div>
      <div class="section-title"><h2>الحروف</h2><small>اضغط أي حرف للتعلم</small></div>
      ${alphabetGrid()}
    `;
  }

  function alphabetGrid(){
    return '<div class="alphabet-grid">' + LETTERS.map(item => {
      const level = levelFor(item.letter);
      return `<button class="letter-tile" data-letter="${item.id}" data-level="${level}" aria-label="تعلم حرف ${item.name}">
        ${item.letter}${level ? '<span class="mini-star">' + "★".repeat(level) + '</span>' : ''}
      </button>`;
    }).join("") + "</div>";
  }

  function pathView(){
    return `
      <div class="section-title"><h2>مسار التعلّم</h2><small>${pathCompletedCount()} من 28 حرفًا</small></div>
      <div class="path-intro">ابدأ من أول حرف. لا يُفتح الحرف التالي إلا بعد اجتياز اختبار الإتقان بنسبة 80٪ على الأقل.</div>
      <div class="path-list">
        ${LETTERS.map((item,i)=>{
          const p=pathData(item.letter), unlocked=isPathUnlocked(i), done=p.mastery;
          const count=[p.discover,p.identify,p.position,p.mastery].filter(Boolean).length;
          return `<button class="path-row ${done?"done":""} ${unlocked&&!done?"active":""} ${!unlocked?"locked":""}" data-path-letter="${item.id}" ${!unlocked?"disabled":""}>
            <span class="path-number">${done?"✓":unlocked?item.letter:"🔒"}</span>
            <span class="path-copy"><strong>حرف ${item.name}</strong><small>${done?"متقن":unlocked?count+"/4 مراحل مكتملة":"أكمل الحرف السابق أولًا"}</small></span>
            <span class="path-meter"><span style="width:${count*25}%"></span></span>
          </button>`;
        }).join("")}
      </div>`;
  }

  function pathLetterView(){
    const item=LETTERS[state.selectedLetter];
    const p=pathData(item.letter);
    if(!isPathUnlocked(item.id)) return `<section class="card empty"><div class="emoji">🔒</div><h2>الحرف مقفل</h2><p>أكمل الحرف السابق أولًا.</p><button class="btn green" data-action="open-path">العودة للمسار</button></section>`;
    const stages=[
      ["discover","👀","أتعرّف","أرى الحرف وأسمع اسمه",true],
      ["identify","🔎","أميّز","أختار الحرف من بين حروف أخرى",p.discover],
      ["position","🧩","أحدد موقعه","أعرف أول ووسط وآخر الكلمة",p.identify],
      ["mastery","⭐","أتقن","اختبار يفتح الحرف التالي",p.position]
    ];
    return `<section class="path-letter-head"><div class="path-big-letter">${item.letter}</div><div><small>المسار الحالي</small><h1>حرف ${item.name}</h1><p>${p.mastery?"تم إتقان هذا الحرف.":"أكمل المراحل بالترتيب."}</p></div></section>
      <div class="stage-list">${stages.map((s,i)=>`<button class="stage-row ${p[s[0]]?"done":""} ${!s[4]?"locked":""}" data-stage="${s[0]}" ${!s[4]?"disabled":""}><span class="stage-icon">${p[s[0]]?"✓":s[1]}</span><span><strong>${i+1}. ${s[2]}</strong><small>${p[s[0]]?"مكتملة":s[3]}</small></span><b>${p[s[0]]?"تم":"←"}</b></button>`).join("")}</div>
      ${p.mastery && item.id<LETTERS.length-1 ? `<button class="btn green path-next" data-action="next-path-letter">الحرف التالي: ${LETTERS[item.id+1].letter}</button>` : ""}`;
  }

  function discoverView(){
    const item=LETTERS[state.selectedLetter];
    return `<section class="discover-card"><span class="eyebrow">المرحلة 1 · أتعرّف</span><div class="discover-letter">${item.letter}</div><h2>هذا حرف ${item.name}</h2><button class="btn soft" data-action="speak-letter">🔊 اسمع الحرف</button><p>${item.joinsNext?"يتصل بما بعده.":"لا يتصل بما بعده."}</p><div class="examples">${item.words.map((word,i)=>`<div class="example-row"><span>${["في البداية","في الوسط","في النهاية"][i]}</span><span class="word">${highlight(word,item.letter)}</span><span class="position-chip">${["أول","وسط","آخر"][i]}</span></div>`).join("")}</div><button class="btn green path-next" data-action="complete-discover">عرفت الحرف — انتقل للتمييز</button></section>`;
  }

  function startPathQuiz(stage){
    const focus=LETTERS[state.selectedLetter];
    const make=()=>stage==="identify"?makeIdentifyQuestion(focus):stage==="position"?randomItem([makePositionQuestion,makeShapeQuestion])(focus):newQuestion(focus);
    state.pathQuiz={stage,index:0,score:0,answered:false,choice:null,focus,question:make(),make};
    state.screen="path-quiz";
    render();
  }

  function pathQuizView(){
    const q=state.pathQuiz;
    if(!q) return pathLetterView();
    if(q.index>=5) return pathResultView();
    const question=q.question;
    const percent=q.index/5*100;
    return `<div class="quiz-shell"><div class="quiz-head"><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div><span class="quiz-count">${q.index+1} / 5</span></div><section class="question-card"><span class="eyebrow">تدريب المسار</span><h2>${question.prompt}</h2><div class="${question.type==="position"?"prompt-word":"prompt-letter"}">${question.html?question.display:escapeHTML(question.display)}</div><div class="answers">${question.options.map(opt=>{let cls="answer"+(question.type==="identify"?"":" text");if(q.answered&&opt.value===question.answer)cls+=" correct";if(q.answered&&opt.value===q.choice&&opt.value!==question.answer)cls+=" wrong";return `<button class="${cls}" data-answer="${escapeHTML(opt.value)}" ${q.answered?"disabled":""}>${escapeHTML(opt.label)}</button>`;}).join("")}</div>${q.answered?`<div class="feedback ${q.choice===question.answer?"good":"bad"}">${q.choice===question.answer?"أحسنت! 🌟":"الإجابة الصحيحة: "+question.explanation}</div><button class="btn green" data-action="next-path-question">${q.index===4?"عرض النتيجة":"السؤال التالي"}</button>`:""}</section></div>`;
  }

  function nextPathQuestion(){
    const q=state.pathQuiz;if(!q)return;
    q.index+=1;q.answered=false;q.choice=null;
    if(q.index<5) q.question=q.make();
    render();
  }

  function pathResultView(){
    const q=state.pathQuiz, passed=q.score>=4, pct=q.score*20;
    if(passed){const patch={};patch[q.stage]=true;if(q.stage==="mastery")patch.best=Math.max(pathData(q.focus.letter).best,pct);savePath(q.focus.letter,patch);}
    return `<section class="card result-card"><div class="result-medal">${passed?"🏆":"🌱"}</div><h2>${passed?"اجتزت المرحلة!":"نحتاج محاولة أخرى"}</h2><p>${q.score} من 5 — ${pct}٪</p><div class="score-ring" style="--score-angle:${pct*3.6}deg"><strong>${pct}٪</strong></div><p>${passed?(q.stage==="mastery"?"تم فتح الحرف التالي.":"يمكنك الانتقال للمرحلة التالية."):"النجاح يحتاج 4 من 5 (80٪)."}</p><div class="hero-actions" style="justify-content:center"><button class="btn green" data-action="${passed?"back-to-path-letter":"retry-path-stage"}">${passed?"متابعة":"أعد المحاولة"}</button><button class="btn ghost" data-action="open-path">عرض المسار</button></div></section>`;
  }

  function learnView(){
    const item = LETTERS[state.selectedLetter];
    const forms = formsFor(item);
    return `
      <section class="card letter-stage">
        <div class="giant-letter">${item.letter}</div>
        <div class="letter-name">حرف ${item.name}</div>
        <span class="connection-note">${item.joinsNext ? "يتصل بما بعده" : "لا يتصل بما بعده"}</span>
        <div><button class="btn soft speak-btn" data-action="speak-letter">🔊 اسمع الحرف</button></div>
      </section>

      <div class="section-title"><h2>أشكال الحرف</h2><small>لاحظ تغيّر الشكل</small></div>
      <div class="forms-grid">
        ${forms.map(([label,shape]) => `<div class="form-card"><small>${label}</small><strong>${shape}</strong></div>`).join("")}
      </div>

      <div class="section-title"><h2>الحرف في الكلمات</h2><small>أول · وسط · آخر</small></div>
      <div class="examples">
        ${item.words.map((word,i) => `<div class="example-row">
          <span>${["في البداية","في الوسط","في النهاية"][i]}</span>
          <span class="word">${highlight(word,item.letter)}</span>
          <span class="position-chip">${["أول","وسط","آخر"][i]}</span>
        </div>`).join("")}
      </div>

      <div class="letter-nav">
        <button class="btn ghost" data-action="prev-letter" ${item.id===0?"disabled":""}>السابق</button>
        <button class="btn green" data-action="practice-letter">اختبرني في ${item.letter}</button>
        <button class="btn ghost" data-action="next-letter" ${item.id===LETTERS.length-1?"disabled":""}>التالي</button>
      </div>
    `;
  }

  function randomItem(list){ return list[Math.floor(Math.random()*list.length)]; }
  function shuffle(list){ return [...list].sort(() => Math.random()-.5); }

  function makeIdentifyQuestion(focus){
    const target = focus ?? randomItem(LETTERS);
    const others = shuffle(LETTERS.filter(x=>x.id!==target.id)).slice(0,3);
    return {
      type:"identify", letter:target.letter,
      prompt:`اختر حرف ${target.name}`,
      display:target.name,
      options:shuffle([target,...others]).map(x=>({value:x.letter,label:x.letter})),
      answer:target.letter,
      explanation:`هذا هو حرف ${target.name}: ${target.letter}`
    };
  }

  function makePositionQuestion(focus){
    const target = focus ?? randomItem(LETTERS);
    const index = Math.floor(Math.random()*3);
    const word = target.words[index];
    return {
      type:"position", letter:target.letter,
      prompt:`أين يقع حرف ${target.letter} في الكلمة؟`,
      display:highlight(word,target.letter),
      html:true,
      options:[
        {value:"start",label:"أول الكلمة"},
        {value:"middle",label:"وسط الكلمة"},
        {value:"end",label:"آخر الكلمة"}
      ],
      answer:["start","middle","end"][index],
      explanation:`حرف ${target.letter} هنا في ${["أول","وسط","آخر"][index]} الكلمة.`
    };
  }

  function makeShapeQuestion(focus){
    const target = focus ?? randomItem(LETTERS);
    const forms = formsFor(target);
    const candidate = randomItem(forms);
    return {
      type:"shape", letter:target.letter,
      prompt:`هذا شكل حرف ${target.letter} في...`,
      display:candidate[1],
      options:POSITIONS.map(p=>({value:p.id,label:p.label})),
      answer:{ "منفصل":"isolated","أول":"start","وسط":"middle","آخر":"end" }[candidate[0]],
      explanation:`الشكل المعروض لحرف ${target.letter}: ${candidate[0]}.`
    };
  }

  function newQuestion(focus){
    return randomItem([makeIdentifyQuestion,makePositionQuestion,makeShapeQuestion])(focus);
  }

  function startQuiz(focusId=null){
    const focus = focusId===null ? null : LETTERS[focusId];
    state.quiz = { index:0, score:0, answered:false, choice:null, focus, question:newQuestion(focus) };
    state.screen = "quiz";
    render();
  }

  function quizView(){
    if(!state.quiz) startQuiz();
    const q = state.quiz;
    if(q.index >= 10) return resultView();
    const question = q.question;
    const percent = q.index/10*100;
    return `
      <div class="quiz-shell">
        <div class="quiz-head">
          <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
          <span class="quiz-count">${q.index+1} / 10</span>
        </div>
        <section class="question-card">
          <span class="eyebrow">${question.type==="identify"?"تمييز الحرف":question.type==="position"?"موقع الحرف":"شكل الحرف"}</span>
          <h2>${question.prompt}</h2>
          <div class="${question.type==="position"?"prompt-word":"prompt-letter"}">${question.html?question.display:escapeHTML(question.display)}</div>
          <div class="answers">
            ${question.options.map(opt => {
              let cls = "answer" + (question.type==="identify"?"":" text");
              if(q.answered && opt.value===question.answer) cls += " correct";
              if(q.answered && opt.value===q.choice && opt.value!==question.answer) cls += " wrong";
              return `<button class="${cls}" data-answer="${escapeHTML(opt.value)}" ${q.answered?"disabled":""}>${escapeHTML(opt.label)}</button>`;
            }).join("")}
          </div>
          ${q.answered ? `<div class="feedback ${q.choice===question.answer?"good":"bad"}">${q.choice===question.answer?"أحسنت! 🌟":"محاولة جميلة. "+question.explanation}</div>
          <button class="btn green" data-action="next-question">${q.index===9?"عرض النتيجة":"السؤال التالي"}</button>` : ""}
        </section>
      </div>
    `;
  }

  function answerQuestion(value){
    const q = state.screen==="path-quiz" ? state.pathQuiz : state.quiz;
    if(!q || q.answered) return;
    q.answered = true;
    q.choice = value;
    const correct = value === q.question.answer;
    if(correct){ q.score += 1; celebrate(); }
    record(q.question.letter, correct);
    render();
  }

  function nextQuestion(){
    const q = state.quiz;
    if(!q) return;
    q.index += 1;
    q.answered = false;
    q.choice = null;
    if(q.index < 10) q.question = newQuestion(q.focus);
    else{
      state.progress.best = Math.max(state.progress.best,q.score);
      saveProgress();
    }
    render();
  }

  function resultView(){
    const q = state.quiz;
    const score = q ? q.score : 0;
    const pct = score*10;
    const text = score>=9?"ممتاز جدًا!":score>=7?"أداء رائع!":score>=5?"تقدم جميل":"نواصل التدريب";
    return `
      <section class="card result-card">
        <div class="result-medal">${score>=8?"🏆":score>=5?"🌟":"🌱"}</div>
        <h2>${text}</h2>
        <p>أجبت عن ${score} من 10 إجابات صحيحة.</p>
        <div class="score-ring" style="--score-angle:${pct*3.6}deg"><strong>${pct}٪</strong></div>
        <div class="hero-actions" style="justify-content:center">
          <button class="btn green" data-action="restart-quiz">اختبار جديد</button>
          <button class="btn ghost" data-action="go-progress">شاهد تقدمي</button>
        </div>
      </section>
    `;
  }

  function progressView(){
    const practiced = LETTERS.filter(item => (state.progress.letters[item.letter]?.total||0)>0);
    if(!practiced.length){
      return `<section class="card empty"><div class="emoji">🌱</div><h2>بداية جميلة</h2><p>ابدأ بتعلم حرف أو خض اختبارًا، وسنحفظ تقدمك هنا على هذا الجهاز.</p><button class="btn green" data-action="start-learn">ابدأ الآن</button></section>`;
    }
    return `
      <div class="section-title"><h2>تقدمي في الحروف</h2><small>كلما تدربت ارتفعت النجوم</small></div>
      <div class="progress-list">
        ${practiced.map(item => {
          const p=state.progress.letters[item.letter];
          const accuracy=Math.round(p.correct/Math.max(p.total,1)*100);
          const level=levelFor(item.letter);
          return `<button class="progress-row" data-letter="${item.id}">
            <span class="progress-letter">${item.letter}</span>
            <span class="progress-copy"><strong>حرف ${item.name}</strong><small>${p.correct} صحيحة من ${p.total}</small><span class="bar"><span style="width:${accuracy}%"></span></span></span>
            <span class="stars">${"★".repeat(level)}${"☆".repeat(3-level)}</span>
          </button>`;
        }).join("")}
      </div>
    `;
  }

  function render(){
    bottomNav.querySelectorAll("button").forEach(btn => btn.classList.toggle("active",btn.dataset.screen===state.screen));
    backBtn.classList.toggle("hidden",["home","learn","quiz","progress"].includes(state.screen));
    soundBtn.textContent = state.sound ? "🔊" : "🔇";
    if(state.screen==="home") screen.innerHTML=homeView();
    else if(state.screen==="path") screen.innerHTML=pathView();
    else if(state.screen==="path-letter") screen.innerHTML=pathLetterView();
    else if(state.screen==="discover") screen.innerHTML=discoverView();
    else if(state.screen==="path-quiz") screen.innerHTML=pathQuizView();
    else if(state.screen==="learn-list") screen.innerHTML='<div class="section-title"><h2>اختر حرفًا</h2><small>28 حرفًا</small></div>'+alphabetGrid();
    else if(state.screen==="learn") screen.innerHTML=learnView();
    else if(state.screen==="quiz") screen.innerHTML=quizView();
    else if(state.screen==="progress") screen.innerHTML=progressView();
    bindDynamic();
  }

  function bindDynamic(){
    screen.querySelectorAll("[data-letter]").forEach(btn => btn.addEventListener("click",()=>setScreen("learn",Number(btn.dataset.letter))));
    screen.querySelectorAll("[data-path-letter]").forEach(btn => btn.addEventListener("click",()=>setScreen("path-letter",Number(btn.dataset.pathLetter))));
    screen.querySelectorAll("[data-stage]").forEach(btn => btn.addEventListener("click",()=>{const stage=btn.dataset.stage;if(stage==="discover")setScreen("discover");else startPathQuiz(stage);}));
    screen.querySelectorAll("[data-answer]").forEach(btn => btn.addEventListener("click",()=>answerQuestion(btn.dataset.answer)));
    screen.querySelectorAll("[data-action]").forEach(btn => btn.addEventListener("click",()=>{
      const action=btn.dataset.action;
      if(action==="start-learn") setScreen("learn-list");
      if(action==="open-path") setScreen("path");
      if(action==="open-current-path") setScreen("path-letter",currentPathIndex());
      if(action==="complete-discover"){savePath(LETTERS[state.selectedLetter].letter,{discover:true});setScreen("path-letter");}
      if(action==="next-path-question") nextPathQuestion();
      if(action==="retry-path-stage") startPathQuiz(state.pathQuiz.stage);
      if(action==="back-to-path-letter") setScreen("path-letter");
      if(action==="next-path-letter") setScreen("path-letter",Math.min(LETTERS.length-1,state.selectedLetter+1));
      if(action==="start-quiz") startQuiz();
      if(action==="speak-letter") speak(LETTERS[state.selectedLetter].name);
      if(action==="prev-letter"){state.selectedLetter=Math.max(0,state.selectedLetter-1);render();}
      if(action==="next-letter"){state.selectedLetter=Math.min(LETTERS.length-1,state.selectedLetter+1);render();}
      if(action==="practice-letter") startQuiz(state.selectedLetter);
      if(action==="next-question") nextQuestion();
      if(action==="restart-quiz") startQuiz(state.quiz?.focus?.id ?? null);
      if(action==="go-progress") setScreen("progress");
    }));
  }

  function celebrate(){
    const layer=document.getElementById("celebration");
    for(let i=0;i<12;i++){
      const s=document.createElement("span");
      s.className="confetti";
      s.textContent=randomItem(["★","●","◆","✦"]);
      s.style.left=(8+Math.random()*84)+"%";
      s.style.animationDelay=(Math.random()*.18)+"s";
      layer.appendChild(s);
      setTimeout(()=>s.remove(),1800);
    }
  }

  bottomNav.addEventListener("click",e=>{
    const btn=e.target.closest("button[data-screen]");
    if(!btn) return;
    if(btn.dataset.screen==="learn") setScreen("learn-list");
    else if(btn.dataset.screen==="quiz") startQuiz();
    else setScreen(btn.dataset.screen);
  });
  backBtn.addEventListener("click",()=>setScreen(state.previous||"home"));
  soundBtn.addEventListener("click",()=>{state.sound=!state.sound;if(!state.sound&&"speechSynthesis" in window)speechSynthesis.cancel();render();});

  function showUpdate(registration){
    const bar=document.getElementById("updateBar");
    const button=document.getElementById("updateNowBtn");
    if(!bar || !button || !registration?.waiting) return;
    bar.hidden=false;
    button.onclick=()=>{
      button.disabled=true;
      button.textContent="جارٍ التحديث…";
      registration.waiting.postMessage({type:"SKIP_WAITING"});
    };
  }

  function setupAppUpdates(){
    if(!("serviceWorker" in navigator)) return;
    let refreshing=false;
    navigator.serviceWorker.addEventListener("controllerchange",()=>{
      if(refreshing) return;
      refreshing=true;
      location.reload();
    });
    window.addEventListener("load",async()=>{
      try{
        const registration=await navigator.serviceWorker.register("./sw.js");
        if(registration.waiting) showUpdate(registration);
        registration.addEventListener("updatefound",()=>{
          const worker=registration.installing;
          if(!worker) return;
          worker.addEventListener("statechange",()=>{
            if(worker.state==="installed" && navigator.serviceWorker.controller){
              showUpdate(registration);
            }
          });
        });
        registration.update().catch(()=>{});
        document.addEventListener("visibilitychange",()=>{
          if(document.visibilityState==="visible") registration.update().catch(()=>{});
        });
      }catch{}
    });
  }

  setupAppUpdates();
  render();
})();
