<!-- ARQUIVO GERADO POR scripts/roadmap.py (skill feature-roadmap) -- NÃO EDITAR À MÃO. -->

> ⚠️ **Este arquivo é gerado automaticamente — não edite manualmente.** Toda mudança (inserir/mover/concluir/descartar/remover um card, cadastrar ou atualizar uma necessidade/decisão/marco, o cabeçalho) passa por `scripts/roadmap.py` (ver `SKILL.md`); uma edição direta aqui é sobrescrita sem aviso na próxima regeneração.

# Roadmap — Finance Manager

> Kanban de features, segue a metodologia da skill `feature-roadmap`. Companion: [DECISIONS.md](DECISIONS.md) — lá está o "porquê" (necessidades `N#` e decisões `D#`); aqui fica só o "o quê construir, em que marco e em que estado está".
>
> **Regra de sincronização:** os dois documentos usam os mesmos IDs (`N#`, `D#`) e devem sempre concordar sobre a decisão vigente de cada item.
>
> **Última mudança (2026-09-25):** Concluídos os benchmarks CDI, IPCA e IBOV (F16, com o IBOV no cache das séries) e a comparação ano a ano (F18): o M3 fecha.

## Glossário

> Descrição completa de cada `N#`/`D#` em `DECISIONS.md`; `F#` é espelho do kanban abaixo. "Condiciona" é derivado dos cards: as `F#` que citam aquele `N#`/`D#`.

