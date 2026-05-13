import os
import subprocess
import threading
import time
from typing import List, Dict, Any, Optional
from .base import BaseEngine


class PikafishEngine(BaseEngine):
    """
    Wrapper for Pikafish UCI engine via subprocess.
    Requires pikafish binary and .nnue file to be available.
    """

    name = "pikafish"

    def __init__(self, binary_path: str = "pikafish",
                 nnue_path: Optional[str] = None,
                 default_options: Optional[Dict[str, Any]] = None):
        self.binary_path = binary_path
        self.nnue_path = nnue_path
        self.default_options = default_options or {}
        self._process: Optional[subprocess.Popen] = None
        self._lock = threading.Lock()
        self._initialized = False
        self._available = self._probe()

    def _probe(self) -> bool:
        """Check if pikafish binary is available and working."""
        if not os.path.exists(self.binary_path):
            # Try finding in PATH
            import shutil
            found = shutil.which(self.binary_path)
            if not found:
                return False
            self.binary_path = found

        try:
            proc = subprocess.Popen(
                [self.binary_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                cwd=os.path.dirname(self.binary_path) or "."
            )
            proc.stdin.write("uci\n")
            proc.stdin.flush()
            # Wait for uciok with timeout
            start = time.time()
            while time.time() - start < 3:
                line = proc.stdout.readline().strip()
                if line.startswith("uciok"):
                    proc.stdin.write("quit\n")
                    proc.stdin.flush()
                    proc.wait(timeout=2)
                    return True
            proc.terminate()
            return False
        except Exception:
            return False

    @property
    def available(self) -> bool:
        return self._available

    def _ensure_process(self):
        if self._process is None or self._process.poll() is not None:
            cwd = os.path.dirname(self.binary_path) or "."
            env = os.environ.copy()
            if self.nnue_path:
                env["NNUE_PATH"] = self.nnue_path
            self._process = subprocess.Popen(
                [self.binary_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                cwd=cwd,
                env=env
            )
            self._init_uci()

    def _init_uci(self):
        self._send("uci")
        self._wait_for("uciok")
        # Apply default options
        for key, val in self.default_options.items():
            self._send(f"setoption name {key} value {val}")
        self._send("isready")
        self._wait_for("readyok")
        self._initialized = True

    def _send(self, cmd: str):
        if self._process and self._process.stdin:
            self._process.stdin.write(cmd + "\n")
            self._process.stdin.flush()

    def _wait_for(self, target: str, timeout: float = 5.0) -> bool:
        start = time.time()
        while time.time() - start < timeout:
            line = self._process.stdout.readline().strip()
            if line.startswith(target):
                return True
        return False

    def _read_bestmove(self, timeout: float = 10.0) -> Optional[str]:
        start = time.time()
        while time.time() - start < timeout:
            line = self._process.stdout.readline().strip()
            if line.startswith("bestmove"):
                parts = line.split()
                if len(parts) >= 2:
                    return parts[1]
                return None
        return None

    # Coordinate conversion: frontend (row, col) <-> UCI (file+rank)
    # Frontend: row 0 = black side (top), row 9 = red side (bottom)
    # UCI: rank 9 = black side (top), rank 0 = red side (bottom)
    @staticmethod
    def _to_uci_square(row: int, col: int) -> str:
        file_char = chr(ord('a') + col)
        rank = 9 - row
        return f"{file_char}{rank}"

    @staticmethod
    def _from_uci_square(sq: str) -> tuple:
        file_char = sq[0]
        rank = int(sq[1:])
        col = ord(file_char) - ord('a')
        row = 9 - rank
        return row, col

    @staticmethod
    def _board_to_fen(board: List[List[str]], current_player: str = "black") -> str:
        """Convert frontend board to Xiangqi FEN string."""
        rows = []
        for r in range(10):
            empty = 0
            row_str = ""
            for c in range(9):
                piece = board[r][c]
                if not piece:
                    empty += 1
                else:
                    if empty > 0:
                        row_str += str(empty)
                        empty = 0
                    # Frontend: 'rK' = red king, 'bR' = black rook
                    # FEN: red = uppercase, black = lowercase
                    ptype = piece[1]
                    if piece[0] == 'r':
                        row_str += ptype.upper()
                    else:
                        row_str += ptype.lower()
            if empty > 0:
                row_str += str(empty)
            rows.append(row_str)
        fen = "/".join(rows)
        side = "w" if current_player == "red" else "b"
        # Xiangqi FEN: position side - - 0 1
        return f"{fen} {side} - - 0 1"

    def find_best_move(self, board: List[List[str]], color: str, depth: int = 10,
                       movetime_ms: int = 1000, **kwargs) -> Optional[Dict[str, Any]]:
        if not self.available:
            return None

        with self._lock:
            self._ensure_process()

            fen = self._board_to_fen(board, color)
            self._send(f"position fen {fen}")

            # Build go command
            go_cmd = "go"
            if movetime_ms > 0:
                go_cmd += f" movetime {movetime_ms}"
            if depth > 0:
                go_cmd += f" depth {depth}"
            self._send(go_cmd)

            uci_move = self._read_bestmove(timeout=(movetime_ms / 1000.0) + 5.0)
            if not uci_move or uci_move == "(none)":
                return None

            from_sq = uci_move[:2]
            to_sq = uci_move[2:4]
            from_r, from_c = self._from_uci_square(from_sq)
            to_r, to_c = self._from_uci_square(to_sq)

            return {
                "move": {"fromR": from_r, "fromC": from_c, "toR": to_r, "toC": to_c},
                "engine": self.name,
                "eval_score": 0.0,
                "info": f"uci={uci_move}"
            }

    def __del__(self):
        if self._process and self._process.poll() is None:
            try:
                self._send("quit")
                self._process.wait(timeout=2)
            except Exception:
                pass
