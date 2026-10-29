import { describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  INTERESTS,
  loadPreferences,
  savePreferences,
} from "@/lib/preferences";

describe("preferências", () => {
  it("retorna defaults quando não há nada salvo", () => {
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it("persiste e recupera preferências", () => {
    savePreferences({
      ...DEFAULT_PREFERENCES,
      city: "Niterói, RJ",
      team: "Botafogo",
      interests: ["clima", "precos"],
      notifyPush: false,
    });

    const loaded = loadPreferences();
    expect(loaded.city).toBe("Niterói, RJ");
    expect(loaded.team).toBe("Botafogo");
    expect(loaded.interests).toEqual(["clima", "precos"]);
    expect(loaded.notifyPush).toBe(false);
  });

  it("fallback seguro com JSON corrompido", () => {
    window.localStorage.setItem("meuradar-preferences-v1", "{{{");
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it("fallback seguro com campos de tipo errado", () => {
    window.localStorage.setItem(
      "meuradar-preferences-v1",
      JSON.stringify({ city: 123, interests: "não é lista", notifyEmail: "sim" })
    );
    const loaded = loadPreferences();
    expect(loaded.city).toBe(DEFAULT_PREFERENCES.city);
    expect(loaded.interests).toEqual(DEFAULT_PREFERENCES.interests);
    expect(loaded.notifyEmail).toBe(true);
  });

  it("expõe 8 interesses com rótulos", () => {
    expect(INTERESTS).toHaveLength(8);
    for (const i of INTERESTS) expect(i.label.length).toBeGreaterThan(0);
  });
});
