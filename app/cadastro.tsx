import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { cadastrarFilme, IDADES } from '../services/filmes';

const cores = {
  fundo: '#10110f', cartao: '#191a17', borda: '#30312c', texto: '#f3f1e9',
  suave: '#92938a', destaque: '#d9f36a',
};

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [ano, setAno] = useState('');
  const [idade, setIdade] = useState('');
  const [genero, setGenero] = useState('');
  const [diretor, setDiretor] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (salvando) return;
    const anoNumero = Number(ano);
    const anoMaximo = new Date().getFullYear() + 5;
    if (!nome.trim() || !genero.trim() || !diretor.trim()) {
      Alert.alert('Preencha os campos', 'Informe o nome, o gênero e o diretor do filme.');
      return;
    }
    if (!/^\d{4}$/.test(ano) || anoNumero < 1888 || anoNumero > anoMaximo) {
      Alert.alert('Ano inválido', `Informe um ano entre 1888 e ${anoMaximo}.`);
      return;
    }
    if (!idade) {
      Alert.alert('Idade indicativa', 'Selecione a classificação do filme.');
      return;
    }

    setSalvando(true);
    try {
      await cadastrarFilme({ nome: nome.trim(), ano: anoNumero, idade, genero: genero.trim(), diretor: diretor.trim() });
      Alert.alert('Filme cadastrado', 'O título já está disponível no catálogo.', [
        { text: 'Ver catálogo', onPress: () => router.replace('/') },
        { text: 'Cadastrar outro', style: 'cancel', onPress: limparFormulario },
      ]);
      setNome(''); setAno(''); setIdade(''); setGenero(''); setDiretor('');
    } catch (falha) {
      Alert.alert('Não foi possível salvar', falha instanceof Error ? falha.message : String(falha));
    } finally {
      setSalvando(false);
    }
  }

  function limparFormulario() {
    setNome(''); setAno(''); setIdade(''); setGenero(''); setDiretor('');
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.cabecalho}>
        <Pressable style={styles.voltar} onPress={() => router.back()}><Text style={styles.voltarTexto}>‹</Text></Pressable>
        <View><Text style={styles.chamada}>SUA COLEÇÃO, EM CENA</Text><Text style={styles.titulo}>Novo filme<Text style={styles.ponto}>.</Text></Text></View>
      </View>
      <ScrollView contentContainerStyle={styles.formulario} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitulo}>Adicione um novo título ao catálogo.</Text>

        <Text style={styles.rotulo}>NOME DO FILME</Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex.: O Poderoso Chefão" placeholderTextColor={cores.suave} returnKeyType="next" />

        <Text style={styles.rotulo}>DIRETOR</Text>
        <TextInput style={styles.input} value={diretor} onChangeText={setDiretor} placeholder="Ex.: Francis Ford Coppola" placeholderTextColor={cores.suave} returnKeyType="next" />

        <Text style={styles.rotulo}>ANO DE LANÇAMENTO</Text>
        <TextInput style={styles.input} value={ano} onChangeText={(valor) => setAno(valor.replace(/\D/g, '').slice(0, 4))} placeholder="Ex.: 1972" placeholderTextColor={cores.suave} keyboardType="numeric" maxLength={4} />

        <Text style={styles.rotulo}>IDADE INDICATIVA</Text>
        <View style={styles.chips}>
          {IDADES.map((opcao) => (
            <Pressable key={opcao} onPress={() => setIdade(opcao)} style={[styles.chip, idade === opcao && styles.chipAtivo]}>
              <Text style={[styles.chipTexto, idade === opcao && styles.chipTextoAtivo]}>{opcao === 'Livre' ? 'Livre' : `${opcao} anos`}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.rotulo}>GÊNERO</Text>
        <TextInput style={styles.input} value={genero} onChangeText={setGenero} placeholder="Ex.: Drama" placeholderTextColor={cores.suave} returnKeyType="done" />

        <Pressable style={[styles.botao, salvando && styles.desativado]} onPress={salvar} disabled={salvando}>
          {salvando ? <ActivityIndicator color={cores.fundo} /> : <Text style={styles.botaoTexto}>SALVAR NO CATÁLOGO  ↗</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 17, borderBottomWidth: 1, borderBottomColor: cores.borda },
  voltar: { width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.cartao }, voltarTexto: { color: cores.texto, fontSize: 29, lineHeight: 31 },
  chamada: { color: cores.destaque, fontSize: 8, fontWeight: '700', letterSpacing: 1.6, marginBottom: 3 }, titulo: { color: cores.texto, fontSize: 22, fontWeight: '800', letterSpacing: -.5 }, ponto: { color: cores.destaque },
  formulario: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36 }, subtitulo: { color: cores.suave, fontSize: 12, marginBottom: 20 },
  rotulo: { color: cores.suave, fontSize: 9, letterSpacing: 1.15, fontWeight: '700', marginBottom: 8, marginTop: 16 },
  input: { height: 48, paddingHorizontal: 13, borderRadius: 11, borderWidth: 1, borderColor: cores.borda, backgroundColor: cores.cartao, color: cores.texto, fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { borderWidth: 1, borderColor: cores.borda, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: cores.cartao }, chipAtivo: { borderColor: cores.destaque, backgroundColor: '#292d22' }, chipTexto: { color: cores.suave, fontSize: 11 }, chipTextoAtivo: { color: cores.destaque, fontWeight: '700' },
  botao: { minHeight: 50, backgroundColor: cores.destaque, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 27 }, botaoTexto: { color: cores.fundo, fontSize: 10, fontWeight: '800', letterSpacing: .8 }, desativado: { opacity: .6 },
});
