# CineVault 🎬

Aplicativo mobile para consultar, cadastrar, pesquisar e excluir filmes, com dados sincronizados em tempo real pelo Cloud Firestore.

## O que já está pronto

- Catálogo de filmes com título, ano, classificação indicativa, gênero e direção.
- Busca por título, diretor ou gênero e filtro por gênero.
- Cadastro com validação de todos os campos e do ano de lançamento.
- Exclusão com confirmação.
- Atualização em tempo real via Firestore.
- Interface responsiva em React Native / Expo, em português.

## Preparar o Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/) e registre um aplicativo Web nas configurações do projeto.
2. Copie os dados de configuração do aplicativo Web.
3. No console, crie um banco **Cloud Firestore** em modo de teste para desenvolvimento.
4. Na raiz do projeto, copie `.env.example` para `.env` e preencha os valores `EXPO_PUBLIC_FIREBASE_*` com os dados do aplicativo Web.
5. Não envie o arquivo `.env` para o GitHub. Ele está ignorado pelo Git.

A coleção `filmes` é criada automaticamente no primeiro cadastro. Cada documento contém `name`, `year`, `rating`, `genre`, `director` e `createdAt`.

> As regras de teste do Firestore permitem acesso temporário. Antes de usar com dados reais, configure regras de segurança e autenticação no Firebase.

## Executar

Requisitos indicados no material de aula para desenvolvimento Android: Node.js LTS, JDK 17, Android Studio e SDK Android API 34, além de NDK e CMake pelo SDK Manager.

```bash
npm install
npx expo start
```

Use o QR code do Expo Go ou inicie um emulador Android no Android Studio. Para executar no navegador: `npm run web`.

## Estrutura

- `App.tsx`: telas de catálogo e cadastro e operações de consulta, criação e exclusão.
- `firebaseConfig.ts`: inicialização do Firebase e leitura da configuração pelo ambiente.
- `.env.example`: modelo da configuração Firebase.
