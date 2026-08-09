import { getCurrentProfile } from '@/lib/profile';
import { createClient } from '@/lib/supabase/server';
import { AddWeightForm } from '@/components/app/AddWeightForm';
import { AchievementsCard } from '@/components/app/AchievementsCard';
import { ProgressPhotos } from '@/components/app/ProgressPhotos';
import { calculateAchievements } from '@/lib/achievements';
import { getMexicoCityDate } from '@/lib/reminders';

export default async function ProgressPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();

  const [{ data: weightLogs }, { data: checkins }, { data: photos }] = await Promise.all([
    supabase.from('weight_logs').select('peso, date').eq('user_id', profile.id).order('date'),
    supabase.from('checkins').select('date').eq('user_id', profile.id).order('date'),
    supabase.from('progress_photos').select('id, storage_path, taken_at').eq('user_id', profile.id).order('taken_at'),
  ]);

  const logs = (weightLogs ?? []) as { peso: number; date: string }[];
  const initial = logs.length > 0 ? logs[0].peso : null;
  const current = logs.length > 0 ? logs[logs.length - 1].peso : null;
  const diff = initial !== null && current !== null ? Math.round((current - initial) * 10) / 10 : null;

  const today = getMexicoCityDate(new Date());
  const daysSinceStart = Math.floor((Date.parse(today) - Date.parse(profile.protocol_start_date)) / 86400000) + 1;

  const achievements = calculateAchievements({
    checkinDates: (checkins ?? []).map((c: { date: string }) => c.date),
    weightLogs: logs,
    protocolStartDate: profile.protocol_start_date,
    today,
  });

  const signedPhotos = await Promise.all(
    (photos ?? []).map(async (photo: { id: string; storage_path: string; taken_at: string }) => {
      const { data } = await supabase.storage.from('progress-photos').createSignedUrl(photo.storage_path, 3600);
      return { id: photo.id, takenAt: photo.taken_at, url: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="px-4 pb-24 pt-6">
      <p className="text-xs font-bold uppercase tracking-wide text-brand">Tu evolución</p>
      <h1 className="font-serif text-2xl font-bold text-foreground">Mi progreso</h1>
      <p className="mt-1 text-neutral-600">Estás en el día {Math.min(Math.max(daysSinceStart, 1), 21)} de 21</p>

      <div className="mt-4 rounded-card bg-white p-4 shadow-sm">
        <p className="font-bold text-foreground">Evolución de peso</p>
        {logs.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-600">Aún no has registrado tu peso. ¿Qué tal empezar ahora? ✨</p>
        ) : (
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-neutral-500">INICIAL</p>
              <p className="font-bold text-foreground">{initial} kg</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">ACTUAL</p>
              <p className="font-bold text-foreground">{current} kg</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">DIFERENCIA</p>
              <p className="font-bold text-foreground">
                {diff !== null && diff > 0 ? `+${diff}` : diff} kg
              </p>
            </div>
          </div>
        )}
        <AddWeightForm userId={profile.id} />
      </div>

      <div className="mt-4">
        <ProgressPhotos userId={profile.id} photos={signedPhotos} />
      </div>

      <div className="mt-4">
        <AchievementsCard achievements={achievements} />
      </div>
    </div>
  );
}
