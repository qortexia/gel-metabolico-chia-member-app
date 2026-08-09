import Link from 'next/link';
import { getCurrentProfile } from '@/lib/profile';
import { calculateDose } from '@/lib/dose';
import { RecalculateButton } from '@/components/app/RecalculateButton';

export default async function RecipePage() {
  const profile = await getCurrentProfile();
  const dose = calculateDose(profile.peso, profile.antojo_dulce, profile.edad);

  return (
    <div className="px-4 pb-24 pt-6">
      <p className="text-xs font-bold uppercase tracking-wide text-brand">Tu fórmula</p>
      <h1 className="font-serif text-2xl font-bold text-foreground">Tu Receta Personalizada</h1>
      <p className="mt-1 text-neutral-600">Calibrada para tu peso y perfil</p>

      <div className="mt-4 rounded-card bg-white p-4 shadow-sm">
        <p className="font-bold text-foreground">INGREDIENTES</p>
        <ul className="mt-2 space-y-2 text-sm text-foreground">
          <li>🌱 Chía — {dose.chia}</li>
          <li>🌾 Linaza dorada — {dose.linaza}</li>
          <li>🌿 Psyllium — {dose.psyllium}</li>
          <li>💧 Agua filtrada — {dose.agua}</li>
        </ul>
      </div>

      <div className="mt-4 rounded-card bg-white p-4 shadow-sm">
        <p className="font-bold text-foreground">¿Por qué esta proporción?</p>
        <p className="mt-1 text-sm text-neutral-600">
          Calibramos la cantidad de fibra y agua según tu peso, tu edad y tu nivel de antojo de
          dulce, para que tu dosis sea segura y efectiva.
        </p>
        {dose.tip ? <p className="mt-2 text-sm text-neutral-600">💡 {dose.tip}</p> : null}
        <RecalculateButton />
      </div>

      <div className="mt-4 rounded-card bg-white p-4 shadow-sm">
        <p className="font-bold text-foreground">Dónde comprar</p>
        <p className="mt-1 text-sm text-neutral-600">
          Encuentras chía, linaza y psyllium en supermercados, tiendas naturistas o farmacias con
          sección de suplementos.
        </p>
      </div>

      <Link
        href="/app/recipe/prepare"
        className="mt-4 block rounded-full bg-brand px-6 py-3 text-center text-lg font-bold text-foreground"
      >
        VER CÓMO PREPARAR →
      </Link>
    </div>
  );
}
