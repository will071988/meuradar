import { Tags } from "lucide-react";
import { ModulePage } from "@/components/layout/ModulePage";

export default function PrecosPage() {
  return (
    <ModulePage
      title="Preços"
      description="Monitoramento de preços, ofertas e histórico de produtos."
      icon={Tags}
    />
  );
}
