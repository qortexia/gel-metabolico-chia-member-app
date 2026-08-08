'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/app', label: 'Inicio', icon: '🏠' },
  { href: '/app/recipe', label: 'Receta', icon: '🌱' },
  { href: '/app/progress', label: 'Progreso', icon: '📈' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex border-t border-neutral-200 bg-white">
      {TABS.map((tab) => {
        const active = tab.href === '/app' ? pathname === '/app' : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              active ? 'font-bold text-brand' : 'text-neutral-500'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
