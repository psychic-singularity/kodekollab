"use client";

import { useState } from "react";
import { authClient } from "../lib/auth-client";

export default function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const result = mode === "sign-up"
      ? await authClient.signUp.email({ name: name.trim(), email, password })
      : await authClient.signIn.email({ email, password });
    setSubmitting(false);
    if (result.error) {
      setError(result.error.message || "Authentication failed.");
      return;
    }
    onAuthenticated(result.data?.user);
  }

  return <main className="min-h-screen bg-[#0d1117] text-white grid place-items-center p-6">
    <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-2xl">
      <h1 className="text-xl font-semibold">{mode === "sign-up" ? "Create your account" : "Sign in to CodeTogether"}</h1>
      <p className="mt-2 text-sm text-gray-400">Your account name is shown to other people in the room.</p>
      {mode === "sign-up" && <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" maxLength={40} className="mt-5 w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm" />}
      <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="mt-3 w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm" />
      <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="mt-3 w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm" />
      {error && <p className="mt-3 text-sm text-red-400" role="alert">{error}</p>}
      <button disabled={submitting} className="mt-4 w-full rounded-md bg-blue-600 py-2.5 text-sm font-medium disabled:opacity-60">{submitting ? "Please wait..." : mode === "sign-up" ? "Create account" : "Sign in"}</button>
      <button type="button" onClick={() => { setMode(mode === "sign-up" ? "sign-in" : "sign-up"); setError(""); }} className="mt-4 w-full text-sm text-blue-400">{mode === "sign-up" ? "Already have an account? Sign in" : "Need an account? Sign up"}</button>
    </form>
  </main>;
}
