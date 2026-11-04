import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { statusLabels, toCsv } from "@/lib/registration";

type AppStatus = keyof typeof statusLabels;
type Application = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  university: string;
  major: string;
  study_year: string | null;
  sukuk_knowledge: string | null;
  motivation: string | null;
  learning_goal: string | null;
  ithmar_member: boolean | null;
  can_attend_all_days: boolean | null;
  status: AppStatus;
  created_at: string;
};
type Settings = { id: number; is_open: boolean; capacity: number; waitlist_enabled: boolean };

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "إدارة التسجيل | SUKUK LAB" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) { setSession(data.session); setReady(true); }
    }).catch(() => { if (active) setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) { setSession(next); queryClient.invalidateQueries(); }
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [queryClient]);

  return <main className="min-h-screen bg-background px-5 py-10 text-foreground" dir="rtl">
    <div className="mx-auto max-w-6xl">
      <header className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <Link to="/" className="font-semibold text-gold">SUKUK LAB — إدارة التسجيل</Link>
        {session && <button className="text-sm underline" onClick={() => supabase.auth.signOut()}>تسجيل الخروج</button>}
      </header>
      {!ready ? <p>جارٍ التحميل…</p> : session ? <AdminGate userId={session.user.id} /> : <Login />}
    </div>
  </main>;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setErrorText("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorText("تعذّر تسجيل الدخول. تأكد من البريد وكلمة المرور.");
    setBusy(false);
  }
  return <form onSubmit={submit} className="mx-auto max-w-md space-y-5 rounded-xl border bg-card p-8">
    <h1 className="text-2xl font-bold">دخول مدير التسجيل</h1>
    <label className="block text-sm">البريد الإلكتروني
      <input className="mt-2 w-full rounded-md border bg-background p-3" type="email" dir="ltr" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
    </label>
    <label className="block text-sm">كلمة المرور
      <input className="mt-2 w-full rounded-md border bg-background p-3" type="password" dir="ltr" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
    </label>
    {errorText && <p role="alert" className="text-sm text-red-400">{errorText}</p>}
    <button className="w-full rounded-full bg-gold p-3 font-semibold text-ink disabled:opacity-50" disabled={busy}>{busy ? "جارٍ الدخول…" : "دخول"}</button>
    <p className="text-xs text-muted-foreground">الحسابات الإدارية تُمنح صلاحية admin من قاعدة البيانات بواسطة المسؤول الموثوق فقط.</p>
  </form>;
}

