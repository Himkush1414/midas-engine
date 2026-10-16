import type { DomainRatings } from '@mindtier/core';
import * as Sharing from 'expo-sharing';
import { useCallback, useRef, type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { track } from '@/lib/analytics';
import { shareText, tierShareText } from '@/lib/share';
import { TierShareCard } from './TierShareCard';

/**
 * Renders an off-screen share card and returns a `share()` that captures it as
 * a PNG for the system share sheet, falling back to text when images can't be shared.
 */
export function useTierShare(ratings: DomainRatings): { share(): Promise<void>; card: ReactNode } {
  const ref = useRef<View>(null);

  const share = useCallback(async () => {
    track('share_tapped', { what: 'tier' });
    try {
      if (Platform.OS !== 'web' && ref.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile', width: 1080, height: 1350 });
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your Mindtier', UTI: 'public.png' });
        return;
      }
    } catch {
      // Fall through to text sharing.
    }
    await shareText(tierShareText(ratings));
  }, [ratings]);

  const card = (
    <View pointerEvents="none" style={styles.offscreen} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <TierShareCard ref={ref} ratings={ratings} />
    </View>
  );
  return { share, card };
}

const styles = StyleSheet.create({
  // Rendered but never visible: view-shot needs a laid-out native view.
  offscreen: { position: 'absolute', left: -10_000, top: 0 },
});
