# Relatório da Sprint de QA — TCG Marketplace

> **Para leitores leigos:** Este documento explica o que foi feito, por que foi feito,
> quais ferramentas foram usadas e o que cada teste encontrou.
> Tudo explicado em português claro, sem jargão técnico desnecessário.

---

## 📋 O que é este documento?

Imagine que você contratou uma **equipe de inspetores** para examinar um prédio.
Cada inspetor tem uma lista de verificação e vai cômodo por cômodo, porta por porta,
checando se tudo funciona.

Nós fomos esses inspetores para o **TCG Marketplace** — um sistema de compra e venda
de cartas Pokémon. Criamos **124 checagens automáticas** (testes) que examinam o código
e apontam problemas.

---

## 🧰 Quais ferramentas usamos?

| Ferramenta | O que é (para leigos) | Para que serviu |
|-----------|----------------------|-----------------|
| **Vitest** | Um "robô examinador" que roda os testes | Executou todas as 124 checagens automaticamente |
| **Supertest** | Um "cliente falso" que faz requisições | Simulou pessoas acessando o site/API |
| **MongoDB Memory Server** | Um "banco de dados descartável" | Criou um banco temporário só para testes, que é destruído no final |
| **React Testing Library** | Um "navegador fantasma" | Simulou o site abrindo no navegador sem precisar abrir de verdade |
| **jsdom** | Um "navegador invisível" | Permitiu testar componentes React sem abrir janela |
| **jsonwebtoken** | Um "carimbo digital" | Criou tokens de autenticação falsos para simular login |
| **fs (File System)** | Leitor de arquivos | Leu os arquivos do projeto para verificar se estão corretos |

---

## 📁 Estrutura dos Testes

```
backend/tests/
├── setup.js              # Configuração global (banco descartável)
├── setup.test.js         # Verifica se o setup funciona
├── fixtures/
│   ├── index.js          # Fábrica de tokens JWT falsos
│   └── models.js         # Fábrica de registros falsos (usuários, lojas)
├── unit/
│   ├── auth.test.js      # Testes de login e autenticação
│   ├── store.test.js     # Testes de criação e gerenciamento de lojas
│   ├── listing.test.js   # Testes de criação e gerenciamento de anúncios
│   ├── cart.test.js      # Testes de carrinho de compras
│   ├── pokemonProxy.test.js  # Testes da busca de cartas Pokémon
│   ├── inconsistencias.test.js  # Testes que caçam bugs conhecidos
│   └── docs.test.js      # Testes que verificam se a documentação existe
├── integration/
│   ├── vendedor.test.js  # Teste do fluxo completo do vendedor
│   └── comprador.test.js # Teste do fluxo completo do comprador
└── security/
    └── auth.test.js      # Testes de segurança (tentativas de invasão)

frontend/tests/
├── setup.js              # Configuração global do frontend
├── smoke.test.jsx        # Verifica se o ambiente de teste frontend funciona
├── utils.test.js         # Testes das utilidades (condições, idiomas)
└── components.test.jsx   # Testes dos componentes de tela
```

---

## 🧪 TAREFA POR TAREFA — Explicação para Leigos

---

### QAT-001: Preparar o Ambiente de Testes

**O que é:** Antes de inspecionar qualquer coisa, precisamos montar o laboratório.

**O que foi feito:**
1. Instalamos as ferramentas no computador (Vitest, Supertest, etc.)
2. Configuramos um banco de dados temporário que é criado e destruído a cada teste
3. Criamos "fábricas" que produzem dados falsos (usuários, lojas, anúncios) para os testes
4. Adicionamos os botões de "rodar testes" nos arquivos de configuração do projeto

**Arquivos criados:**
- `backend/vitest.config.js` — Configuração do robô examinador
- `backend/tests/setup.js` — Configuração do banco descartável
- `backend/tests/fixtures/index.js` — Fábrica de tokens de login falsos
- `backend/tests/fixtures/models.js` — Fábrica de registros falsos
- `frontend/vitest.config.js` — Configuração do robô examinador do frontend
- `frontend/tests/setup.js` — Configuração de testes do frontend

**Bugs encontrados:** Nenhum (é só a preparação)

---

### QAT-002: Testar Login e Autenticação

**O que é:** Verificar se o sistema de login funciona — se ele deixa entrar
quem tem senha certa e barra quem não tem.

**Local:** `backend/src/middleware/auth.js`

**O que foi testado:**

