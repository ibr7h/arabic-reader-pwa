(() => {
  "use strict";

  const VERSION="2.0.0-alpha.11";
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

  const SHORT_VOWELS=[
    {id:"fatha",glyph:"مَ",name:"الفتحة",spoken:"مَ",color:"coral"},
    {id:"kasra",glyph:"مِ",name:"الكسرة",spoken:"مِ",color:"violet"},
    {id:"damma",glyph:"مُ",name:"الضمة",spoken:"مُ",color:"sky"}
  ];

  const MADD_FORMS=[
    {id:"alif",short:"مَ",glyph:"مَا",name:"مدّ بالألف",spoken:"مَا",letter:"ا",color:"coral"},
    {id:"yaa",short:"مِ",glyph:"مِي",name:"مدّ بالياء",spoken:"مِي",letter:"ي",color:"violet"},
    {id:"waw",short:"مُ",glyph:"مُو",name:"مدّ بالواو",spoken:"مُو",letter:"و",color:"sky"}
  ];

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
    {type:"connection", prompt:"أي كلمة فيها م متصل من الجهتين؟", spoken:"أَيُّ كَلِمَةٍ فِيهَا حَرْفُ مِيمْ مُتَّصِلٌ مِنَ الجِهَتَيْنِ؟", options:[0,1,2], answer:1},
    {type:"sound", soundKind:"vowel", prompt:"أي صوت سمعت؟", spoken:"مِ", options:["مَ","مِ","مُ"], answer:"مِ"},
    {type:"sound", soundKind:"madd", prompt:"أي مدّ سمعت؟", spoken:"مُو", options:["مَا","مِي","مُو"], answer:"مُو"}
  ];

  const PRACTICE_LEVELS=[
    {id:1,title:"أبدأ بثقة",icon:"🌱",count:6,threshold:80,description:"تمييز حرف م والحركات بصريًا."},
    {id:2,title:"أسمع وأختار",icon:"👂",count:8,threshold:80,description:"تمييز الحركات والمدود من الصوت."},
    {id:3,title:"قصير أم طويل؟",icon:"🎵",count:8,threshold:80,description:"مقارنة الحركة القصيرة بالمد وربطهما."},
    {id:4,title:"أخلط المهارات",icon:"🧩",count:10,threshold:80,description:"الموقع والاتصال والحركات والمدود معًا."},
    {id:5,title:"اختبار الإتقان",icon:"🏆",count:15,threshold:85,description:"اختبار شامل متغير بلا ترتيب محفوظ."}
  ];

  const STAGES=["intro","identify","words","train","joining","vowels","madd","practice","finish"];
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
    visitedVowels:new Set(),
    visitedMadd:new Set(),
    practiceMode:"hub",
    practiceLevel:1,
    practiceUnlocked:1,
    practiceResults:{},
    practiceQueue:[],
    practiceIndex:0,
    practiceScore:0,
    practiceAnswered:false,
    practiceChoice:null,
    practiceBaseCount:0,
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
    const map={intro:0,identify:11,words:22,train:34,joining:46,vowels:58,madd:70,practice:86,finish:100};
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
      <p>درس واحد بسيط. نسمع الحرف، نميّزه، نراه في الكلمات، ثم نعرف مكانه واتصاله وحركاته ومدوده.</p>
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
      <div class="actions"><button class="btn primary full" data-action="joining-next">التالي: حركات م</button></div>
    </section>`;
  }

  function vowelView(){
    return `<section class="card sound-learning-card">
      <span class="eyebrow">٥ · الحركات القصيرة</span>
      <h2>كيف يتغير صوت م؟</h2>
      <p>اضغط كل بطاقة واسمع الصوت القصير. الحركة تغيّر صوت الحرف، لكنها لا تضيف حرفًا جديدًا.</p>
      <div class="sound-cards">
        ${SHORT_VOWELS.map(item=>`<button class="sound-card ${item.color} ${state.visitedVowels.has(item.id)?"visited":""}" data-vowel="${item.id}">
          <span class="sound-glyph">${item.glyph}</span>
          <strong>${item.name}</strong>
          <span class="sound-icon">🔊</span>
        </button>`).join("")}
      </div>
      <div class="sound-summary">
        <span><b>مَ</b><small>صوت قصير</small></span>
        <span><b>مِ</b><small>صوت قصير</small></span>
        <span><b>مُ</b><small>صوت قصير</small></span>
      </div>
      <div class="actions"><button class="btn primary full" data-action="vowels-next" ${state.visitedVowels.size<3?"disabled":""}>التالي: المدود</button></div>
    </section>`;
  }

  function maddView(){
    return `<section class="card sound-learning-card">
      <span class="eyebrow">٦ · المدود</span>
      <h2>نُطيل الصوت</h2>
      <p>اضغط كل صف واسمع الفرق: الحركة قصيرة، ثم يأتي حرف المد فيصبح الصوت أطول.</p>
      <div class="madd-stack">
        ${MADD_FORMS.map(item=>`<button class="madd-card ${item.color} ${state.visitedMadd.has(item.id)?"visited":""}" data-madd="${item.id}">
          <span class="madd-short">${item.short}</span>
          <span class="madd-arrow">←</span>
          <span class="madd-long">${item.glyph}</span>
          <span class="madd-label">${item.name}</span>
          <span class="sound-icon">🔊</span>
        </button>`).join("")}
      </div>
      <div class="madd-rule">
        <div><span class="mini-glyph">مَ</span><b>+</b><span class="madd-letter">ا</span><b>=</b><span class="long-result">مَا</span></div>
        <div><span class="mini-glyph">مِ</span><b>+</b><span class="madd-letter">ي</span><b>=</b><span class="long-result">مِي</span></div>
        <div><span class="mini-glyph">مُ</span><b>+</b><span class="madd-letter">و</span><b>=</b><span class="long-result">مُو</span></div>
      </div>
      <div class="actions"><button class="btn primary full" data-action="madd-next" ${state.visitedMadd.size<3?"disabled":""}>ابدأ التحدي ⭐</button></div>
    </section>`;
  }

  function soundChallengeOptions(q){
    const options=challengeOptions(q);
    return `<div class="sound-challenge-options">
      ${options.map(value=>challengeButton(value,value,"sound")).join("")}
    </div>`;
  }

  function randomOne(values){
    return values[Math.floor(Math.random()*values.length)];
  }

  function makeIdentifyPractice(level){
    const pools=[
      ["م","ن","هـ"],
      ["م","و","ف","ق"],
      ["ن","س","م","ه"],
      ["ب","م","ع","هـ"]
    ];
    const options=randomOne(pools);
    return {
      id:"identify-"+Date.now()+"-"+Math.random(),
      type:"identify",
      prompt:"أين حرف م؟",
      spoken:"أَيْنَ حَرْفُ مِيمْ؟",
      options,
      answer:"م",
      retryCount:0,
      level
    };
  }

  function makeVisualVowelPractice(level){
    const target=randomOne(SHORT_VOWELS);
    return {
      id:"visual-vowel-"+Date.now()+"-"+Math.random(),
      type:"visual-sound",
      prompt:`اختر ${target.glyph}`,
      display:target.glyph,
      spoken:`اِخْتَرْ ${target.spoken}`,
      options:SHORT_VOWELS.map(x=>x.glyph),
      answer:target.glyph,
      soundKind:"vowel",
      retryCount:0,
      level
    };
  }

  function makeAudioPractice(kind,level){
    const source=kind==="madd"?MADD_FORMS:SHORT_VOWELS;
    const target=randomOne(source);
    return {
      id:"audio-"+kind+"-"+Date.now()+"-"+Math.random(),
      type:"audio-sound",
      prompt:kind==="madd"?"استمع واختر المد":"استمع واختر الحركة",
      spoken:target.spoken,
      options:source.map(x=>kind==="madd"?x.glyph:x.glyph),
      answer:target.glyph,
      soundKind:kind,
      retryCount:0,
      level
    };
  }

  function makeClassifyPractice(level){
    const useMadd=Math.random()>.5;
    const target=useMadd?randomOne(MADD_FORMS):randomOne(SHORT_VOWELS);
    const glyph=useMadd?target.glyph:target.glyph;
    return {
      id:"classify-"+Date.now()+"-"+Math.random(),
      type:"classify",
      prompt:"هل هذا الصوت قصير أم مدّ؟",
      display:glyph,
      spoken:glyph,
      options:["صوت قصير","مدّ طويل"],
      answer:useMadd?"مدّ طويل":"صوت قصير",
      soundKind:useMadd?"madd":"vowel",
      retryCount:0,
      level
    };
  }

  function makePairPractice(level){
    const target=randomOne(MADD_FORMS);
    return {
      id:"pair-"+Date.now()+"-"+Math.random(),
      type:"pair",
      prompt:`أي مدّ يناسب ${target.short}؟`,
      display:target.short,
      spoken:target.short,
      options:MADD_FORMS.map(x=>x.glyph),
      answer:target.glyph,
      soundKind:"madd",
      retryCount:0,
      level
    };
  }

  function makePositionPractice(level){
    const position=randomOne(["start","middle","end"]);
    const ex={...randomOne(TRAIN_WORD_BANK[position])};
    return {
      id:"position-"+Date.now()+"-"+Math.random(),
      type:"position-practice",
      prompt:"أين حرف م الأحمر؟",
      spoken:`أَيْنَ حَرْفُ مِيمْ؟ ${ex.spoken}`,
      options:["start","middle","end"],
      answer:position,
      example:ex,
      retryCount:0,
      level
    };
  }

  function makeConnectionPractice(level){
    const states=[
      {index:0,label:"يمسك ما بعده"},
      {index:1,label:"يمسك من الجهتين"},
      {index:2,label:"يمسك ما قبله"},
      {index:3,label:"لوحده"}
    ];
    const target=randomOne(states);
    const optionIndexes=shuffledCopy([0,1,2,3]).slice(0,3);
    if(!optionIndexes.includes(target.index))optionIndexes[0]=target.index;
    return {
      id:"connection-"+Date.now()+"-"+Math.random(),
      type:"connection-practice",
      prompt:`اختر الكلمة التي فيها م ${target.label}`,
      spoken:`اِخْتَرِ الكَلِمَةَ الَّتِي فِيهَا حَرْفُ مِيمْ ${target.label}.`,
      options:optionIndexes,
      answer:target.index,
      retryCount:0,
      level
    };
  }

  function buildPracticeQuestions(level){
    let questions=[];
    if(level===1){
      questions=[
        makeIdentifyPractice(level),makeIdentifyPractice(level),makeIdentifyPractice(level),
        makeVisualVowelPractice(level),makeVisualVowelPractice(level),makeVisualVowelPractice(level)
      ];
    }else if(level===2){
      questions=[
        makeAudioPractice("vowel",level),makeAudioPractice("vowel",level),
        makeAudioPractice("vowel",level),makeAudioPractice("vowel",level),
        makeAudioPractice("madd",level),makeAudioPractice("madd",level),
        makeAudioPractice("madd",level),makeAudioPractice("madd",level)
      ];
    }else if(level===3){
      questions=[
        makeClassifyPractice(level),makeClassifyPractice(level),makeClassifyPractice(level),makeClassifyPractice(level),
        makePairPractice(level),makePairPractice(level),makePairPractice(level),makePairPractice(level)
      ];
    }else if(level===4){
      questions=[
        makePositionPractice(level),makePositionPractice(level),makePositionPractice(level),
        makeConnectionPractice(level),makeConnectionPractice(level),
        makeAudioPractice("vowel",level),makeAudioPractice("vowel",level),
        makeAudioPractice("madd",level),makeAudioPractice("madd",level),
        makePairPractice(level)
      ];
    }else{
      questions=[
        makeIdentifyPractice(level),makeIdentifyPractice(level),
        makePositionPractice(level),makePositionPractice(level),makePositionPractice(level),
        makeConnectionPractice(level),makeConnectionPractice(level),
        makeAudioPractice("vowel",level),makeAudioPractice("vowel",level),
        makeAudioPractice("madd",level),makeAudioPractice("madd",level),
        makeClassifyPractice(level),makeClassifyPractice(level),
        makePairPractice(level),makePairPractice(level)
      ];
    }
    return shuffledCopy(questions);
  }

  function startPracticeLevel(level){
    const config=PRACTICE_LEVELS[level-1];
    state.practiceMode="run";
    state.practiceLevel=level;
    state.practiceQueue=buildPracticeQuestions(level);
    state.practiceBaseCount=config.count;
    state.practiceIndex=0;
    state.practiceScore=0;
    state.practiceAnswered=false;
    state.practiceChoice=null;
    render();save();
    setTimeout(()=>speakPracticeQuestion(currentPracticeQuestion()),140);
  }

  function currentPracticeQuestion(){
    return state.practiceQueue[state.practiceIndex]||null;
  }

  function practiceOptions(q){
    if(!Array.isArray(q._order)){
      q._order=shuffledWithMovedAnswer(q.options,q.answer,"practice-"+q.type+"-"+q.answer);
    }
    return q._order;
  }

  function speakPracticeQuestion(q){
    if(!q)return;
    if(q.type==="audio-sound"){
      speakSequence([{text:q.spoken,rate:q.soundKind==="madd"?.46:.50}]);
      return;
    }
    if(q.type==="position-practice"){
      speakPositionPrompt(q.example,{withInstruction:false});
      return;
    }
    if(q.type==="classify"||q.type==="pair"||q.type==="visual-sound"){
      speakSequence([{text:q.spoken,rate:q.soundKind==="madd"?.46:.50}]);
      return;
    }
    speak(q.spoken||q.prompt);
  }

  function practiceHubView(){
    return `<section class="card practice-hub">
      <span class="eyebrow">٧ · التدريب المكثف</span>
      <h2>نتدرج من السهل إلى الإتقان</h2>
      <p>كل مستوى أصعب قليلًا. إذا أخطأت، يعود السؤال لاحقًا في مستويات التدريب.</p>
      <div class="practice-levels">
        ${PRACTICE_LEVELS.map(level=>{
          const result=state.practiceResults[level.id];
          const unlocked=level.id<=state.practiceUnlocked;
          const passed=!!result?.passed;
          return `<button class="practice-level ${passed?"passed":""} ${unlocked?"":"locked"}" data-practice-level="${level.id}" ${unlocked?"":"disabled"}>
            <span class="practice-level-icon">${level.icon}</span>
            <span class="practice-level-copy">
              <strong>${level.id}. ${level.title}</strong>
              <small>${level.description}</small>
              <em>${level.count} أسئلة · النجاح ${level.threshold}%${result?` · آخر نتيجة ${result.percent}%`:""}</em>
            </span>
            <span class="practice-level-state">${passed?"✓":unlocked?"ابدأ":"🔒"}</span>
          </button>`;
        }).join("")}
      </div>
    </section>`;
  }

  function practiceQuestionBody(q){
    if(q.type==="identify"){
      return `<div class="identify-grid challenge-letter-grid">${practiceOptions(q).map(v=>practiceChoiceButton(q,v,v,"letter")).join("")}</div>`;
    }
    if(q.type==="visual-sound"||q.type==="audio-sound"||q.type==="pair"){
      const display=q.type==="pair"||q.type==="visual-sound"?`<div class="practice-focus-glyph">${q.display}</div>`:"";
      return display+`<div class="sound-challenge-options">${practiceOptions(q).map(v=>practiceChoiceButton(q,v,v,"sound")).join("")}</div>`;
    }
    if(q.type==="classify"){
      return `<div class="practice-focus-glyph">${q.display}</div>
        <div class="practice-text-options">${practiceOptions(q).map(v=>practiceChoiceButton(q,v,v,"text")).join("")}</div>`;
    }
    if(q.type==="position-practice"){
      const ex=q.example;
      return `${trainWordTiles(ex)}
        <div class="practice-position-options">
          ${practiceOptions(q).map(pos=>practiceChoiceButton(q,pos,{start:"البداية",middle:"الوسط",end:"النهاية"}[pos],"position")).join("")}
        </div>`;
    }
    if(q.type==="connection-practice"){
      return `<div class="practice-word-options">${practiceOptions(q).map(idx=>practiceChoiceButton(q,idx,highlightExample(EXAMPLES[Number(idx)]),"word",true)).join("")}</div>`;
    }
    return "";
  }

  function practiceChoiceButton(q,value,label,type="text",html=false){
    let cls="practice-choice "+type;
    if(state.practiceAnswered&&String(value)===String(q.answer))cls+=" correct";
    if(state.practiceAnswered&&String(value)===String(state.practiceChoice)&&String(value)!==String(q.answer))cls+=" wrong";
    return `<button class="${cls}" data-practice-choice="${escapeHTML(value)}" ${state.practiceAnswered?"disabled":""}>${html?label:escapeHTML(label)}</button>`;
  }

  function practiceRunView(){
    const config=PRACTICE_LEVELS[state.practiceLevel-1];
    const q=currentPracticeQuestion();
    if(!q)return practiceResultView();
    const baseDone=Math.min(state.practiceIndex+1,state.practiceBaseCount);
    const retryTag=q.retryCount>0?'<span class="retry-tag">مراجعة سابقة</span>':"";
    const audio=(q.type==="audio-sound"||q.type==="classify"||q.type==="pair")
      ? `<button class="btn soft sound-pill" data-practice-audio>🔊 اسمع مرة أخرى</button>`
      : "";
    return `<section class="card practice-run">
      <div class="practice-run-head">
        <span class="eyebrow">${config.icon} المستوى ${config.id} · ${config.title}</span>
        <span class="practice-counter">${state.practiceIndex+1} / ${state.practiceQueue.length}</span>
      </div>
      ${retryTag}
      <h2>${q.prompt}</h2>
      ${audio}
      ${practiceQuestionBody(q)}
      ${state.practiceAnswered?`<div class="feedback ${String(state.practiceChoice)===String(q.answer)?"good":"bad"}">
        ${String(state.practiceChoice)===String(q.answer)?"أَحْسَنْتَ! 🌟":"ستعود هذه المهارة مرة أخرى بعد قليل."}
      </div>
      <div class="actions"><button class="btn primary full" data-action="practice-next">${state.practiceIndex===state.practiceQueue.length-1?"النتيجة":"التالي"}</button></div>`:""}
    </section>`;
  }

  function practiceResultView(){
    const config=PRACTICE_LEVELS[state.practiceLevel-1];
    const percent=Math.round(state.practiceScore/state.practiceBaseCount*100);
    const passed=percent>=config.threshold;
    const stars=percent>=95?3:percent>=85?2:percent>=config.threshold?1:0;
    return `<section class="card lesson-card practice-result">
      <div class="practice-result-icon">${passed?"🌟":"🌱"}</div>
      <span class="eyebrow">نتيجة المستوى ${config.id}</span>
      <h2>${passed?"تم اجتياز المستوى":"نحتاج جولة أخرى"}</h2>
      <div class="practice-score">${percent}%</div>
      <div class="practice-stars">${"★".repeat(stars)}${"☆".repeat(3-stars)}</div>
      <p>${passed?"أصبحت جاهزًا للمستوى التالي.":"سنغير ترتيب الأسئلة ونحاول مرة أخرى."}</p>
      <div class="actions">
        <button class="btn primary full" data-action="${passed?(config.id===PRACTICE_LEVELS.length?"practice-finish":"practice-next-level"):"practice-retry"}">
          ${passed?(config.id===PRACTICE_LEVELS.length?"إنهاء الدرس":"المستوى التالي"):"أعد المستوى"}
        </button>
        <button class="btn" data-action="practice-hub">عرض المستويات</button>
      </div>
    </section>`;
  }

  function practiceView(){
    if(state.practiceMode==="hub")return practiceHubView();
    if(state.practiceMode==="result")return practiceResultView();
    return practiceRunView();
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
    if(q.type==="sound"){
      return challengeShell(q,soundChallengeOptions(q));
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
    let cls="challenge-option"+(type==="word"?" word-option":type==="letter"?" letter-option":type==="sound"?" sound-option":"");
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

  function challengeWrongMessage(q){
    if(q.type==="sound")return "استمع للصوت مرة أخرى، ثم اختر الشكل المطابق.";
    if(q.type==="connection")return "انظر إلى شكل م الأحمر واتصاله بالحروف حوله.";
    return "جرّب أن تلاحظ الحرف الأحمر ومكانه.";
  }

  function challengeShell(q,body){
    const prompt=q.type==="position"?(q.prompt||""):(q.prompt||"");
    const spoken=q.spoken||prompt;
    const audio=q.type==="sound"
      ? `<button class="btn soft sound-pill" data-challenge-sound="${escapeHTML(spoken)}" data-sound-kind="${q.soundKind||"vowel"}">🔊 اسمع</button>`
      : audioButton(spoken);
    return `<section class="card">
      <span class="eyebrow">٧ · تحدي م</span>
      <h2>${prompt}</h2>
      ${audio}
      ${dots(state.challengeIndex,CHALLENGE.length)}
      ${body}
      ${state.challengeAnswered?`<div class="feedback ${isCurrentChallengeCorrect()?"good":"bad"}">${isCurrentChallengeCorrect()?"أَحْسَنْتَ! 🌟":challengeWrongMessage(q)}</div>
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
    const finalResult=state.practiceResults[PRACTICE_LEVELS.length];
    const percent=finalResult?.percent??0;
    const passed=!!finalResult?.passed;
    return `<section class="card lesson-card">
      <span class="eyebrow">اكتمل الدرس الذهبي</span>
      <div class="finish-star">${passed?"🏆":"🌱"}</div>
      <h1>${passed?"أَحْسَنْتَ! أتقنت حرف م":"أنجزت تدريب حرف م"}</h1>
      <div class="score">${percent}%</div>
      <p>${passed?"اجتزت خمسة مستويات من التدريب المتدرج حتى اختبار الإتقان.":"يمكن العودة إلى التدريب ورفع مستوى الإتقان."}</p>
      <div class="actions">
        <button class="btn primary full" data-action="practice-return">العودة إلى مستويات التدريب</button>
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
    else if(state.stage==="vowels")screen.innerHTML=vowelView();
    else if(state.stage==="madd")screen.innerHTML=maddView();
    else if(state.stage==="practice")screen.innerHTML=practiceView();
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

    screen.querySelectorAll("[data-vowel]").forEach(btn=>btn.addEventListener("click",()=>{
      const item=SHORT_VOWELS.find(x=>x.id===btn.dataset.vowel);
      if(!item)return;
      state.visitedVowels.add(item.id);
      speakSequence([{text:item.spoken,rate:.50,pauseAfter:80}]);
      render();save();
    }));

    screen.querySelectorAll("[data-madd]").forEach(btn=>btn.addEventListener("click",()=>{
      const item=MADD_FORMS.find(x=>x.id===btn.dataset.madd);
      if(!item)return;
      state.visitedMadd.add(item.id);
      speakSequence([
        {text:item.short,rate:.50,pauseAfter:180},
        {text:item.spoken,rate:.46,pauseAfter:80}
      ]);
      render();save();
    }));

    screen.querySelectorAll("[data-challenge-sound]").forEach(btn=>btn.addEventListener("click",()=>{
      const rate=btn.dataset.soundKind==="madd"?.46:.50;
      speakSequence([{text:btn.dataset.challengeSound,rate,pauseAfter:80}]);
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
      if(a==="joining-next"){
        state.visitedVowels=new Set();
        setStage("vowels",{speakText:"نَتَعَلَّمُ الآنَ حَرَكَاتِ حَرْفِ مِيمْ."});
      }
      if(a==="vowels-next"){
        state.visitedMadd=new Set();
        setStage("madd",{speakText:"الآنَ نُطِيلُ الصَّوْتَ مَعَ حُرُوفِ المَدِّ."});
      }
      if(a==="madd-next"){
        state.practiceMode="hub";
        state.practiceUnlocked=Math.max(1,state.practiceUnlocked||1);
        setStage("practice",{speakText:"نَبْدَأُ الآنَ التَّدْرِيبَ المُتَدَرِّجَ."});
      }
      if(a==="practice-next"){
        state.practiceIndex++;
        state.practiceAnswered=false;
        state.practiceChoice=null;
        if(state.practiceIndex>=state.practiceQueue.length){
          const config=PRACTICE_LEVELS[state.practiceLevel-1];
          const percent=Math.round(state.practiceScore/state.practiceBaseCount*100);
          const passed=percent>=config.threshold;
          state.practiceResults[state.practiceLevel]={percent,passed};
          if(passed)state.practiceUnlocked=Math.max(state.practiceUnlocked,Math.min(PRACTICE_LEVELS.length,state.practiceLevel+1));
          state.practiceMode="result";
          render();save();
        }else{
          render();save();
          setTimeout(()=>speakPracticeQuestion(currentPracticeQuestion()),120);
        }
      }
      if(a==="practice-retry")startPracticeLevel(state.practiceLevel);
      if(a==="practice-next-level")startPracticeLevel(Math.min(PRACTICE_LEVELS.length,state.practiceLevel+1));
      if(a==="practice-hub"){state.practiceMode="hub";render();save();}
      if(a==="practice-finish"){setStage("finish");celebrate();}
      if(a==="challenge-next"){
        if(state.challengeIndex<CHALLENGE.length-1){state.challengeIndex++;state.challengeAnswered=false;state.challengeChoice=null;state.challengeOrder=null;render();save();const q=CHALLENGE[state.challengeIndex];setTimeout(()=>{
          if(q.type==="position")speakPositionPrompt(EXAMPLES[q.example],{withInstruction:false});
          else if(q.type==="sound")speakSequence([{text:q.spoken,rate:q.soundKind==="madd"?.46:.50}]);
          else speak(q.spoken);
        },120);}
        else{setStage("finish");celebrate();}
      }
      if(a==="practice-return"){state.practiceMode="hub";setStage("practice");}
      if(a==="restart-challenge"){state.challengeIndex=0;state.challengeScore=0;state.challengeAnswered=false;state.challengeChoice=null;state.challengeOrder=null;setStage("challenge",{speakText:CHALLENGE[0].spoken});}
      if(a==="restart-all"){localStorage.removeItem(STORAGE_KEY);location.reload();}
    }));
  }

  function resetStageData(){
    state.identifyIndex=0;state.identifyScore=0;state.identifyAnswered=false;state.identifyChoice=null;state.identifyOrder=null;
    state.visitedWords=new Set();state.trainIndex=0;state.trainScore=0;state.trainAnswered=false;state.trainChoice=null;state.trainRound=createTrainRound();state.visitedVowels=new Set();state.visitedMadd=new Set();state.practiceMode="hub";state.practiceLevel=1;state.practiceUnlocked=1;state.practiceResults={};state.practiceQueue=[];state.practiceIndex=0;state.practiceScore=0;state.practiceAnswered=false;state.practiceChoice=null;
  }

  function goBack(){
    const map={identify:"intro",words:"identify",train:"words",joining:"train",vowels:"joining",madd:"vowels",practice:"madd",finish:"practice"};
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
        visitedWords:[...state.visitedWords],trainIndex:state.trainIndex,trainScore:state.trainScore,trainRound:state.trainRound,visitedVowels:[...state.visitedVowels],visitedMadd:[...state.visitedMadd],
        practiceMode:state.practiceMode,practiceLevel:state.practiceLevel,practiceUnlocked:state.practiceUnlocked,practiceResults:state.practiceResults,
        practiceQueue:state.practiceQueue,practiceIndex:state.practiceIndex,practiceScore:state.practiceScore,practiceAnswered:state.practiceAnswered,practiceChoice:state.practiceChoice,practiceBaseCount:state.practiceBaseCount,
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
      state.visitedVowels=new Set(Array.isArray(p.visitedVowels)?p.visitedVowels:[]);
      state.visitedMadd=new Set(Array.isArray(p.visitedMadd)?p.visitedMadd:[]);
      state.practiceMode=["hub","run","result"].includes(p.practiceMode)?p.practiceMode:"hub";
      state.practiceLevel=Math.max(1,Math.min(PRACTICE_LEVELS.length,Number(p.practiceLevel)||1));
      state.practiceUnlocked=Math.max(1,Math.min(PRACTICE_LEVELS.length,Number(p.practiceUnlocked)||1));
      state.practiceResults=p.practiceResults&&typeof p.practiceResults==="object"?p.practiceResults:{};
      state.practiceQueue=Array.isArray(p.practiceQueue)?p.practiceQueue:[];
      state.practiceIndex=Math.max(0,Number(p.practiceIndex)||0);
      state.practiceScore=Math.max(0,Number(p.practiceScore)||0);
      state.practiceAnswered=!!p.practiceAnswered;
      state.practiceChoice=p.practiceChoice??null;
      state.practiceBaseCount=Math.max(0,Number(p.practiceBaseCount)||0);
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