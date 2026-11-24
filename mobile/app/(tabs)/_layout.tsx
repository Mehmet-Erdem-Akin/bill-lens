import { Tabs } from 'expo-router';
import { ChartColumn, Home, PiggyBank, Settings, Package } from 'lucide-react-native';
import { Platform } from 'react-native';

import { tokens } from '@/theme/tokens';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.colors.primary,
        tabBarInactiveTintColor: tokens.colors.textMuted,
        tabBarStyle: {
          height: tokens.layout.tabBarContentHeight + (Platform.OS === 'ios' ? 18 : 8),
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 22 : 10,
          backgroundColor: tokens.colors.surface,
          borderTopColor: tokens.colors.border,
        },
        tabBarLabelStyle: {
          fontFamily: tokens.fontFamily.medium,
          fontSize: tokens.fontSize.tab,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Harcamalar',
          tabBarIcon: ({ color, size }) => <ChartColumn color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Ürünler',
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="savings"
        options={{
          title: 'Tasarruf',
          tabBarIcon: ({ color, size }) => <PiggyBank color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
