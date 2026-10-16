import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useT } from '@/i18n';
import { spacing, useTheme } from '@/theme';
import { Icon } from './icons/Icon';
import { PressableScale, Text } from './ui';

export function BackHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  const t = useT();
  return (
    <View style={styles.row}>
      <PressableScale
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        accessibilityLabel={t('common.back')}
        style={styles.back}
      >
        <Icon name="back" size={24} color={colors.text} />
      </PressableScale>
      <Text variant="heading" accessibilityRole="header" style={styles.title} numberOfLines={1}>
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
