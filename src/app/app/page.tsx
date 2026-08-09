import { getCurrentProfile } from '@/lib/profile';
import { createClient } from '@/lib/supabase/server';
import { calculateStreak } from '@/lib/achievements';
import { CheckinButton } from '@/components/app/CheckinButton';
import { MonthCalendar } from '@/components/app/MonthCalendar';
import { ResetProtocolButton } from '@/components/app/ResetProtocolButton';
import { RemindersToggle } from '@/components/app/RemindersToggle';

export default async function AppPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();
  const { data: checkins } = await supabase.from('checkins').select('date').eq('user_id', profile.id);
  const checkinDates = (checkins ?? []).map((c: { date: string }) => c.date);

  const today = new Date().toISOString().slice(0, 10);
  const daysSinceStart = Math.floor((Date.parse(today) - Date.parse(profile.protocol_start_date)) / 86400000) + 1;
  const dayNumber = Math.min(daysSinceStart, 21);
  const streak = calculateStreak(checkinDates, today);
  const progressPercent = Math.round((checkinDates.length / 21) * 100);
  const initial = (profile.nombre ?? '?').charAt(0).toUpperCase();

  return (
    <div className="px-4 pb-24 pt-6">
      <div className="flex items-center justify-end gap-3">
        <RemindersToggle userId={profile.id} enabled={profile.reminders_enabled} />
        <ResetProtocolButton />
      </div>

      <div className="mt-2 flex items-center gap-3 rounded-card bg-white p-4 shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-lg font-bold text-foreground">
          {initial}
        </span>
        <div>
          <p className="font-bold text-foreground">Hola, {profile.nombre ?? ''}</p>
          <p className="text-sm text-neutral-600">Día {dayNumber} de 21</p>
        </div>
      </div>

      <div className="mt-4 rounded-card bg-white p-4 text-center shadow-sm">
        <p className="text-2xl font-bold text-brand">{progressPercent}%</p>
        <p className="text-sm text-neutral-600">{checkinDates.length}/21 check-ins — marcados como hechos</p>
        {streak > 0 ? <p className="mt-1 text-sm text-warning">🔥 {streak} días seguidos</p> : null}
      </div>

      <div className="mt-4 rounded-card bg-white p-4 shadow-sm">
        <p className="font-bold text-foreground">Receta de hoy</p>
        <p className="mt-1 text-sm text-neutral-600">
          Tu dosis personalizada de gel. Tómala a las {profile.hora_despertar}, 30 min antes de la comida.
        </p>
        <a href="/app/recipe" className="mt-2 inline-block text-sm font-bold text-brand">
          Ver receta completa →
        </a>
      </div>

      <div className="mt-4">
        <CheckinButton userId={profile.id} alreadyCheckedInToday={checkinDates.includes(today)} />
      </div>

      <div className="mt-4">
        <MonthCalendar checkinDates={checkinDates} />
      </div>
    </div>
  );
}
