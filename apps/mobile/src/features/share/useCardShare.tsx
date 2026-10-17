import * as Sharing from 'expo-sharing';
import { useCallback, useRef, type ReactNode, type RefObject } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { getT } from '@/i18n';
import { track } from '@/lib/analytics';
import { shareText } from '@/lib/share';

/**
 * Renders a share card off-screen and returns a `share()` that captures it as
 * a 1080×1350 PNG for the system share sheet, falling back to `text()` when
 * images can't be shared (web, or capture failed).
 */
export function useCardShare(
  renderCard: (ref: RefObject<View | null>) => ReactNode,
  text: () => string,
  what: string,
): { share(): Promise<void>; card: ReactNode } {
  const ref = useRef<View>(null);

  const share = useCallback(async () => {
    track('share_tapped', { what });
    try {
      if (Platform.OS !== 'web' && ref.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile', width: 1080, height: 1350 });
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: getT()('share.dialogTitle'), UTI: 'public.png' });
        return;
      }
    } catch {
      // Fall through to text sharing.
    }
    await shareText(text());
  }, [text, what]);

  const card = (
    <View pointerEvents="none" style={styles.offscreen} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {renderCard(ref)}
    </View>
  );
  return { share, card };
}

const styles = StyleSheet.create({
  // Rendered but never visible: view-shot needs a laid-out native view.
  offscreen: { position: 'absolute', left: -10_000, top: 0 },
});
