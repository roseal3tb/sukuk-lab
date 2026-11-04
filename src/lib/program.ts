/**
 * Sukuk Lab date configuration
 * Update only the start date and the rest of the labels will follow automatically
 */
export const PROGRAM_START_DATE = "2026-11-08";
export const PROGRAM_DAYS = 3;
export const PROGRAM_CITY = "الرياض";
export const TARGET_PARTICIPANTS = 100;
export const CONTACT_EMAIL = "ethmar.spp@gmail.com";
export const CONTACT_PHONE = "+966 55 820 0444";

function dayDate(index: number) {
  const [year, month, day] = PROGRAM_START_DATE.split("-").map(Number);
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
      "مقدمة في أدوات الدين والصكوك والسندات والمرابحة",
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
      "ورشة القسيمة والاستحقاق والعائد والمخاطر",
      "تمرين جماعي لتقييم صك متداول في السوق السعودي",
      "تسليم دراسة الحالة للفرق",
    ],
  },
  {
    number: "03",
    eyebrow: "بناء",
    day: "اليوم الثالث",
    title: "من الفكرة إلى الإصدار",
    description: "فهم الهيكلة ثم عرض الحلول أمام اللجنة",
    points: [
      "ورشة هيكلة الإصدار وأدوار الأطراف ذات العلاقة",
      "عروض الفرق أمام اللجنة",
      "تكريم الفائزين وتسليم الشهادات",
    ],
  },
];

export const objectives = [
  { title: "فهم أدوات الدين", body: "استيعاب الفروقات بين الصكوك والسندات والمرابحة" },
  { title: "تقييم الصك", body: "قراءة القسيمة والاستحقاق والعائد والمخاطر بصورة عملية" },
  { title: "فهم رحلة الإصدار", body: "التعرّف على الهيكلة وأدوار المستشار والهيئة والمكتتبين" },
  { title: "اتخاذ قرار تمويلي", body: "بناء توصية واضحة عبر دراسة حالة تُعرض أمام لجنة" },
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
    detail: "تعمل الفرق على توصية مالية ثم تعرضها أمام اللجنة",
  },
];
