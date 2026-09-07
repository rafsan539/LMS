import type { CSSProperties } from 'react';

export type GradientThemeId = 
  | 'midnight-navy'
  | 'royal-sapphire'
  | 'emerald-matrix'
  | 'obsidian-titanium'
  | 'aurora-indigo';

export interface GradientTheme {
  id: GradientThemeId;
  nameEn: string;
  nameBn: string;
  descEn: string;
  descBn: string;
  bgClass: string;
  styleObject: CSSProperties;
  colorPreview: string; // CSS color or gradient for thumbnail
  badgeColor: string;
}

export const GRADIENT_THEMES: GradientTheme[] = [
  {
    id: 'midnight-navy',
    nameEn: 'Midnight Navy & Slate',
    nameBn: 'মিডনাইট নেভি ও স্লেট',
    descEn: 'Executive deep slate with indigo accents',
    descBn: 'আধুনিক এক্সিকিউটিভ নেভি ও স্লেট আবহ',
    bgClass: 'theme-midnight-navy',
    styleObject: {
      background: 'radial-gradient(ellipse at 30% 0%, #1e1b4b 0%, #0f172a 45%, #020617 100%)',
      backgroundColor: '#0a0f1d'
    },
    colorPreview: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
    badgeColor: 'border-blue-500 text-blue-400'
  },
  {
    id: 'royal-sapphire',
    nameEn: 'Royal Sapphire Ocean',
    nameBn: 'রয়্যাল স্যাফায়ার ওশান',
    descEn: 'Deep maritime cobalt & deep blue twilight',
    descBn: 'গভীর নীল সমুদ্র ও শান্ত গোধূলি আবহ',
    bgClass: 'theme-royal-sapphire',
    styleObject: {
      background: 'radial-gradient(ellipse at 50% 0%, #072e54 0%, #031525 55%, #020b14 100%)',
      backgroundColor: '#031525'
    },
    colorPreview: 'linear-gradient(135deg, #072e54 0%, #031525 100%)',
    badgeColor: 'border-sky-500 text-sky-400'
  },
  {
    id: 'emerald-matrix',
    nameEn: 'Nordic Emerald Slate',
    nameBn: 'নরডিক এমারেল্ড স্লেট',
    descEn: 'Prestigious forest green & cyber slate',
    descBn: 'মর্যাদাপূর্ণ গভীর সবুজ ও সাইবার স্লেট',
    bgClass: 'theme-emerald-matrix',
    styleObject: {
      background: 'radial-gradient(ellipse at 40% 0%, #0d3b31 0%, #061e18 50%, #020d0a 100%)',
      backgroundColor: '#061e18'
    },
    colorPreview: 'linear-gradient(135deg, #0d3b31 0%, #061e18 100%)',
    badgeColor: 'border-emerald-500 text-emerald-400'
  },
  {
    id: 'obsidian-titanium',
    nameEn: 'Obsidian & Titanium Dusk',
    nameBn: 'অবসিডিয়ান ও চারকোল',
    descEn: 'Ultra-minimal monochrome charcoal slate',
    descBn: 'আল্ট্রা-মিনিমাল মনিক্রোম চারকোল আবহ',
    bgClass: 'theme-obsidian-titanium',
    styleObject: {
      background: 'radial-gradient(ellipse at 50% 0%, #27272a 0%, #18181b 50%, #09090b 100%)',
      backgroundColor: '#121316'
    },
    colorPreview: 'linear-gradient(135deg, #27272a 0%, #09090b 100%)',
    badgeColor: 'border-slate-400 text-slate-300'
  },
  {
    id: 'aurora-indigo',
    nameEn: 'Deep Aurora Twilight',
    nameBn: 'ডিপ অরোরা ভায়োলেট',
    descEn: 'Cosmic royal indigo & deep amethyst',
    descBn: 'রয়্যাল ভায়োলেট ও কসমিক ইন্ডিগো আবহ',
    bgClass: 'theme-aurora-indigo',
    styleObject: {
      background: 'radial-gradient(ellipse at 35% 0%, #311b58 0%, #150f29 50%, #070510 100%)',
      backgroundColor: '#150f29'
    },
    colorPreview: 'linear-gradient(135deg, #311b58 0%, #070510 100%)',
    badgeColor: 'border-purple-500 text-purple-400'
  }
];

export const getStoredTheme = (): GradientThemeId => {
  try {
    const saved = localStorage.getItem('biblio_gradient_theme');
    if (saved && GRADIENT_THEMES.some(t => t.id === saved)) {
      return saved as GradientThemeId;
    }
  } catch (e) {}
  return 'midnight-navy'; // Default professional executive gradient
};

export const setStoredTheme = (themeId: GradientThemeId): void => {
  try {
    localStorage.setItem('biblio_gradient_theme', themeId);
  } catch (e) {}
};
