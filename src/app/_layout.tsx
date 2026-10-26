import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Catálogo de Filmes' }} />
      <Stack.Screen name="cadastro" options={{ title: 'Cadastro de Filmes' }} />
      <Stack.Screen name="consulta" options={{ title: 'Consulta de Filmes' }} />
    </Stack>
  );
}
