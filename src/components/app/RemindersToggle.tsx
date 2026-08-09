'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type RemindersToggleProps = {
  userId: string;
  enabled: boolean;
};

export function RemindersToggle({ userId, enabled }: RemindersToggleProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function handleToggle() {
    setSaving(true);
    setError(false);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ reminders_enabled: !enabled })
      .eq('id', userId);
    setSaving(false);
    if (updateError) {
      setError(true);
      return;
    }
    router.refresh();
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={handleToggle}
        disabled={saving}
        className="text-sm text-neutral-500 disabled:opacity-40"
      >
        {enabled ? '🔔 Recordatorio activado' : '🔕 Recordatorio desactivado'}
      </button>
      {error ? <p className="mt-1 text-xs text-danger">No pudimos guardar el cambio.</p> : null}
    </div>
  );
}
