import { StyleSheet, View } from 'react-native';
import { spacing, useTheme } from '@/theme';
import { Icon } from './icons/Icon';
import { Button, Screen, Text } from './ui';

/** Friendly fallback for unexpected render errors. Progress is stored locally and is not lost. */
export function ErrorScreen({ error, onRetry }: { error: Error; onRetry(): void }) {
  const { colors } = useTheme();
  return (
    <Screen>
      <View style={styles.center}>
        <View style={[styles.icon, { backgroundColor: colors.surfaceRaised }]}>
          <Icon name="refresh" size={36} color={colors.primaryText} />
        </View>
        <Text variant="title" align="center">
          Something went sideways
        </Text>
        <Text tone="muted" align="center">
          Your ranks and progress are safe. Try again — if it keeps happening, restart the app.
        </Text>
        {__DEV__ ? (
          <Text variant="caption" tone="faint" align="center" selectable>
            {error.message}
          </Text>
        ) : null}
        <Button label="Try again" icon="refresh" onPress={onRetry} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingHorizontal: spacing.lg },
  icon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
});
