// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  LEAGUES,
  brasiliaTime,
  kickoffLabel,
  normalizeScoreboard,
  normalizeStandings,
} from "@/lib/esports";

const league = LEAGUES[0]!;

const scoreboard = {
  events: [
    {
      id: "401",
      date: "2026-11-29T19:00:00Z",
      shortName: "FLA @ CFC",
      competitions: [{
        status: { type: { state: "pre", shortDetail: "Scheduled" } },
        competitors: [
          { homeAway: "home", team: { displayName: "Cruzeiro" } },
          { homeAway: "away", team: { displayName: "Flamengo" } },
        ],
      }],
    },
    {
      id: "402",
      date: "2026-11-22T19:00:00Z",
      competitions: [{
        status: { type: { state: "post", shortDetail: "FT" } },
        competitors: [
          { homeAway: "home", team: { displayName: "Casa" }, score: "2" },
          { homeAway: "away", team: { displayName: "Visitante" }, score: "1" },
        ],
      }],
    },
  ],
};

describe("catálogo", () => {
  it("inclui 15 competições dos três grupos", () => {
    expect(LEAGUES).toHaveLength(15);
    expect(new Set(LEAGUES.map((l) => l.group))).toEqual(
      new Set(["Brasil", "Estaduais", "Internacionais"])
    );
  });
});

describe("conversão de horário", () => {
  it("converte UTC para Brasília", () => {
    expect(brasiliaTime("2026-11-29T19:00:00Z")).toBe("16:00");
    expect(kickoffLabel("2026-11-29T19:00:00Z")).toContain("29/11, 16:00");
    expect(brasiliaTime("invalida")).toBeUndefined();
  });
});

describe("normalizeScoreboard", () => {
  const matches = normalizeScoreboard(scoreboard, league);

  it("marca jogo a iniciar com horário, sem placar", () => {
    expect(matches[0]).toMatchObject({
      id: "401",
      status: "pre",
      home: "Cruzeiro",
      away: "Flamengo",
      startTime: "16:00",
      homeScore: undefined,
    });
    expect(matches[0]?.startsAt).toBe("2026-11-29T19:00:00Z");
  });

  it("marca jogo encerrado com placar final", () => {
    expect(matches[1]).toMatchObject({
      id: "402",
      status: "post",
      homeScore: 2,
      awayScore: 1,
      time: "Encerrado",
    });
  });
});

describe("normalizeStandings", () => {
  it("percorre todos os grupos e ordena por posição", () => {
    const table = normalizeStandings({
      children: [
        { name: "Group A", standings: { entries: [
          { team: { displayName: "B" }, stats: [{ name: "rank", value: 2 }, { name: "points", value: 3 }] },
          { team: { displayName: "A" }, stats: [{ name: "rank", value: 1 }, { name: "points", value: 6 }] },
        ] } },
        { name: "Group B", standings: { entries: [
          { team: { displayName: "C" }, stats: [{ name: "rank", value: 1 }, { name: "points", value: 6 }] },
        ] } },
      ],
    }, league);

    expect(table.groups).toHaveLength(2);
    expect(table.groups[0]?.entries.map((e) => e.team)).toEqual(["A", "B"]);
    expect(table.groups[1]?.entries[0]).toMatchObject({ team: "C", pts: 6 });
  });

  it("payload vazio não lança exceção", () => {
    expect(normalizeStandings(null, league).groups).toEqual([]);
  });
});
