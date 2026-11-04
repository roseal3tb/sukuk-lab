import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpLeft, Menu, X } from "lucide-react";

const nav = [
  { id: "about", label: "عن البرنامج" },
  { id: "experience", label: "التجربة" },
  { id: "timeline", label: "الرحلة" },
  { id: "goals", label: "الأهداف" },
  { id: "outcomes", label: "المخرجات" },
  { id: "audience", label: "الفئة المستهدفة" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let ticking = false;
    function update() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 32);
        ticking = false;
      });
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open]);

  return (
    <header className={`sl-header ${scrolled ? "is-scrolled" : ""} ${open ? "menu-open" : ""}`}>
      <div className="sl-header__inner">
        <Link to="/" className="sl-brand" aria-label="SUKUK LAB — الصفحة الرئيسية">
          <span className="sl-brand__mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong dir="ltr">SUKUK LAB</strong>
            <small>صكوك لاب</small>
          </span>
        </Link>

        <nav aria-label="التنقل الرئيسي" className="sl-header__nav">
          {nav.map((item) => (
            <a key={item.id} href={`/#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>

        <Link to="/register" className="sl-header__cta">
          سجّل الآن <ArrowUpLeft size={16} />
        </Link>

        <button
          className="sl-menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="sl-mobile-menu"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <nav id="sl-mobile-menu" aria-label="قائمة الهاتف" className={`sl-mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
        {nav.map((item, i) => (
          <a key={item.id} href={`/#${item.id}`} onClick={() => setOpen(false)} style={{ animationDelay: `${i * 55}ms` }}>
            {item.label}
          </a>
        ))}
        <Link to="/register" onClick={() => setOpen(false)}>
          سجّل الآن <ArrowUpLeft size={18} />
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="sl-footer" id="contact">
      <div className="sl-wrap sl-footer__top sl-footer__grid">
        <div className="sl-footer__identity reveal">
          <Link to="/" className="sl-brand sl-footer__brand" aria-label="SUKUK LAB — الصفحة الرئيسية">
            <span className="sl-brand__mark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="sl-footer__brand-name">
              <strong dir="ltr">SUKUK LAB</strong>
              <small>صكوك لاب</small>
            </span>
          </Link>
          <p className="sl-footer__slogan">من الصفر إلى الإصدار</p>
          <p className="sl-footer__byline">مبادرة إثمار المالية · جامعة الملك سعود</p>
        </div>
        <nav className="sl-footer__links reveal" aria-label="روابط سريعة">
          <h3>روابط سريعة</h3>
          <a href="/#about">عن البرنامج</a>
          <a href="/#experience">التجربة</a>
          <a href="/#timeline">الرحلة</a>
          <a href="/#goals">الأهداف</a>
          <a href="/#partners">الشركاء</a>
          <Link to="/register">التسجيل</Link>
        </nav>
        <div className="sl-footer__right reveal">
          <h3>عن إثمار</h3>
          <p>مبادرة إثمار هي أول مبادرة طلابية مالية في جامعة الملك سعود، تابعة لبرنامج الشراكة الطلابية، وتهدف إلى زيادة الوعي المالي وتنمية المهارات المالية لدى المستفيدين.</p>
        </div>
      </div>
      <div className="sl-wrap sl-footer__bottom">
        <span>© {new Date().getFullYear()} SUKUK LAB · إثمار المالية</span>
        <span>من الصفر إلى الإصدار</span>
      </div>
    </footer>
  );
}
