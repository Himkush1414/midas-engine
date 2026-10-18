import localFont from 'next/font/local';

// Self-hosted (SIL OFL, licences beside the files): the build never fetches fonts over the network,
// and the site speaks with the app's three voices.

/** Display: tier names, numbers, headlines (set uppercase). */
export const display = localFont({
  src: [
    { path: '../assets/fonts/BigShoulders_800ExtraBold.ttf', weight: '800' },
    { path: '../assets/fonts/BigShoulders_900Black.ttf', weight: '900' },
  ],
  variable: '--font-display',
  display: 'swap',
});

/** Body: reading text. */
export const body = localFont({
  src: [
    { path: '../assets/fonts/InstrumentSans_400Regular.ttf', weight: '400' },
    { path: '../assets/fonts/InstrumentSans_500Medium.ttf', weight: '500' },
    { path: '../assets/fonts/InstrumentSans_600SemiBold.ttf', weight: '600' },
    { path: '../assets/fonts/InstrumentSans_700Bold.ttf', weight: '700' },
  ],
  variable: '--font-body',
  display: 'swap',
});

/** Data: uppercase micro-labels. */
export const mono = localFont({
  src: [
    { path: '../assets/fonts/JetBrainsMono_500Medium.ttf', weight: '500' },
    { path: '../assets/fonts/JetBrainsMono_700Bold.ttf', weight: '700' },
  ],
  variable: '--font-mono',
  display: 'swap',
});
