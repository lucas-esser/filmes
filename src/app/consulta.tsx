import { router } from 'expo-router';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { db } from '../../firebaseConfig';
import { Filme } from '../types/Filme';

export default function Consulta() {
  const [lista, setLista] = useState<Filme[]>([]);
  const [mensagem, setMensagem] = useState('');

  // Consulta os filmes no Firebase
  async function consultar() {
    try {
      const querySnapshot = await getDocs(collection(db, 'filmes'));

      const listaFilmes: Filme[] = [];

      querySnapshot.forEach((documento) => {
        const filme = {
          id: documento.id,
          ...documento.data(),
        } as Filme;

        listaFilmes.push(filme);
      });

      setLista(listaFilmes);
      setMensagem(listaFilmes.length === 0 ? 'Nenhum filme cadastrado.' : '');
    } catch (erro) {
      console.log('Erro ao consultar filmes:', erro);
      setMensagem('Erro ao consultar os filmes.');
    }
  }

  // Exclui o filme selecionado
  async function excluir(id: string) {
    try {
      await deleteDoc(doc(db, 'filmes', id));
      await consultar();
      setMensagem('Filme excluído com sucesso!');
    } catch (erro) {
      console.log('Erro ao excluir filme:', erro);
      setMensagem('Erro ao excluir o filme.');
    }
  }

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Consulta de Filmes</Text>

      <Pressable style={estilos.botao} onPress={consultar}>
        <Text style={estilos.textoBotao}>Consultar</Text>
      </Pressable>

      <Text style={estilos.mensagem}>{mensagem}</Text>

      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={estilos.cartao}>
            <Text style={estilos.texto}>ID: {item.id}</Text>
            <Text style={estilos.texto}>Nome: {item.nome}</Text>
            <Text style={estilos.texto}>Ano de lançamento: {item.ano}</Text>
            <Text style={estilos.texto}>Idade indicativa: {item.idade}</Text>
            <Text style={estilos.texto}>Gênero: {item.genero}</Text>
            <Text style={estilos.texto}>Diretor: {item.diretor}</Text>

            <Pressable style={estilos.botaoExcluir} onPress={() => excluir(item.id)}>
              <Text style={estilos.textoBotao}>Excluir</Text>
            </Pressable>
          </View>
        )}
      />

      <Pressable style={estilos.botaoSecundario} onPress={() => router.push('/cadastro')}>
        <Text style={estilos.textoBotao}>Ir para Cadastro</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  botao: {
    backgroundColor: '#005b96',
    padding: 15,
    borderRadius: 8,
  },
  botaoSecundario: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  botaoExcluir: {
    backgroundColor: '#c0392b',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mensagem: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
  cartao: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderLeftWidth: 5,
    borderLeftColor: '#005b96',
  },
  texto: {
    fontSize: 15,
    color: '#333',
    marginBottom: 3,
  },
});
