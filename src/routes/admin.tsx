import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { statusLabels, toCsv } from "@/lib/registration";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "لوحة الإدارة | SUKUK LAB" },
      { name: "description", content: "لوحة إدارة طلبات التسجيل في مختبر الصكوك." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "لوحة الإدارة | SUKUK LAB" },
      { property: "og:description", content: "منطقة إدارية محمية." },
    ],
  }),
  component: AdminPage,
});

type Status = keyof typeof statusLabels;

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setSession(s);
        qc.invalidateQueries();
      }
    });
    return () => data.subscription.unsubscribe();
  }, [qc]);

  return (
    <main className="min-h-screen px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <Link to="/" className="flex items-baseline gap-3">
            <span className="latin text-xl font-semibold tracking-[0.18em] text-gold">SUKUK LAB</span>
            <span className="text-sm text-muted-foreground">لوحة الإدارة</span>
          </Link>
          {session && (
            <button onClick={() => supabase.auth.signOut()} className="text-sm text-muted-foreground hover:text-gold">
              تسجيل الخروج
            </button>
          )}
        </header>
        {!ready ? <p>جارٍ التحميل…</p> : session ? <AdminGate userId={session.user.id} email={session.user.email ?? ""} /> : <SignIn />}
      </div>
    </main>
  );
}

function SignIn() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    setBusy(true);
    setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("بيانات الدخول غير صحيحة أو لم يُؤكَّد البريد بعد.");
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      setMsg(error ? error.message : "أُرسل رابط تأكيد إلى بريدك. بعد التأكيد يجب منح الحساب صلاحية المدير.");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-5 rounded-lg border bg-card p-8">
      <h1 className="text-2xl font-bold">{mode === "in" ? "دخول المدير" : "إنشاء حساب"}</h1>
      <div>
        <label htmlFor="email" className="mb-2 block text-sm">البريد الإلكتروني</label>
        <input id="email" name="email" type="email" dir="ltr" required className="w-full rounded-md border bg-background px-3 py-2" />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm">كلمة المرور</label>
        <input id="password" name="password" type="password" dir="ltr" required minLength={8} className="w-full rounded-md border bg-background px-3 py-2" />
      </div>
      {msg && <p role="status" className="text-sm text-muted-foreground">{msg}</p>}
      <button disabled={busy} className="w-full rounded-full bg-gold py-2.5 font-semibold text-ink disabled:opacity-60">
        {mode === "in" ? "دخول" : "إنشاء الحساب"}
      </button>
      <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-sm text-muted-foreground hover:text-gold">
        {mode === "in" ? "ليس لديك حساب؟ أنشئ حسابًا" : "لديك حساب؟ سجّل الدخول"}
      </button>
    </form>
  );
}

