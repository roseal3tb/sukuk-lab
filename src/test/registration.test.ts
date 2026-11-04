import { describe, it, expect } from "vitest";
import { registrationSchema, toCsv } from "@/lib/registration";

const valid = {
  full_name: "سارة أحمد",
  email: "s@example.com",
  phone: "0551234567",
  university: "جامعة الملك سعود",
  major: "المالية",
  consent: true as const,
};

describe("registration rules", () => {
  it("accepts a complete form", () => {
    expect(registrationSchema.safeParse(valid).success).toBe(true);
  });
  it("requires data-use consent", () => {
    expect(registrationSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });
  it("rejects a phone with letters", () => {
    expect(registrationSchema.safeParse({ ...valid, phone: "05abc" }).success).toBe(false);
  });
  it("neutralises spreadsheet formulas in CSV export", () => {
    expect(toCsv([{ a: "=SUM(1)" }], ["a"])).toContain(`"'=SUM(1)"`);
  });
});
