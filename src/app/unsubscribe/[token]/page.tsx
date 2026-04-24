import { Envelope } from "@/components/brand/Envelope";

export default function UnsubscribePage({ params }: { params: { token: string } }) {
  // TODO: validate the token server-side, mark contact UNSUBSCRIBED, write ConsentRecord.
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <Envelope className="mx-auto h-20 w-20" />
      <h1 className="mt-6 font-display text-4xl text-white">
        You're unsubscribed.
      </h1>
      <p className="mt-3 text-white/70">
        We've removed you from this mailing list. You won't receive further
        marketing email from this sender.
      </p>
      <p className="mt-6 font-mono text-xs text-white/40">
        token: {params.token}
      </p>
    </div>
  );
}
