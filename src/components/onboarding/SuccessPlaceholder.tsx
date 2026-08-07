type SuccessPlaceholderProps = {
  nome: string;
};

export function SuccessPlaceholder({ nome }: SuccessPlaceholderProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <span className="text-3xl">✨</span>
      <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">
        Protocolo pronto, <span className="text-brand">{nome}</span>!
      </h1>
      <p className="mt-3 text-neutral-600">
        Sua dose, horários e checklist de 21 dias estão prontinhos pra você começar agora.
      </p>
    </div>
  );
}
