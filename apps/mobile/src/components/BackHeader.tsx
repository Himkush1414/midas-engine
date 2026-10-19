import { router } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useT } from '@/i18n';
import { spacing, type, useTheme } from '@/theme';
import { Icon } from './icons/Icon';
import { fitDisplaySize, MAX_CONTENT_WIDTH, PressableScale, Text } from './ui';

export function BackHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  const t = useT();
  const { width } = useWindowDimensions();
  // Long localized titles (RÜCKBLICK: SAISON 2) shrink to fit between the two 48 pt side slots instead of truncating.
  const size = fitDisplaySize(title, Math.min(width, MAX_CONTENT_WIDTH) - spacing.gutter * 2 - 96, type.heading[0], 20);
  return (
    <View style={styles.row}>
      <PressableScale
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        accessibilityLabel={t('common.back')}
        style={styles.back}
      >
        <Icon name="back" size={24} color={colors.text} />
      </PressableScale>
      <Text variant="heading" accessibilityRole="header" style={[styles.title, { fontSize: size, lineHeight: Math.max(size, type.heading[1]) }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.back} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', height: 56, marginBottom: spacing.sm },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center' },
});
