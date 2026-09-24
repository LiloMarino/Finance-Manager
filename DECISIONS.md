# Decisões — Finance Manager

> O "porquê" do projeto: **necessidades** (`N#`, por que construir) e **decisões transversais** (`D#`, por que desse jeito — só as que já condicionam alguma feature concreta). Segue a metodologia da skill `feature-roadmap`. Companion: [ROADMAP.md](ROADMAP.md) — lá está o "o quê construir, em que marco e em que estado"; aqui não há status de implementação.
>
> **Regra de sincronização:** os dois documentos usam os mesmos IDs (`N#`, `D#`) e devem sempre concordar. Ao criar/alterar um `N#`/`D#` aqui, espelhar no ROADMAP via `roadmap.py upsert-ref` na mesma resposta.
>
> **Última mudança (2026-09-24):** D6 ganhou o cache em três camadas, idempotente com o cache em dia; D13 põe o estado da tela na URL; N9 separa as ferramentas de decisão (comparador de renda fixa, correlação de ativo novo, simulação de parcelamento) das análises da carteira; as séries do BCB ficam inteiras no cache.

---

## Contexto

Dashboard pessoal de investimentos, **local-first**: roda em 127.0.0.1, sem autenticação, sem nuvem, sem multiusuário — os dados ficam num SQLite na própria máquina. Privacidade dos dados financeiros é parte do motivo do projeto; auth e cloud seriam complexidade sem uso. Substitui os agregadores de carteira — que desincronizam da B3 e escondem o que importa atrás de plano pago — e as planilhas de controle, e centraliza a vida de investimentos num lugar só.

