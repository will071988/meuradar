import { Settings } from "lucide-react";
import { ModulePage } from "@/components/layout/ModulePage";

export default function ConfiguracoesPage() {
  return (
    <ModulePage
      title="Configurações"
      description="Conta, preferências, localização e personalização do radar."
      icon={Settings}
    />
  );
}
