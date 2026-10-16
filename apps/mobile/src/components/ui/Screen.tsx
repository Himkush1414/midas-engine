import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
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

export function Screen({ children, scroll, edges = ['top', 'left', 'right'], padded = true, contentStyle, footer, testID }: ScreenProps) {
  const { colors } = useTheme();
  const pad = padded ? { paddingHorizontal: spacing.lg } : null;
  return (
    <SafeAreaView testID={testID} edges={edges} style={[styles.root, { backgroundColor: colors.background }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[pad, styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, pad, contentStyle]}>{children}</View>
      )}
      {footer ? <View style={[styles.footer, pad]}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },
  footer: { paddingTop: spacing.md, paddingBottom: spacing.lg },
});
