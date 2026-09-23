# Finance Manager — convenções do projeto

Contexto de produto e ordem de construção: [DECISIONS.md](DECISIONS.md) e
[ROADMAP.md](ROADMAP.md). Comandos e estrutura: [README.md](README.md).

## Git

- Todo commit vai direto na `main`: o repo é pessoal e solo.
- O assunto do commit descreve o que foi feito, pelo nome da coisa ("Criado o
  scaffold em FastAPI + Vite").

## IDs do roadmap ficam no roadmap

`N#`, `D#`, `F#`, `M#` e os nomes de spike existem só no `ROADMAP.md` e no
`DECISIONS.md`. Código, comentários, testes, textos de UI, README e commits dizem a
coisa pelo nome, para quem lê sem abrir o roadmap: "Decimal gravado como TEXT", e
não "(D4)"; "suítes de paridade com o IR-Helper", e não "F8".

## Documentos do roadmap

- O `ROADMAP.md` é gerado: toda mudança passa por
  `python <claude-skills>/feature-roadmap/scripts/roadmap.py ROADMAP.md <comando>`.
- O `DECISIONS.md` é o único de prosa livre.

## Dados

- O `irpf_helper.db` do IR-Helper é oráculo somente leitura. Tudo que sai dele
  fica fora do git: nota de corretagem em texto traz nome, CPF e endereço.
- `data/` (banco vivo) e `backups/` (snapshots) são locais e ignorados.

## Backend

- Estrutura:
  - models num arquivo só, `backend/core/models/models.py`, com a `Base`, os tipos
    de coluna e todas as tabelas;
  - enums em `backend/core/enum/`, um por arquivo, reexportados no `__init__`;
  - `Base` com `MappedAsDataclass`, o que faz o pyright acusar kwarg inexistente
    no construtor.
- Decimal:
  - no banco, é TEXT, via `DecimalText`;
  - na API, é string nos dois sentidos: `DecimalStr` na saída e `DecimalStrIn` na
    entrada (`backend/core/dto.py`);
  - a conta com Decimal mora no Python. O front formata, e o brand
    `DecimalString` cobre `*`, `/` e `toFixed`, mas não `+` nem `>`.
- Erro de domínio é `FinanceError`, com o `status` HTTP como atributo de classe. O
  domínio é puro, sem `fastapi`, e a borda (`backend/app.py`) traduz tudo para
  `{"detail": "<string>"}`, inclusive o 422.
- Validador Pydantic levanta `ValueError`, que é o que vira 422.
- Schema:
  - o schema nasce de migration Alembic. `pnpm db:revision "<descrição em inglês>"`
    gera a revisão, e o arquivo gerado é revisado antes de aplicar;
  - `CHECK` nova em tabela existente entra à mão na migration, e o
    `tests/test_migrations.py` confere cada `CHECK` do metadata no DDL.
- O `main.py` prepara o banco antes do uvicorn: primeiro o snapshot, depois a
  migration, testada numa cópia do banco. O `create_app` não toca no banco.
- `pyright` em `strict`, sem `# type: ignore`, `cast(` ou `Any`. A exceção é
  `backend/adapters/`, que tem regras relaxadas no `pyrightconfig.json`; ali o
  env leva `"extraPaths": ["."]`, e existe um segundo env com `"root": "."`.

## Testes

- Nome da função em inglês, descrevendo o comportamento
  (`test_asset_with_operations_cannot_be_deleted`).
- O que o teste verifica vai em pt-BR, na docstring do teste.

## Frontend

- Os tipos vêm de `pnpm openapi`, que gera `frontend/types/openapi.generated.ts`
  direto do backend, sem servidor de pé.
- O front fica no TypeScript 6, que é o que o `openapi-typescript` suporta. O
  lint é `oxlint` com type-aware, que traz os próprios binários.
- `shared/components/ui` e `shared/hooks/use-mobile.ts` são código vendorizado do
  shadcn, fora do lint.
