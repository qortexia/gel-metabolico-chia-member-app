'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function ResetProtocolButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState(false);

  async function handleConfirm() {
    setResetting(true);
    setError(false);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc('reset_protocol');
    if (rpcError) {
      setResetting(false);
      setError(true);
      return;
    }
    setResetting(false);
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="rounded-card bg-white p-4 text-center shadow-sm">
        <p className="text-sm text-foreground">
          Esto borrará tus check-ins y reiniciará tu protocolo desde el día 1. ¿Confirmas?
        </p>
        <div className="mt-3 flex justify-center gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={resetting}
            className="rounded-full bg-danger px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            {resetting ? 'Reiniciando…' : 'Sí, recomenzar'}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm text-foreground"
          >
            Cancelar
          </button>
        </div>
        {error ? (
          <p className="mt-2 text-sm text-danger">No pudimos reiniciar tu protocolo. Intenta de nuevo.</p>
        ) : null}
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setConfirming(true)} className="text-sm text-neutral-500">
      ↺ Recomenzar protocolo
    </button>
  );
}
