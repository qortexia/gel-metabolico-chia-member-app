'use client';

type PrimaryButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

export function PrimaryButton({ children, onClick, disabled }: PrimaryButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="min-h-[44px] w-full rounded-full bg-brand px-6 py-3 text-lg font-bold text-foreground disabled:opacity-40"
    >
      {children}
    </button>
  );
}
