# LOG DE TESTES — QA Sprint 1

> Registro bruto de cada arquivo de teste, seus resultados e bugs encontrados.
> Data: 29/05/2026

---

## BACKEND (111 testes)

### 📄 tests/setup.test.js — Setup do Ambiente
```
Status: ✅ 3/3 passaram
  ✓ Deve conectar ao MongoDB em memoria
  ✓ Deve permitir criar e consultar um documento
  ✓ Deve limpar documentos entre testes
Bugs: Nenhum
```

### 📄 tests/unit/auth.test.js — Autenticação
```
Status: ✅ 11/11 passaram
  ✓ A01: Token valido popula req.user
  ✓ A02: 401 sem header Authorization
  ✓ A03: 401 sem Bearer
  ✓ A04: 401 token invalido
  ✓ A05: CORRIGIDO — Token expirado retorna 401 (jwt.verify rejeita)
  ✓ A08: RN002 — Criar usuario automaticamente
  ✓ A10: RN002 — Nao duplicar usuario
  ✓ A09: CORRIGIDO — Token forjado retorna 401 (jwt.verify)
  ✓ A06: optionalAuth sem token
  ✓ A07: optionalAuth token invalido
  ✓ optionalAuth com token valido
Bugs: Nenhum (BUG002 corrigido)
```

### 📄 tests/unit/store.test.js — Lojas (Criação, Leitura, Edição)
```
Status: ✅ 17/17 passaram
  ✓ S01: Happy path criar loja
  ✓ S02: Sem token → 401
  ✓ S03: Sem nome → 400
  ✓ S04: Sem slug → 400
  ✓ S05: Slug duplicado → 400
  ✓ S06: Duas lojas mesmo user → 400
  ✓ S07: Case-insensitive slug
  ✓ S08: RN006 — 1 loja por usuario
  ✓ S09: getMyStore com loja
  ✓ S10: getMyStore sem loja → 404
  ✓ S11: getStoreBySlug ativo
  ✓ S12: Slug inexistente → 404
  ✓ S13: Store inativa → 404 (RN011)
  ✓ S16: Views incrementado (RN014)
  ✓ S17: Paginacao + sorted by rating
  ✓ S14: UpdateStore parcial
  ✓ S15: Update sem loja → 404
Bugs: Nenhum
```

### 📄 tests/unit/listing.test.js — Anúncios
```
Status: ✅ 27/27 passaram
  ✓ L01-L06: Criacao (dados completos, sem token, sem cardSnapshot, sem listingData, sem loja, RN012)
  ✓ L07-L12: Normalizacao (portugues→PT-BR, english→EN, price→0, quantity→1, gradingCompany→null)
  ✓ L13: CORRIGIDO — DM aceito (frontend envia DM)
  ✓ L14: 4 fotos aceitas
  ✓ L27: updateListing parcial
  ✓ L28: Update de outro usuario → 404
  ✓ L24-L26: getListingById, ID inexistente, views incrementado
  ✓ L15-L23: getPublicListings (filtros, paginacao, search)
  ✓ L29-L31: deleteListing, de outro usuario, RN013 decremento
Bugs: Nenhum (BUG003 corrigido)
```

### 📄 tests/unit/cart.test.js — Carrinho
```
Status: ✅ 13/13 passaram
  ✓ C01: Carrinho vazio
  ✓ C02: Adicionar item
  ✓ C03: Sem token → 401
  ✓ C04: Sem listingId → 400
  ✓ C05: Listing inexistente → 404
  ✓ C06: RN032 — listing inativa → 400
  ✓ C07: RN033 — sem estoque → 400
  ✓ C08: RN034 — item duplicado → 400
  ✓ C09: Remover item
  ✓ C10: Item inexistente → 404
  ✓ C11: Limpar carrinho
  ✓ C12: RN035 — populate storeId.name
  ✓ C13: CORRIGIDO — Auth roda 1x (removido das rotas)
Bugs: Nenhum (BUG005 corrigido)
```

### 📄 tests/unit/pokemonProxy.test.js — Proxy Pokémon
```
Status: ✅ 12/12 passaram
  ✓ P01-P08: GET /cards (sem filtro, name, number, set.name, rarity, combinacao, sem resultados, paginacao)
  ✓ P09-P10: GET /cards/:id (existe, 404)
  ✓ P11: GET /sets
  ✓ P12: GET /rarities
Bugs: Nenhum
```

### 📄 tests/unit/inconsistencias.test.js — Inconsistências
```
Status: ✅ 7/7 passaram
  ✓ RN01 (BUG003): CORRIGIDO — frontend e backend usam DM
  ✓ RN02 (BUG002): CORRIGIDO — jwt.verify usado, jwt.decode removido
  ✓ RN03 (BUG004): CORRIGIDO — NewListing.css com extensao
  ✓ RN05 (BUG001): CORRIGIDO — hasListings existe no StoreContext
  ✓ RN06 (BUG007): CORRIGIDO — Link usa /cart
  ✓ RN04 (BUG005): CORRIGIDO — auth removido de cartRoutes
  ✓ RN07 (BUG008): CORRIGIDO — StoreProvider.jsx deletado
Bugs: Nenhum (todos corrigidos)
```

