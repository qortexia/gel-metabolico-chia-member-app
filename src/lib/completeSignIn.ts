import { INITIAL_ONBOARDING_ANSWERS, type OnboardingAnswers } from '@/types/onboarding';
import { ONBOARDING_STORAGE_KEY } from '@/lib/store';
import type { createClient } from '@/lib/supabase/client';
import type { useRouter } from 'next/navigation';

function readStoredAnswers(): OnboardingAnswers | null {
  const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.state?.answers ?? null;
  } catch {
    return null;
  }
}

export async function completeSignIn(
  supabase: ReturnType<typeof createClient>,
  user: { id: string },
  router: ReturnType<typeof useRouter>
): Promise<{ error: boolean }> {
  const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();

  if (existing) {
    router.push('/app/recipe');
    return { error: false };
  }

  const answers = readStoredAnswers();
  if (!answers) {
    return { error: true };
  }

  const { error: insertError } = await supabase.from('profiles').insert({
    id: user.id,
    nombre: answers.nombre ?? INITIAL_ONBOARDING_ANSWERS.nombre,
    peso: answers.peso,
    estatura: answers.estatura,
    edad: answers.edad,
    horario_hambre: answers.horarioHambre,
    antojo_dulce: answers.antojoDulce,
    meta_peso: answers.metaPeso,
    hora_despertar: answers.horaDespertar,
  });

  if (insertError) {
    return { error: true };
  }

  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  router.push('/app/recipe');
  return { error: false };
}
