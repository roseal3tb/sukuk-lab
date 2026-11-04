import { describe, expect, it } from "vitest";
import { registrationSchema, toCsv } from "@/lib/registration";

const valid = {
  full_name: "سارة محمد العتيبي",
  email: "sara@example.com",
  phone: "+966512345678",
  university: "جامعة الملك سعود",
  major: "المالية",
  study_year: "السنة الثالثة",
  sukuk_knowledge: "معرفة بسيطة بالصكوك",
  motivation: "أريد التعرف على أسواق الدين بشكل أعمق",
  learning_goal: "أطمح إلى فهم تقييم الصكوك وطريقة إصدارها",
  ithmar_member: "no",
  can_attend_all_days: "yes",
  consent: true,
};
describe("registration validation", () => {
  it("accepts complete valid application", () => {
    expect(registrationSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects applications lacking explicit consent", () => {
    expect(registrationSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });
  it("rejects incomplete three-part names", () => {
    expect(registrationSchema.safeParse({ ...valid, full_name: "سارة محمد" }).success).toBe(false);
  });
  it("escapes CSV formula prefixes", () => {
    const csv = toCsv([{ full_name: "=HYPERLINK(\"bad\")" }], ["full_name"]);
    expect(csv).toContain("'=HYPERLINK");
  });
});
