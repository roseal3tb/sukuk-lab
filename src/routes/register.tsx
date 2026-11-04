import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpLeft, Check, LoaderCircle } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { useRegistrationStatus } from "@/hooks/use-registration-status";
import { registrationSchema, translateServerError } from "@/lib/registration";
import { supabase } from "@/integrations/supabase/client";
import { PROGRAM_CITY, programDateLabel } from "@/lib/program";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "التسجيل | SUKUK LAB — مختبر الصكوك" },
      { name: "description", content: "نموذج التسجيل في مختبر الصكوك — برنامج تطبيقي في الصكوك وأدوات الدين." },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: RegisterPage,
});

const fields = [
  { name: "full_name", label: "الاسم الكامل", type: "text", autoComplete: "name", placeholder: "اسمك كما تود ظهوره في التسجيل" },
  { name: "email", label: "البريد الإلكتروني", type: "email", autoComplete: "email", placeholder: "name@example.com", ltr: true },
  { name: "phone", label: "رقم الجوال", type: "tel", autoComplete: "tel", placeholder: "05XXXXXXXX", ltr: true },
  { name: "university", label: "الجامعة", type: "text", autoComplete: "organization", placeholder: "اسم الجامعة" },
  { name: "major", label: "التخصص", type: "text", autoComplete: "off", placeholder: "التخصص الدراسي" },
] as const;

