import { SoundEngine } from './core/sound-engine.js';
import { ArabicText } from './core/arabic-text.js';
import { confetti } from './core/confetti-lite.js';

/* ====================================================================
       Sound System (Tactile Magnetic Clicks + Web Speech API for Arabic)
       ==================================================================== */
    /* Comprehensive Database of all 28 Arabic Letters with their 4 Shapes */
    const ALL_ARABIC_LETTERS_DATA = [
      { char: 'م', name: 'ميم', init: 'مـ', med: 'ـمـ', fin: 'ـم', iso: 'م', exInit: 'مَلْعَب', exMed: 'شَمْس', exFin: 'قَلَم', exIso: 'نُجُوم' },
      { char: 'ح', name: 'حاء', init: 'حـ', med: 'ـحـ', fin: 'ـح', iso: 'ح', exInit: 'حَبْل', exMed: 'بَحْر', exFin: 'قَمْح', exIso: 'تُفَّاح' },
      { char: 'ا', name: 'ألف', init: 'ا', med: 'ـا', fin: 'ـا', iso: 'ا', exInit: 'اِبْن', exMed: 'سَائِل', exFin: 'عَصَا', exIso: 'هَذَا' },
      { char: 'ج', name: 'جيم', init: 'جـ', med: 'ـجـ', fin: 'ـج', iso: 'ج', exInit: 'جَمَل', exMed: 'نَجْم', exFin: 'ثَلْج', exIso: 'دُرْج' },
      { char: 'ص', name: 'صاد', init: 'صـ', med: 'ـصـ', fin: 'ـص', iso: 'ص', exInit: 'صَقْر', exMed: 'بَصَل', exFin: 'قَفَص', exIso: 'إِجَّاص' },
      { char: 'ن', name: 'نون', init: 'نـ', med: 'ـنـ', fin: 'ـن', iso: 'ن', exInit: 'نَهْر', exMed: 'عِنَب', exFin: 'عَيْن', exIso: 'رُمَّان' },
      { char: 'ب', name: 'باء', init: 'بـ', med: 'ـبـ', fin: 'ـب', iso: 'ب', exInit: 'بَاب', exMed: 'خُبْز', exFin: 'حَلِيب', exIso: 'كَوْكَب' },
      { char: 'ت', name: 'تاء', init: 'تـ', med: 'ـتـ', fin: 'ـت', iso: 'ت', exInit: 'تَمْر', exMed: 'كِتَاب', exFin: 'بَيْت', exIso: 'تُوت' },
      { char: 'ث', name: 'ثاء', init: 'ثـ', med: 'ـثـ', fin: 'ـث', iso: 'ث', exInit: 'ثَعْلَب', exMed: 'عُثْمَان', exFin: 'غَيْث', exIso: 'أَثَاث' },
      { char: 'خ', name: 'خاء', init: 'خـ', med: 'ـخـ', fin: 'ـخ', iso: 'خ', exInit: 'خَرُوف', exMed: 'نَخْلَة', exFin: 'بِطِّيخ', exIso: 'كُوخ' },
      { char: 'د', name: 'دال', init: 'د', med: 'ـد', fin: 'ـد', iso: 'د', exInit: 'دَرَاجَة', exMed: 'هَدِيَّة', exFin: 'يَد', exIso: 'وَرْد' },
      { char: 'ذ', name: 'ذال', init: 'ذ', med: 'ـذ', fin: 'ـذ', iso: 'ذ', exInit: 'ذَهَب', exMed: 'جَذْر', exFin: 'مُنْقِذ', exIso: 'رَذَاذ' },
      { char: 'ر', name: 'راء', init: 'ر', med: 'ـر', fin: 'ـر', iso: 'ر', exInit: 'رَسُول', exMed: 'قِرْد', exFin: 'قَمَر', exIso: 'قِطَار' },
      { char: 'ز', name: 'زاي', init: 'ز', med: 'ـز', fin: 'ـز', iso: 'ز', exInit: 'زَهْرَة', exMed: 'مَزْرَعَة', exFin: 'خُبْز', exIso: 'مَوْز' },
      { char: 'س', name: 'سين', init: 'سـ', med: 'ـسـ', fin: 'ـس', iso: 'س', exInit: 'سَمَكَة', exMed: 'مَسْجِد', exFin: 'شَمْس', exIso: 'فَرَس' },
      { char: 'ش', name: 'شين', init: 'شـ', med: 'ـشـ', fin: 'ـش', iso: 'ش', exInit: 'شَجَرَة', exMed: 'مِشْمِش', exFin: 'رِيش', exIso: 'فَرَاش' },
      { char: 'ض', name: 'ضاد', init: 'ضـ', med: 'ـضـ', fin: 'ـض', iso: 'ض', exInit: 'ضِفْدَع', exMed: 'خُضَار', exFin: 'بَيْض', exIso: 'حَوْض' },
      { char: 'ط', name: 'طاء', init: 'طـ', med: 'ـطـ', fin: 'ـط', iso: 'ط', exInit: 'طَبِيب', exMed: 'مَطَر', exFin: 'بَطّ', exIso: 'أُخْطُبُوط' },
      { char: 'ظ', name: 'ظاء', init: 'ظـ', med: 'ـظـ', fin: 'ـظ', iso: 'ظ', exInit: 'ظَرْف', exMed: 'نَظَّارَة', exFin: 'حَافِظ', exIso: 'مَحْظُوظ' },
      { char: 'ع', name: 'عين', init: 'عـ', med: 'ـعـ', fin: 'ـع', iso: 'ع', exInit: 'عَصِير', exMed: 'ثَعْلَب', exFin: 'مُذِيع', exIso: 'شُمُوع' },
      { char: 'غ', name: 'غين', init: 'غـ', med: 'ـغـ', fin: 'ـغ', iso: 'غ', exInit: 'غَزَال', exMed: 'مَغْرِب', exFin: 'صَمْغ', exIso: 'فَرَاغ' },
      { char: 'ف', name: 'فاء', init: 'فـ', med: 'ـفـ', fin: 'ـف', iso: 'ف', exInit: 'فَرَاشَة', exMed: 'طِفْل', exFin: 'سَيْف', exIso: 'صُوف' },
      { char: 'ق', name: 'قاف', init: 'قـ', med: 'ـقـ', fin: 'ـق', iso: 'ق', exInit: 'قَمَر', exMed: 'صَقْر', exFin: 'طَرِيق', exIso: 'سُوق' },
      { char: 'ك', name: 'كاف', init: 'كـ', med: 'ـكـ', fin: 'ـك', iso: 'ك', exInit: 'كِتَاب', exMed: 'مَكْتَبَة', exFin: 'مَلِك', exIso: 'شُبَّاك' },
      { char: 'ل', name: 'لام', init: 'لـ', med: 'ـلـ', fin: 'ـل', iso: 'ل', exInit: 'لَيْمُون', exMed: 'قَلَم', exFin: 'جَمَل', exIso: 'غَزَال' },
      { char: 'هـ', name: 'هاء', init: 'هـ', med: 'ـهـ', fin: 'ـه', iso: 'ه', exInit: 'هِلَال', exMed: 'نَهْر', exFin: 'وَجْه', exIso: 'مِيَاه' },
      { char: 'و', name: 'واو', init: 'و', med: 'ـو', fin: 'ـو', iso: 'و', exInit: 'وَرْدَة', exMed: 'طَاوُوس', exFin: 'دَلْو', exIso: 'عُصْفُور' },
      { char: 'ي', name: 'ياء', init: 'يـ', med: 'ـيـ', fin: 'ـي', iso: 'ي', exInit: 'يَد', exMed: 'بَيْت', exFin: 'كُرْسِي', exIso: 'شَاي' }
    ];

    const ALIF_VARIANTS = [
      { char: 'ا', name: 'ألف بلا همزة', init: 'ا', med: 'ـا', fin: 'ـا', iso: 'ا', exInit: 'الْبَيْت', exMed: 'بَاب', exFin: 'دَعَا', exIso: 'هَذَا' },
      { char: 'أ', name: 'ألف بهمزة فوق', init: 'أ', med: 'ـأ', fin: 'ـأ', iso: 'أ', exInit: 'أَسَد', exMed: 'سَأَلَ', exFin: 'بَدَأَ', exIso: 'قَرَأَ' },
      { char: 'إ', name: 'ألف بهمزة تحت', init: 'إ', med: 'ـإ', fin: 'ـإ', iso: 'إ', exInit: 'إِبِل', exMed: 'بِإِذْن', exFin: '—', exIso: 'إِيمَان' },
      { char: 'آ', name: 'ألف ممدودة', init: 'آ', med: 'ـآ', fin: 'ـآ', iso: 'آ', exInit: 'آمَال', exMed: 'ظَمْآن', exFin: '—', exIso: 'آدَم' }
    ];

    const RED_HARAKAT = [
      { mark: 'ـَ', name: 'فتحة', sym: 'َ' },
      { mark: 'ـُ', name: 'ضمة', sym: 'ُ' },
      { mark: 'ـِ', name: 'كسرة', sym: 'ِ' },
      { mark: 'ـْ', name: 'سكون', sym: 'ْ' },
      { mark: 'ـّ', name: 'شدة', sym: 'ّ' },
      { mark: 'ـً', name: 'تنوين فتح', sym: 'ً' },
      { mark: 'ـٌ', name: 'تنوين ضم', sym: 'ٌ' },
      { mark: 'ـٍ', name: 'تنوين كسر', sym: 'ٍ' }
    ];

    const LETTER_ORDER_ALPHABETIC = ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'];
    // ترتيب تدريس الحروف في كتاب لغتي للصف الأول: الوحدات 1–5.
    const LETTER_ORDER_LUGHATI = ['م','ب','ل','د','ن','ر','ص','ف','س','ق','ت','ح','ا','ط','ز','و','ج','ش','ض','ع','ك','خ','ي','ذ','ه','ث','غ','ظ'];
    const PRIMARY_HARAKAT = new Set(['َ','ُ','ِ','ْ','ً','ٌ','ٍ']);

    /* ====================================================================
       Magnetic Board Manager — multi-word, selection, contextual harakat
       ==================================================================== */
    const boardManager = {
      items: [],
      activeLetterChar: 'ص',
      activePositionFilter: 'ALL',
      letterOrderMode: 'lughati',
      showBaseline: true,
      dragState: null,
      selectedIds: new Set(),
      activeItemId: null,
      wordCounter: 0,

      init() {
        this.populateQuickLetterSelect();
        this.renderHarakat();
        this.renderLetterShapesSpotlight();
        this.renderAlifVariantsBar();
        this.renderFoamLettersGrid();
        this.setupBoardInteraction();
        this.loadPresetWord('صَالِحٌ');
      },

      normalizeLetterKey(char) {
        const base = ArabicText.base(char) || String(char || '').replace(/ـ/g, '');
        if (base === 'ٱ') return 'ا';
        if (base === 'ة') return 'ه';
        if (base === 'ى') return 'ي';
        return base;
      },

      isAlifVariant(char) {
        return ['ا','أ','إ','آ','ٱ'].includes(this.normalizeLetterKey(char));
      },

      getLetterData(char) {
        const key = this.normalizeLetterKey(char);
        const alif = ALIF_VARIANTS.find(item => item.char === key);
        if (alif) return alif;
        return ALL_ARABIC_LETTERS_DATA.find(item => this.normalizeLetterKey(item.char) === key) || null;
      },

      getOrderedLetters() {
        const order = this.letterOrderMode === 'alphabetic' ? LETTER_ORDER_ALPHABETIC : LETTER_ORDER_LUGHATI;
        const map = new Map(ALL_ARABIC_LETTERS_DATA.map(item => [this.normalizeLetterKey(item.char), item]));
        return order.map(key => map.get(key)).filter(Boolean);
      },

      changeLetterOrder(mode) {
        this.letterOrderMode = mode === 'alphabetic' ? 'alphabetic' : 'lughati';
        SoundEngine.playSnap();
        this.populateQuickLetterSelect();
        this.renderFoamLettersGrid();
        const label = this.letterOrderMode === 'alphabetic' ? 'الترتيب الهجائي' : 'ترتيب كتاب لغتي';
        app.showToast(`تم تفعيل ${label}`);
      },

      populateQuickLetterSelect() {
        const sel = document.getElementById('quickLetterSelect');
        if (!sel) return;
        const ordered = this.getOrderedLetters();
        sel.innerHTML = ordered.map(item => {
          if (item.char === 'ا') {
            return ALIF_VARIANTS.map(v => `<option value="${v.char}">${v.char} — ${v.name}</option>`).join('');
          }
          return `<option value="${item.char}">حرف (${this.normalizeLetterKey(item.char)}) - ${item.name}</option>`;
        }).join('');
        const exists = ordered.some(item => item.char === this.activeLetterChar || this.normalizeLetterKey(item.char) === this.normalizeLetterKey(this.activeLetterChar));
        if (!exists && ordered[0]) this.activeLetterChar = ordered[0].char;
        sel.value = ordered.find(item => this.normalizeLetterKey(item.char) === this.normalizeLetterKey(this.activeLetterChar))?.char || this.activeLetterChar;
      },

      onLetterSelectChange(char) {
        this.activeLetterChar = char;
        SoundEngine.playSnap();
        SoundEngine.speakArabic(`حرف ${this.normalizeLetterKey(char)}`);
        const hanging = document.getElementById('hangingLetterChar');
        if (hanging) hanging.textContent = this.normalizeLetterKey(char);
        this.renderLetterShapesSpotlight();
        this.renderAlifVariantsBar();
        this.renderFoamLettersGrid();
      },

      renderAlifVariantsBar() {
        const bar = document.getElementById('alifVariantsBar');
        if (!bar) return;
        if (!this.isAlifVariant(this.activeLetterChar)) {
          bar.classList.add('hidden');
          bar.innerHTML = '';
          return;
        }
        bar.classList.remove('hidden');
        bar.innerHTML = `<span class="alif-variants-label">أشكال الألف:</span>${ALIF_VARIANTS.map(v => `<button type="button" class="alif-variant-btn${this.normalizeLetterKey(this.activeLetterChar) === v.char ? ' active' : ''}" data-onclick="boardManager.onLetterSelectChange('${v.char}')" title="${v.name}">${v.char}</button>`).join('')}`;
      },

      setPositionFilter(filter) {
        SoundEngine.playSnap();
        this.activePositionFilter = filter;
        document.querySelectorAll('.filter-tab-btn').forEach(b => {
          b.classList.remove('bg-slate-800', 'text-white', 'ring-2', 'ring-slate-400');
        });
        const activeBtn = document.getElementById(`filterBtn-${filter}`);
        if (activeBtn) activeBtn.classList.add('bg-slate-800', 'text-white');
        this.renderFoamLettersGrid();
      },

      renderLetterShapesSpotlight() {
        const container = document.getElementById('letterShapesSpotlight');
        if (!container) return;
        const lData = this.getLetterData(this.activeLetterChar) || ALL_ARABIC_LETTERS_DATA[0];
        container.innerHTML = `
          <button data-onclick="boardManager.addFoamPiece('${lData.init}', 'glyph-purple', 'أول الكلمة')" class="flex flex-col items-center justify-center p-1 rounded-lg hover:bg-purple-50 transition group" title="أول الكلمة">
            <span class="foam-glyph glyph-purple text-3xl sm:text-4xl group-hover:scale-110 transition-transform">${lData.init}</span><span class="text-[9px] font-bold text-purple-700 mt-1">أول</span>
          </button>
          <button data-onclick="boardManager.addFoamPiece('${lData.med}', 'glyph-green', 'وسط الكلمة')" class="flex flex-col items-center justify-center p-1 rounded-lg hover:bg-emerald-50 transition group" title="وسط الكلمة">
            <span class="foam-glyph glyph-green text-3xl sm:text-4xl group-hover:scale-110 transition-transform">${lData.med}</span><span class="text-[9px] font-bold text-emerald-700 mt-1">وسط</span>
          </button>
          <button data-onclick="boardManager.addFoamPiece('${lData.fin}', 'glyph-blue', 'آخر متصل')" class="flex flex-col items-center justify-center p-1 rounded-lg hover:bg-blue-50 transition group" title="آخر متصل">
            <span class="foam-glyph glyph-blue text-3xl sm:text-4xl group-hover:scale-110 transition-transform">${lData.fin}</span><span class="text-[9px] font-bold text-blue-700 mt-1">متصل</span>
          </button>
          <button data-onclick="boardManager.addFoamPiece('${lData.iso}', 'glyph-red', 'منفصل')" class="flex flex-col items-center justify-center p-1 rounded-lg hover:bg-rose-50 transition group" title="منفصل">
            <span class="foam-glyph glyph-red text-3xl sm:text-4xl group-hover:scale-110 transition-transform">${lData.iso}</span><span class="text-[9px] font-bold text-rose-700 mt-1">منفصل</span>
          </button>`;
      },

      renderHarakat() {
        const row = document.getElementById('harakatButtonsRow');
        if (!row) return;
        row.innerHTML = RED_HARAKAT.map(h => `
          <button data-onclick="boardManager.addHaraka('${h.sym}', '${h.name}')" class="p-1 rounded-lg hover:bg-rose-100 transition flex items-center gap-1 group" title="${h.name}">
            <span class="foam-glyph glyph-haraka text-2xl font-black group-hover:scale-125 transition-transform">${h.mark}</span>
            <span class="text-[9px] text-rose-700 font-bold hidden sm:inline">${h.name}</span>
          </button>`).join('');
      },

      renderFoamLettersGrid() {
        const grid = document.getElementById('foamLettersGrid');
        if (!grid) return;
        const letters = this.getOrderedLetters();
        let html = '';
        if (this.activePositionFilter === 'ALL') {
          html = letters.map(l => `
            <div class="bg-slate-50/80 hover:bg-white rounded-xl p-1 flex flex-col items-center border border-slate-200 transition">
              <span class="text-[9px] font-black text-slate-400 mb-0.5">${this.normalizeLetterKey(l.char)}</span>
              <div class="grid grid-cols-2 gap-0.5 w-full items-center justify-center">
                <button data-onclick="boardManager.addFoamPiece('${l.init}', 'glyph-purple', 'أول الكلمة')" class="foam-glyph glyph-purple py-0.5 text-lg font-black hover:scale-115 transition-transform" title="أول">${l.init}</button>
                <button data-onclick="boardManager.addFoamPiece('${l.med}', 'glyph-green', 'وسط الكلمة')" class="foam-glyph glyph-green py-0.5 text-lg font-black hover:scale-115 transition-transform" title="وسط">${l.med}</button>
                <button data-onclick="boardManager.addFoamPiece('${l.fin}', 'glyph-blue', 'آخر متصل')" class="foam-glyph glyph-blue py-0.5 text-lg font-black hover:scale-115 transition-transform" title="متصل">${l.fin}</button>
                <button data-onclick="boardManager.addFoamPiece('${l.iso}', 'glyph-red', 'منفصل')" class="foam-glyph glyph-red py-0.5 text-lg font-black hover:scale-115 transition-transform" title="منفصل">${l.iso}</button>
              </div>
            </div>`).join('');
        } else {
          const meta = {
            init: ['init', 'glyph-purple', 'أول الكلمة', 'hover:bg-purple-50'],
            med: ['med', 'glyph-green', 'وسط الكلمة', 'hover:bg-emerald-50'],
            fin: ['fin', 'glyph-blue', 'آخر متصل', 'hover:bg-blue-50'],
            iso: ['iso', 'glyph-red', 'منفصل', 'hover:bg-rose-50']
          }[this.activePositionFilter];
          if (meta) {
            const [key, color, label, hover] = meta;
            html = letters.map(l => `
              <button data-onclick="boardManager.addFoamPiece('${l[key]}', '${color}', '${label}')" class="h-14 flex items-center justify-center rounded-xl ${hover} transition">
                <span class="foam-glyph ${color} text-3xl sm:text-4xl hover:scale-115 transition-transform">${l[key]}</span>
              </button>`).join('');
          }
        }
        grid.innerHTML = html;
      },

      toggleBaseline() {
        this.showBaseline = !this.showBaseline;
        const line = document.getElementById('whiteboardBaseline');
        const btn = document.getElementById('baselineToggleBtn');
        if (line) line.style.display = this.showBaseline ? 'block' : 'none';
        if (btn) btn.textContent = this.showBaseline ? 'سطر الكتابة: مُفعّل' : 'سطر الكتابة: مُخفى';
        SoundEngine.playSnap();
      },

      splitGlyph(glyph) {
        const marks = ArabicText.marks(glyph);
        const baseGlyph = Array.from(String(glyph || '')).filter(ch => !ArabicText.DIACRITIC_RE.test(ch)).join('');
        return { baseGlyph, marks };
      },

      composePieceValue(item) {
        if (!item || item.type !== 'letter') return item?.value || '';
        const marks = item.marks || [];
        if (!marks.length) return item.baseGlyph || item.value || '';
        const chars = Array.from(item.baseGlyph || item.value || '');
        const idx = chars.findIndex(ch => ArabicText.LETTER_RE.test(ch));
        if (idx < 0) return `${item.baseGlyph || ''}${marks.join('')}`;
        chars[idx] = chars[idx] + marks.join('');
        return chars.join('');
      },

      getMarkAnchor(item) {
        const name = item?.posName || '';
        if (name.includes('أول')) return 66;
        if (name.includes('آخر')) return 36;
        return 50;
      },

      markSvg(mark) {
        const common = 'viewBox="0 0 40 30" aria-hidden="true" focusable="false"';
        const stroke = 'stroke="currentColor" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" fill="none"';
        if (mark === 'َ') return `<svg ${common}><path ${stroke} d="M9 20 L31 10"/></svg>`;
        if (mark === 'ِ') return `<svg ${common}><path ${stroke} d="M9 20 L31 10"/></svg>`;
        if (mark === 'ً') return `<svg ${common}><path ${stroke} d="M8 22 L30 13 M11 14 L33 5"/></svg>`;
        if (mark === 'ٍ') return `<svg ${common}><path ${stroke} d="M8 22 L30 13 M11 14 L33 5"/></svg>`;
        if (mark === 'ْ') return `<svg ${common}><circle cx="20" cy="15" r="7" stroke="currentColor" stroke-width="4.5" fill="none"/></svg>`;
        if (mark === 'ّ') return `<svg ${common}><path ${stroke} d="M8 17 C12 7 17 22 21 12 C25 4 30 18 34 9"/></svg>`;
        if (mark === 'ُ') return `<svg ${common}><path ${stroke} d="M10 18 C9 8 19 6 23 11 C27 16 23 22 16 21 C23 23 29 20 32 14"/></svg>`;
        if (mark === 'ٌ') return `<svg ${common}><path ${stroke} d="M7 19 C6 11 13 8 17 12 C20 16 17 21 12 21 C18 23 22 19 23 15 M21 14 C21 7 28 6 31 10 C34 14 31 19 27 19"/></svg>`;
        return '';
      },

      renderMarkOverlays(item) {
        const marks = item.marks || [];
        if (!marks.length) return '';
        const anchor = this.getMarkAnchor(item);
        const hasShadda = marks.includes('ّ');
        return marks.map(mark => {
          let cls = 'foam-mark-overlay mark-top';
          if (mark === 'ِ' || mark === 'ٍ') cls = 'foam-mark-overlay mark-bottom';
          else if (mark === 'ّ') cls = 'foam-mark-overlay mark-shadda';
          else if (hasShadda) cls = 'foam-mark-overlay mark-top mark-with-shadda';
          return `<span class="${cls}" style="--mark-anchor:${anchor}%">${this.markSvg(mark)}</span>`;
        }).join('');
      },

      composeGlyphWithMarks(glyph, marks = []) {
        const chars = Array.from(String(glyph || ''));
        const idx = chars.findIndex(ch => ArabicText.LETTER_RE.test(ch));
        if (idx < 0) return `${glyph || ''}${Array.from(marks).join('')}`;
        chars[idx] = chars[idx] + Array.from(marks).join('');
        return chars.join('');
      },

      createLetterPiece(glyph, colorClass, positionName, x, y, extras = {}) {
        const split = this.splitGlyph(glyph);
        return {
          id: extras.id || `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          type: 'letter',
          baseGlyph: split.baseGlyph,
          marks: split.marks,
          value: glyph,
          color: colorClass,
          posName: positionName,
          x, y,
          wordId: extras.wordId || null,
          wordLabel: extras.wordLabel || null,
          scale: Number.isFinite(extras.scale) ? extras.scale : 1
        };
      },

      setupBoardInteraction() {
        const canvas = document.getElementById('boardCanvas');
        if (!canvas || canvas.dataset.pointerReady === '1') return;
        canvas.dataset.pointerReady = '1';

        const onPointerMove = (e) => {
          if (!this.dragState || e.pointerId !== this.dragState.pointerId) return;
          e.preventDefault();
          let dx = e.clientX - this.dragState.startClientX;
          let dy = e.clientY - this.dragState.startClientY;
          if (Math.abs(dx) + Math.abs(dy) > 3) this.dragState.moved = true;
          const rect = canvas.getBoundingClientRect();
          // قيد الحركة كمجموعة واحدة حتى لا تتشوه المسافات عند ملامسة الحواف.
          const origins = [...this.dragState.origins.values()];
          if (origins.length) {
            const minX = Math.min(...origins.map(o => o.x));
            const maxX = Math.max(...origins.map(o => o.x));
            const minY = Math.min(...origins.map(o => o.y));
            const maxY = Math.max(...origins.map(o => o.y));
            const maxScale = Math.max(1, ...this.items.filter(i => this.selectedIds.has(i.id)).map(i => Number(i.scale) || 1));
            dx = Math.max(4 - minX, Math.min(dx, (rect.width - 72 * maxScale) - maxX));
            dy = Math.max(4 - minY, Math.min(dy, (rect.height - 86 * maxScale) - maxY));
          }
          this.dragState.origins.forEach((origin, id) => {
            const item = this.items.find(i => i.id === id);
            if (!item) return;
            item.x = origin.x + dx;
            item.y = origin.y + dy;
            const el = canvas.querySelector(`[data-piece-id="${CSS.escape(id)}"]`);
            if (el) {
              el.style.left = `${item.x}px`;
              el.style.top = `${item.y}px`;
            }
          });
        };

        const onPointerUp = (e) => {
          if (!this.dragState || e.pointerId !== this.dragState.pointerId) return;
          canvas.querySelectorAll('.free-foam-piece.is-dragging').forEach(el => el.classList.remove('is-dragging'));
          this.dragState = null;
          SoundEngine.playSnap();
          this.updateWordPreviewFromPositions();
        };

        canvas.addEventListener('pointerdown', (e) => {
          if (e.target.closest('.free-foam-piece')) return;
          if (!this.selectedIds.size && !this.activeItemId) return;
          this.selectedIds.clear();
          this.activeItemId = null;
          this.renderBoard();
        });

        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
      },

      selectOnly(id) {
        this.selectedIds.clear();
        if (id) this.selectedIds.add(id);
        this.activeItemId = id || null;
        this.renderBoard();
      },

      selectAll() {
        this.selectedIds = new Set(this.items.map(i => i.id));
        const firstLetter = this.items.find(i => i.type === 'letter');
        this.activeItemId = firstLetter?.id || null;
        SoundEngine.playSnap();
        this.renderBoard();
        app.showToast(`تم تحديد ${this.selectedIds.size} قطعة`);
      },

      clearSelection() {
        this.selectedIds.clear();
        this.activeItemId = null;
        this.renderBoard();
      },

      selectItemForInteraction(item, { additive = false } = {}) {
        if (!item) return;
        if (additive) {
          if (this.selectedIds.has(item.id)) this.selectedIds.delete(item.id);
          else this.selectedIds.add(item.id);
        } else if (item.wordId) {
          const wordIds = this.items.filter(i => i.wordId === item.wordId && i.type !== 'space').map(i => i.id);
          this.selectedIds = new Set(wordIds);
        } else {
          this.selectedIds = new Set([item.id]);
        }
        this.activeItemId = item.id;
      },

      resizeSelected(delta) {
        const selected = this.items.filter(i => i.type === 'letter' && this.selectedIds.has(i.id));
        if (!selected.length) {
          app.showToast('حددي حرفًا أو كلمة أولًا');
          return;
        }
        const step = Number(delta) || 0;
        selected.forEach(item => {
          item.scale = Math.max(0.65, Math.min(1.8, (Number(item.scale) || 1) + step));
        });
        SoundEngine.playSnap();
        this.renderBoard();
      },

      resetSelectedSize() {
        const selected = this.items.filter(i => i.type === 'letter' && this.selectedIds.has(i.id));
        if (!selected.length) return;
        selected.forEach(item => { item.scale = 1; });
        SoundEngine.playSnap();
        this.renderBoard();
      },

      deleteSelected() {
        if (!this.selectedIds.size) return;
        const count = this.selectedIds.size;
        this.items = this.items.filter(i => !this.selectedIds.has(i.id));
        this.selectedIds.clear();
        this.activeItemId = null;
        SoundEngine.playSnap();
        this.renderBoard();
        app.showToast(`تم حذف ${count} قطعة`);
      },

      addFoamPiece(glyph, colorClass, positionName) {
        SoundEngine.playSnap();
        SoundEngine.speakArabic(glyph);
        const canvas = document.getElementById('boardCanvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { width: 400, height: 320 };
        let newX = rect.width * 0.72 - (this.items.length * 52) % Math.max(180, rect.width * 0.62);
        let newY = Math.max(30, rect.height * 0.42);
        if (newX < 30) newX = rect.width * 0.75;
        const piece = this.createLetterPiece(glyph, colorClass, positionName, newX, newY);
        this.items.push(piece);
        this.selectedIds = new Set([piece.id]);
        this.activeItemId = piece.id;
        this.renderBoard();
      },

      getHarakaTarget() {
        let item = this.items.find(i => i.id === this.activeItemId && i.type === 'letter');
        if (!item) {
          const selectedLetter = [...this.items].reverse().find(i => this.selectedIds.has(i.id) && i.type === 'letter');
          if (selectedLetter) item = selectedLetter;
        }
        if (!item) item = [...this.items].reverse().find(i => i.type === 'letter');
        return item || null;
      },

      addHaraka(sym, name) {
        SoundEngine.playSnap();
        SoundEngine.speakArabic(name);
        const target = this.getHarakaTarget();
        if (!target) {
          app.showToast('اختاري حرفًا أولًا ثم أضيفي الحركة');
          return;
        }
        target.marks = Array.isArray(target.marks) ? [...target.marks] : [];
        if (sym === 'ّ') {
          if (target.marks.includes('ّ')) target.marks = target.marks.filter(m => m !== 'ّ');
          else target.marks.push('ّ');
        } else {
          target.marks = target.marks.filter(m => !PRIMARY_HARAKAT.has(m));
          target.marks.push(sym);
        }
        target.value = this.composePieceValue(target);
        this.selectedIds = new Set([target.id]);
        this.activeItemId = target.id;
        this.renderBoard();
        app.showToast(`تم ضبط الحركة إلى: ${name}`);
      },

      clearHaraka() {
        const target = this.getHarakaTarget();
        if (!target) return;
        target.marks = [];
        target.value = this.composePieceValue(target);
        SoundEngine.playSnap();
        this.renderBoard();
        app.showToast('تمت إزالة الحركة من الحرف المحدد');
      },

      addSpace() {
        SoundEngine.playSnap();
        const canvas = document.getElementById('boardCanvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { width: 400, height: 320 };
        const item = { id: `sp_${Date.now()}`, type: 'space', value: ' ', color: '', x: rect.width * 0.5, y: rect.height * 0.45, wordId: null };
        this.items.push(item);
        this.renderBoard();
      },

      removePieceById(id) {
        SoundEngine.playSnap();
        this.items = this.items.filter(i => i.id !== id);
        this.selectedIds.delete(id);
        if (this.activeItemId === id) this.activeItemId = null;
        this.renderBoard();
      },

      placeCurrentLetterRow() {
        SoundEngine.playVictory();
        const lData = this.getLetterData(this.activeLetterChar) || ALL_ARABIC_LETTERS_DATA[0];
        const shapes = [
          { glyph: lData.init, color: 'glyph-purple', name: 'أول الكلمة' },
          { glyph: lData.med, color: 'glyph-green', name: 'وسط الكلمة' },
          { glyph: lData.fin, color: 'glyph-blue', name: 'آخر متصل' },
          { glyph: lData.iso, color: 'glyph-red', name: 'منفصل' }
        ];
        const canvas = document.getElementById('boardCanvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { width: 500, height: 340 };
        const y = this.getNextWordY(rect.height);
        const spacing = Math.min(85, (rect.width - 60) / 4);
        const startX = rect.width - 80;
        const wordId = `forms_${++this.wordCounter}_${Date.now()}`;
        shapes.forEach((s, i) => this.items.push(this.createLetterPiece(s.glyph, s.color, s.name, startX - i * spacing, y, { wordId, wordLabel: `أشكال ${this.normalizeLetterKey(lData.char)}` })));
        this.ensureBoardHeight();
        this.renderBoard();
        app.showToast(`تمت إضافة أشكال حرف (${this.normalizeLetterKey(lData.char)}) الأربعة`);
      },

      canConnectToNext(base) {
        return base && !ArabicText.NON_CONNECTING_AFTER.has(base) && base !== 'ء';
      },

      contextualGlyph(base, connectPrev, connectNext) {
        // حافظ على هيئة الألف وهمزاتها كما كتبها المستخدم: ا / أ / إ / آ.
        const preserveExact = new Set(['ة','ى','ء','ؤ','ئ']);
        const data = preserveExact.has(base) ? null : this.getLetterData(base);
        if (data) {
          if (connectPrev && connectNext) return { glyph: data.med, color: 'glyph-green', name: 'وسط الكلمة' };
          if (!connectPrev && connectNext) return { glyph: data.init, color: 'glyph-purple', name: 'أول الكلمة' };
          if (connectPrev && !connectNext) return { glyph: data.fin, color: 'glyph-blue', name: 'آخر متصل' };
          return { glyph: data.iso, color: 'glyph-red', name: 'منفصل' };
        }
        let glyph = base;
        if (connectPrev && connectNext) glyph = `ـ${base}ـ`;
        else if (!connectPrev && connectNext) glyph = `${base}ـ`;
        else if (connectPrev && !connectNext) glyph = `ـ${base}`;
        const color = connectPrev && connectNext ? 'glyph-green' : (!connectPrev && connectNext ? 'glyph-purple' : (connectPrev ? 'glyph-blue' : 'glyph-red'));
        const name = connectPrev && connectNext ? 'وسط الكلمة' : (!connectPrev && connectNext ? 'أول الكلمة' : (connectPrev ? 'آخر متصل' : 'منفصل'));
        return { glyph, color, name };
      },

      wordToPiecesData(word) {
        const units = ArabicText.letterUnits(word);
        return units.map((unit, i) => {
          const base = ArabicText.base(unit);
          const prevBase = i > 0 ? ArabicText.base(units[i - 1]) : '';
          const nextBase = i < units.length - 1 ? ArabicText.base(units[i + 1]) : '';
          const connectPrev = Boolean(prevBase) && this.canConnectToNext(prevBase) && base !== 'ء';
          const connectNext = Boolean(nextBase) && this.canConnectToNext(base) && nextBase !== 'ء';
          const form = this.contextualGlyph(base, connectPrev, connectNext);
          const marks = ArabicText.marks(unit).join('');
          return { glyph: `${form.glyph}${marks}`, color: form.color, name: form.name };
        });
      },

      getNextWordY(currentHeight = 400) {
        const groups = [...new Set(this.items.filter(i => i.wordId).map(i => i.wordId))];
        const row = groups.length;
        const y = 34 + row * 98;
        return Math.max(22, Math.min(y, Math.max(34, currentHeight - 82)));
      },

      ensureBoardHeight() {
        const canvas = document.getElementById('boardCanvas');
        if (!canvas) return;
        const groups = new Set(this.items.filter(i => i.wordId).map(i => i.wordId)).size;
        canvas.style.minHeight = `${Math.max(400, 110 + groups * 98)}px`;
      },

      addCompletedWord(word, { clear = false } = {}) {
        const clean = String(word || '').trim();
        if (!clean) {
          app.showToast('اكتبي كلمة أولًا');
          return;
        }
        const piecesData = this.wordToPiecesData(clean);
        if (!piecesData.length) {
          app.showToast('لم أتعرف على حروف عربية في الكلمة');
          return;
        }
        if (clear) {
          this.items = [];
          this.selectedIds.clear();
          this.activeItemId = null;
        }
        const canvas = document.getElementById('boardCanvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { width: 560, height: 400 };
        const wordId = `word_${++this.wordCounter}_${Date.now()}`;
        const y = this.getNextWordY(rect.height);
        const usableWidth = Math.max(220, rect.width - 120);
        const spacing = Math.min(76, usableWidth / Math.max(1, piecesData.length));
        const startX = rect.width - 82;
        const newIds = [];
        piecesData.forEach((p, idx) => {
          const piece = this.createLetterPiece(p.glyph, p.color, p.name, Math.max(14, startX - idx * spacing), y, { wordId, wordLabel: clean });
          this.items.push(piece);
          newIds.push(piece.id);
        });
        this.selectedIds.clear();
        this.activeItemId = null;
        this.ensureBoardHeight();
        this.renderBoard();
        app.showToast(`${clear ? 'تم تحميل' : 'تمت إضافة'} كلمة: ${clean}`);
      },

      loadPresetWord(word) {
        SoundEngine.playSnap();
        this.addCompletedWord(word, { clear: true });
      },

      addPresetWord(word) {
        SoundEngine.playSnap();
        this.addCompletedWord(word, { clear: false });
      },

      addCustomCompletedWord() {
        const input = document.getElementById('customBoardWord');
        const word = input?.value?.trim() || '';
        this.addCompletedWord(word, { clear: false });
        if (input && word) input.value = '';
      },

      autoAlignRow() {
        if (!this.items.length) return;
        SoundEngine.playSnap();
        const canvas = document.getElementById('boardCanvas');
        const rect = canvas.getBoundingClientRect();
        const grouped = new Map();
        this.items.forEach(item => {
          const key = item.wordId || '__free__';
          if (!grouped.has(key)) grouped.set(key, []);
          grouped.get(key).push(item);
        });
        let row = 0;
        grouped.forEach(group => {
          group.sort((a, b) => b.x - a.x);
          const y = 34 + row * 98;
          const usable = Math.max(180, rect.width - 120);
          const spacing = Math.min(76, usable / Math.max(1, group.length));
          const startX = rect.width - 82;
          group.forEach((item, idx) => {
            item.x = Math.max(12, startX - idx * spacing);
            item.y = y;
          });
          row += 1;
        });
        this.ensureBoardHeight();
        this.renderBoard();
        app.showToast('تم ترتيب كل كلمة في سطر مستقل');
      },

      scatterPieces() {
        if (!this.items.length) return;
        SoundEngine.playSnap();
        const canvas = document.getElementById('boardCanvas');
        const rect = canvas.getBoundingClientRect();
        const targets = this.selectedIds.size ? this.items.filter(item => this.selectedIds.has(item.id)) : this.items;
        targets.forEach(item => {
          item.x = 20 + Math.random() * Math.max(30, rect.width - 100);
          item.y = 20 + Math.random() * Math.max(30, rect.height - 110);
        });
        this.renderBoard();
        app.showToast(this.selectedIds.size ? 'تم نثر القطع المحددة' : 'تم نثر الحروف للتركيب الحر');
      },

      escapeHtml(text) {
        return String(text ?? '').replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[ch]));
      },

      getWordGroups() {
        const groups = new Map();
        this.items.filter(i => i.type === 'letter' || i.type === 'space').forEach(item => {
          const key = item.wordId || '__free__';
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(item);
        });
        return [...groups.entries()].map(([id, items]) => {
          const letters = items.filter(i => i.type === 'letter');
          const y = letters.length ? Math.min(...letters.map(i => i.y)) : 0;
          const text = [...items].sort((a, b) => b.x - a.x).map(i => i.type === 'letter' ? this.composePieceValue(i) : ' ').join('').replace(/ـ+/g, '').replace(/\s+/g, ' ').trim();
          return { id, items, y, text, label: letters.find(i => i.wordLabel)?.wordLabel || text };
        }).filter(g => g.text).sort((a, b) => a.y - b.y);
      },

      updateWordPreviewFromPositions() {
        const preview = document.getElementById('currentWordPreview');
        if (!preview) return;
        const groups = this.getWordGroups();
        if (!groups.length) {
          preview.innerHTML = '<span class="board-preview-empty">--</span>';
          return;
        }
        preview.innerHTML = groups.map((g, idx) => `<button type="button" class="board-word-chip" data-onclick="boardManager.speakWordGroup('${this.escapeHtml(g.id)}')"><span>${idx + 1}</span>${this.escapeHtml(g.text)}</button>`).join('');
      },

      speakWordGroup(id) {
        const group = this.getWordGroups().find(g => g.id === id);
        if (!group?.text) return;
        SoundEngine.playSnap();
        SoundEngine.speakArabic(group.text);
      },

      updateSelectionUI() {
        const count = document.getElementById('selectedPieceCount');
        if (count) count.textContent = `${this.selectedIds.size} محدد`;
        const target = this.items.find(i => i.id === this.activeItemId);
        const label = document.getElementById('harakaTargetLabel');
        if (label) label.textContent = target?.type === 'letter' ? `الحرف النشط: ${this.composePieceValue(target)}` : 'اختاري حرفًا لتغيير حركته';
        const scaleOut = document.getElementById('boardLetterScaleValue');
        if (scaleOut) {
          const selected = this.items.filter(i => i.type === 'letter' && this.selectedIds.has(i.id));
          const avg = selected.length ? selected.reduce((sum, i) => sum + (Number(i.scale) || 1), 0) / selected.length : 1;
          scaleOut.textContent = `${Math.round(avg * 100)}%`;
        }
      },

      renderBoard() {
        const container = document.getElementById('boardCanvas');
        if (!container) return;
        const emptyHint = document.getElementById('emptyBoardHint');
        const countSpan = document.getElementById('boardPieceCount');
        if (countSpan) countSpan.textContent = `${this.items.length} قطع فوم`;
        container.querySelectorAll('.free-foam-piece').forEach(el => el.remove());

        if (!this.items.length) {
          if (emptyHint) emptyHint.style.display = 'flex';
          this.updateWordPreviewFromPositions();
          this.updateSelectionUI();
          return;
        }
        if (emptyHint) emptyHint.style.display = 'none';

        this.items.forEach(item => {
          if (item.type === 'space') return;
          const el = document.createElement('div');
          const isSelected = this.selectedIds.has(item.id);
          el.dataset.pieceId = item.id;
          el.className = `free-foam-piece foam-glyph ${item.color} group${isSelected ? ' is-selected' : ''}`;
          el.style.left = `${item.x}px`;
          el.style.top = `${item.y}px`;
          const baseFontSize = window.matchMedia?.('(max-width: 640px)').matches ? 52 : 66;
          el.style.fontSize = `${Math.round(baseFontSize * (Number(item.scale) || 1))}px`;
          const base = item.baseGlyph || this.splitGlyph(item.value).baseGlyph;
          el.innerHTML = `
            <span class="foam-piece-glyph pointer-events-none">${base}${this.renderMarkOverlays(item)}</span>
            <button data-onclick="event.stopPropagation(); boardManager.removePieceById('${item.id}')" class="piece-delete-btn" title="حذف القطعة">✕</button>`;

          el.addEventListener('pointerdown', (e) => {
            if (e.target.closest('button')) return;
            e.preventDefault();
            // الضغط على أي حرف في كلمة مكتملة يحدد الكلمة كلها لتحريكها/تكبيرها كمجموعة.
            this.selectItemForInteraction(item, { additive: Boolean(e.ctrlKey || e.metaKey || e.shiftKey) });
            this.updateSelectionUI();
            container.querySelectorAll('.free-foam-piece').forEach(pieceEl => pieceEl.classList.toggle('is-selected', this.selectedIds.has(pieceEl.dataset.pieceId)));
            const origins = new Map(this.items.filter(i => this.selectedIds.has(i.id)).map(i => [i.id, { x: i.x, y: i.y }]));
            this.dragState = { pointerId: e.pointerId, startClientX: e.clientX, startClientY: e.clientY, origins, moved: false };
            el.classList.add('is-dragging');
            try { el.setPointerCapture(e.pointerId); } catch (_) {}
          });

          el.addEventListener('dblclick', (e) => {
            e.preventDefault();
            this.selectedIds = new Set([item.id]);
            this.activeItemId = item.id;
            SoundEngine.speakArabic(this.composePieceValue(item));
            this.renderBoard();
          });

          container.appendChild(el);
        });
        this.updateWordPreviewFromPositions();
        this.updateSelectionUI();
      },

      pronounceBoard() {
        const groups = this.getWordGroups();
        const text = groups.map(g => g.text).join(' ').trim();
        if (!text) {
          app.showToast('السبورة فارغة، أضيفي بعض الحروف أولاً');
          return;
        }
        SoundEngine.playVictory();
        SoundEngine.speakArabic(text);
        confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
      },

      clearBoard() {
        this.items = [];
        this.selectedIds.clear();
        this.activeItemId = null;
        const canvas = document.getElementById('boardCanvas');
        if (canvas) canvas.style.minHeight = '';
        this.renderBoard();
        app.showToast('تم تفريغ السبورة');
      }
    };


    /* ====================================================================
       Vowel Posters Manager (3 Mouth Panels)
       ==================================================================== */
    const vowelPosters = {
      currentLetter: 'ص',
      database: {
        'ص': {
          hanging: 'ص',
          fatha: { short: 'صَـ', long: 'صَا', ex1: 'صَدِيقِي', ex2: 'صَالِح' },
          damma: { short: 'صُـ', long: 'صُو', ex1: 'صُنْدُوق', ex2: 'صُورَة' },
          kasra: { short: 'صِـ', long: 'صِي', ex1: 'صِحَّتِي', ex2: 'عَصِير' }
        },
        'ب': {
          hanging: 'ب',
          fatha: { short: 'بَـ', long: 'بَا', ex1: 'بَقَرَة', ex2: 'بَاب' },
          damma: { short: 'بُـ', long: 'بُو', ex1: 'بُرْتُقَال', ex2: 'بُومَة' },
          kasra: { short: 'بِـ', long: 'بِي', ex1: 'بِنْت', ex2: 'طَبِيب' }
        },
        'م': {
          hanging: 'م',
          fatha: { short: 'مَـ', long: 'مَا', ex1: 'مَطَر', ex2: 'مَاء' },
          damma: { short: 'مُـ', long: 'مُو', ex1: 'مُعَلِّمَة', ex2: 'لَيْمُون' },
          kasra: { short: 'مِـ', long: 'مِي', ex1: 'مِفْتَاح', ex2: 'مِيلَاد' }
        },
        'د': {
          hanging: 'د',
          fatha: { short: 'دَ', long: 'دَا', ex1: 'دَرَجَة', ex2: 'دَار' },
          damma: { short: 'دُ', long: 'دُو', ex1: 'دُبّ', ex2: 'دُودَة' },
          kasra: { short: 'دِ', long: 'دِي', ex1: 'دِرْهَم', ex2: 'دِيك' }
        },
        'ر': {
          hanging: 'ر',
          fatha: { short: 'رَ', long: 'رَا', ex1: 'رَجُل', ex2: 'رَاعِي' },
          damma: { short: 'رُ', long: 'رُو', ex1: 'رُمَّان', ex2: 'خَرُوف' },
          kasra: { short: 'رِ', long: 'رِي', ex1: 'رِيشَة', ex2: 'رِيق' }
        }
      },

      init() {
        const picker = document.getElementById('vowelsLetterPicker');
        if (!picker) return;
        picker.innerHTML = Object.keys(this.database).map(l => `
          <option value="${l}">حرف (${l})</option>
        `).join('');
        this.updateView();
      },

      changeLetter(letter) {
        SoundEngine.playSnap();
        this.currentLetter = letter;
        this.updateView();
      },

      updateView() {
        const d = this.database[this.currentLetter] || this.database['ص'];
        
        const setEl = (id, val) => {
          const el = document.getElementById(id);
          if (el) el.textContent = val;
        };

        setEl('fathaShortChar', d.fatha.short);
        setEl('fathaLongChar', d.fatha.long);
        setEl('fathaEx1', d.fatha.ex1);
        setEl('fathaEx2', d.fatha.ex2);

        setEl('dammaShortChar', d.damma.short);
        setEl('dammaLongChar', d.damma.long);
        setEl('dammaEx1', d.damma.ex1);
        setEl('dammaEx2', d.damma.ex2);

        setEl('kasraShortChar', d.kasra.short);
        setEl('kasraLongChar', d.kasra.long);
        setEl('kasraEx1', d.kasra.ex1);
        setEl('kasraEx2', d.kasra.ex2);
      },

      speakSound(type) {
        SoundEngine.playSnap();
        const d = this.database[this.currentLetter] || this.database['ص'];
        if (type === 'fatha_short') SoundEngine.speakArabic(d.fatha.short);
        if (type === 'fatha_long') SoundEngine.speakArabic(d.fatha.long);
        if (type === 'damma_short') SoundEngine.speakArabic(d.damma.short);
        if (type === 'damma_long') SoundEngine.speakArabic(d.damma.long);
        if (type === 'kasra_short') SoundEngine.speakArabic(d.kasra.short);
        if (type === 'kasra_long') SoundEngine.speakArabic(d.kasra.long);
      },

      speakWord(type) {
        SoundEngine.playVictory();
        const d = this.database[this.currentLetter] || this.database['ص'];
        if (type === 'fatha_ex1') SoundEngine.speakArabic(d.fatha.ex1);
        if (type === 'fatha_ex2') SoundEngine.speakArabic(d.fatha.ex2);
        if (type === 'damma_ex1') SoundEngine.speakArabic(d.damma.ex1);
        if (type === 'damma_ex2') SoundEngine.speakArabic(d.damma.ex2);
        if (type === 'kasra_ex1') SoundEngine.speakArabic(d.kasra.ex1);
        if (type === 'kasra_ex2') SoundEngine.speakArabic(d.kasra.ex2);
      }
    };

    /* ====================================================================
       Font Studio & Children Typography Testing Controller
       ==================================================================== */
    const FONT_REPOSITORY = [
      {
        id: 'font-baloo',
        nameAr: 'خط الأطفال والمرح (Baloo Bhaijaan 2)',
        nameEn: 'Baloo Bhaijaan 2',
        fontFamily: "'Baloo Bhaijaan 2', cursive, sans-serif",
        category: 'أطفال ورياض أطفال',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        desc: 'خط مستدير الحواف وممتلئ كقطع الفوم الإسفنجية؛ مثالي لرياض الأطفال والمراحل الأولية لبناء الألفة البصرية.',
        sampleLetters: 'صَـ   صُـ   صِـ   صّ   صَالِحٌ'
      },
      {
        id: 'font-marhey',
        nameAr: 'خط مَرِح اللطيف (Marhey)',
        nameEn: 'Marhey',
        fontFamily: "'Marhey', cursive, sans-serif",
        category: 'أطفال ورسوم متحركة',
        badgeColor: 'bg-pink-100 text-pink-800 border-pink-300',
        desc: 'خط فني كرتوني مبهج ومرح يعشقه الصغار، مصمم خصيصاً للقصص المصورة وألعاب الحروف التفاعلية.',
        sampleLetters: 'جَـ   ـمَـ   ـلٌ   نَهْرٌ'
      },
      {
        id: 'font-lalezar',
        nameAr: 'خط لاله زار الكرتوني (Lalezar)',
        nameEn: 'Lalezar',
        fontFamily: "'Lalezar', cursive, sans-serif",
        category: 'عناوين ومجلات الأطفال',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        desc: 'خط عريض جداً وبارز بروح مجلات الأطفال الكلاسيكية، يمنح الحروف سماكة ممتازة تحاكي الفوم السميك.',
        sampleLetters: 'حَـ   حُـ   حِـ   حَرِيصٌ'
      },
      {
        id: 'font-changa',
        nameAr: 'خط المكعبات والكتل (Changa)',
        nameEn: 'Changa',
        fontFamily: "'Changa', cursive, sans-serif",
        category: 'مكعبات وألعاب تعليمية',
        badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
        desc: 'خط كتلوي هندسي جريء يشبه مكعبات الحروف وألعاب التركيب الخشبية، ممتاز للتمييز الحركي والمكاني.',
        sampleLetters: 'كَتَبَ   دَرَسَ   رَسَمَ'
      },
      {
        id: 'font-naskh',
        nameAr: 'خط النسخ المدرسي المعتمد (Noto Naskh)',
        nameEn: 'Noto Naskh Arabic',
        fontFamily: "'Noto Naskh Arabic', serif",
        category: 'المناهج المدرسية (لغتي)',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
        desc: 'المطابق بدقة لخط كتب القراءة والإملاء المعتمدة في المناهج المدرسية؛ رائع لتعليم السطر وقواعد الرسم الصحيح.',
        sampleLetters: 'الصَّلَاةَ   مَدْرَسَةٌ'
      },
      {
        id: 'font-cairo',
        nameAr: 'خط كايرو الهندسي (Cairo)',
        nameEn: 'Cairo',
        fontFamily: "'Cairo', sans-serif",
        category: 'وضوح فائق وقراءة سهلة',
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
        desc: 'خط حديث ذو خطوط واضحة ونسب دقيقة يسهل على العين الصغيرة تمييز الحروف المتشابهة وحركاتها دون لبس.',
        sampleLetters: 'صُنْدُوقٌ   صَحِيفَةٌ'
      },
      {
        id: 'font-readex',
        nameAr: 'خط القراءة البسيطة (Readex Pro)',
        nameEn: 'Readex Pro',
        fontFamily: "'Readex Pro', sans-serif",
        category: 'بساطة وعصرية',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        desc: 'خط تعليمي بسيط جداً ومجرد من الزوائد المعقدة؛ يريح عين الطفل في القراءة الهرمية والمقاطع.',
        sampleLetters: 'عُصْفُورٌ   كِتَابٌ'
      },
      {
        id: 'font-tajawal',
        nameAr: 'خط تجوال الناعم (Tajawal)',
        nameEn: 'Tajawal',
        fontFamily: "'Tajawal', sans-serif",
        category: 'ناعم ومتناسق',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        desc: 'حروف رشيقة وناعمة تتناغم على شاشات الجوال والأجهزة اللوحية دون تشويش أو تشابك مع الحركات.',
        sampleLetters: 'قَرَأَ   صَدَقَ   نُورٌ'
      },
      {
        id: 'font-amiri',
        nameAr: 'خط أميري التراثي (Amiri)',
        nameEn: 'Amiri',
        fontFamily: "'Amiri', serif",
        category: 'نسخ تراثي فصيح',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        desc: 'يمثل أصالة وجمال الخط العربي الكلاسيكي لتعويد الطفل على فصاحة ورشاقة الحرف العربي الأصيل.',
        sampleLetters: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
      },
      {
        id: 'font-ruqaa',
        nameAr: 'خط الرقعة الفني (Aref Ruqaa)',
        nameEn: 'Aref Ruqaa',
        fontFamily: "'Aref Ruqaa', cursive, serif",
        category: 'خط الرقعة العربي',
        badgeColor: 'bg-slate-200 text-slate-800 border-slate-300',
        desc: 'خط الرقعة الشهير، ممتاز لتعليم الطلاب مقارنة شكل الحرف بين خط النسخ وخط الرقعة وإثراء التذوق البصري.',
        sampleLetters: 'الْعِلْمُ نُورٌ وَالْجَهْلُ ظَلَامٌ'
      }
    ];

    const fontStudio = {
      testText: 'صَالِحٌ حَرِيصٌ عَلَى الصَّلَاةِ فِي الْمَسْجِدِ',

      init() {
        this.renderCards();
        this.updateActiveBadge();
      },

      openModal() {
        SoundEngine.playSnap();
        const modal = document.getElementById('fontStudioModal');
        if (!modal) return;
        this.renderCards();
        this.updateActiveBadge();
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      },

      closeModal() {
        SoundEngine.playSnap();
        const modal = document.getElementById('fontStudioModal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      },

      setPresetText(text) {
        SoundEngine.playSnap();
        this.testText = text;
        const inp = document.getElementById('fontStudioLiveInput');
        if (inp) inp.value = text;
        this.renderCards();
      },

      onTestTextChange(val) {
        this.testText = val || 'صَالِحٌ حَرِيصٌ عَلَى الصَّلَاةِ';
        this.renderCards();
      },

      applyFontFromStudio(fontId) {
        app.changeAppFont(fontId);
        SoundEngine.playVictory();
        this.renderCards();
        this.updateActiveBadge();
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
      },

      updateActiveBadge() {
        const badge = document.getElementById('activeFontBadge');
        if (!badge) return;
        const current = FONT_REPOSITORY.find(f => f.id === app.currentFont);
        if (current) badge.textContent = current.nameAr;
      },

      renderCards() {
        const container = document.getElementById('fontCardsContainer');
        if (!container) return;

        container.innerHTML = FONT_REPOSITORY.map(f => {
          const isActive = (app.currentFont === f.id);
          return `
            <div class="bg-white rounded-2xl p-4 border-2 ${isActive ? 'border-amber-500 ring-2 ring-amber-300 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-xs'} transition flex flex-col justify-between">
              
              <div>
                <!-- Card Header -->
                <div class="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <h4 class="text-sm font-black text-slate-900">${f.nameAr}</h4>
                    <span class="text-[10px] text-slate-400 font-bold">${f.nameEn}</span>
                  </div>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${f.badgeColor}">
                    ${f.category}
                  </span>
                </div>

                <p class="text-xs text-slate-500 font-bold mb-3 leading-relaxed">${f.desc}</p>

                <!-- Live Test Showcase Box -->
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-3 overflow-hidden">
                  <span class="text-[10px] font-black text-slate-400 block mb-1">المعاينة الحية:</span>
                  <div class="text-xl sm:text-2xl font-black text-slate-900 text-center py-2" style="font-family: ${f.fontFamily}; line-height: 1.5;">
                    ${this.testText}
                  </div>
                  <!-- Sample Shapes & Harakat preview -->
                  <div class="mt-1 pt-1.5 border-t border-slate-200 text-center text-sm font-black text-amber-700 tracking-wider" style="font-family: ${f.fontFamily};">
                    ${f.sampleLetters}
                  </div>
                </div>
              </div>

              <!-- Action button -->
              <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                <span class="text-[11px] font-bold text-slate-400">
                  ${isActive ? '✅ الخط المعتمد حالياً' : 'جاهز للتطبيق'}
                </span>
                <button data-onclick="fontStudio.applyFontFromStudio('${f.id}')" 
                        class="px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${isActive ? 'bg-emerald-600 text-white shadow-xs' : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'}">
                  <span>${isActive ? '✓ الخط مفعّل' : '👈 تجربة وتفعيل هذا الخط'}</span>
                </button>
              </div>

            </div>
          `;
        }).join('');
      }
    };

    /* ====================================================================
       Positions Table Manager (4 Contextual Shapes)
       ==================================================================== */
    const positionsTable = {
      selectedLetterChar: 'م',

      init() {
        const sel = document.getElementById('positionsLetterSelect');
        const tbody = document.getElementById('matrixTableBody');
        if (!sel || !tbody) return;

        const selectorItems = ALL_ARABIC_LETTERS_DATA.flatMap(m =>
          m.char === 'ا' ? ALIF_VARIANTS : [m]
        );
        sel.innerHTML = selectorItems.map(m => `
          <option value="${m.char}">حرف (${m.char}) - ${m.name}</option>
        `).join('');

        const matrixItems = ALL_ARABIC_LETTERS_DATA.flatMap(m =>
          m.char === 'ا' ? ALIF_VARIANTS : [m]
        );
        tbody.innerHTML = matrixItems.map(m => `
          <tr data-onclick="positionsTable.selectLetter('${m.char}')" class="hover:bg-slate-50 cursor-pointer transition ${['أ','إ','آ'].includes(m.char) ? 'bg-amber-50/50' : ''}">
            <td class="p-2.5 font-black text-slate-800">${m.char}</td>
            <td class="p-2.5 text-purple-700 font-black">${m.init}</td>
            <td class="p-2.5 text-emerald-700 font-black">${m.med}</td>
            <td class="p-2.5 text-blue-700 font-black">${m.fin}</td>
            <td class="p-2.5 text-rose-700 font-black">${m.iso}</td>
          </tr>
        `).join('');

        this.selectLetter('م');
      },

      selectLetter(char) {
        SoundEngine.playSnap();
        this.selectedLetterChar = char;
        const item = boardManager.getLetterData(char) || ALL_ARABIC_LETTERS_DATA[0];

        const sel = document.getElementById('positionsLetterSelect');
        if (sel) sel.value = char;

        const setEl = (id, val) => {
          const el = document.getElementById(id);
          if (el) el.textContent = val;
        };

        setEl('dispInitial', item.init);
        setEl('dispMedial', item.med);
        setEl('dispFinalConn', item.fin);
        setEl('dispIsolated', item.iso);

        const exInit = document.getElementById('exInitial');
        if (exInit) exInit.innerHTML = `مثال: <span class="text-purple-600 font-black">${item.init}</span> (${item.exInit})`;
        const exMed = document.getElementById('exMedial');
        if (exMed) exMed.innerHTML = `مثال: <span class="text-emerald-600 font-black">${item.med}</span> (${item.exMed})`;
        const exFin = document.getElementById('exFinalConn');
        if (exFin) exFin.innerHTML = `مثال: <span class="text-blue-600 font-black">${item.fin}</span> (${item.exFin})`;
        const exIso = document.getElementById('exIsolated');
        if (exIso) exIso.innerHTML = `مثال: <span class="text-rose-600 font-black">${item.iso}</span> (${item.exIso})`;
      },

      speakPosition(pos) {
        SoundEngine.playSnap();
        const item = boardManager.getLetterData(this.selectedLetterChar) || ALL_ARABIC_LETTERS_DATA[0];
        if (pos === 'init') SoundEngine.speakArabic(`${item.init} في أول الكلمة مثل ${item.exInit}`);
        if (pos === 'med') SoundEngine.speakArabic(`${item.med} في وسط الكلمة مثل ${item.exMed}`);
        if (pos === 'fin') SoundEngine.speakArabic(`${item.fin} في آخر الكلمة متصل مثل ${item.exFin}`);
        if (pos === 'iso') SoundEngine.speakArabic(`${item.iso} منفصل مثل ${item.exIso}`);
      },

      sendAllToBoard() {
        const item = boardManager.getLetterData(this.selectedLetterChar) || ALL_ARABIC_LETTERS_DATA[0];
        boardManager.activeLetterChar = item.char;
        boardManager.placeCurrentLetterRow();
        app.switchTab('giant-board');
      }
    };

    /* ====================================================================
       Pyramid Reading Manager (Dual 47*32 cm Boards - Declared ONCE)
       ==================================================================== */
    const pyramidManager = {
      activeBoardType: 'short',

      presetsShort: {
        'كَتَبَ': { t1: 'كَـ', t2: 'كَتَـ', t3: 'كَتَبَ' },
        'دَرَسَ': { t1: 'دَ', t2: 'دَرَ', t3: 'دَرَسَ' },
        'رَسَمَ': { t1: 'رَ', t2: 'رَسَـ', t3: 'رَسَمَ' },
        'جَمَلٌ': { t1: 'جَـ', t2: 'جَمَـ', t3: 'جَمَلٌ' },
        'قَرَأَ': { t1: 'قَـ', t2: 'قَرَ', t3: 'قَرَأَ' },
        'صَدَقَ': { t1: 'صَـ', t2: 'صَدَ', t3: 'صَدَقَ' }
      },

      presetsMadd: {
        'صَالِحٌ': { t1: 'صَـ', t2: 'صَا', t3: 'صَالِحٌ' },
        'سِيرَةٌ': { t1: 'سِـ', t2: 'سِي', t3: 'سِيرَةٌ' },
        'نُورٌ': { t1: 'نُـ', t2: 'نُو', t3: 'نُورٌ' },
        'تَاجِرٌ': { t1: 'تَـ', t2: 'تَا', t3: 'تَاجِرٌ' },
        'طَبِيبٌ': { t1: 'طَـ', t2: 'طَبِي', t3: 'طَبِيبٌ' },
        'حُورٌ': { t1: 'حُـ', t2: 'حُو', t3: 'حُورٌ' }
      },

      current: null,

      init() {
        this.switchBoard('short');
      },

      switchBoard(type) {
        this.activeBoardType = type;
        SoundEngine.playSnap();

        const btnShort = document.getElementById('pyrBoardShortBtn');
        const btnMadd = document.getElementById('pyrBoardMaddBtn');
        const titleSpan = document.getElementById('currentPyrBoardTitle');

        if (type === 'short') {
          if (btnShort) btnShort.className = 'px-3 py-1.5 rounded-xl text-xs font-black bg-white shadow-xs text-blue-800 transition';
          if (btnMadd) btnMadd.className = 'px-3 py-1.5 rounded-xl text-xs font-black text-slate-600 hover:text-slate-900 transition';
          if (titleSpan) titleSpan.textContent = 'لوحة ١: الحركات القصيرة والكلمات الثلاثية (47 × 32 سم)';
          this.renderPresetsList(this.presetsShort);
          this.loadWord('كَتَبَ', this.presetsShort['كَتَبَ']);
        } else {
          if (btnMadd) btnMadd.className = 'px-3 py-1.5 rounded-xl text-xs font-black bg-white shadow-xs text-blue-800 transition';
          if (btnShort) btnShort.className = 'px-3 py-1.5 rounded-xl text-xs font-black text-slate-600 hover:text-slate-900 transition';
          if (titleSpan) titleSpan.textContent = 'لوحة ٢: المدود والتركيب التدرجي (47 × 32 سم)';
          this.renderPresetsList(this.presetsMadd);
          this.loadWord('صَالِحٌ', this.presetsMadd['صَالِحٌ']);
        }
      },

      renderPresetsList(dict) {
        const container = document.getElementById('pyramidPresetsList');
        if (!container) return;
        container.innerHTML = Object.keys(dict).map(w => `
          <button data-onclick="pyramidManager.loadWord('${w}')" 
                  class="px-2.5 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 font-extrabold text-xs transition">
            ${w}
          </button>
        `).join('');
      },

      loadWord(word, customObj) {
        SoundEngine.playSnap();
        const dict = this.activeBoardType === 'short' ? this.presetsShort : this.presetsMadd;
        const p = customObj || dict[word] || this.presetsShort['كَتَبَ'];
        this.current = p;

        const t1 = document.getElementById('tier1');
        const t2 = document.getElementById('tier2');
        const t3 = document.getElementById('tier3');
        if (t1) t1.textContent = p.t1;
        if (t2) t2.textContent = p.t2;
        if (t3) t3.textContent = p.t3;
      },

      speakTier(step) {
        if (!this.current) return;
        SoundEngine.playSnap();
        if (step === 1) SoundEngine.speakArabic(this.current.t1);
        if (step === 2) SoundEngine.speakArabic(this.current.t2);
        if (step === 3) {
          SoundEngine.playVictory();
          SoundEngine.speakArabic(this.current.t3);
          confetti({ particleCount: 30, spread: 55, origin: { y: 0.7 } });
        }
      },

      async readFullStepByStep() {
        if (!this.current) return;
        SoundEngine.playSnap();

        await SoundEngine.speakSequence(
          [this.current.t1, this.current.t2, this.current.t3],
          stepIndex => {
            const step = stepIndex + 1;
            this.highlightTier(step);
            if (step === 3) {
              SoundEngine.playVictory();
              confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
            }
          }
        );
      },

      highlightTier(step) {
        [1, 2, 3].forEach(s => {
          const btn = document.getElementById(`tierBtn${s}`);
          if (btn) btn.classList.remove('ring-4', 'ring-amber-400', 'scale-105');
        });
        const active = document.getElementById(`tierBtn${step}`);
        if (active) {
          active.classList.add('ring-4', 'ring-amber-400', 'scale-105');
          setTimeout(() => active.classList.remove('ring-4', 'ring-amber-400', 'scale-105'), 1200);
        }
      },

      buildCustom() {
        const inp = document.getElementById('customPyramidWord');
        const val = (inp && inp.value ? inp.value.trim() : '');
        const units = ArabicText.letterUnits(val);

        if (units.length < 2 || units.length > 3) {
          app.showToast("اكتبي كلمة من حرفين أو ثلاثة حروف، مع الحركات إن وجدت");
          return;
        }

        const first = units[0];
        const firstTwo = units.slice(0, 2).join('');
        const t1 = ArabicText.addDisplayTail(first, units[0]);
        const t2 = ArabicText.addDisplayTail(firstTwo, units[1]);
        const t3 = units.join('');

        this.current = { t1, t2, t3 };
        const el1 = document.getElementById('tier1');
        const el2 = document.getElementById('tier2');
        const el3 = document.getElementById('tier3');
        if (el1) el1.textContent = t1;
        if (el2) el2.textContent = t2;
        if (el3) el3.textContent = t3;
        SoundEngine.playVictory();
        app.showToast(`تم بناء هرم الكلمة: ${t3}`);
      }
    };

    /* ====================================================================
       Bear Analyzer Manager (Dual-Faced 29*21 cm Cards - Declared ONCE)
       ==================================================================== */
    const bearManager = {
      activeSide: 'phonetic',
      
      presetData: {
        'صُنْدُوقٌ': {
          phonetic: { parts: ['صُنْ', 'دُو', 'قٌ', '—'], rules: ['مقطع ساكن', 'مد بالواو', 'تنوين ضم', 'فارغة'] },
          letters: { parts: ['صُـ', 'ـنْـ', 'ـدُ', 'و'], rules: ['حرف الصاد', 'حرف النون', 'حرف الدال', 'حرف الواو'] }
        },
        'صَحِيفَةٌ': {
          phonetic: { parts: ['صَـ', 'حِي', 'فَـ', 'ةٌ'], rules: ['متحرك', 'مد بالياء', 'متحرك', 'تاء مربوطة'] },
          letters: { parts: ['صَـ', 'ـحِـ', 'ـيـ', 'ـفَـ'], rules: ['حرف الصاد', 'حرف الحاء', 'حرف الياء', 'حرف الفاء'] }
        },
        'مَدْرَسَةٌ': {
          phonetic: { parts: ['مَدْ', 'رَ', 'سَ', 'ةٌ'], rules: ['مقطع ساكن', 'متحرك', 'متحرك', 'تاء مربوطة'] },
          letters: { parts: ['مَـ', 'ـدْ', 'رَ', 'سَـ'], rules: ['حرف الميم', 'حرف الدال', 'حرف الراء', 'حرف السين'] }
        },
        'كِتَابٌ': {
          phonetic: { parts: ['كِـ', 'تَا', 'بٌ', '—'], rules: ['متحرك', 'مد بالألف', 'تنوين ضم', 'فارغة'] },
          letters: { parts: ['كِـ', 'ـتَـ', 'ا', 'بٌ'], rules: ['حرف الكاف', 'حرف التاء', 'حرف الألف', 'حرف الباء'] }
        },
        'عُصْفُورٌ': {
          phonetic: { parts: ['عُصْ', 'فُو', 'رٌ', '—'], rules: ['مقطع ساكن', 'مد بالواو', 'تنوين ضم', 'فارغة'] },
          letters: { parts: ['عُـ', 'ـصْـ', 'ـفُـ', 'و'], rules: ['حرف العين', 'حرف الصاد', 'حرف الفاء', 'حرف الواو'] }
        }
      },

      init() {
        this.loadWord('صُنْدُوقٌ');
      },

      setCardSide(side) {
        SoundEngine.playSnap();
        this.activeSide = side;

        const btnPhonetic = document.getElementById('bearSidePhoneticBtn');
        const btnLetters = document.getElementById('bearSideLettersBtn');
        const indicator = document.getElementById('bearSideIndicator');

        if (side === 'phonetic') {
          if (btnPhonetic) btnPhonetic.className = 'px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-white shadow-xs transition';
          if (btnLetters) btnLetters.className = 'px-3 py-1.5 rounded-xl text-xs font-black text-amber-900 hover:bg-amber-100 transition';
          if (indicator) indicator.textContent = 'الوجه الأول: التحليل الصوتي المقطعي (الساكن مع قبله والمد مع الممدود)';
        } else {
          if (btnLetters) btnLetters.className = 'px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-white shadow-xs transition';
          if (btnPhonetic) btnPhonetic.className = 'px-3 py-1.5 rounded-xl text-xs font-black text-amber-900 hover:bg-amber-100 transition';
          if (indicator) indicator.textContent = 'الوجه الثاني: التحليل الهجائي وتجريد الحروف الفردية';
        }

        const inputWord = (document.getElementById('bearWordInput')?.value || '').trim() || 'صُنْدُوقٌ';
        this.loadWord(inputWord);
      },

      loadWord(word) {
        SoundEngine.playSnap();
        const input = document.getElementById('bearWordInput');
        if (input) input.value = word;

        // نعيد التحليل ديناميكيًا حتى تظهر هيئة كل حرف بحسب موقعه الحقيقي داخل الكلمة.
        this.analyzeDynamic(word);
      },

      displayParts(parts, rules) {
        for (let i = 1; i <= 4; i++) {
          const p = parts[i - 1] || '—';
          const r = rules ? (rules[i - 1] || '') : '';
          const box = document.getElementById(`bearBox${i}`);
          if (box) box.textContent = p;
          const ruleEl = document.getElementById(`bearRule${i}`);
          if (ruleEl) ruleEl.textContent = r || (p === '—' ? 'فارغة' : 'مقطع');
        }
      },

      analyzeInput() {
        const word = (document.getElementById('bearWordInput')?.value || '').trim();
        if (!word) return;
        SoundEngine.playVictory();
        this.loadWord(word);
        app.showToast(`تم تحليل كلمة: ${word}`);
      },

      contextualUnit(unit, index, units) {
        const base = ArabicText.base(unit);
        const prevBase = index > 0 ? ArabicText.base(units[index - 1]) : '';
        const nextBase = index < units.length - 1 ? ArabicText.base(units[index + 1]) : '';
        const connectPrev = Boolean(prevBase) && boardManager.canConnectToNext(prevBase) && base !== 'ء';
        const connectNext = Boolean(nextBase) && boardManager.canConnectToNext(base) && nextBase !== 'ء';
        const form = boardManager.contextualGlyph(base, connectPrev, connectNext);
        return boardManager.composeGlyphWithMarks(form.glyph, ArabicText.marks(unit));
      },

      joinContextualUnits(units, indexes) {
        return indexes.map(i => this.contextualUnit(units[i], i, units)).join('').replace(/ـ{2,}/g, 'ـ');
      },

      contextualPhoneticParts(word) {
        const units = ArabicText.letterUnits(word);
        const parts = [];
        const rules = [];
        let i = 0;
        while (i < units.length) {
          const current = units[i];
          const next = units[i + 1];
          if (next && ArabicText.hasMark(next, 'ْ')) {
            parts.push(this.joinContextualUnits(units, [i, i + 1]));
            rules.push('مقطع ساكن');
            i += 2;
            continue;
          }
          if (next && ArabicText.isMaddPair(current, next)) {
            parts.push(this.joinContextualUnits(units, [i, i + 1]));
            rules.push(ArabicText.maddRule(current, next));
            i += 2;
            continue;
          }
          parts.push(this.joinContextualUnits(units, [i]));
          rules.push(ArabicText.unitRule(current));
          i += 1;
        }
        return { parts, rules };
      },

      analyzeDynamic(word) {
        let parts = [];
        let rules = [];
        const units = ArabicText.letterUnits(word);

        if (this.activeSide === 'letters') {
          parts = units.map((unit, index) => this.contextualUnit(unit, index, units));
          rules = units.map(unit => {
            const base = ArabicText.base(unit);
            const meta = boardManager.getLetterData(base);
            return meta ? `حرف ${meta.name}` : ArabicText.unitRule(unit);
          });
        } else {
          const analyzed = this.contextualPhoneticParts(word);
          parts = analyzed.parts;
          rules = analyzed.rules;
        }

        const fitted = ArabicText.fitToFour(parts, rules);
        this.displayParts(fitted.parts, fitted.rules);
      },

      speakBox(idx) {
        const box = document.getElementById(`bearBox${idx}`);
        if (!box) return;
        const text = box.textContent.replace('—', '').trim();
        if (!text) return;
        SoundEngine.playSnap();
        SoundEngine.speakArabic(text);
      },

      pronounceAllParts() {
        const getB = id => document.getElementById(id)?.textContent.replace('—', '').trim() || '';
        const parts = [getB('bearBox1'), getB('bearBox2'), getB('bearBox3'), getB('bearBox4')].filter(Boolean);

        if (parts.length === 0) return;
        SoundEngine.playVictory();
        SoundEngine.speakArabic(parts.join(' .. '));
      }
    };

    /* ====================================================================
       Reward Cards Manager (40 Cards)
       ==================================================================== */
    const rewardsManager = {
      category: 'spelling',

      cardsSpelling: [
        { title: 'ملكة الإملاء', icon: '👑', text: 'لكل حرف رسمتِه بإتقان.. دمتِ فخراً ومعلمة للمستقبل!' },
        { title: 'عبقرية الهمزات', icon: '⚡', text: 'همزاتكِ ثابتة كالنجوم في سماء الإتقان والتميز!' },
        { title: 'فارسة التنوين', icon: '✨', text: 'ألحان التنوين تشرق بجمال في خطك الجميل!' },
        { title: 'أميرة التاء المربوطة', icon: '🌸', text: 'فرّقتِ بين التاء والهاء بذكاء وفطنة فائقة!' },
        { title: 'نجمة الخط والضبط', icon: '⭐', text: 'خطكِ المنظم وحركاتكِ تزيد الكلمات بهاءً!' },
        { title: 'صائدة الأخطاء', icon: '🎯', text: 'عينكِ الذكية تكتشف وتصحح بكل ثقة وتفوق!' },
        { title: 'ملكة اللام الشمسية', icon: '☀️', text: 'تألق مشرق في تمييز اللام الشمسية وحركاتها!' },
        { title: 'ملكة اللام القمرية', icon: '🌙', text: 'نور اللام القمرية ساطع في إملائكِ الراقي!' },
        { title: 'فراشة الإملاء', icon: '🦋', text: 'تتنقلين بين الكلمات بخفة وإبداع لا يُضاهى!' },
        { title: 'درّة الصف المتقنة', icon: '💎', text: 'إتقان نادر وجوهرة متألقة بين التلميذات!' },
        { title: 'وسام الشجاعة الإملائية', icon: '🏅', text: 'تنتصرين على أصعب الكلمات بثقة وبراعة!' },
        { title: 'مبتكرة الجمل', icon: '🎨', text: 'تأليف رائع وإملاء سليم يبهج القلب!' },
        { title: 'تاج المثابرة', icon: '👸', text: 'بجهدكِ اليومي حققتِ أعلى درجات التفوق!' },
        { title: 'نبع الإتقان', icon: '🌊', text: 'في كل سطر تسطرينه يفيض الإتقان كالنبع!' },
        { title: 'سفيرة الفصاحة', icon: '🕊️', text: 'حروفكِ تعكس لغة الضاد بكل هيبة وجمال!' },
        { title: 'فارسة السكون', icon: '🪐', text: 'وقوفكِ الهادئ عند السكون علامة المتقنين!' },
        { title: 'شعلة الإبداع', icon: '🔥', text: 'حماسكِ في حصة الإملاء يضيء الفصل كاملاً!' },
        { title: 'زهرة الصف', icon: '🌷', text: 'جمال الحرف ورقة الأسلوب عنوان إبداعك!' },
        { title: 'ملكة الكلمات الذهبية', icon: '🥇', text: 'حروفكِ من ذهب وفهمكِ في القمة دائماً!' },
        { title: 'درع التميز الإملائي', icon: '🛡️', text: 'استحقاق كامل لأعلى وسام في لغتي الجميلة!' }
      ],

      cardsReading: [
        { title: 'قارئة المستقبل', icon: '🚀', text: 'صوتكِ الواثق ينبئ بمستقبل مشرق وعظيم!' },
        { title: 'فراشة القراءة', icon: '🦋', text: 'تطيرين بين سطور الكتاب بأناقة وطلاقة ساحرة!' },
        { title: 'نغمة الفصاحة', icon: '🎶', text: 'قراءتكِ عذبة كأجمل الألحان الفصيحة!' },
        { title: 'طلاقة بلا تردد', icon: '⚡', text: 'تجاوزتِ العقبات وقرأتِ بانسجام ويسر!' },
        { title: 'مستكشفة القصص', icon: '🗺️', text: 'شغفكِ بالقراءة يفتح أمامكِ عوالم المعرفة!' },
        { title: 'صاحبة الصوت الرنان', icon: '🔔', text: 'نبراتكِ المعبرة تحيي معاني الكلمات بجمال!' },
        { title: 'تاج التميز القرائي', icon: '👑', text: 'توجتِ جهودكِ بطلاقة تستحق كل التصفيق!' },
        { title: 'لؤلؤة البيان', icon: '🦪', text: 'بيان ساحر ومخارج حروف متقنة كاللؤلؤ!' },
        { title: 'بطلة الفهم والاستيعاب', icon: '💡', text: 'تقرئين بعقلكِ وقلبكِ وتفهمين ما وراء السطور!' },
        { title: 'قارئة الشغف', icon: '❤️', text: 'حبكِ للغة العربية ينبض في كل صفحة تقرئينها!' },
        { title: 'أميرة الأداء التعبيري', icon: '🎭', text: 'تلوين صوتكِ يجذب انتباه الجميع بحماس!' },
        { title: 'فارسة الوقوف والوصل', icon: '🚦', text: 'تراعين علامات الترقيم كقارئة محترفة!' },
        { title: 'شمس القراءة', icon: '🌞', text: 'طلتكِ عند القراءة تملأ الفصل بهجة وضياء!' },
        { title: 'عاشقة الكتب', icon: '📚', text: 'الكتاب صديقكِ الأوفى ورفيق دربكِ نحو القمة!' },
        { title: 'بلبل الصف الصداح', icon: '🐦', text: 'صوتكِ الجميل يغرد بأحلى الكلمات العربية!' },
        { title: 'ملكة الحوار والنقاش', icon: '💬', text: 'تقرئين وتناقشين بذكاء ولطف وأدب جم!' },
        { title: 'قدوة في الطلاقة', icon: '🌟', text: 'زميلاتكِ يتعلمن منكِ الثقة وسلامة النطق!' },
        { title: 'حارسة مخارج الحروف', icon: '🗝️', text: 'كل حرف يأخذ حقه ومستحقه بلسان فصيح!' },
        { title: 'سفيرة القراءة الحرة', icon: '📖', text: 'تتحدين ذاتكِ في قراءة أكبر عدد من الكتب!' },
        { title: 'وسام الشرف اللغوي', icon: '🎖️', text: 'تقدير استثنائي لإتقانكِ الباهر في القراءة!' }
      ],

      init() {
        this.render();
      },

      setCategory(cat) {
        SoundEngine.playSnap();
        this.category = cat;
        const spBtn = document.getElementById('catSpellingBtn');
        const rdBtn = document.getElementById('catReadingBtn');

        if (cat === 'spelling') {
          if (spBtn) spBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-pink-600 text-white shadow-sm flex items-center gap-1.5 transition';
          if (rdBtn) rdBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition';
        } else {
          if (spBtn) spBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition';
          if (rdBtn) rdBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-purple-600 text-white shadow-sm flex items-center gap-1.5 transition';
        }
        this.render();
      },

      render() {
        const container = document.getElementById('rewardCardsContainer');
        if (!container) return;
        const list = this.category === 'spelling' ? this.cardsSpelling : this.cardsReading;

        container.innerHTML = list.map((card, i) => `
          <div data-onclick="rewardsManager.openAward('${card.title}', '${card.text}')" 
               class="bg-white rounded-3xl p-3 sm:p-4 border-2 border-slate-200 hover:border-pink-300 shadow-sm transition transform hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center group">
            <span class="text-3xl sm:text-4xl mb-1 group-hover:scale-110 transition-transform">${card.icon}</span>
            <h4 class="text-xs sm:text-sm font-black text-slate-900">${card.title}</h4>
            <span class="text-[10px] text-pink-600 font-extrabold bg-pink-50 px-2 py-0.5 rounded-full mt-1">بطاقة #${i + 1}</span>
            <p class="text-[11px] text-slate-500 mt-1 line-clamp-2">${card.text}</p>
            <button class="mt-2 text-[11px] text-white bg-pink-600 group-hover:bg-pink-700 font-bold px-3 py-1 rounded-xl shadow-xs transition">
              منح البطاقة 🎖️
            </button>
          </div>
        `).join('');
      },

      openAward(title, quote) {
        SoundEngine.playVictory();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });

        const student = (document.getElementById('rewardStudentName')?.value || 'سارة').trim();
        const titleEl = document.getElementById('modalAwardTitle');
        const stEl = document.getElementById('modalAwardStudent');
        const quoteEl = document.getElementById('modalAwardQuote');
        if (titleEl) titleEl.textContent = title;
        if (stEl) stEl.textContent = student;
        if (quoteEl) quoteEl.textContent = `"${quote}"`;

        const modal = document.getElementById('badgeAwardModal');
        if (modal) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
        }

        SoundEngine.speakArabic(`مبارك يا ${student}! حصلتِ على وسام: ${title}`);
      },

      closeAwardModal() {
        const modal = document.getElementById('badgeAwardModal');
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      },

      cheer() {
        SoundEngine.playVictory();
        confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 } });
      }
    };

    /* ====================================================================
       Whiteboard Pen Controller
       ==================================================================== */
    const whiteboardPen = {
      canvas: null,
      ctx: null,
      drawing: false,
      color: '#2563EB',
      size: 5,
      isEraser: false,
      strokes: [],
      currentStroke: null,
      cssWidth: 1,
      cssHeight: 1,
      dpr: 1,

      init() {
        this.canvas = document.getElementById('interactiveCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });
        this.canvas.style.touchAction = 'none';
        this.applyGuideBackground();
        this.resize({ preserve: true });

        let resizeTimer = null;
        const requestResize = () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => this.resize({ preserve: true }), 80);
        };
        window.addEventListener('resize', requestResize);
        window.visualViewport?.addEventListener('resize', requestResize);
        if (window.ResizeObserver && this.canvas.parentElement) {
          this._resizeObserver = new ResizeObserver(requestResize);
          this._resizeObserver.observe(this.canvas.parentElement);
        }

        this.canvas.addEventListener('pointerdown', e => this.start(e), { passive: false });
        this.canvas.addEventListener('pointermove', e => this.draw(e), { passive: false });
        this.canvas.addEventListener('pointerup', e => this.stop(e), { passive: false });
        this.canvas.addEventListener('pointercancel', e => this.stop(e), { passive: false });
        this.canvas.addEventListener('pointerleave', e => {
          if (e.pointerType === 'mouse' && this.drawing) this.stop(e);
        });

        // دعم احتياطي لأجهزة iOS/Android القديمة التي لا ترسل Pointer Events للـCanvas بصورة مستقرة.
        if (!('PointerEvent' in window)) {
          this.canvas.addEventListener('touchstart', e => this.startTouch(e), { passive: false });
          this.canvas.addEventListener('touchmove', e => this.drawTouch(e), { passive: false });
          this.canvas.addEventListener('touchend', e => this.stopTouch(e), { passive: false });
          this.canvas.addEventListener('touchcancel', e => this.stopTouch(e), { passive: false });
        }
      },

      applyGuideBackground() {
        if (!this.canvas) return;
        this.canvas.style.backgroundColor = '#ffffff';
        this.canvas.style.backgroundImage = 'repeating-linear-gradient(to bottom, transparent 0, transparent 44px, #e2e8f0 44px, #e2e8f0 45.5px)';
        this.canvas.style.backgroundSize = '100% 45px';
      },

      resize() {
        if (!this.canvas) return;
        const host = this.canvas.parentElement || this.canvas;
        const rect = host.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width || this.canvas.getBoundingClientRect().width));
        const height = Math.max(260, Math.round(rect.height || this.canvas.getBoundingClientRect().height || 320));
        const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
        if (width === this.cssWidth && height === this.cssHeight && dpr === this.dpr && this.canvas.width > 0) return;

        this.cssWidth = width;
        this.cssHeight = height;
        this.dpr = dpr;
        this.canvas.width = Math.round(width * dpr);
        this.canvas.height = Math.round(height * dpr);
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.applyGuideBackground();
        this.redraw();
      },

      pointFromEvent(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
          x: Math.max(0, Math.min(this.cssWidth, e.clientX - rect.left)),
          y: Math.max(0, Math.min(this.cssHeight, e.clientY - rect.top)),
          pressure: e.pressure && e.pressure > 0 ? e.pressure : 0.5
        };
      },

      normalizePoint(point) {
        return {
          x: this.cssWidth ? point.x / this.cssWidth : 0,
          y: this.cssHeight ? point.y / this.cssHeight : 0,
          pressure: point.pressure ?? 0.5
        };
      },

      denormalizePoint(point) {
        return {
          x: point.x * this.cssWidth,
          y: point.y * this.cssHeight,
          pressure: point.pressure ?? 0.5
        };
      },

      start(e) {
        if (!this.ctx || (e.pointerType === 'mouse' && e.button !== 0)) return;
        e.preventDefault();
        this.drawing = true;
        try { this.canvas.setPointerCapture(e.pointerId); } catch (_) {}
        const point = this.pointFromEvent(e);
        this.currentStroke = {
          color: this.color,
          size: this.size,
          eraser: this.isEraser,
          points: [this.normalizePoint(point)]
        };
        // نقطة صغيرة عند اللمس/النقر وحده.
        this.drawDot(point, this.currentStroke);
      },

      draw(e) {
        if (!this.drawing || !this.currentStroke || !this.ctx) return;
        e.preventDefault();
        const coalesced = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : null;
        const samples = coalesced && coalesced.length ? coalesced : [e];
        for (const sample of samples) {
          const p = this.pointFromEvent(sample);
          const normalized = this.normalizePoint(p);
          const last = this.currentStroke.points[this.currentStroke.points.length - 1];
          if (last) {
            const dx = normalized.x - last.x;
            const dy = normalized.y - last.y;
            if ((dx * dx + dy * dy) < 0.000002) continue;
          }
          this.currentStroke.points.push(normalized);
          this.drawLatestSegment(this.currentStroke);
        }
      },

      stop(e) {
        if (!this.drawing) return;
        this.drawing = false;
        if (this.currentStroke?.points?.length) this.strokes.push(this.currentStroke);
        this.currentStroke = null;
        if (this.ctx) this.ctx.globalCompositeOperation = 'source-over';
        if (e) {
          try { this.canvas.releasePointerCapture(e.pointerId); } catch (_) {}
        }
      },

      touchPoint(touch) {
        const rect = this.canvas.getBoundingClientRect();
        return {
          x: Math.max(0, Math.min(this.cssWidth, touch.clientX - rect.left)),
          y: Math.max(0, Math.min(this.cssHeight, touch.clientY - rect.top)),
          pressure: Number.isFinite(touch.force) && touch.force > 0 ? touch.force : 0.5
        };
      },

      startTouch(e) {
        if (!e.touches?.length || !this.ctx) return;
        e.preventDefault();
        this.drawing = true;
        const point = this.touchPoint(e.touches[0]);
        this.currentStroke = { color: this.color, size: this.size, eraser: this.isEraser, points: [this.normalizePoint(point)] };
        this.drawDot(point, this.currentStroke);
      },

      drawTouch(e) {
        if (!this.drawing || !this.currentStroke || !e.touches?.length) return;
        e.preventDefault();
        const point = this.touchPoint(e.touches[0]);
        this.currentStroke.points.push(this.normalizePoint(point));
        this.drawLatestSegment(this.currentStroke);
      },

      stopTouch(e) {
        e?.preventDefault?.();
        this.stop();
      },

      configureStroke(stroke, pressure = 0.5) {
        const ctx = this.ctx;
        ctx.globalCompositeOperation = stroke.eraser ? 'destination-out' : 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.fillStyle = stroke.color;
        const pressureFactor = 0.82 + Math.min(1, Math.max(0, pressure)) * 0.36;
        ctx.lineWidth = (stroke.eraser ? stroke.size * 3.4 : stroke.size) * pressureFactor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      },

      drawDot(point, stroke) {
        this.configureStroke(stroke, point.pressure);
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, Math.max(1, this.ctx.lineWidth / 2), 0, Math.PI * 2);
        this.ctx.fill();
      },

      drawLatestSegment(stroke) {
        const points = stroke.points;
        if (points.length < 2) return;
        const p1 = this.denormalizePoint(points[Math.max(0, points.length - 3)]);
        const p2 = this.denormalizePoint(points[points.length - 2]);
        const p3 = this.denormalizePoint(points[points.length - 1]);
        this.configureStroke(stroke, p3.pressure);
        this.ctx.beginPath();
        if (points.length === 2) {
          this.ctx.moveTo(p2.x, p2.y);
          this.ctx.lineTo(p3.x, p3.y);
        } else {
          const mid1 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
          const mid2 = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };
          this.ctx.moveTo(mid1.x, mid1.y);
          this.ctx.quadraticCurveTo(p2.x, p2.y, mid2.x, mid2.y);
        }
        this.ctx.stroke();
      },

      drawStroke(stroke) {
        if (!stroke.points?.length) return;
        if (stroke.points.length === 1) {
          this.drawDot(this.denormalizePoint(stroke.points[0]), stroke);
          return;
        }
        const pts = stroke.points.map(p => this.denormalizePoint(p));
        this.configureStroke(stroke, pts[0].pressure);
        this.ctx.beginPath();
        this.ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const midX = (pts[i].x + pts[i + 1].x) / 2;
          const midY = (pts[i].y + pts[i + 1].y) / 2;
          this.ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
        }
        const last = pts[pts.length - 1];
        this.ctx.lineTo(last.x, last.y);
        this.ctx.stroke();
      },

      redraw() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        for (const stroke of this.strokes) this.drawStroke(stroke);
        if (this.currentStroke) this.drawStroke(this.currentStroke);
        this.ctx.globalCompositeOperation = 'source-over';
      },

      drawGuideLines() { this.applyGuideBackground(); },

      setColor(c) {
        SoundEngine.playSnap();
        this.color = c;
        this.isEraser = false;
        const btn = document.getElementById('penEraserBtn');
        if (btn) btn.classList.remove('ring-2', 'ring-pink-500');
      },

      setSize(value) {
        const n = Number(value);
        if (Number.isFinite(n)) this.size = Math.max(2, Math.min(18, n));
        const out = document.getElementById('penSizeValue');
        if (out) out.textContent = `${this.size}px`;
      },

      setEraser() {
        SoundEngine.playSnap();
        this.isEraser = true;
        const btn = document.getElementById('penEraserBtn');
        if (btn) btn.classList.add('ring-2', 'ring-pink-500');
      },

      undo() {
        if (!this.strokes.length) return;
        this.strokes.pop();
        SoundEngine.playSnap();
        this.redraw();
      },

      clear() {
        SoundEngine.playSnap();
        this.strokes = [];
        this.currentStroke = null;
        this.redraw();
        this.applyGuideBackground();
      }
    };


    /* ====================================================================
       App Main Controller
       ==================================================================== */
    const app = {
      currentFont: 'font-baloo',

      init() {
        // Apply default kid-friendly font class
        document.body.classList.add(this.currentFont);

        boardManager.init();
        vowelPosters.init();
        positionsTable.init();
        pyramidManager.init();
        bearManager.init();
        rewardsManager.init();
        whiteboardPen.init();
        fontStudio.init();

        document.body.addEventListener('click', () => {
          SoundEngine.init();
        }, { once: true });
      },

      changeAppFont(fontClass) {
        SoundEngine.playSnap();
        // Remove previous font classes
        FONT_REPOSITORY.forEach(f => document.body.classList.remove(f.id));
        
        this.currentFont = fontClass;
        document.body.classList.add(fontClass);

        const sel = document.getElementById('appFontPicker');
        if (sel && sel.value !== fontClass) sel.value = fontClass;

        const fontMeta = FONT_REPOSITORY.find(f => f.id === fontClass);
        const fontName = fontMeta ? fontMeta.nameAr : fontClass;

        this.showToast(`تم تفعيل الخط: ${fontName}`);
        
        fontStudio.updateActiveBadge();
        
        // Refresh board and shapes spotlight to sync layout
        boardManager.renderBoard();
        boardManager.renderLetterShapesSpotlight();
      },

      switchTab(tabId) {
        SoundEngine.playSnap();
        document.querySelectorAll('.station-view').forEach(el => el.classList.add('hidden'));
        const target = document.getElementById(`station-${tabId}`);
        if (target) target.classList.remove('hidden');

        document.querySelectorAll('.tab-btn').forEach(btn => {
          btn.className = 'tab-btn px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 text-slate-700 hover:bg-slate-200 transition';
        });
        const active = document.getElementById(`tab-${tabId}`);
        if (active) {
          active.className = 'tab-btn active px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 bg-rose-600 text-white shadow-sm transition';
        }
      },

      toggleAudio() {
        SoundEngine.isMuted = !SoundEngine.isMuted;
        const icon = document.getElementById('soundIcon');
        const label = document.getElementById('soundLabel');
        if (SoundEngine.isMuted) {
          if (icon) icon.textContent = '🔇';
          if (label) label.textContent = 'صامت';
          this.showToast("تم كتم المؤثرات الصوتية");
        } else {
          if (icon) icon.textContent = '🔊';
          if (label) label.textContent = 'الصوت مفعّل';
          SoundEngine.playSnap();
          this.showToast("تم تفعيل المؤثرات الصوتية");
        }
      },

      toggleWhiteboardOverlay() {
        SoundEngine.playSnap();
        const modal = document.getElementById('whiteboardOverlayModal');
        if (!modal) return;
        if (modal.classList.contains('hidden')) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
          requestAnimationFrame(() => requestAnimationFrame(() => whiteboardPen.resize({ preserve: true })));
        } else {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      },

      showToast(msg) {
        const toast = document.getElementById('toast');
        const label = document.getElementById('toastMsg');
        if (!toast || !label) return;
        label.textContent = msg;
        toast.style.opacity = '1';
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
          toast.style.opacity = '0';
        }, 2200);
      }
    };

    
// Security-hardened declarative UI dispatcher.
// No eval/new Function. Only explicit controllers and method names are callable.
const ACTION_ROOTS = Object.freeze({
  app,
  boardManager,
  vowelPosters,
  positionsTable,
  pyramidManager,
  bearManager,
  rewardsManager,
  whiteboardPen,
  fontStudio
});

function parseActionArg(raw, element) {
  const token = raw.trim();
  if (!token) return undefined;
  if (token === 'this.value') return element?.value;
  if (/^-?\d+(?:\.\d+)?$/.test(token)) return Number(token);
  const quote = token[0];
  if ((quote === "'" || quote === '"') && token[token.length - 1] === quote) {
    return token.slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }
  throw new Error('Unsupported UI action argument');
}

function splitActionArgs(source) {
  const text = source.trim();
  if (!text) return [];
  const parts = [];
  let buf = '', quote = null, escaped = false;
  for (const ch of text) {
    if (escaped) { buf += ch; escaped = false; continue; }
    if (ch === '\\') { buf += ch; escaped = true; continue; }
    if (quote) {
      buf += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"') { quote = ch; buf += ch; continue; }
    if (ch === ',') { parts.push(buf); buf = ''; continue; }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf);
  return parts;
}

function invokeDeclaredAction(action, element, event) {
  let text = String(action || '').trim();
  if (!text) return;

  // Allow only the explicit propagation-control prefix used by piece delete buttons.
  if (text.startsWith('event.stopPropagation();')) {
    event.stopPropagation();
    text = text.slice('event.stopPropagation();'.length).trim();
  }

  // The only conditional handler in the static UI: Enter to add a custom word.
  const enterMatch = text.match(/^if\(event\.key===['"]Enter['"]\)\{(.+)\}$/);
  if (enterMatch) {
    if (event.key !== 'Enter') return;
    return invokeDeclaredAction(enterMatch[1], element, event);
  }

  const match = text.match(/^([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)\((.*)\)$/s);
  if (!match) throw new Error('Blocked unrecognized UI action');
  const [, rootName, methodName, argsSource] = match;
  const root = ACTION_ROOTS[rootName];
  if (!root || methodName.startsWith('_') || typeof root[methodName] !== 'function') {
    throw new Error('Blocked unauthorized UI action');
  }
  const args = splitActionArgs(argsSource).map(arg => parseActionArg(arg, element));
  return root[methodName](...args);
}

function installDeclarativeUiHandlers() {
  const mappings = [
    ['click', 'data-onclick'],
    ['change', 'data-onchange'],
    ['input', 'data-oninput'],
    ['keydown', 'data-onkeydown'],
    ['keyup', 'data-onkeyup']
  ];

  for (const [eventName, attrName] of mappings) {
    document.addEventListener(eventName, event => {
      const target = event.target instanceof Element ? event.target.closest(`[${attrName}]`) : null;
      if (!target) return;
      try {
        invokeDeclaredAction(target.getAttribute(attrName), target, event);
      } catch (error) {
        console.warn('Blocked UI action:', error);
      }
    });
  }
}

// Node-only bridge for local unit tests. It is never exposed in browsers.
if (typeof process !== 'undefined' && process.versions?.node) {
  Object.assign(globalThis.window || globalThis, {
    SoundEngine, ArabicText, boardManager, vowelPosters, positionsTable,
    pyramidManager, bearManager, rewardsManager, whiteboardPen, fontStudio, app
  });
}

window.addEventListener('DOMContentLoaded', () => {
  installDeclarativeUiHandlers();
  app.init();
});