Absorve projetos irmãos que falam do mesmo domínio, pra acabar com a sincronização manual entre eles:
- **IR-Helper** — operações reconciliadas entre notas de corretagem (PDF) e o portal da B3 (xlsx), preço médio, eventos corporativos, DARF e prejuízo acumulado. Absorvido e aposentado (D8).
- **Script de rebalanceamento** — yfinance + arquivo de metas + alerta agendado no sistema, e a planilha de rebalanceamento ao lado dele. Viram o rebalanceamento do app.
- Ideias reaproveitáveis (não absorvidos): marcação de renda fixa do [SimuladorFinanceiro](https://github.com/LiloMarino/SimuladorFinanceiro) e do [Comparador-Renda-Fixa](https://github.com/LiloMarino/Comparador-Renda-Fixa).

O app cobre **só o financeiro de investimentos**, separado dos gastos pessoais: saldo em conta corrente não entra. O dinheiro de investimento que fica parado mora em renda fixa de liquidez diária.

Classes de ativo no escopo: **ações/FII/ETF/BDR da B3 e renda fixa/Tesouro**. Ativos no exterior e cripto ficam de fora: exigiriam câmbio e outra regra fiscal inteira, e ficam fora do escopo até haver uso real para eles. O app acompanha a própria carteira: notícias e indicadores fundamentalistas não entram, e para uma decisão que ainda não foi tomada ele oferece ferramentas de simulação sobre os dados que já tem: a correlação pelo preço histórico, e a comparação de renda fixa e a simulação de parcelamento pelas séries do BCB. A simulação não grava gasto nenhum: é conta sobre valores digitados na hora.

---

## Necessidades

**N1. Medir rentabilidade real ⭐**
Saber se os investimentos estão de fato rendendo: a rentabilidade no tempo contra CDI, IPCA e IBOV, e a comparação mês a mês e ano a ano, que é a visão mais consultada. Vale para a carteira inteira, uma subcarteira, uma categoria ou um ativo.

**N2. Ver o patrimônio consolidado**
Quanto tenho hoje e como isso evoluiu: total, por categoria, por setor e segmento, e a posição de cada ativo com a variação do dia e desde a compra — incluindo renda fixa, não só bolsa.

**N3. Posições e preço médio corretos, numa fonte única**
Os números têm que bater com a realidade (B3 + notas de corretagem), inclusive nos casos em que o próprio xlsx da B3 é incompleto. E sem ter que sincronizar a mesma informação em dois sistemas.

**N4. Acompanhar proventos**
Quanto recebi de dividendos, JCP e rendimentos, de quais ativos, mês a mês, e quanto cada ativo rende sobre o que paguei por ele — com um histórico que dá para auditar.

**N5. Resolver as obrigações fiscais no mesmo lugar**
DARF mensal e dados da declaração anual (IRPF), sem manter um app separado pra isso.

**N6. Rebalancear sem planilha**
Definir a meta da carteira, ver o desvio de cada item, saber onde pôr cada real do próximo aporte sem tentativa e erro, e ser avisado quando o desvio passar do limite.

**N7. Subcarteiras**
Separar investimentos que não quero misturar, como estratégias diferentes, e ver cada grupo em todas as visões da carteira, com meta própria.

**N8. Análises extras**
Risco × retorno dos ativos e da carteira, e a correlação entre os ativos da carteira.

**N9. Avaliar uma decisão financeira antes de tomá-la**
Comparar opções de renda fixa pelo que rendem de fato, líquido de IR; ver como um ativo que ainda não tenho anda junto com outro; e saber se compensa pagar à vista, parcelar deixando o dinheiro investido, ou adiantar parcelas com desconto. Cada ferramenta mostra o resultado em gráfico, além dos números.

---

## Decisões

> Só entra aqui a decisão que já condiciona uma feature concreta do roadmap (ver `methodology.md` seção 3).

### D1 — Stack: FastAPI + Vite
**Status:** ✅ Decidida

**Decisão:** Python 3.13 com FastAPI no backend; React SPA com Vite, TanStack Query, Tailwind e shadcn no front.

**Por quê:** cada stack candidata (esta e Next full TypeScript) tem **um** buraco que o type-checker não cobre, e eles falham de formas opostas:

| | Python | TypeScript |
|---|---|---|
| Buraco | construtor SQLAlchemy aceita kwarg inexistente | `>` `>=` `<=` `===` entre `Decimal` |
| Onde dói | criar/editar um modelo | todo o motor fiscal, que é comparação de limiar |
| Como falha | `TypeError` na primeira execução | número errado, em silêncio |
| Conserto | `MappedAsDataclass`, 1 linha | ~93 linhas de regra de lint própria |

Medido: `new Decimal(20000) >= new Decimal(3000)` devolve `false` (comparação lexicográfica), e o `tsc --strict` não acusa. Num app que emite DARF e cujo critério é "os números têm que bater", isso decidiu.

**Evidência:** quatro sondas descartáveis, cada uma testando a fraqueza de um lado. O motor fiscal do IR-Helper (591 linhas) portado para TypeScript bateu com o oráculo em todos os campos, então precisão decimal não diferencia as stacks — segurança de operador diferencia. A espinha de tipagem Python fechou em `pyright strict` com 0 erros e nenhum escape hatch fora de `adapters/`. `pdfplumber` e `pdfjs-dist` extraíram as mesmas linhas de negociação das notas, com 55 linhas de montagem de layout a mais no JS. O Alembic teve 3 falhas silenciosas em 3 migrations, fechadas pelos guardas da D3.

**Consequências:** o buraco do TypeScript continua existindo no front, e a D4 o contorna mantendo toda conta no Python. Reabre se aparecer regra pronta de lint contra operador relacional em `Decimal` no TypeScript: aí as duas stacks empatam nesse eixo.

### D2 — Dado primário por família de ativo; o resto é derivado
**Status:** ✅ Decidida

**Decisão:** cada família de ativo tem o seu dado primário, na tabela que descreve como ela se comporta:
- **renda variável** (ações, FII, ETF, BDR): `operations`, quantidade × preço, com os eventos corporativos e as transferências;
- **renda fixa:** o título em `fixed_income_investments` e as aplicações e resgates em `fixed_income_movements`, que são fluxo de dinheiro.

Uma família nova ganha tabela própria quando não se comporta como nenhuma das duas. Proventos, DARF pago e a configuração do usuário (metas, subcarteiras, setores) também são dado primário, cada um na sua tabela.

Todo o resto — posição, preço médio, valor marcado, patrimônio, rentabilidade, apuração fiscal — é derivado e recalculável do zero. Tabela materializada é cache descartável, reconstruída do dado primário.

**Por quê:** corrigir uma operação antiga deixa todos os números consistentes de novo, sem reconciliação. E o motor de posição lê quantidade × preço: renda fixa, que é fluxo de dinheiro, mora ao lado dele e não dentro.

**Consequências:** toda tabela derivada tem um caminho de reconstrução, e derivado só muda por recálculo.

### D3 — Um único SQLite, com snapshot e migration testada
**Status:** ✅ Decidida

**Decisão:** um SQLite em `data/`, com as tabelas agrupadas por domínio (operações, mercado, carteira, fiscal) e o schema versionado por Alembic.

**Por quê:** bancos separados recriariam a sincronização que motivou o projeto (N3).

**Consequências:**
- A cada start, antes do uvicorn: um snapshot com `VACUUM INTO`, numa pasta configurável (pode ser a do Drive), mantendo os mais recentes; depois, as migrations pendentes rodam numa cópia do banco e só chegam ao real se nenhuma tabela perder linha ou célula preenchida e o `foreign_key_check` sair limpo.
- O `VACUUM INTO` roda em conexão própria, antes da conexão do Alembic: o commit implícito do `VACUUM` esvaziaria a `alembic_version` sem erro nenhum.
- O banco vivo fica fora de pasta sincronizada, porque cliente de sincronização copia o `.db` e o `-wal` em momentos diferentes e ignora os locks do SQLite. O que vai para a nuvem são os snapshots.
- Os pontos cegos do Alembic (`CHECK` que o autogenerate não vê, `UNIQUE` em batch não criada com sucesso reportado, rename gerado como DROP+ADD) são pegos: os dois primeiros por testes do `pnpm check` (`compare_metadata` e cada `CHECK` presente no DDL), o terceiro pelo dry run do start.
- O dry run recusa também drop de coluna com dado; o primeiro drop legítimo dá à migration uma lista de perdas declaradas.

### D4 — Dinheiro e quantidade em Decimal
**Status:** ✅ Decidida

**Decisão:** `Decimal` no domínio, TEXT no SQLite (`DecimalText`), string no JSON (`DecimalStr` na saída, `DecimalStrIn` na entrada, que recusa número JSON) e `DecimalString` com brand no front. A conta mora no Python; o front só formata.

**Por quê:** preço médio e imposto não toleram erro de ponto flutuante, e um PM calculado chega a 28 dígitos numa dízima.

**Consequências:**
- TEXT e não `Numeric`: no SQLite, `Numeric` grava REAL e o SQLAlchemy quantiza em 6 casas na leitura.
- No front, o brand faz `*`, `/`, `toFixed` e string comum no lugar de Decimal pararem de compilar; `+` e `>` passam, e é por isso que a conta fica no backend.
- `Intl.NumberFormat` formata a string direto, sem passar por float. A única saída de Decimal para número é `toChartNumber`, para a geometria de gráfico.
- Medida estatística (volatilidade, correlação) não é dinheiro: é float, calculada no Python.

### D5 — Rentabilidade medida por cota
**Status:** ✅ Decidida

**O problema:** um patrimônio que foi de R$ 10.000 para R$ 12.000 não rendeu 20% se R$ 1.500 disso foram aporte — o ganho foi R$ 500. Para dar a rentabilidade em percentual, o dinheiro que entrou e saiu precisa sair da conta.

**Decisão:** a rentabilidade é a variação de uma **cota**, o mesmo mecanismo da cota de um fundo de investimento (o nome técnico é TWR, *time-weighted return*, "retorno ponderado pelo tempo"):
- a carteira começa com a cota valendo 1,00;
- todo dia a cota varia só pelo que os ativos subiram ou caíram, e pelo que pagaram de provento;
- um aporte "compra cotas" pelo valor do dia, e um resgate as vende: muda o número de cotas, não o valor da cota.

A rentabilidade de qualquer período é a variação da cota nele. Cota de 1,20 no início do ano e 1,32 no fim é 10% no ano (1,32 ÷ 1,20 = 1,10), tanto faz se o aporte do ano foi R$ 100 ou R$ 100 mil. E os períodos se compõem em vez de somar: 1% num mês e 2% no seguinte dão 3,02% nos dois (1,01 × 1,02), não 3%.

**A alternativa:** o retorno ponderado pelo dinheiro (XIRR, "taxa interna de retorno") responde "que taxa anual transformaria exatamente estes aportes neste patrimônio". Ele pesa mais os períodos com mais dinheiro aplicado: um mês ruim logo depois de um aporte grande derruba o número mais do que o mesmo mês com a carteira pequena. Mede "quanto o meu dinheiro rendeu", mas depende de quando se aportou, e por isso não compara um mês com outro nem a carteira com o CDI.

**Por quê cota:**
- a comparação com CDI, IPCA e IBOV é de igual para igual, porque índice também é uma cota;
- um mês se compara com outro mesmo com aportes diferentes, que é o que a tabela mês × ano precisa;
- é a medida que os agregadores publicam: a tabela mês × ano de referência compõe os meses no ano e os anos no acumulado, conta que só fecha com cota. Isso dá um critério externo de conferência.

**Consequências:** a série diária registra o dinheiro que entrou ou saiu em cada dia separado da variação de valor.

### D6 — Dados de mercado atrás de interface, com cache local e só fonte gratuita
**Status:** ✅ Decidida

**Decisão:** cotações pelo `MarketDataProvider` (yfinance, `TICKER.SA`) e séries do BCB SGS (CDI, Selic, IPCA) pelo `IndexSeriesProvider`, cada um com cache local (`price_history`, `index_history`). O app funciona offline com o último valor conhecido, e a tela diz até que data o dado é real. Só fonte gratuita.

**Por quê:** fonte gratuita muda e quebra, e trocar de fonte fica restrito a `adapters/`.

**O cache tem três camadas: tela → banco → fonte externa.** A tela lê só o banco. O front pede o refresh ao abrir o app e pelo botão da tela Mercado, e quem decide se vai à rede é o backend: a fonte só é consultada quando falta um dado que já devia existir (o último pregão fechado, a última publicação do BCB), dentro do período em que ele é necessário, e no máximo uma vez por intervalo. Para cotação, o período necessário são os dias em que houve posição no ativo: a renda variável tem milhares de tickers, e o cache guarda só os da carteira. As três séries do BCB (CDI, Selic, IPCA) ficam inteiras no cache, desde o início de cada uma, porque servem toda a renda fixa, os benchmarks e as ferramentas. Com o cache em dia, o refresh é idempotente e não sai da máquina, por mais vezes que seja chamado.

**Consequências:**
- O `create_app` não toca no banco: o refresh é uma chamada como as outras.
- Ativo vendido deixa de ser consultado assim que o cache cobre o período em que houve posição, então um ticker que sai da bolsa depois da venda não gera aviso.
- Falta de dado só vira aviso quando cai dentro de um período necessário.
- O fechamento é ajustado por desdobramento e grupamento, não por provento: a série histórica converte a quantidade pelos eventos de `operations`.
- Dia útil é dia com CDI publicado; depois do último dado, dia de semana.
- Se o yfinance quebrar, a alternativa gratuita é o arquivo de cotações históricas da B3 (COTAHIST), atrás da mesma interface.

### D8 — IR-Helper aposentado; o banco dele é oráculo de posição e PM
**Status:** ✅ Decidida

**Decisão:** tudo o que o IR-Helper fazia existe aqui, e ele deixa de ser usado; o repositório dele fica como está. O `irpf_helper.db` é lido só em `mode=ro` e serve de oráculo: posição e PM batem com ele campo a campo. O motor fiscal segue as regras da Receita, e o IR-Helper é conferência: cada diferença com ele se explica por uma regra.

**Por quê:** portar com conferência garante que a fonte única (N3) não piora nenhum número. No fiscal, o IR-Helper diverge da Receita em três pontos (Perguntas e Respostas IRPF 2026, perguntas 704, 705 e 709; IN RFB 1.585/2015, art. 37): compensa o prejuízo venda a venda, e não pelo resultado do mês; mantém um prejuízo por classe, quando ações, ETF e BDR em operação comum se compensam entre si; e calcula o day trade pelo PM da carteira, e não pareando as compras e vendas do dia. O app é a referência para decidir se e quando emitir DARF.

### D10 — Roteamento: React Router 7
**Status:** ✅ Decidida

**Decisão:** React Router 7 (`react-router-dom`) para a navegação dentro do SPA.
**Por quê:** é o roteador que o autor usa nos outros projetos: zero curva.

### D11 — Tipagem: Pydantic nas bordas, dataclass no domínio, pyright strict
**Status:** ✅ Decidida

**Decisão:**
- Pydantic onde o dado entra ou sai: request e response da API, config, resposta de fonte externa, linha de importação depois do parse.
- `@dataclass(frozen=True, slots=True, kw_only=True)` no domínio (posição, apuração, marcação).
- SQLAlchemy 2 com `Mapped[...]` e `Base(MappedAsDataclass, DeclarativeBase)`, que faz o pyright acusar kwarg inexistente ou faltando no construtor do modelo. Repository devolve dataclass ou DTO.
- `pyright strict` sem `# type: ignore`, `cast(` ou `Any`. `dict` cru e pandas ficam em `backend/adapters/`, que tem regras relaxadas e converte tudo em tipo na saída.
- Front: tipos gerados por `openapi-typescript` do OpenAPI exportado offline, sem servidor de pé; o `api.ts` é tipado contra `paths` (path, query, body e upload).

**Por quê:** a dor de tipagem dos projetos anteriores era dict aninhado e `Any` espalhado no Python, e `strict` desde o primeiro dia custa pouco.

**Consequências:** o `openapi-fetch` fica fora. A partir da 0.16 ele passa toda resposta pelo `Readable<T>`, que trata o `DecimalString` como objeto e tira o brand. Reabre se o `Readable` preservar primitivo com brand.

### D12 — Subcarteira: seletor em toda visão de carteira, cada ativo em uma só
**Status:** ✅ Decidida

**Decisão:**
- Toda visão que fala de "carteira" — posição, composição, setor, evolução do patrimônio, rentabilidade, ano a ano, proventos, correlação, risco × retorno e a meta de rebalanceamento — tem um seletor: a carteira geral, com tudo, ou uma subcarteira, só com o que é dela.
- Cada ativo (e cada título de renda fixa) está em no máximo uma subcarteira, inteiro. Ativo sem subcarteira aparece só na carteira geral.
- A meta de rebalanceamento é da subcarteira. A carteira geral é o conjunto de tudo e não tem meta própria; a meta dela, quando mostrada, é a combinação das metas das subcarteiras.
- A subcarteira é o conjunto de ativos de hoje: mover um ativo de subcarteira recalcula o histórico das duas como se ele sempre tivesse estado na nova.

**Por quê:** a soma das subcarteiras nunca passa da carteira geral, nada conta duas vezes, e a meta de rebalanceamento de cada subcarteira se calcula sozinha, sem duas metas puxando o mesmo ativo para lados opostos. Colocar o mesmo ativo inteiro em várias subcarteiras quebraria as duas coisas. Dividir o ativo por quantidade resolve a foto de hoje, mas o histórico precisaria saber de quem era cada cota em cada dia.

**Expansão, se a carteira ficar complexa:** o caso que esta decisão não cobre é o mesmo ticker servindo a duas estratégias. A saída é marcar cada operação com a subcarteira: cada subcarteira vira uma conta separada, com posição, PM e rentabilidade próprios, somando a geral. A marcação é opcional (a operação sem subcarteira fica só na geral), então o cadastro comum não muda. O PM da subcarteira passa a diferir do PM fiscal, que é do ativo inteiro.

### D13 — O estado da tela mora na URL
**Status:** ✅ Decidida

**Decisão:** o que define o que a tela mostra — período, mês, filtros, aba e a carteira selecionada — fica nos search params da URL, lido e escrito pelo React Router (`useSearchParams`). O estado local do componente guarda só o que é passageiro, como um modal aberto.
**Por quê:** recarregar a página ou voltar no navegador mantém a tela, um link abre direto no mesmo lugar, e navegar pelas setas muda algo visível: a URL confirma que a navegação aconteceu.
