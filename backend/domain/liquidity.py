"""Quando cada parte do patrimônio vira dinheiro, derivado do que já existe, sem
marcação manual.

- hoje: o saldo e a renda fixa com liquidez diária;
- em 2 dias úteis: a renda variável, que sai em D+2, mas cuja venda pode gerar DARF;
- no vencimento: a renda fixa sem liquidez diária, que vira saldo quando vence.
"""

from __future__ import annotations

from backend.core.enum import LiquidityTier

CASH_TIER = LiquidityTier.DAILY
EQUITY_TIER = LiquidityTier.INTERMEDIATE


def investment_tier(daily_liquidity: bool) -> LiquidityTier:
    return LiquidityTier.DAILY if daily_liquidity else LiquidityTier.LOCKED
