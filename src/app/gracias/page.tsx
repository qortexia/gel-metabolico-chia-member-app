import Link from 'next/link';

export default function GraciasPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <span className="text-3xl">🎉</span>
      <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">¡Gracias por tu compra!</h1>
      <p className="mt-3 text-neutral-600">
        Tu protocolo personalizado te espera — solo faltan 2 minutos para configurarlo.
      </p>
      <Link
        href="/"
        className="mt-6 flex min-h-[44px] w-full max-w-xs items-center justify-center rounded-full bg-brand px-6 py-3 text-lg font-bold text-foreground"
      >
        COMENZAR MI PROTOCOLO
      </Link>
    </div>
  );
}
