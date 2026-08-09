import Link from 'next/link';
import { getCurrentProfile } from '@/lib/profile';
import { calculateDose } from '@/lib/dose';
import { PrepareTimer } from '@/components/app/PrepareTimer';

export default async function PreparePage() {
  const profile = await getCurrentProfile();
  const dose = calculateDose(profile.peso, profile.antojo_dulce, profile.edad);

  return (
    <div className="px-4 pb-24 pt-6">
      <Link href="/app/recipe" className="text-sm text-neutral-500">
        ← Volver
      </Link>
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-brand">Modo de preparación</p>
      <h1 className="font-serif text-2xl font-bold text-foreground">Cómo preparar — 2 minutos</h1>

      <div className="mt-4 space-y-3">
        <div className="rounded-card bg-white p-4 shadow-sm">
          <p className="font-bold text-foreground">🛒 1. Reúne los ingredientes</p>
          <p className="mt-1 text-sm text-neutral-600">
            Ten a mano chía, linaza, psyllium, un vaso de {dose.agua} y una cuchara.
          </p>
        </div>
        <div className="rounded-card bg-white p-4 shadow-sm">
          <p className="font-bold text-foreground">🥣 2. Mezcla las fibras</p>
          <p className="mt-1 text-sm text-neutral-600">
            {dose.chia} de chía, {dose.linaza} de linaza y {dose.psyllium} de psyllium. Mezcla ligeramente por 10
            segundos.
          </p>
        </div>
        <div className="rounded-card bg-white p-4 shadow-sm">
          <p className="font-bold text-foreground">💧 3. Agrega el agua</p>
          <p className="mt-1 text-sm text-neutral-600">
            Agrega {dose.agua} a temperatura ambiente. Mezcla vigorosamente por 30 segundos hasta que no queden
            grumos.
          </p>
        </div>
        <div className="rounded-card bg-white p-4 shadow-sm">
          <p className="font-bold text-foreground">⏱️ 4. Espera a que se forme el gel</p>
          <p className="mt-1 text-sm text-neutral-600">Deja reposar por 5 minutos, revolviendo una vez a la mitad.</p>
          <PrepareTimer />
        </div>
        <div className="rounded-card bg-white p-4 shadow-sm">
          <p className="font-bold text-foreground">🥤 5. Toma todo el vaso</p>
          <p className="mt-1 text-sm text-neutral-600">
            Bebe despacio, en pequeños sorbos. Luego toma 1 vaso más de agua pura. Espera 20 minutos antes de tu
            próxima comida.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-card bg-brand/10 p-4">
        <p className="text-xs font-bold uppercase text-brand">Consejo de la Dra. Gabriela Treviño</p>
        <p className="mt-1 text-sm text-foreground">
          &ldquo;Si el gel queda muy espeso, agrega un chorrito más de agua. Si queda muy líquido, deja reposar 2
          minutos más.&rdquo;
        </p>
      </div>
    </div>
  );
}
