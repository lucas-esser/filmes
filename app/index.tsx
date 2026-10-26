import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { excluirFilme, IDADES, observarFilmes, type Filme } from '../services/filmes';

const CAMPOS = ['Todos', 'Nome', 'Ano', 'Gênero', 'Diretor'] as const;
type Campo = (typeof CAMPOS)[number];
const cores = {
  fundo: '#10110f', cartao: '#191a17', borda: '#30312c', texto: '#f3f1e9',
  suave: '#92938a', destaque: '#d9f36a', perigo: '#ff766c',
};

function Chip({ texto, ativo, aoPressionar }: { texto: string; ativo: boolean; aoPressionar: () => void }) {
  return (
    <Pressable onPress={aoPressionar} style={[styles.chip, ativo && styles.chipAtivo]}>
      <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{texto}</Text>
    </Pressable>
  );
}

export default function Consulta() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [campo, setCampo] = useState<Campo>('Todos');
  const [idade, setIdade] = useState('Todas');

  useEffect(() => observarFilmes(
    (lista) => { setFilmes(lista); setErro(''); setCarregando(false); },
    (falha) => { setErro(falha.message); setCarregando(false); },
  ), []);

  const filmesFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    return filmes.filter((filme) => {
      if (idade !== 'Todas' && filme.idade !== idade) return false;
      if (!termo) return true;
      const valores: Record<Campo, string> = {
        Todos: `${filme.nome} ${filme.ano} ${filme.genero} ${filme.diretor}`,
        Nome: filme.nome,
        Ano: String(filme.ano),
        Gênero: filme.genero,
        Diretor: filme.diretor,
      };
      return valores[campo].toLocaleLowerCase('pt-BR').includes(termo);
    });
  }, [filmes, busca, campo, idade]);

  function confirmarExclusao(filme: Filme) {
    Alert.alert('Excluir filme?', `“${filme.nome}” será removido do catálogo.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try { await excluirFilme(filme.id); }
          catch (falha) { Alert.alert('Não foi possível excluir', falha instanceof Error ? falha.message : String(falha)); }
        },
      },
    ]);
  }

  function renderItem({ item }: { item: Filme }) {
    return (
      <View style={styles.card}>
        <View style={styles.poster}><Text style={styles.posterIcon}>▶</Text><Text style={styles.posterYear}>{item.ano}</Text></View>
        <View style={styles.cardInfo}>
          <Text style={styles.nome} numberOfLines={2}>{item.nome}</Text>
          <Text style={styles.detalhe} numberOfLines={1}>Direção: {item.diretor}</Text>
          <View style={styles.tags}>
            <Text style={styles.genero}>{item.genero}</Text>
            <Text style={styles.idade}>{item.idade === 'Livre' ? 'LIVRE' : `${item.idade} ANOS`}</Text>
          </View>
        </View>
        <Pressable style={styles.excluir} onPress={() => confirmarExclusao(item)} accessibilityLabel={`Excluir ${item.nome}`}>
          <Text style={styles.excluirTexto}>×</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <View style={styles.marca}><Text style={styles.marcaLetra}>C</Text></View>
        <Text style={styles.marcaNome}>CINE<Text style={styles.marcaDestaque}>VAULT</Text></Text>
        <View style={styles.online}><View style={styles.ponto} /><Text style={styles.onlineTexto}>FIREBASE</Text></View>
      </View>
      <View style={styles.tituloArea}>
        <Text style={styles.chamada}>SUA COLEÇÃO, EM CENA</Text>
        <Text style={styles.titulo}>Filmes<Text style={styles.pontoTitulo}>.</Text></Text>
        <Text style={styles.subtitulo}>Um lugar para guardar grandes histórias.</Text>
      </View>

      <View style={styles.filtros}>
        <View style={styles.buscaBox}>
          <Text style={styles.lupa}>⌕</Text>
          <TextInput
            style={styles.busca}
            placeholder={campo === 'Todos' ? 'Buscar título, diretor...' : `Buscar por ${campo.toLowerCase()}...`}
            placeholderTextColor={cores.suave}
            value={busca}
            onChangeText={setBusca}
            keyboardType={campo === 'Ano' ? 'numeric' : 'default'}
          />
        </View>
        <Link href="/cadastro" asChild>
          <Pressable style={styles.adicionar}><Text style={styles.adicionarTexto}>＋</Text></Pressable>
        </Link>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.linhaChips}>
        {CAMPOS.map((opcao) => <Chip key={opcao} texto={opcao} ativo={campo === opcao} aoPressionar={() => setCampo(opcao)} />)}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.linhaChips}>
        {['Todas', ...IDADES].map((opcao) => <Chip key={opcao} texto={opcao} ativo={idade === opcao} aoPressionar={() => setIdade(opcao)} />)}
      </ScrollView>

      <View style={styles.contagemLinha}>
        <Text style={styles.contagemTitulo}>CATÁLOGO</Text>
        <Text style={styles.contagem}>{filmesFiltrados.length} DE {filmes.length} FILMES</Text>
      </View>

      {carregando ? (
        <View style={styles.centro}><ActivityIndicator color={cores.destaque} /><Text style={styles.vazio}>Carregando catálogo…</Text></View>
      ) : erro ? (
        <View style={styles.aviso}><Text style={styles.avisoTitulo}>Não foi possível conectar</Text><Text style={styles.avisoTexto}>{erro}</Text></View>
      ) : (
        <FlatList
          data={filmesFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={filmesFiltrados.length ? styles.lista : styles.listaVazia}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={(
            <View style={styles.vazioBox}>
              <Text style={styles.vazioIcone}>▧</Text>
              <Text style={styles.vazioTitulo}>{filmes.length ? 'Nenhum filme encontrado' : 'Sua próxima sessão começa aqui'}</Text>
              <Text style={styles.vazioTexto}>{filmes.length ? 'Ajuste os filtros e tente novamente.' : 'Adicione o primeiro filme para montar seu catálogo.'}</Text>
              {!filmes.length && (
                <Link href="/cadastro" asChild>
                  <Pressable style={styles.atalho}><Text style={styles.atalhoTexto}>＋  ADICIONAR FILME</Text></Pressable>
                </Link>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo, paddingHorizontal: 20 },
  cabecalho: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 9, borderBottomWidth: 1, borderBottomColor: cores.borda },
  marca: { width: 29, height: 29, borderRadius: 9, backgroundColor: cores.destaque, alignItems: 'center', justifyContent: 'center' },
  marcaLetra: { color: cores.fundo, fontSize: 18, fontWeight: '900' }, marcaNome: { color: cores.texto, fontSize: 15, fontWeight: '800', letterSpacing: 1.5 }, marcaDestaque: { color: cores.destaque },
  online: { marginLeft: 'auto', flexDirection: 'row', gap: 7, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, backgroundColor: cores.cartao, borderRadius: 20 },
  ponto: { width: 6, height: 6, backgroundColor: cores.destaque, borderRadius: 4 }, onlineTexto: { color: cores.suave, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  tituloArea: { marginTop: 24, marginBottom: 18 }, chamada: { fontSize: 9, letterSpacing: 2, color: cores.destaque, fontWeight: '700', marginBottom: 7 },
  titulo: { color: cores.texto, fontSize: 32, fontWeight: '800', letterSpacing: -1 }, pontoTitulo: { color: cores.destaque }, subtitulo: { color: cores.suave, fontSize: 12, marginTop: 4 },
  filtros: { flexDirection: 'row', gap: 9 }, buscaBox: { flex: 1, height: 46, flexDirection: 'row', alignItems: 'center', backgroundColor: cores.cartao, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: cores.borda },
  lupa: { color: cores.suave, fontSize: 22, marginRight: 7 }, busca: { flex: 1, color: cores.texto, fontSize: 12 }, adicionar: { width: 46, height: 46, borderRadius: 12, backgroundColor: cores.destaque, alignItems: 'center', justifyContent: 'center' }, adicionarTexto: { color: cores.fundo, fontSize: 25 },
  linhaChips: { gap: 7, paddingTop: 11, paddingBottom: 1 }, chip: { borderWidth: 1, borderColor: cores.borda, borderRadius: 18, paddingHorizontal: 11, paddingVertical: 7, backgroundColor: cores.cartao }, chipAtivo: { backgroundColor: cores.destaque, borderColor: cores.destaque }, chipTexto: { color: cores.suave, fontSize: 10 }, chipTextoAtivo: { color: cores.fundo, fontWeight: '700' },
  contagemLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 19, marginBottom: 10 }, contagemTitulo: { color: cores.texto, fontSize: 10, letterSpacing: 1.3, fontWeight: '700' }, contagem: { color: cores.suave, fontSize: 8, letterSpacing: 1 },
  lista: { paddingBottom: 20, gap: 9 }, card: { minHeight: 96, padding: 10, backgroundColor: cores.cartao, borderWidth: 1, borderColor: cores.borda, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  poster: { width: 54, height: 72, borderRadius: 9, backgroundColor: '#292d22', alignItems: 'center', justifyContent: 'center' }, posterIcon: { color: cores.destaque, fontSize: 19 }, posterYear: { position: 'absolute', bottom: 6, color: '#c2c5b5', fontSize: 8, fontWeight: '700' },
  cardInfo: { flex: 1, gap: 5 }, nome: { color: cores.texto, fontSize: 14, fontWeight: '700' }, detalhe: { color: cores.suave, fontSize: 10 }, tags: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 1 }, genero: { color: cores.destaque, fontSize: 9, backgroundColor: '#292d22', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4, overflow: 'hidden' }, idade: { color: cores.suave, fontSize: 8, letterSpacing: .7 }, excluir: { alignSelf: 'flex-start', width: 24, alignItems: 'center' }, excluirTexto: { color: cores.suave, fontSize: 24, lineHeight: 24 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }, vazio: { color: cores.suave, fontSize: 12 }, aviso: { padding: 16, backgroundColor: cores.cartao, borderRadius: 13, borderColor: cores.borda, borderWidth: 1 }, avisoTitulo: { color: cores.destaque, fontSize: 14, fontWeight: '700', marginBottom: 6 }, avisoTexto: { color: cores.suave, fontSize: 11, lineHeight: 18 },
  listaVazia: { flexGrow: 1 }, vazioBox: { flex: 1, minHeight: 235, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 }, vazioIcone: { color: cores.destaque, fontSize: 36, marginBottom: 13 }, vazioTitulo: { color: cores.texto, fontSize: 15, fontWeight: '700', textAlign: 'center' }, vazioTexto: { color: cores.suave, fontSize: 11, lineHeight: 18, textAlign: 'center', marginTop: 6, maxWidth: 240 }, atalho: { marginTop: 17, padding: 10, borderWidth: 1, borderColor: cores.borda, borderRadius: 8 }, atalhoTexto: { color: cores.destaque, fontSize: 10, letterSpacing: .7, fontWeight: '700' },
});
