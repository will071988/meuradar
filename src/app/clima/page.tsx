import { CloudSun } from "lucide-react";
import { ModulePage } from "@/components/layout/ModulePage";

export default function ClimaPage() {
  return (
    <ModulePage
      title="Clima"
      description="Previsão, alertas meteorológicos e condições da sua região."
      icon={CloudSun}
    />
  );
}
