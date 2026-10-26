import {
  onValue,
  push,
  ref,
  remove,
  serverTimestamp,
  set,
} from 'firebase/database';
import { rtdb } from '../firebaseConfig';

export const IDADES = ['Livre', '10', '12', '14', '16', '18'];

export type NovoFilme = {
  nome: string;
  ano: number;
  idade: string;
  genero: string;
  diretor: string;
};

export type Filme = NovoFilme & {
  id: string;
  criadoEm?: number;
};

const CAMINHO = 'filmes';

export async function cadastrarFilme(filme: NovoFilme): Promise<void> {
  const novaRef = push(ref(rtdb, CAMINHO));
  await set(novaRef, { ...filme, criadoEm: serverTimestamp() });
}

export async function excluirFilme(id: string): Promise<void> {
  await remove(ref(rtdb, `${CAMINHO}/${id}`));
}

export function observarFilmes(
  aoReceber: (filmes: Filme[]) => void,
  aoFalhar: (erro: Error) => void,
): () => void {
  return onValue(
    ref(rtdb, CAMINHO),
    (snapshot) => {
      const dados = snapshot.val() as Record<string, Omit<Filme, 'id'>> | null;
      const filmes = dados
        ? Object.entries(dados).map(([id, filme]) => ({ id, ...filme }))
        : [];
      filmes.sort((a, b) => (b.criadoEm ?? 0) - (a.criadoEm ?? 0));
      aoReceber(filmes);
    },
    aoFalhar,
  );
}
