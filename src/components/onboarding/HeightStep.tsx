'use client';

import { OnboardingStep } from './OnboardingStep';
import { NumberStepper } from './NumberStepper';
import { PrimaryButton } from './PrimaryButton';

type HeightStepProps = {
  value: number;
  onChange: (value: number) => void;
  onContinue: () => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function HeightStep({ value, onChange, onContinue, onBack, current, total }: HeightStepProps) {
  return (
    <OnboardingStep
      current={current}
      total={total}
      title="¿Cuál es tu estatura?"
      subtitle="Va a formar parte de tu IMC y tu meta"
      onBack={onBack}
      footer={<PrimaryButton onClick={onContinue}>CONTINUAR</PrimaryButton>}
    >
      <NumberStepper value={value} onChange={onChange} suffix="cm" min={130} max={220} />
    </OnboardingStep>
  );
}
