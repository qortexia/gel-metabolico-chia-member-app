'use client';

function emojiForValue(value: number): string {
  if (value <= 2) return '😌';
  if (value <= 4) return '🙂';
  if (value <= 6) return '😅';
  if (value <= 8) return '😩';
  return '🤯';
}

type CravingSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

export function CravingSlider({ value, onChange }: CravingSliderProps) {
  return (
    <div>
      <div className="text-center">
        <span className="text-5xl">{emojiForValue(value)}</span>
        <p className="mt-2 text-4xl font-bold text-foreground">{value}</p>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-6 w-full accent-brand"
        aria-label="Nivel de antojo de dulce, de 0 a 10"
      />
      <div className="mt-2 flex justify-between text-sm text-neutral-500">
        <span>controlado</span>
        <span>descontrolado</span>
      </div>
    </div>
  );
}
