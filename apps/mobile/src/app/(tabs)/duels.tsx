import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { Button, Card, Screen, Text } from '@/components/ui';
import { createAndPlayDuel } from '@/features/duels/actions';
import { normaliseDuelCode, useDuels, type LocalDuel } from '@/state/duels';
import { fonts, radii, spacing, useTheme } from '@/theme';

function status(d: LocalDuel): { label: string; tone: 'success' | 'danger' | 'muted' | 'accent' } {
  if (d.myPoints === null) return { label: 'Your turn', tone: 'accent' };
  if (!d.opponent) return { label: 'Waiting for your friend', tone: 'muted' };
  if (d.myPoints === d.opponent.points) return { label: 'Draw', tone: 'muted' };
  return d.myPoints > d.opponent.points ? { label: `You won vs ${d.opponent.name}`, tone: 'success' } : { label: `${d.opponent.name} won`, tone: 'danger' };
}

export default function Duels() {
  const { colors } = useTheme();
  const duels = useDuels((s) => s.duels);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const parsed = normaliseDuelCode(code);

  const create = async () => {
    setBusy(true);
    await createAndPlayDuel();
    setBusy(false);
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="title">Duels</Text>
        <Text tone="muted">Same three puzzles for both of you. Highest score wins.</Text>
      </View>

      <View style={styles.stack}>
        <Card raised style={styles.gap}>
          <View style={styles.row}>
            <View style={[styles.icon, { backgroundColor: colors.surfaceSunken }]}>
              <Icon name="duel" size={26} color={colors.primaryText} />
            </View>
            <View style={styles.flex}>
              <Text variant="subheading" weight="semibold">
                Challenge a friend
              </Text>
              <Text variant="caption" tone="muted">
                Play your run, then send the link. Duels stay open for 7 days.
              </Text>
            </View>
          </View>
          <Button label="New duel" icon="userPlus" size="lg" fullWidth loading={busy} onPress={create} testID="duel-new" />
        </Card>

        <Card style={styles.gap}>
          <Text weight="semibold">Got a code?</Text>
          <View style={styles.row}>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="e.g. K7PX2MQA"
              placeholderTextColor={colors.textFaint}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={80}
              accessibilityLabel="Duel code or link"
              style={[styles.input, { color: colors.text, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSunken, fontFamily: fonts.bodySemibold }]}
            />
            <Button label="Open" disabled={!parsed} onPress={() => parsed && router.push(`/duel/${parsed}`)} />
          </View>
        </Card>

        {duels.length > 0 ? (
          <View style={styles.gap}>
            <Text variant="subheading" weight="semibold">
              Your duels
            </Text>
            {duels.map((d) => {
              const s = status(d);
              return (
                <Card key={d.id} onPress={() => router.push(`/duel/${d.id}`)} accessibilityLabel={`Duel ${d.id}, ${s.label}`}>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Text weight="semibold" tabular>
                        {d.id.toUpperCase()}
                      </Text>
                      <Text variant="caption" tone={s.tone}>
                        {s.label}
                      </Text>
                    </View>
                    {d.myPoints !== null ? (
                      <Text tabular weight="semibold">
                        {d.myPoints.toLocaleString()}
                      </Text>
                    ) : null}
                    <Icon name="chevronRight" size={18} color={colors.textFaint} />
                  </View>
                </Card>
              );
            })}
          </View>
        ) : (
          <Text tone="faint" align="center">
            No duels yet. Start one — it’s more fun with a rival.
          </Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingVertical: spacing.md, gap: 2 },
  stack: { gap: spacing.lg },
  gap: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minHeight: 48, borderWidth: 1.5, borderRadius: radii.md, paddingHorizontal: spacing.md, fontSize: 16, letterSpacing: 1 },
});
