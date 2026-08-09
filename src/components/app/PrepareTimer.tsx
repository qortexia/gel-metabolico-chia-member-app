'use client';

import { useEffect, useRef, useState } from 'react';

type PrepareTimerProps = {
  durationSeconds?: number;
};

export function PrepareTimer({ durationSeconds = 300 }: PrepareTimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return (
    <div className="mt-2 text-center">
      <p className="text-2xl font-bold text-foreground">
        {minutes}:{seconds}
      </p>
      {!running && remaining > 0 ? (
        <button type="button" onClick={() => setRunning(true)} className="mt-1 text-sm font-bold text-brand">
          Iniciar timer de 5 min
        </button>
      ) : null}
      {remaining === 0 ? <p className="mt-1 text-sm text-success">¡Listo! ✓</p> : null}
    </div>
  );
}
