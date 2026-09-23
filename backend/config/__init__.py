from typing import Final

from backend.config.toml_settings import Settings, load_settings

settings: Final[Settings] = load_settings()

__all__ = ["Settings", "settings"]
