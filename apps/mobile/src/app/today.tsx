import { tierInfo } from '@mindtier/core';
import { useEffect } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { TierBadge } from '@/components/tier';
import { Button, Card, Text } from '@/components/ui';
import { DailyScreen } from '@/features/daily/DailyScreen';
import { useT } from '@/i18n';
import { track } from '@/lib/analytics';
import { links } from '@/lib/links';
import { spacing } from '@/theme';

/**
 * The web build's only screen (served at /play on the website): today's Daily
 * Challenge for anyone with a browser, then an invitation to the app.
 */
export default function Today() {
  const t = useT();

  useEffect(() => {
    track('web_daily_viewed');
  }, []);

  const getApp = () => {
    track('web_get_app_tapped');
    void Linking.openURL(links.playStore);
  };

  const header = (
    <View style={styles.header}>
      <Text variant="caption" tone="faint" weight="semibold" style={styles.brand}>
        MINDTIER
      </Text>
      <Text variant="title">{t('web.title')}</Text>
      <Text tone="muted">{t('web.subtitle')}</Text>
    </View>
  );

  const footer = (
    <>
      <Card raised style={styles.app}>
        <View style={styles.badges} aria-hidden>
          <TierBadge info={tierInfo({ rating: 950, rd: 0 })} size={56} showProvisional={false} />
          <TierBadge info={tierInfo({ rating: 1400, rd: 0 })} size={76} showProvisional={false} />
          <TierBadge info={tierInfo({ rating: 1850, rd: 0 })} size={56} showProvisional={false} />
        </View>
        <Text variant="heading" align="center">
          {t('web.appTitle')}
        </Text>
        <Text tone="muted" align="center">
          {t('web.appBody')}
        </Text>
        <Button label={t('web.getApp')} icon="external" size="lg" fullWidth onPress={getApp} testID="web-get-app" />
        <Text variant="caption" tone="faint" align="center">
          {t('web.iosSoon')}
        </Text>
      </Card>
      <View style={styles.legal}>
        <Text variant="caption" tone="faint" onPress={() => void Linking.openURL(links.privacy)} accessibilityRole="link">
          {t('web.privacy')}
        </Text>
        <Text variant="caption" tone="faint">
          ·
        </Text>
        <Text variant="caption" tone="faint" onPress={() => void Linking.openURL(links.terms)} accessibilityRole="link">
          {t('web.terms')}
        </Text>
      </View>
    </>
  );

  return <DailyScreen header={header} footer={footer} onNamePress={null} />;
}

const styles = StyleSheet.create({
  header: { paddingVertical: spacing.md, gap: 4 },
  brand: { letterSpacing: 2 },
  app: { gap: spacing.md, alignItems: 'stretch' },
  badges: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: spacing.sm },
  legal: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, paddingBottom: spacing.lg },
});
