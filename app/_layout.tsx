import { Tabs } from 'expo-router';
import { Text } from 'react-native';

const fundo = '#10110f';
const suave = '#92938a';
const destaque = '#d9f36a';

export default function LayoutPrincipal() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: destaque,
        tabBarInactiveTintColor: suave,
        tabBarStyle: {
          backgroundColor: fundo,
          borderTopColor: '#30312c',
          height: 64,
          paddingTop: 7,
          paddingBottom: 5,
        },
        tabBarLabelStyle: { fontSize: 8, letterSpacing: 0.8, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'CATÁLOGO',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>▦</Text>,
        }}
      />
      <Tabs.Screen
        name="cadastro"
        options={{
          title: 'ADICIONAR',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>＋</Text>,
        }}
      />
    </Tabs>
  );
}
