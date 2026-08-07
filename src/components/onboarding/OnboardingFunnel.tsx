'use client';

import { useCallback, useState } from 'react';
import { useOnboardingStore } from '@/lib/store';
import { NameStep } from './NameStep';
import { WeightStep } from './WeightStep';
import { HeightStep } from './HeightStep';
import { AgeStep } from './AgeStep';
import { HungerTimeStep } from './HungerTimeStep';
import { CravingStep } from './CravingStep';
import { WeightGoalStep } from './WeightGoalStep';
import { WakeTimeStep } from './WakeTimeStep';
import { ProcessingScreen } from './ProcessingScreen';
import { SuccessPlaceholder } from './SuccessPlaceholder';

const TOTAL_STEPS = 8;

export function OnboardingFunnel() {
  const { currentIndex, answers, setAnswer, goNext, goBack } = useOnboardingStore();
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const showBack = currentIndex > 0 ? goBack : undefined;
  const handleProcessingComplete = useCallback(() => setDone(true), []);

  if (done) {
    return <SuccessPlaceholder nombre={answers.nombre ?? ''} />;
  }

  if (processing) {
    return <ProcessingScreen onComplete={handleProcessingComplete} />;
  }

  const commonProps = { current: currentIndex + 1, total: TOTAL_STEPS, onBack: showBack };

  switch (currentIndex) {
    case 0:
      return (
        <NameStep {...commonProps} value={answers.nombre ?? ''} onChange={(v) => setAnswer('nombre', v)} onContinue={goNext} />
      );
    case 1:
      return <WeightStep {...commonProps} value={answers.peso} onChange={(v) => setAnswer('peso', v)} onContinue={goNext} />;
    case 2:
      return <HeightStep {...commonProps} value={answers.estatura} onChange={(v) => setAnswer('estatura', v)} onContinue={goNext} />;
    case 3:
      return <AgeStep {...commonProps} value={answers.edad} onChange={(v) => setAnswer('edad', v)} onContinue={goNext} />;
    case 4:
      return (
        <HungerTimeStep
          {...commonProps}
          value={answers.horarioHambre}
          onSelect={(v) => {
            setAnswer('horarioHambre', v);
            goNext();
          }}
        />
      );
    case 5:
      return (
        <CravingStep {...commonProps} value={answers.antojoDulce} onChange={(v) => setAnswer('antojoDulce', v)} onContinue={goNext} />
      );
    case 6:
      return (
        <WeightGoalStep
          {...commonProps}
          value={answers.metaPeso}
          onSelect={(v) => {
            setAnswer('metaPeso', v);
            goNext();
          }}
        />
      );
    case 7:
      return (
        <WakeTimeStep
          {...commonProps}
          value={answers.horaDespertar}
          onChange={(v) => setAnswer('horaDespertar', v)}
          onFinish={() => setProcessing(true)}
        />
      );
    default:
      return null;
  }
}
