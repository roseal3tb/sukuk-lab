import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const nav = [
  { href: "/#about", label: "عن البرنامج" },
  { href: "/#goals", label: "الأهداف" },
  { href: "/#timeline", label: "الجدول الزمني" },
  { href: "/#audience", label: "الفئة المستهدفة" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-baseline gap-3" aria-label="SUKUK LAB — الصفحة الرئيسية">
          <span className="latin text-xl font-semibold tracking-[0.18em] text-gold">SUKUK LAB</span>
          <span className="hidden text-sm text-muted-foreground sm:inline">مختبر الصكوك</span>
        </Link>
        <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="text-sm text-muted-foreground transition-colors hover:text-gold">
              {n.label}
            </a>
          ))}
          <Link to="/register" className="rounded-full border border-gold px-5 py-2 text-sm text-gold transition-colors hover:bg-gold hover:text-ink">
            التسجيل
          </Link>
        </nav>
        <button
          className="md:hidden text-foreground"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav aria-label="التنقل للجوال" className="border-t bg-background px-5 py-4 md:hidden">
          {[...nav, { href: "/register", label: "التسجيل" }].map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="block py-3 text-foreground">
              {n.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-background py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-baseline gap-3">
          <span className="latin text-lg font-semibold tracking-[0.18em] text-gold">SUKUK LAB</span>
          <span>مختبر الصكوك</span>
        </div>
        <p>تنظيم مبادرة إثمار المالية — جامعة الملك سعود</p>
      </div>
    </footer>
  );
}
