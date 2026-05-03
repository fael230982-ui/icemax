"use client";

import { useState } from "react";
import { icemaxApi, type LoginResponse } from "../lib/api";

export function AuthPanel() {
  const [email, setEmail] = useState("adm.rcsolutions@gmail.com");
  const [password, setPassword] = useState("icemax-dev-123");
  const [session, setSession] = useState<LoginResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setError(null);

    try {
      const response = await icemaxApi.login({ email, password, tenantId: "tenant-icemax" });
      setSession(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao autenticar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="authPanel">
      <div>
        <p className="eyebrow">Sessao</p>
        <h2>{session ? session.user.name : "Login do painel"}</h2>
        <span>{session ? `${session.tenant.name} - ${session.user.role}` : "Use banco Prisma para login real."}</span>
      </div>
      <div className="authFields">
        <input value={email} onChange={(event) => setEmail(event.target.value)} aria-label="E-mail" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} aria-label="Senha" type="password" />
        <button type="button" onClick={login} disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
      </div>
      {error ? <p className="formError">{error}</p> : null}
    </section>
  );
}
