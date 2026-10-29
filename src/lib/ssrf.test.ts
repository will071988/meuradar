import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guarda de regressão SSRF (Seção 9).
 * Nenhuma API route pode fazer fetch de URL vinda do usuário
 * (query string, body ou path). Só é permitido host literal em allowlist.
 */

const API_DIR = path.join(process.cwd(), "src", "app", "api");

const ALLOWED_HOSTS = [
  "geocoding-api.open-meteo.com",
  "api.open-meteo.com",
  "economia.awesomeapi.com.br",
  "api.frankfurter.app",
  "api.coingecko.com",
  "newsapi.org",
  "www.arbeitnow.com",
  "remotive.com",
  "api.adzuna.com",
];

function listRouteFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...listRouteFiles(full));
    else if (/route\.(ts|tsx|js)$/.test(entry)) out.push(full);
  }
  return out;
}

const files = listRouteFiles(API_DIR);

function fetchCalls(source: string): string[] {
  // captura o trecho inicial de cada chamada fetch/fetchWithTimeout
  const re = /(fetchWithTimeout|fetch)\s*\(/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    let depth = 1;
    let i = re.lastIndex;
    while (i < source.length && depth > 0) {
      const c = source[i];
      if (c === "(") depth++;
      else if (c === ")") depth--;
      i++;
    }
    out.push(source.slice(m.index, i));
  }
  return out;
}

describe("SSRF — API routes nunca buscam URL do usuário", () => {
  it("possui rotas de API para inspecionar", () => {
    expect(files.length).toBeGreaterThanOrEqual(4);
  });

  it("nenhuma chamada de fetch usa valor vindo da requisição", () => {
    const offenders: string[] = [];

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const call of fetchCalls(source)) {
        const usesRequestValue =
          /searchParams|params\.get|request\.(url|json|text)|formData|\bquery\b/.test(call);
        if (usesRequestValue) offenders.push(`${path.basename(path.dirname(file))}: ${call.trim()}`);
      }
    }

    expect(offenders).toEqual([]);
  });

  it("todo host chamado está na allowlist e usa https", () => {
    const bad: string[] = [];

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const call of fetchCalls(source)) {
        const urls = call.match(/https?:\/\/[^`"'\s)]+/g) ?? [];
        for (const url of urls) {
          if (!url.startsWith("https://")) {
            bad.push(`http inseguro: ${url}`);
            continue;
          }
          const host = url.replace("https://", "").split("/")[0] ?? "";
          if (!ALLOWED_HOSTS.includes(host)) bad.push(`host fora da allowlist: ${host}`);
        }
      }
    }

    expect(bad).toEqual([]);
  });

  it("nenhuma rota importa ou executa file://, ftp:// ou localhost", () => {
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/file:\/\//);
      expect(source).not.toMatch(/ftp:\/\//);
      expect(source).not.toMatch(/fetch\s*\(\s*["'`]https?:\/\/(localhost|127\.0\.0\.1|169\.254\.169\.254)/);
    }
  });
});
