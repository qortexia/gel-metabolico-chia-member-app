'use client';

import { OnboardingStep } from './OnboardingStep';
import { IconChoiceCard } from './IconChoiceCard';

const OPTIONS = [
  { value: 'manha', icon: '🌅', title: 'De manhã', description: 'antes do almoço' },
  { value: 'tarde', icon: '☁️', title: 'À tarde', description: 'entre 14h e 17h' },
  { value: 'noite', icon: '🌙', title: 'À noite', description: 'depois do jantar' },
  { value: 'dia-inteiro', icon: '🙁', title: 'O dia inteiro', description: 'sem parar' },
];

type HungerTimeStepProps = {
  value: string | null;
  onSelect: (value: string) => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function HungerTimeStep({ value, onSelect, onBack, current, total }: HungerTimeStepProps) {
  return (
    <OnboardingStep current={current} total={total} title="Quando a fome ansiosa mais bate em você?" onBack={onBack}>
      <div className="space-y-3">
        {OPTIONS.map((opt) => (
          <IconChoiceCard
            key={opt.value}
            icon={opt.icon}
            title={opt.title}
            description={opt.description}
            selected={value === opt.value}
            onSelect={() => onSelect(opt.value)}
          />
        ))}
      </div>
    </OnboardingStep>
  );
}
