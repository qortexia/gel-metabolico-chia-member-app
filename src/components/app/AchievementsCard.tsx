import type { Achievement } from '@/lib/achievements';

export function AchievementsCard({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="rounded-card bg-white p-4 shadow-sm">
      <p className="font-bold text-foreground">Conquistas</p>
      <ul className="mt-2 space-y-2">
        {achievements.map((a) => (
          <li key={a.id} className="flex items-center gap-2 text-sm">
            <span>{a.unlocked ? '🏆' : '🔒'}</span>
            <span className={a.unlocked ? 'text-foreground' : 'text-neutral-400'}>{a.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