| ID | Resumo | Condiciona (F#) | Status |
| --- | --- | --- | --- |
| **N1** | Medir rentabilidade real (contra CDI/IPCA/IBOV, mês a mês e ano a ano; carteira, subcarteira, categoria ou ativo) | F14, F15, F16, F17, F18, F41 | — |
| **N2** | Ver o patrimônio consolidado (total, categoria, setor, posição com variação do dia, evolução; inclui RF) | F10, F11, F12, F14, F17, F32, F36, F37, F40, F41, F42, F44, F46, F50, F52 | — |
| **N3** | Posições e preço médio corretos, numa fonte única | F1, F2, F3, F4, F5, F6, F7, F8, F9, F33, F34, F40, F42, F45, F50, F51 | — |
| **N4** | Acompanhar proventos (quanto, de quem, mês a mês, yield on cost; histórico auditável) | F20, F38 | — |
| **N5** | Resolver as obrigações fiscais (DARF, IRPF) no mesmo lugar | F20, F21, F22, F23, F33, F34, F35, F46, F48, F51 | — |
| **N6** | Rebalancear sem planilha (meta, desvio, divisão do aporte, alerta) | F24, F28, F32 | — |
| **N7** | Subcarteiras: grupos separados, vistos em todas as visões da carteira | F25 | — |
| **N8** | Análises extras: risco × retorno e correlação da carteira | F10, F26, F39 | — |
| **N9** | Avaliar uma decisão financeira antes de tomá-la (comparar renda fixa, correlação de ativo novo, à vista × parcelado) | F27, F47, F49 | — |
| **F19** | Spike: proventos no relatório de movimentação da B3 | — | 🔍 |
| **F20** | Proventos: registro e histórico | — | ⏳ |
| **F24** | Rebalanceamento | — | ⏳ |
| **F25** | Subcarteiras | — | ⏳ |
| **F26** | Risco × retorno | — | 💤 |
| **F27** | Ferramenta de correlação entre dois ativos | — | ⏳ |
| **F28** | Alerta de rebalanceamento com o app fechado | — | ⏳ |
| **F29** | Empacotamento desktop | — | 🔍 |
| **F30** | Identidade visual própria (sair do tema padrão do shadcn) | — | 🔍 |
| **F31** | Hot-reload do backend não reinicia o worker | — | 🔍 |
| **F32** | Liquidez em três camadas | — | ⏳ |
| **F33** | Custo da bonificação | — | ⏳ |
| **F34** | Taxas da nota no resultado | — | 💤 |
| **F35** | IRRF abatido do DARF | — | 💤 |
| **F38** | Desempenho e distribuição dos proventos | — | ⏳ |
| **F39** | Correlação da carteira | — | ⏳ |
| **F43** | Sidebar | — | ⏳ |
| **F44** | Carteira: layout, gráfico e cor | — | ⏳ |
| **F45** | Operações: filtros e seletor de ativo | — | ⏳ |
| **F47** | Comparador de renda fixa | — | ⏳ |
| **F48** | Fiscal: navegação por mês na URL | — | ⏳ |
| **F49** | Simulador: à vista, parcelado ou adiantar a fatura | — | ⏳ |
| **F50** | Tabelas: linha inteira clicável e dica no cabeçalho | — | ⏳ |
| **F51** | Máscaras nos campos | — | ⏳ |
| **F52** | Setor e segmento sugeridos pelo yfinance | — | ⏳ |

<details>
<summary><strong>Concluído / decidido / descartado (38 itens — clique pra expandir)</strong></summary>

| ID | Resumo | Condiciona (F#) | Status |
| --- | --- | --- | --- |
| **D1** | Stack: FastAPI + Vite | F1, F2 | ✅ |
| **D2** | Dado primário por família de ativo (RV em operations, RF em tabelas próprias); o resto é derivado | F5, F8, F14, F17, F20 | ✅ |
| **D3** | Um único SQLite, com snapshot e migration testada | F4 | ✅ |
| **D4** | Dinheiro e quantidade em Decimal (string no JSON) | F5, F26, F36 | ✅ |
| **D5** | Rentabilidade medida por cota (TWR) | F15, F18 | ✅ |
| **D6** | Dados de mercado atrás de interface; cache em três camadas, idempotente; só fonte gratuita | F10, F12, F14, F16, F41, F52 | ✅ |
| **D8** | IR-Helper aposentado; o banco dele é oráculo de posição e PM | F1, F7, F8, F21, F23 | ✅ |
| **D10** | Roteamento: React Router 7 | F2 | ✅ |
| **D11** | Tipagem: Pydantic nas bordas, dataclass no domínio, pyright strict | F3 | ✅ |
| **D12** | Subcarteira: seletor em toda visão de carteira, cada ativo em uma só | F24, F25 | ✅ |
| **D13** | O estado da tela mora na URL | F25, F45, F48 | ✅ |
| **F1** | Spike de stack (resolve D1) | — | ✅ |
| **F2** | Scaffold do projeto na stack escolhida | — | ✅ |
| **F3** | Tipagem ponta a ponta | — | ✅ |
| **F4** | Migrations + backup automático do banco | — | ✅ |
| **F5** | Modelo de domínio: ativos, operações e eventos | — | ✅ |
| **F6** | Importadores B3 (xlsx) e notas de corretagem (PDF) | — | ✅ |
| **F7** | Migração dos dados do IR-Helper | — | ✅ |
| **F8** | Engine de posição e preço médio + paridade | — | ✅ |
| **F9** | Telas de operações, ativos e posição atual | — | ✅ |
| **F10** | Provider de dados de mercado + cache de preços | — | ✅ |
| **F11** | Carteira: patrimônio total, por categoria e posição | — | ✅ |
| **F12** | Renda fixa: cadastro e marcação por indexador | — | ✅ |
| **F13** | Caixa e reserva | — | 🚫 |
| **F14** | Série diária por ativo | — | ✅ |
| **F15** | Desempenho de rentabilidade | — | ✅ |
| **F16** | Benchmarks: CDI, IPCA e IBOV | — | ✅ |
| **F17** | Evolução do patrimônio | — | ✅ |
| **F18** | Comparação ano a ano | — | ✅ |
| **F21** | Motor fiscal: apuração mensal, DARF e prejuízo acumulado | — | ✅ |
| **F22** | Relatório anual do IRPF | — | ✅ |
| **F23** | Paridade funcional com o IR-Helper | — | ✅ |
| **F36** | Posição por categoria com variação do dia | — | ✅ |
| **F37** | Setor e segmento cadastrados | — | ✅ |
| **F40** | Troca de ticker como renomeação | — | ✅ |
| **F41** | Cache de dados externos idempotente | — | ✅ |
| **F42** | Painel de saúde dos dados | — | ✅ |
| **F46** | Renda fixa: tipo do produto, Selic + spread e aplicação no cadastro | — | ✅ |

</details>

---

## 🚦 Livre pra pegar

> Derivado do grafo de dependências: as `F#` que podem ser pegas agora — toda dependência já ✅. "Destrava" é quantas `F#` em aberto esperam por ela, direta ou indiretamente; é por aí que a tabela está ordenada. 💤 (sem prioridade) e 🚫 não entram.

| ID | Resumo | Marco | Destrava | Status |
| --- | --- | --- | --- | --- |
| **F19** | Spike: proventos no relatório de movimentação da B3 | M4 | 2 | 🔍 |
| **F25** | Subcarteiras | M6 | 2 | ⏳ |
| **F27** | Ferramenta de correlação entre dois ativos | M7 | 1 | ⏳ |
| **F47** | Comparador de renda fixa | M7 | 1 | ⏳ |
| **F29** | Empacotamento desktop | — | 0 | 🔍 |
| **F30** | Identidade visual própria (sair do tema padrão do shadcn) | M9 | 0 | 🔍 |
| **F31** | Hot-reload do backend não reinicia o worker | — | 0 | 🔍 |
| **F32** | Liquidez em três camadas | M6 | 0 | ⏳ |
| **F33** | Custo da bonificação | M5 | 0 | ⏳ |
| **F43** | Sidebar | M9 | 0 | ⏳ |
| **F44** | Carteira: layout, gráfico e cor | M9 | 0 | ⏳ |
| **F45** | Operações: filtros e seletor de ativo | M9 | 0 | ⏳ |
| **F48** | Fiscal: navegação por mês na URL | M9 | 0 | ⏳ |
| **F50** | Tabelas: linha inteira clicável e dica no cabeçalho | M9 | 0 | ⏳ |
| **F51** | Máscaras nos campos | M9 | 0 | ⏳ |
| **F52** | Setor e segmento sugeridos pelo yfinance | M9 | 0 | ⏳ |

---

## 🧭 Marcos

### M1 — Core de operações

> **Objetivo:** Stack decidida, projeto de pé, e operações/importadores/posição-PM portados do IR-Helper com paridade comprovada.
>
> **Serve:** N3
>
> **Progresso:** 9/9 concluídas

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| — | *(nada em aberto)* | — | — |

<details><summary>Concluído (9 itens)</summary>

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F1** | Spike de stack (resolve D1) | — | ✅ |
| **F2** | Scaffold do projeto na stack escolhida | F1 | ✅ |
| **F3** | Tipagem ponta a ponta | F2 | ✅ |
| **F4** | Migrations + backup automático do banco | F2 | ✅ |
| **F5** | Modelo de domínio: ativos, operações e eventos | F4 | ✅ |
| **F6** | Importadores B3 (xlsx) e notas de corretagem (PDF) | F5 | ✅ |
| **F7** | Migração dos dados do IR-Helper | F5 | ✅ |
| **F8** | Engine de posição e preço médio + paridade | F7 | ✅ |
| **F9** | Telas de operações, ativos e posição atual | F8 | ✅ |

</details>

### M2 — Patrimônio atual

> **Objetivo:** Ver quanto tenho hoje, por categoria, setor e segmento, com a variação do dia, incluindo renda fixa.
>
> **Serve:** N2
>
> **Progresso:** 6/6 concluídas

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| — | *(nada em aberto)* | — | — |

<details><summary>Concluído (6 itens)</summary>

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F10** | Provider de dados de mercado + cache de preços | F5 | ✅ |
| **F11** | Carteira: patrimônio total, por categoria e posição | F9, F10 | ✅ |
| **F12** | Renda fixa: cadastro e marcação por indexador | F10 | ✅ |
| **F36** | Posição por categoria com variação do dia | F11 | ✅ |
| **F37** | Setor e segmento cadastrados | F11 | ✅ |
| **F46** | Renda fixa: tipo do produto, Selic + spread e aplicação no cadastro | F12 | ✅ |

</details>

### M3 — Rentabilidade e evolução

> **Objetivo:** Responder "rendi mais que o CDI?" em qualquer período, ver o ano a ano mês a mês e a evolução do patrimônio.
>
> **Serve:** N1, N2
>
> **Progresso:** 5/5 concluídas

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| — | *(nada em aberto)* | — | — |

<details><summary>Concluído (5 itens)</summary>

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F14** | Série diária por ativo | F11, F12 | ✅ |
| **F15** | Desempenho de rentabilidade | F14 | ✅ |
| **F16** | Benchmarks: CDI, IPCA e IBOV | F15 | ✅ |
| **F17** | Evolução do patrimônio | F14 | ✅ |
| **F18** | Comparação ano a ano | F15, F16 | ✅ |

</details>

### M4 — Proventos

> **Objetivo:** Ver quanto recebi de proventos, de quem, mês a mês, e quanto cada ativo rende sobre o que paguei.
>
> **Serve:** N4
>
> **Progresso:** 0/3 concluídas

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F19** | Spike: proventos no relatório de movimentação da B3 | — | 🔍 |
| **F20** | Proventos: registro e histórico | F19 | ⏳ |
| **F38** | Desempenho e distribuição dos proventos | F20 | ⏳ |

### M5 — Fiscal

> **Objetivo:** DARF e IRPF aqui dentro; IR-Helper aposentado.
>
> **Serve:** N5
>
> **Progresso:** 3/6 concluídas

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F33** | Custo da bonificação | F21 | ⏳ |
| **F34** | Taxas da nota no resultado | F21 | 💤 |
| **F35** | IRRF abatido do DARF | F21 | 💤 |

<details><summary>Concluído (3 itens)</summary>

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F21** | Motor fiscal: apuração mensal, DARF e prejuízo acumulado | F8 | ✅ |
| **F22** | Relatório anual do IRPF | F21 | ✅ |
| **F23** | Paridade funcional com o IR-Helper | F21, F22 | ✅ |

</details>

### M6 — Subcarteiras e rebalanceamento

> **Objetivo:** Separar a carteira em grupos, dar meta a cada um e saber onde pôr cada aporte.
>
> **Serve:** N6, N7
>
> **Progresso:** 0/4 concluídas

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F24** | Rebalanceamento | F11, F25 | ⏳ |
| **F25** | Subcarteiras | F15 | ⏳ |
| **F28** | Alerta de rebalanceamento com o app fechado | F24 | ⏳ |
| **F32** | Liquidez em três camadas | F11, F12 | ⏳ |

### M7 — Análises e ferramentas

> **Objetivo:** Risco × retorno e correlação da carteira, e ferramentas de simulação para decidir antes: renda fixa, ativo novo, à vista × parcelado.
>
> **Serve:** N8, N9
>
> **Progresso:** 0/5 concluídas

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F26** | Risco × retorno | F10, F15 | 💤 |
| **F27** | Ferramenta de correlação entre dois ativos | F10 | ⏳ |
| **F39** | Correlação da carteira | F27 | ⏳ |
| **F47** | Comparador de renda fixa | F46 | ⏳ |
| **F49** | Simulador: à vista, parcelado ou adiantar a fatura | F47 | ⏳ |

### M8 — Qualidade dos dados

> **Objetivo:** Cotações e séries consultadas só quando faltam, troca de ticker sem gambiarra, e os buracos de dado à vista num lugar só.
>
> **Serve:** N2, N3
>
> **Progresso:** 3/3 concluídas

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| — | *(nada em aberto)* | — | — |

<details><summary>Concluído (3 itens)</summary>

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F40** | Troca de ticker como renomeação | F9 | ✅ |
| **F41** | Cache de dados externos idempotente | F10, F12 | ✅ |
| **F42** | Painel de saúde dos dados | F41 | ✅ |

</details>

### M9 — Conforto de uso

> **Objetivo:** As telas que já existem confortáveis de usar: navegação, cor com significado, seletores que escalam.
>
> **Serve:** N2, N3, N5
>
> **Progresso:** 0/8 concluídas

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F30** | Identidade visual própria (sair do tema padrão do shadcn) | F11 | 🔍 |
| **F43** | Sidebar | F2 | ⏳ |
| **F44** | Carteira: layout, gráfico e cor | F11 | ⏳ |
| **F45** | Operações: filtros e seletor de ativo | F9 | ⏳ |
| **F48** | Fiscal: navegação por mês na URL | F23 | ⏳ |
| **F50** | Tabelas: linha inteira clicável e dica no cabeçalho | F36 | ⏳ |
| **F51** | Máscaras nos campos | F46 | ⏳ |
| **F52** | Setor e segmento sugeridos pelo yfinance | F37 | ⏳ |

### Sem marco

> **Progresso:** 0/2 concluídas

| ID | Resumo | Depende de | Status |
| --- | --- | --- | --- |
| **F29** | Empacotamento desktop | F2 | 🔍 |
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
| **F6** | Importadores B3 (xlsx) e notas de corretagem (PDF) | N3 | — | M1 | F5 | Médio | Médio | Alto | Bom | ✅ Concluído |
| **F7** | Migração dos dados do IR-Helper | N3 | D8 | M1 | F5 | Baixo | Médio | Alto | Excelente | ✅ Concluído |
| **F8** | Engine de posição e preço médio + paridade | N3 | D2, D8 | M1 | F7 | Médio | Alto | Alto | Excelente | ✅ Concluído |
| **F9** | Telas de operações, ativos e posição atual | N3 | — | M1 | F8 | Médio | Baixo | Alto | Bom | ✅ Concluído |
| **F10** | Provider de dados de mercado + cache de preços | N2, N8 | D6 | M2 | F5 | Médio | Médio | Alto | Bom | ✅ Concluído |
| **F11** | Carteira: patrimônio total, por categoria e posição | N2 | — | M2 | F9, F10 | Médio | Baixo | Alto | Excelente | ✅ Concluído |
| **F12** | Renda fixa: cadastro e marcação por indexador | N2 | D6 | M2 | F10 | Alto | Médio | Alto | Bom | ✅ Concluído |
| **F14** | Série diária por ativo | N1, N2 | D2, D6 | M3 | F11, F12 | Alto | Alto | Alto | Bom | ✅ Concluído |
| **F15** | Desempenho de rentabilidade | N1 | D5 | M3 | F14 | Médio | Médio | Alto | Excelente | ✅ Concluído |
| **F16** | Benchmarks: CDI, IPCA e IBOV | N1 | D6 | M3 | F15 | Baixo | Baixo | Alto | Excelente | ✅ Concluído |
| **F17** | Evolução do patrimônio | N2, N1 | D2 | M3 | F14 | Baixo | Baixo | Alto | Excelente | ✅ Concluído |
| **F18** | Comparação ano a ano | N1 | D5 | M3 | F15, F16 | Médio | Baixo | Alto | Excelente | ✅ Concluído |
| **F20** | Proventos: registro e histórico | N4, N5 | D2 | M4 | F19 | Médio | Médio | Alto | Bom | ⏳ Pendente |
| **F21** | Motor fiscal: apuração mensal, DARF e prejuízo acumulado | N5 | D8 | M5 | F8 | Alto | Alto | Alto | Bom | ✅ Concluído |
| **F22** | Relatório anual do IRPF | N5 | — | M5 | F21 | Médio | Médio | Alto | Bom | ✅ Concluído |
| **F23** | Paridade funcional com o IR-Helper | N5 | D8 | M5 | F21, F22 | Baixo | Baixo | Alto | Excelente | ✅ Concluído |
| **F24** | Rebalanceamento | N6 | D12 | M6 | F11, F25 | Médio | Baixo | Alto | Bom | ⏳ Pendente |
| **F26** | Risco × retorno | N8 | D4 | M7 | F10, F15 | Baixo | Baixo | Médio | Bom | 💤 Registrado, sem prioridade |
| **F27** | Ferramenta de correlação entre dois ativos | N9 | — | M7 | F10 | Médio | Médio | Médio | Bom | ⏳ Pendente |
| **F33** | Custo da bonificação | N3, N5 | — | M5 | F21 | Baixo | Médio | Médio | Bom | ⏳ Pendente |
| **F34** | Taxas da nota no resultado | N3, N5 | — | M5 | F21 | Médio | Médio | Médio | Médio | 💤 Registrado, sem prioridade |
| **F35** | IRRF abatido do DARF | N5 | — | M5 | F21 | Médio | Baixo | Médio | Médio | 💤 Registrado, sem prioridade |
| **F36** | Posição por categoria com variação do dia | N2 | D4 | M2 | F11 | Médio | Baixo | Alto | Excelente | ✅ Concluído |
| **F37** | Setor e segmento cadastrados | N2 | — | M2 | F11 | Médio | Médio | Médio | Bom | ✅ Concluído |
| **F38** | Desempenho e distribuição dos proventos | N4 | — | M4 | F20 | Médio | Baixo | Alto | Bom | ⏳ Pendente |
| **F28** | Alerta de rebalanceamento com o app fechado | N6 | — | M6 | F24 | Baixo | Médio | Médio | Bom | ⏳ Pendente |
| **F32** | Liquidez em três camadas | N2, N6 | — | M6 | F11, F12 | Médio | Baixo | Médio | Bom | ⏳ Pendente |
| **F39** | Correlação da carteira | N8 | — | M7 | F27 | Baixo | Baixo | Médio | Bom | ⏳ Pendente |
| **F25** | Subcarteiras | N7 | D12, D13 | M6 | F15 | Médio | Médio | Alto | Bom | ⏳ Pendente |
| **F40** | Troca de ticker como renomeação | N3, N2 | — | M8 | F9 | Médio | Médio | Alto | Bom | ✅ Concluído |
| **F41** | Cache de dados externos idempotente | N2, N1 | D6 | M8 | F10, F12 | Médio | Médio | Alto | Excelente | ✅ Concluído |
| **F42** | Painel de saúde dos dados | N3, N2 | — | M8 | F41 | Médio | Baixo | Médio | Bom | ✅ Concluído |
| **F44** | Carteira: layout, gráfico e cor | N2 | — | M9 | F11 | Médio | Baixo | Alto | Bom | ⏳ Pendente |
| **F45** | Operações: filtros e seletor de ativo | N3 | D13 | M9 | F9 | Baixo | Baixo | Alto | Excelente | ⏳ Pendente |
| **F46** | Renda fixa: tipo do produto, Selic + spread e aplicação no cadastro | N2, N5 | — | M2 | F12 | Médio | Médio | Alto | Bom | ✅ Concluído |
| **F47** | Comparador de renda fixa | N9 | — | M7 | F46 | Médio | Baixo | Médio | Bom | ⏳ Pendente |
| **F48** | Fiscal: navegação por mês na URL | N5 | D13 | M9 | F23 | Baixo | Baixo | Médio | Bom | ⏳ Pendente |
| **F49** | Simulador: à vista, parcelado ou adiantar a fatura | N9 | — | M7 | F47 | Médio | Baixo | Médio | Bom | ⏳ Pendente |
| **F50** | Tabelas: linha inteira clicável e dica no cabeçalho | N2, N3 | — | M9 | F36 | Baixo | Baixo | Alto | Excelente | ⏳ Pendente |
| **F51** | Máscaras nos campos | N3, N5 | — | M9 | F46 | Baixo | Baixo | Médio | Bom | ⏳ Pendente |
| **F52** | Setor e segmento sugeridos pelo yfinance | N2 | D6 | M9 | F37 | Médio | Médio | Médio | Bom | ⏳ Pendente |

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

**F6 — Importadores.** Nota de corretagem da Nubank (PDF, via `pdfplumber`) e relatório de movimentação da B3 (xlsx, via `openpyxl`), os dois lidos em `adapters/` e convertidos em linhas Pydantic validadas na borda. A importação é em dois passos: `POST /api/operations/import/preview` lê um lote de arquivos misturados e classifica cada linha contra o banco sem gravar nada, e `POST /api/operations/import/confirm` grava as linhas escolhidas. O servidor não guarda estado entre os dois.

Decisões tomadas durante, a partir do cruzamento das fontes com o oráculo:
- **Cada tipo de operação tem uma fonte só.** Compra e venda vêm da nota, que traz o pregão e cada execução. Do xlsx da B3 vêm os eventos (bonificação, desdobro, grupamento) e o `Leilão de Fração`, que é `Credito` no relatório mas é a **venda** da fração. A `Transferência - Liquidação` do xlsx é a mesma negociação da nota, em D+2 e agregada por dia, e fica de fora com o motivo, como `Fração em Ativos`, `Atualização` e os direitos de subscrição. É isso que deixa importar as duas fontes, em qualquer ordem, sem dobrar posição.
- **Idempotência por chave natural com multiplicidade:** `(ticker, data, tipo, quantidade, preço)`, e dessa chave entram só as ocorrências que o banco ainda não tem. No lote, cada arquivo é um retrato completo do que cobre: a chave conta pelo arquivo que a traz mais vezes, então o mesmo arquivo solto duas vezes, ou dois exports sobrepostos, não dobram. Duas execuções idênticas na mesma nota continuam sendo duas. A regra roda no preview e de novo no confirmar.
- **Possível duplicata:** linha sem par exato num (ativo, dia, tipo) que o banco já tem vem desmarcada. É a mesma execução registrada de outro jeito, como um leilão com o preço arredondado à mão ou duas linhas da nota somadas numa operação só.
- **O `LINE_PATTERN` aceita a observação `#`**, e a linha que o IR-Helper perdia agora entra.
- **Ativo novo tem a classe inferida pelo sufixo** (34 é BDR, 11 é FII, o resto é ação) e confirmada pelo usuário no preview, onde se resolve o 11 que é ETF ou unit. Confirmar sem a classe é recusado.
- Um arquivo ilegível vira erro dele mesmo, e o resto do lote segue. Toda confirmação termina na checagem de posição negativa.

**Aceite verificado:** o xlsx e as notas reais que alimentam o IR-Helper, importados num banco vazio, reproduzem as operações do oráculo. As diferenças são só os ajustes manuais: o par de transferência, a venda de uma fração sem leilão, os leilões com o preço arredondado e duas linhas de uma nota que no oráculo são uma operação. Confirmar o mesmo lote de novo grava 0. O preview do mesmo lote sobre o banco migrado não traz nenhuma linha nova: são todas `já existe` ou possível duplicata.

**Limitações residuais:** só a Nubank tem parser de nota. No grupamento, a Quantidade do relatório entra como o fator; o único caso real tinha posição de 1 ação, que não distingue fator de quantidade resultante.

**F7 — Migração do irpf_helper.db.** Feita por um script de uso único, rodado uma vez e mantido fora do repo. O oráculo foi lido numa conexão `mode=ro`, e o banco do app passou antes por `prepare_database` (snapshot + migration até o head). Ativos e operações entraram numa transação só, com os ajustes manuais junto: no oráculo eles são operações como as outras. Os enums chegam pelo nome e saem pelo valor. Os ids do oráculo não atravessam: a operação acha o ativo pelo ticker, e a ordem de inserção se mantém.

Decisão tomada durante: o `NUMERIC(18,6)` do oráculo está gravado como REAL no SQLite, e o IR-Helper o lê com 6 casas. O valor migrado é esse, sem os zeros à direita (`10.5`, não `10.500000`), então o ruído de float some aqui do mesmo jeito que some lá.

**Aceite verificado:** contagem e soma de quantidades por ativo e tipo de operação, relidas do TEXT gravado, idênticas às do oráculo: **0 divergências**. O hash do `irpf_helper.db` é o mesmo antes e depois.

**F8 — Posição e PM.** `backend/domain/position.py`, puro e sem SQLAlchemy: `apply` leva uma `Position` imutável (quantidade e PM, com o custo total derivado) pela operação seguinte, e `replay` percorre as operações por data e, no mesmo dia, pela ordem de gravação. Em cima dele ficam `current_positions`, `position_at` (a posição no fim de um dia, que a transferência usa para achar o PM da origem) e `check_non_negative`. As regras de cada tipo e a ordem das contas são as do IR-Helper, no contexto Decimal padrão de 28 dígitos.

Decisão tomada durante: **nenhuma posição fica negativa em data nenhuma do histórico.** O IR-Helper só conferia isso na transferência. Aqui é `NegativePositionError` (422), e a borda roda a checagem depois de toda escrita — CRUD, transferência e importação.

Testes com dado fictício cobrem compra, venda parcial e total, bonificação fracionária, desdobro, grupamento pelo fator, o par de transferência levando o PM, a ordem no mesmo dia e a posição negativa. A paridade com o oráculo rodou uma vez, fora do repo, como a verificação de F7.

**Aceite verificado:** o motor sobre as operações do `irpf_helper.db` reproduz a abertura e o fechamento (quantidade e PM, com as 6 casas com que o IR-Helper grava) de todos os `MonthlySnapshot`, em todos os meses: **0 divergências**. No sentido inverso, nenhuma posição aberta do motor fica sem snapshot no oráculo.

**F9 — Telas do core.** Backend: `assets` (CRUD; apagar ativo com operação volta 409 com o motivo, ticker normalizado e único), `operations` (lista filtrada por ativo, tipo e período; criar, editar e apagar compra, venda e evento, com as regras de preço por tipo validadas no DTO; transferência em endpoint próprio, gravando o par com o PM que a origem tinha no fim do dia e recusando quantidade maior que a posição) e `portfolio/positions` (quantidade, PM e custo total por ativo com posição, recalculados pelo motor de F8). Toda escrita termina na checagem de posição negativa. O acesso às operações que mais de um domínio lê mora em `backend/repository/operations.py`.

Front: Carteira com as posições; Operações com filtros, formulário de criação e edição (a operação em edição chega pronta do pai), transferência e apagar; Ativos com lista, formulário e detalhe (posição e operações do ativo); Importar com área de soltar arquivos, preview linha a linha com a classe dos ativos novos escolhida ali, e confirmar ou cancelar. Transferência não se edita: apagam-se as duas pontas. As chaves do TanStack Query ficam juntas em `shared/lib/query-keys.ts`, porque toda escrita invalida posição, listas e ativos a cotar. O `api.ts` ganhou path, query e upload tipados (ver D11).

**Aceite verificado** no app de pé, sobre uma cópia do banco migrado, dirigido por navegador: criar e editar operação num ativo fictício, venda maior que a posição recusada com o toast do 422, transferência movendo a posição com o PM, detalhe do ativo com a posição recalculada, 409 ao apagar ativo com operação, e o lote real de notas e xlsx no preview sem nenhuma linha nova, com cancelar sem gravar nada.

**Limitações residuais:** o preço no preview e nas tabelas sai com 2 casas, então a terceira casa que separa um leilão de fração da versão arredondada à mão não aparece. Dois refreshes de cotação simultâneos (o StrictMode dispara dois ao abrir o app em dev) ainda podem colidir na gravação do SQLite; a busca na rede já acontece fora da transação.

**F10 — MarketDataProvider.** Interface `MarketDataProvider` (Protocol em `backend/domain/market_data.py`, com `get_history`) implementada pelo yfinance (`TICKER.SA`, `auto_adjust=False`) em `backend/adapters/`. Tabela `price_history` (ativo, data, fechamento em `DecimalText`, CHECK `> 0`), com FK em CASCADE porque é cache descartável (D2). O refresh busca só os dias que faltam: parte da última data em cache, inclusive (o fechamento parcial de um pregão em andamento é regravado), ou da primeira operação, e cobre ações/FII/ETF/BDR com operação. Quem dispara é o front, ao abrir o app e pelo botão da tela Mercado (`POST /api/market/prices/refresh`); o `create_app` segue sem tocar no banco. Offline não é erro: o ticker vai para `failed`, um toast avisa, e `GET /api/market/prices` devolve o último fechamento com a data dele — é esse o "preço atual" do plano. O fechamento é quantizado em centavos, porque a B3 cota em centavos e o resto do float é ruído.

Decisões tomadas durante: **sem brapi**, que é pago — o app opera só com fonte gratuita. Sem fallback, a interface fica com um provider só; se o yfinance quebrar, a alternativa gratuita é o arquivo de cotações históricas da B3 (COTAHIST). O fechamento é o que o yfinance entrega, ajustado por desdobramento e grupamento, não por provento (a conferência ficou em F14). As séries do BCB ficaram para quem as consome (F12, F16).

**Limitações residuais:** ativo sem cotação (ticker trocado ou deslistado) cai em `failed` a cada abertura; quando F8 existir, o refresh passa a parar na data em que a posição zerou. O pregão do dia pode demorar a aparecer no yfinance.

**F11 — Carteira.** `GET /api/portfolio` substitui o `/positions`: total, categorias (`PortfolioCategory`, as classes da B3 mais a renda fixa) e posições com preço atual, valor a mercado, fração da carteira e resultado não realizado, mais a renda fixa pelo valor bruto marcado de F12. Toda conta é Decimal no Python; o front só formata, e o `toChartNumber` é a única saída de Decimal para número, para a geometria do gráfico. O que tem mais de um consumidor foi para `backend/repository/` (`market.py` com os últimos preços e as séries; `fixed_income.py` com os títulos marcados). Front: card do patrimônio, donut por categoria com a tabela de valores como legenda, tabela de renda variável e tabela de renda fixa; o detalhe do ativo ganhou preço atual, valor e resultado.

Decisões tomadas durante:
- **A renda fixa entra no patrimônio pelo valor bruto**, com o IR estimado na tabela ao lado.
- **Ativo sem cotação em cache vale o custo**, com "sem cotação" na tela.
- **Os tokens `--chart-1..5` ganharam uma paleta categórica validada** (lightness, croma, separação para daltonismo e para visão normal, nos dois temas); os cinzas do preset reprovavam como categórica. A cor segue a categoria, não a posição dela no donut.
- Resultado com sinal e percentual, sem cor de alta e baixa: essa cor é decisão de F30.

**Aceite:** o patrimônio total bate com a soma da posição da B3 + saldos de RF numa data de conferência, e o usuário para de abrir outro app pra ver "quanto tenho". Verificado na cópia do banco migrado: a soma das categorias é o total, e o total é renda variável a mercado mais a renda fixa bruta. A conferência contra a B3 fica com o usuário.

**F12 — Renda fixa.** Tabelas próprias: `fixed_income_investments` (nome único, indexador, taxa, vencimento opcional, liquidez diária, isenção) e `fixed_income_movements` (aplicação e resgate, os dois pelo valor bruto), com CHECK de taxa e valor positivos. A classe `fixed_income` saiu do `AssetClass`: título de renda fixa não é ativo da B3, e o schema deixa de admitir operação de bolsa nele. As séries do BCB SGS (CDI 12, Selic 11, IPCA 433) ficam atrás do `IndexSeriesProvider` (`backend/domain/index_series.py`), implementado em `backend/adapters/bcb_sgs_provider.py` com `urllib` da stdlib; o `valor` chega como string no JSON e vira Decimal direto. Cache em `index_history`, refresh em `POST /api/market/indexes/refresh` disparado junto com o de cotações, começando no dia 1 do mês da última data em cache (ou da primeira movimentação), em janelas de até 10 anos, que é o limite do SGS. A tela Mercado mostra o último valor de cada série.

A marcação é `backend/domain/fixed_income.py`, pura: o fator acumulado é o mesmo para todos os fluxos do título, então o saldo bruto é linear (aplicações corrigidas menos resgates corrigidos); os lotes por FIFO existem só para o IR regressivo por idade de cada aplicação. Fator diário: CDI e Selic a `1 + taxa × %`, pré a `(1 + taxa)^(1/252)`, IPCA pró-rata por dia corrido no mês vezes a taxa real por dia útil. Telas: lista com aplicado, bruto, IR estimado e líquido; detalhe com as movimentações.

Decisões tomadas durante:
- **Dia útil é dia com CDI publicado**, e depois do último CDI, dia de semana. Sem biblioteca de feriados.
- **Depois do último dado publicado, o último valor se repete**, e a tela diz até que data o dado é real.
- **Resgate maior que o saldo estimado zera o título**: a diferença é o erro da estimativa, e registrar o resgate total do extrato não depende de a curva bater ao centavo.
- **A primeira movimentação do título é uma aplicação** (422 no resgate antes dela e ao apagar a aplicação que abre o título).
- Taxa de CDI e Selic como percentual do indexador; IPCA e pré como taxa anual.

**Aceite:** o valor bruto calculado de cada título fica a menos de 0,5% do extrato da corretora/B3 na mesma data. Verificado num título fictício de 100% do CDI: o bruto bate ao centavo com o CDI acumulado direto da série do SGS. A comparação com o extrato real fica com o usuário.

**Limitações residuais:** IOF de menos de 30 dias fora da estimativa de IR. IPCA+ pela curva, pró-rata por dia corrido no mês civil, sem o aniversário do dia 15 do Tesouro nem a marcação a mercado. Tesouro Selic sem o ágio/deságio de compra.

**F14 — Série diária por ativo.** `backend/domain/daily_series.py`, puro: uma `DailyLine` por ativo e por título, com o valor no fim de cada dia útil e a entrada e a saída do dia em reais. `aggregate` soma as linhas escolhidas, a partir do primeiro dia com valor ou fluxo. Na renda variável, a quantidade vem da posição assentada pelo motor de posição, com o day trade pareado. A entrada e a saída são cada compra e cada venda pelo valor dela, e o valor do dia é a quantidade vezes o último fechamento até ele. Na renda fixa, `daily_gross` em `backend/domain/fixed_income.py` reaproveita a acumulação da marcação: uma acumulação só serve a série toda. `backend/repository/daily_series.py` monta as linhas do banco, e a rentabilidade, a evolução e a comparação ano a ano leem dali. Serve N1 e N2.

Decisões tomadas durante:
- **A série é recalculada a cada request, sem tabela materializada.** Ela sai das operações, das movimentações e dos dois caches de mercado, que já estão salvos. Uma tabela ficaria desatualizada em toda escrita de operação, importação, renda fixa e refresh de preço e de índice. Sobre o banco migrado, os dois endpoints respondem abaixo de 200 ms.
- **O ajuste de evento vem de `operations`.** Conferido nos eventos do banco: o fechamento em cache é ajustado por desdobro, grupamento e bonificação, e a fonte aplica o ajuste 1 dia útil antes da data gravada. A quantidade de um dia é multiplicada pelo fator de cada evento com data posterior, e isso deixa correto também o dia entre as duas datas. Na carteira real, nenhum salto nos eventos.
- **Gravar, editar ou apagar um evento apaga o cache de cotação do ativo** (e o registro da última consulta), e o próximo refresh busca a janela inteira na base nova.
- Antes do primeiro fechamento em cache, o ativo vale o custo, como na carteira de hoje. Um fluxo em dia não útil entra no dia útil seguinte.

**Limitações residuais:**
- Um buraco da fonte no começo da posição aparece como um degrau na série, porque o ativo vale o custo até o primeiro fechamento. O painel de saúde já mostra o buraco.
- Um evento que a fonte aplica depois de a posição zerar, e que por isso não está em `operations`, escala o histórico inteiro do ativo. O efeito aparece só nos dias de compra e de venda.
- Se o evento for gravado antes de a fonte ajustar o histórico, o cache rebuscado continua sem ajuste até ser apagado de novo.

**F15 — Desempenho de rentabilidade.** `backend/domain/performance.py`: a cota começa em 1 e, a cada dia, é multiplicada por `(valor de hoje + saídas) / (valor da véspera + entradas)`. A entrada soma embaixo e a saída em cima, para a primeira compra e a venda total fecharem sem divisão por zero. `GET /api/performance` (categoria, ativo, início e fim) devolve o retorno desde o início, o do período e os dos últimos 6, 12 e 24 meses, nulos quando a carteira é mais nova que eles. Devolve também os pontos acumulados desde a base do período: todo dia até um ano, e acima disso o último dia de cada mês. Tela Rentabilidade com os cinco números, cada um com a dica, o filtro de categoria, o seletor de período (6, 12 e 24 meses, este ano, desde o início, personalizado) e o gráfico. O detalhe do ativo ganhou o mesmo painel, filtrado por ele. Serve N1, pela cota de D5.

Decisões tomadas durante:
- **O período conta a partir do fechamento da véspera do primeiro dia dele.** Por isso "12 meses" no seletor bate com o card de 12 meses, e "este ano" parte de 31/12.
- O seletor usa o ToggleGroup do shadcn, e o intervalo livre, dois campos de data. O seletor, o filtro de categoria, a dica de métrica e os rótulos e cores de categoria subiram para `shared/`, porque carteira, rentabilidade e evolução usam.
- As chaves das duas visões ficam debaixo de `portfolio` no TanStack Query: toda escrita que invalida a carteira invalida o passado dela.

**Limitações residuais:** sem proventos, a rentabilidade é só a variação de preço, e a tela diz isso. Num FII, isso deixa de fora a maior parte do retorno.

**Aceite:** a rentabilidade de um período conhecido bate com a de uma fonte externa que também mede por cota, com diferença de até 0,1 p.p. Fica com o usuário, e a comparação só fecha depois dos proventos (F20), porque a fonte externa conta o retorno total.

**F16 — Benchmarks: CDI, IPCA e IBOV.** `backend/domain/benchmarks.py` trata cada referência como uma cota: um nível por dia útil, nos mesmos dias da carteira, que o `period_return` lê como lê a cota. O CDI é a curva de um título a 100% do CDI, e o IPCA, a de um título a IPCA + 0%, as duas com a acumulação da marcação da renda fixa, que subiu de `fixed_income.py` para `backend/domain/index_growth.py`. O IBOV é o fechamento do dia sobre o do primeiro dia. `GET /api/performance` devolve, por referência, o retorno do período, os pontos nos mesmos dias da carteira e a data do último valor real, e devolve também o "% do CDI" (o retorno do período sobre o do CDI), calculado no Python. Na tela Rentabilidade, as referências são escolhidas num seletor múltiplo (o CDI vem marcado), cada uma é uma linha sobre a área da carteira, e o "% do CDI" fica ao lado do retorno do período, com a dica. O detalhe do ativo ganhou o mesmo seletor. Serve N1.

Decisões tomadas durante:
- **O IBOV mora no cache das séries**, como `IndexSeries.IBOV` em `index_history`, com o valor em pontos de fechamento. O refresh das séries recebe também o `MarketDataProvider` e busca o `^BVSP` por ele, desde o primeiro pregão que o yfinance serve; o yfinance deixou de pôr `.SA` em símbolo de índice. A migration refaz a CHECK do enum em `index_history` e `fetch_log`.
- O IBOV segue a regra da série diária no refresh e no painel de saúde: espera o dia útil anterior, como o CDI.
- Uma referência sem valor até o primeiro dia da carteira fica sem pontos, em vez de começar no meio do período.
- Embaixo do gráfico, cada referência escolhida diz até quando o dado é real; o IPCA, pelo mês publicado.

**Limitações residuais:** depois do último IPCA publicado, o último valor se repete, como na marcação da renda fixa. Com um mês de deflação, a linha segue caindo até o IPCA seguinte sair.

**Aceite verificado:** o usuário responde "rendi mais que o CDI este ano?" na tela Rentabilidade, pelo "% do CDI" com o período "Este ano". Na cópia do banco migrado, o CDI de cada mês bate com o CDI acumulado no mês publicado pelo BCB, com diferença abaixo de 0,01 p.p. (a série oficial tem duas casas).

**F17 — Evolução do patrimônio.** `GET /api/evolution` (categoria, início e fim) soma a série diária por dia. Por ponto, devolve o patrimônio, o aplicado (entradas menos saídas acumuladas) e o ganho (o patrimônio menos o aplicado). Devolve também o total de hoje, o crescimento dos últimos 6, 12 e 24 meses em reais e em percentual, e o valor de hoje de cada categoria. A tela Evolução tem esses números, cada um com a dica, a tabela por categoria, os mesmos filtros da rentabilidade e o gráfico de área. A chave "Composição" divide a área em aplicado e ganho empilhados. Serve N2 e N1.

Decisões tomadas durante:
- **Num dia de perda, a área inteira é aplicado**, e uma linha tracejada marca o aplicado acima dela: a altura continua sendo o patrimônio. O front escolhe a faixa pelo sinal do ganho, sem conta.
- O crescimento inclui os aportes, e a dica dele diz isso e aponta a rentabilidade.

**Limitações residuais:** entre dois pontos mensais o gráfico interpola, então um aporte aparece como rampa, e não como degrau.

**Aceite verificado:** no último dia, a faixa de ganho é igual ao resultado não realizado da carteira somado ao resultado das vendas, na cópia do banco migrado e num teste com dado fictício. O total da evolução é o total da carteira.

**F18 — Comparação ano a ano.** `monthly_returns` em `backend/domain/performance.py` dá a variação da cota em cada mês, do último fechamento do mês anterior ao último do mês, e em cada ano; o acumulado é a cota no fim do ano. `GET /api/performance/monthly` (categoria, ativo) devolve os anos da carteira, os das três referências nos mesmos meses, o melhor e o pior mês, e quantos meses subiram e caíram, do total. Tela Ano a ano: os quatro números, cada um com a dica; a tabela com um ano por linha, de janeiro a dezembro, o ano e o acumulado, com as células na cor de alta ou de baixa; e o gráfico de barras por mês, com o seletor de período, ou por ano. O filtro de categoria e o seletor de referência valem para tudo: com uma referência, a linha dela fica sob a da carteira em cada ano, e a barra dela ao lado. Serve N1, pela cota de D5.

Decisões tomadas durante:
- **O ano e o acumulado saem da razão das cotas**, que é o produto dos meses sem o arredondamento de compor os meses já arredondados.
- O primeiro mês parte do início da carteira, e o mês corrente vai até hoje. Mês parado não conta como positivo nem como negativo.
- No gráfico por mês, entra o mês cujo dia 1 cai no período: o mês é contado inteiro.
- As cores de alta e de baixa nasceram como tokens do tema (`--gain`, `--loss`), para a identidade visual própria ajustar o tom num lugar só.

**Limitações residuais:** sem proventos, a tabela é só a variação de preço, e a tela diz isso.

**Aceite:** o usuário usa esta tabela no lugar da que consulta hoje. Fica com o usuário. Na cópia do banco migrado, o ano corrente da tabela é igual à rentabilidade de "Este ano", e o acumulado do último ano é igual à rentabilidade desde o início.

**F20 — Proventos: registro e histórico.** O registro de cada provento recebido e a tela de histórico para auditar. Serve N4 e N5.

Plano:
- tabela `income_events`: ativo, tipo (dividendo, JCP, rendimento, rendimento tributado; o enum fecha com o que a F19 encontrar), quantidade, valor por unidade, valor total e a data que a F19 confirmar;
- importação pela fonte da F19, no mesmo fluxo de preview e confirmação da F6 e com a mesma idempotência; cadastro manual para o resto;
- tela Histórico de proventos: categoria, ativo, tipo, quantidade, valor por unidade, valor total e data, com busca por ativo, filtros de categoria, tipo e período, e o total recebido no topo;
- no relatório do IRPF (F22), as fichas de proventos: dividendos em Rendimentos Isentos (código 09) e JCP em Tributação Exclusiva (código 10), por fonte pagadora com CNPJ;
- a rentabilidade da F15 soma o provento na cota no dia do pagamento; quem chegar por último entre F15 e F20 faz essa ligação.

Fica fora: corretora, status e o provisionado (provento anunciado e ainda não pago), que nenhuma fonte gratuita entrega.

**Aceite:** o total de proventos de um ano bate com o informe de rendimentos da corretora.

**F21 — Motor fiscal.** `backend/domain/tax.py`, puro: `assess` apura todos os meses da primeira operação até o mês corrente, e o prejuízo e o saldo abaixo do mínimo atravessam de um mês para o outro. Em vez de portar o motor do IR-Helper, as regras seguem a Receita, conferidas no Perguntas e Respostas IRPF 2026 (perguntas 704 a 731) e na IN RFB 1.585/2015, art. 37:
- ganho líquido é o resultado do conjunto do mês, e não venda a venda;
- três conjuntos de compensação: operações comuns de ações, ETF e BDR a 15%, day trade a 20% e FII a 20%;
- isenção de ações com até R$ 20 mil vendidos em ações no mês, fora ETF, BDR e day trade;
- DARF 6015 no último dia útil do mês seguinte, e imposto abaixo de R$ 10 somado ao período seguinte.

Os números que a lei pode mudar ficam em `TaxRules`, escolhida por vigência (`rules_for`). Mudança de lei entra como uma entrada nova, e os meses anteriores seguem apurados pela regra deles.

Decisões tomadas durante:
- **O day trade mudou o motor de posição (F8).** `settle_day_trades` pareia a 1ª compra com a 1ª venda do mesmo ativo no mesmo dia, e as pernas pareadas não tocam a posição. O PM da Carteira passa a ser o custo fiscal, o mesmo da ficha Bens e Direitos. Vender e recomprar no mesmo dia sem posição é day trade, não posição negativa.
- **DARF pago é registro próprio.** A tabela `darf_payments` guarda o pagamento por mês de apuração. O valor devido segue recalculado das operações, e o pago vale para qualquer mês, inclusive um DARF pago que a regra correta não pede.
- **Dia útil do vencimento** é o calendário da renda fixa, agora em `backend/domain/business_days.py`: dia com CDI publicado, e dia de semana fora da série.

Tela Fiscal com a tabela de todos os meses, o status do DARF (pago, a pagar, vencido, acumulando, isento, compensado) e o registro do pagamento.

**Aceite verificado:** conferência de uso único contra o `irpf_helper.db`, sobre uma cópia do banco migrado. O resultado bruto de cada (mês, classe) bate com o oráculo em todos os meses: 0 divergências, inclusive no mês de day trade. O imposto diverge onde a regra diverge. Num mês, o prejuízo acumulado de ações compensa o ganho com ETF, que o IR-Helper tributava inteiro. No outro, o imposto do mês é o mesmo, e o DARF muda só pelo saldo carregado menor.

**Limitações residuais:** custo atribuído à bonificação (F33), taxas da nota (F34) e IRRF (F35) ficam fora, e a tela avisa. FII em day trade entra no conjunto do FII. ETF de renda fixa, que tem tributação própria, não é distinguido do ETF de renda variável. O total vendido de ações que decide a isenção conta também a venda de day trade.

**F22 — Relatório IRPF.** `GET /api/tax/irpf/{ano}` e a aba IRPF da tela Fiscal, por ano-base:
- **Bens e Direitos:** um item por ativo com posição em algum dos dois 31/12, pelo custo (quantidade × PM fiscal) em centavos, com grupo e código (ação 03/01, BDR 04/04, FII 07/03, ETF 07/09), CNPJ do ativo (sem CNPJ, o item é sinalizado) e discriminação gerada.
- **Rendimentos isentos, código 20:** lucro isento de ações, por mês e no total.
- **Renda Variável:** o resultado líquido de operações comuns, day trade e FII de cada mês, o imposto apurado e o DARF pago de fato. DARF devido sem pagamento registrado aparece em destaque.
- **Prejuízo a compensar** em 31/12, por conjunto.

Decisões tomadas durante:
- **Sem depender de F20.** Dividendos (09) e JCP (10) ficam com F20. Até lá, a aba remete ao informe de rendimentos da corretora.
- **Ativo comprado e vendido dentro do ano não entra em Bens e Direitos**, e ativo zerado no ano entra com a situação atual 0.
- Os códigos da ficha vêm da tabela em vigor desde a declaração de 2023, conferida em guias (Portal Tributário, Genial, Infomoney) e não no programa da Receita.

**Aceite:** a declaração do próximo ano é preenchida só com este relatório (mais o informe de rendimentos para proventos), sem abrir o IR-Helper.

**F23 — Paridade funcional com o IR-Helper.** "Aposentar" é poder parar de usar o IR-Helper: tudo o que ele faz existe aqui. O repositório dele fica como está, e o `irpf_helper.db` segue como oráculo de conferência. O levantamento das telas e endpoints do IR-Helper mostrou que só faltavam os relatórios:
- a aba **Mensal** da tela Fiscal, com navegação por mês (‹ ›, selects de mês e ano, ← e → no teclado), posições na abertura e no fechamento agrupadas por classe, operações do mês, card do DARF (status com o motivo, resultado, tributável, imposto, saldo carregado, resultado por categoria, apuração por conjunto e registro do pagamento) e prejuízo a compensar;
- a aba **Anual**, com as mesmas seções entre 1/1 e 31/12 e o resumo de DARFs do ano.

O endpoint é `GET /api/tax/period?year=&month=`. O botão "Apurar resultados" do IR-Helper não tem par, porque aqui tudo é recalculado a cada consulta (D2). Cadastro de ativos e operações, transferência e importação já existiam desde F6 e F9.

**Aceite:** o usuário faz aqui tudo o que fazia no IR-Helper e para de abri-lo.

**F24 — Rebalanceamento.** Substitui a planilha e o script de rebalanceamento: a meta, o desvio de cada item e a divisão do próximo aporte. Serve N6.

Plano:
- **meta:** pertence à subcarteira (F25, D12), com um percentual por item, guardado no banco. Item é um ativo, e a renda fixa é um item só, genérico ("Renda fixa"), sem distinguir título: o que tem dentro dela aparece na composição da carteira, não na meta. Ativo fora de subcarteira não tem meta;
- **carteira geral:** não tem meta própria. A meta dela, quando mostrada, é a combinação das metas das subcarteiras, cada uma pesada pela fração da subcarteira na carteira;
- **desvio:** a tela mostra, para cada item, o atual, a meta e o desvio em pontos percentuais (atual 27% contra meta 30% dá −3 p.p.), com o valor em reais que falta ou sobra;
- **quanto a subcarteira está desbalanceada:** um número só, sem os empates da soma dos desvios (ver abaixo). Candidatos: a soma dos quadrados dos desvios, ou o maior desvio individual; a escolha sai na implementação, com exemplos na tela;
- **aporte:** dado o valor, o app calcula direto quanto vai para cada item. O dinheiro vai primeiro para o item mais abaixo da meta (em reais, sobre o patrimônio depois do aporte) até ele empatar com o segundo mais abaixo, depois para os dois juntos, e assim por diante até o dinheiro acabar. É a divisão que deixa a subcarteira o mais perto possível da meta sem vender nada. Depois o app arredonda para cotas inteiras e mostra a sobra; o valor da renda fixa sai inteiro, para aplicar no título que o usuário escolher;
- **com venda (opcional):** quanto vender de cada item acima da meta, só entre o que tem liquidez (F32), com o aviso de que venda de renda variável pode gerar DARF;
- **limites do alerta:** desvio máximo por item e total, configurados por subcarteira (o script usa 5 p.p. por item e 10 p.p. na soma). A F28 avisa com eles.

**Por que o desvio da planilha "não se mexe":** ela soma os desvios em valor absoluto. O que falta nos itens abaixo da meta é exatamente o que sobra nos de cima, então passar dinheiro de um item abaixo da meta para outro também abaixo dela (e que continua abaixo) não muda a soma. Exemplo: meta 40/30/30, o item A acima da meta e R$ 300 de aporte divididos entre B e C. As divisões 110/190, 120/180 e 150/150 dão todas a mesma soma de desvios, 12,31. Por isso a tentativa e erro não acha a melhor divisão, e o cálculo direto acha.

**Aceite:** o usuário faz um aporte inteiro guiado pela sugestão, sem abrir a planilha.

**F26 — Risco × retorno.** Gráfico de dispersão com um ponto por ativo e um para a carteira. Serve N8.

Plano:
- eixo x, o **risco**: a volatilidade anualizada, que mede o quanto o preço oscila de um dia para o outro, escalado para um ano (desvio-padrão dos retornos diários × √252, o número de pregões num ano). Volatilidade de 25% quer dizer, grosso modo, que em dois de cada três anos o retorno fica a até 25 pontos da média do ativo, para cima ou para baixo. Renda fixa pós-fixada fica perto de 0%; ação individual costuma ficar entre 20% e 40%;
- eixo y, o **retorno**: a rentabilidade no período escolhido;
- tamanho do ponto pelo valor na carteira, cor pela categoria;
- tabela ao lado com retorno, risco e valor de cada ativo, e uma chave para tirar o ativo do gráfico, já que um ponto extremo achata os outros;
- o ponto da carteira usa a cota da F15, e a volatilidade da carteira aparece como número no topo, com a mesma explicação;
- cálculo em float no Python sobre `price_history` (D4).

**F27 — Ferramenta de correlação entre dois ativos.** Para avaliar um ativo novo: escolhem-se dois tickers quaisquer, na carteira ou não, ou um ticker e um benchmark, e o app mostra o quanto eles andam juntos. Serve N9.

Plano:
- a **correlação** é um número de −1 a 1 calculado sobre os retornos diários. Perto de 1, os dois sobem e caem juntos, e um não diversifica o outro. Perto de 0, não há relação. Negativa, quando um sobe o outro tende a cair. Para diversificar, quer-se correlação baixa. A dica da tela traz essa leitura;
- o histórico de um ticker fora da carteira vem pelo `MarketDataProvider`, num cache próprio por ticker, separado de `price_history`, que é dos ativos da carteira;
- cálculo com `statistics.correlation`, da stdlib, sobre os dias com pregão nos dois; janela escolhida na tela (6 meses, 1, 3 ou 5 anos);
- gráfico das duas séries partindo do mesmo ponto, e o da correlação móvel: a correlação recalculada numa janela que desliza (ex.: 60 pregões), que mostra se a relação mudou com o tempo.

**F33 — Custo da bonificação.** Pela Receita (Perguntas e Respostas IRPF, pergunta 721), a ação recebida em bonificação tem custo: o valor do lucro ou da reserva capitalizado por ação, que a empresa informa no fato relevante. Hoje o CHECK `unit_price_by_type` obriga preço 0 na bonificação, e o motor só dilui o PM.

Plano:
- migration trocando o CHECK para preço `>= 0` na bonificação (desdobro e grupamento seguem com 0);
- DTO e formulário aceitando o valor por ação;
- `apply` somando `quantidade × preço` ao custo total na bonificação;
- teste de paridade do PM ajustado.

O importador da B3 segue gravando 0, e o usuário edita a bonificação com o valor informado pela empresa.

Gatilho: antes de declarar um ano com bonificação.

**F34 — Taxas da nota no resultado.** Corretagem, emolumentos e taxa de liquidação somam ao custo da compra e abatem do valor da venda (Perguntas e Respostas IRPF, pergunta 708). Hoje nada disso é gravado.

Plano:
- coluna `fees` (`DecimalText`, `>= 0`) em `operations`;
- o parser da nota rateia as taxas de cada nota pelas operações dela, proporcional ao valor;
- o motor de posição entra com as taxas no custo da compra, e o fiscal as abate do valor da venda;
- cadastro manual com o campo opcional.

Sem prioridade: o app prefere simplicidade a dado difícil de obter. Corretora sem corretagem ainda traz na nota os emolumentos e a taxa de liquidação da B3, em centavos.

Gatilho: quando a diferença das taxas passar a mudar DARF ou isenção de algum mês.

**F35 — IRRF abatido do DARF.** O 0,005% retido na venda (quando passa de R$ 1) e o 1% do day trade são antecipação do imposto do mês. O saldo de 1% não usado compensa nos meses seguintes até dezembro (Perguntas e Respostas IRPF, perguntas 706, 714 e 715).

Plano:
- ler o "IRRF s/ operações" de cada nota no parser;
- gravar o IRRF por nota numa tabela própria;
- abater do imposto de cada mês na apuração, carregando o saldo do day trade até dezembro;
- mostrar o IRRF no card do DARF e no demonstrativo do IRPF.

Sem prioridade: o IRRF retido hoje é de centavos, e o app prefere simplicidade a dado difícil de obter.

Gatilho: o primeiro mês em que o IRRF retido mudar o DARF.

**F36 — Posição por categoria com variação do dia.** A Carteira trocou as duas tabelas soltas por um `Accordion` com uma seção por categoria. O cabeçalho de cada seção mostra o número de ativos, a variação total e a do dia (R$ e %), o valor e a fração da carteira com barra. Dentro de cada seção, uma tabela ordenável por coluna (`@tanstack/react-table` sobre o `Table` do shadcn) traz o preço médio, o preço atual com a variação sobre o PM, a quantidade, o valor, a variação do dia, a variação total e a fração. A renda fixa é uma seção com colunas próprias: título, tipo, aplicado, valor bruto e as duas variações. `latest_prices` passou a trazer os dois últimos fechamentos de cada ativo, e a marcação da renda fixa ganhou `day_change`. O `GET /api/portfolio` devolve a variação por ativo, os agregados por categoria e a do total, com as datas dos dois pregões comparados, tudo calculado no Python.

Decisões tomadas durante:
- **O "hoje" da renda variável é o pregão mais recente do cache:** o ativo cujo último fechamento é de outro dia fica sem variação do dia ("—") e fora da soma da categoria. O percentual é sobre o valor da véspera, que é o de hoje menos a variação.
- **Na renda fixa, a variação do dia é o rendimento desde o dia útil anterior sobre os lotes de hoje:** a aplicação feita hoje entra no saldo sem contar como ganho, e o título vencido tem variação zero.
- **Tabela do shadcn com TanStack Table, e não o Data Grid do ReUI:** o item do ReUI só instala inteiro, com DnD, virtualização e Base UI ao lado do Radix. A ordenação é a mesma do TanStack, com uma dependência só. As seções de renda variável ordenam juntas, e a de renda fixa tem ordenação própria.
- "Variação do dia" e "Variação total" têm dica com a definição e um exemplo, no cabeçalho das colunas e no card do patrimônio. A cor de alta e baixa fica para a F44.

**Aceite verificado** no app de pé, numa cópia do banco migrado: todas as posições trazem a variação do dia com as datas dos dois pregões, a renda fixa rende um dia útil da Selic, as seções recolhem, e ordenar por valor numa seção reordena todas as de renda variável.

**F37 — Setor e segmento cadastrados.** As tabelas `sectors` (nome único) e `segments` (nome único dentro do setor) entraram, com `segment_id` anulável em `assets` e as duas FKs em `RESTRICT`; a coluna de texto `sector` saiu. `/api/sectors` cria, renomeia e apaga setores e segmentos, e recusa com 409 o nome repetido, o setor com segmento e o segmento com ativo. O ativo devolve o setor e o segmento pelos nomes, e a troca de ticker que junta dois ativos mantém a classificação de um deles. A tela Setores tem um card por setor com os segmentos, e o formulário do ativo ganhou o select de segmento agrupado por setor, com "Sem classificação". Na Carteira, o card "Renda variável por setor" mostra, em abas, setor e segmento: barras horizontais e a tabela de valor e fração.

Decisões tomadas durante:
- **A distribuição divide só a renda variável:** a renda fixa não tem setor, e a fração é sobre o total da renda variável. O ativo sem segmento entra em "Sem classificação".
- **Barras, e não donut:** o número de setores passa das cinco cores de gráfico, e a barra compara tamanhos com uma cor só.
- **O painel de saúde ganhou "Ativos sem setor ou segmento"**, só para os ativos com posição aberta, que são os que entram na distribuição. A ação é o "Editar ativo".

**Aceite verificado** no app de pé, numa cópia do banco migrado: logo depois da migration, os ativos em carteira aparecem no painel. Um setor e um segmento criados na tela Setores e escolhidos no "Editar ativo" do painel baixam o contador na hora, e a Carteira passa a dividir a renda variável entre o setor e "Sem classificação".

**F38 — Desempenho e distribuição dos proventos.** As visões de análise sobre o registro da F20. Serve N4.

Plano:
- **desempenho mensal:** gráfico de barras dos proventos por mês, ou por ano, com filtro de período. No topo, o total recebido e os totais dos últimos 6, 12 e 24 meses; embaixo, o total de cada categoria com a fração dela;
- **distribuição:** gráfico de pizza de quanto cada categoria e cada ativo contribuiu no período escolhido (6, 12 ou 24 meses). Embaixo, uma seção recolhível por categoria, com cada ativo: quantidade, dividend yield, yield on cost, último provento (valor e data) e total acumulado;
- dicas na tela: o **dividend yield** é o que o ativo pagou nos últimos 12 meses dividido pelo preço de hoje (R$ 6 pagos por um ativo que vale R$ 100 dá 6%), e diz quanto ele rende para quem compra hoje. O **yield on cost** é o mesmo valor pago dividido pelo preço médio que você pagou (R$ 6 sobre um PM de R$ 80 dá 7,5%), e diz quanto ele rende sobre o seu dinheiro. Quando o ativo valorizou desde a compra, o yield on cost fica acima do dividend yield.

**F28 — Alerta de rebalanceamento com o app fechado.** Substitui o popup agendado do script: um aviso quando algum desvio passar do limite configurado na F24. Serve N6.

Plano:
- um comando do próprio app, rodado sem subir o servidor, que atualiza as cotações, calcula os desvios de cada subcarteira com meta e, se algum limite furou, mostra o aviso com a subcarteira, o item e o desvio;
- o Agendador de Tarefas do Windows roda o comando, como roda o script hoje; a tela de metas mostra o comando pronto para agendar;
- o aviso é uma janela como a do script (Tkinter, da stdlib), só com o OK: a atualização manual da renda fixa que o script pede não existe mais, porque a renda fixa é marcada pelo app. A janela é intrusiva de propósito, para não passar despercebida.

A notificação no canto da tela do Windows fica como alternativa, se a janela incomodar no uso: é mais discreta, com o risco de passar sem ser vista.

**F32 — Liquidez em três camadas.** O patrimônio classificado pelo prazo em que vira dinheiro. Serve N2 e N6.
- **mexível:** renda fixa com liquidez diária;
- **intermediária:** renda variável, que sai em D+2, mas cuja venda pode gerar DARF;
- **travada:** renda fixa sem liquidez diária, até o vencimento.

Plano:
- a camada é derivada do que já existe (liquidez diária e vencimento do título da F12; classe do ativo), sem marcação manual;
- na Carteira: barra empilhada com o valor e a fração de cada camada, e a escada de vencimentos (quanto destrava em cada mês ou ano, em barras);
- na F24, a sugestão com venda considera só o que não está travado.

Sobre a liquidez no rebalanceamento: rebalancear pelo aporte, que é o caso comum, não precisa de liquidez, porque o dinheiro novo vai para o que está abaixo da meta. A liquidez importa quando rebalancear exige vender: o travado só se vende no vencimento, e um título travado acima da meta só se corrige com aportes nos outros itens. Por isso a camada entra na sugestão com venda, e não na do aporte.

Fica para quando o uso pedir: meta por camada (ex.: X% mexível).

**F39 — Correlação da carteira.** A correlação entre os ativos que a carteira tem, sem precisar escolher o par. Serve N8.

Plano:
- matriz com os ativos nas linhas e nas colunas, cada célula colorida pela correlação do par: o mesmo cálculo da F27, sobre `price_history`, com janela de 12 meses por padrão;
- os pares mais correlacionados em destaque: são os ativos que se sobrepõem na carteira;
- filtro de categoria, e o de carteira quando a F25 existir.

**F25 — Subcarteiras.** Grupos nomeados de ativos, como pastas: a carteira geral tem tudo, e cada subcarteira tem só o que é dela, com cada ativo em no máximo uma (D12). Serve N7.

Plano:
- tabela `subportfolios` (nome único) e `subportfolio_id` opcional em `assets` e em `fixed_income_investments`, com FK em `SET NULL`: apagar a subcarteira devolve os ativos à carteira geral sem subcarteira;
- tela de subcarteiras: criar, renomear, apagar, e escolher os ativos e títulos de cada uma; o formulário do ativo e o do título ganham o select;
- o seletor de carteira (geral ou uma subcarteira) em toda visão de carteira que já existir: posição, composição, setor, evolução do patrimônio, rentabilidade, ano a ano, proventos, correlação e risco × retorno. A visão filtra as posições e as linhas da série diária (F14) pelos ativos da subcarteira; a escolha fica na URL, para sobreviver à navegação;
- meta de rebalanceamento própria de cada subcarteira (F24).

Sem histórico de pertença: mover um ativo de subcarteira muda também o passado dela, porque a subcarteira é o conjunto de ativos de hoje.

**F40 — Troca de ticker como renomeação.** A tabela `asset_ticker_history` (ativo, ticker antigo, vigente até) fica ao lado do `ticker` atual. `backend/repository/tickers.py` concentra o ticker vigente numa data, a resolução de um ticker antigo para o atual e a regra de que nenhum ticker, antigo ou atual, é de dois ativos. `POST /api/assets/{id}/ticker-change` recebe o ticker novo e a data desde a qual ele vale. Quando o ticker novo já é um ativo, a troca junta os dois: as operações do antigo passam para o novo e o ativo antigo sai. Operações, posições do fiscal e Bens e Direitos mostram o ticker vigente na data; Carteira e Mercado, o atual. O detalhe do ativo ganhou "Trocar ticker", a lista dos tickers antigos e o botão Editar. Os importadores passam cada ticker pela resolução antes da chave natural. A transferência entre ativos saiu: endpoint, tela, tipos `transfer_in`/`transfer_out` e os dois `CHECK` de `operations`, numa migration própria.

Decisões tomadas durante:
- **A transferência saiu em dois passos.** Primeiro a renomeação com os tipos de transferência ainda no schema. Depois o par real foi juntado pela própria troca de ticker, e só então veio a migration que tira os tipos, que o dry run recusaria com o par no banco.
- **Junção só com as operações do lado certo:** o ativo antigo sem operação a partir da data, e o novo sem operação antes dela; senão, 422 com o motivo.
- **Editar o ticker no cadastro segue sendo correção de digitação**, sem histórico. A troca com data é a ação própria.
- O `position_at` saiu junto: a transferência era o único uso.

**Aceite verificado:** numa cópia do banco migrado, a junção do par que a migração trouxe manteve quantidade e PM de abertura e fechamento de todos os meses (0 divergências) e a apuração idêntica. Depois ela foi feita no banco real, com snapshot antes. O refresh passou a pedir só o ticker atual, e a nota anterior à troca volta no preview como já existente.

**F41 — Cache de dados externos idempotente.** O cache em três camadas da D6. `backend/domain/coverage.py`, puro, decide o que falta e quando ir à fonte. A tabela `fetch_log` guarda, por ativo ou série, a última tentativa, o último sucesso e se a falta persistiu. Os dois refreshes viraram plano e execução: o plano sai do cache, da janela de posição e do log, a rede é consultada fora da transação, e cada consulta externa vai para o log.
- **Cotação:** a janela vem de `holding_windows` (no motor de posição): da primeira operação até a que zerou a posição, ou aberta. O esperado é o último pregão encerrado dentro dela, com o fechamento às 18h30. A fonte é consultada quando o cache não cobre o começo da janela (operação retroativa) ou o esperado, quando o último pregão foi gravado antes do fechamento (preço parcial) e, com o pregão aberto e posição no ativo, para o preço do dia.
- **Séries do BCB:** inteiras no cache, desde o primeiro valor de cada uma no SGS, com ou sem renda fixa. O esperado é o dia útil anterior para CDI e Selic e, para o IPCA, o mês anterior a partir do dia 15.
- **Intervalo:** 15 minutos para cotação e 6 horas para o BCB, contando a tentativa que falhou. Um refresh por vez: o concorrente espera o lock e refaz o plano, que sai vazio.

Decisões tomadas durante:
- **Falta vira problema só depois da folga de publicação:** um pregão para cotação (a fonte demora a publicar o dia) e um dia útil para CDI e Selic (o valor do dia sai na manhã seguinte). O IPCA já tem a folga no esperado.
- **`failed` traz só o problema novo:** a falta que passou da folga nesta tentativa e não tinha sido avisada na anterior. O resto fica no painel da F42.
- **Quando a fonte responde e o buraco fica, a próxima tentativa espera um dia:** é a fonte que não tem o dado (um ativo com cotação no yfinance só a partir de uma data posterior à compra). A falha de rede segue no intervalo curto.
- A navegação por dia útil (anterior, na data ou depois) foi para o `BusinessCalendar`. Com o CDI inteiro em cache, ele conhece os feriados passados.

**Aceite verificado:** numa cópia do banco migrado, a primeira chamada a cada refresh consultou o que faltava. A segunda, logo depois, fez 0 chamadas externas, conferido no log. A carga inicial das três séries leva alguns minutos, uma vez só.

**Limitações residuais:** feriado do dia corrente, que o CDI ainda não publicou, conta como dia útil e custa uma consulta por intervalo. Ativo com posição e ticker sem cotação (deslistado) segue consultado a cada intervalo, e aparece no painel.

**F42 — Painel de saúde dos dados.** `GET /api/data-health` deriva os problemas a cada consulta, sem tabela (D2). Cada um traz o tipo, o item, o que falta, o que fica errado e a tela que corrige:
- **cotação faltando** dentro da janela de posição, pela mesma conta da F41 (`price_gaps`), com os trechos exatos. Com posição e o fim faltando, afeta o valor a mercado na Carteira (último preço ou custo); só o começo, o histórico do ativo. Leva ao ativo, onde está "Trocar ticker";
- **série do BCB atrasada** além da folga, com o que fica na marcação da renda fixa;
- **título de renda fixa sem aplicação**, que entra com valor zero no patrimônio;
- **ativo sem CNPJ** nos anos-base em que ele entra em Bens e Direitos. A regra de quem entra na ficha foi para `backend/domain/irpf.py`, usada pelo relatório e pelo painel.

Tela "Saúde dos dados" com uma seção por tipo, a explicação e a ação de cada item. A sidebar mostra o contador, e o toast dos refreshes aparece só com problema novo, com o atalho para o painel. Toda escrita em ativo, operação ou renda fixa e todo refresh invalidam o painel.

Decisões tomadas durante:
- **Ativo sem setor ou segmento entra com a F37**, que cria o cadastro.
- O item do menu passou a ter o link dentro do `SidebarMenuButton` (`asChild`), que é o que o badge do shadcn espera para se posicionar.

**Aceite verificado** no app de pé, com dado fictício: um ativo sem cotação, um título sem aplicação e um ativo sem CNPJ aparecem cada um na sua seção. Recarregar não repete o toast. Preencher o CNPJ pelo "Editar ativo" do painel baixa o contador na hora.

**F44 — Carteira: layout, gráfico e cor.** A página da Carteira não se arruma como um todo. O card do patrimônio tem textos soltos acima do gráfico. As seções por categoria abrem todas expandidas e são um accordion solto entre dois cards. E tudo é monocromático: resultado positivo e negativo têm a mesma cor, a classe do ativo é texto cinza, e o donut divide a tela com uma tabela esticada. Serve N2.

Plano:
- **layout da página**, de cima para baixo:
  - uma faixa de indicadores, cada um num card pequeno com rótulo, número e dica: patrimônio total, variação do dia e variação total. As datas dos dois pregões comparados saem do meio do card e vão para a dica da variação do dia;
  - a composição por categoria num card próprio, com o donut e a legenda;
  - as posições por categoria no mesmo idioma visual dos cards: cada seção um card recolhível, ou o accordion inteiro dentro de um card "Posições". A escolha sai na implementação, com os candidatos dos registries;
  - a distribuição por setor e segmento como está;
- **as seções começam fechadas:** o cabeçalho de cada uma já traz o resumo (valor, fração e as duas variações), e a tabela abre quando pedida;
- gráfico e legenda na proporção do donut do SimuladorFinanceiro (`portfolio-pie-chart`, com legenda e tooltip próprios), que é a referência;
- tooltip do gráfico próprio: marcador com a cor da categoria, nome, valor e fração, em fonte proporcional com números `tabular-nums`, e num tamanho legível;
- tokens semânticos de alta e baixa (`--gain`, `--loss`) no `index.css`, usados em todo resultado com sinal. A F30 ajusta o tom, e o uso já fica certo;
- **cor da categoria em todo lugar:** cada categoria tem uma cor fixa, a do gráfico, repetida no badge de classe, no cabeçalho das seções da F36 e nas barras de fração. A cor passa a identificar a categoria em qualquer tela. O `Badge` ganha a variante por categoria no próprio componente;
- a paleta das categorias fica longe do verde e do vermelho, que são de alta e baixa: um badge de categoria não pode ser lido como resultado.

Referências para a faixa de indicadores: o bloco `dashboard-01` do shadcn (cards de indicador com a tendência) e a Carteira do SimuladorFinanceiro.

**F45 — Operações: filtros e seletor de ativo.** A lista de ativos é um select comum que exige rolar até achar o ticker, e ela só cresce com o tempo. O "Limpar filtros" é um botão grande que pesa mais que os próprios filtros. Serve N3.

Plano:
- `AssetCombobox` em `shared/components` (Popover + Command do shadcn, busca por ticker), usado em todo campo que escolhe ativo: filtros de operações, formulário de operação, e os que vierem (correlação, metas);
- "Limpar filtros" como botão discreto ao lado dos filtros, visível só com filtro ativo;
- filtros na URL (D13);
- tipo de operação e classe do ativo com badge colorido: a classe com a cor da categoria (F44), a compra e a venda com cores próprias.

**F46 — Renda fixa: tipo do produto, Selic + spread e aplicação no cadastro.** O enum `FixedIncomeType` (CDB, RDB, LC, LCI, LCA, CRI, CRA, debênture, debênture incentivada e os três do Tesouro) substituiu a coluna `tax_exempt`: a isenção sai do tipo (`TAX_EXEMPT_TYPES`), e um `CHECK` prende cada Tesouro ao indexador do nome. A taxa da Selic passou a ser o spread anual, com o fator diário `(1 + Selic do dia) × (1 + spread)^(1/252)`; o CDI segue como percentual. O `POST /api/fixed-income` recebe a primeira aplicação junto e grava título e aplicação no mesmo commit; o `PUT` segue só com os termos. No formulário, o tipo vem primeiro, e o Tesouro fixa e trava o indexador. A tela de renda fixa agrupa os títulos por tipo, com o filtro na URL (`?type=`).

Decisões tomadas durante:
- **RDB entrou na lista de tipos:** é o produto da caixinha da corretora. A migration gravou RDB no título tributado que já existia, e LCI no isento (não havia nenhum).
- **O spread da Selic aceita zero e negativo:** o `CHECK` da taxa positiva passou a valer só fora da Selic.
- O item "Renda fixa sem aplicação" do painel de saúde ficou: com a aplicação no cadastro, ele só aparece quando alguém apaga todas as movimentações de um título.

**Aceite verificado** no app de pé, numa cópia do banco migrado: um Tesouro Selic + 0,10% a.a. cadastrado com a aplicação aparece no grupo do tipo e rende pela série da Selic, e o indexador fica travado ao escolher o tipo.

**F47 — Comparador de renda fixa.** Ferramenta para decidir entre opções de renda fixa antes de aplicar, no lugar do Comparador-Renda-Fixa. Serve N9.

Plano:
- cada opção tem tipo do produto (F46), indexador, taxa, valor e datas de aplicação e resgate, e elas aparecem lado a lado;
- para cada opção: valor bruto no resgate, alíquota de IR pelo prazo (ou isenção pelo tipo), valor líquido, rentabilidade líquida ao ano e equivalente em % do CDI;
- gráfico da evolução do valor líquido de cada opção no tempo;
- projeção com CDI e IPCA constantes, editáveis, partindo do último valor em cache (CDI anualizado e IPCA dos últimos 12 meses); a marcação é a da F12, sobre a série projetada;
- dica na tela: o **equivalente em % do CDI** é o quanto um CDB tributado precisaria render para empatar com a opção depois do IR. Uma LCI isenta de 90% do CDI, num prazo com IR de 15% no CDB, empata com um CDB de cerca de 106% do CDI (90 ÷ 0,85).

**F48 — Fiscal: navegação por mês na URL.** O seletor de mês da tela Fiscal não é o do IR-Helper, e o mês escolhido não fica na URL: navegando pelas setas, não dá para saber se a tela mudou de fato. Serve N5.

Plano:
- o seletor do IR-Helper: ‹ mês/ano ›, com o seletor de mês num popover (grade de meses com o ano navegável). O `monthpicker.tsx` adaptado no IR-Helper é portado para `shared/components`, com os meses em pt-BR;
- a aba (Mensal, Anual, Todos os meses, IRPF), o ano e o mês ficam na URL (D13). Setas e teclado mudam a URL, e voltar no navegador e link direto funcionam;
- a aba Anual e o IRPF usam o mesmo seletor, só de ano.

**F49 — Simulador: à vista, parcelado ou adiantar a fatura.** Ferramenta para uma compra que dá para pagar à vista: compensa pegar o desconto à vista, parcelar deixando o dinheiro investido, ou adiantar as parcelas que faltam em troca de um desconto? Serve N9.

**Como a conta funciona.** No parcelado, o valor inteiro fica investido e cada parcela sai do investimento no mês dela: o montante vai diminuindo, e cada fatia rende só até o mês em que é paga, com o IR do prazo dela (22,5% até 180 dias, 20% até 360, e assim por diante). O que sobra no fim é o ganho de parcelar. À vista, o desconto é ganho na hora e pode ficar investido até o fim do mesmo prazo. Ganha a opção que termina com mais dinheiro. Exemplo com CDI de 14% a.a., R$ 1.000 em 10x sem juros e um CDB de 100% do CDI: parcelando sobram cerca de R$ 49, então o à vista compensa com desconto acima de uns 4,5%.

Plano:
- **à vista × parcelado:** entrada com valor, número de parcelas, desconto à vista e o investimento onde o dinheiro fica (tipo, indexador e taxa, como no comparador da F47). Saída: quanto sobra em cada caminho e qual vence;
- **a conta nos dois sentidos:**
  - **do desconto para o investimento:** informado o desconto à vista, o app mostra os investimentos hipotéticos que, na estratégia parcelada, empatam com ele — um CDB a X% do CDI, uma LCI/LCA a Y% do CDI, um prefixado a Z% ao ano, um IPCA+ a W%. Qualquer taxa acima dessas faz o parcelado vencer. Exemplo com CDI de 14% a.a. e 10x: 20% de desconto só é batido por um CDB de cerca de 780% do CDI, uma LCA de 590% do CDI ou um prefixado de 109% a.a., ou seja, nunca; 5% de desconto é batido por um CDB de 112% do CDI, uma LCA de 88% do CDI ou um prefixado de 15,7% a.a., que existem;
  - **do investimento para o desconto:** informados o parcelamento e o investimento, o app mostra o desconto à vista que empata, a resposta prática para "quanto de desconto eu devo pedir";
- **adiantar a fatura:** o mesmo cálculo sobre as parcelas que faltam, com o desconto oferecido pelo adiantamento;
- **gráficos:** o saldo do investimento caindo parcela a parcela até o fim, contra o do caminho à vista; e o ganho de cada caminho conforme o número de parcelas e o desconto variam, com a linha de empate;
- **investimento sem liquidez diária:** a opção "escada", com um título por parcela vencendo antes de cada fatura (ou títulos agrupados por vencimento), cada um com a taxa e o IR do próprio prazo. Permite usar CDB ou prefixado de prazo maior no lugar do de liquidez diária, respeitando a carência mínima de cada produto;
- IOF sobre o rendimento do que sai em menos de 30 dias, que pega a primeira parcela;
- projeção do CDI e do IPCA como na F47: constante, editável, partindo do último valor em cache.

Nada é gravado: a simulação é conta sobre valores digitados na hora.

**F50 — Tabelas: linha inteira clicável e dica no cabeçalho.** Dois defeitos das tabelas de hoje. Serve N2 e N3.

Plano:
- **linha clicável:** nas tabelas em que a linha é um item com detalhe, só o nome é link, e o clique precisa cair exatamente em cima do texto. São elas: as posições da Carteira (renda variável e renda fixa), a lista de ativos, a lista de renda fixa e as posições do fiscal. A linha inteira passa a levar ao detalhe, com cursor de link e destaque ao passar o mouse:
  - o link no nome continua, para o teclado e para abrir em outra aba;
  - clique em botão ou menu dentro da linha não navega;
  - o comportamento mora num lugar só, como variante do `TableRow`, e as tabelas o usam;
  - na tabela de operações a linha é a operação, não o ativo, e ela fica como está;
- **dica que não abre:** o "i" da variação do dia e da variação total, no cabeçalho das tabelas ordenáveis, não mostra a dica. O ícone está dentro do botão de ordenar, e o `Button` do shadcn desliga o ponteiro de todo ícone dentro dele (`[&_svg]:pointer-events-none`), então o mouse nunca chega ao ícone. A dica sai do botão e fica ao lado dele, e clicar nela não ordena a coluna. No card do patrimônio, fora de botão, a mesma dica funciona.

**F51 — Máscaras nos campos.** Os campos de número são texto livre: o valor aceita "1.234,56" ou "1234.56", mas nada formata enquanto se digita, e o CNPJ e o ticker entram como vierem. Serve N3 e N5.

Plano:
- `shared/lib/mask.ts` com as máscaras num arquivo só, cada uma uma função de texto para texto aplicada no `onChange`, como o `format.ts` do SimuladorFinanceiro;
- **dinheiro** (aplicação e resgate da renda fixa, DARF pago): digitação da direita para a esquerda, em centavos, com "R$ 1.234,56" na tela;
- **preço unitário da operação:** separador de milhar e vírgula, com as casas que vierem. Não é em centavos: o leilão de fração chega com três casas;
- **quantidade:** inteiro com separador de milhar, e casas decimais só no tipo que admite fração (bonificação e o fator do grupamento);
- **taxa e spread:** percentual com vírgula; o spread da Selic aceita negativo;
- **CNPJ:** os 14 dígitos com os pontos, a barra e o hífen, e os dígitos verificadores conferidos na validação;
- **ticker:** maiúsculo e sem espaço;
- a máscara só formata. Quem lê o valor segue sendo o `parseDecimalInput`, que já aceita o formato pt-BR, e a API continua recebendo Decimal como string;
- o formulário de edição abre com o valor já formatado.

**F52 — Setor e segmento sugeridos pelo yfinance.** Classificar cada ativo à mão é o que enche o painel de saúde de "ativos sem setor". O yfinance traz o setor e a indústria da empresa, e o app pode sugerir a classificação. Serve N2.

O que o yfinance entrega (conferido): ação tem setor e indústria, em inglês ("Financial Services" e "Banks - Regional"); FII traz só o setor "Real Estate"; ETF não traz nada.

Plano:
- a sugestão aparece e o usuário confirma: nada é gravado sem ele escolher;
- onde ela aparece:
  - no cadastro de ativo novo, ao digitar o ticker;
  - no "Editar ativo";
  - no painel de saúde, com as sugestões de todos os ativos sem classificação numa lista, para aceitar de uma vez;
- **inglês contra o cadastro próprio** (a decidir na implementação). O setor e o segmento são nomes do usuário (F37), e o yfinance fala inglês. Opções:
  - **tradução fixa:** uma tabela no código com os setores e as indústrias do Yahoo em português; a sugestão escolhe o segmento com aquele nome ou oferece criá-lo;
  - **par aprendido:** na primeira vez que uma indústria do Yahoo aparece, o usuário escolhe ou cria o segmento dele, e o app guarda o par. Dali em diante, todo ativo da mesma indústria já chega com a sugestão;
  - recomendação: o par aprendido, que respeita os nomes que o usuário já deu e dispensa traduzir mais de cem indústrias. A tradução fixa pode entrar só para os 11 setores, como texto inicial;
- FII: o yfinance não diz o segmento (tijolo, papel, logística...), e a sugestão para no setor. ETF fica sem sugestão;
- a consulta é uma por ativo e fica em cache (D6), sem repetir a cada abertura.

Alternativa a conferir: a classificação setorial da B3, em português e oficial para as empresas listadas (setor econômico, subsetor e segmento), num arquivo baixável. Conferir se ela cobre BDR e FII antes de trocar de fonte.

---
## 2. Nice-to-have

| ID | Resumo | D# | Marco | Depende de | Esforço | Risco | Valor | Custo-benefício | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **F43** | Sidebar | — | M9 | F2 | Baixo | Baixo | Médio | Bom | ⏳ Pendente |

**F43 — Sidebar.** A sidebar de hoje é uma lista crua de links com texto pequeno, abaixo até do exemplo do shadcn.

Plano:
- referência: as sidebars do SimuladorFinanceiro e do IR-Helper, e os blocos de sidebar do shadcn;
- cabeçalho com o nome e o ícone do app;
- itens agrupados por assunto, com rótulo de grupo (carteira e ativos; operações e importação; mercado e análises; fiscal), ícone e texto maiores, e o item ativo destacado;
- recolhível para só os ícones, com o estado guardado (o `SidebarProvider` já faz isso por cookie);
- rodapé com a troca de tema e o contador do painel de dados (F42), quando ele existir.

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
| **F19** | Spike: proventos no relatório de movimentação da B3 | N4 — decide a fonte de F20 | M4 | — | 🔍 Em avaliação |
| **F29** | Empacotamento desktop | Nenhuma N# direta — conforto de uso | — | F2 | 🔍 Em avaliação |
| **F30** | Identidade visual própria (sair do tema padrão do shadcn) | Nenhuma N# direta — qualidade de uso das telas de N1/N2 | M9 | F11 | 🔍 Em avaliação |
| **F31** | Hot-reload do backend não reinicia o worker | Nenhuma N# direta — atrito de desenvolvimento | — | F2 | 🔍 Em avaliação |

**F19 — Spike: proventos no relatório de movimentação da B3.** O que falta definir: se o xlsx de movimentação da B3, exportado **sem filtro**, traz os proventos (dividendo, JCP, rendimento, rendimento tributado) com o que a F20 precisa: ativo, tipo, quantidade, valor por unidade e valor total. O xlsx que alimenta o IR-Helper foi exportado filtrado e não traz nenhum.

A conferir:
- quais tipos de linha aparecem e como se chamam;
- se o JCP vem bruto ou líquido dos 15% retidos;
- que data vem: a da movimentação é a do pagamento; a data com provavelmente não vem;
- se a chave natural da importação da F6 funciona igual para eles, sem duplicar na reimportação.

Exportar um período conhecido, conferir contra o extrato da corretora e decidir a fonte da F20: a B3, com cadastro manual para o que faltar, ou só o cadastro manual. Fonte paga fica fora, como em F10.

**F29 — Empacotamento desktop.** O que falta definir: se vale empacotar (PyInstaller .exe, como no SimuladorFinanceiro, ou Tauri) ou se `pnpm dev` com um atalho basta para o uso diário. Baixa prioridade: vale quando subir o app incomodar no uso real.

**F30 — Identidade visual própria.** O que falta definir: paleta, tipografia e tom das cores de alta, de baixa e das categorias que digam *este* app — dashboard financeiro, tabela densa e muito gráfico — no lugar do preset `nova` do shadcn (base `radix`, Lucide, fonte Geist, baseColor neutral).

A decisão cobre o que já é token no `index.css`:
- as cinco cores de série (`--chart-1` a `--chart-5`), hoje uma paleta categórica validada para daltonismo e contraste nos dois temas, e que a F44 torna a cor de cada categoria em todo o app; uma paleta nova passa pela mesma validação;
- o tom dos tokens de alta e baixa que a F44 cria, distintos do verde e do vermelho puros, por daltonismo e porque o vermelho do `destructive` significa erro;
- contraste para tabela densa no claro e no escuro.

Pontos de partida baratos: os outros presets do shadcn (`vega`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea`), que se trocam com um comando, e os registries do diretório do shadcn, cujos componentes entram pela mesma CLI e ficam no repo como os do shadcn.

Os problemas de uso que o usuário relata viram cards próprios (F43 a F48); esta feature fica com a identidade.

**F31 — Hot-reload do backend não reinicia o worker.** O que falta definir: por que o worker não reinicia no Windows. Enquanto isso, o `main.py` sobe o uvicorn sem reload, e mudança no backend pede reiniciar o `pnpm dev`. Baixa prioridade.

Diagnóstico até aqui: o WatchFiles detecta a mudança e loga `Reloading...`, o worker nunca reinicia, e o watcher não dispara de novo. Reproduz com o backend sozinho, pela CLI do uvicorn, sem `reload_excludes` e com import string + `factory=True`, o que aponta para o shutdown do worker no Windows nesta combinação de uvicorn e watchfiles. Próximos passos: `--reload-delay`, `WATCHFILES_FORCE_POLLING=1` e um app mínimo, para separar ambiente de aplicação. Resolvido, o reload volta ao `main.py`.

## Fora do roadmap

Multiusuário, autenticação, sincronização em nuvem e app mobile — fora do escopo local-only do produto (ver Contexto em DECISIONS.md), não são features adiadas. Saldo em conta corrente e gastos pessoais também ficam fora: o app cobre só o financeiro de investimentos.
