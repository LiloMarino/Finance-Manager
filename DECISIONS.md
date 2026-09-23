# Decisões — Finance Manager

> O "porquê" do projeto: **necessidades** (`N#`, por que construir) e **decisões transversais** (`D#`, por que desse jeito — só as que já condicionam alguma feature concreta). Segue a metodologia da skill `feature-roadmap`. Companion: [ROADMAP.md](ROADMAP.md) — lá está o "o quê construir, em que marco e em que estado"; aqui não há status de implementação.
>
> **Regra de sincronização:** os dois documentos usam os mesmos IDs (`N#`, `D#`) e devem sempre concordar. Ao criar/alterar um `N#`/`D#` aqui, espelhar no ROADMAP via `roadmap.py upsert-ref` na mesma resposta.
>
> **Última mudança (2026-09-23):** **F11 e F12 executadas.** D2 ganhou as movimentações de renda fixa como dado primário, em tabelas próprias; D6 ganhou o provider das séries do BCB; D4 registra que a carteira não precisou de conta no front.
>
> **Mudança anterior (2026-09-23):** **F6, F7, F8 e F9 executadas.** D11 mediu o `openapi-fetch` no gatilho que ela mesma previa, em F9, e o recusou: a versão atual desmonta o `DecimalString` do front. O `api.ts` ganhou path, query e upload tipados à mão.

---

## Contexto

Dashboard pessoal de investimentos, **local-first**: roda em 127.0.0.1, sem autenticação, sem nuvem, sem multiusuário — os dados ficam num SQLite na própria máquina. Privacidade dos dados financeiros é parte do motivo do projeto; auth e cloud seriam complexidade sem uso. Substitui o Status Invest — que desincronizou da B3 e esconde o que importa atrás de plano pago — e as planilhas de controle, e centraliza a vida de investimentos num lugar só.

