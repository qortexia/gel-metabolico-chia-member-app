'use client';

import { OnboardingStep } from './OnboardingStep';
import { WeightGoalGrid } from './WeightGoalGrid';

const OPTIONS = [
  { value: 'hasta-5', label: 'Hasta 5 kg' },
  { value: '5-10', label: '5 a 10 kg' },
  { value: '10-20', label: '10 a 20 kg' },
  { value: 'mas-20', label: 'Más de 20 kg' },
];

type WeightGoalStepProps = {
  value: string | null;
  onSelect: (value: string) => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function WeightGoalStep({ value, onSelect, onBack, current, total }: WeightGoalStepProps) {
  return (
    <OnboardingStep current={current} total={total} title="¿Cuántos kilos quieres eliminar?" onBack={onBack}>
      <WeightGoalGrid options={OPTIONS} selected={value} onSelect={onSelect} />
    </OnboardingStep>
  );
}
