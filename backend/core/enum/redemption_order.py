from enum import StrEnum


class RedemptionOrder(StrEnum):
    OLDEST_FIRST = "oldest_first"
    NEWEST_FIRST = "newest_first"
