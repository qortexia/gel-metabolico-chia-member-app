'use client';

import { useState } from 'react';
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

  if (done) {
    return <SuccessPlaceholder nome={answers.nome ?? ''} />;
  }

  if (processing) {
    return <ProcessingScreen onComplete={() => setDone(true)} />;
  }

  const commonProps = { current: currentIndex + 1, total: TOTAL_STEPS, onBack: showBack };

  switch (currentIndex) {
    case 0:
      return (
        <NameStep {...commonProps} value={answers.nome ?? ''} onChange={(v) => setAnswer('nome', v)} onContinue={goNext} />
      );
    case 1:
      return <WeightStep {...commonProps} value={answers.peso} onChange={(v) => setAnswer('peso', v)} onContinue={goNext} />;
    case 2:
      return <HeightStep {...commonProps} value={answers.altura} onChange={(v) => setAnswer('altura', v)} onContinue={goNext} />;
    case 3:
      return <AgeStep {...commonProps} value={answers.idade} onChange={(v) => setAnswer('idade', v)} onContinue={goNext} />;
    case 4:
      return (
        <HungerTimeStep
          {...commonProps}
          value={answers.horarioFome}
          onSelect={(v) => {
            setAnswer('horarioFome', v);
            goNext();
          }}
        />
      );
    case 5:
      return (
        <CravingStep {...commonProps} value={answers.vontadeDoce} onChange={(v) => setAnswer('vontadeDoce', v)} onContinue={goNext} />
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
          value={answers.horarioAcorda}
          onChange={(v) => setAnswer('horarioAcorda', v)}
          onFinish={() => setProcessing(true)}
        />
      );
    default:
      return null;
  }
}
