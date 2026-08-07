'use client';

type IconChoiceCardProps = {
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
};

export function IconChoiceCard({ icon, title, description, selected, onSelect }: IconChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-card border-2 bg-white p-4 text-left transition-transform active:scale-[0.98] ${
        selected ? 'border-brand bg-brand/5' : 'border-neutral-200'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="flex-1">
        <span className="block font-semibold text-foreground">{title}</span>
        <span className="block text-sm text-neutral-500">{description}</span>
      </span>
      {selected ? (
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand text-sm text-white">
          ✓
        </span>
      ) : null}
    </button>
  );
}
