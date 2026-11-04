import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowLeft, ArrowUpLeft } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { useRegistrationStatus } from "@/hooks/use-registration-status";
import { useReveal } from "@/hooks/use-reveal";
import {
  experiences,
  firstProgramDay,
  objectives,
  programAgenda,
  programDateLabel,
  programDays,
  PROGRAM_CITY,
  TARGET_PARTICIPANTS,
} from "@/lib/program";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SUKUK LAB | مختبر الصكوك — من الصفر إلى الإصدار" },
      {
        name: "description",
        content: "صكوك لاب — برنامج تطبيقي مكثف في الصكوك وأدوات الدين تنظمه مبادرة إثمار المالية بجامعة الملك سعود",
      },
      { property: "og:title", content: "SUKUK LAB | مختبر الصكوك" },
      { property: "og:description", content: "من الصفر إلى الإصدار — برنامج تطبيقي في الصكوك وأدوات الدين" },
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
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setWidth(max <= 0 ? 0 : Math.min(100, (window.scrollY / max) * 100));
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <div className="sl-page-progress" aria-hidden="true" style={{ width: `${width}%` }} />;
}

function HeroGraphic() {
  return (
    <div className="sl-orbit" aria-hidden="true">
      <svg viewBox="0 0 620 620" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="orbGrad" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#C9A24A" stopOpacity=".03" />
            <stop offset=".46" stopColor="#C9A24A" stopOpacity=".5" />
            <stop offset="1" stopColor="#C9A24A" stopOpacity=".07" />
          </linearGradient>
        </defs>
        {[270, 222, 175, 126].map((r, i) => (
          <circle key={r} cx="310" cy="310" r={r} stroke="url(#orbGrad)" strokeWidth="1" strokeDasharray={i === 1 ? "2 8" : "none"} />
        ))}
        <path className="sl-orbit__path" d="M68 403 C142 366 170 415 237 336 S335 219 401 287 S491 313 550 206" stroke="#C9A24A" strokeWidth="2" fill="none" />
        <path d="M68 403 V442 M237 336 V442 M401 287 V442 M550 206 V442" stroke="#C9A24A" strokeOpacity=".14" strokeDasharray="3 8" fill="none" />
        {[68, 237, 401, 550].map((x, i) => (
          <circle key={i} cx={x} cy={[403, 336, 287, 206][i]} r="5" fill="#C9A24A" />
        ))}
      </svg>

    </div>
  );
}

