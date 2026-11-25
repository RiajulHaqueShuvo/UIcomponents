export interface Preset {
  name: string;
  colors: [hex: string, percent: number][];
}

export const PRESETS: Preset[] = [
  { name: 'Midnight Violet', colors: [['#0b0b12', 60], ['#1e1b4b', 28], ['#a78bfa', 9], ['#34d399', 3]] },
  { name: 'Ocean Breeze', colors: [['#f0f9ff', 60], ['#bae6fd', 25], ['#0369a1', 12], ['#f97316', 3]] },
  { name: 'Sunset Sale', colors: [['#fff7ed', 58], ['#fed7aa', 27], ['#c2410c', 11], ['#7c2d12', 4]] },
  { name: 'Forest Fresh', colors: [['#f0fdf4', 62], ['#dcfce7', 24], ['#15803d', 11], ['#facc15', 3]] },
  { name: 'Royal Gold', colors: [['#0f172a', 60], ['#1e293b', 26], ['#fbbf24', 10], ['#f8fafc', 4]] },
  { name: 'Rose Minimal', colors: [['#fff1f2', 68], ['#fecdd3', 20], ['#be123c', 12]] },
  { name: 'Mono Studio', colors: [['#fafafa', 65], ['#e4e4e7', 25], ['#18181b', 10]] },
];
