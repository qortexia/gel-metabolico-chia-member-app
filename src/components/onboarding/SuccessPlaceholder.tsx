type SuccessPlaceholderProps = {
  nombre: string;
};

export function SuccessPlaceholder({ nombre }: SuccessPlaceholderProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <span className="text-3xl">✨</span>
      <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">
        ¡Protocolo listo, <span className="text-brand">{nombre}</span>!
      </h1>
      <p className="mt-3 text-neutral-600">
        Tu dosis, horarios y checklist de 21 días ya están listos para que empieces ahora.
      </p>
    </div>
  );
}