| Teste | O que faz | Resultado |
|-------|-----------|-----------|
| ✅ Token válido | Simula um usuário com token correto | Passou |
| ✅ Sem token | Tenta acessar sem nenhum documento | Passou (barrou) |
| ✅ Sem "Bearer" | Tenta acessar com formato errado | Passou (barrou) |
| ✅ Token inválido | Tenta acessar com token falso | Passou (barrou) |
| ⚠️ **Token expirado** | Tenta acessar com token vencido | **BUG — deixou passar!** |
| ✅ Criar usuário automático | Quando o usuário não existe, o sistema cria | Passou |
| ✅ Não duplicar usuário | Se o usuário já existe, não cria outro | Passou |
| ⚠️ **Token forjado** | Tenta invadir com um token criado por um hacker | **BUG — deixou passar!** |

**BUG ENCONTRADO (US060 / RN02):**
O sistema usa `jwt.decode()` em vez de `jwt.verify()`. Isso é como um segurança
que olha só se o crachá TEM uma foto, mas não verifica se a foto é sua.
Qualquer token falso passa. Perigoso!

---

### QAT-003: Testar Criação de Loja

**O que é:** Verificar se a função de criar uma loja funciona direito.

**Local:** `backend/src/controllers/storeController.js`

**O que foi testado:**

| Teste | O que faz | Resultado |
|-------|-----------|-----------|
| ✅ Dados completos | Cria loja com nome, slug, localização | Passou |
| ✅ Sem login | Tenta criar sem estar logado | Passou (barrou) |
| ✅ Sem nome | Tenta criar loja sem nome | Passou (barrou) |
| ✅ Sem slug | Tenta criar loja sem identificador único | Passou (barrou) |
| ✅ Slug duplicado | Tenta criar loja com identificador já usado | Passou (barrou) |
| ✅ Duas lojas | Mesma pessoa tenta criar segunda loja | Passou (barrou) |
| ✅ Case-insensitive | Slug "CASE-Test" vira "case-test" no banco | Passou |
| ✅ RN006 — 1 loja | Verifica se a regra "1 pessoa = 1 loja" funciona | Passou |

**Bugs encontrados:** Nenhum nesta funcionalidade específica

---

### QAT-004: Testar Visualização e Edição de Loja

**O que é:** Verificar se o dono da loja consegue ver e editar, e se visitantes
conseguem encontrar a loja.

**Local:** `backend/src/controllers/storeController.js`

**O que foi testado:** 9 testes — ver loja própria, ver loja por slug, loja
inativa não aparece, visualizações incrementam, listagem com paginação,
atualizar dados da loja.

**Bugs encontrados:** Nenhum

---

### QAT-005: Testar Criação de Anúncio

**O que é:** Verificar se o vendedor consegue anunciar uma carta para vender.

**Local:** `backend/src/controllers/listingController.js`

**O que foi testado:**

| Teste | O que faz | Resultado |
|-------|-----------|-----------|
| ✅ Dados completos | Cria anúncio com carta, preço, condição | Passou |
| ✅ Sem token | Tenta criar sem login | Passou (barrou) |
| ✅ Sem cardSnapshot | Tenta criar sem dados da carta | Passou (barrou) |
| ✅ Sem listingData | Tenta criar sem preço/condição | Passou (barrou) |
| ✅ Sem loja | Tenta criar sem ter loja | Passou (barrou) |
| ✅ RN012 — contagem | Verifica se o contador de anúncios aumenta | Passou |
| ✅ Português → PT-BR | Escreve "portugues" e o sistema entende "PT-BR" | Passou |
| ✅ English → EN | Escreve "english" e o sistema entende "EN" | Passou |
| ✅ Preço zero | Preço vazio vira R$ 0 | Passou |
| ✅ Quantidade mínima | Quantidade 0 vira 1 (não pode ter 0) | Passou |
| ✅ Grade vazia | Campo vazio vira null (sem nota de avaliação) | Passou |
| ⚠️ **DMG (BUG)** | Tenta criar com condição "DMG" (danificada) | **BUG — quebrou!** |
| ✅ 4 fotos | Adiciona 4 fotos ao anúncio | Passou |

**BUG ENCONTRADO (US059 / RN01):**
O sistema do vendedor (frontend) usa `DMG` para "Danificada", mas o sistema
do banco de dados (backend) só aceita `DM`. É como se um formulário pedisse
"Masculino/Feminino" e o banco esperasse "M/F" — as letras não batem.

---

### QAT-006: Testar Listagem, Edição e Exclusão de Anúncios

**O que é:** Verificar se os anúncios aparecem na busca, podem ser editados
e podem ser removidos.

**Local:** `backend/src/controllers/listingController.js`

**O que foi testado:** 13 testes — meus anúncios, editar preço, editar de
outro usuário (barrado), ver detalhes, ID inexistente, visualizações incrementam,
filtros (preço mínimo/máximo, condição, busca por nome), paginação,
deletar próprio, deletar de outro (barrado), contador diminui ao deletar.

