/**
 * Sukuk Lab date configuration
 * Update only the start date and the rest of the labels will follow automatically
 */
export const PROGRAM_START_DATE = "2026-11-08";
export const PROGRAM_DAYS = 3;
export const PROGRAM_CITY = "الرياض";
export const TARGET_PARTICIPANTS = 100;

function dayDate(index: number) {
  const year = Number(PROGRAM_START_DATE.slice(0, 4));
  const month = Number(PROGRAM_START_DATE.slice(5, 7));
  const day = Number(PROGRAM_START_DATE.slice(8, 10));
  return new Date(Date.UTC(year, month - 1, day + index, 12));
}

const longFormat = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const shortFormat = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const weekdayFormat = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  weekday: "long",
  timeZone: "UTC",
});

export const programDateLabel = `${shortFormat.format(dayDate(0))} — ${longFormat.format(dayDate(PROGRAM_DAYS - 1))}`;
export const firstProgramDay = longFormat.format(dayDate(0));

export const programDays = Array.from({ length: PROGRAM_DAYS }, (_, index) => ({
  iso: dayDate(index).toISOString().slice(0, 10),
  short: shortFormat.format(dayDate(index)),
  full: longFormat.format(dayDate(index)),
  weekday: weekdayFormat.format(dayDate(index)),
}));

export const programAgenda = [
  {
    number: "01",
    eyebrow: "فهم",
    day: "اليوم الأول",
    title: "السياق والانطلاقة",
    description: "مدخل واضح لأدوات الدين وسوق الصكوك السعودي",
    points: [
      "مقدمة في الدخل الثابت وأدوات الدين: الصكوك والسندات والمرابحة",
      "جلسة حوارية عن واقع سوق الصكوك السعودي ورؤية 2030",
      "نقاش مفتوح وتكوين الفرق",
    ],
  },
  {
    number: "02",
    eyebrow: "تقييم",
    day: "اليوم الثاني",
    title: "كيف نقيّم الصك",
    description: "ورشة تطبيقية تقرّب الأرقام من القرار",
    points: [
      "ورشة حسابية: القسيمة وتاريخ الاستحقاق والعائد حتى الاستحقاق وعوامل المخاطر",
      "تمرين جماعي لتقييم صك متداول في السوق السعودي",
      "توزيع دراسة الحالة «صك أم قرض بنكي؟» على الفرق",
    ],
  },
  {
    number: "03",
    eyebrow: "بناء",
    day: "اليوم الثالث",
    title: "من الفكرة إلى الإصدار",
    description: "فهم الهيكلة ثم عرض الحلول أمام اللجنة",
    points: [
      "ورشة هيكلة الإصدار وأدوار البنك المستشار وهيئة السوق المالية والمكتتبين",
      "عروض الفرق أمام لجنة التحكيم لمدة 3–5 دقائق",
      "تكريم الفريق الفائز وتسليم الشهادات والكلمة الختامية",
    ],
  },
];

export const objectives = [
  { title: "فهم أدوات الدين", body: "استيعاب الفروقات بين الصكوك والسندات والمرابحة" },
  { title: "تقييم الصك", body: "قراءة القسيمة والاستحقاق والعائد والمخاطر بصورة عملية" },
  { title: "فهم رحلة الإصدار", body: "التعرّف على الهيكلة وأدوار المستشار والهيئة والمكتتبين" },
  { title: "اتخاذ قرار تمويلي", body: "التدريب على اتخاذ قرار تمويلي مبرّر وعرض النتائج أمام لجنة" },
  { title: "التواصل مع أهل الصناعة", body: "التعرف على الخبرات المهنية وفرص التدريب التعاوني والتوظيف بوصفها من أهداف البرنامج، دون ضمان فرص محددة" },
];

export const experiences = [
  {
    number: "01",
    english: "DIALOGUES",
    title: "جلسات حوارية",
    detail: "قراءة أقرب لواقع سوق الصكوك من منظور أهل الصناعة",
  },
  {
    number: "02",
    english: "WORKSHOPS",
    title: "ورش تطبيقية",
    detail: "تقييم الصك وهيكلة الإصدار بشكل عملي ومباشر",
  },
  {
    number: "03",
    english: "CASE STUDY",
    title: "دراسة حالة",
    detail: "«صك أم قرض بنكي؟» — تعمل الفرق على توصية تمويلية مبررة وتعرضها أمام لجنة التحكيم.",
  },
];

/** مخرجات البرنامج بحسب صفحة 10 من مقترح SUKUK LAB */
export const outcomes = [
  { number: "01", title: "يفهم", detail: "ما الصك، وما الفرق بينه وبين السند والمرابحة" },
  { number: "02", title: "يقيّم", detail: "يحسب العائد حتى الاستحقاق ويقرأ عوامل المخاطر" },
  { number: "03", title: "يبني", detail: "يتعرف على هيكلة الإصدار وأدوار الأطراف المعنية" },
  { number: "04", title: "يُمنح شهادة", detail: "شهادة حضور معتمدة من إثمار والجهة الراعية" },
] as const;
