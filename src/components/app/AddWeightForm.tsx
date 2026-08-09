'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AddWeightForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [peso, setPeso] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(peso);
    if (!value || value <= 0) return;
    setSaving(true);
    setError(false);
    const supabase = createClient();
    const { error: insertError } = await supabase
      .from('weight_logs')
      .insert({ user_id: userId, peso: value, date: new Date().toISOString().slice(0, 10) });
    setSaving(false);
    if (insertError) {
      setError(true);
      return;
    }
    setPeso('');
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Agregar registro de peso"
        className="mt-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-xl font-bold text-foreground"
      >
        +
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
      <input
        type="number"
        inputMode="decimal"
        value={peso}
        onChange={(e) => setPeso(e.target.value)}
        placeholder="Peso en kg"
        aria-label="Peso en kg"
        className="flex-1 rounded-card border border-neutral-300 px-3 py-2"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-brand px-4 py-2 font-bold text-foreground disabled:opacity-40"
      >
        Guardar
      </button>
      {error ? <p className="text-sm text-danger">Error al guardar</p> : null}
    </form>
  );
}
