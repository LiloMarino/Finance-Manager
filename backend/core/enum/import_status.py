from enum import StrEnum


class ImportStatus(StrEnum):
    NEW = "new"
    EXISTING = "existing"
    POSSIBLE_DUPLICATE = "possible_duplicate"
    REPEATED_IN_BATCH = "repeated_in_batch"
