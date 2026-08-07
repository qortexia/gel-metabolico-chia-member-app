'use client';

import { useEffect } from 'react';

type ProcessingScreenProps = {
  onComplete: () => void;
  durationMs?: number;
};

export function ProcessingScreen({ onComplete, durationMs = 3000 }: ProcessingScreenProps) {
  useEffect(() => {
    const timeout = setTimeout(onComplete, durationMs);
    return () => clearTimeout(timeout);
  }, [onComplete, durationMs]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center"
      aria-live="polite"
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute h-20 w-20 animate-spin rounded-full border-4 border-neutral-200 border-t-brand" />
        <span className="text-3xl">✨</span>
      </div>
      <h1 className="mt-6 font-serif text-2xl font-bold text-foreground">Armando tu protocolo personalizado…</h1>
      <p className="mt-2 text-neutral-600">Calculando tu dosis ideal, horarios y ritual ✨</p>
    </div>
  );
}
