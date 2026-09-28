from __future__ import annotations

from backend.core.dto import BaseDTO


class MemberAssetDTO(BaseDTO):
    id: int
    ticker: str


class MemberInvestmentDTO(BaseDTO):
    id: int
    label: str


class SubportfolioDTO(BaseDTO):
    """A subcarteira com os ativos e os títulos de hoje, em ordem de nome."""

    id: int
    name: str
    assets: list[MemberAssetDTO]
    fixed_income: list[MemberInvestmentDTO]


class MembersInDTO(BaseDTO):
    """A filiação completa: o que vem aqui passa a ser da subcarteira, inclusive o
    que estava em outra, e o que era dela e não veio volta à carteira geral."""

    asset_ids: list[int]
    investment_ids: list[int]
