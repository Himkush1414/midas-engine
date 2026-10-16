import { createContext, use, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import type { Domain } from '@mindtier/core';
import { darkPalette, domainColors, domainColorsLight, lightPalette, type Palette } from './tokens';

export type ThemePreference = 'system' | 'dark' | 'light';
export type Scheme = 'dark' | 'light';

interface ThemeValue {
  scheme: Scheme;
  colors: Palette;
  preference: ThemePreference;
  /** Domain identity colours stepped for the active theme. */
  domain: Record<Domain, string>;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function resolveScheme(preference: ThemePreference, system: string | null | undefined): Scheme {
  if (preference === 'system') return system === 'light' ? 'light' : 'dark';
  return preference;
}

export function ThemeProvider({ preference, children }: { preference: ThemePreference; children: ReactNode }) {
  const system = useColorScheme();
  const value = useMemo<ThemeValue>(() => {
    const scheme = resolveScheme(preference, system);
    return {
      scheme,
      colors: scheme === 'dark' ? darkPalette : lightPalette,
      preference,
      domain: scheme === 'dark' ? domainColors : domainColorsLight,
    };
  }, [preference, system]);
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeValue {
  const value = use(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
