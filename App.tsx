import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db, firebaseConfigured, firebaseConfigMessage } from './firebaseConfig';

type Movie = {
  id: string;
  name: string;
  year: number;
  rating: string;
  genre: string;
  director: string;
};

const palette = {
  bg: '#10110f', surface: '#191a17', elevated: '#22231f', line: '#30312c',
  text: '#f3f1e9', muted: '#92938a', accent: '#d9f36a', danger: '#ff766c',
};
const genres = ['Ação', 'Animação', 'Aventura', 'Comédia', 'Documentário', 'Drama', 'Fantasia', 'Ficção científica', 'Romance', 'Suspense', 'Terror', 'Outro'];
const ratings = ['L', '10', '12', '14', '16', '18'];
const emptyForm = { name: '', year: '', rating: '', genre: '', director: '' };

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default' }: {
  label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'default' | 'numeric';
}) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={palette.muted} keyboardType={keyboardType} style={styles.input} selectionColor={palette.accent} /></View>;
}

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [screen, setScreen] = useState<'catalog' | 'form'>('catalog');
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured) { setLoading(false); setError(firebaseConfigMessage); return; }
    const moviesQuery = query(collection(db, 'filmes'), orderBy('createdAt', 'desc'));
    return onSnapshot(moviesQuery, (snapshot) => {
      setMovies(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Movie)));
      setError(''); setLoading(false);
    }, (reason) => { setError(`Não foi possível carregar os filmes: ${reason.message}`); setLoading(false); });
  }, []);

  const visibleMovies = useMemo(() => movies.filter((movie) => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    const matchesTerm = !term || [movie.name, movie.director, movie.genre].some((value) => value.toLocaleLowerCase('pt-BR').includes(term));
    return matchesTerm && (filter === 'Todos' || movie.genre === filter);
  }), [movies, search, filter]);

  const update = (key: keyof typeof emptyForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const saveMovie = async () => {
    const year = Number(form.year);
    if (!form.name.trim() || !form.year.trim() || !form.rating || !form.genre || !form.director.trim()) {
      Alert.alert('Preencha os campos', 'Todos os dados do filme são obrigatórios.'); return;
    }
    if (!Number.isInteger(year) || year < 1888 || year > new Date().getFullYear() + 5) {
      Alert.alert('Ano inválido', 'Informe um ano de lançamento válido.'); return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'filmes'), {
        name: form.name.trim(), year, rating: form.rating, genre: form.genre,
        director: form.director.trim(), createdAt: serverTimestamp(),
      });
      setForm(emptyForm); setScreen('catalog');
    } catch (reason) {
      Alert.alert('Não foi possível salvar', reason instanceof Error ? reason.message : 'Tente novamente.');
    } finally { setSaving(false); }
  };

  const confirmDelete = (movie: Movie) => Alert.alert('Excluir filme?', `“${movie.name}” será removido do catálogo.`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: async () => {
      try { await deleteDoc(doc(db, 'filmes', movie.id)); }
      catch (reason) { Alert.alert('Não foi possível excluir', reason instanceof Error ? reason.message : 'Tente novamente.'); }
    } },
  ]);

  const renderMovie = ({ item }: { item: Movie }) => (
    <View style={styles.movieCard}>
      <View style={styles.poster}><Text style={styles.posterIcon}>▶</Text><Text style={styles.posterYear}>{item.year}</Text></View>
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.movieDirector} numberOfLines={1}>Dirigido por {item.director}</Text>
        <View style={styles.movieMeta}><Text style={styles.genreTag}>{item.genre}</Text><Text style={styles.ratingTag}>{item.rating === 'L' ? 'LIVRE' : `${item.rating} ANOS`}</Text></View>
      </View>
      <Pressable onPress={() => confirmDelete(item)} style={styles.deleteButton} accessibilityLabel={`Excluir ${item.name}`}><Text style={styles.deleteIcon}>×</Text></Pressable>
    </View>
  );

  return <SafeAreaView style={styles.safeArea}>
    <StatusBar style="light" />
    <View style={styles.topBar}><View style={styles.brand}><View style={styles.brandMark}><Text style={styles.brandMarkText}>C</Text></View><Text style={styles.brandName}>CINE<Text style={styles.brandAccent}>VAULT</Text></Text></View><View style={styles.online}><View style={styles.onlineDot} /><Text style={styles.onlineText}>FIREBASE</Text></View></View>
    <View style={styles.main}>
      <View style={styles.heading}><Text style={styles.eyebrow}>SUA COLEÇÃO, EM CENA</Text><Text style={styles.title}>{screen === 'catalog' ? 'Filmes' : 'Novo filme'}<Text style={styles.titleDot}>.</Text></Text><Text style={styles.subtitle}>{screen === 'catalog' ? 'Um lugar para guardar grandes histórias.' : 'Adicione um novo título à sua coleção.'}</Text></View>
      {screen === 'catalog' ? <>
        <View style={styles.toolbar}><View style={styles.searchBox}><Text style={styles.searchIcon}>⌕</Text><TextInput style={styles.searchInput} placeholder="Buscar título, diretor..." placeholderTextColor={palette.muted} value={search} onChangeText={setSearch} /></View><Pressable style={styles.addButton} onPress={() => setScreen('form')}><Text style={styles.addButtonText}>＋</Text></Pressable></View>
        {movies.length > 0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>{['Todos', ...Array.from(new Set(movies.map((movie) => movie.genre)))].map((genre) => <Pressable key={genre} onPress={() => setFilter(genre)} style={[styles.filterChip, filter === genre && styles.filterChipActive]}><Text style={[styles.filterText, filter === genre && styles.filterTextActive]}>{genre}</Text></Pressable>)}</ScrollView>}
        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>CATÁLOGO</Text><Text style={styles.count}>{String(visibleMovies.length).padStart(2, '0')} TÍTULOS</Text></View>
        {error ? <View style={styles.notice}><Text style={styles.noticeTitle}>Conecte seu Firebase</Text><Text style={styles.noticeText}>{error}</Text></View> : loading ? <View style={styles.center}><ActivityIndicator color={palette.accent} /><Text style={styles.loadingText}>Carregando catálogo…</Text></View> : <FlatList data={visibleMovies} renderItem={renderMovie} keyExtractor={(item) => item.id} contentContainerStyle={visibleMovies.length ? styles.list : styles.emptyList} showsVerticalScrollIndicator={false} ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>▧</Text><Text style={styles.emptyTitle}>{search ? 'Nada por aqui' : 'Sua próxima sessão começa aqui'}</Text><Text style={styles.emptyText}>{search ? 'Tente outro título ou diretor.' : 'Adicione o primeiro filme para montar seu catálogo.'}</Text><Pressable onPress={() => setScreen('form')} style={styles.emptyCta}><Text style={styles.emptyCtaText}>＋  ADICIONAR FILME</Text></Pressable></View>} />}
      </> : <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.formWrap}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
        <Field label="NOME DO FILME" value={form.name} onChangeText={(v) => update('name', v)} placeholder="Ex.: O Poderoso Chefão" />
        <Field label="DIRETOR" value={form.director} onChangeText={(v) => update('director', v)} placeholder="Ex.: Francis Ford Coppola" />
        <View style={styles.twoColumns}><View style={styles.column}><Field label="ANO DE LANÇAMENTO" value={form.year} onChangeText={(v) => update('year', v.replace(/\D/g, '').slice(0, 4))} placeholder="1972" keyboardType="numeric" /></View><View style={styles.column}><Text style={styles.label}>IDADE INDICATIVA</Text><Pressable onPress={() => setModalVisible(true)} style={styles.selectInput}><Text style={form.rating ? styles.selectValue : styles.placeholder}>{form.rating ? (form.rating === 'L' ? 'Livre' : `${form.rating} anos`) : 'Selecione'}</Text><Text style={styles.chevron}>⌄</Text></Pressable></View></View>
        <Text style={styles.label}>GÊNERO</Text><View style={styles.genreGrid}>{genres.map((genre) => <Pressable key={genre} onPress={() => update('genre', genre)} style={[styles.genreOption, form.genre === genre && styles.genreOptionActive]}><Text style={[styles.genreOptionText, form.genre === genre && styles.genreOptionTextActive]}>{genre}</Text></Pressable>)}</View>
        <Pressable disabled={saving || !firebaseConfigured} onPress={saveMovie} style={[styles.submitButton, (saving || !firebaseConfigured) && styles.disabled]}>{saving ? <ActivityIndicator color={palette.bg} /> : <Text style={styles.submitText}>SALVAR NO CATÁLOGO  ↗</Text>}</Pressable>
        {!firebaseConfigured && <Text style={styles.formHint}>Configure o Firebase no arquivo .env para cadastrar filmes.</Text>}
        <Pressable onPress={() => { setForm(emptyForm); setScreen('catalog'); }} style={styles.cancelButton}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
      </ScrollView></KeyboardAvoidingView>}
    </View>
    {screen === 'catalog' && <View style={styles.bottomBar}><View style={styles.bottomItem}><Text style={styles.bottomIconActive}>▦</Text><Text style={styles.bottomLabelActive}>CATÁLOGO</Text></View><Pressable style={styles.bottomItem} onPress={() => setScreen('form')}><Text style={styles.bottomIcon}>＋</Text><Text style={styles.bottomLabel}>ADICIONAR</Text></Pressable><View style={styles.bottomItem}><Text style={styles.bottomIcon}>◉</Text><Text style={styles.bottomLabel}>FIRESTORE</Text></View></View>}
    <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}><Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}><View style={styles.modalCard}><Text style={styles.modalTitle}>Idade indicativa</Text>{ratings.map((rating) => <Pressable key={rating} style={styles.ratingOption} onPress={() => { update('rating', rating); setModalVisible(false); }}><Text style={styles.ratingOptionText}>{rating === 'L' ? 'Livre' : `${rating} anos`}</Text><Text style={styles.ratingBadge}>{rating}</Text></Pressable>)}</View></Pressable></Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.bg, paddingTop: Platform.OS === 'android' ? NativeStatusBar.currentHeight : 0 },
  topBar: { height: 64, borderBottomWidth: 1, borderBottomColor: palette.line, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 }, brandMark: { width: 29, height: 29, borderRadius: 9, backgroundColor: palette.accent, alignItems: 'center', justifyContent: 'center' }, brandMarkText: { color: palette.bg, fontSize: 18, fontWeight: '900' }, brandName: { color: palette.text, fontSize: 15, fontWeight: '800', letterSpacing: 1.5 }, brandAccent: { color: palette.accent }, online: { flexDirection: 'row', gap: 7, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, backgroundColor: palette.surface, borderRadius: 20 }, onlineDot: { width: 6, height: 6, backgroundColor: palette.accent, borderRadius: 4 }, onlineText: { color: palette.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  main: { flex: 1, paddingHorizontal: 22 }, heading: { marginTop: 29, marginBottom: 21 }, eyebrow: { fontSize: 9, letterSpacing: 2, color: palette.accent, fontWeight: '700', marginBottom: 8 }, title: { color: palette.text, fontSize: 34, fontWeight: '800', letterSpacing: -1.2 }, titleDot: { color: palette.accent }, subtitle: { color: palette.muted, fontSize: 13, marginTop: 5 }, toolbar: { flexDirection: 'row', gap: 10 }, searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: palette.surface, height: 48, borderRadius: 13, paddingHorizontal: 14, borderWidth: 1, borderColor: palette.line }, searchIcon: { color: palette.muted, fontSize: 23, marginRight: 9 }, searchInput: { color: palette.text, fontSize: 13, flex: 1 }, addButton: { height: 48, width: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.accent }, addButtonText: { fontSize: 25, color: palette.bg, lineHeight: 28, fontWeight: '400' },
  filterScroll: { marginTop: 14, maxHeight: 35, flexGrow: 0 }, filterRow: { gap: 7 }, filterChip: { paddingHorizontal: 13, paddingVertical: 8, backgroundColor: palette.surface, borderRadius: 20, borderWidth: 1, borderColor: palette.line }, filterChipActive: { backgroundColor: palette.accent, borderColor: palette.accent }, filterText: { color: palette.muted, fontSize: 11 }, filterTextActive: { color: palette.bg, fontWeight: '700' }, sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 }, sectionTitle: { color: palette.text, fontSize: 11, letterSpacing: 1.4, fontWeight: '700' }, count: { color: palette.muted, fontSize: 9, letterSpacing: 1 },
  list: { paddingBottom: 16, gap: 10 }, movieCard: { minHeight: 106, padding: 12, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 13 }, poster: { width: 60, height: 78, borderRadius: 10, backgroundColor: '#292d22', alignItems: 'center', justifyContent: 'center' }, posterIcon: { color: palette.accent, fontSize: 21 }, posterYear: { position: 'absolute', bottom: 7, color: '#c2c5b5', fontSize: 9, fontWeight: '700' }, movieInfo: { flex: 1, gap: 6 }, movieTitle: { color: palette.text, fontSize: 15, fontWeight: '700' }, movieDirector: { color: palette.muted, fontSize: 11 }, movieMeta: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 2 }, genreTag: { color: palette.accent, fontSize: 9, backgroundColor: '#292d22', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4, overflow: 'hidden' }, ratingTag: { color: palette.muted, fontSize: 8, letterSpacing: .8 }, deleteButton: { alignSelf: 'flex-start', padding: 2, width: 29, alignItems: 'center' }, deleteIcon: { color: palette.muted, fontSize: 24, lineHeight: 25 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }, loadingText: { color: palette.muted, fontSize: 12 }, notice: { backgroundColor: palette.surface, borderColor: palette.line, borderWidth: 1, borderRadius: 14, padding: 18 }, noticeTitle: { color: palette.accent, fontSize: 15, fontWeight: '700', marginBottom: 7 }, noticeText: { color: palette.muted, fontSize: 12, lineHeight: 19 }, emptyList: { flexGrow: 1 }, empty: { flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }, emptyIcon: { color: palette.accent, fontSize: 38, marginBottom: 15 }, emptyTitle: { color: palette.text, fontSize: 16, fontWeight: '700', textAlign: 'center' }, emptyText: { color: palette.muted, fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 7, maxWidth: 250 }, emptyCta: { borderWidth: 1, borderColor: palette.line, borderRadius: 9, paddingVertical: 11, paddingHorizontal: 15, marginTop: 19 }, emptyCtaText: { color: palette.accent, fontSize: 10, letterSpacing: .8, fontWeight: '700' },
  bottomBar: { minHeight: 68, paddingBottom: Platform.OS === 'ios' ? 12 : 3, borderTopWidth: 1, borderTopColor: palette.line, backgroundColor: palette.bg, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }, bottomItem: { alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 75 }, bottomIcon: { color: palette.muted, fontSize: 19, height: 22 }, bottomIconActive: { color: palette.accent, fontSize: 19, height: 22 }, bottomLabel: { color: palette.muted, fontSize: 8, letterSpacing: .7 }, bottomLabelActive: { color: palette.accent, fontSize: 8, letterSpacing: .7, fontWeight: '700' },
  formWrap: { flex: 1 }, formContent: { paddingBottom: 30 }, field: { marginBottom: 17 }, label: { color: palette.muted, fontSize: 9, letterSpacing: 1.2, fontWeight: '700', marginBottom: 9 }, input: { backgroundColor: palette.surface, borderColor: palette.line, borderWidth: 1, borderRadius: 11, height: 49, paddingHorizontal: 14, color: palette.text, fontSize: 13 }, twoColumns: { flexDirection: 'row', gap: 12 }, column: { flex: 1 }, selectInput: { height: 49, backgroundColor: palette.surface, borderColor: palette.line, borderWidth: 1, borderRadius: 11, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, selectValue: { color: palette.text, fontSize: 12 }, placeholder: { color: palette.muted, fontSize: 12 }, chevron: { color: palette.muted, fontSize: 18 }, genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 3, marginBottom: 23 }, genreOption: { borderWidth: 1, borderColor: palette.line, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, backgroundColor: palette.surface }, genreOptionActive: { borderColor: palette.accent, backgroundColor: '#292d22' }, genreOptionText: { color: palette.muted, fontSize: 10 }, genreOptionTextActive: { color: palette.accent, fontWeight: '700' }, submitButton: { height: 51, backgroundColor: palette.accent, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, submitText: { color: palette.bg, fontWeight: '800', fontSize: 11, letterSpacing: .9 }, disabled: { opacity: .45 }, formHint: { color: palette.muted, fontSize: 11, textAlign: 'center', marginTop: 12 }, cancelButton: { alignItems: 'center', padding: 14, marginTop: 2 }, cancelText: { color: palette.muted, fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: '#0009', justifyContent: 'center', padding: 28 }, modalCard: { backgroundColor: palette.surface, borderRadius: 18, borderColor: palette.line, borderWidth: 1, padding: 20 }, modalTitle: { color: palette.text, fontSize: 17, fontWeight: '700', marginBottom: 12 }, ratingOption: { height: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: palette.line }, ratingOptionText: { color: palette.text, fontSize: 13 }, ratingBadge: { color: palette.accent, fontSize: 11, fontWeight: '700' },
});

export default App;
