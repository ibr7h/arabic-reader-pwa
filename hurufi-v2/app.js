(() => {
  "use strict";

  const VERSION="2.0.0-alpha.9";
  const TARGET="م";
  const TARGET_SPOKEN="مِيمْ";
  const SUCCESS_SPOKEN="أَحْسَنْتَ";
  const STORAGE_KEY="hurufi-v2:golden-meem";
  const SLOT_HISTORY_KEY="hurufi-v2:answer-slot-history";
  const FONT_KEY="hurufi-v2:learning-font";
  const VOICE_KEY="hurufi-v2:voice";
  const FONT_OPTIONS=["school","scheherazade","harmattan","sans","kufi","baloo","cairo","readex","geeza"];
  const FONT_FAMILIES={
    school:"Hurufi Naskh",
    scheherazade:"Hurufi Scheherazade",
    harmattan:"Hurufi Harmattan",
    sans:"Hurufi Noto Sans Arabic",
    kufi:"Hurufi Noto Kufi",
    baloo:"Hurufi Baloo",
    cairo:"Hurufi Cairo",
    readex:"Hurufi Readex",
    geeza:"Geeza Pro"
  };
  const WEB_FONTS=new Set(["school","scheherazade","harmattan","sans","kufi","baloo","cairo","readex"]);

  const EXAMPLES=[
    {word:"موز", spoken:"مَوْز", pause:"مَوْزْ", finalSound:"زْ", targetIndex:0, position:"start", connection:"next", label:"البداية"},
    {word:"قمر", spoken:"قَمَر", pause:"قَمَرْ", finalSound:"رْ", targetIndex:1, position:"middle", connection:"both", label:"الوسط"},
    {word:"علم", spoken:"عَلَم", pause:"عَلَمْ", finalSound:"مْ", targetIndex:2, position:"end", connection:"previous", label:"النهاية"},
    {word:"نجوم", spoken:"نُجُوم", pause:"نُجُومْ", finalSound:"مْ", targetIndex:3, position:"end", connection:"isolated", label:"منفصل في النهاية"}
  ];

  const TRAIN_WORD_BANK={
    start:[
      {word:"ملك",spoken:"مَلَك",pause:"مَلَكْ",targetIndex:0,position:"start",label:"البداية"},
      {word:"مسك",spoken:"مِسْك",pause:"مِسْكْ",targetIndex:0,position:"start",label:"البداية"},
      {word:"مرح",spoken:"مَرَح",pause:"مَرَحْ",targetIndex:0,position:"start",label:"البداية"}
    ],
    middle:[
      {word:"رمل",spoken:"رَمْل",pause:"رَمْلْ",targetIndex:1,position:"middle",label:"الوسط"},
      {word:"حمد",spoken:"حَمْد",pause:"حَمْدْ",targetIndex:1,position:"middle",label:"الوسط"},
      {word:"سمن",spoken:"سَمْن",pause:"سَمْنْ",targetIndex:1,position:"middle",label:"الوسط"}
    ],
    end:[
      {word:"قلم",spoken:"قَلَم",pause:"قَلَمْ",targetIndex:2,position:"end",label:"النهاية"},
      {word:"نجم",spoken:"نَجْم",pause:"نَجْمْ",targetIndex:2,position:"end",label:"النهاية"},
      {word:"لحم",spoken:"لَحْم",pause:"لَحْمْ",targetIndex:2,position:"end",label:"النهاية"}
    ]
  };

  const IDENTIFY_ROUNDS=[
    ["م","هـ","ن","ب"],
    ["و","م","ف","ق"],
    ["ن","س","م","ه"]
  ];

  const CHALLENGE=[
    {type:"identify", prompt:"أين حرف م؟", spoken:"أَيْنَ حَرْفُ مِيمْ؟", options:["ن","م","هـ","ب"], answer:"م"},
    {type:"position", example:0},
    {type:"position", example:1},
    {type:"position", example:2},
    {type:"connection", prompt:"أي كلمة فيها م متصل من الجهتين؟", spoken:"أَيُّ كَلِمَةٍ فِيهَا حَرْفُ مِيمْ مُتَّصِلٌ مِنَ الجِهَتَيْنِ؟", options:[0,1,2], answer:1}
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
  const voiceSelect=document.getElementById("voiceSelect");
  const voiceTest=document.getElementById("voiceTest");

  const state={
    stage:"intro",
    sound:true,
    learningFont:loadLearningFont(),
    identifyIndex:0,
    identifyScore:0,
    identifyAnswered:false,
    identifyChoice:null,
    identifyOrder:null,
    challengeOrder:null,
    lastAnswerIndex:loadAnswerSlotHistory(),
    visitedWords:new Set(),
    trainIndex:0,
    trainScore:0,
    trainAnswered:false,
    trainChoice:null,
    trainRound:createTrainRound(),
    challengeIndex:0,
    challengeScore:0,
    challengeAnswered:false,
    challengeChoice:null
  };

  function loadAnswerSlotHistory(){
    try{
      const saved=JSON.parse(localStorage.getItem(SLOT_HISTORY_KEY)||"{}");
      return saved&&typeof saved==="object"&&!Array.isArray(saved)?saved:{};
    }catch{return {};}
  }

  function saveAnswerSlotHistory(){
    try{localStorage.setItem(SLOT_HISTORY_KEY,JSON.stringify(state.lastAnswerIndex));}catch{}
  }

  function shuffledCopy(values){
    const arr=[...values];
    for(let i=arr.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    return arr;
  }

  function createTrainRound(){
    const selected=["start","middle","end"].map(position=>{
      const pool=TRAIN_WORD_BANK[position];
      return {...pool[Math.floor(Math.random()*pool.length)]};
    });
    return shuffledCopy(selected);
  }

  function trainWordTiles(example){
    const chars=[...example.word];
    return `<div class="train-letter-strip" aria-label="${escapeHTML(example.word)}">
      ${chars.map((ch,index)=>`<span class="train-letter-tile ${index===example.targetIndex?"target-letter":""}">${escapeHTML(ch)}</span>`).join("")}
    </div>`;
  }

  function shuffledWithMovedAnswer(values,answer,key){
    const source=[...values];
    if(source.length<2)return source;

    const previous=state.lastAnswerIndex[key];
    let result=shuffledCopy(source);
    let tries=0;

    while(
      previous!==undefined &&
      result.findIndex(v=>String(v)===String(answer))===previous &&
      tries<12
    ){
      result=shuffledCopy(source);
      tries++;
    }

    const current=result.findIndex(v=>String(v)===String(answer));
    if(current>=0){
      state.lastAnswerIndex[key]=current;
      saveAnswerSlotHistory();
    }
    return result;
  }

  function identifyOptions(){
    if(!Array.isArray(state.identifyOrder)){
      const base=IDENTIFY_ROUNDS[state.identifyIndex];
      state.identifyOrder=shuffledWithMovedAnswer(base,"م","identify-"+state.identifyIndex);
    }
    return state.identifyOrder;
  }

  function challengeOptions(q){
    if(!Array.isArray(q.options))return [];
    if(!Array.isArray(state.challengeOrder)){
      state.challengeOrder=shuffledWithMovedAnswer(
        q.options,
        q.answer,
        "challenge-"+state.challengeIndex
      );
    }
    return state.challengeOrder;
  }

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
    Object.entries(TRAIN_WORD_BANK).forEach(([position,words])=>{
      words.forEach((ex,i)=>{
        const chars=[...ex.word];
        if(chars.length!==3) errors.push(`Train ${position} ${i}: word must have exactly 3 letters`);
        if(chars[ex.targetIndex]!==TARGET) errors.push(`Train ${position} ${i}: targetIndex does not point to م`);
        const actualPos=derivedPosition(chars,ex.targetIndex);
        if(actualPos!==position||actualPos!==ex.position) errors.push(`Train ${position} ${i}: position mismatch`);
      });
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
  let selectedVoiceId=loadVoicePreference();
  let speechGeneration=0;

  function loadVoicePreference(){
    try{return localStorage.getItem(VOICE_KEY)||"";}catch{return "";}
  }

  function voiceId(voice){
    return ((voice?.voiceURI||voice?.name||"")+"@@"+(voice?.lang||""));
  }

  function scoreArabicVoice(voice){
    if(!voice || !/^ar/i.test(voice.lang||"")) return -1;
    let score=0;
    const lang=(voice.lang||"").toLowerCase();
    const name=(voice.name||"").toLowerCase();
    if(lang==="ar-sa") score+=120;
    else if(lang.startsWith("ar-")) score+=85;
    else score+=55;
    if(voice.localService) score+=18;
    if(/majed|maged|tarik|laila|hoda|hameed|arabic|saudi/.test(name)) score+=10;
    if(/enhanced|premium|neural/.test(name)) score+=12;
    if(voice.default) score+=3;
    return score;
  }

  function availableArabicVoices(){
    if(!("speechSynthesis" in window)) return [];
    return speechSynthesis.getVoices()
      .filter(v=>/^ar/i.test(v.lang||""))
      .sort((a,b)=>scoreArabicVoice(b)-scoreArabicVoice(a));
  }

  function populateVoiceSelect(voices){
    if(!voiceSelect) return;
    const automatic='<option value="">اختيار تلقائي — أفضل صوت متاح</option>';
    voiceSelect.innerHTML=automatic+voices.map(v=>{
      const id=voiceId(v);
      const label=(v.name||"صوت عربي")+" · "+(v.lang||"ar")+(v.localService?" · على الجهاز":"");
      return '<option value="'+escapeHTML(id)+'">'+escapeHTML(label)+'</option>';
    }).join("");
    voiceSelect.value=selectedVoiceId && voices.some(v=>voiceId(v)===selectedVoiceId)?selectedVoiceId:"";
  }

  function refreshArabicVoice(){
    if(!("speechSynthesis" in window)) return;
    const voices=availableArabicVoices();
    const selected=selectedVoiceId?voices.find(v=>voiceId(v)===selectedVoiceId):null;
    preferredArabicVoice=selected||voices[0]||null;
    populateVoiceSelect(voices);
  }

  function stopSpeech(){
    speechGeneration++;
    try{speechSynthesis.cancel();}catch{}
  }

  function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms));}

  function utteranceDurationGuard(text,rate){
    const chars=Math.max(1,[...String(text)].length);
    return Math.min(9000,Math.max(1800,(chars/Math.max(.35,rate))*115));
  }

  function speakPart(part,generation){
    return new Promise(resolve=>{
      if(generation!==speechGeneration || !state.sound || !("speechSynthesis" in window)){resolve();return;}
      const text=String(part.text||"").trim();
      if(!text){resolve();return;}
      const u=new SpeechSynthesisUtterance(text);
      u.lang=preferredArabicVoice?.lang||"ar-SA";
      u.rate=part.rate??.7;
      u.pitch=part.pitch??1;
      u.volume=1;
      if(preferredArabicVoice)u.voice=preferredArabicVoice;

      let finished=false;
      const done=()=>{
        if(finished)return;
        finished=true;
        clearTimeout(timer);
        resolve();
      };
      u.onend=done;
      u.onerror=done;
      const timer=setTimeout(done,utteranceDurationGuard(text,u.rate));
      try{speechSynthesis.speak(u);}catch{done();}
    });
  }

  async function speakSequence(parts){
    if(!state.sound || !("speechSynthesis" in window)) return;
    if(!preferredArabicVoice)refreshArabicVoice();
    const generation=++speechGeneration;
    try{speechSynthesis.cancel();}catch{}
    await wait(45);
    for(const part of parts){
      if(generation!==speechGeneration)return;
      await speakPart(part,generation);
      if(generation!==speechGeneration)return;
      if(part.pauseAfter)await wait(part.pauseAfter);
    }
  }

  function speakWord(example){
    return speakSequence([
      {text:example.pause,rate:.54,pitch:1,pauseAfter:80}
    ]);
  }

  function speakLetterName(){
    return speakSequence([{text:TARGET_SPOKEN,rate:.56,pauseAfter:60}]);
  }

  function speakPositionPrompt(example,{withInstruction=true}={}){
    const parts=[
      {text:"أَيْنَ حَرْفُ مِيمْ؟",rate:.68,pauseAfter:150},
      {text:example.pause,rate:.54,pauseAfter:130}
    ];
    if(withInstruction)parts.push({text:"اِضْغَطِ العَرَبَةَ المُنَاسِبَة.",rate:.68});
    return speakSequence(parts);
  }

  function speakWordAndConnection(example,label){
    return speakSequence([
      {text:example.pause,rate:.54,pauseAfter:150},
      {text:"حَرْفُ مِيمْ. "+label+".",rate:.66}
    ]);
  }

  function speak(text,{rate=.68}={}){
    if(!state.sound || !("speechSynthesis" in window)) return;
    const raw=String(text||"").trim();
    const example=EXAMPLES.find(ex=>raw.includes(ex.spoken)||raw.includes(ex.pause));
    if(example){
      if(raw===example.spoken||raw===example.pause)return speakWord(example);
      const token=raw.includes(example.pause)?example.pause:example.spoken;
      const parts=raw.split(token);
      const sequence=[];
      const before=(parts[0]||"").trim().replace(/[،,:؛\-–—]+$/,"");
      const after=(parts.slice(1).join(token)||"").trim().replace(/^[؟?!،,:؛\s]+/,"");
      if(before)sequence.push({text:before,rate:Math.max(.64,rate),pauseAfter:130});
      sequence.push({text:example.pause,rate:.54,pauseAfter:130});
      if(after)sequence.push({text:after,rate:Math.max(.64,rate)});
      return speakSequence(sequence);
    }
    return speakSequence([{text:raw,rate}]);
  }

  if("speechSynthesis" in window){
    refreshArabicVoice();
    speechSynthesis.addEventListener?.("voiceschanged",refreshArabicVoice);
    speechSynthesis.onvoiceschanged=refreshArabicVoice;
    setTimeout(refreshArabicVoice,250);
    setTimeout(refreshArabicVoice,1200);
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
      ${audioButton("هٰذَا حَرْفُ مِيمْ. مِيمْ.","اسمع حرف م")}
      <div class="actions"><button class="btn primary full" data-action="begin">ابدأ الدرس</button></div>
    </section>`;
  }

  function identifyView(){
    const choices=identifyOptions();
    return `<section class="card lesson-card">
      <span class="eyebrow">١ · أميّز الحرف</span>
      <h2>أين حرف م؟</h2>
      ${audioButton("أَيْنَ حَرْفُ مِيمْ؟")}
      ${dots(state.identifyIndex,IDENTIFY_ROUNDS.length)}
      <div class="identify-grid">
        ${choices.map(ch=>{
          let cls="letter-choice";
          if(state.identifyAnswered&&ch==="م")cls+=" correct";
          if(state.identifyAnswered&&ch===state.identifyChoice&&ch!=="م")cls+=" wrong";
          return `<button class="${cls}" data-identify="${ch}" ${state.identifyAnswered?"disabled":""}>${ch}</button>`;
        }).join("")}
      </div>
      ${state.identifyAnswered?`<div class="feedback ${state.identifyChoice==="م"?"good":"bad"}">${state.identifyChoice==="م"?"أَحْسَنْتَ! هذا م 🌟":"هذا هو حرف ميم: م"}</div>
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

  function trainMarkup(example,answered=false,choice=null,answer=null,labels=true){
    const positions=["start","middle","end"];
    const names={start:"البداية",middle:"الوسط",end:"النهاية"};
    const chars=[...example.word];
    return `<div class="train-direction"><span>نبدأ من جهة المحرك</span><b>←</b></div>
      <div class="train ${answered?"train-filled":""}">
        <div class="engine" aria-hidden="true"><i class="wheel one"></i><i class="wheel two"></i></div>
        <div class="wagons">
          ${positions.map((pos,index)=>{
            let cls="wagon answerable";
            if(answered&&pos===answer)cls+=" correct";
            if(answered&&pos===choice&&pos!==answer)cls+=" wrong";
            const letter=answered?chars[index]:"•";
            const targetClass=answered&&index===example.targetIndex?" wagon-target":"";
            return `<button class="${cls}" data-train="${pos}" ${answered?"disabled":""}>
              <span class="wagon-content${targetClass}">${escapeHTML(letter)}</span>
              <i class="wheel"></i>
              ${labels?`<small class="wagon-label">${names[pos]}</small>`:""}
            </button>`;
          }).join("")}
        </div>
      </div>`;
  }

  function trainView(){
    const ex=state.trainRound[state.trainIndex];
    return `<section class="card">
      <span class="eyebrow">٣ · قطار الكلمة</span>
      <h2>أين حرف م الأحمر؟</h2>
      ${audioButton(`أَيْنَ حَرْفُ مِيمْ؟ ${ex.spoken}`)}
      ${dots(state.trainIndex,state.trainRound.length)}
      ${trainWordTiles(ex)}
      <div class="train-hint">${state.trainAnswered?"شاهد كيف توزعت حروف الكلمة على العربات":"اختر العربة التي تمثل مكان حرف م"}</div>
      ${trainMarkup(ex,state.trainAnswered,state.trainChoice,ex.position,true)}
      ${state.trainAnswered?`<div class="feedback ${state.trainChoice===ex.position?"good":"bad"}">${state.trainChoice===ex.position?"أَحْسَنْتَ! 🌟":`حرف م في ${ex.label} من كلمة ${ex.word}`}</div>
      <div class="actions"><button class="btn primary full" data-action="train-next">${state.trainIndex===state.trainRound.length-1?"الآن: كيف يتصل م؟":"كلمة جديدة"}</button></div>`:""}
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
      return challengeShell(q,`<div class="identify-grid challenge-letter-grid">${challengeOptions(q).map(v=>challengeButton(v,v,"letter")).join("")}</div>`);
    }
    if(q.type==="position"){
      const ex=EXAMPLES[q.example];
      const qq={...q,prompt:`أين م في كلمة ${ex.word}؟`,spoken:`أَيْنَ حَرْفُ مِيمْ؟ ${ex.spoken}`,answer:ex.position};
      return challengeShell(qq,`<div class="train-word big-word">${highlightExample(ex)}</div>${challengeTrain(ex.position)}`);
    }
    if(q.type==="connection"){
      return challengeShell(q,`<div class="challenge-options">${challengeOptions(q).map(idx=>{
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
      ${state.challengeAnswered?`<div class="feedback ${isCurrentChallengeCorrect()?"good":"bad"}">${isCurrentChallengeCorrect()?"أَحْسَنْتَ! 🌟":"جرّب أن تلاحظ الحرف الأحمر ومكانه."}</div>
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
      <h1>${pct>=80?"أَحْسَنْتَ في حرف م!":"تقدم جميل في حرف م"}</h1>
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
      if(state.identifyChoice==="م"){state.identifyScore++;celebrate();speak(SUCCESS_SPOKEN+". هٰذَا حَرْفُ مِيمْ.");}
      else speak("هٰذَا هُوَ حَرْفُ مِيمْ.");
      render();save();
    }));

    screen.querySelectorAll("[data-word]").forEach(btn=>btn.addEventListener("click",()=>{
      const idx=Number(btn.dataset.word);state.visitedWords.add(idx);speakWord(EXAMPLES[idx]);render();save();
    }));

    screen.querySelectorAll("[data-train]").forEach(btn=>btn.addEventListener("click",()=>{
      if(state.trainAnswered)return;
      const ex=state.trainRound[state.trainIndex];
      state.trainAnswered=true;state.trainChoice=btn.dataset.train;
      if(state.trainChoice===ex.position){state.trainScore++;celebrate();speak(SUCCESS_SPOKEN+".");}
      else speak(`حرف ميم في ${ex.label}.`);
      render();save();
    }));

    screen.querySelectorAll("[data-connection-word]").forEach(btn=>btn.addEventListener("click",()=>{
      const idx=Number(btn.dataset.connectionWord);const ex=EXAMPLES[idx],meta=CONNECTION_LABELS[ex.connection];
      speakWordAndConnection(ex,meta[0]);
    }));

    screen.querySelectorAll("[data-challenge]").forEach(btn=>btn.addEventListener("click",()=>{
      if(state.challengeAnswered)return;
      state.challengeAnswered=true;state.challengeChoice=btn.dataset.challenge;
      if(isCurrentChallengeCorrect()){state.challengeScore++;celebrate();speak(SUCCESS_SPOKEN+".");}
      else speak("حاول أن تلاحظ حرف ميم.");
      render();save();
    }));

    screen.querySelectorAll("[data-action]").forEach(btn=>btn.addEventListener("click",()=>{
      const a=btn.dataset.action;
      if(a==="begin"){resetStageData();setStage("identify",{speakText:"أَيْنَ حَرْفُ مِيمْ؟"});}
      if(a==="identify-next"){
        if(state.identifyIndex<IDENTIFY_ROUNDS.length-1){state.identifyIndex++;state.identifyAnswered=false;state.identifyChoice=null;state.identifyOrder=null;render();save();setTimeout(()=>speak("أَيْنَ حَرْفُ مِيمْ؟"),120);}
        else setStage("words",{speakText:"اضغط الكلمات واسمعها. الحرف الأحمر هو حرف ميم."});
      }
      if(a==="words-next"){
        state.trainRound=createTrainRound();
        state.trainIndex=0;state.trainScore=0;state.trainAnswered=false;state.trainChoice=null;
        setStage("train");
        setTimeout(()=>speakPositionPrompt(state.trainRound[0],{withInstruction:true}),120);
      }
      if(a==="train-next"){
        if(state.trainIndex<state.trainRound.length-1){state.trainIndex++;state.trainAnswered=false;state.trainChoice=null;render();save();setTimeout(()=>speakPositionPrompt(state.trainRound[state.trainIndex],{withInstruction:true}),120);}
        else setStage("joining",{speakText:"الآن نرى كيف يتصل حرف ميم داخل الكلمات."});
      }
      if(a==="joining-next"){state.challengeIndex=0;state.challengeScore=0;state.challengeAnswered=false;state.challengeChoice=null;state.challengeOrder=null;setStage("challenge",{speakText:CHALLENGE[0].spoken});}
      if(a==="challenge-next"){
        if(state.challengeIndex<CHALLENGE.length-1){state.challengeIndex++;state.challengeAnswered=false;state.challengeChoice=null;state.challengeOrder=null;render();save();const q=CHALLENGE[state.challengeIndex];setTimeout(()=>{if(q.type==="position")speakPositionPrompt(EXAMPLES[q.example],{withInstruction:false});else speak(q.spoken);},120);}
        else{setStage("finish");celebrate();}
      }
      if(a==="restart-challenge"){state.challengeIndex=0;state.challengeScore=0;state.challengeAnswered=false;state.challengeChoice=null;state.challengeOrder=null;setStage("challenge",{speakText:CHALLENGE[0].spoken});}
      if(a==="restart-all"){localStorage.removeItem(STORAGE_KEY);location.reload();}
    }));
  }

  function resetStageData(){
    state.identifyIndex=0;state.identifyScore=0;state.identifyAnswered=false;state.identifyChoice=null;state.identifyOrder=null;
    state.visitedWords=new Set();state.trainIndex=0;state.trainScore=0;state.trainAnswered=false;state.trainChoice=null;state.trainRound=createTrainRound();
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
        visitedWords:[...state.visitedWords],trainIndex:state.trainIndex,trainScore:state.trainScore,trainRound:state.trainRound,
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
      state.trainRound=Array.isArray(p.trainRound)&&p.trainRound.length===3?p.trainRound:createTrainRound();
      state.challengeIndex=Math.max(0,Math.min(CHALLENGE.length-1,Number(p.challengeIndex)||0));
      state.challengeScore=Number(p.challengeScore)||0;
      state.identifyOrder=null;
      state.challengeOrder=null;
    }catch{}
  }

  if(settingsBtn&&settingsPanel){
    settingsBtn.addEventListener("click",()=>{
      settingsPanel.hidden=false;
      markActiveFont(state.learningFont);
      refreshArabicVoice();
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

  if(voiceSelect){
    voiceSelect.addEventListener("change",()=>{
      selectedVoiceId=voiceSelect.value||"";
      try{
        if(selectedVoiceId)localStorage.setItem(VOICE_KEY,selectedVoiceId);
        else localStorage.removeItem(VOICE_KEY);
      }catch{}
      refreshArabicVoice();
      stopSpeech();
      setTimeout(()=>speakSequence([
        {text:TARGET_SPOKEN,rate:.56,pauseAfter:130},
        {text:EXAMPLES[0].pause,rate:.54}
      ]),70);
    });
  }

  if(voiceTest){
    voiceTest.addEventListener("click",()=>{
      speakSequence([
        {text:TARGET_SPOKEN,rate:.56,pauseAfter:150},
        {text:EXAMPLES[0].pause,rate:.54,pauseAfter:150},
        {text:EXAMPLES[2].pause,rate:.54}
      ]);
    });
  }

  backBtn.addEventListener("click",goBack);
  soundBtn.addEventListener("click",()=>{
    state.sound=!state.sound;
    soundBtn.textContent=state.sound?"🔊":"🔇";
    if(!state.sound&&"speechSynthesis" in window)stopSpeech();
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