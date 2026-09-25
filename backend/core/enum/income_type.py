from enum import StrEnum


class IncomeType(StrEnum):
    DIVIDEND = "dividend"
    JCP = "jcp"
    # "Rendimento" na B3: a distribuição de FII e de ETF e a atualização de provento
    # pago com atraso
    DISTRIBUTION = "distribution"
