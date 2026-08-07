'use client';

import { OnboardingStep } from './OnboardingStep';

type NameStepProps = {
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function NameStep({ value, onChange, onContinue, onBack, current, total }: NameStepProps) {
  const isValid = value.trim().length > 0;
  return (
    <OnboardingStep
      current={current}
      total={total}
      title="Qual seu nome?"
      subtitle="Vamos personalizar tudo pra você ✨"
      onBack={onBack}
      footer={
        <button
          type="button"
          disabled={!isValid}
          onClick={onContinue}
          className="min-h-[44px] w-full rounded-full bg-brand px-6 py-3 text-lg font-bold text-white disabled:opacity-40"
        >
          CONTINUAR
        </button>
      }
    >
      <input
        type="text"
        value={value}
        placeholder="Seu primeiro nome"
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-card border border-neutral-300 px-4 py-3 text-lg"
      />
    </OnboardingStep>
  );
}
