import { useId, type ReactNode } from 'react';
import { Image, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { spacing, useTheme } from '@/theme';

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Pinned below scrolling content (e.g. a primary action). */
  footer?: ReactNode;
  testID?: string;
}

const GRAIN = require('../../../assets/images/grain.png');

/** The field's texture: one small noise tile repeated at a few percent, so large areas feel printed. */
export function Grain() {
  const { colors, scheme } = useTheme();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={GRAIN}
        resizeMode="repeat"
        accessibilityIgnoresInvertColors
        style={[StyleSheet.absoluteFill, { opacity: colors.grain, tintColor: scheme === 'dark' ? '#FFFFFF' : '#000000' }]}
      />
    </View>
  );
}

/** Content scrolling under a pinned footer fades out instead of being cut by a hard edge, so it reads as "more below". */
function FooterFade({ color }: { color: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <View pointerEvents="none" style={styles.fade}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0} />
            <Stop offset="1" stopColor={color} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/** Content column width on tablets and large phones in landscape. */
export const MAX_CONTENT_WIDTH = 640;

export function Screen({ children, scroll, edges = ['top', 'left', 'right'], padded = true, contentStyle, footer, testID }: ScreenProps) {
  const { colors } = useTheme();
  const pad = padded ? { paddingHorizontal: spacing.gutter } : null;
  const column = { width: '100%' as const, maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' as const };
  return (
    <SafeAreaView testID={testID} edges={edges} style={[styles.root, { backgroundColor: colors.background }]}>
      <Grain />
      {scroll ? (
        <ScrollView
          contentContainerStyle={[pad, column, styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, pad, column, contentStyle]}>{children}</View>
      )}
      {footer ? (
        <View style={[styles.footer, pad, column]}>
          {scroll ? <FooterFade color={colors.background} /> : null}
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },
  footer: { paddingTop: spacing.md, paddingBottom: spacing.lg },
  fade: { position: 'absolute', left: 0, right: 0, top: -32, height: 32 },
});
