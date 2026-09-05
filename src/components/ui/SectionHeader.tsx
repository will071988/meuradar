interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
}

export function SectionHeader({ title, actionLabel = "Ver tudo" }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-bold text-[#0B2D5B] sm:text-lg">{title}</h2>
      <span className="cursor-pointer text-sm font-semibold text-[#00C2D7] hover:underline">
        {actionLabel}
      </span>
    </div>
  );
}
