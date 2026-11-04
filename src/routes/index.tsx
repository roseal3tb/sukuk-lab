import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { useReveal } from "@/hooks/use-reveal";
import { useRegistrationStatus } from "@/hooks/use-registration-status";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SUKUK LAB | مختبر الصكوك — من الصفر إلى الإصدار" },
      { name: "description", content: "برنامج تطبيقي مكثف لثلاثة أيام في الصكوك وأدوات الدين: جلسات حوارية، ورش عمل، ودراسة حالة. تنظيم مبادرة إثمار المالية — جامعة الملك سعود." },
      { property: "og:title", content: "SUKUK LAB | مختبر الصكوك" },
      { property: "og:description", content: "من الصفر إلى الإصدار — برنامج تطبيقي في الصكوك وأدوات الدين." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const goals = [
  "تعريف الطالب بأدوات الدين والفروقات بين الصكوك والسندات والمرابحة.",
  "تمكينه من تقييم صك متداول: القسيمة، والاستحقاق، والعائد، والمخاطر.",
  "فهم رحلة الإصدار: الهيكلة، والمستشار، والهيئة، والمكتتبين.",
  "اتخاذ قرار تمويلي مبرر عبر دراسة حالة تُعرض أمام لجنة.",
  "ربط الطلاب بأهل الصناعة، والسعي إلى فتح باب التدريب التعاوني والتوظيف.",
];

const days = [
  {
    day: "اليوم الأول",
    date: "25 أكتوبر",
    title: "السياق والانطلاقة",
    items: [
      "مقدمة في الدخل الثابت وأدوات الدين (صكوك، سندات، مرابحة).",
      "جلسة حوارية عن واقع سوق الصكوك السعودي ورؤية 2030.",
      "نقاش مفتوح وتكوين الفرق.",
    ],
  },
  {
    day: "اليوم الثاني",
    date: "26 أكتوبر",
    title: "كيف نقيّم الصك",
    items: [
      "ورشة القسيمة وتاريخ الاستحقاق والعائد حتى الاستحقاق وعوامل المخاطر بأمثلة حسابية.",
      "تمرين جماعي لتقييم صك فعلي متداول في السوق السعودي.",
      "توزيع دراسة الحالة (Case Study) على الفرق.",
    ],
  },
  {
    day: "اليوم الثالث",
    date: "27 أكتوبر",
    title: "من الفكرة إلى الإصدار",
    items: [
      "ورشة هيكلة الإصدار وأدوار البنك المستشار وهيئة السوق المالية والمكتتبين.",
      "عروض الفرق من 3 إلى 5 دقائق أمام لجنة التحكيم.",
      "تكريم الفريق الفائز وتسليم الشهادات وكلمة ختامية.",
    ],
  },
];

const outcomes = [
  { k: "يفهم", v: "أدوات الدين والفروقات بينها." },
  { k: "يقيّم", v: "صكًا متداولًا بأدوات حسابية." },
  { k: "يبني", v: "قرارًا تمويليًا مبررًا أمام لجنة." },
  { k: "شهادة حضور", v: "معتمدة من إثمار والجهة الراعية." },
];

function Rings({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" fill="none">
      <g className="spin-slow" style={{ transformOrigin: "200px 200px" }} stroke="currentColor" strokeWidth="0.8">
        <circle cx="200" cy="200" r="190" opacity="0.5" />
        <circle cx="200" cy="200" r="150" opacity="0.35" strokeDasharray="2 6" />
        <circle cx="200" cy="200" r="110" opacity="0.6" />
        <circle cx="200" cy="10" r="4" fill="currentColor" />
        <circle cx="90" cy="200" r="3" fill="currentColor" />
      </g>
      <circle cx="200" cy="200" r="60" stroke="currentColor" strokeWidth="0.8" opacity="0.8" />
      <line x1="200" y1="0" x2="200" y2="400" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <line x1="0" y1="200" x2="400" y2="200" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
    </svg>
  );
}

function SectionTitle({ eyebrow, title, light = false }: { eyebrow: string; title: string; light?: boolean }) {
  return (
    <div className="reveal mb-12 max-w-2xl">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className={`text-3xl font-bold leading-tight md:text-5xl ${light ? "text-ink" : "text-foreground"}`}>{title}</h2>
      <div className="mt-6 h-px w-20 bg-gold" />
    </div>
  );
}

function Index() {
  useReveal();
  const status = useRegistrationStatus();
  const isOpen = status.data?.is_open === true;

  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
          <Rings className="pointer-events-none absolute -left-32 top-10 h-[34rem] w-[34rem] text-gold opacity-40 md:left-0 md:h-[42rem] md:w-[42rem]" />
          <div className="relative mx-auto max-w-6xl px-5">
            <p className="eyebrow mb-6">مبادرة إثمار المالية — جامعة الملك سعود</p>
            <h1 className="latin text-6xl font-semibold tracking-[0.12em] text-gold md:text-8xl">SUKUK LAB</h1>
            <p className="mt-4 text-3xl font-bold md:text-5xl">مختبر الصكوك</p>
            <p className="mt-8 text-2xl text-silver md:text-3xl">من الصفر إلى الإصدار</p>
            <p className="mt-3 max-w-xl text-lg text-muted-foreground">برنامج تطبيقي في الصكوك وأدوات الدين</p>
            <ul className="mt-8 flex flex-wrap gap-3" aria-label="مكونات البرنامج">
              {["جلسات حوارية", "ورش عمل", "Case Study"].map((c) => (
                <li key={c} className="rounded-full border border-gold/50 px-4 py-1.5 text-sm text-gold">
                  {c === "Case Study" ? <span dir="ltr">{c}</span> : c}
                </li>
              ))}
            </ul>
            <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-4">
              {[
                ["تاريخ النسخة", "25–27 أكتوبر 2026"],
                ["المكان", "الرياض"],
                ["المدة", "3 أيام متتالية"],
                ["الطاقة المستهدفة", "100 طالب وطالبة"],
              ].map(([k, v]) => (
                <div key={k} className="bg-card p-5">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="mt-2 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/register" className="rounded-full bg-gold px-8 py-3 font-semibold text-ink transition-opacity hover:opacity-90">
                {isOpen ? "سجّل الآن" : "حالة التسجيل"}
              </Link>
              <a href="#about" className="text-sm text-muted-foreground underline-offset-4 hover:text-gold hover:underline">
                اكتشف البرنامج
              </a>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="section-ivory py-24">
          <div className="mx-auto grid max-w-6xl gap-14 px-5 md:grid-cols-5">
            <div className="md:col-span-3">
              <SectionTitle eyebrow="عن البرنامج" title="ثلاثة أيام من المفهوم إلى الإصدار" light />
              <p className="reveal text-lg leading-loose">
                برنامج تطبيقي مكثف لثلاثة أيام يأخذ الطلاب من المفاهيم الأساسية لأدوات الدين إلى فهم عملي لكيفية هيكلة الصك وإصداره،
                عبر جلسات حوارية مع خبراء السوق، وورش عمل حسابية، ودراسة حالة واقعية تعمل عليها الفرق وتعرض حلولها.
              </p>
            </div>
            <aside className="reveal self-end rounded-lg bg-ink p-8 text-silver md:col-span-2">
              <p className="eyebrow mb-3">عن إثمار</p>
              <h3 className="mb-4 text-2xl font-bold text-gold">مبادرة إثمار المالية</h3>
              <p className="leading-loose">
                أول مبادرة طلابية مالية في جامعة الملك سعود، تهدف إلى زيادة الوعي المالي وتطوير المهارات المالية لدى المستفيدين،
                وهي تابعة لبرنامج الشراكة الطلابية.
              </p>
            </aside>
          </div>
        </section>

        {/* Goals */}
        <section id="goals" className="py-24">
          <div className="mx-auto max-w-6xl px-5">
            <SectionTitle eyebrow="الأهداف" title="ما الذي يسعى إليه البرنامج" />
            <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goals.map((g, i) => (
                <li key={g} className="reveal flex gap-5 rounded-lg border bg-card p-6" style={{ transitionDelay: `${i * 80}ms` }}>
                  <span className="gold-ring latin flex h-12 w-12 shrink-0 items-center justify-center text-xl text-gold">{i + 1}</span>
                  <p className="leading-relaxed">{g}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Timeline */}
        <section id="timeline" className="section-ivory py-24">
          <div className="mx-auto max-w-6xl px-5">
            <SectionTitle eyebrow="الجدول الزمني — نسخة 25–27 أكتوبر 2026" title="ثلاث محطات متصلة" light />
            <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
              <div aria-hidden="true" className="absolute right-6 top-6 bottom-6 w-px bg-gold md:inset-x-6 md:top-6 md:bottom-auto md:h-px md:w-auto" />
              {days.map((d, i) => (
                <li key={d.date} className="reveal relative pr-16 md:pr-0 md:pt-20" style={{ transitionDelay: `${i * 120}ms` }}>
                  <span className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border border-gold bg-ivory md:right-0">
                    <span className="h-3 w-3 rounded-full bg-gold" />
                  </span>
                  <p className="text-sm font-semibold text-gold">{d.day} · {d.date}</p>
                  <h3 className="mt-2 text-2xl font-bold">{d.title}</h3>
                  <ul className="mt-5 space-y-3 leading-relaxed">
                    {d.items.map((it) => (
                      <li key={it} className="flex gap-3">
                        <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Experience */}
        <section id="experience" className="py-24">
          <div className="mx-auto max-w-6xl px-5">
            <SectionTitle eyebrow="التجربة" title="تعلّم بالممارسة" />
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["جلسات حوارية", "حوارات عن سوق الصكوك مع خبراء السوق."],
                ["ورش تطبيقية", "ورش عمل حسابية للتقييم والهيكلة."],
                ["دراسة حالة", "«صك أم قرض بنكي؟» — تعمل عليها الفرق وتعرض توصياتها."],
              ].map(([t, d], i) => (
                <article key={t} className="reveal rounded-lg border bg-card p-8" style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="gold-ring mb-6 h-10 w-10" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-gold">{t}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{d}</p>
                </article>
              ))}
            </div>
            <h3 className="reveal mt-20 mb-8 text-2xl font-bold">مخرجات المشارك</h3>
            <dl className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {outcomes.map((o) => (
                <div key={o.k} className="reveal bg-background p-7">
                  <dt className="text-2xl font-bold text-gold">{o.k}</dt>
                  <dd className="mt-2 text-muted-foreground">{o.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Audience */}
        <section id="audience" className="section-ivory py-24">
          <div className="mx-auto max-w-6xl px-5">
            <SectionTitle eyebrow="الفئة المستهدفة" title="لمن هذا البرنامج؟" light />
            <div className="grid gap-6 md:grid-cols-3">
              <div className="reveal rounded-lg border border-gold/40 p-7">
                <h3 className="mb-3 text-lg font-bold">طلاب وطالبات جامعة الملك سعود</h3>
                <p className="leading-relaxed">من تخصصات المالية، والمحاسبة، والاقتصاد، وإدارة الأعمال.</p>
              </div>
              <div className="reveal rounded-lg border border-gold/40 p-7">
                <h3 className="mb-3 text-lg font-bold">كل مهتم بأسواق الدين</h3>
                <p className="leading-relaxed">تُفتح المشاركة للمهتمين من مختلف التخصصات والجامعات.</p>
              </div>
              <div className="reveal rounded-lg bg-ink p-7 text-silver">
                <h3 className="mb-3 text-lg font-bold text-gold">لا تُشترط خلفية مسبقة</h3>
                <p className="leading-relaxed">يبدأ البرنامج من المفاهيم الأساسية.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Partners */}
        <section id="partners" className="py-24">
          <div className="mx-auto max-w-6xl px-5">
            <SectionTitle eyebrow="الشركاء" title="الجهات المشاركة" />
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["الجهة المنظمة", "مبادرة إثمار المالية"],
                ["الراعي الرئيسي", "صكوك كابيتال"],
                ["الشريك المستضيف", "جامعة الملك سعود"],
              ].map(([r, n]) => (
                <div key={r} className="reveal rounded-lg border bg-card p-8 text-center">
                  <p className="text-sm text-muted-foreground">{r}</p>
                  <p className="mt-3 text-xl font-bold">{n}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Registration CTA */}
        <section id="register" className="section-ivory py-24">
          <div className="reveal mx-auto max-w-3xl px-5 text-center">
            <p className="eyebrow mb-3">التسجيل</p>
            {status.isLoading ? (
              <p className="text-lg">جارٍ التحقق من حالة التسجيل…</p>
            ) : isOpen ? (
              <>
                <h2 className="text-3xl font-bold md:text-4xl">التسجيل مفتوح</h2>
                {status.data?.full && (
                  <p className="mt-4">اكتمل العدد المستهدف؛ الطلبات الجديدة تُضاف إلى قائمة الانتظار.</p>
                )}
                <Link to="/register" className="mt-8 inline-block rounded-full bg-ink px-8 py-3 font-semibold text-gold">
                  انتقل إلى نموذج التسجيل
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold md:text-4xl">التسجيل غير متاح حاليًا</h2>
                <p className="mt-4 leading-relaxed">
                  أُقيمت النسخة الموثقة من البرنامج في 25–27 أكتوبر 2026. سيُعلن عن فتح التسجيل عند تأكيد موعد نسخة جديدة.
                </p>
              </>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
