import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default function FreeDomainIdentityPage() {
  return (
    <PlaceholderPage
      eyebrow="★ sending mode · free subdomain · experimental"
      title="Send from a free domain or subdomain"
      subtitle="For testing only. Free subdomains share a low-reputation parent; mass email usually ends up in spam."
      warn="Got Mail labels this mode LOW-TRUST everywhere. For serious 1,000+ campaigns, buy a real domain for a few dollars/year."
      bullets={[
        "Research EU.org, FreeDNS / afraid.org, DuckDNS, No-IP, Dynu",
        "Never rotate free domains to evade reputation",
        "Never use disposable / blocked TLDs (.tk, .ml, .ga, .cf, .gq)",
        "SPF/DKIM still required even on a free subdomain",
      ]}
      ctaHref="/free-domains"
      ctaLabel="Browse free domain sources"
    />
  );
}
