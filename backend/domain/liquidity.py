"""As camadas de liquidez, derivadas do que já existe, sem marcação manual.

- mexível: o saldo e a renda fixa com liquidez diária;
- intermediária: a renda variável, que sai em D+2, mas cuja venda pode gerar DARF;
- travada: a renda fixa sem liquidez diária, até o vencimento, quando vira saldo.
"""

from __future__ import annotations

from backend.core.enum import LiquidityTier

CASH_TIER = LiquidityTier.DAILY
EQUITY_TIER = LiquidityTier.INTERMEDIATE


def investment_tier(daily_liquidity: bool) -> LiquidityTier:
    return LiquidityTier.DAILY if daily_liquidity else LiquidityTier.LOCKED
