import { Wrench } from "lucide-react";
import { ModulePage } from "@/components/layout/ModulePage";

export default function FerramentasPage() {
  return (
    <ModulePage
      title="Ferramentas"
      description="Utilidades do dia a dia: conversores, cálculos e atalhos."
      icon={Wrench}
    />
  );
}
