'use client';

import { OnboardingStep } from './OnboardingStep';
import { NumberStepper } from './NumberStepper';

type AgeStepProps = {
  value: number;
  onChange: (value: number) => void;
  onContinue: () => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function AgeStep({ value, onChange, onContinue, onBack, current, total }: AgeStepProps) {
  return (
    <OnboardingStep
      current={current}
      total={total}
      title="Qual sua idade?"
      onBack={onBack}
      footer={
        <button
          type="button"
          onClick={onContinue}
          className="min-h-[44px] w-full rounded-full bg-brand px-6 py-3 text-lg font-bold text-white"
        >
          CONTINUAR
        </button>
      }
    >
      <NumberStepper value={value} onChange={onChange} suffix="anos" min={16} max={100} />
    </OnboardingStep>
  );
}
