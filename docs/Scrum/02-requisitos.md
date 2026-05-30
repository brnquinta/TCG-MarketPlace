# 02 — Requisitos do Produto

## 1. Requisitos Funcionais

### RF001 — Autenticação
O sistema deve permitir que usuários façam login/cadastro via Clerk (Google, GitHub, email).

### RF002 — Sincronização de Usuário
O sistema deve sincronizar automaticamente os dados do Clerk para o MongoDB.

### RF003 — Criação de Loja
Usuário autenticado pode criar **uma** loja com nome, slug, logo, descrição e localização.

### RF004 — Slug Automático
O slug da loja deve ser gerado automaticamente a partir do nome, com edição manual permitida.

### RF005 — Edição de Loja
Vendedor pode editar nome, slug, logo, banner, descrição, localização da loja.

### RF006 — Validação de Imagens
Upload de banner (mín. 800×200px) e logo (mín. 100×100px) com validação de dimensões.

### RF007 — Dashboard da Loja
Vendedor deve ver estatísticas: anúncios ativos, vendas, visualizações, próximos passos.

### RF008 — Onboarding da Loja
Vendedor deve completar dados fiscais (CPF/CNPJ) e bancários (PIX) para ativar a loja.

### RF009 — Página Pública da Loja
Visitante deve poder ver loja com anúncios, avaliações e informações.

### RF010 — Listagem de Lojas
Sistema deve listar lojas ativas ordenadas por avaliação.

### RF011 — Busca de Cartas
Usuário deve buscar cartas por nome, número, set e raridade.

### RF012 — Autocomplete de Set
Campo de set deve ter autocomplete com sugestões.

### RF013 — Detalhes da Carta
Sistema deve exibir imagem, set, número, raridade, artista e preços de referência.

### RF014 — Preços em BRL
Preços de referência internacionais devem ser convertidos para real (BRL).

### RF015 — Criação de Anúncio
Vendedor cria anúncio com carta selecionada, preço, condição, idioma, fotos e dados de entrega.

### RF016 — 4 Fotos Obrigatórias
Anúncio exige 4 fotos: frente 90°, verso 90°, frente 45°, verso 45°.

### RF017 — Certificação
Vendedor pode indicar se carta é certificada (PSA/CGC/BGS/OTHER) com nota.

### RF018 — Condições da Carta
Condições: NM (Near Mint), LP (Lightly Played), MP (Moderately Played), HP (Heavily Played), DM (Damaged).

### RF019 — Idiomas
Idiomas suportados: PT-BR, EN, JP, ES, FR, DE, IT, KO, ZH.

### RF020 — Edição/Exclusão de Anúncio
Vendedor pode editar e deletar seus próprios anúncios.

### RF021 — Busca Pública de Anúncios
Sistema deve listar anúncios ativos com filtros: preço, condição, certificada, idioma, set, busca textual.

### RF022 — Detalhes do Anúncio
Sistema deve exibir fotos em carrossel, descrição, defeitos, entrega e dados da loja.

### RF023 — Carrinho
Usuário logado pode adicionar/remover itens do carrinho.

### RF024 — Agrupamento por Loja
Carrinho deve agrupar itens por loja vendedora.

### RF025 — Resumo do Carrinho
Carrinho deve mostrar subtotal por loja e total geral.

### RF026 — Checkout (futuro)
Comprador deve finalizar compra informando endereço e frete.

### RF027 — Pedidos (futuro)
Sistema deve gerenciar pedidos com status: pending → paid → processing → shipped → delivered.

### RF028 — Número de Pedido (futuro)
Pedido deve ter número único no formato ORDYYYYMM######.

### RF029 — Pagamento PIX (futuro)
Comprador deve poder pagar via PIX.

### RF030 — Avaliações (futuro)
Comprador deve poder avaliar vendedor após a compra.

## 2. Requisitos Não-Funcionais

### RNF001 — Segurança
Autenticação via Clerk com JWT. ⚠️ Necessário implementar `jwt.verify()`.

### RNF002 — Performance
Dados de cartas servidos localmente (JSON), sem dependência externa em runtime.

### RNF003 — Disponibilidade
API Express com fallback de cotação USD→BRL (5.8 caso AwesomeAPI falhe).

### RNF004 — Usabilidade
Interface em português com termos do domínio TCG.

### RNF005 — Responsividade
Layout com Tailwind CSS adaptável.

### RNF006 — Manutenibilidade
Código em JavaScript (ES Modules), sem TypeScript.

### RNF007 — Testabilidade
❌ Nenhum teste implementado.

### RNF008 — Cache
Dados de cartas, sets, raridades e cotação USD são cacheados globalmente em memória.
