'use client';

import { OnboardingStep } from './OnboardingStep';
import { WakeTimePicker } from './WakeTimePicker';
import { PrimaryButton } from './PrimaryButton';

type WakeTimeStepProps = {
  value: string;
  onChange: (value: string) => void;
  onFinish: () => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function WakeTimeStep({ value, onChange, onFinish, onBack, current, total }: WakeTimeStepProps) {
  return (
    <OnboardingStep
      current={current}
      total={total}
      title="Qual horário você normalmente acorda?"
      subtitle="Pra agendar seus lembretes"
      onBack={onBack}
      footer={<PrimaryButton onClick={onFinish}>FINALIZAR</PrimaryButton>}
    >
      <WakeTimePicker value={value} onChange={onChange} />
    </OnboardingStep>
  );
}
