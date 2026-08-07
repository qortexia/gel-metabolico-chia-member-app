'use client';

import { OnboardingStep } from './OnboardingStep';
import { WakeTimePicker } from './WakeTimePicker';

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
      footer={
        <button
          type="button"
          onClick={onFinish}
          className="min-h-[44px] w-full rounded-full bg-brand px-6 py-3 text-lg font-bold text-white"
        >
          FINALIZAR
        </button>
      }
    >
      <WakeTimePicker value={value} onChange={onChange} />
    </OnboardingStep>
  );
}
