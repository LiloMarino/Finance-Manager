<!-- ARQUIVO GERADO POR scripts/roadmap.py (skill feature-roadmap) -- NÃO EDITAR À MÃO. -->

> ⚠️ **Este arquivo é gerado automaticamente — não edite manualmente.** Toda mudança (inserir/mover/concluir/descartar/remover um card, cadastrar ou atualizar uma necessidade/decisão/marco, o cabeçalho) passa por `scripts/roadmap.py` (ver `SKILL.md`); uma edição direta aqui é sobrescrita sem aviso na próxima regeneração.

# Roadmap — Finance Manager

> Kanban de features, segue a metodologia da skill `feature-roadmap`. Companion: [DECISIONS.md](DECISIONS.md) — lá está o "porquê" (necessidades `N#` e decisões `D#`); aqui fica só o "o quê construir, em que marco e em que estado está".
>
> **Regra de sincronização:** os dois documentos usam os mesmos IDs (`N#`, `D#`) e devem sempre concordar sobre a decisão vigente de cada item.
>
> **Última mudança (2026-09-23):** F10 concluída só com o yfinance, fonte gratuita, sem o brapi pago. F13 descartada: o app cobre só o financeiro de investimentos, e a liquidez virou o card F32.

## Glossário

> Descrição completa de cada `N#`/`D#` em `DECISIONS.md`; `F#` é espelho do kanban abaixo. "Condiciona" é derivado dos cards: as `F#` que citam aquele `N#`/`D#`.

