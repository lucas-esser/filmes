import { router } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import { db } from '../../firebaseConfig';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [ano, setAno] = useState('');
  const [idade, setIdade] = useState('');
  const [genero, setGenero] = useState('');
  const [diretor, setDiretor] = useState('');
  const [mensagem, setMensagem] = useState('');

  // Cadastra um filme
  async function cadastrar() {
    // Verifica se todos os campos foram preenchidos
    if (!nome || !ano || !idade || !genero || !diretor) {
      setMensagem('Preencha todos os campos!');
      return;
    }

    try {
      await addDoc(collection(db, 'filmes'), {
        nome: nome,
        ano: ano,
        idade: idade,
        genero: genero,
        diretor: diretor,
      });

      setMensagem('Filme cadastrado com sucesso!');

      // Limpa os campos
      setNome('');
      setAno('');
      setIdade('');
      setGenero('');
      setDiretor('');
    } catch (erro) {
      console.log('Erro ao cadastrar filme:', erro);
      setMensagem('Erro ao cadastrar o filme.');
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <Text style={estilos.titulo}>Cadastro de Filmes</Text>

      <TextInput
        style={estilos.campo}
        placeholder="Nome do filme"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={estilos.campo}
        placeholder="Ano de lançamento"
        keyboardType="numeric"
        value={ano}
        onChangeText={setAno}
      />
      <TextInput
        style={estilos.campo}
        placeholder="Idade indicativa (Livre, 10, 12, 14, 16 ou 18)"
        value={idade}
        onChangeText={setIdade}
      />
      <TextInput
        style={estilos.campo}
        placeholder="Gênero (Ação, Comédia, Drama...)"
        value={genero}
        onChangeText={setGenero}
      />
      <TextInput
        style={estilos.campo}
        placeholder="Diretor"
        value={diretor}
        onChangeText={setDiretor}
      />

      <Pressable style={estilos.botao} onPress={cadastrar}>
        <Text style={estilos.textoBotao}>Cadastrar Filme</Text>
      </Pressable>

      <Text style={estilos.mensagem}>{mensagem}</Text>

      <Pressable style={estilos.botaoSecundario} onPress={() => router.push('/consulta')}>
        <Text style={estilos.textoBotao}>Ir para Consulta</Text>
      </Pressable>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  campo: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
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
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mensagem: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
  },
});
