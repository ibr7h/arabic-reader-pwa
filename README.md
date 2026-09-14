# قارئ العربية — Arabic Reader PWA

نموذج ذهبي أولي لتعليم القراءة العربية على iPhone والويب عبر PWA.

## ما يتضمنه الإصدار الحالي

- الحرف التجريبي: **ب**
- الحركات القصيرة: **بَ، بُ، بِ**
- المدود: **بَا، بُو، بِي**
- مقارنة الصوت القصير والطويل
- مواضع حرف الباء في الكلمة
- تدريب الدمج: **كَ + تَ + بَ → كَتَبَ**
- تدريب التهجئة/التجزئة
- محرك صوت هجين: **ملف صوتي مسجل أولًا، ثم Web Speech TTS كخيار احتياطي**
- حفظ التقدم محليًا
- Service Worker للعمل كـ PWA
- تصميم RTL موجه للآيفون

## استراتيجية الصوت

التطبيق يبحث أولًا عن ملف صوتي ثابت داخل `assets/audio/`. إذا لم يوجد الملف بعد، ينتقل تلقائيًا إلى Web Speech API على الجهاز. هذا يسمح باستخدام أصوات Azure Neural TTS بجودة ثابتة مع بقاء التطبيق صالحًا للعمل حتى قبل إضافة الملفات المسجلة.

الملفات المعتمدة في النموذج الأول تشمل:

```text
assets/audio/
├── ba/
│   ├── name.mp3
│   ├── fatha.mp3
│   ├── damma.mp3
│   ├── kasra.mp3
│   ├── long-a.mp3
│   ├── long-u.mp3
│   └── long-i.mp3
├── blend/
│   ├── ka.mp3
│   └── ta.mp3
└── words/
    ├── kataba.mp3
    ├── babun.mp3
    ├── baytun.mp3
    ├── hablun.mp3
    └── kitabun.mp3
```

## توليد الأصوات بواسطة Microsoft Azure Neural TTS

يوجد سكربت جاهز في:

```text
tools/generate_azure_audio.py
```

ثبّت الاعتماد:

```bash
pip install -r requirements-audio.txt
```

ثم عرّف مفاتيح Azure محليًا فقط:

```bash
export AZURE_SPEECH_KEY="YOUR_KEY"
export AZURE_SPEECH_REGION="YOUR_REGION"
```

اختياريًا يمكن تغيير الصوت:

```bash
export AZURE_SPEECH_VOICE="ar-SA-ZariyahNeural"
```

ثم شغّل:

```bash
python3 tools/generate_azure_audio.py
```

سيُنشئ السكربت ملفات MP3 داخل `assets/audio/` دون تخزين مفتاح Azure داخل المشروع أو GitHub.

> **مهم:** لا تضع `AZURE_SPEECH_KEY` داخل JavaScript أو أي ملف عام في المستودع. GitHub Pages مشروع عميل عام وأي مفتاح مضمّن فيه يمكن استخراجه.

## التشغيل محليًا

يجب فتح المشروع عبر خادم محلي (وليس `file://`) لكي يعمل Service Worker وقراءة ملفات JSON بصورة صحيحة.

```bash
python3 -m http.server 8080
```

ثم افتح:

```text
http://localhost:8080
```

## GitHub Pages

يمكن نشر المشروع مباشرة من جذر فرع `main` عبر GitHub Pages باستخدام:

```text
main → /(root)
```

## المرحلة التالية

- توليد واختبار أصوات الحرف **ب** باستخدام Azure على iPhone.
- اختيار الصوت الأنسب بين الأصوات العربية السعودية المتاحة.
- تعميم نموذج البيانات على بقية الحروف.
- بناء ترتيب تعليمي للقراءة لا يعتمد فقط على الترتيب الأبجدي.
- إضافة مفردات مفتوحة بحسب الحروف المتقنة.
- إضافة مراجعة متباعدة وتحليل الأخطاء.