| ID | Resumo | Condiciona (F#) | Status |
| --- | --- | --- | --- |
| **N1** | Medir rentabilidade real (desempenho, patrimônio × rentabilidade, ano a ano) | F14, F15, F16, F17, F18 | — |
| **N2** | Ver o patrimônio consolidado (total, por categoria, posição, inclui RF) | F10, F11, F12 | — |
| **N3** | Posições e preço médio corretos, numa fonte única | F1, F2, F3, F4, F5, F6, F7, F8, F9 | — |
| **N4** | Acompanhar proventos | F14, F20 | — |
| **N5** | Resolver as obrigações fiscais (DARF, IRPF) no mesmo lugar | F21, F22, F23 | — |
| **N6** | Rebalancear sem planilha | F24 | — |
| **N7** | Subcarteiras | F25 | — |
| **N8** | Análises extras: risco × retorno, correlação entre dois ativos | F10, F26, F27 | — |
| **F6** | Importadores B3 (xlsx) e notas de corretagem (PDF) | — | ⏳ |
| **F7** | Migração dos dados do IR-Helper | — | ⏳ |
| **F8** | Engine de posição e preço médio + paridade | — | ⏳ |
| **F9** | Telas de operações, ativos e posição atual | — | ⏳ |
| **F11** | Carteira: patrimônio total, por categoria e posição | — | ⏳ |
| **F12** | Renda fixa: cadastro e marcação por indexador | — | ⏳ |
| **F14** | Série diária de patrimônio e fluxos | — | ⏳ |
| **F15** | Rentabilidade por cota (TWR) | — | ⏳ |
| **F16** | Benchmarks: CDI, IPCA e IBOV | — | ⏳ |
| **F17** | Patrimônio × aportes | — | ⏳ |
| **F18** | Tabela mês × ano e comparação ano a ano | — | ⏳ |
| **F19** | Spike: proventos no xlsx de movimentação da B3 | — | 🔍 |
| **F20** | Proventos: registro, desempenho e retorno total | — | ⏳ |
| **F21** | Motor fiscal: apuração mensal, DARF e prejuízo acumulado | — | ⏳ |
| **F22** | Relatório anual do IRPF | — | ⏳ |
| **F23** | Aposentar o IR-Helper | — | ⏳ |
| **F24** | Rebalanceamento | — | 💤 |
| **F25** | Subcarteiras | — | 💤 |
| **F26** | Risco × retorno | — | 💤 |
| **F27** | Correlação entre dois ativos | — | 💤 |
| **F28** | Alerta de rebalanceamento com o app fechado | — | 🔍 |
| **F29** | Empacotamento desktop | — | 🔍 |
| **F30** | Identidade visual própria (sair do tema padrão do shadcn) | — | 🔍 |
| **F31** | Hot-reload do backend não reinicia o worker | — | 🔍 |
| **F32** | Liquidez em três camadas | — | 🔍 |

<details>
<summary><strong>Concluído / decidido / descartado (16 itens — clique pra expandir)</strong></summary>

| ID | Resumo | Condiciona (F#) | Status |
| --- | --- | --- | --- |
| **D1** | Stack: FastAPI + Vite (decidida pelas sondas de F1) | F1, F2 | ✅ |
| **D2** | Operation é a fonte da verdade; derivados recalculáveis | F5, F8, F14, F17, F20 | ✅ |
| **D3** | Um único SQLite, organizado por domínio | F4 | ✅ |
| **D4** | Dinheiro e quantidade em Decimal (string no JSON) | F5 | ✅ |
| **D5** | Rentabilidade principal por cota (TWR) | F14, F15 | ✅ |
| **D6** | Dados de mercado atrás de interface de provider, com cache local | F10, F12, F16 | ✅ |
| **D8** | IR-Helper absorvido e aposentado: irpf_helper.db como oráculo de paridade | F1, F7, F8, F21, F23 | ✅ |
| **D10** | Roteamento: React Router 7 | F2 | ✅ |
| **D11** | Tipagem do backend: Pydantic nas bordas, dataclass no domínio, pyright strict | F3 | ✅ |
| **F1** | Spike de stack (resolve D1) | — | ✅ |
| **F2** | Scaffold do projeto na stack escolhida | — | ✅ |
| **F3** | Tipagem ponta a ponta | — | ✅ |
| **F4** | Migrations + backup automático do banco | — | ✅ |
| **F5** | Modelo de domínio: ativos, operações e eventos | — | ✅ |
| **F10** | Provider de dados de mercado + cache de preços | — | ✅ |
| **F13** | Caixa e reserva | — | 🚫 |

</details>

---

## 🚦 Livre pra pegar

> Derivado do grafo de dependências: as `F#` que podem ser pegas agora — toda dependência já ✅. "Destrava" é quantas `F#` em aberto esperam por ela, direta ou indiretamente; é por aí que a tabela está ordenada. 💤 (sem prioridade) e 🚫 não entram.

| ID | Resumo | Marco | Destrava | Status |
| --- | --- | --- | --- | --- |
| **F7** | Migração dos dados do IR-Helper | M1 | 17 | ⏳ |
| **F12** | Renda fixa: cadastro e marcação por indexador | M2 | 10 | ⏳ |
| **F19** | Spike: proventos no xlsx de movimentação da B3 | M4 | 3 | 🔍 |
| **F6** | Importadores B3 (xlsx) e notas de corretagem (PDF) | M1 | 0 | ⏳ |
| **F29** | Empacotamento desktop | — | 0 | 🔍 |
| **F31** | Hot-reload do backend não reinicia o worker | — | 0 | 🔍 |

---

## 🧭 Marcos

### M1 — Core de operações

> **Objetivo:** Stack decidida, projeto de pé, e operações/importadores/posição-PM portados do IR-Helper com paridade comprovada.
>
> **Serve:** N3
>
> **Progresso:** 5/9 concluídas

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F6** | Importadores B3 (xlsx) e notas de corretagem (PDF) | F5 | ⏳ |
| **F7** | Migração dos dados do IR-Helper | F5 | ⏳ |
| **F8** | Engine de posição e preço médio + paridade | F7 | ⏳ |
| **F9** | Telas de operações, ativos e posição atual | F8 | ⏳ |

<details><summary>Concluído (5 itens)</summary>

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F1** | Spike de stack (resolve D1) | — | ✅ |
| **F2** | Scaffold do projeto na stack escolhida | F1 | ✅ |
| **F3** | Tipagem ponta a ponta | F2 | ✅ |
| **F4** | Migrations + backup automático do banco | F2 | ✅ |
| **F5** | Modelo de domínio: ativos, operações e eventos | F4 | ✅ |

</details>

### M2 — Patrimônio atual

> **Objetivo:** Ver quanto tenho hoje, por categoria, incluindo renda fixa.
>
> **Serve:** N2
>
> **Progresso:** 1/3 concluídas

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F11** | Carteira: patrimônio total, por categoria e posição | F9, F10 | ⏳ |
| **F12** | Renda fixa: cadastro e marcação por indexador | F10 | ⏳ |

<details><summary>Concluído (1 item)</summary>

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F10** | Provider de dados de mercado + cache de preços | F5 | ✅ |

</details>

### M3 — Rentabilidade

> **Objetivo:** Responder "minha carteira rendeu mais que o CDI?" em qualquer período.
>
> **Serve:** N1
>
> **Progresso:** 0/5 concluídas

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F14** | Série diária de patrimônio e fluxos | F11, F12 | ⏳ |
| **F15** | Rentabilidade por cota (TWR) | F14 | ⏳ |
| **F16** | Benchmarks: CDI, IPCA e IBOV | F15 | ⏳ |
| **F17** | Patrimônio × aportes | F14 | ⏳ |
| **F18** | Tabela mês × ano e comparação ano a ano | F15 | ⏳ |

### M4 — Proventos

> **Objetivo:** Ver quanto recebi de proventos e o retorno total com eles.
>
> **Serve:** N4
>
> **Progresso:** 0/2 concluídas

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F19** | Spike: proventos no xlsx de movimentação da B3 | — | 🔍 |
| **F20** | Proventos: registro, desempenho e retorno total | F14, F19 | ⏳ |

### M5 — Fiscal

> **Objetivo:** DARF e IRPF aqui dentro; IR-Helper aposentado.
>
> **Serve:** N5
>
> **Progresso:** 0/3 concluídas

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F21** | Motor fiscal: apuração mensal, DARF e prejuízo acumulado | F8 | ⏳ |
| **F22** | Relatório anual do IRPF | F20, F21 | ⏳ |
| **F23** | Aposentar o IR-Helper | F21, F22 | ⏳ |

### M6 — Inteligência

> **Objetivo:** Rebalanceamento, subcarteiras e análises extras.
>
> **Serve:** N6, N7, N8
>
> **Progresso:** 0/6 concluídas

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F24** | Rebalanceamento | F11 | 💤 |
| **F25** | Subcarteiras | F15 | 💤 |
| **F26** | Risco × retorno | F10 | 💤 |
| **F27** | Correlação entre dois ativos | F10 | 💤 |
| **F28** | Alerta de rebalanceamento com o app fechado | F24 | 🔍 |
| **F32** | Liquidez em três camadas | F11, F12 | 🔍 |

### Sem marco

> **Progresso:** 0/3 concluídas

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F29** | Empacotamento desktop | F2 | 🔍 |
| **F30** | Identidade visual própria (sair do tema padrão do shadcn) | F11 | 🔍 |
| **F31** | Hot-reload do backend não reinicia o worker | F2 | 🔍 |

---

## 1. Atende necessidade

| ID | Resumo | Atende (N#) | D# | Marco | Depende de | Esforço | Risco | Valor | Custo-benefício | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **F1** | Spike de stack (resolve D1) | N3 | D1, D8 | M1 | — | Médio | Baixo | Alto | Bom | ✅ Concluído |
| **F2** | Scaffold do projeto na stack escolhida | N3 | D1, D10 | M1 | F1 | Médio | Baixo | Alto | Bom | ✅ Concluído |
| **F3** | Tipagem ponta a ponta | N3 | D11 | M1 | F2 | Baixo | Baixo | Alto | Excelente | ✅ Concluído |
| **F4** | Migrations + backup automático do banco | N3 | D3 | M1 | F2 | Baixo | Médio | Alto | Bom | ✅ Concluído |
| **F5** | Modelo de domínio: ativos, operações e eventos | N3 | D2, D4 | M1 | F4 | Médio | Médio | Alto | Bom | ✅ Concluído |
| **F6** | Importadores B3 (xlsx) e notas de corretagem (PDF) | N3 | — | M1 | F5 | Médio | Médio | Alto | Bom | ⏳ Pendente |
| **F7** | Migração dos dados do IR-Helper | N3 | D8 | M1 | F5 | Baixo | Médio | Alto | Excelente | ⏳ Pendente |
| **F8** | Engine de posição e preço médio + paridade | N3 | D2, D8 | M1 | F7 | Médio | Alto | Alto | Excelente | ⏳ Pendente |
| **F9** | Telas de operações, ativos e posição atual | N3 | — | M1 | F8 | Médio | Baixo | Alto | Bom | ⏳ Pendente |
| **F10** | Provider de dados de mercado + cache de preços | N2, N8 | D6 | M2 | F5 | Médio | Médio | Alto | Bom | ✅ Concluído |
| **F11** | Carteira: patrimônio total, por categoria e posição | N2 | — | M2 | F9, F10 | Médio | Baixo | Alto | Excelente | ⏳ Pendente |
| **F12** | Renda fixa: cadastro e marcação por indexador | N2 | D6 | M2 | F10 | Alto | Médio | Alto | Bom | ⏳ Pendente |
| **F14** | Série diária de patrimônio e fluxos | N1, N4 | D2, D5 | M3 | F11, F12 | Alto | Alto | Alto | Bom | ⏳ Pendente |
| **F15** | Rentabilidade por cota (TWR) | N1 | D5 | M3 | F14 | Médio | Médio | Alto | Excelente | ⏳ Pendente |
| **F16** | Benchmarks: CDI, IPCA e IBOV | N1 | D6 | M3 | F15 | Baixo | Baixo | Alto | Excelente | ⏳ Pendente |
| **F17** | Patrimônio × aportes | N1 | D2 | M3 | F14 | Baixo | Baixo | Alto | Excelente | ⏳ Pendente |
| **F18** | Tabela mês × ano e comparação ano a ano | N1 | — | M3 | F15 | Baixo | Baixo | Alto | Excelente | ⏳ Pendente |
| **F20** | Proventos: registro, desempenho e retorno total | N4 | D2 | M4 | F14, F19 | Médio | Médio | Alto | Bom | ⏳ Pendente |
| **F21** | Motor fiscal: apuração mensal, DARF e prejuízo acumulado | N5 | D8 | M5 | F8 | Alto | Alto | Alto | Bom | ⏳ Pendente |
| **F22** | Relatório anual do IRPF | N5 | — | M5 | F20, F21 | Médio | Médio | Alto | Bom | ⏳ Pendente |
| **F23** | Aposentar o IR-Helper | N5 | D8 | M5 | F21, F22 | Baixo | Baixo | Alto | Excelente | ⏳ Pendente |
| **F24** | Rebalanceamento | N6 | — | M6 | F11 | Médio | Baixo | Alto | Bom | 💤 Registrado, sem prioridade |
| **F25** | Subcarteiras | N7 | — | M6 | F15 | Médio | Médio | Médio | Médio | 💤 Registrado, sem prioridade |
| **F26** | Risco × retorno | N8 | — | M6 | F10 | Baixo | Baixo | Médio | Bom | 💤 Registrado, sem prioridade |
| **F27** | Correlação entre dois ativos | N8 | — | M6 | F10 | Baixo | Baixo | Baixo | Médio | 💤 Registrado, sem prioridade |

**F1 — Spike de stack (resolve D1).** Executado como **quatro sondas de DX** em vez de duas fatias verticais: cada uma testa a *fraqueza* de um lado, não tudo dos dois — boilerplate não discrimina. Oráculo `irpf_helper.db` lido somente-leitura o tempo todo (D8), confirmado intocado no fim.

- **Sonda P** (fraqueza do TS): motor fiscal de 591 linhas portado pra TypeScript. Paridade total com o oráculo — snapshots mensais, DARFs, prejuízo acumulado e breakdowns, **0 divergências** — e cross-check full-precision contra o baseline Python com **0 linhas de diff**.
- **Sonda T** (fraqueza do Python): espinha de tipagem em `pyright strict`. **0 erros, 0 escape hatches** fora de `adapters/`; geração offline do `openapi.json` funciona.
- **Sonda I**: `pdfjs-dist` × `pdfplumber` sobre notas de corretagem reais. Linhas de negociação idênticas nos dois, e as operações batendo com o oráculo.
- **Sonda M**: Alembic × drizzle-kit × Atlas, 3 migrations encadeadas sobre as operações reais.

**O que decidiu D1:** cada stack tem **um** buraco que o type-checker não cobre, e eles falham de formas opostas. O do Python (construtor SQLAlchemy aceitando kwarg inexistente) estoura `TypeError` na primeira execução e fecha com **1 linha** (`MappedAsDataclass`). O do TypeScript (`Decimal(20000) >= Decimal(3000)` devolvendo `false`, sem o `tsc` flagrar) produz **número errado em silêncio** num domínio que é quase só comparação de limiar, e a mitigação — 93 linhas de regra ESLint própria — **não roda no TypeScript atual**. Num app que emite DARF, isso pesou mais que os demais eixos.

**Quatro premissas de D1 corrigidas com medição:** o motor tem 591 linhas e não 2,8k; precisão decimal não diferencia as stacks; PDF é portável mas custa 55 linhas de montagem de layout; drizzle-kit ganha do Alembic (3 falhas silenciosas contra 0) — mas isso é consertável de dentro do Python com `compare_metadata`, virou aceite de F4.

**Limitações residuais, declaradas:** F10 (`yfinance` × `yahoo-finance2`) e a leitura de xlsx por SheetJS **não foram verificadas** — seguem como afirmação herdada de D1, risco baixo. As sondas mediram 591 linhas de motor, não o backend inteiro. Achado colateral que vira caso de teste de F6: o `LINE_PATTERN` do parser de notas do IR-Helper perde a linha de negociação que traz observação `#`.

**Evidência:** as sondas eram descartáveis por desenho; o código foi removido e os números ficaram em D1.

**F2 — Scaffold.** Entregue absorvendo F3 inteira: o scaffold nasce em `pyright strict`, com a fronteira `adapters/` declarada e o codegen do OpenAPI encadeado. Estrutura por domínio (`operations`, `market`, `portfolio`, `income`, `tax`) com o router dentro da feature; `pnpm dev` único subindo back + front; `pnpm check` rodando codegen + ruff + pyright + pytest + oxlint + tsc. Sem Makefile: o `package.json` da raiz é o único task runner. shadcn inicializado (base `radix`, preset `nova`), layout com sidebar e cinco rotas. Fatia vertical de verdade: `GET /api/health` consumido na home via TanStack Query, com o tipo vindo do `openapi.generated.ts`.

Decisões de infra que ficaram valendo: erro de domínio (`FinanceError`) não importa `fastapi` — carrega o `status` como atributo e a borda traduz, o que mantém o motor testável headless em F8/F21; **todo 4xx/5xx sai como `{"detail": "<string>"}`**, inclusive o 422, que o app achata (buraco que os dois repos irmãos têm e que deixava o toast mudo justamente no erro de validação de D4).

**F3 — Tipagem ponta a ponta.** Fechada junto com F2. `pyright strict` com **0 erros e 0 warnings**, e **zero** escape hatches (`# type: ignore`, `cast(`, `Any`) em todo o backend, inclusive nos testes. `backend/adapters/` existe com as quatro regras relaxadas via `executionEnvironments` (com o `extraPaths: ["."]` que a Sonda T provou obrigatório). `scripts/export_openapi.py` gera o `openapi.json` sem servidor de pé, e o codegen roda no `pnpm dev` e no `pnpm check`.

Um ganho além do planejado: o hook `transform` do `openapi-typescript` mapeia todo campo marcado com `format: "decimal"` num tipo branded `DecimalString`, então o Decimal chega ao front como tipo próprio e não como string solta. Verificado que `valor * 2`, `valor / 2`, `valor.toFixed()` e passar string comum onde se espera Decimal **param de compilar** — e que `valor + outro` e `valor > outro` **não** são pegos (mesmo buraco de D1; por isso a conta fica no Python, D4).

**Aceite verificado:** renomear campo no backend vira erro de `tsc` no front sem subir servidor; path inexistente em `get()` também, porque o `api.ts` é tipado contra `paths`.

**F4 — Migrations + backup.** Alembic 1.20 com a config em `[tool.alembic]` no `pyproject.toml` (sem `alembic.ini`), `render_as_batch=True` e `compare_type=True`. O `main.py` roda `prepare_database` antes do uvicorn, uma vez só, no processo pai: primeiro um snapshot (`VACUUM INTO` em conexão própria, em `backups/`, mantendo os `keep` mais recentes; pasta configurável, pode ser a do Drive), depois a migration. O `create_app` não toca no banco, então `export_openapi` e testes seguem independentes dele.

Os três guardas de D3 existem: (1) `compare_metadata` e (2) todo `CheckConstraint` do metadata presente pelo nome no `sqlite_master` são testes do `pnpm check`; (3) o de dado roda **no start**, que é onde o dado existe: toda migration pendente é aplicada antes numa cópia do banco, e só chega ao real se nenhuma tabela perder linha ou célula preenchida e o `foreign_key_check` sair limpo. Verificado com uma revisão DROP+ADD sobre banco semeado: recusada com `MigrationError`, banco real intacto na revisão anterior. As armadilhas da Sonda M ficaram fechadas no `env.py`: `DecimalText` renderizado como `sa.String()` (sem `NameError`, `existing_type` funciona), e FK desligada na conexão de migration (o batch recria a tabela).

**Limitações residuais:** o guarda 3 recusa também um drop de coluna legítimo — quando o primeiro aparecer, ele ganha uma lista de perdas declaradas na própria migration. O autogenerate continua cego para `CHECK` em tabela existente; o teste acusa, mas a linha vai à mão.

**F5 — Modelo de domínio.** `Asset` (`ticker` único, `asset_class` em `stock/fii/etf/bdr/fixed_income/cash`, `cnpj` e `sector` opcionais) e `Operation` (`buy/sell/bonus/split/reverse_split/transfer_in/transfer_out`, `quantity` e `unit_price` em `DecimalText`, TEXT no SQLite) num arquivo só, `backend/core/models/models.py`, junto com a `Base(MappedAsDataclass, DeclarativeBase)` e a naming convention; enums em `backend/core/enum/`. Enum gravado pelo **valor** (`"stock"`; o oráculo grava o nome, `"STOCK"` — F7 converte). As regras de quantidade do README do IR-Helper viraram CHECK no banco: `quantity > 0`; buy/sell com preço `> 0`; bonus/split/reverse_split com preço `= 0`; transferência com preço `>= 0`. FK com `RESTRICT`: apagar ativo com operação dá erro, em vez do `CASCADE` do IR-Helper (D2). Sem endpoint nem `relationship` — entram com o primeiro consumidor (F6, F7, F9).

**Aceite verificado:** todos os ativos e operações do `irpf_helper.db` (lido com `mode=ro`) gravados num banco no head e relidos: **0 divergências campo a campo, nenhuma rejeição de CHECK**. Um preço médio com dízima de 28 dígitos atravessa o SQLite intacto, e `"10.10"` mantém a escala. Verificação one-shot, sem artefato versionado; a paridade permanente é de F7.

**F6 — Importadores.** Portar `b3_reader.py` e `pdf_reader.py` + `parsers/nubank.py` do IR-Helper, agora emitindo linhas tipadas (validadas na borda) antes de gravar; importação idempotente (reimportar o mesmo arquivo não duplica) com relatório do que entrou, do que foi ignorado e por quê. Serve N3.
**Aceite:** reimportar num banco vazio os relatórios da B3 e as notas de corretagem que alimentam o IR-Helper reproduz as mesmas operações que ele tem (fora os ajustes manuais, que vêm pela migração F7).

**F7 — Migração do irpf_helper.db.** Script one-shot que lê o `irpf_helper.db` (somente leitura) e grava ativos + operações no banco novo — incluindo os ajustes manuais feitos lá, que corrigem posições que nem a B3 nem as notas trazem. Gera um relatório de contagens por ativo/tipo. Serve N3; o banco antigo fica intocado como oráculo (D8).
**Aceite:** contagem e soma de quantidades por ativo e tipo de operação idênticas entre os dois bancos.

**F8 — Posição e PM.** Portar o cálculo de posição/PM de `consolidation.py`/`position.py` como funções puras sobre as operações (D2), com eventos corporativos. Suíte de paridade: para cada ativo e cada mês, comparar quantidade e PM com os `MonthlySnapshot` do IR-Helper (oráculo, D8). Serve N3.
**Aceite:** posição e PM de todos os ativos batem com o IR-Helper em todos os meses.

**F9 — Telas do core.** Operações: lista com filtros (ticker, tipo, período), criar/editar/excluir, importar arquivo. Ativos: lista + detalhe com as operações do ativo. Posição atual: quantidade, PM e custo total por ativo. shadcn + TanStack Query.
**Aceite:** o usuário consegue fazer no app tudo o que fazia no IR-Helper pra manter as operações em dia, sem abrir o IR-Helper.

**F10 — MarketDataProvider.** Interface `MarketDataProvider` (Protocol em `backend/domain/market_data.py`, com `get_history`) implementada pelo yfinance (`TICKER.SA`, `auto_adjust=False`) em `backend/adapters/`. Tabela `price_history` (ativo, data, fechamento em `DecimalText`, CHECK `> 0`), com FK em CASCADE porque é cache descartável (D2). O refresh busca só os dias que faltam: parte da última data em cache, inclusive (o fechamento parcial de um pregão em andamento é regravado), ou da primeira operação, e cobre ações/FII/ETF/BDR com operação. Quem dispara é o front, ao abrir o app e pelo botão da tela Mercado (`POST /api/market/prices/refresh`); o `create_app` segue sem tocar no banco. Offline não é erro: o ticker vai para `failed`, um toast avisa, e `GET /api/market/prices` devolve o último fechamento com a data dele — é esse o "preço atual" do plano. O fechamento é quantizado em centavos, porque a B3 cota em centavos e o resto do float é ruído.

Decisões tomadas durante: **sem brapi**, que é pago — o app opera só com fonte gratuita. Sem fallback, a interface fica com um provider só; se o yfinance quebrar, a alternativa gratuita é o arquivo de cotações históricas da B3 (COTAHIST). O fechamento é o que o yfinance entrega, ajustado por desdobramento e grupamento, não por provento (a conferência ficou em F14). As séries do BCB ficaram para quem as consome (F12, F16).

**Limitações residuais:** ativo sem cotação (ticker trocado ou deslistado) cai em `failed` a cada abertura; quando F8 existir, o refresh passa a parar na data em que a posição zerou. O pregão do dia pode demorar a aparecer no yfinance.

**F11 — Carteira.** Página inicial: patrimônio total; donut + tabela por categoria (ações/FII/ETF/BDR/RF); posição na carteira por ativo (quantidade, PM, preço atual, valor, % da carteira, lucro/prejuízo não realizado). Serve N2.
**Aceite:** o patrimônio total bate com a soma da posição da B3 + saldos de RF numa data de conferência, e o usuário para de abrir o Status Invest pra ver "quanto tenho".

**F12 — Renda fixa.** Cadastro da aplicação (valor, data, indexador CDI/Selic/IPCA/pré, taxa, vencimento, liquidez, isenta ou não) e resgates. Marcação diária pelas séries do BCB SGS (CDI 12, Selic 11, IPCA 433), buscadas atrás de uma interface própria no molde do provider de F10, com cache local (D6), e IR regressivo estimado. Reaproveitar ideias de `SimuladorFinanceiro/backend/features/fixed_income` e do `Comparador Renda Fixa`. Serve N2.
**Aceite:** o valor bruto calculado de cada título fica a menos de 0,5% do extrato da corretora/B3 na mesma data.

**F14 — Série diária.** Tabela materializada (data, patrimônio por categoria, aportes/resgates do dia) calculada de operações + `price_history` + RF marcada; reconstruível do zero (D2) e atualizada incrementalmente a partir da última data válida quando entra operação retroativa. É infra, mas serve duas necessidades diretamente através de quem depende dela: N1 (F15–F18 leem a série pra rentabilidade e comparações) e N4 (F20 usa a série como fluxo de caixa pro retorno total dos proventos).

**A conferir aqui:** o `price_history` guarda o fechamento ajustado por desdobramento e grupamento, que é o que o yfinance entrega. O valor numa data passada precisa então da quantidade convertida para a base atual pelos eventos de split/grupamento de `operations`. Conferir contra a carteira real, já inteira cadastrada, antes de confiar na série anterior a um evento.

**F15 — Rentabilidade por cota.** Cota diária da carteira (e por categoria) a partir de F14, neutralizando aportes e resgates (D5); gráfico de rentabilidade acumulada com seletor de período (mês, ano, 12m, desde o início). Serve N1.
**Aceite:** a rentabilidade de um período em que o Status Invest ainda estava sincronizado bate com a dele (diferença de até 0,1 p.p.).

**F16 — Benchmarks.** Séries do CDI e do IPCA (BCB) e do IBOV (`^BVSP`) no mesmo gráfico da rentabilidade, rebaseadas no início do período escolhido; rentabilidade em "% do CDI". Serve N1.
**Aceite:** o usuário consegue responder "rendi mais que o CDI este ano?" olhando uma tela só.

**F17 — Patrimônio × aportes.** Gráfico do patrimônio contra o capital investido acumulado (aportes − resgates), mostrando quanto do crescimento é rendimento e quanto é aporte. Junto, o aporte de cada mês: o fluxo líquido que entrou na carteira (compras e aplicações de RF menos vendas e resgates), derivado das operações (D2), sem lançamento separado. É o histórico que F24 usa pra sugerir como distribuir o próximo aporte. Serve N1.
**Aceite:** a diferença entre as duas curvas no fim do período bate com o ganho total (realizado + não realizado + proventos, quando M4 existir).

**F18 — Mês × ano.** Tabela estilo Status Invest: linhas = anos, colunas = meses + acumulado do ano, com a rentabilidade da carteira e do CDI lado a lado, colorida por desempenho. Serve N1.
**Aceite:** o usuário usa essa tabela no lugar da comparação ano a ano que fazia no Status Invest.

**F20 — Proventos.** Tabela `income_event` (ativo, tipo, data-com, data de pagamento, valor bruto, IR retido); importação pela fonte decidida em F19 + cadastro manual; gráfico mensal/anual de proventos, yield on cost por ativo; proventos entram como fluxo na série de F14, pro retorno total. Serve N4.
**Aceite:** o total de proventos recebidos num ano bate com o informe de rendimentos da corretora.

**F21 — Motor fiscal.** Portar `tax_calculator.py` e a parte fiscal de `consolidation.py`: apuração mensal por tipo de ativo e de operação (comum/day trade), isenção de R$ 20 mil em ações, compensação de prejuízo acumulado, DARF a pagar. Suíte de paridade contra os `DARFEvent`/`AccumulatedLoss` do IR-Helper (D8). Serve N5.
**Aceite:** DARF e prejuízo acumulado de todos os meses batem centavo por centavo com o IR-Helper.

**F22 — Relatório IRPF.** Relatório do ano-base com o que vai em cada ficha: Bens e Direitos (código, discriminação, situação em 31/12 dos dois anos), Rendimentos Isentos (cód. 09 dividendos, cód. 20 vendas até 20 mil), Tributação Exclusiva (cód. 10 JCP), Renda Variável (lucro mensal, DARF pago, prejuízo). Segue o algoritmo do README do IR-Helper. Serve N5.
**Aceite:** a declaração do próximo ano é preenchida só com este relatório, sem abrir o IR-Helper.

**F23 — Aposentar o IR-Helper.** Depois da paridade fiscal (F21) e de uma declaração feita com F22: README do IR-Helper apontando pra cá, repositório marcado como arquivado, `irpf_helper.db` guardado como backup somente leitura. Serve N5 diretamente — é o critério de fechamento da necessidade: as obrigações fiscais deixam de precisar do app antigo.

**F24 — Rebalanceamento.** Metas de alocação (% por categoria e, opcionalmente, por ativo) guardadas no banco, no lugar do arquivo de metas do script de rebalanceamento atual; dado um valor de aporte, sugerir quanto comprar de cada ativo pra se aproximar das metas (e, com opção ativada, quanto vender), usando a posição de F11. Mostrar o desvio atual de cada meta. Quando F32 definir as camadas de liquidez, a sugestão passa a distribuir o aporte também entre elas. Serve N6.
**Aceite:** o usuário faz um aporte inteiro guiado pela sugestão, sem abrir a planilha de rebalanceamento.

**F25 — Subcarteiras.** Grupos nomeados de ativos (um ativo pode estar em mais de um), cada um com a mesma visão de patrimônio e rentabilidade da carteira inteira, filtrando posições e fluxos de F14. Serve N7.
**Aceite:** o usuário cria pelo menos uma subcarteira e volta a consultá-la em semanas diferentes.

**F26 — Risco × retorno.** Gráfico de dispersão por ativo (e da carteira): eixo x = volatilidade anualizada (desvio-padrão dos retornos diários × √252), eixo y = retorno no período, a partir de `price_history`. Serve N8.
**Aceite:** o usuário entende de onde vem o "risco" do gráfico e consegue tirar dele alguma conclusão sobre a carteira.

**F27 — Correlação.** Página que recebe dois ativos (ou ativo × benchmark) e mostra a correlação dos retornos diários numa janela configurável, com o gráfico das duas séries rebaseadas e a correlação móvel. Serve N8.
**Aceite:** o usuário usa pelo menos uma vez pra decidir algo concreto (ex.: se dois ativos se sobrepõem na carteira).

---
## 2. Nice-to-have

> Nenhum item nesta categoria atualmente.

---
## 3. Descartada

| ID | Resumo | N# | Status |
| --- | --- | --- | --- |
| **F13** | Caixa e reserva | N2 | 🚫 Descartado |

**F13 — Descartado.** 🚫 O app cobre só o financeiro de investimentos, separado dos gastos pessoais: saldo em conta não entra. O dinheiro de investimento que fica parado é renda fixa de liquidez diária (F12); o tamanho do aporte sai das operações (F17); e a liquidez virou o card F32. A classe de ativo `cash` saiu do schema.

---
## 4. Incerta / exploratória

| ID | Resumo | Conexão | Marco | Depende de | Status |
| --- | --- | --- | --- | --- | --- |
| **F19** | Spike: proventos no xlsx de movimentação da B3 | N4 — decide a fonte de F20 | M4 | — | 🔍 Em avaliação |
| **F28** | Alerta de rebalanceamento com o app fechado | N6 — complemento de F24 | M6 | F24 | 🔍 Em avaliação |
| **F29** | Empacotamento desktop | Nenhuma N# direta — conforto de uso | — | F2 | 🔍 Em avaliação |
| **F30** | Identidade visual própria (sair do tema padrão do shadcn) | Nenhuma N# direta — qualidade de uso das telas de N1/N2 | — | F11 | 🔍 Em avaliação |
| **F31** | Hot-reload do backend não reinicia o worker | Nenhuma N# direta — atrito de desenvolvimento | — | F2 | 🔍 Em avaliação |
| **F32** | Liquidez em três camadas | N2 e N6 — distribuição do patrimônio por liquidez e planejamento do aporte | M6 | F11, F12 | 🔍 Em avaliação |

**F19 — Spike de proventos na B3.** O que falta definir: se o xlsx de movimentação da B3, exportado **sem filtro**, traz Dividendo / Rendimento / Juros Sobre Capital Próprio / Amortização com valor e data suficientes pra ser a fonte principal (o xlsx que alimenta o IR-Helper foi exportado filtrado e não traz nenhum). Exportar um período conhecido, conferir contra o extrato da corretora e decidir a fonte de F20: B3 ou cadastro manual. Fonte paga fica fora, como em F10.

**F28 — Alerta fora do app.** O que falta definir: o mecanismo — o app não fica aberto o tempo todo, e hoje o alerta de rebalanceamento vem de um script agendado no sistema. Opções: uma tarefa agendada chamando um comando do próprio app, um ícone na bandeja, ou só mostrar o alerta ao abrir. Depende de F24 existir e de o usuário sentir falta do alerta.

**F29 — Empacotamento desktop.** O que falta definir: se vale empacotar (PyInstaller .exe, como no SimuladorFinanceiro, ou Tauri) ou se `pnpm dev`/um atalho basta pro uso diário. Depende de D1 e de o incômodo de subir o app aparecer no uso real.

**F30 — Identidade visual própria.** O que falta definir: o app hoje usa o preset `nova` do shadcn (base `radix`, Lucide, fonte Geist, baseColor neutral) — funcional, mas é o "padrãozão" que qualquer projeto shadcn tem. Decidir uma paleta e uma tipografia que digam *este* app: dashboard financeiro, leitura de tabela densa e muito gráfico.

Pontos concretos que a decisão precisa cobrir, porque já existem como token no `index.css`: as cinco cores de série (`--chart-1` a `--chart-5`), que aparecem no donut de F11 e nas linhas de F15/F16; uma cor de alta e uma de baixa que não sejam só verde/vermelho puro (daltonismo, e o vermelho do `destructive` já significa "erro"); e contraste suficiente para tabela densa no claro e no escuro.

Os outros presets do shadcn (`vega`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea`) são ponto de partida barato — trocar preset é um comando. Vale olhar quando houver tela de verdade para julgar (a partir de F9/F11), não antes: é decisão que se toma vendo dado real na tela.

**F31 — Hot-reload do backend.** O que falta definir: por que o worker não reinicia. Medido em F2, e o diagnóstico já está estreitado.

O que **não** é a causa (todos testados isoladamente): não é `reload=False` nem app passado como objeto — os dois repos irmãos têm esse defeito, mas aqui já está corrigido com import string + `factory=True`; não é o `concurrently`, porque reproduz com o backend sozinho; não é o `uvicorn.run()` dentro do script, porque reproduz igual pela CLI do uvicorn; e não é o `reload_excludes`, porque reproduz sem ele.

O que acontece: o WatchFiles **detecta** a mudança e loga `Reloading...`, o worker **nunca** reinicia, e o watcher não dispara uma segunda vez. Aponta para a fase de shutdown do worker no Windows, nesta combinação de uvicorn/watchfiles. Próximos passos: testar com `--reload-delay`, com `WATCHFILES_FORCE_POLLING=1`, e com um app mínimo (sem o `create_app` do projeto) para separar ambiente de aplicação.

**F32 — Liquidez em três camadas.** Classificar o patrimônio pelo prazo em que ele vira dinheiro: **mexível** (RF de liquidez diária), **intermediária** (renda variável: sai em D+2, mas vender gera DARF, e girar à toa é o que se quer evitar) e **travada** (RF com carência ou vencimento). Métricas candidatas: a distribuição do patrimônio pelas três camadas e a escada de vencimentos (quanto destrava em cada mês ou ano). O risco que elas medem é precisar do dinheiro antes da hora e sair com perda — Tesouro prefixado ou IPCA marcado a mercado abaixo do custo, ou ação vendida em baixa gerando DARF. Uso previsto em F24: distribuir o aporte do mês entre as camadas.

O que falta definir: se a camada é derivada (liquidez e vencimento da RF de F12, classe do ativo na RV) ou marcada pelo usuário por aplicação; se existe meta por camada (ex.: X% mexível) e como ela convive com as metas de alocação de F24; e qual das métricas seria de fato consultada. Vale olhar com F11 e F12 de pé, com dado real.

## Fora do roadmap

Multiusuário, autenticação, sincronização em nuvem e app mobile — fora do escopo local-only do produto (ver Contexto em DECISIONS.md), não são features adiadas. Saldo em conta corrente e gastos pessoais também ficam fora: o app cobre só o financeiro de investimentos.
