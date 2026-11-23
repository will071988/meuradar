// @vitest-environment node
import { describe, expect, it } from "vitest";
import { formationCoordinates, normalizeSummary } from "@/lib/tracker";

const summary = {
  header: {
    competitions: [{
      status: { type: { state: "in", shortDetail: "67'" } },
      competitors: [
        { homeAway: "home", score: "1" },
        { homeAway: "away", score: "2" },
      ],
    }],
  },
  rosters: [
    {
      homeAway: "home",
      team: { id: "10", displayName: "Casa FC", abbreviation: "CAS", color: "0B2D5B" },
      roster: [
        { starter: true, jersey: "1", position: "G", formationPlace: "1", athlete: { id: "a1", shortName: "Goleiro" } },
        { starter: true, jersey: "9", position: "F", formationPlace: "9", athlete: { id: "a2", shortName: "Atacante" } },
        { starter: false, jersey: "20", position: "SUB", formationPlace: "0", athlete: { id: "a3", shortName: "Reserva" } },
      ],
    },
    {
      homeAway: "away",
      team: { id: "20", displayName: "Visitante FC", abbreviation: "VIS", color: "FF8A3D" },
      roster: [
        { starter: true, jersey: "1", position: "G", formationPlace: "1", athlete: { id: "b1", shortName: "Goleiro V" } },
      ],
    },
  ],
  keyEvents: [
    {
      id: "e1", type: { text: "Goal" }, text: "Gol da Casa",
      period: { number: 1 }, clock: { displayValue: "23'" }, team: { id: "10" },
      fieldPositionX: 96.9, fieldPositionY: 50.6, fieldPosition2X: 100, fieldPosition2Y: 54,
    },
    {
      id: "e2", type: { text: "Yellow Card" }, text: "Cartão amarelo",
      period: { number: 2 }, clock: { displayValue: "12'" }, team: { id: "20" },
    },
  ],
};

describe("formationCoordinates", () => {
  it("posiciona o goleiro e espelha o visitante", () => {
    expect(formationCoordinates(1, "home")).toEqual({ x: 7, y: 50 });
    expect(formationCoordinates(1, "away")).toEqual({ x: 93, y: 50 });
    expect(formationCoordinates(99, "home")).toEqual({ x: 50, y: 50 });
  });
});

describe("normalizeSummary", () => {
  it("normaliza escalação, placar, status e eventos coordenados", () => {
    const result = normalizeSummary(summary, "401841321");

    expect(result.eventId).toBe("401841321");
    expect(result.status).toBe("in");
    expect(result.clock).toBe("67'");
    expect(result.home).toMatchObject({ name: "Casa FC", score: 1, color: "#0B2D5B" });
    expect(result.away).toMatchObject({ name: "Visitante FC", score: 2 });
    expect(result.home.players).toHaveLength(2); // reserva (formationPlace 0) filtrado
    expect(result.home.players[0]).toMatchObject({ jersey: "1", name: "Goleiro", formationPlace: 1 });

    expect(result.events).toHaveLength(2);
    expect(result.events[0]).toMatchObject({ minute: 23, x: 96.9, y: 50.6, x2: 100 });
    expect(result.events[1]).toMatchObject({ minute: 12, type: "Yellow Card" });
    expect(result.events[1].x).toBeUndefined();
  });

  it("payload vazio não lança exceção", () => {
    const result = normalizeSummary(null, "1");
    expect(result.home.players).toEqual([]);
    expect(result.events).toEqual([]);
    expect(result.status).toBe("pre");
  });
});
