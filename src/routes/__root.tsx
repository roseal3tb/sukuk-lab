import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext,
  HeadContent, Scripts, type ErrorComponentProps,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

function NotFound() {
  return <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-4 text-center" dir="rtl">
    <p className="latin text-7xl text-gold">404</p>
    <h1 className="text-2xl font-bold">الصفحة غير موجودة</h1>
    <Link to="/" className="rounded-full border border-gold px-6 py-3 text-gold">العودة للرئيسية</Link>
  </main>;
}

function RootError({ reset }: ErrorComponentProps) {
  return <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-4 text-center" dir="rtl">
    <h1 className="text-2xl font-bold">تعذّر تحميل الصفحة</h1>
    <p className="text-muted-foreground">حدث خطأ غير متوقع أثناء عرض الصفحة.</p>
    <button onClick={reset} className="rounded-full border border-gold px-6 py-3 text-gold">إعادة المحاولة</button>
    <Link to="/" className="text-gold underline">العودة للرئيسية</Link>
  </main>;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SUKUK LAB | مختبر الصكوك" },
      { name: "description", content: "من الصفر إلى الإصدار — برنامج مختبر الصكوك التطبيقي من مبادرة إثمار المالية." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Noto+Kufi+Arabic:wght@500;700;800&family=Cormorant+Garamond:wght@500;600;700&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: Shell,
  component: Root,
  errorComponent: RootError,
  notFoundComponent: NotFound,
});

function Shell({ children }: { children: ReactNode }) {
  return <html lang="ar" dir="rtl"><head><HeadContent /></head><body>{children}<Scripts /></body></html>;
}
function Root() {
  const { queryClient } = Route.useRouteContext();
  return <QueryClientProvider client={queryClient}><Outlet /><Toaster position="top-center" richColors /></QueryClientProvider>;
}