**Bugs encontrados:** Nenhum específico (os bugs de DMG e jwt.decode já foram
capturados em outras tasks)

---

### QAT-007: Testar Carrinho de Compras

**O que é:** Verificar se o carrinho funciona — adicionar, remover, limpar.

**Local:** `backend/src/controllers/cartController.js`

**O que foi testado:**

| Teste | O que faz | Resultado |
|-------|-----------|-----------|
| ✅ Carrinho vazio | Ver carrinho sem itens | Passou |
| ✅ Adicionar item | Colocar uma carta no carrinho | Passou |
| ✅ Sem token | Tenta adicionar sem login | Passou (barrou) |
| ✅ Sem ID | Tenta adicionar sem dizer qual carta | Passou (barrou) |
| ✅ Carta inexistente | Tenta adicionar carta que não existe | Passou (barrou) |
| ✅ RN032 — inativa | Tenta comprar carta já vendida | Passou (barrou) |
| ✅ RN033 — sem estoque | Tenta comprar carta com quantidade 0 | Passou (barrou) |
| ✅ RN034 — duplicado | Tenta colocar a mesma carta 2 vezes | Passou (barrou) |
| ✅ Remover item | Tira carta do carrinho | Passou |
| ✅ Item inexistente | Tenta remover item que não está no carrinho | Passou (barrou) |
| ✅ Limpar carrinho | Esvazia o carrinho inteiro | Passou |
| ✅ RN035 — loja visível | Verifica se o nome da loja aparece no carrinho | Passou |

**Bugs encontrados:** Nenhum funcional, mas documentamos que o sistema de
autenticação roda duas vezes para o carrinho (BUG005 — não quebra, mas
é repetitivo).

---

### QAT-008: Testar Busca de Cartas Pokémon

**O que é:** Verificar se a busca de cartas Pokémon funciona — os dados
estão salvos no próprio sistema (não consultam internet).

**Local:** `backend/src/routes/pokemonProxyRoutes.js`

**O que foi testado:** 12 testes — buscar sem filtro, por nome, por número,
por coleção, por raridade, combinação de filtros, sem resultados, paginação,
detalhes de carta específica, carta inexistente (404), listar coleções, listar
raridades.

**Bugs encontrados:** Nenhum

---

### QAT-009: Fluxo Completo do Vendedor

**O que é:** Simular um vendedor passando por todo o processo do início ao fim.

**Passos simulados:**
1. Fazer login → 2. Criar loja → 3. Criar anúncio → 4. Ver anúncios →
5. Deletar anúncio → 6. Verificar que o contador de anúncios subiu e desceu

**Resultado:** 4 testes, todos passaram ✅

---

### QAT-010: Fluxo Completo do Comprador

**O que é:** Simular um comprador passando por todo o processo.

**Passos simulados:**
1. Buscar anúncios → 2. Ver detalhes de uma carta → 3. Adicionar ao carrinho →
4. Ver carrinho → 5. Remover item → 6. Verificar que visualizações aumentam

**Resultado:** 3 testes, todos passaram ✅

---

### QAT-011: Testes de Segurança

**O que é:** Tentar "invadir" o sistema de formas maliciosas.

**Local:** `backend/src/middleware/auth.js`

**O que foi testado:**

| Teste | O que faz | Resultado |
|-------|-----------|-----------|
| ⚠️ **Token forjado** | Cria um token com chave de hacker | **BUG — deixou passar!** |
| ✅ Rota sem auth | Tenta acessar área protegida sem login | Passou (barrou) |
| ✅ Auth duplicado | Verifica middleware rodando 2x | Passou (documentado) |
| ✅ Rota opcional | Verifica que rota pública funciona sem login | Passou |
| ⚠️ **Chave placeholder** | Verifica se a chave secreta é um placeholder | **Documentado** |

---

### QAT-012: Testes de Tela (Frontend)

**O que é:** Verificar as telas do sistema e as utilidades do lado do
navegador.

**O que foi testado:**

| Teste | O que faz | Resultado |
|-------|-----------|-----------|
| ⚠️ **hasListings** | Verifica se a propriedade `hasListings` existe | **BUG — não existe!** |
| ⚠️ **StoreProvider duplicado** | Verifica se há arquivo órfão | **Documentado** |
| ⚠️ **CSS NewListining** | Verifica se o nome do arquivo CSS está errado | **BUG — "NewListining"** |
| ✅ Condições das cartas | Verifica NM, LP, MP, HP, DMG | Passou |
| ✅ Idiomas | Verifica português, inglês, etc. | Passou |

