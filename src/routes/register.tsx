import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpLeft, CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { useRegistrationStatus } from "@/hooks/use-registration-status";
import { registrationSchema, translateServerError } from "@/lib/registration";
import { supabase } from "@/integrations/supabase/client";
import { PROGRAM_CITY, programDateLabel } from "@/lib/program";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "التسجيل | صكوك لاب — SUKUK LAB" },
      { name: "description", content: "نموذج الانضمام إلى صكوك لاب — من الصفر إلى الإصدار" },
    ],
  }),
  component: RegisterPage,
});

const infoFields = [
  { name: "full_name", label: "الاسم الثلاثي", type: "text", autoComplete: "name", placeholder: "الاسم الثلاثي" },
  { name: "email", label: "البريد الإلكتروني", type: "email", autoComplete: "email", placeholder: "name@example.com", ltr: true },
  { name: "phone", label: "رقم الجوال", type: "tel", autoComplete: "tel", placeholder: "05xxxxxxxx", ltr: true },
  { name: "university", label: "الجامعة", type: "text", autoComplete: "organization", placeholder: "اسم الجامعة" },
  { name: "major", label: "التخصص", type: "text", autoComplete: "off", placeholder: "التخصص الدراسي" },
  { name: "study_year", label: "السنة الدراسية / المستوى", type: "text", autoComplete: "off", placeholder: "مثال: السنة الثالثة" },
] as const;

