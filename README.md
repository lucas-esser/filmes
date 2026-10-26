# CineVault 🎬

Aplicativo mobile para consultar, cadastrar, pesquisar e excluir filmes. Os dados são armazenados e sincronizados em tempo real pelo Firebase Realtime Database.

## Funcionalidades

- Consulta do catálogo com nome, ano, idade indicativa, gênero e diretor.
- Pesquisa por todos os campos ou por um campo específico.
- Filtro por classificação indicativa.
- Cadastro com validação dos campos e do ano.
- Exclusão com confirmação.
- Atualização automática da lista quando os dados mudam no Firebase.
- Autenticação Firebase preparada com persistência local em AsyncStorage.

## Estrutura

- `app/index.tsx`: consulta, pesquisa, filtros e exclusão.
- `app/cadastro.tsx`: formulário de cadastro.
- `app/_layout.tsx`: navegação por abas com Expo Router.
- `services/filmes.ts`: funções para observar, cadastrar e excluir filmes no Realtime Database.
- `firebaseConfig.ts`: configuração e inicialização do Firebase.
- `firebase-auth.d.ts`: tipagem para a persistência React Native do Firebase Auth.

## Firebase

O `firebaseConfig.ts` já contém a configuração do aplicativo Web e a URL do Realtime Database. O Firebase Auth é inicializado com persistência local via AsyncStorage; uma tela de login não faz parte desta etapa do catálogo.

Os filmes são armazenados no caminho `filmes`. Cada registro contém `nome`, `ano`, `idade`, `genero`, `diretor` e `criadoEm`.

Configure as regras do Realtime Database de acordo com o ambiente da atividade. Se as regras exigirem usuário autenticado, implemente o login antes de restringir o acesso. Regras abertas de teste não devem ser usadas com dados reais.

## Executar

Requisitos recomendados para desenvolver no Android: Node.js LTS, JDK 17, Android Studio, Android SDK API 34, NDK e CMake.

```bash
npm install
npx expo start
```

Leia o QR code com o Expo Go ou inicie um emulador Android no Android Studio. Para abrir no navegador, execute `npm run web`.
