"""A sugestão de setor e segmento a partir do que a fonte de mercado diz do ticker.

A fonte fala inglês, e o setor e o segmento são nomes do usuário. A ponte entre os dois
são os ativos que ele já classificou: o ticker recebe o segmento dos ativos com a mesma
indústria na fonte, pelo id, e o nome que aparece é o de hoje. A primeira vez de cada
indústria chega só com os nomes para criar o segmento."""

from __future__ import annotations

from collections import Counter
from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from typing import Protocol

from backend.core.errors import FinanceError

# Os setores do Yahoo com o nome da B3 para o mesmo recorte, onde ele existe. É só o
# texto inicial de um setor novo: o nome que vale é o que o usuário salvar.
SECTOR_NAMES = {
    "Basic Materials": "Materiais Básicos",
    "Communication Services": "Comunicações",
    "Consumer Cyclical": "Consumo Cíclico",
    "Consumer Defensive": "Consumo não Cíclico",
    "Energy": "Petróleo, Gás e Biocombustíveis",
    "Financial Services": "Financeiro",
    "Healthcare": "Saúde",
    "Industrials": "Bens Industriais",
    "Real Estate": "Imobiliário",
    "Technology": "Tecnologia da Informação",
    "Utilities": "Utilidade Pública",
}


class ProfileUnavailableError(FinanceError):
    status = 503


@dataclass(frozen=True, slots=True, kw_only=True)
class CompanyProfile:
    """O setor e a indústria na fonte, em inglês. ETF não tem nenhum dos dois."""

    sector: str | None
    industry: str | None


class ProfileProvider(Protocol):
    def profile(self, ticker: str) -> CompanyProfile | None:
        """O perfil do ticker da B3, sem o `.SA`; `None` quando a fonte não conhece o
        ticker. Levanta `ProfileUnavailableError` quando a fonte não responde."""
        ...


@dataclass(frozen=True, slots=True, kw_only=True)
class ClassifiedPeer:
    """Um ativo já classificado, com o perfil dele na fonte."""

    profile: CompanyProfile
    segment_id: int
    sector_id: int


@dataclass(frozen=True, slots=True, kw_only=True)
class Suggestion:
    """`segment_id` e `sector_id` apontam para a classificação do usuário. Sem o
    segmento, `new_sector_name` e `new_segment_name` são o texto inicial para criá-lo:
    o setor só vem como nome quando nenhum setor do usuário corresponde."""

    source_sector: str | None
    source_industry: str | None
    segment_id: int | None
    sector_id: int | None
    new_sector_name: str | None
    new_segment_name: str | None


def _most_common(ids: Iterable[int]) -> int | None:
    """O id mais frequente; no empate, o menor."""
    counts = Counter(ids)
    return min(counts, key=lambda key: (-counts[key], key)) if counts else None


def suggest(
    profile: CompanyProfile,
    peers: Iterable[ClassifiedPeer],
    sectors: Mapping[str, int],
) -> Suggestion | None:
    """A classificação que os ativos parecidos já têm. `sectors` são os setores do
    usuário pelo nome, e a tradução do setor da fonte cai num deles quando o nome
    coincide, sem diferença de maiúsculas."""
    if profile.sector is None and profile.industry is None:
        return None
    peers = list(peers)

    same_industry = [
        peer
        for peer in peers
        if profile.industry is not None and peer.profile.industry == profile.industry
    ]
    segment_id = _most_common(peer.segment_id for peer in same_industry)
    if segment_id is not None:
        sector_id = next(
            peer.sector_id for peer in same_industry if peer.segment_id == segment_id
        )
        return Suggestion(
            source_sector=profile.sector,
            source_industry=profile.industry,
            segment_id=segment_id,
            sector_id=sector_id,
            new_sector_name=None,
            new_segment_name=None,
        )

    sector_id = _most_common(
        peer.sector_id
        for peer in peers
        if profile.sector is not None and peer.profile.sector == profile.sector
    )
    new_sector_name = (
        SECTOR_NAMES.get(profile.sector, profile.sector) if profile.sector else None
    )
    if sector_id is None and new_sector_name is not None:
        by_name = {name.casefold(): found for name, found in sectors.items()}
        sector_id = by_name.get(new_sector_name.casefold())
    return Suggestion(
        source_sector=profile.sector,
        source_industry=profile.industry,
        segment_id=None,
        sector_id=sector_id,
        new_sector_name=None if sector_id is not None else new_sector_name,
        new_segment_name=profile.industry,
    )
