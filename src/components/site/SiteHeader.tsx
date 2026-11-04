import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpLeft, Mail, Menu, Phone, X } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/program";

const nav = [
  { id: "about", label: "عن البرنامج" },
  { id: "experience", label: "التجربة" },
  { id: "timeline", label: "الرحلة" },
  { id: "goals", label: "الأهداف" },
  { id: "partners", label: "الشركاء" },
  { id: "contact", label: "التواصل" },
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
        <div className="sl-footer__identity">
          <p className="sl-kicker">SUKUK LAB · ITHMAR</p>
          <h2>صكوك <em>لاب</em></h2>
          <p>من الصفر إلى الإصدار</p>
          <p>برنامج تطبيقي مكثف تنظمه مبادرة إثمار المالية بجامعة الملك سعود.</p>
        </div>
        <nav className="sl-footer__links" aria-label="روابط سريعة">
          <h3>روابط سريعة</h3>
          <a href="/#about">عن البرنامج</a>
          <a href="/#experience">التجربة</a>
          <a href="/#timeline">الرحلة</a>
          <a href="/#goals">الأهداف</a>
          <a href="/#partners">الشركاء</a>
          <Link to="/register">التسجيل</Link>
        </nav>
        <div className="sl-footer__right">
          <h3>تواصل معنا</h3>
          <p>يسعدنا الرد على استفساراتك</p>
          <div className="sl-footer__contact-list">
            <a href={`mailto:${CONTACT_EMAIL}`}>
              <Mail size={17} />
              <span dir="ltr">{CONTACT_EMAIL}</span>
            </a>
            <a href={`tel:${CONTACT_PHONE.replace(/\s+/g, "")}`}>
              <Phone size={17} />
              <span dir="ltr">{CONTACT_PHONE}</span>
            </a>
          </div>
        </div>
      </div>
      <div className="sl-wrap sl-footer__bottom">
        <span>© {new Date().getFullYear()} SUKUK LAB · مبادرة إثمار المالية</span>
        <span>من الصفر إلى الإصدار</span>
      </div>
    </footer>
  );
}
