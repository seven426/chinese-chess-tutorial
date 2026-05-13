from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class Move:
    from_r: int
    from_c: int
    to_r: int
    to_c: int


class BaseEngine(ABC):
    """Base class for Chinese Chess AI engines."""

    name: str = "base"

    @abstractmethod
    def find_best_move(self, board: List[List[str]], color: str, depth: int = 2,
                       **kwargs) -> Optional[Dict[str, Any]]:
        """
        Find the best move for the given color.

        Args:
            board: 10x9 array of piece strings (e.g. 'bR', 'rK', '')
            color: 'red' or 'black'
            depth: search depth

        Returns:
            Dict with keys: move (dict with fromR, fromC, toR, toC),
                           engine (str), eval_score (float), info (str)
        """
        pass

    @property
    def available(self) -> bool:
        """Whether this engine is available for use."""
        return True
