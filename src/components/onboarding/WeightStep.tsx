'use client';

import { OnboardingStep } from './OnboardingStep';
import { NumberStepper } from './NumberStepper';
import { PrimaryButton } from './PrimaryButton';

type WeightStepProps = {
  value: number;
  onChange: (value: number) => void;
  onContinue: () => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function WeightStep({ value, onChange, onContinue, onBack, current, total }: WeightStepProps) {
  return (
    <OnboardingStep
      current={current}
      total={total}
      title="¿Cuál es tu peso actual hoy?"
      subtitle="Lo usamos para calcular tu dosis ideal"
      onBack={onBack}
      footer={<PrimaryButton onClick={onContinue}>CONTINUAR</PrimaryButton>}
    >
      <NumberStepper value={value} onChange={onChange} suffix="kg" min={30} max={250} />
    </OnboardingStep>
  );
}
