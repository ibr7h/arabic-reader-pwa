(() => {
  "use strict";

  const VERSION="2.0.0-alpha.3";
  const TARGET="م";
  const TARGET_SPOKEN="مِيم";
  const STORAGE_KEY="hurufi-v2:golden-meem";
  const FONT_KEY="hurufi-v2:learning-font";
  const FONT_OPTIONS=["school","baloo","marhey","cairo","readex","geeza"];
  const FONT_FAMILIES={
    school:"Noto Naskh Arabic",
    baloo:"Baloo Bhaijaan 2",
    marhey:"Marhey",
    cairo:"Cairo",
    readex:"Readex Pro",
    geeza:"Geeza Pro"
  };
  const WEB_FONTS=new Set(["school","baloo","marhey","cairo","readex"]);

  const EXAMPLES=[
    {word:"موز", spoken:"مَوْز", targetIndex:0, position:"start", connection:"next", label:"البداية"},
    {word:"قمر", spoken:"قَمَر", targetIndex:1, position:"middle", connection:"both", label:"الوسط"},
    {word:"علم", spoken:"عَلَم", targetIndex:2, position:"end", connection:"previous", label:"النهاية"},
    {word:"نجوم", spoken:"نُجُوم", targetIndex:3, position:"end", connection:"isolated", label:"منفصل في النهاية"}
  ];

  const IDENTIFY_ROUNDS=[
    ["م","هـ","ن","ب"],
    ["و","م","ف","ق"],
    ["ن","س","م","ه"]
  ];

  const CHALLENGE=[
    {type:"identify", prompt:"أين حرف م؟", spoken:"أَيْنَ حَرْفُ مِيم؟", options:["ن","م","هـ","ب"], answer:"م"},
    {type:"position", example:0},
    {type:"position", example:1},
    {type:"position", example:2},
    {type:"connection", prompt:"أي كلمة فيها م متصل من الجهتين؟", spoken:"أي كلمة فيها حرف ميم متصل من الجهتين؟", options:[0,1,2], answer:1}
  ];

  const STAGES=["intro","identify","words","train","joining","challenge","finish"];
  const screen=document.getElementById("screen");
  const backBtn=document.getElementById("backBtn");
  const soundBtn=document.getElementById("soundBtn");
  const progressFill=document.getElementById("progressFill");
  const toast=document.getElementById("toast");
  const settingsBtn=document.getElementById("settingsBtn");
  const settingsPanel=document.getElementById("settingsPanel");
  const settingsClose=document.getElementById("settingsClose");
  const fontStatus=document.getElementById("fontStatus");
  const appVersionEl=document.getElementById("appVersion");
  const updateBar=document.getElementById("updateBar");
  const updateTitle=document.getElementById("updateTitle");
  const updateStatus=document.getElementById("updateStatus");
  const updateProgressFill=document.getElementById("updateProgressFill");

  const state={
    stage:"intro",
    sound:true,
    learningFont:loadLearningFont(),
    identifyIndex:0,
    identifyScore:0,
    identifyAnswered:false,
    identifyChoice:null,
    visitedWords:new Set(),
    trainIndex:0,
    trainScore:0,
    trainAnswered:false,
    trainChoice:null,
    challengeIndex:0,
    challengeScore:0,
    challengeAnswered:false,
    challengeChoice:null
  };

  function loadLearningFont(){
    try{
      const saved=localStorage.getItem(FONT_KEY);
      return FONT_OPTIONS.includes(saved)?saved:"school";
    }catch{return "school";}
  }

  function setFontStatus(message,type=""){
    if(!fontStatus)return;
    fontStatus.textContent=message||"";
    fontStatus.className="font-status"+(type?" "+type:"");
  }

  async function ensureFontLoaded(font){
    if(!WEB_FONTS.has(font)||!document.fonts)return true;
    const family=FONT_FAMILIES[font];
    try{
      const load=document.fonts.load('600 72px "'+family+'"',"مبسع");
      const timeout=new Promise(resolve=>setTimeout(()=>resolve([]),6500));
      const faces=await Promise.race([load,timeout]);
      return Array.isArray(faces)&&faces.length>0;
    }catch{return false;}
  }

  function markActiveFont(font){
    document.querySelectorAll("[data-font].active").forEach(el=>el.classList.remove("active"));
    const selected=document.querySelector('[data-font="'+font+'"]');
    if(selected)selected.classList.add("active");
  }

  async function applyLearningFont(font,{persist=true,showStatus=false}={}){
    const next=FONT_OPTIONS.includes(font)?font:"school";
    const previous=state.learningFont;
    if(showStatus){
      setFontStatus("جارٍ تحميل الخط…","loading");
      document.querySelector('[data-font="'+next+'"]')?.classList.add("loading");
    }
    const loaded=await ensureFontLoaded(next);
    document.querySelectorAll("[data-font].loading").forEach(el=>el.classList.remove("loading"));
    if(!loaded&&WEB_FONTS.has(next)){
      state.learningFont=previous;
      document.documentElement.dataset.learningFont=previous;
      markActiveFont(previous);
      if(showStatus)setFontStatus("تعذر تحميل الخط الآن. بقي الخط السابق.","error");
      return false;
    }
    state.learningFont=next;
    document.documentElement.dataset.learningFont=next;
    markActiveFont(next);
    if(persist){try{localStorage.setItem(FONT_KEY,next);}catch{}}
    if(showStatus){
      setFontStatus("تم تطبيق الخط ✓","success");
      setTimeout(()=>setFontStatus(""),1300);
    }
    return true;
  }

  function joinsToNext(ch){
    return !["ا","أ","إ","آ","د","ذ","ر","ز","و","ؤ","ة","ى"].includes(ch);
  }

  function derivedPosition(chars,index){
    if(index===0) return "start";
    if(index===chars.length-1) return "end";
    return "middle";
  }

  function derivedConnection(chars,index){
    const ch=chars[index],prev=chars[index-1],next=chars[index+1];
    const toPrev=!!prev && joinsToNext(prev);
    const toNext=!!next && joinsToNext(ch);
    if(toPrev&&toNext) return "both";
    if(toNext) return "next";
    if(toPrev) return "previous";
    return "isolated";
  }

  function validateContent(){
    const errors=[];
    EXAMPLES.forEach((ex,i)=>{
      const chars=[...ex.word];
      if(chars[ex.targetIndex]!==TARGET) errors.push(`Example ${i}: targetIndex does not point to م`);
      const actualPos=derivedPosition(chars,ex.targetIndex);
      if(actualPos!==ex.position) errors.push(`Example ${i}: position ${ex.position} != ${actualPos}`);
      const actualConn=derivedConnection(chars,ex.targetIndex);
      if(actualConn!==ex.connection) errors.push(`Example ${i}: connection ${ex.connection} != ${actualConn}`);
    });
    if(errors.length) throw new Error("Hurufi content validation failed:\n"+errors.join("\n"));
  }

  function escapeHTML(v){
    return String(v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));
  }

  function highlightExample(ex){
    const chars=[...ex.word];
    const index=ex.targetIndex;
    const before=chars.slice(0,index).join("");
    const target=chars[index];
    const after=chars.slice(index+1).join("");
    const prev=chars[index-1],next=chars[index+1];
    const joinPrev=!!prev && joinsToNext(prev);
    const joinNext=!!next && joinsToNext(target);
    const beforeText=before+(joinPrev?"\u200D":"");
    const targetText=(joinPrev?"\u200D":"")+target+(joinNext?"\u200D":"");
    const afterText=(joinNext?"\u200D":"")+after;
    return escapeHTML(beforeText)+'<span class="target">'+escapeHTML(targetText)+'</span>'+escapeHTML(afterText);
  }

  let preferredArabicVoice=null;

  function scoreArabicVoice(voice){
    if(!voice || !/^ar/i.test(voice.lang||"")) return -1;
    let score=0;
    const lang=(voice.lang||"").toLowerCase();
    const name=(voice.name||"").toLowerCase();
    if(lang==="ar-sa") score+=100;
    else if(lang.startsWith("ar-")) score+=70;
    else score+=50;
    if(voice.localService) score+=12;
    if(/majed|maged|tarik|laila|hoda|hameed|arabic/.test(name)) score+=8;
    if(/enhanced|premium/.test(name)) score+=6;
    return score;
  }

  function refreshArabicVoice(){
    if(!("speechSynthesis" in window)) return;
    const voices=speechSynthesis.getVoices().filter(v=>/^ar/i.test(v.lang||""));
    voices.sort((a,b)=>scoreArabicVoice(b)-scoreArabicVoice(a));
    preferredArabicVoice=voices[0]||null;
  }

  function speak(text,{rate=.66}={}){
    if(!state.sound || !("speechSynthesis" in window)) return;
    try{
      if(!preferredArabicVoice) refreshArabicVoice();
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.lang=preferredArabicVoice?.lang||"ar-SA";
      u.rate=rate;
      u.pitch=1;
      u.volume=1;
      if(preferredArabicVoice) u.voice=preferredArabicVoice;
      speechSynthesis.speak(u);
    }catch{}
  }

  if("speechSynthesis" in window){
    refreshArabicVoice();
    speechSynthesis.addEventListener?.("voiceschanged",refreshArabicVoice);
    speechSynthesis.onvoiceschanged=refreshArabicVoice;
  }

  function stageIndex(){return STAGES.indexOf(state.stage)}
  function setStage(stage,{speakText=""}={}){
    state.stage=stage;
    render();
    save();
    window.scrollTo({top:0,behavior:"smooth"});
    if(speakText) setTimeout(()=>speak(speakText),140);
  }

  function progress(){
    const map={intro:0,identify:16,words:33,train:50,joining:68,challenge:84,finish:100};
    return map[state.stage]??0;
  }

  function dots(current,total){
    return '<div class="step-dots">'+Array.from({length:total},(_,i)=>`<i class="${i<current?"done":i===current?"current":""}"></i>`).join("")+'</div>';
  }

  function audioButton(text,label="اسمع"){
    return `<button class="btn soft sound-pill" data-speak="${escapeHTML(text)}">🔊 ${label}</button>`;
  }

  function introView(){
    return `<section class="card lesson-card">
      <span class="eyebrow">الدرس الذهبي</span>
      <div class="hero-letter">م</div>
      <h1 class="hero-title">هذا حرف ميم</h1>
      <p>درس واحد بسيط. نسمع الحرف، نميّزه، نراه في الكلمات، ثم نعرف مكانه واتصاله.</p>
      ${audioButton("هٰذَا حَرْفُ مِيم. مِيم.","اسمع حرف م")}
      <div class="actions"><button class="btn primary full" data-action="begin">ابدأ الدرس</button></div>
    </section>`;
  }

  function identifyView(){
    const choices=IDENTIFY_ROUNDS[state.identifyIndex];
    return `<section class="card lesson-card">
      <span class="eyebrow">١ · أميّز الحرف</span>
      <h2>أين حرف م؟</h2>
      ${audioButton("أَيْنَ حَرْفُ مِيم؟")}
      ${dots(state.identifyIndex,IDENTIFY_ROUNDS.length)}
      <div class="identify-grid">
        ${choices.map(ch=>{
          let cls="letter-choice";
          if(state.identifyAnswered&&ch==="م")cls+=" correct";
          if(state.identifyAnswered&&ch===state.identifyChoice&&ch!=="م")cls+=" wrong";
          return `<button class="${cls}" data-identify="${ch}" ${state.identifyAnswered?"disabled":""}>${ch}</button>`;
        }).join("")}
      </div>
      ${state.identifyAnswered?`<div class="feedback ${state.identifyChoice==="م"?"good":"bad"}">${state.identifyChoice==="م"?"أحسنت! هذا م 🌟":"هذا هو حرف ميم: م"}</div>
      <div class="actions"><button class="btn primary full" data-action="identify-next">${state.identifyIndex===IDENTIFY_ROUNDS.length-1?"شاهد م في الكلمات":"التالي"}</button></div>`:""}
    </section>`;
  }

  function wordsView(){
    const primary=EXAMPLES.slice(0,3);
    return `<section class="card">
      <span class="eyebrow">٢ · م داخل الكلمات</span>
      <h2>الحرف الأحمر هو م</h2>
      <p>اضغط كل كلمة واسمعها. لاحظ أن م ينتقل من البداية إلى الوسط ثم النهاية.</p>
      <div class="words-stack">
        ${primary.map((ex,i)=>`<button class="word-card ${state.visitedWords.has(i)?"visited":""}" data-word="${i}">
          <span class="big-word">${highlightExample(ex)}</span>
          <span class="speaker-dot">🔊</span>
        </button>`).join("")}
      </div>
      <div class="actions"><button class="btn primary full" data-action="words-next" ${state.visitedWords.size<3?"disabled":""}>فهمت — إلى القطار</button></div>
    </section>`;
  }

  function trainMarkup(answered=false,choice=null,answer=null,labels=true){
    const positions=["start","middle","end"];
    const names={start:"البداية",middle:"الوسط",end:"النهاية"};
    return `<div class="train-direction"><span>نبدأ من جهة المحرك</span><b>←</b></div>
      <div class="train">
        <div class="engine" aria-hidden="true"><i class="wheel one"></i><i class="wheel two"></i></div>
        <div class="wagons">
          ${positions.map(pos=>{
            let cls="wagon answerable";
            if(answered&&pos===answer)cls+=" correct";
            if(answered&&pos===choice&&pos!==answer)cls+=" wrong";
            return `<button class="${cls}" data-train="${pos}" ${answered?"disabled":""}>
              <span>•</span><i class="wheel"></i>${labels?`<small class="wagon-label">${names[pos]}</small>`:""}
            </button>`;
          }).join("")}
        </div>
      </div>`;
  }

  function trainView(){
    const ex=EXAMPLES[state.trainIndex];
    return `<section class="card">
      <span class="eyebrow">٣ · قطار الكلمة</span>
      <h2>أين حرف م الأحمر؟</h2>
      ${audioButton(`أَيْنَ حَرْفُ مِيم فِي كَلِمَةِ ${ex.spoken}؟ اِضْغَطِ العَرَبَةَ المُنَاسِبَة.`)}
      ${dots(state.trainIndex,3)}
      <div class="train-word big-word">${highlightExample(ex)}</div>
      <div class="train-hint">اضغط العربة التي تمثل مكان م في الكلمة</div>
      ${trainMarkup(state.trainAnswered,state.trainChoice,ex.position,true)}
      ${state.trainAnswered?`<div class="feedback ${state.trainChoice===ex.position?"good":"bad"}">${state.trainChoice===ex.position?"أحسنت! 🌟":`حرف م في ${ex.label} من كلمة ${ex.word}`}</div>
      <div class="actions"><button class="btn primary full" data-action="train-next">${state.trainIndex===2?"الآن: كيف يتصل م؟":"الكلمة التالية"}</button></div>`:""}
    </section>`;
  }

  const CONNECTION_LABELS={
    isolated:["لوحده","لا يتصل بما قبله أو بعده"],
    next:["يمسك ما بعده","يتصل بالحرف الذي يأتي بعده"],
    both:["يمسك من الجهتين","يتصل بما قبله وما بعده"],
    previous:["يمسك ما قبله","يتصل بالحرف الذي قبله"]
  };

  function connectionLine(stateName){
    const cls=stateName==="both"?"both":stateName==="next"?"right":stateName==="previous"?"left":"";
    return `<div class="connection-line ${cls}"></div>`;
  }

  function joiningView(){
    const order=[3,0,1,2];
    return `<section class="card">
      <span class="eyebrow">٤ · كيف يتصل م؟</span>
      <h2>ننظر إلى م داخل كلمة</h2>
      <p>المكان شيء، والاتصال شيء آخر. اضغط الكلمات لتسمعها ولاحظ شكل م الأحمر.</p>
      <div class="connection-grid">
        ${order.map(idx=>{
          const ex=EXAMPLES[idx],meta=CONNECTION_LABELS[ex.connection];
          return `<button class="connection-card" data-connection-word="${idx}">
            <span class="big-word">${highlightExample(ex)}</span>
            ${connectionLine(ex.connection)}
            <strong>${meta[0]}</strong>
            <small>${meta[1]}</small>
          </button>`;
        }).join("")}
      </div>
      <div class="actions"><button class="btn primary full" data-action="joining-next">ابدأ التحدي ⭐</button></div>
    </section>`;
  }

  function challengeView(){
    const q=CHALLENGE[state.challengeIndex];
    if(q.type==="identify"){
      return challengeShell(q,`<div class="identify-grid challenge-letter-grid">${q.options.map(v=>challengeButton(v,v,"letter")).join("")}</div>`);
    }
    if(q.type==="position"){
      const ex=EXAMPLES[q.example];
      const qq={...q,prompt:`أين م في كلمة ${ex.word}؟`,spoken:`أَيْنَ حَرْفُ مِيم فِي كَلِمَةِ ${ex.spoken}؟`,answer:ex.position};
      return challengeShell(qq,`<div class="train-word big-word">${highlightExample(ex)}</div>${challengeTrain(ex.position)}`);
    }
    if(q.type==="connection"){
      return challengeShell(q,`<div class="challenge-options">${q.options.map(idx=>{
        const ex=EXAMPLES[idx];
        return challengeButton(String(idx),highlightExample(ex),"word",true);
      }).join("")}</div>`);
    }
    return "";
  }

  function challengeButton(value,label,type="text",html=false){
    const q=CHALLENGE[state.challengeIndex];
    const answer=String(q.answer);
    let cls="challenge-option"+(type==="word"?" word-option":type==="letter"?" letter-option":"");
    if(state.challengeAnswered&&String(value)===answer)cls+=" correct";
    if(state.challengeAnswered&&String(value)===String(state.challengeChoice)&&String(value)!==answer)cls+=" wrong";
    return `<button class="${cls}" data-challenge="${escapeHTML(value)}" ${state.challengeAnswered?"disabled":""}>${html?label:escapeHTML(label)}</button>`;
  }

  function challengeTrain(answer){
    const positions=["start","middle","end"];
    return `<div class="train-direction"><span>اختر العربة</span><b>←</b></div><div class="train">
      <div class="engine" aria-hidden="true"><i class="wheel one"></i><i class="wheel two"></i></div>
      <div class="wagons">${positions.map(pos=>{
        let cls="wagon answerable";
        if(state.challengeAnswered&&pos===answer)cls+=" correct";
        if(state.challengeAnswered&&pos===state.challengeChoice&&pos!==answer)cls+=" wrong";
        return `<button class="${cls}" data-challenge="${pos}" ${state.challengeAnswered?"disabled":""}><span>•</span><i class="wheel"></i></button>`;
      }).join("")}</div></div>`;
  }

  function challengeShell(q,body){
    const prompt=q.type==="position"?(q.prompt||""):(q.prompt||"");
    const spoken=q.spoken||prompt;
    return `<section class="card">
      <span class="eyebrow">٥ · تحدي م</span>
      <h2>${prompt}</h2>
      ${audioButton(spoken)}
      ${dots(state.challengeIndex,CHALLENGE.length)}
      ${body}
      ${state.challengeAnswered?`<div class="feedback ${isCurrentChallengeCorrect()?"good":"bad"}">${isCurrentChallengeCorrect()?"أحسنت! 🌟":"جرّب أن تلاحظ الحرف الأحمر ومكانه."}</div>
      <div class="actions"><button class="btn primary full" data-action="challenge-next">${state.challengeIndex===CHALLENGE.length-1?"النتيجة":"السؤال التالي"}</button></div>`:""}
    </section>`;
  }

  function currentChallengeAnswer(){
    const q=CHALLENGE[state.challengeIndex];
    if(q.type==="position")return EXAMPLES[q.example].position;
    return q.answer;
  }
  function isCurrentChallengeCorrect(){return String(state.challengeChoice)===String(currentChallengeAnswer())}

  function finishView(){
    const total=CHALLENGE.length;
    const pct=Math.round(state.challengeScore/total*100);
    return `<section class="card lesson-card">
      <span class="eyebrow">اكتمل الدرس الذهبي</span>
      <div class="finish-star">${pct>=80?"🌟":"🌱"}</div>
      <h1>${pct>=80?"أحسنت في حرف م!":"تقدم جميل في حرف م"}</h1>
      <div class="score">${state.challengeScore} / ${total}</div>
      <p>${pct>=80?"أصبحت النسخة جاهزة لتقييمنا قبل تعميمها على بقية الحروف.":"يمكن إعادة التحدي مرة أخرى قبل تعميم النموذج."}</p>
      <div class="actions">
        <button class="btn primary full" data-action="restart-challenge">أعد التحدي</button>
        <button class="btn" data-action="restart-all">ابدأ درس م من جديد</button>
      </div>
      <p class="mini-note">Hurufi 2 · ${VERSION}</p>
    </section>`;
  }

  function render(){
    document.body.dataset.stage=state.stage;
    progressFill.style.width=progress()+"%";
    backBtn.classList.toggle("hidden",state.stage==="intro");
    if(state.stage==="intro")screen.innerHTML=introView();
    else if(state.stage==="identify")screen.innerHTML=identifyView();
    else if(state.stage==="words")screen.innerHTML=wordsView();
    else if(state.stage==="train")screen.innerHTML=trainView();
    else if(state.stage==="joining")screen.innerHTML=joiningView();
    else if(state.stage==="challenge")screen.innerHTML=challengeView();
    else screen.innerHTML=finishView();
    bind();
  }

  function bind(){
    screen.querySelectorAll("[data-speak]").forEach(btn=>btn.addEventListener("click",()=>speak(btn.dataset.speak)));

    screen.querySelectorAll("[data-identify]").forEach(btn=>btn.addEventListener("click",()=>{
      if(state.identifyAnswered)return;
      state.identifyAnswered=true;state.identifyChoice=btn.dataset.identify;
      if(state.identifyChoice==="م"){state.identifyScore++;celebrate();speak("أَحْسَنْت. هٰذَا حَرْفُ مِيم.");}
      else speak("هٰذَا هُوَ حَرْفُ مِيم.");
      render();save();
    }));

    screen.querySelectorAll("[data-word]").forEach(btn=>btn.addEventListener("click",()=>{
      const idx=Number(btn.dataset.word);state.visitedWords.add(idx);speak(EXAMPLES[idx].spoken,{rate:.62});render();save();
    }));

    screen.querySelectorAll("[data-train]").forEach(btn=>btn.addEventListener("click",()=>{
      if(state.trainAnswered)return;
      const ex=EXAMPLES[state.trainIndex];
      state.trainAnswered=true;state.trainChoice=btn.dataset.train;
      if(state.trainChoice===ex.position){state.trainScore++;celebrate();speak("أحسنت.");}
      else speak(`حرف ميم في ${ex.label}.`);
      render();save();
    }));

    screen.querySelectorAll("[data-connection-word]").forEach(btn=>btn.addEventListener("click",()=>{
      const idx=Number(btn.dataset.connectionWord);const ex=EXAMPLES[idx],meta=CONNECTION_LABELS[ex.connection];
      speak(`${ex.spoken}. حَرْفُ مِيم ${meta[0]}.`,{rate:.62});
    }));

    screen.querySelectorAll("[data-challenge]").forEach(btn=>btn.addEventListener("click",()=>{
      if(state.challengeAnswered)return;
      state.challengeAnswered=true;state.challengeChoice=btn.dataset.challenge;
      if(isCurrentChallengeCorrect()){state.challengeScore++;celebrate();speak("أحسنت.");}
      else speak("حاول أن تلاحظ حرف ميم.");
      render();save();
    }));

    screen.querySelectorAll("[data-action]").forEach(btn=>btn.addEventListener("click",()=>{
      const a=btn.dataset.action;
      if(a==="begin"){resetStageData();setStage("identify",{speakText:"أَيْنَ حَرْفُ مِيم؟"});}
      if(a==="identify-next"){
        if(state.identifyIndex<IDENTIFY_ROUNDS.length-1){state.identifyIndex++;state.identifyAnswered=false;state.identifyChoice=null;render();save();setTimeout(()=>speak("أَيْنَ حَرْفُ مِيم؟"),120);}
        else setStage("words",{speakText:"اضغط الكلمات واسمعها. الحرف الأحمر هو حرف ميم."});
      }
      if(a==="words-next")setStage("train",{speakText:"أين حرف ميم الأحمر؟ اضغط العربة المناسبة."});
      if(a==="train-next"){
        if(state.trainIndex<2){state.trainIndex++;state.trainAnswered=false;state.trainChoice=null;render();save();setTimeout(()=>speak(`أَيْنَ حَرْفُ مِيم فِي كَلِمَةِ ${EXAMPLES[state.trainIndex].spoken}؟`),120);}
        else setStage("joining",{speakText:"الآن نرى كيف يتصل حرف ميم داخل الكلمات."});
      }
      if(a==="joining-next"){state.challengeIndex=0;state.challengeScore=0;state.challengeAnswered=false;state.challengeChoice=null;setStage("challenge",{speakText:CHALLENGE[0].spoken});}
      if(a==="challenge-next"){
        if(state.challengeIndex<CHALLENGE.length-1){state.challengeIndex++;state.challengeAnswered=false;state.challengeChoice=null;render();save();const q=CHALLENGE[state.challengeIndex];setTimeout(()=>speak(q.type==="position"?`أَيْنَ حَرْفُ مِيم فِي كَلِمَةِ ${EXAMPLES[q.example].spoken}؟`:q.spoken),120);}
        else{setStage("finish");celebrate();}
      }
      if(a==="restart-challenge"){state.challengeIndex=0;state.challengeScore=0;state.challengeAnswered=false;state.challengeChoice=null;setStage("challenge",{speakText:CHALLENGE[0].spoken});}
      if(a==="restart-all"){localStorage.removeItem(STORAGE_KEY);location.reload();}
    }));
  }

  function resetStageData(){
    state.identifyIndex=0;state.identifyScore=0;state.identifyAnswered=false;state.identifyChoice=null;
    state.visitedWords=new Set();state.trainIndex=0;state.trainScore=0;state.trainAnswered=false;state.trainChoice=null;
  }

  function goBack(){
    const map={identify:"intro",words:"identify",train:"words",joining:"train",challenge:"joining",finish:"challenge"};
    const target=map[state.stage];
    if(target)setStage(target);
  }

  function celebrate(){
    const layer=document.getElementById("celebration");
    for(let i=0;i<13;i++){
      const el=document.createElement("span");el.className="confetti";el.textContent=["★","●","✦","◆"][i%4];
      el.style.left=(8+Math.random()*84)+"%";el.style.animationDelay=(Math.random()*.14)+"s";layer.appendChild(el);
      setTimeout(()=>el.remove(),1700);
    }
  }

  function save(){
    try{
      localStorage.setItem(STORAGE_KEY,JSON.stringify({
        stage:state.stage,identifyIndex:state.identifyIndex,identifyScore:state.identifyScore,
        visitedWords:[...state.visitedWords],trainIndex:state.trainIndex,trainScore:state.trainScore,
        challengeIndex:state.challengeIndex,challengeScore:state.challengeScore
      }));
    }catch{}
  }

  function restore(){
    try{
      const p=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
      if(!p||!STAGES.includes(p.stage)||p.stage==="finish")return;
      state.stage=p.stage;
      state.identifyIndex=Math.max(0,Math.min(IDENTIFY_ROUNDS.length-1,Number(p.identifyIndex)||0));
      state.identifyScore=Number(p.identifyScore)||0;
      state.visitedWords=new Set(Array.isArray(p.visitedWords)?p.visitedWords:[]);
      state.trainIndex=Math.max(0,Math.min(2,Number(p.trainIndex)||0));
      state.trainScore=Number(p.trainScore)||0;
      state.challengeIndex=Math.max(0,Math.min(CHALLENGE.length-1,Number(p.challengeIndex)||0));
      state.challengeScore=Number(p.challengeScore)||0;
    }catch{}
  }

  if(settingsBtn&&settingsPanel){
    settingsBtn.addEventListener("click",()=>{
      settingsPanel.hidden=false;
      markActiveFont(state.learningFont);
      setFontStatus("");
    });
    settingsClose?.addEventListener("click",()=>{settingsPanel.hidden=true;});
    settingsPanel.addEventListener("click",e=>{
      if(e.target===settingsPanel)settingsPanel.hidden=true;
    });
    settingsPanel.querySelectorAll("[data-font]").forEach(btn=>{
      btn.addEventListener("click",async()=>{
        const ok=await applyLearningFont(btn.dataset.font,{persist:true,showStatus:true});
        if(ok)setTimeout(()=>{settingsPanel.hidden=true;},360);
      });
    });
  }

  backBtn.addEventListener("click",goBack);
  soundBtn.addEventListener("click",()=>{
    state.sound=!state.sound;
    soundBtn.textContent=state.sound?"🔊":"🔇";
    if(!state.sound&&"speechSynthesis" in window)speechSynthesis.cancel();
  });

  function versionParts(v){
    const m=String(v).match(/^(\d+)\.(\d+)\.(\d+)(?:-alpha\.(\d+))?$/);
    if(!m)return [0,0,0,0];
    return [Number(m[1]),Number(m[2]),Number(m[3]),m[4]===undefined?999:Number(m[4])];
  }

  function compareVersions(a,b){
    const A=versionParts(a),B=versionParts(b);
    for(let i=0;i<A.length;i++){
      if(A[i]>B[i])return 1;
      if(A[i]<B[i])return -1;
    }
    return 0;
  }

  async function fetchPublishedVersion(){
    try{
      const r=await fetch("./version.js?check="+Date.now(),{cache:"no-store",headers:{"cache-control":"no-cache"}});
      if(!r.ok)return null;
      const text=await r.text();
      return text.match(/APP_VERSION=['"]([^'"]+)['"]/)?.[1]||null;
    }catch{return null;}
  }

  function setUpdateUI(message,progress=20,title="يوجد تحديث جديد"){
    if(!updateBar)return;
    updateBar.hidden=false;
    if(updateTitle)updateTitle.textContent=title;
    if(updateStatus)updateStatus.textContent=message;
    if(updateProgressFill)updateProgressFill.style.width=Math.max(0,Math.min(100,progress))+"%";
  }

  async function setupAppUpdates(){
    if(appVersionEl)appVersionEl.textContent=VERSION;
    if(!("serviceWorker" in navigator))return;

    let reloading=false;

    const attach=reg=>{
      if(reg.waiting)reg.waiting.postMessage({type:"SKIP_WAITING"});
      reg.addEventListener("updatefound",()=>{
        const worker=reg.installing;
        if(!worker)return;
        setUpdateUI("جارٍ تنزيل النسخة الجديدة…",45);
        worker.addEventListener("statechange",()=>{
          if(worker.state==="installed"){
            setUpdateUI("تم تنزيل التحديث…",78);
            if(reg.waiting)reg.waiting.postMessage({type:"SKIP_WAITING"});
          }
        });
      });
    };

    navigator.serviceWorker.addEventListener("controllerchange",()=>{
      if(reloading)return;
      reloading=true;
      setUpdateUI("اكتمل التحديث. جارٍ إعادة التشغيل…",100,"تم التحديث");
      setTimeout(()=>{
        const url=new URL(location.href);
        url.searchParams.set("v",Date.now().toString());
        location.replace(url.toString());
      },500);
    });

    const register=async(version=VERSION)=>{
      try{
        const reg=await navigator.serviceWorker.register("./sw.js?v="+encodeURIComponent(version),{scope:"./",updateViaCache:"none"});
        attach(reg);
        await reg.update();
        return reg;
      }catch{return null;}
    };

    const check=async()=>{
      const latest=await fetchPublishedVersion();
      if(!latest)return;
      if(compareVersions(latest,VERSION)>0){
        setUpdateUI("تم العثور على إصدار "+latest+"…",25);
        const reg=await register(latest);
        if(reg?.waiting)reg.waiting.postMessage({type:"SKIP_WAITING"});
      }
    };

    await register(VERSION);
    setTimeout(check,700);
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")check();});
    window.addEventListener("online",check);
    setInterval(check,30*60*1000);
  }

  try{
    validateContent();
    restore();
    void applyLearningFont(state.learningFont,{persist:false,showStatus:false});
    render();
  }catch(err){
    console.error(err);
    screen.innerHTML='<section class="card lesson-card"><h2>تعذر تحميل الدرس</h2><p>اكتشف النظام خطأ في بيانات المحتوى ومنع عرضه حتى لا يتعلم الطفل معلومة غير صحيحة.</p></section>';
  }

  window.addEventListener("load",()=>{void setupAppUpdates();});
})();