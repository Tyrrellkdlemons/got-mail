"use client";

export function SignOutButton() {
  async function signOut() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = "/";
  }
  return (
    <button type="button" className="btn-secondary" onClick={signOut}>
      Sign out
    </button>
  );
}
