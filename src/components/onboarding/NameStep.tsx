'use client';

import { OnboardingStep } from './OnboardingStep';
import { PrimaryButton } from './PrimaryButton';

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
        <PrimaryButton
          onClick={() => {
            onChange(value.trim());
            onContinue();
          }}
          disabled={!isValid}
        >
          CONTINUAR
        </PrimaryButton>
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
