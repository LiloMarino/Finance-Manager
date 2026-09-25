from enum import StrEnum


class FixedIncomeType(StrEnum):
    """O produto de renda fixa. Ele decide a isenção de IR e, no Tesouro, o
    indexador."""

    CDB = "cdb"
    RDB = "rdb"
    LC = "lc"
    LCI = "lci"
    LCA = "lca"
    CRI = "cri"
    CRA = "cra"
    DEBENTURE = "debenture"
    INCENTIVIZED_DEBENTURE = "incentivized_debenture"
    TREASURY_SELIC = "treasury_selic"
    TREASURY_PREFIXED = "treasury_prefixed"
    TREASURY_IPCA = "treasury_ipca"
