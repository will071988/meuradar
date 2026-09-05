import { Radar } from "lucide-react";
import { ModulePage } from "@/components/layout/ModulePage";

export default function MeuRadarPage() {
  return (
    <ModulePage
      title="Meu Radar"
      description="Seus monitoramentos personalizados e alertas inteligentes."
      icon={Radar}
    />
  );
}
