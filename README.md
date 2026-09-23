# Finance Manager

Dashboard pessoal de investimentos, **local-first**: roda em 127.0.0.1, sem
autenticação e sem nuvem, com os dados num SQLite na própria máquina. Substitui o
Status Invest e as planilhas de controle, e absorve o IR-Helper.

O que construir, em que ordem e por quê está em [ROADMAP.md](ROADMAP.md) e
[DECISIONS.md](DECISIONS.md).

## Stack

| Camada | Escolha |
|---|---|
| Backend | Python 3.13, FastAPI, Pydantic, `uv` |
| Frontend | React 19, Vite 8, React Router 7, TanStack Query, Tailwind 4, shadcn/ui |
| Tipagem | `pyright` em `strict`; `tsc` em `strict`; tipos do front gerados do OpenAPI |
| Lint | `ruff` no Python; `oxlint` com type-aware no front |
| Banco | SQLite, SQLAlchemy 2 (`MappedAsDataclass`), Alembic |

## Comandos

```bash
pnpm setup     # uv sync --dev + pnpm install no front
pnpm dev       # gera os tipos e sobe backend (:8000) e frontend (:5173)
pnpm check     # codegen + ruff + pyright + pytest + oxlint + tsc
pnpm openapi   # regenera frontend/types/openapi.generated.ts direto do backend
pnpm format    # ruff format
pnpm db:revision "create x table"   # gera uma migration por autogenerate (revise o arquivo)
```

## Estrutura

```
backend/
├── app.py            # create_app(): CORS, handlers de erro, rotas
├── config/           # config.toml + variáveis de ambiente (FM_*)
├── core/             # dto.py (fronteira Pydantic), errors.py, logger.py
│   ├── database/     # engine, backup e migrations no start
│   ├── enum/         # enums do domínio
│   └── models/       # models.py: Base, DecimalText e todas as tabelas
├── migrations/       # Alembic: env.py e versions/
├── adapters/         # fronteira de pandas/yfinance (regras de pyright relaxadas)
├── domain/           # dataclasses e funções puras
├── repository/       # acesso a dados; devolve DTO, nunca Row
└── features/<dominio>/router.py

frontend/
├── layouts/, pages/, features/<dominio>/
├── shared/{components/ui, lib, hooks}
└── types/            # openapi.generated.ts (gerado) e decimal.ts
```

## Banco

O banco vive em `data/finance.db`. A cada start, o `main.py` tira um snapshot
(`VACUUM INTO`) em `backups/`, mantendo os 10 mais recentes, e aplica as
migrations pendentes. Antes, cada migration roda numa cópia do banco, e só chega ao
banco real se nenhuma tabela perder linha ou célula preenchida. Pasta e quantidade de
snapshots ficam em `[backup]` no `config.toml`. A pasta pode ser a do Google Drive:
o que se sincroniza é o snapshot, nunca o banco vivo.

## Configuração

`config.toml` é local e não versionado — copie de `config.example.toml`.
Variável de ambiente tem precedência: `FM_SERVER__PORT=9000`.
