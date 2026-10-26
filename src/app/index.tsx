import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Menu inicial: leva para o cadastro ou para a consulta
export default function Menu() {
  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Catálogo de Filmes</Text>

      <Pressable style={estilos.botao} onPress={() => router.push('/cadastro')}>
        <Text style={estilos.textoBotao}>Cadastro de Filmes</Text>
      </Pressable>

      <Pressable style={estilos.botao} onPress={() => router.push('/consulta')}>
        <Text style={estilos.textoBotao}>Consulta de Filmes</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  botao: {
    backgroundColor: '#005b96',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