function RegisterPage() {
  const status = useRegistrationStatus();
  const qc = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<"pending" | "waitlisted" | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setServerError(null);
    const fd = new FormData(event.currentTarget);
    const form = registrationSchema.safeParse({
      full_name: fd.get("full_name"),
      email: fd.get("email"),
      phone: String(fd.get("phone") ?? "").replace(/[\s()\-]/g, ""),
      university: fd.get("university"),
      major: fd.get("major"),
      consent: fd.get("consent") === "on",
    });
    if (!form.success) {
      const found: Record<string, string> = {};
      form.error.issues.forEach((issue) => { const key = String(issue.path[0]); if (!found[key]) found[key] = issue.message; });
      setErrors(found);
      window.requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("submit_application", {
        _full_name: form.data.full_name,
        _email: form.data.email,
        _phone: form.data.phone,
        _university: form.data.university,
        _major: form.data.major,
        _consent: form.data.consent,
      });
      if (error) {
        setServerError(translateServerError(error.message));
        qc.invalidateQueries({ queryKey: ["registration-status"] });
        return;
      }
      // Server RPC returns exactly 'pending' or 'waitlisted'; no optimistic success.
      if (data === "pending" || data === "waitlisted") setResult(data);
      else setServerError("لم نتمكن من التحقق من حفظ طلبك. تواصل مع الجهة المنظمة قبل إعادة المحاولة.");
    } catch {
      setServerError("تعذّر الاتصال بنظام التسجيل. تحقق من الاتصال ثم حاول مرة أخرى.");
    } finally { setBusy(false); }
  }

  return <>
    <SiteHeader />
    <main className="sl-registration" id="main">
      <div className="sl-wrap sl-registration__layout">
        <aside className="sl-registration__aside">
          <p className="sl-kicker"><span className="sl-kicker__dash"/>الانضمام إلى مختبر الصكوك</p>
          <h1>الخطوة<br/><em>تبدأ هنا.</em></h1>
          <p>من الصفر إلى الإصدار — ثلاثة أيام من الجلسات الحوارية والورش التطبيقية ودراسة الحالة.</p>
          <dl className="sl-registration__facts">
            <div><dt>البرنامج</dt><dd>مختبر الصكوك</dd></div>
            <div><dt>الموعد</dt><dd>{programDateLabel}</dd></div>
            <div><dt>المدينة</dt><dd>{PROGRAM_CITY}</dd></div>
            <div><dt>المدة</dt><dd>3 أيام متتالية</dd></div>
          </dl>
          <Link to="/" className="sl-text-link" style={{color:"#73603B",marginTop:25}}>العودة إلى البرنامج <ArrowLeft size={17}/></Link>
        </aside>
        <section className="sl-registration__panel" aria-labelledby="registration-title">
          <div className="sl-registration__panel-head"><h2 id="registration-title">استمارة التسجيل</h2><span>APPLICATION / 01</span></div>
          {status.isLoading && <div role="status" className="sl-registration__alert"><p>جارٍ التحقق من حالة استقبال الطلبات…</p></div>}
          {status.isError && <div role="alert" className="sl-registration__alert sl-registration__alert--error"><h3>تعذر التحقق من حالة التسجيل</h3><p>لا يمكن إرسال البيانات قبل التأكد من حالة التسجيل. حاول تحديث الصفحة لاحقًا.</p></div>}
          {status.data && !status.data.is_open && !result && <div role="status" className="sl-registration__alert">
            <h3>التسجيل غير متاح حاليًا</h3>
            <p>لم يُفعّل استقبال الطلبات في قاعدة البيانات بعد. يرجى العودة لاحقًا.</p>
          </div>}
          {result && <div role="status" className="sl-registration__alert">
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}><Check size={28}/><h3 style={{margin:0}}>تم استلام طلبك بنجاح</h3></div>
            <p>{result === "waitlisted" ? "حُفظ طلبك في قائمة الانتظار بعد اكتمال العدد المستهدف." : "حُفظ طلبك، وحالته الآن قيد المراجعة."}</p>
            <Link to="/" style={{display:"inline-block",color:"#755A25",marginTop:22,fontWeight:600}}>العودة إلى الصفحة الرئيسية ←</Link>
          </div>}
          {status.data?.is_open && !result && <form onSubmit={submit} noValidate>
            {status.data.full && <p className="sl-registration__alert" style={{marginBottom:28}} role="status">
              {status.data.waitlist_enabled ? "اكتمل العدد المستهدف؛ تُحفظ الطلبات الجديدة في قائمة الانتظار." : "اكتمل العدد المتاح. لا يمكن استقبال طلبات جديدة حاليًا."}
            </p>}
            {fields.map((field, index) => <div key={field.name} className="sl-registration__field" style={{animation:`sl-fade-up .5s ${index * 45}ms both`}}>
              <label htmlFor={field.name}>{field.label} <span aria-hidden="true" style={{color:"#A58038"}}>*</span></label>
              <input id={field.name} name={field.name} type={field.type} autoComplete={field.autoComplete}
                placeholder={field.placeholder} dir={"ltr" in field ? "ltr" : undefined}
                aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `${field.name}-err` : undefined} required />
              {errors[field.name] && <small id={`${field.name}-err`} role="alert">{errors[field.name]}</small>}
            </div>)}
            <label className="sl-registration__consent">
              <input type="checkbox" name="consent" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "consent-err" : undefined}/>
              <span>أوافق على استخدام بياناتي لأغراض تسجيل ومتابعة طلب الانضمام إلى البرنامج.</span>
            </label>
            {errors.consent && <p id="consent-err" role="alert" style={{color:"#A44838",fontSize:12,marginTop:-17,marginBottom:20}}>{errors.consent}</p>}
            {serverError && <p role="alert" className="sl-registration__alert sl-registration__alert--error" style={{marginBottom:22}}>{serverError}</p>}
            <button className="sl-registration__submit" type="submit" disabled={busy || (status.data.full && !status.data.waitlist_enabled)}>
              <span>{busy ? "جارٍ حفظ الطلب…" : status.data.full ? "التسجيل في قائمة الانتظار" : "إرسال الطلب"}</span>
              {busy ? <LoaderCircle size={18} className="animate-spin"/> : <ArrowUpLeft size={20}/>}
            </button>
            <p style={{fontSize:11,color:"#817B70",lineHeight:1.8,marginTop:16}}>إرسال الطلب لا يعني القبول النهائي؛ يُراجَع الطلب من الجهة المنظمة.</p>
          </form>}
        </section>
      </div>
    </main>
    <SiteFooter />
  </>;
}
