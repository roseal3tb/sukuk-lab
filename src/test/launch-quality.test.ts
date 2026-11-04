import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { experiences, objectives, outcomes, programAgenda, programDays } from "@/lib/program";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf-8");

describe("SUKUK LAB launch regression checks", () => {
  it("keeps the three user-approved experience cards and no standalone case-study section", () => {
    expect(experiences.map((item) => item.english)).toEqual(["DIALOGUES", "WORKSHOPS", "CASE STUDY"]);
    const home = source("src/routes/index.tsx");
    expect(home).toContain("experiences.map");
    expect(home).not.toContain('className="sl-case');
    expect(home).not.toContain('id="case-study"');
  });

  it("contains five source-based objectives, four outcomes and all three day agendas", () => {
    expect(objectives).toHaveLength(5);
    expect(outcomes).toHaveLength(4);
    expect(programAgenda).toHaveLength(3);
    expect(programDays.map(day => day.iso)).toEqual(["2026-11-08", "2026-11-09", "2026-11-10"]);
    expect(objectives[3]?.body).toMatch(/دراسة حالة/);
    expect(programAgenda[1]?.points.join(" ")).toMatch(/العائد حتى الاستحقاق/);
    expect(programAgenda[2]?.points.join(" ")).toMatch(/هيئة السوق المالية/);
  });

  it("uses the supplied icon without Arabic or Latin text in the hero graphic", () => {
    const svg = source("public/hero/sukuk-certificate.svg");
    expect(svg).not.toMatch(/<text(?:\s|>)/i);
    expect(svg).toContain("scale(1.78)");
  });

  it("does not expose full applications in public UI source or disable RLS migrations", () => {
    const schema = source("drizzle/migrations/0000_migration.sql");
    expect(schema).toContain("alter table public.applications enable row level security");
    expect(schema).toContain('create policy "Admins read applications"');
    expect(schema).toContain("security definer");
  });

  it("shows a full-capacity explanation instead of an unusable application form", () => {
    const route = source("src/routes/register.tsx");
    expect(route).toContain("status.data.full && !status.data.waitlist_enabled");
    expect(route).toContain("status.data.waitlist_enabled) && !result");
    expect(route).toContain('id="consent-err"');
  });

  it("uses paginated admin reads so applications beyond the first thousand appear", () => {
    const admin = source("src/routes/admin.tsx");
    expect(admin).toContain(".range(offset, offset + pageSize - 1)");
    expect(admin).toContain("all.push(...batch)");
  });
});
