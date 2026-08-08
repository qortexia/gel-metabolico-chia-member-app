export interface DoseResult {
  chia: string;
  psyllium: string;
  linaza: string;
  agua: string;
  tip: string | null;
}

interface DoseTier {
  maxPeso: number;
  chia: string;
  psyllium: string;
  psylliumBumped: string;
  agua: string;
}

const TIERS: DoseTier[] = [
  { maxPeso: 65, chia: '1 cucharada', psyllium: '1 cucharadita', psylliumBumped: '1½ cucharadita', agua: '250 ml' },
  { maxPeso: 90, chia: '1½ cucharada', psyllium: '1½ cucharadita', psylliumBumped: '2 cucharaditas', agua: '300 ml' },
  { maxPeso: Infinity, chia: '2 cucharadas', psyllium: '2 cucharaditas', psylliumBumped: '2 cucharaditas', agua: '350 ml' },
];

const LINAZA = '1 cucharada';
const AGE_TIP = 'Empieza con la cantidad menor por unos días antes de aumentar.';

export function calculateDose(peso: number, antojoDulce: number, edad: number): DoseResult {
  const tier = TIERS.find((t) => peso <= t.maxPeso) ?? TIERS[TIERS.length - 1];
  const psyllium = antojoDulce >= 7 ? tier.psylliumBumped : tier.psyllium;
  const tip = edad >= 55 ? AGE_TIP : null;
  return { chia: tier.chia, psyllium, linaza: LINAZA, agua: tier.agua, tip };
}
