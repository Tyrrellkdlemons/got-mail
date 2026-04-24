import { describe, it, expect } from "vitest";
import { checkCompliance, canSend } from "../src/lib/compliance/check";

describe("Compliance gate", () => {
  const baseCtx = {
    subject: "Our monthly newsletter",
    html: "<p>Hello {{first_name}}</p><p>123 Market St, SF, CA</p><p><a href='https://gotmail.example/unsubscribe/TOKEN'>unsubscribe</a></p>",
    text: "Hello — plain text. Unsubscribe: https://gotmail.example/unsubscribe/TOKEN",
    senderName: "Acme",
    senderEmail: "news@acme.com",
    workspaceLegalName: "Acme Inc.",
    workspacePostalAddress: "123 Market St, SF, CA",
    unsubscribeToken: "TOKEN",
    domainVerified: true,
    spfValid: true,
    dkimValid: true,
    dmarcValid: true,
    providerQuotaAvailable: true,
    recipientCount: 50,
    recipientsAllConsentVerified: true,
    suppressionChecked: true,
    bounceRatePct: 0.3,
    complaintRatePct: 0.02,
  };

  it("passes a fully compliant campaign", () => {
    const results = checkCompliance(baseCtx);
    expect(canSend(results)).toBe(true);
  });

  it("blocks a send with deceptive subject line", () => {
    const results = checkCompliance({ ...baseCtx, subject: "RE: your urgent payment" });
    expect(canSend(results)).toBe(false);
  });

  it("blocks a send missing an unsubscribe link", () => {
    const results = checkCompliance({
      ...baseCtx,
      html: "<p>No way out, sucker.</p>",
    });
    expect(canSend(results)).toBe(false);
  });

  it("blocks a send with no physical address", () => {
    const results = checkCompliance({ ...baseCtx, workspacePostalAddress: "" });
    expect(canSend(results)).toBe(false);
  });

  it("blocks a send with non-consenting recipients", () => {
    const results = checkCompliance({ ...baseCtx, recipientsAllConsentVerified: false });
    expect(canSend(results)).toBe(false);
  });

  it("blocks a send when SPF is failing", () => {
    const results = checkCompliance({ ...baseCtx, spfValid: false });
    expect(canSend(results)).toBe(false);
  });

  it("only warns (not blocks) when bounce rate is elevated", () => {
    const results = checkCompliance({ ...baseCtx, bounceRatePct: 3.0 });
    // bounce is warning-severity, not a blocker — send still allowed
    expect(canSend(results)).toBe(true);
    const bounce = results.find((r) => r.id === "health.bounce");
    expect(bounce?.pass).toBe(false);
  });
});
