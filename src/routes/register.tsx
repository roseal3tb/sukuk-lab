import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { useRegistrationStatus } from "@/hooks/use-registration-status";
import { registrationSchema, translateServerError } from "@/lib/registration";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "التسجيل | SUKUK LAB مختبر الصكوك" },
      { name: "description", content: "صفحة التسجيل في برنامج مختبر الصكوك وحالة استقبال الطلبات." },
      { property: "og:title", content: "التسجيل | SUKUK LAB مختبر الصكوك" },
      { property: "og:description", content: "حالة التسجيل ونموذج التقديم في برنامج مختبر الصكوك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

const fields = [
  { name: "full_name", label: "الاسم الكامل", type: "text", autoComplete: "name" },
  { name: "email", label: "البريد الإلكتروني", type: "email", autoComplete: "email", ltr: true },
  { name: "phone", label: "رقم الجوال", type: "tel", autoComplete: "tel", ltr: true },
  { name: "university", label: "الجامعة", type: "text", autoComplete: "organization" },
  { name: "major", label: "التخصص", type: "text", autoComplete: "off" },
] as const;

function RegisterPage() {
  const status = useRegistrationStatus();
  const qc = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<"pending" | "waitlisted" | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const fd = new FormData(e.currentTarget);
    const parsed = registrationSchema.safeParse({
      full_name: fd.get("full_name"),
      email: fd.get("email"),
      phone: String(fd.get("phone") ?? "").replace(/[\s-]/g, ""),
      university: fd.get("university"),
      major: fd.get("major"),
      consent: fd.get("consent") === "on",
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] ??= i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const v = parsed.data;
    const { data, error } = await supabase.rpc("submit_application", {
      _full_name: v.full_name,
      _email: v.email,
      _phone: v.phone,
      _university: v.university,
      _major: v.major,
      _consent: v.consent,
    });
    setSubmitting(false);
    if (error) {
      setServerError(translateServerError(error.message));
      qc.invalidateQueries({ queryKey: ["registration-status"] });
      return;
    }
    setResult(data === "waitlisted" ? "waitlisted" : "pending");
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="section-ivory min-h-screen pt-32 pb-24">
        <div className="mx-auto max-w-xl px-5">
          <p className="eyebrow mb-3">التسجيل</p>
          <h1 className="text-3xl font-bold md:text-4xl">التسجيل في مختبر الصكوك</h1>
          <div className="mt-6 mb-10 h-px w-20 bg-gold" />

          {status.isLoading && <p role="status">جارٍ التحقق من حالة التسجيل…</p>}

          {status.isError && (
            <p role="alert" className="rounded-lg border border-destructive p-5">
              تعذّر التحقق من حالة التسجيل حاليًا. حاول لاحقًا.
            </p>
          )}

          {status.data && !status.data.is_open && !result && (
            <div role="status" className="rounded-lg bg-ink p-8 text-silver">
              <h2 className="text-2xl font-bold text-gold">التسجيل غير متاح حاليًا</h2>
              <p className="mt-4 leading-relaxed">
                أُقيمت النسخة الموثقة من البرنامج في 25–27 أكتوبر 2026، ولا يُستقبل أي طلب جديد في الوقت الحالي. سيُفتح التسجيل عند تأكيد موعد نسخة جديدة.
              </p>
              <Link to="/" className="mt-6 inline-block text-gold underline underline-offset-4">العودة إلى الصفحة الرئيسية</Link>
            </div>
          )}

          {result && (
            <div role="status" className="rounded-lg border border-gold bg-card p-8 text-card-foreground">
              <h2 className="text-2xl font-bold text-gold">تم استلام طلبك</h2>
              <p className="mt-4 leading-relaxed">
                {result === "waitlisted"
                  ? "حُفظ طلبك وأُضيف إلى قائمة الانتظار لاكتمال العدد المستهدف."
                  : "حُفظ طلبك بنجاح وهو الآن قيد المراجعة."}
              </p>
            </div>
          )}

          {status.data?.is_open && !result && (
            <form onSubmit={onSubmit} noValidate className="space-y-6">
              {status.data.full && (
                <p className="rounded-lg border border-gold/50 p-4 text-sm">
                  اكتمل العدد المستهدف؛ سيُضاف طلبك إلى قائمة الانتظار.
                </p>
              )}
              {fields.map((f) => (
                <div key={f.name}>
                  <label htmlFor={f.name} className="mb-2 block text-sm font-semibold">{f.label}</label>
                  <input
                    id={f.name}
                    name={f.name}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    dir={"ltr" in f ? "ltr" : undefined}
                    required
                    aria-invalid={!!errors[f.name]}
                    aria-describedby={errors[f.name] ? `${f.name}-err` : undefined}
                    className="w-full rounded-md border border-ink/20 bg-ivory px-4 py-3 text-ink outline-none focus:border-gold"
                  />
                  {errors[f.name] && <p id={`${f.name}-err`} className="mt-1 text-sm text-destructive">{errors[f.name]}</p>}
                </div>
              ))}
              <div>
                <label className="flex items-start gap-3 text-sm leading-relaxed">
                  <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-gold" aria-invalid={!!errors.consent} />
                  <span>أوافق على استخدام بياناتي لأغراض التسجيل في البرنامج.</span>
                </label>
                {errors.consent && <p className="mt-1 text-sm text-destructive">{errors.consent}</p>}
              </div>
              {serverError && <p role="alert" className="rounded-md border border-destructive p-3 text-sm text-destructive">{serverError}</p>}
              <button type="submit" disabled={submitting} className="w-full rounded-full bg-ink py-3 font-semibold text-gold disabled:opacity-60">
                {submitting ? "جارٍ الإرسال…" : "إرسال الطلب"}
              </button>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
