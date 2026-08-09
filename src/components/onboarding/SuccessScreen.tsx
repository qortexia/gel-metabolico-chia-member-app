'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { completeSignIn } from '@/lib/completeSignIn';

type SuccessScreenProps = {
  nombre: string;
};

type Status =
  | 'idle'
  | 'sending'
  | 'send-error'
  | 'code-sent'
  | 'resending'
  | 'resend-error'
  | 'verifying'
  | 'code-error'
  | 'signin-error';

type MaybeAuthError = { status?: number; message?: string } | null | undefined;

function getErrorMessage(context: 'send' | 'resend' | 'code', error?: MaybeAuthError): string {
  if (error?.status === 429) {
    return 'Demasiados intentos. Espera unos minutos antes de volver a intentar.';
  }
  if (context === 'send') {
    return 'No pudimos enviar el código. Intenta de nuevo.';
  }
  if (context === 'resend') {
    return 'No pudimos reenviar el código. Si ya recibiste uno, puedes usarlo abajo.';
  }
  return 'Código incorrecto o expirado. Intenta de nuevo.';
}

export function SuccessScreen({ nombre }: SuccessScreenProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSendCode() {
    setStatus('sending');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
      if (error) {
        setErrorMessage(getErrorMessage('send', error));
        setStatus('send-error');
      } else {
        setStatus('code-sent');
      }
    } catch {
      setErrorMessage(getErrorMessage('send'));
      setStatus('send-error');
    }
  }

  async function handleResendCode() {
    setStatus('resending');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
      if (error) {
        setErrorMessage(getErrorMessage('resend', error));
        setStatus('resend-error');
      } else {
        setStatus('code-sent');
      }
    } catch {
      setErrorMessage(getErrorMessage('resend'));
      setStatus('resend-error');
    }
  }

  async function handleVerifyCode() {
    setStatus('verifying');
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'email',
      });
      if (error || !data.session || !data.user) {
        setErrorMessage(getErrorMessage('code', error));
        setStatus('code-error');
        return;
      }
      const result = await completeSignIn(supabase, data.user, router);
      if (result.error) {
        setStatus('signin-error');
      }
    } catch {
      setErrorMessage(getErrorMessage('code'));
      setStatus('code-error');
    }
  }

  const showCodeForm =
    status === 'code-sent' ||
    status === 'verifying' ||
    status === 'code-error' ||
    status === 'resending' ||
    status === 'resend-error';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <span className="text-3xl">✨</span>
      <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">
        ¡Protocolo listo, <span className="text-brand">{nombre}</span>!
      </h1>
      <p className="mt-3 text-neutral-600">
        Tu dosis, horarios y checklist de 21 días ya están listos para que empieces ahora.
      </p>

      {status === 'signin-error' ? (
        <p className="mt-6 max-w-xs text-danger">No pudimos completar tu acceso. Intenta de nuevo desde el inicio.</p>
      ) : showCodeForm ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerifyCode();
          }}
          className="mt-6 w-full max-w-xs"
        >
          <p className="text-neutral-700">Revisa tu correo — te enviamos un código de 6 dígitos.</p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            aria-label="Código de 6 dígitos"
            className="mt-3 w-full rounded-card border border-neutral-300 px-4 py-3 text-center text-lg tracking-widest"
          />
          {status === 'code-error' || status === 'resend-error' ? (
            <p className="mt-2 text-sm text-danger">{errorMessage}</p>
          ) : null}
          <button
            type="submit"
            disabled={status === 'verifying' || status === 'resending' || code.trim().length === 0}
            className="mt-3 min-h-[44px] w-full rounded-full bg-brand px-6 py-3 text-lg font-bold text-foreground disabled:opacity-40"
          >
            {status === 'verifying' ? 'Confirmando…' : 'Confirmar'}
          </button>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={status === 'resending' || status === 'verifying'}
            className="mt-3 text-sm text-neutral-500 underline disabled:opacity-40"
          >
            {status === 'resending' ? 'Reenviando…' : '¿No llegó? Reenviar código'}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendCode();
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
          {status === 'send-error' ? <p className="mt-2 text-sm text-danger">{errorMessage}</p> : null}
          <button
            type="submit"
            disabled={status === 'sending' || email.trim().length === 0}
            className="mt-3 min-h-[44px] w-full rounded-full bg-brand px-6 py-3 text-lg font-bold text-foreground disabled:opacity-40"
          >
            {status === 'sending' ? 'Enviando…' : 'VER MI PROTOCOLO'}
          </button>
          <p className="mt-2 text-sm text-neutral-500">Te enviaremos un código para entrar.</p>
        </form>
      )}
    </div>
  );
}
