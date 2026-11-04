import { z } from "zod";

export const registrationSchema = z.object({
  full_name: z.string().trim().min(3, "يرجى إدخال الاسم الكامل").max(120, "الاسم طويل جدًا"),
  email: z.string().trim().email("البريد الإلكتروني غير صالح").max(255),
  phone: z.string().trim().regex(/^\+?[0-9]{9,15}$/, "رقم الجوال يجب أن يحتوي على 9 إلى 15 رقمًا"),
  university: z.string().trim().min(2, "يرجى إدخال اسم الجامعة").max(150),
  major: z.string().trim().min(2, "يرجى إدخال التخصص").max(150),
  consent: z.boolean().refine((value) => value === true, "الموافقة مطلوبة لإتمام التسجيل"),
});
export type RegistrationInput = z.infer<typeof registrationSchema>;

const errors: Record<string, string> = {
  REGISTRATION_CLOSED: "التسجيل غير متاح حاليًا.",
  CONSENT_REQUIRED: "الموافقة مطلوبة لإتمام التسجيل.",
  INVALID_NAME: "الاسم المدخل غير صالح.",
  INVALID_EMAIL: "البريد الإلكتروني المدخل غير صالح.",
  INVALID_PHONE: "رقم الجوال المدخل غير صالح.",
  INVALID_UNIVERSITY: "اسم الجامعة المدخل غير صالح.",
  INVALID_MAJOR: "اسم التخصص المدخل غير صالح.",
  DUPLICATE_EMAIL: "هذا البريد الإلكتروني مسجل مسبقًا.",
  CAPACITY_FULL: "اكتمل العدد المتاح للتسجيل.",
};
export function translateServerError(message: string | undefined): string {
  if (!message) return "تعذّر حفظ الطلب. حاول مرة أخرى.";
  const code = Object.keys(errors).find((key) => message.includes(key));
  return code ? errors[code] : "تعذّر حفظ الطلب. حاول مرة أخرى.";
}
export const statusLabels = {
  pending: "قيد المراجعة",
  accepted: "مقبول",
  waitlisted: "قائمة الانتظار",
  rejected: "مرفوض",
} as const;

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const escape = (value: unknown) => {
    const text = value == null ? "" : String(value);
    const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  return "\uFEFF" + [columns.map(escape).join(","), ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))].join("\r\n");
}
