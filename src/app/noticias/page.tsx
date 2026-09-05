import { Newspaper } from "lucide-react";
import { ModulePage } from "@/components/layout/ModulePage";

export default function NoticiasPage() {
  return (
    <ModulePage
      title="Notícias"
      description="As principais notícias personalizadas para o seu perfil."
      icon={Newspaper}
    />
  );
}
