'use client';

type WeightGoalOption = { value: string; label: string };

type WeightGoalGridProps = {
  options: WeightGoalOption[];
  selected: string | null;
  onSelect: (value: string) => void;
};

export function WeightGoalGrid({ options, selected, onSelect }: WeightGoalGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          aria-pressed={selected === opt.value}
          className={`rounded-card border-2 bg-white px-4 py-6 text-center font-semibold transition-transform active:scale-[0.98] ${
            selected === opt.value ? 'border-brand bg-brand/5 text-foreground' : 'border-neutral-200 text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
