'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { createClient } from '@/lib/supabase/client';

type CheckinButtonProps = {
  userId: string;
  alreadyCheckedInToday: boolean;
};

export function CheckinButton({ userId, alreadyCheckedInToday }: CheckinButtonProps) {
  const router = useRouter();
  const [done, setDone] = useState(alreadyCheckedInToday);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setDone(alreadyCheckedInToday);
  }, [alreadyCheckedInToday]);

  async function handleClick() {
    setSaving(true);
    setError(false);
    const supabase = createClient();
    const today = new Date().toISOString().slice(0, 10);
    const { error: insertError } = await supabase.from('checkins').insert({ user_id: userId, date: today });
    setSaving(false);
    if (insertError) {
      setError(true);
      return;
    }
    setDone(true);
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
    router.refresh();
  }

  if (done) {
    return (
      <button
        type="button"
        disabled
        className="min-h-[44px] w-full rounded-full bg-success px-6 py-3 text-lg font-bold text-white opacity-90"
      >
        ✓ Check-in de hoy hecho
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={saving}
        className="min-h-[44px] w-full rounded-full bg-brand px-6 py-3 text-lg font-bold text-foreground disabled:opacity-40"
      >
        {saving ? 'Guardando…' : 'Marcar mi check-in'}
      </button>
      {error ? <p className="mt-2 text-sm text-danger">No pudimos guardar tu check-in. Intenta de nuevo.</p> : null}
    </div>
  );
}
