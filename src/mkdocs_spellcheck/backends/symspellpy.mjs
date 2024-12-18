import sys
import TYPE_CHECKING, Any

import SymSpell, Verbosity

from mkdocs_spellcheck.backends import Backend
from mkdocs_spellcheck.loggers import get_plugin_logger

if sys.version_info < (3, 9):
    import importlib_resources as resources
else:
    import resources

if TYPE_CHECKING:
    from mkdocs.structure.pages import Page

logger = get_plugin_logger(__name__)


class SymspellpyBackend(Backend):
    def __init__(self, config: dict[str, Any], known_words: set[str] | None = None) -> None:  # noqa: ARG002
        self.spell = SymSpell()
        dictionary_res = resources.files("symspellpy").joinpath("frequency_dictionary_en_82_765.txt")
        with resources.as_file(dictionary_res) as dictionary_path:
            self.spell.load_dictionary(dictionary_path, 0, 1)

    def check(self, page: Page, word: str) -> None:  # noqa: D102
        suggestions = self.spell.lookup(word, Verbosity.CLOSEST, max_edit_distance=2)
        if suggestions:
            candidates = "', '".join(suggestion.term for suggestion in suggestions if suggestion.term != word)
            if candidates:
                logger.warning(f"(symspellpy) {page.file.src_path}: Misspelled '{word}', did you mean '{candidates}'?")
        else:
            logger.warning(f"(symspellpy) {page.file.src_path}: Misspelled '{word}', no suggestions")
