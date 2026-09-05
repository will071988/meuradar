import { LineChart } from "lucide-react";
import { ModulePage } from "@/components/layout/ModulePage";

export default function MercadoPage() {
  return (
    <ModulePage
      title="Mercado"
      description="Dólar, euro, Bitcoin, bolsa e indicadores financeiros."
      icon={LineChart}
    />
  );
}
