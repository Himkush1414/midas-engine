import { Tabs } from 'expo-router';
import { Icon, type IconName } from '@/components/icons/Icon';
import { useT, type TKey } from '@/i18n';
import { fonts, useTheme } from '@/theme';

const TABS: { name: string; title: TKey; icon: IconName }[] = [
  { name: 'index', title: 'tabs.climb', icon: 'badge' },
  { name: 'daily', title: 'tabs.daily', icon: 'daily' },
  { name: 'duels', title: 'tabs.duels', icon: 'duel' },
  { name: 'profile', title: 'tabs.you', icon: 'profile' },
];

export default function TabLayout() {
  const { colors } = useTheme();
  const t = useT();
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
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.title),
            tabBarAccessibilityLabel: t(tab.title),
            tabBarIcon: ({ color, focused }) => <Icon name={tab.icon} size={24} color={color} strokeWidth={focused ? 2.2 : 1.8} />,
          }}
        />
      ))}
    </Tabs>
  );
}