const motivationFields = [
  { name: "sukuk_knowledge", label: "كيف تقيّم معرفتك الحالية بالصكوك؟", placeholder: "اكتب وصفًا مختصرًا لمعرفتك الحالية", rows: 2 },
  { name: "motivation", label: "لماذا ترغب في الانضمام إلى مشروع مختبر الصكوك؟", placeholder: "شاركنا سبب رغبتك في المشاركة", rows: 3 },
  { name: "learning_goal", label: "ما الشيء الذي تتمنى أن تكون قادرًا على فهمه أو تطبيقه بعد انتهاء مشروع مختبر الصكوك؟", placeholder: "المهارة أو المعرفة التي تطمح لاكتسابها", rows: 3 },
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
    const fd = new FormData(event.currentTarget);
    const parsed = registrationSchema.safeParse({
      full_name: fd.get("full_name"),
      email: fd.get("email"),
      phone: String(fd.get("phone") ?? "").replace(/[\s()\-]/g, ""),
      university: fd.get("university"),
      major: fd.get("major"),
      study_year: fd.get("study_year"),
      sukuk_knowledge: fd.get("sukuk_knowledge"),
      motivation: fd.get("motivation"),
      learning_goal: fd.get("learning_goal"),
      ithmar_member: fd.get("ithmar_member") ?? undefined,
      can_attend_all_days: fd.get("can_attend_all_days") ?? undefined,
      consent: fd.get("consent") === "on",
    });
    if (!parsed.success) {
      const issues: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const name = String(issue.path[0]);
        if (!issues[name]) issues[name] = issue.message;
      }
      setErrors(issues);
      setServerError(null);
      window.requestAnimationFrame(() => document.getElementById(String(parsed.error.issues[0].path[0]))?.focus());
      return;
    }
    setErrors({});
    setServerError(null);
    setBusy(true);
    try {
      const v = parsed.data;
      const { data, error } = await supabase.rpc("submit_application", {
        _full_name: v.full_name,
        _email: v.email,
        _phone: v.phone,
        _university: v.university,
        _major: v.major,
        _study_year: v.study_year,
        _sukuk_knowledge: v.sukuk_knowledge,
        _motivation: v.motivation,
        _learning_goal: v.learning_goal,
        _ithmar_member: v.ithmar_member === "yes",
        _can_attend_all_days: v.can_attend_all_days === "yes",
        _consent: v.consent,
      });
      if (error) {
        setServerError(translateServerError(error.message));
        qc.invalidateQueries({ queryKey: ["registration-status"] });
        return;
      }
      if (data === "pending" || data === "waitlisted") {
        setResult(data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setServerError("تعذّر التأكد من استلام الطلب، يرجى التواصل مع المنظمين قبل محاولة التسجيل مرة أخرى");
      }
    } catch {
      setServerError("تعذّر الاتصال بخدمة التسجيل، يرجى المحاولة لاحقًا");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="sl-registration sl-register-revamp">
        <div className="sl-wrap sl-register-wrap">
          <div className="sl-register-intro">
            <Link className="sl-register-back" to="/"><ArrowLeft size={16}/> العودة للبرنامج</Link>
            <span className="sl-kicker">SUKUK LAB · REGISTRATION</span>
            <h1>انضم إلى <em>صكوك لاب</em></h1>
            <p>من الصفر إلى الإصدار</p>
            <div className="sl-register-meta"><span>{programDateLabel}</span><span>{PROGRAM_CITY}</span><span>3 أيام</span></div>
          </div>

          {status.isLoading && <div className="sl-register-notice" role="status">جارٍ التحقق من حالة التسجيل</div>}
          {status.isError && <div className="sl-register-notice" role="alert">تعذّر الاتصال بخدمة التسجيل، يرجى تحديث الصفحة لاحقًا</div>}
          {status.data && !status.data.is_open && !result && <div className="sl-register-notice" role="status">
            <h2>التسجيل غير متاح حاليًا</h2><p>سيظهر النموذج فور فتح التسجيل من قبل الجهة المنظمة</p>
          </div>}
          {result && <div className="sl-register-success" role="status">
            <CheckCircle2 size={42} aria-hidden="true" />
            <h2>تم استلام طلبك بنجاح</h2>
            <p>{result === "waitlisted" ? "تمت إضافتك إلى قائمة الانتظار" : "طلبك قيد المراجعة من فريق التنظيم"}</p>
            <Link to="/" className="sl-button sl-button--gold">العودة للبرنامج <ArrowUpLeft size={18}/></Link>
          </div>}

          {status.data?.is_open && !result && (
            <form className="sl-register-form" onSubmit={submit} noValidate>
              {status.data.full && <p className="sl-register-waitlist" role="status">{status.data.waitlist_enabled ? "اكتمل العدد المستهدف، وسيُضاف طلبك إلى قائمة الانتظار" : "اكتمل العدد المتاح، لا يمكن استقبال طلبات جديدة"}</p>}

              <section className="sl-form-section" aria-labelledby="sec-personal">
                <header className="sl-form-section__head"><span>01</span><div><h2 id="sec-personal">معلوماتك الأساسية</h2><p>ابدأ بإدخال بياناتك للتواصل بخصوص طلبك</p></div></header>
                <div className="sl-form-grid">
                  {infoFields.map(field => (
                    <div key={field.name} className="sl-form-field">
                      <label htmlFor={field.name}>{field.label} <span aria-hidden="true">*</span></label>
                      <input id={field.name} name={field.name} type={field.type} placeholder={field.placeholder}
                        autoComplete={field.autoComplete} dir={"ltr" in field ? "ltr" : undefined} required
                        aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `${field.name}-err` : undefined}/>
                      {errors[field.name] && <small id={`${field.name}-err`} role="alert">{errors[field.name]}</small>}
                    </div>
                  ))}
                </div>
              </section>

              <section className="sl-form-section" aria-labelledby="sec-motivation">
                <header className="sl-form-section__head"><span>02</span><div><h2 id="sec-motivation">عرّفنا على اهتمامك</h2><p>إجاباتك تساعد فريق التنظيم على معرفة تطلعات المشاركين</p></div></header>
                <div className="sl-form-textareas">
                  {motivationFields.map(field => (
                    <div key={field.name} className="sl-form-field">
                      <label htmlFor={field.name}>{field.label} <span aria-hidden="true">*</span></label>
                      <textarea id={field.name} name={field.name} rows={field.rows} placeholder={field.placeholder} required
                        aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `${field.name}-err` : undefined}/>
                      {errors[field.name] && <small id={`${field.name}-err`} role="alert">{errors[field.name]}</small>}
                    </div>
                  ))}
                </div>
              </section>

              <section className="sl-form-section" aria-labelledby="sec-commitment">
                <header className="sl-form-section__head"><span>03</span><div><h2 id="sec-commitment">الانضمام والالتزام</h2><p>خطوتان أخيرتان قبل إرسال طلبك</p></div></header>
                <div className="sl-form-decisions">
                  <fieldset id="ithmar_member" aria-describedby={errors.ithmar_member ? "ithmar_member-err" : undefined}>
                    <legend>هل أنت من فريق إثمار؟ <span aria-hidden="true">*</span></legend>
                    <div className="sl-form-options">
                      <label><input type="radio" name="ithmar_member" value="yes"/> نعم</label>
                      <label><input type="radio" name="ithmar_member" value="no"/> لا</label>
                    </div>
                    {errors.ithmar_member && <small id="ithmar_member-err" role="alert">{errors.ithmar_member}</small>}
                  </fieldset>
                  <fieldset id="can_attend_all_days" aria-describedby={errors.can_attend_all_days ? "can_attend_all_days-err" : undefined}>
                    <legend>هل يمكنك الالتزام بحضور أيام البرنامج كاملة؟ <span aria-hidden="true">*</span></legend>
                    <div className="sl-form-options">
                      <label><input type="radio" name="can_attend_all_days" value="yes"/> نعم</label>
                      <label><input type="radio" name="can_attend_all_days" value="no"/> لا</label>
                    </div>
                    {errors.can_attend_all_days && <small id="can_attend_all_days-err" role="alert">{errors.can_attend_all_days}</small>}
                  </fieldset>
                </div>
                <label className="sl-form-consent" htmlFor="consent">
                  <input id="consent" name="consent" type="checkbox" aria-invalid={!!errors.consent}/>
                  <span>أوافق على معالجة بياناتي لأغراض التسجيل والتواصل بشأن البرنامج</span>
                </label>
                {errors.consent && <small className="sl-form-consent-error" role="alert">{errors.consent}</small>}
              </section>

              {serverError && <div className="sl-register-notice sl-register-notice--error" role="alert">{serverError}</div>}
              <div className="sl-register-submit-row">
                <p><ShieldCheck size={18} aria-hidden="true"/> بياناتك لا تظهر للزوار ويطّلع عليها فريق الإدارة المخوّل فقط</p>
                <button className="sl-button sl-button--gold sl-register-submit" type="submit" disabled={busy || (status.data.full && !status.data.waitlist_enabled)}>
                  {busy ? "جارٍ إرسال الطلب" : status.data.full ? "الانضمام لقائمة الانتظار" : "إرسال طلب التسجيل"}
                  {busy ? <LoaderCircle size={19} className="animate-spin"/> : <ArrowUpLeft size={19}/>}
                </button>
              </div>
              <p className="sl-register-footnote">إرسال الطلب لا يعني القبول النهائي</p>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
