'use client';

import { useState } from 'react';

type MonthCalendarProps = {
  checkinDates: string[];
};

const WEEKDAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function MonthCalendar({ checkinDates }: MonthCalendarProps) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayISO = toISODate(new Date());
  const checkinSet = new Set(checkinDates);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay();
  const monthLabel = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(viewDate);

  const days: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function handleSelect(day: number) {
    setSelectedDate(toISODate(new Date(year, month, day)));
  }

  const selectedInfo = selectedDate
    ? {
        label:
          selectedDate === todayISO
            ? 'HOY'
            : new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
                .format(new Date(`${selectedDate}T00:00:00`))
                .toUpperCase(),
        done: checkinSet.has(selectedDate),
      }
    : null;

  return (
    <div className="rounded-card bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          aria-label="Mes anterior"
          className="px-2 text-lg text-neutral-500"
        >
          ‹
        </button>
        <span className="font-bold capitalize text-foreground">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          aria-label="Mes siguiente"
          className="px-2 text-lg text-neutral-500"
        >
          ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-neutral-500">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) return <span key={`blank-${i}`} />;
          const iso = toISODate(new Date(year, month, day));
          const isToday = iso === todayISO;
          const isDone = checkinSet.has(iso);
          return (
            <button
              type="button"
              key={iso}
              onClick={() => handleSelect(day)}
              className={`relative flex h-9 w-9 items-center justify-center rounded-full text-sm ${
                isToday ? 'bg-foreground text-white' : 'text-foreground'
              }`}
            >
              {day}
              {isDone ? <span className="absolute bottom-0.5 h-1.5 w-1.5 rounded-full bg-brand" /> : null}
            </button>
          );
        })}
      </div>

      {selectedInfo ? (
        <div className="mt-4 border-t border-neutral-200 pt-3 text-center">
          <p className="text-sm font-bold text-foreground">{selectedInfo.label}</p>
          <p className="text-sm text-neutral-600">{selectedInfo.done ? 'Marcado ✓' : 'Aún no marcado'}</p>
          <p className="mt-1 text-sm text-neutral-500">Tu progreso empieza con la constancia.</p>
        </div>
      ) : null}
    </div>
  );
}
