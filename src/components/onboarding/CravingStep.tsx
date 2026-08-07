'use client';

import { OnboardingStep } from './OnboardingStep';
import { CravingSlider } from './CravingSlider';
import { PrimaryButton } from './PrimaryButton';

type CravingStepProps = {
  value: number;
  onChange: (value: number) => void;
  onContinue: () => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function CravingStep({ value, onChange, onContinue, onBack, current, total }: CravingStepProps) {
  return (
    <OnboardingStep
      current={current}
      total={total}
      title="Em escala de 0 a 10, quão descontrolada é sua vontade de doce?"
      onBack={onBack}
      footer={<PrimaryButton onClick={onContinue}>CONTINUAR</PrimaryButton>}
    >
      <CravingSlider value={value} onChange={onChange} />
    </OnboardingStep>
  );
}
