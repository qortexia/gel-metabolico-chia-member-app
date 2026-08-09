'use client';

import { useState } from 'react';

export function RecalculateButton() {
  const [pulsing, setPulsing] = useState(false);

  function handleClick() {
    setPulsing(true);
    setTimeout(() => setPulsing(false), 400);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`mt-3 text-sm font-bold text-brand ${pulsing ? 'animate-pulse' : ''}`}
    >
      ↺ Recalcular
    </button>
  );
}
