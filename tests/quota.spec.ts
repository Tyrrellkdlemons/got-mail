import { describe, it, expect } from "vitest";
import { getProvider } from "../src/lib/providers";

describe("Provider abstraction & quota", () => {
  it("has a module for every advertised provider kind", () => {
    const kinds = [
      "brevo",
      "mailjet",
      "resend",
      "postmark",
      "sendgrid",
      "smtp",
      "gmail",
      "google-workspace",
      "postal",
      "listmonk",
      "mautic",
    ];
    for (const k of kinds) {
      const p = getProvider(k);
      expect(p).toBeDefined();
      expect(typeof p.sendEmail).toBe("function");
      expect(typeof p.validateConnection).toBe("function");
      expect(typeof p.getQuota).toBe("function");
    }
  });

  it("Brevo reports the free-tier daily limit", async () => {
    const brevo = getProvider("brevo");
    const q = await brevo.getQuota({ apiKey: "not-a-real-key" });
    expect(q.perDay).toBe(300);
  });

  it("Resend reports 100/day and 3,000/month", async () => {
    const resend = getProvider("resend");
    const q = await resend.getQuota({});
    expect(q.perDay).toBe(100);
    expect(q.perMonth).toBe(3000);
  });

  it("Mailjet reports 200/day and 6,000/month", async () => {
    const mj = getProvider("mailjet");
    const q = await mj.getQuota({});
    expect(q.perDay).toBe(200);
    expect(q.perMonth).toBe(6000);
  });

  it("SendGrid reports the trial 100/day", async () => {
    const sg = getProvider("sendgrid");
    const q = await sg.getQuota({});
    expect(q.perDay).toBe(100);
  });

  it("Postmark reports the developer-plan 100/month", async () => {
    const pm = getProvider("postmark");
    const q = await pm.getQuota({});
    expect(q.perMonth).toBe(100);
  });

  it("sendEmail fails cleanly without an API key instead of throwing", async () => {
    const brevo = getProvider("brevo");
    const res = await brevo.sendEmail({}, {
      to: "someone@example.com",
      from: "me@example.com",
      subject: "hi",
      html: "<p>hi</p>",
      text: "hi",
    });
    expect(res.ok).toBe(false);
    expect(res.status).toBe("FAILED");
  });
});
