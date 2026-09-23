from enum import StrEnum


class Indexer(StrEnum):
    CDI = "cdi"
    SELIC = "selic"
    IPCA = "ipca"
    PREFIXED = "prefixed"
