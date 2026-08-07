'use client';

import { OnboardingStep } from './OnboardingStep';
import { IconChoiceCard } from './IconChoiceCard';

const OPTIONS = [
  { value: 'manana', icon: '🌅', title: 'Por la mañana', description: 'antes del almuerzo' },
  { value: 'tarde', icon: '☁️', title: 'Por la tarde', description: 'entre 14h y 17h' },
  { value: 'noche', icon: '🌙', title: 'Por la noche', description: 'después de la cena' },
  { value: 'dia-entero', icon: '🙁', title: 'Todo el día', description: 'sin parar' },
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
    <OnboardingStep current={current} total={total} title="¿Cuándo te da más el hambre ansiosa?" onBack={onBack}>
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
