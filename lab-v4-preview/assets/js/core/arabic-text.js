export const ArabicText = {
  DIACRITIC_RE: /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/u,
  LETTER_RE: /[\u0621-\u063A\u0641-\u064A\u0671\u067E\u0686\u0698\u06A4\u06AF]/u,
  NON_CONNECTING_AFTER: new Set(['ا', 'أ', 'إ', 'آ', 'د', 'ذ', 'ر', 'ز', 'و', 'ؤ', 'ء', 'ة', 'ى']),

  graphemes(text) {
    const normalized = String(text ?? '').normalize('NFC');
    if (!normalized) return [];
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      try {
        const segmenter = new Intl.Segmenter('ar', { granularity: 'grapheme' });
        return Array.from(segmenter.segment(normalized), item => item.segment);
      } catch (e) {}
    }
    const out = [];
    for (const ch of Array.from(normalized)) {
      if (this.DIACRITIC_RE.test(ch) && out.length) out[out.length - 1] += ch;
      else out.push(ch);
    }
    return out;
  },

  base(unit) {
    for (const ch of Array.from(String(unit ?? ''))) {
      if (ch === 'ـ' || this.DIACRITIC_RE.test(ch)) continue;
      if (this.LETTER_RE.test(ch)) return ch;
    }
    return '';
  },

  marks(unit) { return Array.from(String(unit ?? '')).filter(ch => this.DIACRITIC_RE.test(ch)); },

  letterUnits(text) {
    const units = [];
    for (const segment of this.graphemes(text)) {
      if (/^\s+$/u.test(segment) || segment === 'ـ') continue;
      const b = this.base(segment);
      if (b) units.push(segment);
      else if (this.marks(segment).length && units.length) units[units.length - 1] += segment;
    }
    return units;
  },

  hasMark(unit, mark) { return String(unit ?? '').includes(mark); },
  stripMarks(unit) { return Array.from(String(unit ?? '')).filter(ch => !this.DIACRITIC_RE.test(ch) && ch !== 'ـ').join(''); },
  isUnvowelled(unit) { return this.marks(unit).length === 0; },

  isMaddPair(current, next) {
    const nextBase = this.base(next);
    if (!nextBase || !this.isUnvowelled(next)) return false;
    if ((nextBase === 'ا' || nextBase === 'ى') && this.hasMark(current, 'َ')) return true;
    if (nextBase === 'و' && this.hasMark(current, 'ُ')) return true;
    if (nextBase === 'ي' && this.hasMark(current, 'ِ')) return true;
    return false;
  },

  maddRule(current, next) {
    const b = this.base(next);
    if ((b === 'ا' || b === 'ى') && this.hasMark(current, 'َ')) return 'مد بالألف';
    if (b === 'و' && this.hasMark(current, 'ُ')) return 'مد بالواو';
    if (b === 'ي' && this.hasMark(current, 'ِ')) return 'مد بالياء';
    return 'مد وممدود';
  },

  unitRule(unit) {
    if (this.hasMark(unit, 'ً')) return 'تنوين فتح';
    if (this.hasMark(unit, 'ٌ')) return 'تنوين ضم';
    if (this.hasMark(unit, 'ٍ')) return 'تنوين كسر';
    if (this.hasMark(unit, 'ْ')) return 'ساكن';
    if (this.hasMark(unit, 'ّ')) return 'حرف مشدد';
    if (this.hasMark(unit, 'َ') || this.hasMark(unit, 'ُ') || this.hasMark(unit, 'ِ')) return 'حرف متحرك';
    if (this.base(unit) === 'ة') return 'تاء مربوطة';
    return 'حرف';
  },

  phoneticParts(word) {
    const units = this.letterUnits(word);
    const parts = [];
    const rules = [];
    let i = 0;
    while (i < units.length) {
      const current = units[i];
      const next = units[i + 1];
      if (next && this.hasMark(next, 'ْ')) {
        parts.push(current + next);
        rules.push('مقطع ساكن');
        i += 2;
        continue;
      }
      if (next && this.isMaddPair(current, next)) {
        parts.push(current + next);
        rules.push(this.maddRule(current, next));
        i += 2;
        continue;
      }
      parts.push(current);
      rules.push(this.unitRule(current));
      i += 1;
    }
    return { parts, rules };
  },

  fitToFour(parts, rules) {
    const p = [...parts];
    const r = [...rules];
    if (p.length > 4) {
      const overflow = p.slice(3).join('');
      const overflowRules = r.slice(3).filter(Boolean);
      p.splice(3, p.length - 3, overflow);
      r.splice(3, r.length - 3, overflowRules.length > 1 ? 'بقية المقاطع' : (overflowRules[0] || 'مقطع'));
    }
    while (p.length < 4) { p.push('—'); r.push('فارغة'); }
    return { parts: p.slice(0, 4), rules: r.slice(0, 4) };
  },

  addDisplayTail(text, lastUnit) {
    const b = this.base(lastUnit);
    return b && !this.NON_CONNECTING_AFTER.has(b) ? text + 'ـ' : text;
  }
};
