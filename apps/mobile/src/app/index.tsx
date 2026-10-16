import { TIER_LABELS, tierInfo } from '@mindtier/core';
import { StyleSheet, Text, View } from 'react-native';

export default function Home() {
  const info = tierInfo({ rating: 1300, rd: 350 });
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Mindtier</Text>
      <Text style={styles.sub}>
        {info.label} · {Object.keys(TIER_LABELS).length} tiers
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0D1A' },
  title: { color: '#FFFFFF', fontSize: 32, fontWeight: '700' },
  sub: { color: '#9AA3C7', marginTop: 8 },
});