function SectionHeading({
  label,
  title,
  description,
  dark = false,
}: {
  label: string;
  title: string;
  description?: string;
  dark?: boolean;
}) {
  return (
    <div className={`sl-section-heading reveal ${dark ? "sl-section-heading--dark" : ""}`}>
      <p className="sl-kicker">
        <span className="sl-kicker__dash" />
        {label}
      </p>
      <h2>{title}</h2>
      {description && <p className="sl-section-heading__desc">{description}</p>}
    </div>
  );
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
        const travel = rect.height + window.innerHeight * 0.18;
        setProgress(Math.min(1, Math.max(0, (window.innerHeight * 0.5 - rect.top) / travel)));

        const sections = Array.from(node.querySelectorAll(".sl-journey__day")) as HTMLElement[];
        let next = 0;
        sections.forEach((section: HTMLElement, index) => {
          if (section.getBoundingClientRect().top < window.innerHeight * 0.68) next = index;
        });
        setActive(next);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section className="sl-journey sl-dark" id="timeline" aria-labelledby="timeline-heading">
      <div className="sl-wrap">
        <SectionHeading
          dark
          label="الرحلة"
          title="من الفهم إلى الإصدار"
        />

        <ol className="sl-journey__list sl-journey__list--stacked" ref={ref} style={{ "--sl-timeline-progress": `${progress * 100}%` } as CSSProperties}>
          {programAgenda.map((item, index) => (
            <li className={`sl-journey__day reveal ${active === index ? "is-active" : ""}`} key={item.number}>
              <div className="sl-journey__node" aria-hidden="true">
                <span>{item.number}</span>
              </div>
              <div className="sl-journey__panel">
                <header className="sl-journey__date">
                  <span>{item.day}</span>
                  <span>
                    {programDays[index].weekday} · {programDays[index].short}
                  </span>
                </header>
                <div className="sl-journey__content">
                  <div>
                    <span className="sl-journey__eyebrow">{item.eyebrow}</span>
                    <h3>{item.title}</h3>
                    <p className="sl-journey__description">{item.description}</p>
                  </div>

                </div>
                <ul className="sl-journey__points">
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Index() {
  useReveal();
  const registration = useRegistrationStatus();
  const isOpen = registration.data?.is_open === true;

  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      <main id="main" className="sl-main">
        <section className="sl-hero sl-dark" aria-labelledby="hero-title">
          <div className="sl-hero__grain" aria-hidden="true" />
          <HeroGraphic />
          <div className="sl-wrap sl-hero__shell">
            <div className="sl-hero__eyebrow sl-hero__animate">
              <span className="sl-dot" /> مبادرة إثمار المالية · جامعة الملك سعود
            </div>
            <div className="sl-hero__content">
              <p className="sl-hero__micro sl-hero__animate">SUKUK LAB | صكوك لاب</p>
              <h1 id="hero-title" className="sl-hero__title">
                <span className="sl-title-line">
                  <span>من الصفر</span>
                </span>
                <span className="sl-title-line">
                  <span>
                    <em>إلى</em> الإصدار
                  </span>
                </span>
              </h1>
              <div className="sl-hero__under sl-hero__animate">
                <p>برنامج تطبيقي مكثف في الصكوك وأدوات الدين</p>
                <span className="sl-hero__rule" />
              </div>
              <div className="sl-hero__actions sl-hero__animate">
                <Link to="/register" className="sl-button sl-button--gold">
                  <span>{isOpen ? "سجّل الآن" : "التسجيل"}</span>
                  <ArrowUpLeft size={20} />
                </Link>
                <a href="#about" className="sl-text-link">
                  اكتشف البرنامج <ArrowLeft size={18} />
                </a>
              </div>
            </div>
            <div className="sl-hero__bottom sl-hero__animate">
              <div className="sl-hero__meta">
                <span>{programDateLabel}</span>
                <i />
                <span>{PROGRAM_CITY}</span>
                <i />
                <span>3 أيام</span>
              </div>
              <a className="sl-scroll-down" href="#about" aria-label="مرر لاكتشاف البرنامج">
                <span>مرّر للاكتشاف</span>
                <ArrowDown size={17} />
              </a>
            </div>
          </div>
        </section>

        <section className="sl-about sl-ivory" id="about">
          <div className="sl-wrap sl-about__grid sl-about__grid--polished">
            <div className="sl-about__lead reveal">
              <p className="sl-kicker">
                <span className="sl-kicker__dash" />عن البرنامج
              </p>
              <h2>
                Sukuk Lab
                <br />
                <em>صكوك لاب</em>
              </h2>
              <span className="sl-about__underscore" />
            </div>
            <div className="sl-about__story reveal">
              <p className="sl-about__big">
                صكوك لاب هو برنامج تطبيقي مكثف تنظمه مبادرة إثمار المالية بجامعة الملك سعود، يهدف إلى تمكين الطلاب والطالبات من فهم الصكوك وأدوات الدين، وتطوير مهاراتهم في تقييم الصكوك وفهم آليات هيكلة الإصدارات المالية
              </p>
              <p>
                يمتد البرنامج على مدى ثلاثة أيام، من خلال جلسات حوارية مع خبراء القطاع المالي، وورش عمل تطبيقية، ودراسة حالة واقعية تتيح للمشاركين تحويل المعرفة النظرية إلى تجربة عملية تحاكي سوق العمل
              </p>
              <p className="sl-about__goal">
                <strong>هدفنا</strong>
                <span>بناء جيل يمتلك المعرفة والمهارات اللازمة لفهم أدوات الدين والمساهمة في تطوير القطاع المالي في المملكة</span>
              </p>
            </div>
          </div>
        </section>

        <section className="sl-experience sl-ivory" id="experience">
          <div className="sl-wrap">
            <SectionHeading
              label="التجربة"
              title="نتعلّم بالتجربة"
            />
            <div className="sl-experience__grid">
              {experiences.map((item, i) => (
                <article className={`sl-experience-card sl-experience-card--${i + 1} reveal`} key={item.number} style={{ "--sl-reveal-delay": `${i * 170}ms` } as CSSProperties}>
                  <div className="sl-experience-card__top">
                    <span>{item.english}</span>
                  </div>
                  <div className="sl-experience-card__art" aria-hidden="true">
                    {i === 0 ? (
                      <svg viewBox="0 0 200 180">
                        <circle cx="100" cy="88" r="52" />
                        <circle cx="100" cy="88" r="76" />
                        <path d="M60 90h80M100 48v82" />
                      </svg>
                    ) : i === 1 ? (
                      <svg viewBox="0 0 200 180">
                        <path d="M29 142h150M35 135V95h29v40M85 135V73h30v62M136 135V41h30v94" />
                        <path d="M27 85l50-20 31-16 55-34" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 200 180">
                        <path d="M28 138h150M35 98l42 40 42-66 44 66M44 41h110M44 56h76" />
                        <circle cx="120" cy="72" r="8" />
                      </svg>
                    )}
                  </div>
                  <div className="sl-experience-card__bottom">
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Timeline />

        <section className="sl-goals sl-ivory" id="goals">
          <div className="sl-wrap">
            <SectionHeading
              label="الأهداف"
              title="ماذا ستتعلم"
            />
            <div className="sl-goals-cards">
              {objectives.map((objective, index) => (
                <article key={objective.title} className="sl-goals-card reveal" style={{ "--sl-reveal-delay": `${index * 115}ms` } as CSSProperties}>
                  <span className="sl-goals-card__index">0{index + 1}</span>
                  <h3>{objective.title}</h3>
                  <p>{objective.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sl-audience sl-dark" id="audience">
          <div className="sl-wrap sl-audience__shell">
            <SectionHeading
              dark
              label="الفئة المستهدفة"
              title="للمهتمين بأسواق الدين"
            />
            <div className="sl-tags reveal">
              {[
                "المالية",
                "المحاسبة",
                "الاقتصاد",
                "إدارة الأعمال",
                "المهتمون بأسواق الدين",
                "مختلف الجامعات والتخصصات",
              ].map((item) => (
                <span key={item} className="sl-tag">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="sl-partners sl-ivory" id="partners">
          <div className="sl-wrap">
            <SectionHeading
              label="الشركاء"
              title="شركاء الرحلة"
            />
            <div className="sl-logo-grid">
              <article className="sl-logo-card reveal" style={{ "--sl-reveal-delay": "0ms" } as CSSProperties}>
                <span>الجهة المنظمة · إثمار</span>
                <img src="/logos/ethmar.png" alt="شعار إثمار" loading="lazy" />
              </article>
              <article className="sl-logo-card reveal" style={{ "--sl-reveal-delay": "170ms" } as CSSProperties}>
                <span>الراعي الرئيسي · Sukuk Capital</span>
                <img src="/logos/sukuk-capital.png" alt="شعار Sukuk Capital" loading="lazy" />
              </article>
              <article className="sl-logo-card reveal" style={{ "--sl-reveal-delay": "340ms" } as CSSProperties}>
                <span>الشريك المستضيف · الأكاديمية المالية</span>
                <img src="/logos/financial-academy.png" alt="شعار الأكاديمية المالية" loading="lazy" />
              </article>
            </div>
          </div>
        </section>

        <section className="sl-final-cta sl-dark" id="register">
          <div className="sl-final-cta__halo" aria-hidden="true" />
          <div className="sl-wrap sl-final-cta__inner reveal">
            <span className="sl-kicker">هذه البداية</span>
            <h2>
              جاهز تبدأ
              <br />
              <em>رحلتك معنا</em>
            </h2>
            <p>
              {programDateLabel} · {PROGRAM_CITY}
            </p>

            <div className="sl-final-cta__actions">
              <Link className="sl-button sl-button--gold sl-button--large" to="/register">
                <span>{isOpen ? "سجّل الآن" : "انتقل للتسجيل"}</span>
                <ArrowUpLeft size={23} />
              </Link>
            </div>

            {registration.isError && (
              <p className="sl-final-cta__sub">تعذّر التحقق من حالة التسجيل ويمكنك الانتقال إلى صفحة التسجيل للاطلاع على الحالة</p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
