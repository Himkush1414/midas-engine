import { Tabs } from 'expo-router';
import { Icon, type IconName } from '@/components/icons/Icon';
import { fonts, useTheme } from '@/theme';

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Climb', icon: 'badge' },
  { name: 'daily', title: 'Daily', icon: 'daily' },
  { name: 'duels', title: 'Duels', icon: 'duel' },
  { name: 'profile', title: 'You', icon: 'profile' },
];

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryText,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 64, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: fonts.bodySemibold, fontSize: 12 },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarAccessibilityLabel: t.title,
            tabBarIcon: ({ color, focused }) => <Icon name={t.icon} size={24} color={color} strokeWidth={focused ? 2.2 : 1.8} />,
          }}
        />
      ))}
    </Tabs>
  );
}
