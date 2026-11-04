import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowLeft, ArrowUpLeft, ChevronLeft, MoveUpLeft } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { useRegistrationStatus } from "@/hooks/use-registration-status";
import { useReveal } from "@/hooks/use-reveal";
import {
  experiences, firstProgramDay, objectives, programAgenda, programDateLabel,
  programDays, PROGRAM_CITY, TARGET_PARTICIPANTS,
} from "@/lib/program";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SUKUK LAB | مختبر الصكوك — من الصفر إلى الإصدار" },
      { name: "description", content: "مختبر الصكوك: برنامج تطبيقي مكثف لثلاثة أيام في الصكوك وأدوات الدين تنظمه مبادرة إثمار المالية — جامعة الملك سعود." },
      { property: "og:title", content: "SUKUK LAB | مختبر الصكوك" },
      { property: "og:description", content: "من الصفر إلى الإصدار — برنامج تطبيقي في الصكوك وأدوات الدين." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function ScrollProgress() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    let raf = 0;
    function update() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setWidth(max <= 0 ? 0 : Math.min(100, window.scrollY / max * 100));
      });
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return <div className="sl-page-progress" aria-hidden="true" style={{ width: `${width}%` }} />;
}

function HeroGraphic() {
  return (
    <div className="sl-orbit" aria-hidden="true">
      <svg viewBox="0 0 620 620" preserveAspectRatio="xMidYMid meet">
        <defs><linearGradient id="orbGrad" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#C9A24A" stopOpacity=".02"/><stop offset=".46" stopColor="#C9A24A" stopOpacity=".55"/><stop offset="1" stopColor="#C9A24A" stopOpacity=".07"/></linearGradient></defs>
        {[270,222,175,126].map((r, i) => <circle key={r} cx="310" cy="310" r={r} stroke="url(#orbGrad)" strokeWidth="1" strokeDasharray={i===1?"2 8":"none"} />)}
        <path className="sl-orbit__path" d="M68 403 C142 366 170 415 237 336 S335 219 401 287 S491 313 550 206" stroke="#C9A24A" strokeWidth="2" fill="none" />
        <path d="M68 403 V442 M237 336 V442 M401 287 V442 M550 206 V442" stroke="#C9A24A" strokeOpacity=".14" strokeDasharray="3 8" fill="none"/>
        {[68,237,401,550].map((x,i)=><circle key={i} cx={x} cy={[403,336,287,206][i]} r="5" fill="#C9A24A" />)}
        <path d="M280 310h60M310 280v60" stroke="#C9A24A" strokeOpacity=".4" strokeWidth=".7" />
      </svg>
      <div className="sl-orbit__stamp"><span>من</span><b>01</b><span>إلى 03</span></div>
    </div>
  );
}

function SectionHeading({ label, title, description, dark = false }: {
  label: string; title: string; description?: string; dark?: boolean;
}) {
  return <div className={`sl-section-heading reveal ${dark ? "sl-section-heading--dark" : ""}`}>
    <p className="sl-kicker"><span className="sl-kicker__dash" />{label}</p>
    <h2>{title}</h2>
    {description && <p className="sl-section-heading__desc">{description}</p>}
  </div>;
}

