import { StyleSheet, View } from 'react-native';
import { useT } from '@/i18n';
import { spacing, useTheme } from '@/theme';
import { Icon } from './icons/Icon';
import { Button, Screen, Text } from './ui';

/** Friendly fallback for unexpected render errors. Progress is stored locally and is not lost. */
export function ErrorScreen({ error, onRetry }: { error: Error; onRetry(): void }) {
  const { colors } = useTheme();
  const t = useT();
  return (
    <Screen>
      <View style={styles.center}>
        <View style={[styles.icon, { backgroundColor: colors.surfaceRaised }]}>
          <Icon name="refresh" size={36} color={colors.primaryText} />
        </View>
        <Text variant="title" align="center">
          {t('error.title')}
        </Text>
        <Text tone="muted" align="center">
          {t('error.body')}
        </Text>
        {__DEV__ ? (
          <Text variant="caption" tone="faint" align="center" selectable>
            {error.message}
          </Text>
        ) : null}
        <Button label={t('common.tryAgain')} icon="refresh" onPress={onRetry} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingHorizontal: spacing.lg },
  icon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
});
