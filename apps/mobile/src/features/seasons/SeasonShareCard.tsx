import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { DomainBadge, TierBadge } from '@/components/tier';
import { Text } from '@/components/ui';
import { CARD_HEIGHT, CARD_WIDTH } from '@/features/share/TierShareCard';
import { useLanguage, useT } from '@/i18n';
import { domainLabel, tierLabel } from '@/i18n/labels';
import { WEB_URL } from '@/lib/links';
import { ThemeProvider } from '@/theme';
import { seasonMonth, seasonName, type SeasonRecap } from './season';

/** Shareable season recap: peak tier and effort, no rating numbers. Always in the dark brand theme. */
export const SeasonShareCard = forwardRef<View, { recap: SeasonRecap }>(function SeasonShareCard({ recap }, ref) {
  const t = useT();
  const language = useLanguage();
  const host = WEB_URL.replace(/^https?:\/\//, '');
  const eyebrow = [seasonName(t, recap.season), seasonMonth(recap.season, language)].filter(Boolean).join(' · ');
  return (
    <ThemeProvider preference="dark">
      <View ref={ref} collapsable={false} style={styles.card} testID="season-share-card">
        <Svg style={StyleSheet.absoluteFill} width={CARD_WIDTH} height={CARD_HEIGHT}>
          <Defs>
            <RadialGradient id="season-bg" cx="50%" cy="0%" r="95%">
              <Stop offset="0" stopColor="#3A2470" />
              <Stop offset="0.6" stopColor="#121734" />
              <Stop offset="1" stopColor="#0A0D1A" />
            </RadialGradient>
          </Defs>
          <Rect width={CARD_WIDTH} height={CARD_HEIGHT} fill="url(#season-bg)" />
        </Svg>
        <Text variant="caption" weight="semibold" style={styles.eyebrow}>
          {eyebrow.toLocaleUpperCase(language)}
        </Text>
        {/* Wrapped so it stacks above the absolutely positioned background on every platform. */}
        <View>
          <TierBadge info={recap.peak} size={120} showProvisional={false} />
        </View>
        <Text variant="title" align="center">
          {t('season.peak', { label: tierLabel(t, recap.peak) })}
        </Text>
        <View style={styles.stats}>
          {[
            { label: t('season.sessions'), value: recap.sessions },
            { label: t('season.games'), value: recap.games },
          ].map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text variant="heading" tabular>
                {s.value}
              </Text>
              <Text variant="caption" tone="muted">
                {s.label}
              </Text>
            </View>
          ))}
        </View>
        {recap.best ? (
          <View style={styles.best}>
            <DomainBadge domain={recap.best.domain} size={26} />
            <Text variant="label" tone="muted">
              {t('season.bestSkill')}
            </Text>
            <Text variant="label">{domainLabel(t, recap.best.domain)}</Text>
          </View>
        ) : null}
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
  stats: { flexDirection: 'row', gap: 40 },
  stat: { alignItems: 'center' },
  best: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