**BUG ENCONTRADO (US058 / RN05):**
O sistema usa `hasListings` em vários lugares, mas essa informação não
existe no contexto do sistema. É como tentar perguntar "quantos anos
você tem?" para alguém que não tem idade registrada — o sistema quebra.

**BUG ENCONTRADO (US064 / RN06):**
O link para o carrinho está montado errado: `/cart/123` em vez de só `/cart`.
É como se o endereço da sua casa fosse "Rua das Flores / seu nome" em vez
de "Rua das Flores, 123".

**BUG ENCONTRADO (US061 / RN03):**
O arquivo de estilo está escrito `NewListining` (com "i" a mais) em vez de
`NewListing`. O navegador não encontra o arquivo e a tela fica sem estilo.

---

### QAT-013: Caça às Inconsistências (Bugs Conhecidos)

**O que é:** Uma varredura nos arquivos do projeto para encontrar todos
os bugs que já conhecíamos, mas de forma automática.

**O que foi testado:** 7 testes que leem os arquivos do projeto e verificam
se os bugs ainda estão lá. Se um dia alguém corrigir um bug, o teste vai
"quebrar" (fail) — e isso é bom! Significa que a correção foi detectada.

**Bugs encontrados (todos documentados):**

| ID | Nome | Explicação simples |
|----|------|-------------------|
| US059 | DMG vs DM | Frontend diz "DMG", backend espera "DM" |
| US060 | jwt.decode vs verify | Qualquer token falso passa |
| US061 | CSS NewListining | Nome do arquivo de estilo escrito errado |
| US058 | hasListings | Propriedade que não existe é usada no código |
| US062 | Auth duplicado | Middleware de login roda 2 vezes |
| US064 | Link do carrinho | Link montado errado |
| US065 | StoreProvider órfão | Arquivo solto que não é usado |

---

### QAT-014: Verificar a Documentação

**O que é:** Checar se todos os documentos que criamos estão nos lugares
certos e com conteúdo válido.

**O que foi testado:** 7 testes — product-backlog.md existe e tem conteúdo,
diagramas .drawio (5 arquivos) são XML válidos, documentos 01 a 06 existem,
plano de testes existe, sprint backlog tem todas as 14 tasks.

**Resultado:** Todos passaram ✅

---

## 📊 Resumo Final

```
Status:  ✅ SPRINT CONCLUÍDA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Arquivos de teste:   11 (backend) + 3 (frontend) = 14
Testes criados:      111 (backend) + 13 (frontend) = 124
Testes passando:     124 (100%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bugs encontrados:    7
  ├─ Críticos (segurança):  2  (jwt.decode, token forjado)
  ├─ Funcionais:            1  (DMG vs DM)
  ├─ Frontend/UX:           3  (hasListings, link carrinho, CSS)
  └─ Organizacionais:       1  (auth duplicado, StoreProvider órfão)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tempo de execução:    ~2.6s (backend) + ~1.7s (frontend)
```

---

## 🚨 O que precisa ser corrigido (prioridade)

1. 🔴 **jwt.decode → jwt.verify** (US060) — segurança crítica. Qualquer
   token falso invade o sistema.
2. 🔴 **DMG → DM** (US059) — frontend envia "DMG", backend só aceita "DM".
   Anúncios danificados quebram.
3. 🟡 **hasListings** (US058) — propriedade ausente trava telas.
4. 🟡 **Link do carrinho** (US064) — link errado leva a página 404.
5. 🟢 **CSS NewListining** (US061) — nome do arquivo de estilo errado.
6. 🟢 **Auth duplicado** (US062) — não quebra, mas é repetitivo.
7. 🟢 **StoreProvider órfão** (US065) — arquivo morto não usado.

---

## 🧑‍🏫 Glossário para Leigos

- **API:** A "cozinha" do sistema — onde os dados são processados.
- **Frontend:** A "sala de visitas" — o que o usuário vê no navegador.
- **Backend:** O "estoque" e a "cozinha" — onde os dados ficam e são processados.
- **Token JWT:** Um "crachá digital" que prova que você fez login.
- **Middleware:** Um "porteiro" que verifica seu crachá antes de deixar você passar.
- **MongoDB:** O "arquivo" onde os dados são guardados.
- **Teste unitário:** Testa uma peça isolada do sistema (uma engrenagem).
- **Teste de integração:** Testa várias peças funcionando juntas (o motor completo).
- **Enum:** Uma lista de opções permitidas (ex: condições da carta: NM, LP, MP, HP, DM).
- **XML:** Um formato de arquivo que descreve diagramas e dados.
