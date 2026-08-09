'use client';

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="rounded-card bg-white p-4 shadow-sm">
        <p className="text-foreground">Algo salió mal. Intenta de nuevo.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-3 rounded-full bg-brand px-6 py-2 text-sm font-bold text-foreground"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