function Timeline() {
  const ref = useRef<HTMLOListElement>(null);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const node = ref.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const travel = rect.height + window.innerHeight * .1;
        setProgress(Math.min(1, Math.max(0, (window.innerHeight * .57 - rect.top) / travel)));
        const sections = Array.from(node.querySelectorAll<HTMLElement>(".sl-journey__day"));
        let next = 0;
        sections.forEach((s, i) => { if (s.getBoundingClientRect().top < window.innerHeight * .58) next = i; });
        setActive(next);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return (
    <section className="sl-journey sl-dark" id="timeline" aria-labelledby="timeline-heading">
      <div className="sl-wrap">
        <div className="sl-journey__intro">
          <div><p className="sl-kicker"><span className="sl-kicker__dash" />الجدول الزمني</p><h2 id="timeline-heading">ثلاثة أيام.<br/><em>رحلة واحدة.</em></h2></div>
          <p>تنتقل من فهم أدوات الدين إلى تقييم الصك، ثم بناء توصية تمويلية وعرضها. كل يوم يكمل الذي قبله.</p>
        </div>
        <div className="sl-journey__layout">
          <aside className="sl-journey__sidebar" aria-hidden="true"><span>THE PROGRAM</span><strong>01 <i>/</i> 03</strong><p>فهم. تقييم. بناء.</p></aside>
          <ol className="sl-journey__list" ref={ref} style={{ "--sl-timeline-progress": `${progress*100}%` } as CSSProperties}>
            {programAgenda.map((item, index) => (
              <li className={`sl-journey__day reveal ${active === index ? "is-active" : ""}`} key={item.number}>
                <div className="sl-journey__node" aria-hidden="true"><span>{item.number}</span></div>
                <div className="sl-journey__panel">
                  <header className="sl-journey__date"><span>{item.day}</span><span>{programDays[index].weekday} · {programDays[index].short}</span></header>
                  <div className="sl-journey__content">
                    <div><span className="sl-journey__eyebrow">{item.eyebrow}</span><h3>{item.title}</h3><p className="sl-journey__description">{item.description}</p></div>
                    <span className="sl-journey__large-no" aria-hidden="true">{item.number}</span>
                  </div>
                  <ul className="sl-journey__points">{item.points.map((point) => <li key={point}>{point}</li>)}</ul>
                  <span className="sl-journey__panel-bottom">SUKUK LAB <span>·</span> {item.number} / 03</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Index() {
  useReveal();
  const registration = useRegistrationStatus();
  const isOpen = registration.data?.is_open === true;
  return <>
    <ScrollProgress />
    <SiteHeader />
    <main id="main" className="sl-main">
      <section className="sl-hero sl-dark" aria-labelledby="hero-title">
        <div className="sl-hero__grain" aria-hidden="true" />
        <HeroGraphic />
        <div className="sl-wrap sl-hero__shell">
          <div className="sl-hero__eyebrow sl-hero__animate"><span className="sl-dot"/> مبادرة إثمار المالية · جامعة الملك سعود</div>
          <div className="sl-hero__content">
            <p className="sl-hero__micro sl-hero__animate">SUKUK / LAB <span>—</span> مختبر الصكوك</p>
            <h1 id="hero-title" className="sl-hero__title">
              <span className="sl-title-line"><span>من الصفر</span></span>
              <span className="sl-title-line"><span><em>إلى</em> الإصدار.</span></span>
            </h1>
            <div className="sl-hero__under sl-hero__animate"><p>برنامج تطبيقي مكثف في<br/>الصكوك وأدوات الدين.</p><span className="sl-hero__rule" /></div>
            <div className="sl-hero__actions sl-hero__animate">
              <Link to="/register" className="sl-button sl-button--gold"><span>سجّل الآن</span><ArrowUpLeft size={20}/></Link>
              <a href="#about" className="sl-text-link">اكتشف البرنامج <ArrowLeft size={18}/></a>
            </div>
          </div>
          <div className="sl-hero__bottom sl-hero__animate">
            <div className="sl-hero__meta"><span>01 / 03</span><i></i><span>{programDateLabel}</span><i></i><span>{PROGRAM_CITY}</span></div>
            <a className="sl-scroll-down" href="#about" aria-label="مرر لاكتشاف البرنامج"><span>مرّر للاكتشاف</span><ArrowDown size={17}/></a>
          </div>
        </div>
      </section>

      <div className="sl-stats sl-dark">
        <div className="sl-wrap sl-stats__inner">
          <div><strong>03</strong><span>أيام تطبيقية متتالية</span></div><div><strong>100</strong><span>طالب وطالبة · العدد المستهدف</span></div>
          <div><strong>03</strong><span>أنشطة البرنامج: حوار · تطبيق · دراسة حالة</span></div>
        </div>
      </div>

      <section className="sl-about sl-ivory" id="about">
        <div className="sl-wrap sl-about__grid">
          <div className="sl-about__lead reveal"><p className="sl-kicker"><span className="sl-kicker__dash"/>عن البرنامج</p><h2>ليس مجرد<br/>حديث عن <em>الصكوك.</em></h2><span className="sl-about__underscore"/></div>
          <div className="sl-about__story reveal">
            <p className="sl-about__big">ثلاثة أيام تنقلك من المفاهيم الأساسية لأدوات الدين إلى فهم عملي لكيفية هيكلة الصك وإصداره.</p>
            <p>من خلال جلسات حوارية مع خبراء السوق، وورش عمل حسابية، ودراسة حالة واقعية تعمل عليها الفرق وتعرض حلولها.</p>
            <div className="sl-about__ithmar"><span className="sl-about__logo">إثمار</span><div><b>عن مبادرة إثمار</b><p>أول مبادرة طلابية مالية في جامعة الملك سعود، تهدف إلى زيادة الوعي المالي وتطوير المهارات المالية، وتتبع برنامج الشراكة الطلابية.</p></div></div>
          </div>
        </div>
      </section>

      <section className="sl-experience sl-ivory" id="experience">
        <div className="sl-wrap">
          <SectionHeading label="ماذا ينتظرك" title="المعرفة تتحول إلى تجربة." description="نتعلم من السوق، ونجرّب بأيدينا، ونبني قرارًا واضحًا." />
          <div className="sl-experience__grid">
            {experiences.map((item, i) => <article className={`sl-experience-card sl-experience-card--${i+1} reveal`} key={item.number} style={{ transitionDelay: `${i * 95}ms` }}>
              <div className="sl-experience-card__top"><span>{item.english}</span><span>0{i+1} / 03</span></div>
              <div className="sl-experience-card__art" aria-hidden="true">
                {i === 0 ? <svg viewBox="0 0 200 180"><circle cx="100" cy="88" r="52"/><circle cx="100" cy="88" r="76"/><path d="M60 90h80M100 48v82"/></svg>
                  : i === 1 ? <svg viewBox="0 0 200 180"><path d="M29 142h150M35 135V95h29v40M85 135V73h30v62M136 135V41h30v94"/><path d="M27 85l50-20 31-16 55-34"/></svg>
                  : <svg viewBox="0 0 200 180"><path d="M28 138h150M35 98l42 40 42-66 44 66M44 41h110M44 56h76"/><circle cx="120" cy="72" r="8"/></svg>}
              </div>
              <div className="sl-experience-card__bottom"><h3>{item.title}</h3><p>{item.detail}</p><span className="sl-experience-card__arrow" aria-hidden="true"><MoveUpLeft size={20}/></span></div>
            </article>)}
          </div>
        </div>
      </section>

      <section className="sl-quote sl-dark"><div className="sl-wrap reveal"><span className="sl-quote__index">THE SUKUK JOURNEY</span><p>نفهم <i>أولًا.</i><br/>نقيّم <i>ثانيًا.</i><br/><em>ثم نبني.</em></p><span className="sl-quote__mark">03 / 03</span></div></section>
      <Timeline />

      <section className="sl-goals sl-ivory" id="goals">
        <div className="sl-wrap"><SectionHeading label="أهدافنا" title="أثر يبقى بعد الأيام الثلاثة." description="ما الذي يسعى البرنامج إلى تمكينك منه؟"/>
          <div className="sl-goals__list">{objectives.map((obj, i) => <article key={obj.title} className="sl-goal reveal" style={{ transitionDelay: `${i * 60}ms` }}><span className="sl-goal__index">0{i+1}</span><h3>{obj.title}</h3><p>{obj.body}</p><ChevronLeft aria-hidden="true" size={22}/></article>)}</div>
        </div>
      </section>

      <section className="sl-outcomes sl-dark" id="outcomes"><div className="sl-wrap">
        <SectionHeading label="مخرجات المشارك" title="تخرج بمعرفة قابلة للتطبيق." dark />
        <div className="sl-outcomes__grid">{[
          { n:"01",h:"يفهم",d:"ما الصك، وما الفرق بينه وبين السند والمرابحة." },
          { n:"02",h:"يقيّم",d:"يقرأ العائد وعوامل المخاطر في صك متداول." },
          { n:"03",h:"يبني",d:"يفهم خطوات هيكلة الإصدار وأدوار أطرافه." },
          { n:"04",h:"شهادة حضور",d:"شهادة حضور معتمدة من إثمار والجهة الراعية." },
        ].map((v, i)=><article key={v.n} className="sl-outcome reveal" style={{ transitionDelay:`${i*75}ms` }}><span>{v.n}</span><h3>{v.h}</h3><p>{v.d}</p></article>)}</div>
      </div></section>

      <section className="sl-audience sl-ivory" id="audience"><div className="sl-wrap sl-audience__grid">
        <div className="reveal"><p className="sl-kicker"><span className="sl-kicker__dash"/>الفئة المستهدفة</p><h2>مكانك<br/><em>بيننا.</em></h2></div>
        <div className="sl-audience__details reveal"><p>يستهدف البرنامج طلاب وطالبات جامعة الملك سعود من تخصصات المالية والمحاسبة والاقتصاد وإدارة الأعمال.</p><p>ويفتح باب المشاركة لكل مهتم بأسواق الدين من مختلف التخصصات والجامعات.</p><div className="sl-audience__note"><span className="sl-audience__star">✳</span><p><b>لا تُشترط خلفية مسبقة.</b><br/>اليوم الأول يبني الأساس، واليومان التاليان يبنيان المهارة.</p></div></div>
      </div></section>

      <section className="sl-partners sl-ivory" id="partners"><div className="sl-wrap"><p className="sl-kicker"><span className="sl-kicker__dash"/>الجهات المشاركة</p><div className="sl-partners__grid">
        <div className="reveal"><span>الجهة المنظمة</span><strong>مبادرة إثمار المالية</strong></div>
        <div className="reveal"><span>الراعي الرئيسي</span><strong>صكوك كابيتال</strong></div>
        <div className="reveal"><span>الشريك المستضيف</span><strong>جامعة الملك سعود</strong></div>
      </div></div></section>

      <section className="sl-final-cta sl-dark" id="register"><div className="sl-final-cta__halo" aria-hidden="true"/><div className="sl-wrap sl-final-cta__inner reveal">
        <span className="sl-kicker">هذه البداية.</span>
        <h2>خلّك خبير<br/><em>الصكوك.</em></h2>
        <p>{firstProgramDay} · {PROGRAM_CITY} · {TARGET_PARTICIPANTS} طالب وطالبة مستهدفون</p>
        <Link className="sl-button sl-button--gold sl-button--large" to="/register"><span>{isOpen ? "سجّل الآن" : "انتقل للتسجيل"}</span><ArrowUpLeft size={23}/></Link>
        {registration.isError && <p className="sl-final-cta__sub">تعذّر التحقق من حالة التسجيل. يمكنك فتح صفحة التسجيل للاطلاع على الحالة.</p>}
        {registration.data && !isOpen && <p className="sl-final-cta__sub">التسجيل غير متاح في قاعدة البيانات حاليًا.</p>}
      </div></section>
    </main>
    <SiteFooter />
  </>;
}
