from __future__ import annotations

from backend.core.dto import BaseDTO, DecimalStr, NameInDTO
from backend.core.enum import SubportfolioColor, SubportfolioIcon


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
    icon: SubportfolioIcon
    color: SubportfolioColor
    assets: list[MemberAssetDTO]
    fixed_income: list[MemberInvestmentDTO]


class SubportfolioInDTO(NameInDTO):
    """O nome, o ícone e a cor: a identidade que aparece na sidebar e nos cards."""

    icon: SubportfolioIcon
    color: SubportfolioColor


class MembersInDTO(BaseDTO):
    """A filiação completa: o que vem aqui passa a ser da subcarteira, inclusive o
    que estava em outra, e o que era dela e não veio volta à carteira geral."""

    asset_ids: list[int]
    investment_ids: list[int]


class DivisionSliceDTO(BaseDTO):
    """Uma fatia da carteira: `subportfolio_id` nulo é o que está fora de qualquer
    subcarteira, o saldo incluído. `share` é a fração de 0 a 1 da carteira."""

    subportfolio_id: int | None
    value: DecimalStr
    share: DecimalStr


class DivisionDTO(BaseDTO):
    """Como a carteira se divide: as subcarteiras em ordem de nome e, por último, o
    que ficou fora delas."""

    total: DecimalStr
    slices: list[DivisionSliceDTO]
