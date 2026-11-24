import type { RadarAlert } from "@/types";

const KEY = "meuradar-notified-v1";

/** Verifica se a API de notificações está disponível neste navegador. */
export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function permission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

function readNotified(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Exibe notificações apenas para alertas ainda não anunciados e grava os IDs
 * para não repetir a cada ciclo de avaliação dos radares.
 */
export function notifyNewAlerts(alerts: RadarAlert[]): number {
  if (!notificationsSupported() || Notification.permission !== "granted" || alerts.length === 0) {
    return 0;
  }

  const already = new Set(readNotified());
  const fresh = alerts.filter((alert) => !already.has(alert.radarId));
  if (fresh.length === 0) return 0;

  for (const alert of fresh) {
    try {
      new Notification(alert.title, {
        body: alert.message,
        icon: "/icons/icon-192.png",
        tag: alert.radarId,
      });
    } catch {
      // Alguns navegadores bloqueiam Notification fora de Service Worker; ignora.
    }
  }

  const combined = Array.from(already).concat(fresh.map((alert) => alert.radarId));
  const ids = combined.filter((id, index) => combined.indexOf(id) === index);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids.slice(-100)));
  } catch {
    // localStorage indisponível — segue sem persistência.
  }
  return fresh.length;
}
