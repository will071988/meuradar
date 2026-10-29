import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { setPathname } from "@/test/setup";

const REQUIRED_HREFS = [
  "/",
  "/meu-radar",
  "/clima",
  "/noticias",
  "/mercado",
  "/precos",
  "/vagas",
  "/esportes",
  "/ferramentas",
  "/configuracoes",
];

describe("Sidebar — navegação principal", () => {
  it("possui todos os links obrigatórios", () => {
    render(<Sidebar />);
    const nav = screen.getByRole("navigation", { name: "Navegação principal" });
    const hrefs = Array.from(nav.querySelectorAll("a")).map((a) => a.getAttribute("href"));

    for (const required of REQUIRED_HREFS) {
      expect(hrefs).toContain(required);
    }
  });

  it("marca a rota atual com aria-current", () => {
    setPathname("/clima");
    render(<Sidebar />);
    const active = screen.getByRole("link", { name: "Clima" });
    expect(active).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Mercado" })).not.toHaveAttribute("aria-current");
  });

  it("exibe logo e CTA do plano Pro", () => {
    render(<Sidebar />);
    expect(screen.getByText("MeuRadar")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Conheça agora" })).toHaveAttribute("href", "/pro");
  });
});

describe("MobileNav — menu inferior e drawer", () => {
  it("renderiza a navegação inferior com 5 itens", () => {
    render(<MobileNav open={false} onClose={() => undefined} />);
    const bottom = screen.getByRole("navigation", { name: "Navegação inferior" });
    expect(bottom.querySelectorAll("a")).toHaveLength(5);
  });

  it("drawer fechado não mostra o menu lateral", () => {
    render(<MobileNav open={false} onClose={() => undefined} />);
    expect(screen.queryByRole("navigation", { name: "Menu móvel" })).not.toBeInTheDocument();
  });

  it("drawer aberto mostra o menu e fecha ao clicar em Fechar", async () => {
    const onClose = vi.fn();
    render(<MobileNav open={true} onClose={onClose} />);

    const menu = screen.getByRole("navigation", { name: "Menu móvel" });
    expect(menu.querySelectorAll("a").length).toBeGreaterThanOrEqual(5);

    await userEvent.click(screen.getAllByRole("button", { name: "Fechar menu" })[0] as HTMLElement);
    expect(onClose).toHaveBeenCalled();
  });

  it("clicar em um link do drawer fecha o menu", async () => {
    const onClose = vi.fn();
    render(<MobileNav open={true} onClose={onClose} />);
    await userEvent.click(screen.getByRole("link", { name: "Clima" }));
    expect(onClose).toHaveBeenCalled();
  });
});
