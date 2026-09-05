import { Briefcase } from "lucide-react";
import { ModulePage } from "@/components/layout/ModulePage";

export default function VagasPage() {
  return (
    <ModulePage
      title="Vagas"
      description="Vagas de emprego e concursos públicos para o seu perfil."
      icon={Briefcase}
    />
  );
}
