import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import VagasPage from "@/app/vagas/page";
import { apiResponse, stubFetch } from "@/test/setup";
import type { ConcursoItem, RemoteJob } from "@/types";

const jobs: RemoteJob[] = [{
  id: "j1", title: "Desenvolvedor(a) Front-end", company: "Empresa", location: "Remoto",
  remote: true, url: "https://exemplo.com/vaga", postedAt: "hoje",
}];

const concursos: ConcursoItem[] = [
  { id: "c1", title: "Prefeitura abre concurso com 93 vagas", description: "Salário de até R$ 15 mil.", time: "Há 2 horas", category: "Concurso" },
  { id: "c2", title: "Resultado final do concurso divulgado", description: "Confira a lista.", time: "Há 5 horas", category: "Resultado" },
];

beforeEach(() => {
  stubFetch((url) => {
    if (url.includes("/api/concursos")) return apiResponse(concursos);
    if (url.includes("/api/vagas")) return apiResponse(jobs);
    return apiResponse([]);
  });
});

describe("Página /vagas", () => {
  it("exibe vagas ao vivo", async () => {
    render(<VagasPage />);
    expect(await screen.findByText("Desenvolvedor(a) Front-end")).toBeInTheDocument();
  });

  it("exibe concursos reais com categoria e descrição", async () => {
    render(<VagasPage />);
    expect(await screen.findByText("Concursos em destaque")).toBeInTheDocument();
    expect(screen.getByText("Prefeitura abre concurso com 93 vagas")).toBeInTheDocument();
    expect(screen.getByText("Resultado final do concurso divulgado")).toBeInTheDocument();
    expect(screen.getByText("Salário de até R$ 15 mil.")).toBeInTheDocument();
  });

  it("não exibe mais a curadoria demo de concursos", async () => {
    render(<VagasPage />);
    await screen.findByText("Concursos em destaque");
    expect(screen.queryByText(/Curadoria demo/)).not.toBeInTheDocument();
  });
});
