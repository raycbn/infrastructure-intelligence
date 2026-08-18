"use client";

import { FormEvent, useState } from "react";

type Mode = "login" | "register";
export default function AuthPanel() {
  const [mode, setMode] = useState<Mode>("register");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) setError(result.error ?? "Something went wrong. Please try again."); else window.location.reload();
    setBusy(false);
  }
  return <div className="auth-shell">
    <div className="auth-copy"><span className="eyebrow">Infrastructure Intelligence</span><h1>See your public infrastructure clearly.</h1><p>Discover domains, DNS, certificates, services and providers from one trusted view.</p><div className="trust-row"><span>✓ Authorized discovery only</span><span>✓ Passive-first approach</span></div></div>
    <div className="auth-card"><div className="tab-row"><button className={mode === "register" ? "tab active" : "tab"} onClick={() => setMode("register")}>Create account</button><button className={mode === "login" ? "tab active" : "tab"} onClick={() => setMode("login")}>Sign in</button></div><h2>{mode === "register" ? "Start mapping your stack" : "Welcome back"}</h2><p className="muted">{mode === "register" ? "Create your workspace to begin." : "Sign in to continue to your workspace."}</p><form onSubmit={submit} className="stack-form">
      {mode === "register" && <><label>Your name<input name="name" required placeholder="Alex Morgan" /></label><label>Organization<input name="organization" required placeholder="Acme Inc." /></label></>}
      <label>Work email<input name="email" type="email" required placeholder="you@company.com" /></label><label>Password<input name="password" type="password" minLength={12} required placeholder="At least 12 characters" /></label>
      {error && <div className="form-error" role="alert">{error}</div>}<button className="primary full" disabled={busy}>{busy ? "Working…" : mode === "register" ? "Create workspace" : "Sign in"}</button>
    </form></div>
  </div>;
}
