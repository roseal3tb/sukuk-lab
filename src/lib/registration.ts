import { z } from "zod";

/** Form matches the supplied original sign-up questions */
export const registrationSchema = z.object({
  full_name: z.string().trim().min(5, "أدخل الاسم الثلاثي").max(120, "الاسم طويل جدًا").refine(v => v.split(/\s+/).length >= 3, "يرجى إدخال الاسم الثلاثي"),
  email: z.string().trim().email("أدخل بريدًا إلكترونيًا صحيحًا").max(255),
  phone: z.string().trim().regex(/^\+?[0-9]{9,15}$/, "أدخل رقم جوال صحيحًا"),
  university: z.string().trim().min(2, "أدخل اسم الجامعة").max(150),
  major: z.string().trim().min(2, "أدخل التخصص").max(150),
  study_year: z.string().trim().min(2, "أدخل السنة الدراسية أو المستوى").max(80),
  sukuk_knowledge: z.string().trim().min(5, "اكتب وصفًا مختصرًا لمعرفتك الحالية").max(600),
  motivation: z.string().trim().min(10, "اذكر سبب رغبتك في الانضمام").max(1200),
  learning_goal: z.string().trim().min(10, "اذكر ما ترغب في تعلمه أو تطبيقه").max(1200),
  ithmar_member: z.enum(["yes", "no"], { required_error: "حدد هل أنت من فريق إثمار" }),
  can_attend_all_days: z.enum(["yes", "no"], { required_error: "حدد مدى قدرتك على حضور أيام البرنامج" }),
  consent: z.boolean().refine((v) => v, "الموافقة مطلوبة لإتمام التسجيل"),
});
export type RegistrationInput = z.infer<typeof registrationSchema>;

const errors: Record<string,string> = {
  REGISTRATION_CLOSED: "التسجيل غير متاح حاليًا",
  CONSENT_REQUIRED: "الموافقة مطلوبة لإتمام التسجيل",
  INVALID_NAME: "الاسم الثلاثي غير صالح",
  INVALID_EMAIL: "البريد الإلكتروني غير صالح",
  INVALID_PHONE: "رقم الجوال غير صالح",
  INVALID_UNIVERSITY: "اسم الجامعة غير صالح",
  INVALID_MAJOR: "التخصص غير صالح",
  INVALID_YEAR: "السنة الدراسية غير صالحة",
  INVALID_KNOWLEDGE: "أدخل وصفًا لمعرفتك الحالية بالصكوك",
  INVALID_MOTIVATION: "أدخل سبب الانضمام",
  INVALID_LEARNING_GOAL: "أدخل ما تطمح لتعلمه",
  INVALID_MEMBERSHIP: "اختر عضوية فريق إثمار",
  INVALID_ATTENDANCE: "اختر مدى الالتزام بالحضور",
  DUPLICATE_EMAIL: "هذا البريد الإلكتروني مسجل مسبقًا",
  CAPACITY_FULL: "اكتمل العدد المتاح للتسجيل",
};
export function translateServerError(message: string | undefined) {
  if (!message) return "تعذّر حفظ الطلب، حاول مرة أخرى";
  const code = Object.keys(errors).find((key) => message.includes(key));
  return (code ? errors[code] : undefined) ?? "تعذّر حفظ الطلب، تأكد من إعداد قاعدة البيانات ثم حاول مجددًا";
}
export const statusLabels = {
  pending: "قيد المراجعة", accepted: "مقبول", waitlisted: "قائمة الانتظار", rejected: "مرفوض",
} as const;

/** Spreadsheet formula injection mitigation */
export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const safe = (v: unknown) => {
    const s = v == null ? "" : String(v);
    const normalized = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return `"${normalized.replace(/"/g, '""')}"`;
  };
  return "\uFEFF" + [columns.map(safe).join(","), ...rows.map(row => columns.map(c => safe(row[c])).join(","))].join("\r\n");
}
