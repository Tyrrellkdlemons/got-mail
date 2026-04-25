import { Suspense } from "react";
import LoginForm from "./login-form";

// Wrap in Suspense because LoginForm uses useSearchParams() which triggers a
// client-side render bailout in Next 14. Without this, prerender fails at build time.
export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
