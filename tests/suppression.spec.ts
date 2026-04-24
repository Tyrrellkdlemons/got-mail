import { describe, it, expect } from "vitest";
import { checkCompliance, canSend } from "../src/lib/compliance/check";

/**
 * Semantic suppression test — the compliance gate must refuse to send
 * if the suppression list was not checked.
 */
describe("Suppression gate", () => {
  const ctx = (overrides: any = {}) => ({
    subject: "ok subject",
    html: "hi 123 Market St, SF CA <a href='/unsubscribe'>unsubscribe</a>",
    text: "hi",
    senderName: "Acme",
    senderEmail: "news@acme.com",
    workspaceLegalName: "Acme Inc.",
    workspacePostalAddress: "123 Market St, SF CA",
    unsubscribeToken: "TOK",
    domainVerified: true,
    spfValid: true,
    dkimValid: true,
    dmarcValid: true,
    providerQuotaAvailable: true,
    recipientCount: 10,
    recipientsAllConsentVerified: true,
    suppressionChecked: true,
    bounceRatePct: 0,
    complaintRatePct: 0,
    ...overrides,
  });

  it("refuses to send if suppression was not checked", () => {
    const results = checkCompliance(ctx({ suppressionChecked: false }));
    expect(canSend(results)).toBe(false);
  });

  it("refuses to send if the unsubscribe token isn't embedded in the HTML", () => {
    const results = checkCompliance(
      ctx({
        html: "<p>no link at all</p>",
      })
    );
    expect(canSend(results)).toBe(false);
  });
});
