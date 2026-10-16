import { DOMAINS, overallRating, tierInfo, type DomainRatings } from '@mindtier/core';
import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { DomainBadge, TierBadge } from '@/components/tier';
import { Text } from '@/components/ui';
import { useT } from '@/i18n';
import { domainLabel, tierLabel } from '@/i18n/labels';
import { WEB_URL } from '@/lib/links';
import { ThemeProvider } from '@/theme';

export const CARD_WIDTH = 360;
export const CARD_HEIGHT = 450; // 4:5, the format social feeds crop to least

/**
 * The image people share. Always rendered in the dark brand theme so it looks
 * the same for everyone, whatever their app theme.
 */
export const TierShareCard = forwardRef<View, { ratings: DomainRatings }>(function TierShareCard({ ratings }, ref) {
  const t = useT();
  const overall = tierInfo(overallRating(ratings));
  const host = WEB_URL.replace(/^https?:\/\//, '');
  return (
    <ThemeProvider preference="dark">
      <View ref={ref} collapsable={false} style={styles.card} testID="share-card">
        <Svg style={StyleSheet.absoluteFill} width={CARD_WIDTH} height={CARD_HEIGHT}>
          <Defs>
            <RadialGradient id="bg" cx="50%" cy="0%" r="95%">
              <Stop offset="0" stopColor="#2A2470" />
              <Stop offset="0.6" stopColor="#121734" />
              <Stop offset="1" stopColor="#0A0D1A" />
            </RadialGradient>
          </Defs>
          <Rect width={CARD_WIDTH} height={CARD_HEIGHT} fill="url(#bg)" />
        </Svg>
        <Text variant="caption" weight="semibold" style={styles.eyebrow}>
          {t('share.cardTitle')}
        </Text>
        {/* Wrapped so it stacks above the absolutely positioned background on every platform. */}
        <View>
          <TierBadge info={overall} size={120} showProvisional={false} />
        </View>
        <Text variant="title" align="center">
          {tierLabel(t, overall)}
        </Text>
        <View style={styles.rows}>
          {DOMAINS.map((d) => {
            const info = tierInfo(ratings[d]);
            return (
              <View key={d} style={styles.row}>
                <DomainBadge domain={d} size={26} />
                <Text variant="label" style={styles.flex}>
                  {domainLabel(t, d)}
                </Text>
                <Text variant="label" tone="muted">
                  {tierLabel(t, info)}
                </Text>
              </View>
            );
          })}
        </View>
        <Text variant="caption" tone="muted" align="center">
          {t('share.cardFooter', { host })}
        </Text>
      </View>
    </ThemeProvider>
  );
});

const styles = StyleSheet.create({
  card: { width: CARD_WIDTH, height: CARD_HEIGHT, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 22, paddingHorizontal: 26, overflow: 'hidden', backgroundColor: '#0A0D1A' },
  eyebrow: { color: '#A996FF', letterSpacing: 2 },
  rows: { alignSelf: 'stretch', gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
});
