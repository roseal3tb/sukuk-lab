/**
 * Sukuk Lab date configuration. Edit just this date for the next edition.
 * Program is three consecutive days per the supplied Sukuk Lab proposal.
 */
export const PROGRAM_START_DATE = "2026-11-08";
export const PROGRAM_DAYS = 3;
export const PROGRAM_CITY = "الرياض";
export const TARGET_PARTICIPANTS = 100;

function dayDate(index: number) {
  const [year, month, day] = PROGRAM_START_DATE.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + index, 12));
  return utc;
}

const longFormat = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
});
const shortFormat = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  day: "numeric", month: "long", timeZone: "UTC",
});
const weekdayFormat = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  weekday: "long", timeZone: "UTC",
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
    number: "01", eyebrow: "فهم", day: "اليوم الأول", title: "السياق والانطلاقة",
    description: "نبدأ من أساس أدوات الدين، ونتعرّف على واقع سوق الصكوك السعودي.",
    points: [
      "مقدمة في الدخل الثابت وأدوات الدين: الصكوك والسندات والمرابحة.",
      "جلسة حوارية عن واقع سوق الصكوك السعودي ورؤية 2030.",
      "نقاش مفتوح وتكوين الفرق.",
    ],
  },
  {
    number: "02", eyebrow: "تقييم", day: "اليوم الثاني", title: "كيف نقيّم الصك",
    description: "من الأرقام إلى القرار؛ تجربة تطبيقية في قراءة الصك وتقييمه.",
    points: [
      "ورشة القسيمة وتاريخ الاستحقاق والعائد حتى الاستحقاق وعوامل المخاطر.",
      "تمرين جماعي لتقييم صك متداول في السوق السعودي.",
      "توزيع دراسة الحالة على الفرق للعمل عليها.",
    ],
  },
  {
    number: "03", eyebrow: "بناء", day: "اليوم الثالث", title: "من الفكرة إلى الإصدار",
    description: "تتحول المعرفة إلى مقترحات وحلول، وتُعرض أمام لجنة التحكيم.",
    points: [
      "ورشة هيكلة الإصدار وأدوار المستشار وهيئة السوق المالية والمكتتبين.",
      "عرض حلول الفرق أمام لجنة التحكيم من 3 إلى 5 دقائق لكل فريق.",
      "تكريم الفريق الفائز وتسليم الشهادات وكلمة ختامية.",
    ],
  },
];

export const objectives = [
  { title: "افهم أدوات الدين", body: "التعرّف على الفروقات بين الصكوك والسندات والمرابحة." },
  { title: "قيّم الصك", body: "قراءة القسيمة والاستحقاق والعائد والمخاطر في صك متداول." },
  { title: "تتبّع رحلة الإصدار", body: "فهم الهيكلة وأدوار المستشار وهيئة السوق المالية والمكتتبين." },
  { title: "اتخذ قرارك", body: "بناء توصية تمويلية مبررة عبر دراسة حالة تُعرض أمام لجنة." },
  { title: "اقترب من أهل الصناعة", body: "ربط الطلاب بمتخصصي السوق وفتح باب التدريب التعاوني والتوظيف." },
];

export const experiences = [
  { number: "01", english: "DIALOGUES", title: "جلسات حوارية", detail: "واقع سوق الصكوك السعودي كما يرويه أهل الصناعة." },
  { number: "02", english: "WORKSHOPS", title: "ورش تطبيقية", detail: "تقييم الصك بالأرقام وهيكلة الإصدار خطوة بخطوة." },
  { number: "03", english: "CASE STUDY", title: "دراسة حالة", detail: "صك أم قرض بنكي؟ تعمل الفرق على توصية مالية وتعرض حلولها." },
];
