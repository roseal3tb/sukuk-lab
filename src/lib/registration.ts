import { z } from "zod";

export const registrationSchema = z.object({
  full_name: z.string().trim().min(3, "يرجى إدخال الاسم الكامل").max(120, "الاسم طويل جدًا"),
  email: z.string().trim().email("بريد إلكتروني غير صالح").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{9,15}$/, "رقم جوال غير صالح (أرقام فقط، 9 إلى 15 رقمًا)"),
  university: z.string().trim().min(2, "يرجى إدخال الجامعة").max(150),
  major: z.string().trim().min(2, "يرجى إدخال التخصص").max(150),
  consent: z.literal(true, { errorMap: () => ({ message: "الموافقة مطلوبة لإتمام التسجيل" }) }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

const serverErrors: Record<string, string> = {
  REGISTRATION_CLOSED: "التسجيل غير متاح حاليًا.",
  CONSENT_REQUIRED: "الموافقة مطلوبة لإتمام التسجيل.",
  INVALID_NAME: "الاسم غير صالح.",
  INVALID_EMAIL: "البريد الإلكتروني غير صالح.",
  INVALID_PHONE: "رقم الجوال غير صالح.",
  INVALID_UNIVERSITY: "اسم الجامعة غير صالح.",
  INVALID_MAJOR: "التخصص غير صالح.",
  DUPLICATE_EMAIL: "هذا البريد الإلكتروني مسجّل مسبقًا.",
  CAPACITY_FULL: "اكتمل العدد المتاح للتسجيل.",
};

export function translateServerError(message: string | undefined): string {
  if (!message) return "تعذّر حفظ الطلب، حاول مرة أخرى.";
  const key = Object.keys(serverErrors).find((k) => message.includes(k));
  return key ? serverErrors[key] : "تعذّر حفظ الطلب، حاول مرة أخرى.";
}

export const statusLabels = {
  pending: "قيد المراجعة",
  accepted: "مقبول",
  waitlisted: "قائمة الانتظار",
  rejected: "مرفوض",
} as const;

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  return "\uFEFF" + [columns.join(","), ...rows.map((r) => columns.map((c) => esc(r[c])).join(","))].join("\n");
}
