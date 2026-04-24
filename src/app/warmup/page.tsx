import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export default function WarmupPage() {
  return (
    <PlaceholderPage
      eyebrow="★ warmup autopilot · pro"
      title="Build sender reputation from zero."
      subtitle="New domain or IP? Got Mail ramps volume from 50/day to 15,000/day over 10 days — engaged-first, business-hours-only."
      bullets={[
        "10-day ramp schedule: 50 → 100 → 200 → 400 → 800 → 1.5k → 3k → 5k → 8k → 15k",
        "Engaged-recipient-first priority",
        "Business-hours spread in recipient's timezone",
        "Auto-skip weekends during warmup",
        "Progress dashboard per sending identity",
      ]}
      warn="Premium feature — flagged via FEATURE_WARMUP_AUTOPILOT in .env."
    />
  );
}
