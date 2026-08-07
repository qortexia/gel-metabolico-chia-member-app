'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type SuccessScreenProps = {
  nombre: string;
};

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function SuccessScreen({ nombre }: SuccessScreenProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async () => {
    setStatus('sending');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setStatus(error ? 'error' : 'sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <span className="text-3xl">✨</span>
      <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">
        ¡Protocolo listo, <span className="text-brand">{nombre}</span>!
      </h1>
      <p className="mt-3 text-neutral-600">
        Tu dosis, horarios y checklist de 21 días ya están listos para que empieces ahora.
      </p>

      {status === 'sent' ? (
        <p className="mt-6 max-w-xs text-neutral-700">
          Revisa tu correo — te enviamos un enlace para entrar a tu protocolo.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="mt-6 w-full max-w-xs"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            aria-label="Correo electrónico"
            className="w-full rounded-card border border-neutral-300 px-4 py-3 text-lg"
          />
          {status === 'error' ? (
            <p className="mt-2 text-sm text-danger">No pudimos enviar el enlace. Intenta de nuevo.</p>
          ) : null}
          <button
            type="submit"
            disabled={status === 'sending' || email.trim().length === 0}
            className="mt-3 min-h-[44px] w-full rounded-full bg-brand px-6 py-3 text-lg font-bold text-foreground disabled:opacity-40"
          >
            {status === 'sending' ? 'Enviando…' : 'VER MI PROTOCOLO'}
          </button>
          <p className="mt-2 text-sm text-neutral-500">Te enviaremos un enlace mágico para entrar.</p>
        </form>
      )}
    </div>
  );
}