Absorve projetos irmãos que falam do mesmo domínio, pra acabar com a sincronização manual entre eles:
- **IR-Helper** — FastAPI + SQLAlchemy + SQLite + React/Vite. Já tem a parte mais difícil: operações reconciliadas entre notas de corretagem (PDF) e o portal da B3 (xlsx), preço médio, eventos corporativos, DARF, prejuízo acumulado. Será **absorvido e aposentado** (D8) depois da paridade fiscal (F23).
- **Script de rebalanceamento** — yfinance + arquivo de metas + alerta agendado no sistema. Vira feature no marco de inteligência.
- Ideias reaproveitáveis (não absorvidos): marcação de renda fixa do [SimuladorFinanceiro](https://github.com/LiloMarino/SimuladorFinanceiro) e do [Comparador-Renda-Fixa](https://github.com/LiloMarino/Comparador-Renda-Fixa).

O app cobre **só o financeiro de investimentos**, separado dos gastos pessoais: saldo em conta corrente não entra. O dinheiro de investimento que fica parado mora em renda fixa de liquidez diária.

Classes de ativo no escopo: **ações/FII/ETF/BDR da B3 e renda fixa/Tesouro**. Ativos no exterior e cripto ficam de fora: exigiriam câmbio e outra regra fiscal inteira, e ficam fora do escopo até haver uso real para eles. Notícias e indicadores fundamentalistas também não entram: o app é de acompanhamento da própria carteira, não de análise pra escolher ativo.

---

## Necessidades

**N1. Medir rentabilidade real ⭐**
Saber se os investimentos estão de fato rendendo: desempenho de rentabilidade no tempo, patrimônio × rentabilidade, comparação ano a ano. É o que o usuário mais usava no Status Invest e chama de "absurdamente essencial". Implica comparar com referências (CDI, IPCA, IBOV).

**N2. Ver o patrimônio consolidado**
Patrimônio total e por categoria, posição na carteira, ativos por categoria — incluindo renda fixa, não só bolsa.

**N3. Posições e preço médio corretos, numa fonte única**
Os números têm que bater com a realidade (B3 + notas de corretagem), inclusive nos casos em que o próprio xlsx da B3 é incompleto. E sem ter que sincronizar a mesma informação em dois sistemas (hoje: IR-Helper e Status Invest).

**N4. Acompanhar proventos**
Quanto recebeu de dividendos/JCP/rendimentos ao longo do tempo (desempenho de proventos).

**N5. Resolver as obrigações fiscais no mesmo lugar**
DARF mensal e dados da declaração anual (IRPF), sem manter um app separado pra isso.

**N6. Rebalancear sem planilha**
Saber quanto comprar/vender de cada ativo pra manter a proporção-alvo, sem a planilha manual.

**N7. Subcarteiras**
Agrupar ativos em subcarteiras com visão própria ("seria bom", não central).

**N8. Análises extras**
Risco × retorno e correlação entre dois ativos — curiosidade analítica, sem ambição de ferramenta quantitativa.

---

## Decisões

> Só entra aqui a decisão que já condiciona uma feature concreta do roadmap (ver `methodology.md` seção 3) — é por isso que não há mais `D7`/`D9`: nenhuma feature dependia delas como decisão de arquitetura. `D7` (local-only) virou parte do Contexto acima; `D9` era meta do processo de tracking, não do produto.

### D1 — Stack
**Status:** ✅ Decidida

**Decisão:** **FastAPI + Vite** (Python 3.13 no backend, React SPA no front).

**Evidência.** Quatro sondas de DX foram construídas e descartadas — cada uma testando a *fraqueza* de um dos lados, porque boilerplate não discrimina. O código não foi mantido de propósito: era descartável por desenho, e versioná-lo só criaria um diretório morto com risco de carregar dado derivado do oráculo junto. O que importa são os números, e eles estão abaixo.

| Sonda | O que mediu | Resultado |
|---|---|---|
| **P** — porte do motor fiscal para TypeScript | 591 linhas (`consolidation.py` 377 + `tax_calculator.py` 135 + `position.py` 63 + `monthly_state.py` 16) portadas e comparadas com o oráculo | **0 divergências** em todos os campos de snapshots mensais, DARFs, prejuízo acumulado e breakdowns. Cross-check full-precision contra o baseline Python: **0 linhas de diff**, incluindo dízimas de 28 dígitos. `tsc --strict` e `eslint`: 0 erros, 0 `any`. Porte ficou **+8,5%** em linhas, mais 135 de andaime de Decimal. |
| **T** — espinha de tipagem em `pyright strict` | modelos + DTOs + domínio + repository + `adapters/` com pandas real + geração offline do OpenAPI + consumo em `tsc` | **0 erros, 0 warnings**. **Zero** escape hatches fora de `adapters/`; dentro, **um** `Any` numa função de 2 linhas — melhor do que o IR-Helper tem hoje em `basic`, com `cast(Any, ...)` solto na lógica. `app.openapi()` offline funciona. Rename ponta a ponta: **3 comandos**, 2/2 sites do front pegos. |
| **I** — `pdfjs-dist` × `pdfplumber` | notas de corretagem reais, com o `irpf_helper.db` de gabarito | **todas as linhas `BOVESPA` idênticas**; as operações batem com o oráculo, menos **uma**, que falha **igual nos dois** — é o `LINE_PATTERN` do IR-Helper, que não prevê observação `#`. Custo: **55 linhas** de montagem de layout que o Python não precisa; o texto **completo** não converge em nenhuma nota, em nenhuma tolerância. |
| **M** — Alembic × drizzle-kit × Atlas | 3 migrations encadeadas sobre as operações reais | Alembic: **5 edições à mão e 3 falhas silenciosas**. drizzle-kit: **1 edição, 0 falhas silenciosas**, mas sem rollback e sem rodar em script quando há rename. Atlas reprovado (ver abaixo). |

**As três falhas silenciosas do Alembic**, porque são o que mais assusta e o que mais influenciou o desenho de F4: (1) `CheckConstraint` não é detectado pelo autogenerate e some sem aviso; (2) `create_unique_constraint` dentro de `batch_alter_table` **não cria o índice e a migration reporta sucesso**; (3) um rename é gerado como `add_column` + `drop_column`, o que **apagaria todos os preços** sem tocar em nada que acuse. Todas as três viram barulhentas — ver consequências de D3.

As saídas com dado real (texto integral das notas, que traz nome/CPF/endereço, e os JSONL de posições) **nunca** foram versionadas; o `.gitignore` foi endurecido antes de qualquer `git add`, e o conjunto commitado foi varrido por CPF/nome antes de subir.

**Contexto:** Front inegociável: React + TanStack Query + Tailwind + shadcn. A dúvida era o backend: Python ou full TypeScript. A finalista full-TS passou de TanStack Start para **Next App Router** durante o spike — Next é a stack com que o autor tem contato real (front + backend Express), e sondar uma stack nunca usada tornaria o resultado ininterpretável.

**Por quê — o argumento que decidiu:** os dois lados têm **exatamente um** buraco que o type-checker não cobre, e eles falham de maneiras opostas.

| | Python | TypeScript |
|---|---|---|
| Buraco | construtor SQLAlchemy aceita kwarg inexistente | `>` `>=` `<=` `===` entre `Decimal` |
| Onde dói | criar/editar um modelo | **todo o motor fiscal** (regra fiscal é comparação de limiar) |
| Como falha | `TypeError` na primeira execução — **alto e visível** | **número errado, em silêncio** |
| Conserto | `MappedAsDataclass` — **1 linha**, fecha total | 93 linhas de regra ESLint própria |
| Disponível hoje | sim | **não** — `typescript-eslint` aborta em TypeScript 7 |

Medido: `new Decimal(20000) >= new Decimal(3000)` devolve `false` (coerção lexicográfica), e o `tsc --strict` **não flagra** — flagra só o `+`. O porte do motor escreveu **24 comparações de Decimal**; o compilador protege **zero**. Num app que emite DARF (N5) e cujo critério é "os números têm que bater" (N3), essa assimetria pesou mais que os demais eixos.

**Premissas antigas desta decisão que as sondas derrubaram:**
- ~~"o motor fiscal do IR-Helper tem ~2,8k linhas"~~ → 2.835 é o **backend inteiro**. O motor são **591** linhas (`consolidation.py` 377 + `tax_calculator.py` 135 + `position.py` 63 + `monthly_state.py` 16). O principal argumento pró-Python estava inflado ~5x.
- ~~"risco de divergência numérica em TS"~~ → **não existe**. `decimal.js` com `Decimal.set({precision: 28, rounding: ROUND_HALF_EVEN})` reproduz o `decimal` do Python **bit a bit**: cross-check de todos os valores do oráculo, 0 linhas de diff, incluindo dízimas de 28 dígitos. Precisão **não** diferencia as stacks; segurança de operador diferencia.
- ~~"parsing de PDF trivialmente portável"~~ → portável e **verificado** (todas as linhas `BOVESPA` idênticas nas notas reais; as operações batem com o oráculo, menos uma, que falha **igual** nos dois — é bug do `LINE_PATTERN` do IR-Helper com observação `#`). Mas custa **55 linhas** de montagem de layout, e o texto completo **não** reproduz o `pdfplumber` em nenhuma nota, em nenhuma tolerância. Risco assumido para corretoras novas em F6/F19.
- ~~"Drizzle tem DX de migrations melhor que Alembic"~~ → **confirmado, e por um motivo mais forte que DX**: em 3 migrations sobre as operações reais, o Alembic teve **3 falhas silenciosas** (`CHECK` ignorado; `UNIQUE` não criada com a migration reportando sucesso; rename gerado como DROP+ADD, que apagaria todos os preços) contra **0** do drizzle-kit, e 5 edições à mão contra 1.

**Por que isso não virou o voto:** porque é consertável **de dentro do Python**. `alembic.autogenerate.compare_metadata`, usado como asserção pós-migration em vez de gerador, detectou a `UNIQUE` ausente e saiu com exit 1 (verificado). Com ~40 linhas no `make check`, as três falhas silenciosas viram barulhentas — ver consequências de D3 abaixo. O buraco do TypeScript **não** tem conserto disponível hoje.

**Alternativas ao Alembic, avaliadas:** **Atlas** (ariga.io v1.3.4) foi testado a pedido — reprovado por dois motivos independentes. O provider `atlas-provider-sqlalchemy` falhou três vezes num `models.py` de 45 linhas, a última derrubando o interpretador (`Fatal Python error: greenlet slp_switch`, por importar `greenlet/tests/fail_slp_switch.py`). E em modo schema-as-code o motor funciona bem, mas **repete o rename destrutivo do Alembic** — enquanto `atlas migrate lint`, a feature que detectaria isso, ficou **atrás de paywall** desde a v0.38. SQLModel usa Alembic por baixo; Piccolo substituiria o SQLAlchemy inteiro; Prisma Client Python tem manutenção irregular.

**O que faria reabrir:** `typescript-eslint` passar a suportar TS ≥ 7 (issue #10940) **e** a regra contra operador relacional em `Decimal` virar coisa pronta de biblioteca. Aí o buraco do TS fica tão barato quanto o do Python, e a vantagem do drizzle-kit em migrations + 1 comando de rename (contra 3) decide do outro lado.

**Status da cláusula de reabertura (verificado em 2026-09-22, durante F2): metade atendida, e D1 NÃO reabre.**
- ✅ **A primeira metade aconteceu, por outra ferramenta.** O lint type-aware do `oxlint` ficou estável em julho/2026 e o `tsgolint` (motor em Go sobre o typescript-go) chegou ao v7 estável em setembro/2026, cobrindo **59 das 61** regras type-aware do typescript-eslint e acompanhando o TypeScript 7.0.2. O `oxlint` também ganhou API de plugin compatível com ESLint, então regra customizada em JS/TS voltou a ser possível.
- ❌ **A segunda metade não.** Regra contra operador relacional em `Decimal` **não** está entre as 61 — continuaria sendo código próprio, as ~93 linhas já medidas. O critério era "virar coisa pronta de biblioteca", e não virou.
- **Medido em F2, e reforça a decisão:** mesmo com um tipo branded no front (`DecimalString`), `tsc` pega `valor * 2`, `valor / 2` e `valor.toFixed()`, mas **não pega** `valor + outro` (concatena) nem `valor > outro` (compara lexicograficamente). O buraco sobrevive ao brand. O que o protege aqui é arquitetura, não tipo: por D4 a conta mora no Python e o front só formata — exatamente o que não existiria na stack full-TS.

**Descartado como argumento** (não pesa pra nenhum lado): o eixo **pandas** inteiro. Ele entra, mas **na borda** — D11 o confina em `adapters/`, e a Sonda T mediu o preço exato: **4 regras relaxadas** no `pyrightconfig.json`, válidas só ali, e **um** `Any` num ponto de estrangulamento de 2 linhas. É melhor do que o IR-Helper tem hoje em `basic`, onde há `cast(Any, ...)` solto no meio da lógica. Também não pesam: cotações (`yahoo-finance2` cobre o mesmo que `yfinance` neste escopo — **não verificado**, e D6 põe qualquer um atrás da mesma interface); performance (irrelevante num app local); leitura de xlsx (SheetJS cobre `read_excel` — **não verificado**, risco baixo).

**Consequências:** F2 destravada. **D10 continua valendo** (React Router 7). **D11 vale**, com a adição do `MappedAsDataclass` abaixo. F3 precisa ser reescrita — o texto atual cita TanStack Start, que deixou de ser finalista.

### D2 — `Operation` é a fonte da verdade
**Status:** ✅ Decidida

**Contexto:** Posição, preço médio, patrimônio, rentabilidade, proventos e fiscal são todos funções das operações.
**Decisão:** Operações (compra, venda, eventos corporativos, transferências, aplicações/resgates de RF) são o único dado primário. Todo o resto é derivado e **recalculável do zero**; snapshots/séries materializadas são cache descartável.
**Por quê:** é o que permite corrigir uma operação antiga e ter todos os números consistentes de novo; é o desenho que já funciona no IR-Helper.
**Consequências:** qualquer tabela derivada precisa de um caminho de reconstrução; nunca editar um derivado à mão.

**Atualização (2026-09-23, F12):** as aplicações e os resgates de renda fixa são dado primário em `fixed_income_movements`, ao lado de `operations` e não dentro dela: a operação é quantidade × preço lida pelo motor de posição, e a movimentação de renda fixa é um fluxo de dinheiro. O título mora em `fixed_income_investments`, e a classe `fixed_income` saiu de `assets`. O valor marcado é derivado, recalculado a cada consulta das movimentações e das séries em cache.

### D3 — Um único banco SQLite, organizado por domínio
**Status:** ✅ Decidida

**Contexto:** Uma ideia inicial era ter bancos separados por app (IRPF × portfolio), mas partia de dois apps. Agora é um app só.
**Decisão:** Um SQLite, tabelas agrupadas por domínio (operações, mercado, portfolio, fiscal), em `data/` (fora do git).
**Por quê:** bancos separados recriam exatamente o problema de sincronização que motivou o projeto (N3).
**Consequências:** migrations desde o início (F4), com backup automático do `.db` antes de migrar — é dado financeiro real.

**Backup e resiliência (medido na Sonda M; aceite de F4):**
- **Nunca sincronizar o `.db` vivo** no Google Drive / OneDrive / Dropbox. Esses clientes sincronizam arquivos inteiros e não entendem os sidecars `-wal` / `-shm` / `-journal`, podendo subir o `.db` e o `-wal` em momentos inconsistentes; e o locking do SQLite depende de file locks que sistemas sincronizados não honram. Resultado: corrupção silenciosa ou "cópia em conflito".
- **Sincronizar snapshots, não o banco.** `VACUUM INTO` gera um snapshot **consistente com o banco aberto** — copiar o arquivo na mão é o que corrompe. Banco vivo em `data/` (fora do Drive); snapshot timestamped numa pasta do Google Drive Desktop, mantendo os N últimos. Mesmo primitivo antes de cada migration, gatilho diferente.
- **Armadilha verificada:** o `VACUUM INTO` **não pode** rodar na conexão que o Alembic usa. Rodando ali, o `VACUUM` força um commit implícito, a tabela `alembic_version` fica **vazia** e nenhum erro aparece — a migration "passa" sem registrar. Tem que ser conexão própria, em autocommit, **antes** do Alembic abrir a dele.

**Guarda contra falha silenciosa de migration (aceite de F4).** A Sonda M mediu 3 falhas silenciosas do Alembic. As três viram barulhentas com ~40 linhas no `make check`, rodadas **depois** de cada migration:
1. `alembic.autogenerate.compare_metadata(ctx, Base.metadata)` → pega coluna/tipo/índice/`UNIQUE` divergente (**verificado**: detectou a `UNIQUE` que o Alembic não criou, exit 1).
2. Asserção sobre `sqlite_master.sql` → presença das `CHECK` esperadas (o `compare_metadata` **não** enxerga `CheckConstraint` — mesmo ponto cego do autogenerate).
3. Asserção de `COUNT(*)` + soma de conferência antes/depois → pega rename gerado como DROP+ADD, que some com o dado sem mexer no schema.

**Atualização (2026-09-22, F4):** os guardas 1 e 2 são testes do `pnpm check`, sobre um banco novo migrado até o head. O guarda 3 saiu do `check`, porque lá não há dado para conferir, e foi para o start do app: toda migration pendente roda antes numa cópia (`VACUUM INTO`) do banco real e só é aplicada nele se nenhuma tabela perder linha ou célula preenchida e o `PRAGMA foreign_key_check` sair limpo. A "soma de conferência" virou contagem de células não nulas por tabela, que é genérica e enxerga o DROP+ADD. Uma consequência não prevista: a conexão de migration roda com FK desligada, porque o batch do SQLite recria a tabela; quem confere as FKs é o dry run. O snapshot roda a cada start, e não só antes de migrar, para uma pasta configurável que pode ser a do Drive.

### D4 — Dinheiro e quantidade em Decimal
**Status:** ✅ Decidida

**Decisão:** Valores monetários e quantidades são `Decimal` no domínio (nunca float), **TEXT** no SQLite, **string** no JSON; o front só formata.
**Por quê:** cálculo fiscal e preço médio não toleram erro de ponto flutuante; o IR-Helper já teve bug de decimais na edição de operação.

**Consequências verificadas nas sondas:**
- **No SQLite, Decimal vai como TEXT**, via `TypeDecorator` (~15 linhas). Não `Numeric(18,6)`: o SQLite grava `REAL` e o dialeto do SQLAlchemy quantiza em **6 casas** na leitura. Isso basta para o oráculo, mas **não** para preço médio calculado, que chega a 28 dígitos significativos numa dízima. Aceite de F4/F5.
- **`PlainSerializer` só cobre a saída.** Com ele, a resposta sai `"type": "string"` mas o schema de *request* sai `anyOf: [number, string]` — o front poderia mandar `0.1` como número JSON e perder precisão em silêncio. Fechar a entrada com `BeforeValidator` rejeitando `float` + `WithJsonSchema({"type": "string"})` (~20 linhas). Verificado: float rejeitado, string preservando escala (`"10.10"`, não `"10.1"`).
- **`alter_column(existing_type=...)` do Alembic não aceita o `TypeDecorator`** (`AttributeError: 'String' object has no attribute 'name'`); usar o tipo base (`sa.VARCHAR()`). E o autogenerate emite `models.DecimalText()` **sem gerar o import** — `NameError` ao aplicar. Acontece com todo `TypeDecorator` customizado.

**Consequências acrescentadas em F2 (2026-09-22):**
- **No front, Decimal é um tipo próprio, não `string`.** O DTO marca `format: "decimal"` no JSON schema e o hook `transform` do `openapi-typescript` mapeia isso num branded `DecimalString` (`frontend/types/decimal.ts`). Verificado: `valor * 2`, `valor / 2`, `valor.toFixed()` e passar string comum onde se espera Decimal **param de compilar**. Não pega `+` nem `>` — ver o status da cláusula de reabertura em D1.
- **Formatar não precisa de lib.** `Intl.NumberFormat` aceita string desde o ES2023 (overload `StringNumericLiteral`), então o valor vai do JSON até a tela sem passar por `float`. Por isso `DecimalString` é `` `${number}` & brand `` e não `string & brand`: é o que o torna aceitável pelo `Intl` sem cast.
- **Quando o front precisar de conta de verdade (F11, F15, F18, F26), a lib é `decimal.js` — não `bignumber.js`.** As duas são do mesmo autor, mas `decimal.js` trabalha com **dígitos significativos** (`Decimal.set({ precision: 28 })`), que é o modelo do `decimal` do Python (`context.prec`), enquanto `bignumber.js` trabalha com `DECIMAL_PLACES`. E foi `decimal.js` que a Sonda P mediu: 0 divergências contra o oráculo, incluindo as dízimas de 28 dígitos. Trocar de lib jogaria essa verificação fora. *(Ponto não medido, a conferir em F15: `decimal.js` tem `pow` com expoente fracionário, `ln` e `exp`; `bignumber.js` não.)*

**Atualização (2026-09-23, F11):** a carteira não precisou de `decimal.js`. Valor a mercado, fração da carteira e resultado saem prontos do backend, e o front só formata. A única conversão de Decimal para número é `toChartNumber`, para a geometria do donut, onde a precisão acaba no pixel.

### D5 — Rentabilidade principal por cota (TWR)
**Status:** ✅ Decidida

**Decisão:** A rentabilidade da carteira é medida por cota (time-weighted), que neutraliza aportes e resgates — o mesmo conceito do Status Invest. Retorno ponderado por dinheiro (XIRR) pode vir depois como visão complementar.
**Por quê:** sem neutralizar aportes, um aporte grande "parece" rentabilidade; e bater com o Status Invest é o critério de validação natural de N1.

### D6 — Dados de mercado atrás de uma interface, com cache local
**Status:** ✅ Decidida

**Decisão:** Cotações e séries (yfinance `.SA` para cotação; séries CDI/Selic/IPCA do BCB SGS) passam por uma interface de provider e são gravadas em cache diário local. O app funciona offline com o último valor conhecido. **Só fonte gratuita.**
**Por quê:** fontes gratuitas mudam e quebram; trocar de fonte não pode quebrar o core. O yfinance cobre as cotações da B3 e o BCB cobre CDI/Selic/IPCA.

**Consequências (2026-09-23, F10):**
- **O brapi saiu.** Era o fallback previsto, mas é pago, e o app opera só com o que é gratuito. Sem fallback, a interface ficou com um provider só. Se o yfinance quebrar, a alternativa gratuita é o arquivo de cotações históricas da B3 (COTAHIST), que entra atrás da mesma interface.
- **O refresh parte do front**, ao abrir o app e pelo botão da tela Mercado. O `create_app` segue sem tocar no banco.
- **O fechamento é o que o yfinance entrega:** ajustado por desdobramento e grupamento, não por provento. A série histórica de F14 converte a quantidade pelos eventos de `operations`, e isso se confere contra a carteira real.

**Consequências (2026-09-23, F12):**
- **As séries do BCB têm interface própria**, `IndexSeriesProvider`, e cache em `index_history`. O provider do SGS usa `urllib` da stdlib, sem dependência nova, e lê o `valor` como string: a taxa não passa por float.
- **O calendário de dias úteis é o do CDI publicado.** Depois do último dado, a marcação repete o último valor e a tela diz até quando o dado é real — é o "último valor conhecido" desta decisão, aplicado às séries.

### D8 — IR-Helper absorvido e aposentado: `irpf_helper.db` como oráculo de paridade
**Status:** ✅ Decidida

**Decisão:** O `irpf_helper.db` fica **intocado** e serve de oráculo: os testes de paridade comparam posição, PM e depois DARF contra ele. O IR-Helper só é aposentado (F23) depois da paridade fiscal (F21) e de uma declaração feita só com o relatório novo (F22). Até lá o IR-Helper segue sendo a ferramenta fiscal.
**Por quê:** portar com teste de paridade é o que garante que a fonte única (N3) não piora nenhum número. A ordem em que os módulos são portados (core → patrimônio → fiscal) já está expressa nos marcos M1→M5 do ROADMAP; não precisa estar aqui também.

### D10 — Roteamento: React Router 7
**Status:** ✅ Decidida

**Decisão:** React Router 7, como nos repos irmãos (se D1 = FastAPI + Vite; com TanStack Start o router é o TanStack Router, que vem junto). Montado no scaffold (F2).
**Por quê:** consistência e zero curva. Reavaliar TanStack Router se filtros de dashboard na URL (período, categoria) começarem a doer.

### D11 — Tipagem do backend: nenhum `dict` cru atravessa fronteira
**Status:** ✅ Decidida

**Contexto:** A dor real de tipagem nos projetos anteriores foi **no Python** (dicts aninhados, `Any` se espalhando), resolvida por arquitetura no SimuladorFinanceiro. Vale se D1 = Python.
**Decisão:**
- **Pydantic** onde o dado entra ou sai e precisa ser validado/serializado: request/response da API, config, respostas de fontes externas, linhas de importação B3/PDF depois do parse.
- **`@dataclass(frozen=True, slots=True, kw_only=True)`** no domínio/cálculos (posição, estado mensal, TWR, DARF): sem custo de validação em loop, imutável, entendido nativamente pelo pyright.
- SQLAlchemy 2 com `Mapped[...]`; repositories devolvem dataclass/DTO, nunca `Row`/dict.
- `dict[str, Any]` só dentro de `adapters/` (pandas, yfinance), que convertem pra modelo tipado na hora.
- **pyright `strict`** desde o dia 1 (no Simulador está `basic`; é o strict que pega `Unknown` se espalhando). Relaxar regras só nos arquivos de `adapters/`.
- Front: só `openapi-typescript` (tipos), com o OpenAPI gerado **offline** a partir do app (sem servidor de pé, sem `wait-on`). Sem openapi-fetch/openapi-react-query.
- **SQLAlchemy com `MappedAsDataclass`** (`class Base(MappedAsDataclass, DeclarativeBase)`), PK autoincrement com `init=False`.
**Por quê:** é o padrão que já funcionou no Simulador, levado um passo além (strict) num projeto que começa do zero, onde o custo é mínimo.

**Validado pela Sonda T, com dois ajustes:**
- O padrão **fecha em `pyright strict` com 0 erros** e **zero** escape hatches fora de `adapters/`. Dentro de `adapters/`: 4 regras relaxadas no `pyrightconfig.json` (via `executionEnvironments`, com `extraPaths: ["."]`, senão a resolução de import quebra) e **um** `Any` num ponto de estrangulamento de 2 linhas — melhor do que o IR-Helper tem hoje em `basic`, com `cast(Any, ...)` solto no meio da lógica.
- **`MappedAsDataclass` é obrigatório, não opcional.** Sem ele o `strict` tem um furo: `DeclarativeBase.__init__` é `(**kw: Any)`, então `Operation(campo_que_nao_existe=42)` passa com **0 erros** e só explode em runtime. Verificado: com `MappedAsDataclass`, o pyright acusa kwarg inexistente **e** argumento faltando.
- Geração offline do `openapi.json` via `app.openapi()` **funciona** — sem servidor, sem `wait-on`. O ciclo rename → erro no front custa **3 comandos** (`export_openapi` → `openapi-typescript` → `tsc`) e pegou 2/2 sites. Encadear no `dev` e no `make check` para o codegen não ficar defasado.

**Aplicado e estendido em F2 (2026-09-22):**
- O padrão fechou **no projeto real**, não só na sonda: `pyright strict` em 0 erros e **zero** `# type: ignore` / `cast(` / `Any` em `backend/`, `scripts/`, `tests/` e `main.py`. A pasta `backend/adapters/` já nasce com as quatro regras relaxadas declaradas, mesmo vazia.
- **O domínio não importa `fastapi`.** A hierarquia de `HTTPException` do SimuladorFinanceiro foi descartada: ela arrastaria HTTP pra dentro do domínio, que por D2 é função pura e roda headless nas suítes de paridade de F8/F21 — e metade dela (`Unauthorized`, `Forbidden`) nasceria morta num app local sem auth. No lugar: `FinanceError` com o `status` como **atributo de classe**, e um handler só em `backend/app.py` traduzindo pro envelope.
- **Envelope de erro único:** todo 4xx/5xx sai como `{"detail": "<string>"}`. Inclui um handler de `RequestValidationError` que achata o 422 — sem ele o `detail` do 422 é uma **lista**, e o `getApiErrorMessage` do front (que os dois repos irmãos já usam) fica mudo justamente no erro que a validação de D4 produz.
- **O `api.ts` do front é tipado contra `paths`** do `openapi.generated.ts`, em vez de aceitar URL livre com `<T>` escolhido à mão. Verificado: path inexistente e campo inexistente na resposta viram erro de `tsc`. Fecha a maior parte do ganho do `openapi-fetch` sem a dependência nem mudar o contrato de erro. **O que faria adotar `openapi-fetch`:** essas generics ficarem caras de manter quando o número de endpoints crescer (provável a partir de F9) — ele entraria **por baixo** do `api.ts`, como detalhe de implementação.
- **`openapi-fetch` medido em F9 e recusado (2026-09-23):** o gatilho acima chegou, e a lib foi instalada. A partir da 0.16 ela passa toda resposta pelo `Readable<T>` do `openapi-typescript-helpers`, que mapeia qualquer `T extends object`; o `DecimalString` (`` `${number}` & brand ``) cai nesse caso e vira um objeto com os métodos de string, sem o brand, e o `formatBRL` deixa de aceitá-lo. A 0.15 não tem esse mapeamento, mas fixar versão foi descartado. O `api.ts` ganhou à mão o que faltava: path param (`{ path }`, obrigatório quando o endpoint declara), query (`{ query }`), JSON (`{ body }`) e upload (`{ form }`, virando `FormData`), tudo derivado de `paths`. O gerador de tipos passou a mapear o upload (`contentMediaType` binário) em `Blob`. Verificado: path faltando, query inexistente, body faltando e Decimal como string comum viram erro de `tsc`. **O que faria reabrir:** o `Readable` preservar primitivo com brand.
- **Codegen sem arquivo intermediário (2026-09-22, F4):** o `export_openapi.py` escreve o schema no stdout e o `generate-types.mjs` o lê em memória. Continua offline, sem servidor. O JSON sai em ASCII, porque o pipe do Windows (cp1252) corrompia os acentos com UTF-8.
- **Ferramental do front, medido:** `openapi-typescript` declara peer `typescript: ^5.x` e **quebra com TypeScript 7** (`ts.factory` não existe no port em Go). O front fica no TS 6. O lint é `oxlint` com type-aware (`oxlint-tsgolint`), que traz os próprios binários e **não** depende do pacote `typescript` local — por isso as duas coisas convivem.
