# TCG Marketplace - Frontend

Aplicacao React para o marketplace de cartas colecionaveis.

## Stack

- React 19
- Vite
- React Router DOM
- Tailwind CSS
- Clerk (autenticacao)

## Instalacao

```bash
npm install
```

## Configuracao

Copie o arquivo `.env.example` para `.env` e configure as variaveis:

```bash
cp .env.example .env
```

## Executar

```bash
# Desenvolvimento
npm run dev

# Build de producao
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

## Estrutura

```
src/
├── blocks/          # Componentes de pagina com CSS proprio
├── components/      # Componentes reutilizaveis
├── context/         # React Context (Store, Cart, User)
├── hooks/           # Custom hooks (useStore, useApiStore, useCardSearch)
├── layouts/         # Layouts de pagina
├── pages/           # Paginas da aplicacao
├── services/        # Camada de API (api.js, pokemonTcg.js)
└── utils/           # Utilitarios (estados, condicoes, idiomas)
```
