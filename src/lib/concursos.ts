import type { ConcursoItem } from "@/types";

/** Classifica uma manchete do RSS de Trabalho do G1 para a lista de concursos. */
export function classifyConcurso(title: string): ConcursoItem["category"] | null {
  if (/resultado|gabarito|classificação|classificacao|divulgad/i.test(title)) return "Resultado";
  if (/processo seletivo|processo de seleção|processo de selecao|seleção aberta|selecao aberta|inscrição aberta|inscricoes abertas|reabre inscri/i.test(title)) return "Processo seletivo";
  if (/concurso|edital|vestibular|nomeação|nomeacao/i.test(title)) return "Concurso";
  if (/\bvagas?\b/i.test(title) && /prefeitura|órgão|orgao|instituto|universidade|ministério|ministerio|concurso|edital/i.test(title)) {
    return "Concurso";
  }
  return null;
}
