import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";

describe("Button", () => {
  it("dispara click", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Salvar</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("não dispara quando desabilitado", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Enviar
      </Button>
    );
    const btn = screen.getByRole("button", { name: "Enviar" });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("mantém tipo button por padrão (não submete formulários por engano)", () => {
    render(<Button>OK</Button>);
    expect(screen.getByRole("button", { name: "OK" })).toHaveAttribute("type", "button");
  });

  it("propaga type=submit quando informado", () => {
    render(<Button type="submit">Enviar</Button>);
    expect(screen.getByRole("button", { name: "Enviar" })).toHaveAttribute("type", "submit");
  });
});

describe("Card", () => {
  it("renderiza conteúdo e aceita className extra", () => {
    render(
      <Card className="minha-classe">
        <p>Conteúdo do cartão</p>
      </Card>
    );
    expect(screen.getByText("Conteúdo do cartão")).toBeInTheDocument();
  });
});

describe("Badge", () => {
  it("renderiza o rótulo", () => {
    render(<Badge tone="hot">-15%</Badge>);
    expect(screen.getByText("-15%")).toBeInTheDocument();
  });

  it("aceita tom padrão sem quebrar", () => {
    render(<Badge>Neutro</Badge>);
    expect(screen.getByText("Neutro")).toBeInTheDocument();
  });

  it("é um span com role implícito de texto (a11y)", () => {
    const { container } = render(<Badge>Novo</Badge>);
    expect(container.querySelector("span")).toBeInTheDocument();
  });
});

describe("SectionHeader", () => {
  it("exibe o título como heading", () => {
    render(<SectionHeader title="Mercado" />);
    expect(screen.getByRole("heading", { name: "Mercado" })).toBeInTheDocument();
  });
});
