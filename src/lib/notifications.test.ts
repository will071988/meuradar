// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  notificationsSupported,
  notifyNewAlerts,
  permission,
  requestPermission,
} from "@/lib/notifications";
import type { RadarAlert } from "@/types";

const alerts: RadarAlert[] = [
  { radarId: "r1", title: "Alerta 1", message: "Mensagem 1" },
  { radarId: "r2", title: "Alerta 2", message: "Mensagem 2" },
];

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal("Notification", vi.fn().mockImplementation(function (this: unknown) {}));
  Object.defineProperty(globalThis.Notification, "permission", { value: "granted", configurable: true });
  Object.defineProperty(globalThis.Notification, "requestPermission", {
    value: vi.fn(async () => "granted"),
    configurable: true,
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("notificações do navegador", () => {
  it("informa suporte e permissão", () => {
    expect(notificationsSupported()).toBe(true);
    expect(permission()).toBe("granted");
  });

  it("solicita permissão quando ainda não foi concedida", async () => {
    Object.defineProperty(globalThis.Notification, "permission", { value: "default", configurable: true });
    expect(await requestPermission()).toBe("granted");
  });

  it("notifica alertas novos uma única vez", () => {
    expect(notifyNewAlerts(alerts)).toBe(2);
    expect(notifyNewAlerts(alerts)).toBe(0);
    expect(Notification).toHaveBeenCalledTimes(2);
  });

  it("não notifica sem permissão", () => {
    Object.defineProperty(globalThis.Notification, "permission", { value: "denied", configurable: true });
    expect(notifyNewAlerts(alerts)).toBe(0);
    expect(Notification).not.toHaveBeenCalled();
  });
});
