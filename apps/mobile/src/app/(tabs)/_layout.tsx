import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Icon, type IconName } from '@/components/icons/Icon';
import { useT, type TKey } from '@/i18n';
import { fonts, radii, SLANT_DEG, useTheme } from '@/theme';

const TABS: { name: string; title: TKey; icon: IconName }[] = [
  { name: 'index', title: 'tabs.climb', icon: 'badge' },
  { name: 'daily', title: 'tabs.daily', icon: 'daily' },
  { name: 'duels', title: 'tabs.duels', icon: 'duel' },
  { name: 'profile', title: 'tabs.you', icon: 'profile' },
];

/** The active tab sits on a slanted volt plate; inactive tabs are quiet chalk outlines. */
function TabIcon({ name, focused, color }: { name: IconName; focused: boolean; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.icon}>
      {focused ? <View style={[styles.plate, { backgroundColor: colors.primary }]} /> : null}
      {/* Lifted above the plate: a transformed absolute sibling would otherwise paint over it on web. */}
      <View style={styles.glyph}>
        <Icon name={name} size={22} color={focused ? colors.onPrimary : color} strokeWidth={focused ? 2.3 : 1.8} />
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  const t = useT();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: colors.surface, borderTopWidth: 0, height: 68, paddingTop: 8 },
        tabBarLabelStyle: styles.label,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.title),
            tabBarAccessibilityLabel: t(tab.title),
            tabBarIcon: ({ color, focused }) => <TabIcon name={tab.icon} focused={focused} color={String(color)} />,
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: { width: 52, height: 30, alignItems: 'center', justifyContent: 'center' },
  plate: { ...StyleSheet.absoluteFill, borderRadius: radii.xs, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  glyph: { zIndex: 1 },
  label: { fontFamily: fonts.monoBold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
});
