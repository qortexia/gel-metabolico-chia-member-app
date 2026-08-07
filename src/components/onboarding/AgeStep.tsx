'use client';

import { OnboardingStep } from './OnboardingStep';
import { NumberStepper } from './NumberStepper';
import { PrimaryButton } from './PrimaryButton';

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
      title="¿Cuál es tu edad?"
      onBack={onBack}
      footer={<PrimaryButton onClick={onContinue}>CONTINUAR</PrimaryButton>}
    >
      <NumberStepper value={value} onChange={onChange} suffix="años" min={16} max={100} />
    </OnboardingStep>
  );
}