function AdminGate({ userId }: { userId: string }) {
  const role = useQuery({
    queryKey: ["admin-role", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
  if (role.isLoading) return <p>جارٍ التحقق من الصلاحيات…</p>;
  if (role.isError) return <p role="alert">تعذّر التحقق من صلاحيات الإدارة.</p>;
  if (!role.data) return <p role="alert">لا تملك صلاحية المدير. يجب منحها للحساب من مسؤول قاعدة البيانات.</p>;
  return <Dashboard />;
}

function Dashboard() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<AppStatus | "all">("all");
  const [selected, setSelected] = useState<Application | null>(null);
  useEffect(() => {
    if (!selected) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [selected]);
  const settings = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("registration_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data as Settings;
    },
  });
  const apps = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("id,full_name,email,phone,university,major,study_year,sukuk_knowledge,motivation,learning_goal,ithmar_member,can_attend_all_days,status,created_at").order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Application[];
    },
  });
  const updateSettings = useMutation({
    mutationFn: async (patch: Partial<Omit<Settings, "id">>) => {
      const { error } = await supabase.from("registration_settings").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حفظ الإعدادات");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["registration-status"] });
    },
    onError: () => toast.error("تعذّر حفظ الإعدادات"),
  });
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppStatus }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-applications"] }),
    onError: () => toast.error("تعذّر تحديث حالة الطلب"),
  });
  const rows = apps.data ?? [];
  const counts = useMemo(() => {
    const result = { pending: 0, accepted: 0, rejected: 0, waitlisted: 0 };
    for (const row of rows) result[row.status]++;
    return result;
  }, [rows]);
  const visible = filter === "all" ? rows : rows.filter(row => row.status === filter);
  function exportCsv() {
    if (!visible.length) return;
    const content = toCsv(visible.map(row => ({
      ...row,
      status: statusLabels[row.status],
      ithmar_member: row.ithmar_member == null ? "" : row.ithmar_member ? "نعم" : "لا",
      can_attend_all_days: row.can_attend_all_days == null ? "" : row.can_attend_all_days ? "نعم" : "لا",
    })),
      ["full_name", "email", "phone", "university", "major", "study_year", "sukuk_knowledge", "motivation", "learning_goal", "ithmar_member", "can_attend_all_days", "status", "created_at"]);
    const file = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a"); link.href = url; link.download = "sukuk-lab-applications.csv"; link.click();
    URL.revokeObjectURL(url);
  }
  return <div className="space-y-10">
    <h1 className="text-3xl font-bold">لوحة إدارة المتقدمين</h1>
    {settings.isError && <p role="alert" className="text-red-400">تعذّر تحميل إعدادات التسجيل.</p>}
    {settings.data && <section className="rounded-xl border bg-card p-6">
      <h2 className="mb-6 text-xl font-bold">إعدادات التسجيل</h2>
      <div className="grid gap-6 md:grid-cols-3">
        <div><p className="text-sm text-muted-foreground">الحالة الحالية</p>
          <p className="my-3 text-xl font-semibold">{settings.data.is_open ? "مفتوح" : "مغلق"}</p>
          <button className="rounded-full border border-gold px-5 py-2 text-gold disabled:opacity-50" disabled={updateSettings.isPending}
            onClick={() => updateSettings.mutate({ is_open: !settings.data?.is_open })}>
            {settings.data.is_open ? "إغلاق التسجيل" : "فتح التسجيل"}
          </button>
        </div>
        <form onSubmit={e => {
          e.preventDefault();
          const capacity = Number(new FormData(e.currentTarget).get("capacity"));
          if (Number.isInteger(capacity) && capacity > 0 && capacity <= 10000) updateSettings.mutate({ capacity });
          else toast.error("ادخل عددًا صحيحًا للمقاعد");
        }}>
          <label htmlFor="capacity" className="text-sm text-muted-foreground">العدد المستهدف</label>
          <div className="mt-2 flex flex-wrap gap-2"><input id="capacity" name="capacity" type="number" min={1} max={10000} defaultValue={settings.data.capacity} key={settings.data.capacity}
            className="w-28 rounded-md border bg-background px-3 py-2"/><button className="rounded-md bg-gold px-4 py-2 font-semibold text-ink">حفظ</button></div>
          <p className="mt-2 text-xs text-muted-foreground">المقاعد المحجوزة مبدئيًا: {counts.pending + counts.accepted}</p>
        </form>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 accent-yellow-500" checked={settings.data.waitlist_enabled}
          onChange={e => updateSettings.mutate({ waitlist_enabled: e.target.checked })}/><span>السماح بقائمة الانتظار عند اكتمال العدد</span></label>
      </div>
    </section>}
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><h2 className="text-xl font-bold">الطلبات ({rows.length})</h2>
        <button disabled={!visible.length} className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink disabled:opacity-50" onClick={exportCsv}>تصدير CSV</button></div>
      <div className="mb-5 flex flex-wrap gap-2">{(["all", "pending", "accepted", "waitlisted", "rejected"] as const).map(s =>
        <button key={s} onClick={() => setFilter(s)} aria-pressed={filter === s}
          className={`rounded-full border px-4 py-1 text-sm ${filter === s ? "border-gold text-gold" : "text-muted-foreground"}`}>
          {s === "all" ? "الكل" : statusLabels[s]}
        </button>)}</div>
      {apps.isError ? <p role="alert">تعذّر تحميل الطلبات.</p> : apps.isLoading ? <p>جارٍ تحميل الطلبات…</p> : !visible.length ? <p className="rounded-xl border p-8 text-center">لا توجد طلبات.</p> :
        <div className="overflow-x-auto rounded-xl border"><table className="w-full min-w-[900px] text-right text-sm">
          <thead className="bg-card"><tr>{["الاسم", "البريد", "الهاتف", "الجامعة", "التخصص", "التاريخ", "الحالة", "الإجابات"].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead>
          <tbody>{visible.map(row => <tr key={row.id} className="border-t">
            <td className="p-4">{row.full_name}</td><td className="p-4" dir="ltr">{row.email}</td><td className="p-4" dir="ltr">{row.phone}</td>
            <td className="p-4">{row.university}</td><td className="p-4">{row.major}</td><td className="p-4">{new Date(row.created_at).toLocaleDateString("ar-SA-u-ca-gregory")}</td>
            <td className="p-4"><select className="rounded-md border bg-background p-2" aria-label={`حالة طلب ${row.full_name}`} value={row.status}
              onChange={e => updateStatus.mutate({ id: row.id, status: e.target.value as AppStatus })}>
              {(Object.keys(statusLabels) as AppStatus[]).map(s => <option value={s} key={s}>{statusLabels[s]}</option>)}
            </select></td>
            <td className="p-4"><button type="button" className="rounded-full border border-gold px-3 py-2 text-gold" onClick={() => setSelected(row)}>عرض التفاصيل</button></td>
          </tr>)}</tbody></table></div>}
    </section>
    {selected && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="app-detail-title" className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gold/30 bg-card p-6 text-foreground shadow-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id="app-detail-title" className="text-xl font-bold">تفاصيل طلب {selected.full_name}</h2>
          <button autoFocus type="button" className="rounded-full border border-gold px-4 py-2 text-gold" onClick={() => setSelected(null)}>إغلاق</button>
        </div>
        <dl className="grid gap-4">
          {([
            ["الاسم", selected.full_name],
            ["البريد الإلكتروني", selected.email],
            ["رقم الجوال", selected.phone],
            ["الجامعة", selected.university],
            ["التخصص", selected.major],
            ["السنة الدراسية", selected.study_year ?? "—"],
            ["المعرفة الحالية بالصكوك", selected.sukuk_knowledge ?? "—"],
            ["سبب الرغبة في الانضمام", selected.motivation ?? "—"],
            ["ما يرغب في تعلمه", selected.learning_goal ?? "—"],
            ["هل هو من فريق إثمار", selected.ithmar_member == null ? "—" : selected.ithmar_member ? "نعم" : "لا"],
            ["القدرة على حضور جميع الأيام", selected.can_attend_all_days == null ? "—" : selected.can_attend_all_days ? "نعم" : "لا"],
          ] as [string, string][]).map(([label, value]) => (
            <div className="border-b border-gold/15 pb-3" key={label}><dt className="mb-1 text-xs text-muted-foreground">{label}</dt><dd className="whitespace-pre-wrap break-words text-sm leading-7">{value}</dd></div>
          ))}
        </dl>
      </section>
    </div>}
  </div>;
}