function AdminGate({ userId, email }: { userId: string; email: string }) {
  const role = useQuery({
    queryKey: ["is-admin", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
  if (role.isLoading) return <p>جارٍ التحقق من الصلاحيات…</p>;
  if (!role.data)
    return (
      <div className="mx-auto max-w-md rounded-lg border bg-card p-8 text-center">
        <h1 className="text-xl font-bold">لا تملك صلاحية الوصول</h1>
        <p className="mt-3 text-sm text-muted-foreground">الحساب <span dir="ltr">{email}</span> ليس لديه صلاحية المدير.</p>
      </div>
    );
  return <Dashboard />;
}

function Dashboard() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Status | "all">("all");

  const settings = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("registration_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });

  const apps = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveSettings = useMutation({
    mutationFn: async (patch: { is_open?: boolean; capacity?: number; waitlist_enabled?: boolean }) => {
      const { error } = await supabase.from("registration_settings").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("حُفظت الإعدادات");
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      qc.invalidateQueries({ queryKey: ["registration-status"] });
    },
    onError: () => toast.error("تعذّر حفظ الإعدادات"),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-applications"] }),
    onError: () => toast.error("تعذّر تحديث الحالة"),
  });

  const rows = apps.data ?? [];
  const counts = useMemo(() => {
    const c: Record<string, number> = { pending: 0, accepted: 0, waitlisted: 0, rejected: 0 };
    rows.forEach((r) => (c[r.status] += 1));
    return c;
  }, [rows]);
  const visible = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const s = settings.data;
  const seated = counts.pending + counts.accepted;

  function exportCsv() {
    const csv = toCsv(
      visible.map((r) => ({ ...r, status: statusLabels[r.status as Status] })),
      ["full_name", "email", "phone", "university", "major", "status", "created_at"],
    );
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `sukuk-lab-applicants-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-10">
      <section className="rounded-lg border bg-card p-6" aria-labelledby="settings-h">
        <h2 id="settings-h" className="mb-5 text-xl font-bold">إعدادات التسجيل</h2>
        {s && (
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">الحالة الحالية</p>
              <p className={`mt-1 text-lg font-bold ${s.is_open ? "text-gold" : ""}`}>{s.is_open ? "مفتوح" : "مغلق"}</p>
              <button
                onClick={() => saveSettings.mutate({ is_open: !s.is_open })}
                className="mt-3 rounded-full border border-gold px-5 py-2 text-sm text-gold hover:bg-gold hover:text-ink"
              >
                {s.is_open ? "إغلاق التسجيل" : "فتح التسجيل"}
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const n = Number(new FormData(e.currentTarget).get("capacity"));
                if (Number.isInteger(n) && n > 0 && n <= 10000) saveSettings.mutate({ capacity: n });
                else toast.error("أدخل رقمًا صحيحًا");
              }}
            >
              <label htmlFor="capacity" className="text-sm text-muted-foreground">الحد الأقصى للمقاعد</label>
              <div className="mt-2 flex gap-2">
                <input id="capacity" name="capacity" type="number" min={1} max={10000} defaultValue={s.capacity} key={s.capacity} className="w-28 rounded-md border bg-background px-3 py-2" />
                <button className="rounded-md bg-secondary px-4 text-sm">حفظ</button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">المشغول: {seated} من {s.capacity} (قيد المراجعة + مقبول)</p>
            </form>
            <div>
              <p className="text-sm text-muted-foreground">قائمة الانتظار عند اكتمال العدد</p>
              <label className="mt-3 flex items-center gap-3">
                <input type="checkbox" checked={s.waitlist_enabled} onChange={(e) => saveSettings.mutate({ waitlist_enabled: e.target.checked })} className="h-4 w-4 accent-gold" />
                <span className="text-sm">{s.waitlist_enabled ? "مفعّلة" : "معطّلة — تُرفض الطلبات بعد الاكتمال"}</span>
              </label>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="apps-h">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="apps-h" className="text-xl font-bold">المتقدمون ({rows.length})</h2>
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "accepted", "waitlisted", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`rounded-full border px-3 py-1 text-sm ${filter === f ? "border-gold text-gold" : "text-muted-foreground"}`}
              >
                {f === "all" ? "الكل" : `${statusLabels[f]} (${counts[f]})`}
              </button>
            ))}
            <button onClick={exportCsv} disabled={!visible.length} className="rounded-full bg-gold px-4 py-1 text-sm font-semibold text-ink disabled:opacity-50">
              تصدير CSV
            </button>
          </div>
        </div>
        {apps.isLoading ? (
          <p>جارٍ التحميل…</p>
        ) : !visible.length ? (
          <p className="rounded-lg border bg-card p-8 text-center text-muted-foreground">لا توجد طلبات.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-card text-right text-muted-foreground">
                <tr>
                  {["الاسم", "البريد", "الجوال", "الجامعة", "التخصص", "التاريخ", "الحالة"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3">{r.full_name}</td>
                    <td className="px-4 py-3" dir="ltr">{r.email}</td>
                    <td className="px-4 py-3" dir="ltr">{r.phone}</td>
                    <td className="px-4 py-3">{r.university}</td>
                    <td className="px-4 py-3">{r.major}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("ar-SA-u-ca-gregory")}</td>
                    <td className="px-4 py-3">
                      <select
                        aria-label={`حالة طلب ${r.full_name}`}
                        value={r.status}
                        onChange={(e) => setStatus.mutate({ id: r.id, status: e.target.value as Status })}
                        className="rounded-md border bg-background px-2 py-1"
                      >
                        {(Object.keys(statusLabels) as Status[]).map((k) => (
                          <option key={k} value={k}>{statusLabels[k]}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
