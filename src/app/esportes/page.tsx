import { Trophy } from "lucide-react";
import { ModulePage } from "@/components/layout/ModulePage";

export default function EsportesPage() {
  return (
    <ModulePage
      title="Esportes"
      description="Jogos, resultados e agenda do seu time."
      icon={Trophy}
    />
  );
}
