'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { resizeImage } from '@/lib/resizeImage';
import { getMexicoCityDate } from '@/lib/reminders';

type Photo = { id: string; takenAt: string; url: string | null };

export function ProgressPhotos({ userId, photos }: { userId: string; photos: Photo[] }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(false);
    try {
      const blob = await resizeImage(file);
      const supabase = createClient();
      const path = `${userId}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(path, blob, { contentType: 'image/jpeg' });
      if (uploadError) throw uploadError;
      const { error: insertError } = await supabase
        .from('progress_photos')
        .insert({ user_id: userId, storage_path: path, taken_at: getMexicoCityDate(new Date()) });
      if (insertError) throw insertError;
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setUploading(false);
    }
  }

  const first = photos[0] ?? null;
  const latest = photos.length > 1 ? photos[photos.length - 1] : null;

  return (
    <div className="rounded-card bg-white p-4 shadow-sm">
      <p className="font-bold text-foreground">Fotos de progreso</p>

      {photos.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-600">Aún no tienes fotos de progreso. ¿Qué tal tomar la primera? ✨</p>
      ) : latest ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-neutral-500">ANTES</p>
            {first?.url ? <img src={first.url} alt="Foto antes" className="mt-1 rounded-card" /> : null}
          </div>
          <div>
            <p className="text-xs text-neutral-500">AHORA</p>
            {latest.url ? <img src={latest.url} alt="Foto más reciente" className="mt-1 rounded-card" /> : null}
          </div>
        </div>
      ) : first?.url ? (
        <div className="mt-3">
          <img src={first.url} alt="Tu foto de progreso" className="rounded-card" />
          <p className="mt-2 text-sm text-neutral-600">Sigue registrando para ver tu comparación.</p>
        </div>
      ) : null}

      <label className="mt-3 block">
        <span className="inline-block cursor-pointer rounded-full bg-brand px-4 py-2 text-sm font-bold text-foreground">
          {uploading ? 'Subiendo…' : 'Agregar foto'}
        </span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error ? <p className="mt-2 text-sm text-danger">No pudimos subir tu foto. Intenta de nuevo.</p> : null}
      <p className="mt-2 text-xs text-neutral-500">Solo tú puedes ver tus fotos — son privadas.</p>
    </div>
  );
}
