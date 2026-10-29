#!/usr/bin/env node
/**
 * Smoke de produção — somente GET, sem mutações.
 * Uso: node scripts/smoke-production.mjs
 * Base: https://meuradar.vercel.app (sobrescreva com BASE_URL)
 */

const BASE_URL = (process.env.BASE_URL || "https://meuradar.vercel.app").replace(/\/$/, "");

const ROUTES = ["/", "/esportes", "/ferramentas", "/precos", "/vagas", "/api/vagas"];

const TIMEOUT_MS = 15_000;

async function check(path) {
  const url = `${BASE_URL}${path}`;
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "meuradar-smoke/1.0" },
    });
    const ms = Date.now() - started;
    const ok = res.status >= 200 && res.status < 400;
    return { path, status: res.status, ok, ms };
  } catch (err) {
    return { path, status: 0, ok: false, ms: Date.now() - started, error: String(err?.message ?? err) };
  }
}

const results = await Promise.all(ROUTES.map(check));

console.log(`Smoke de produção — ${BASE_URL}`);
for (const r of results) {
  const mark = r.ok ? "OK  " : "FAIL";
  const extra = r.error ? ` (${r.error})` : "";
  console.log(`${mark} ${String(r.status).padEnd(3)} ${r.path} — ${r.ms}ms${extra}`);
}

const failed = results.filter((r) => !r.ok);
if (failed.length > 0) {
  console.error(`\n${failed.length} rota(s) falharam.`);
  process.exit(1);
}
console.log(`\nTodas as ${results.length} rotas responderam.`);
