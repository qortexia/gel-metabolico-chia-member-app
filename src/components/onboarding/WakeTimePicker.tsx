'use client';

type WakeTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function WakeTimePicker({ value, onChange }: WakeTimePickerProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-4xl">⏰</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Horário que você acorda"
        className="rounded-card border border-neutral-300 px-4 py-3 text-2xl font-bold text-foreground"
      />
      <p className="text-sm text-neutral-500">toque pra ajustar</p>
    </div>
  );
}
