'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { INITIAL_ONBOARDING_ANSWERS, type OnboardingAnswers } from '@/types/onboarding';

const ONBOARDING_STORAGE_KEY = 'gel-chia-member-onboarding';

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

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function waitForUser(maxAttempts = 3, delayMs = 300) {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) return user;
        if (attempt < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
      return null;
    }

    async function run() {
      const user = await waitForUser();
      if (cancelled) return;

      if (!user) {
        setError(true);
        return;
      }

      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled) return;

      if (existing) {
        router.push('/app');
        return;
      }

      const answers = readStoredAnswers();
      if (!answers) {
        setError(true);
        return;
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
      if (cancelled) return;

      if (insertError) {
        setError(true);
        return;
      }

      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      router.push('/app');
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <p className="text-neutral-700">No pudimos completar tu acceso. Intenta de nuevo desde el inicio.</p>
        <a href="/" className="mt-4 font-bold text-brand">
          Volver al inicio
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-brand" />
    </div>
  );
}