### 📄 tests/unit/docs.test.js — Documentação
```
Status: ✅ 7/7 passaram
  ✓ D01: product-backlog.md existe e tem conteudo
  ✓ D02: Diagramas Draw.io existem (5 arquivos)
  ✓ D03: Diagramas sao XML validos
  ✓ D04: Documentos 01 a 06 existem
  ✓ D05: plano-testes-qa.md existe com cenarios T001
  ✓ D06: qa-sprint-backlog.md existe com QAT-001 a QAT-014
  ✓ D07: Todos .md tem conteudo valido
Bugs: Nenhum
```

### 📄 tests/integration/vendedor.test.js — Fluxo Vendedor
```
Status: ✅ 4/4 passaram
  ✓ I01: Auth→Criar Loja→Criar Anuncio→Listar
  ✓ I02: Criar→Deletar→Verificar
  ✓ I03: Criar→Editar→Verificar
  ✓ I04: RN012+RN013 — activeListings incrementa/decrementa
Bugs: Nenhum
```

### 📄 tests/integration/comprador.test.js — Fluxo Comprador
```
Status: ✅ 3/3 passaram
  ✓ I05: Listar→Detalhes→Add carrinho→Ver carrinho
  ✓ I07: Add→Remove→Carrinho vazio
  ✓ I08: Views incrementado
Bugs: Nenhum
```

### 📄 tests/security/auth.test.js — Segurança
```
Status: ✅ 7/7 passaram
  ✓ SEC01: CORRIGIDO — jwt.verify rejeita token forjado
  ✓ SEC02: Rota sem auth → 401
  ✓ SEC03: Rota protegida sem auth → 401
  ✓ SEC04: Cart sem auth → 401
  ✓ SEC05: optionalAuth funciona sem token
  ✓ SEC07: CORRIGIDO — Auth roda 1x (passCount=1)
  ✓ SEC08: CLERK_SECRET_KEY placeholder documentado
Bugs: Nenhum (BUG002, BUG005 corrigidos)
```

---

## FRONTEND (13 testes)

### 📄 tests/smoke.test.jsx — Smoke Test
```
Status: ✅ 1/1 passou
  ✓ Setup frontend funciona
Bugs: Nenhum
```

### 📄 tests/utils.test.js — Utilitários
```
Status: ✅ 9/9 passaram
  ✓ F08: CORRIGIDO — DM presente em cardConditions
  ✓ 5 condicoes
  ✓ filter options (Todas + 5)
  ✓ form options (Selecione + 5)
  ✓ Labels NM=Perte de nova, LP=Levemente jogada, MP=Moderadamente jogada, HP=Muito jogada
  ✓ opcoes de idioma
  ✓ filter options (Todos + idiomas)
  ✓ form options (PT-BR, EN, JP)
  ✓ valores portugues, ingles, japones, espanhol, outros
Bugs: Nenhum (BUG003 corrigido)
```

### 📄 tests/components.test.jsx — Componentes
```
Status: ✅ 3/3 passaram
  ✓ F08: CORRIGIDO — hasListings e isLoading existem no StoreContext
  ✓ F09: CORRIGIDO — StoreProvider.jsx removido
  ✓ F10: CORRIGIDO — CSS import NewListing.css
Bugs: Nenhum (BUG001, BUG004, BUG008 corrigidos)
```

---

## TOTAL GERAL

```
Arquivos:       14 (11 backend + 3 frontend)
Testes:        124 (111 backend + 13 frontend)
Passaram:      124 (100%)
Falharam:        0
Bugs unicos:     7 → Todos corrigidos ✅
```

## BUGS ENCONTRADOS

> ✅ Todos os 7 bugs foram corrigidos na sprint BUG-FIX-1.

| ID | Task QAT | Arquivo | Descrição | Tipo | Status |
|----|----------|---------|-----------|------|--------|
| BUG001 (US058) | QAT-012/013 | StoreContext.jsx | `hasListings` não existia no StoreContext | Funcional | ✅ Corrigido |
| BUG002 (US060) | QAT-002/011/013 | middleware/auth.js | `jwt.decode()` sem `jwt.verify()` | **Segurança** | ✅ Corrigido |
| BUG003 (US059) | QAT-005/012/013 | cardConditions.js | Frontend `DMG` vs Backend `DM` | Funcional | ✅ Corrigido |
| BUG004 (US061) | QAT-012/013 | index.css | `NewListining` em vez de `NewListing.css` | Estilo | ✅ Corrigido |
| BUG005 (US062) | QAT-007/011/013 | cartRoutes.js | `authenticateToken` registrado 2× | Organizacional | ✅ Corrigido |
| BUG007 (US064) | QAT-013 | Home.jsx | Link `/cart/${user.id}` em vez de `/cart` | UX | ✅ Corrigido |
| BUG008 (US065) | QAT-013 | context/StoreProvider.jsx | Arquivo duplicado não importado | Organizacional | ✅ Corrigido |
