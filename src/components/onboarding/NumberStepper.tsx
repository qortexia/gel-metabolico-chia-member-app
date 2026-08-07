'use client';

type NumberStepperProps = {
  value: number;
  onChange: (value: number) => void;
  suffix: string;
  min: number;
  max: number;
  step?: number;
};

export function NumberStepper({ value, onChange, suffix, min, max, step = 1 }: NumberStepperProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        aria-label="Diminuir"
        onClick={() => onChange(clamp(value - step))}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 text-xl text-foreground"
      >
        −
      </button>
      <div className="flex min-w-[120px] items-baseline justify-center gap-1">
        <span className="text-4xl font-bold text-foreground">{value}</span>
        <span className="text-lg text-neutral-500">{suffix}</span>
      </div>
      <button
        type="button"
        aria-label="Aumentar"
        onClick={() => onChange(clamp(value + step))}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 text-xl text-foreground"
      >
        +
      </button>
    </div>
  );
}
