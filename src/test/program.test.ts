import { describe, expect, it } from "vitest";
import { PROGRAM_START_DATE, PROGRAM_DAYS, objectives, outcomes, programDays, programAgenda } from "@/lib/program";

describe("SUKUK LAB proposal alignment", () => {
  it("uses the approved 8 November start and three consecutive days", () => {
    expect(PROGRAM_START_DATE).toBe("2026-11-08");
    expect(PROGRAM_DAYS).toBe(3);
    expect(programDays.map((day) => day.iso)).toEqual([
      "2026-11-08", "2026-11-09", "2026-11-10"
    ]);
  });
  it("includes all five objectives and four outcomes", () => {
    expect(objectives).toHaveLength(5);
    expect(outcomes).toHaveLength(4);
    expect(objectives.at(-1)?.title).toContain("الصناعة");
  });
  it("includes three day agendas without invented hourly slots", () => {
    expect(programAgenda).toHaveLength(3);
    for (const day of programAgenda) expect(day.points.length).toBeGreaterThanOrEqual(2);
  });
});
