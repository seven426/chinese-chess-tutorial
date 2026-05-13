import copy
import math
import random
from typing import List, Dict, Any, Optional, Tuple
from .base import BaseEngine


class MinimaxEngine(BaseEngine):
    """
    Minimax + Alpha-Beta engine with enhanced evaluation.
    Ported and improved from the frontend JS AIEngine.
    """

    name = "minimax"

    # Base piece values
    PIECE_VALUES = {
        'K': 10000, 'A': 20, 'B': 20, 'R': 90, 'N': 42, 'C': 45, 'P': 10
    }

    # Position tables (Piece-Square Tables) for each piece type
    # Values are from black's perspective (row 0 is black side)
    # Red pieces use mirrored tables

    # Pawn PST - encourage crossing river and advancing
    PAWN_PST = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [2, 2, 2, 2, 2, 2, 2, 2, 2],
        [4, 4, 4, 4, 4, 4, 4, 4, 4],
        [6, 6, 6, 6, 6, 6, 6, 6, 6],
        [8, 8, 8, 8, 8, 8, 8, 8, 8],
        [12, 12, 12, 12, 12, 12, 12, 12, 12],
        [16, 16, 16, 16, 16, 16, 16, 16, 16],
        [20, 20, 20, 20, 20, 20, 20, 20, 20],
    ]

    # Knight PST - center is better, avoid corners/edges
    KNIGHT_PST = [
        [0, 0, 2, 4, 4, 4, 2, 0, 0],
        [0, 2, 4, 6, 6, 6, 4, 2, 0],
        [2, 4, 6, 8, 8, 8, 6, 4, 2],
        [4, 6, 8, 10, 10, 10, 8, 6, 4],
        [4, 6, 8, 10, 12, 10, 8, 6, 4],
        [4, 6, 8, 10, 10, 10, 8, 6, 4],
        [2, 4, 6, 8, 8, 8, 6, 4, 2],
        [0, 2, 4, 6, 6, 6, 4, 2, 0],
        [0, 0, 2, 4, 4, 4, 2, 0, 0],
        [0, 0, 0, 2, 2, 2, 0, 0, 0],
    ]

    # Rook PST - open lines, center files
    ROOK_PST = [
        [8, 8, 8, 10, 12, 10, 8, 8, 8],
        [6, 6, 6, 8, 10, 8, 6, 6, 6],
        [4, 4, 4, 6, 8, 6, 4, 4, 4],
        [4, 4, 4, 6, 8, 6, 4, 4, 4],
        [4, 4, 4, 6, 8, 6, 4, 4, 4],
        [4, 4, 4, 6, 8, 6, 4, 4, 4],
        [4, 4, 4, 6, 8, 6, 4, 4, 4],
        [6, 6, 6, 8, 10, 8, 6, 6, 6],
        [8, 8, 8, 10, 12, 10, 8, 8, 8],
        [10, 10, 10, 12, 14, 12, 10, 10, 10],
    ]

    # Cannon PST - similar to rook but slightly different
    CANNON_PST = [
        [4, 4, 4, 6, 8, 6, 4, 4, 4],
        [4, 4, 4, 6, 8, 6, 4, 4, 4],
        [4, 4, 4, 6, 8, 6, 4, 4, 4],
        [6, 6, 6, 8, 10, 8, 6, 6, 6],
        [6, 6, 6, 8, 10, 8, 6, 6, 6],
        [6, 6, 6, 8, 10, 8, 6, 6, 6],
        [4, 4, 4, 6, 8, 6, 4, 4, 4],
        [4, 4, 4, 6, 8, 6, 4, 4, 4],
        [4, 4, 4, 6, 8, 6, 4, 4, 4],
        [6, 6, 6, 8, 10, 8, 6, 6, 6],
    ]

    # Advisor PST - palace center preferred
    ADVISOR_PST = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 4, 0, 4, 0, 0, 0],
        [0, 0, 0, 0, 8, 0, 0, 0, 0],
        [0, 0, 0, 6, 0, 6, 0, 0, 0],
    ]

    # Bishop PST - stay on own side, center eye positions
    BISHOP_PST = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 4, 0, 0, 0, 4, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 6, 0, 0, 0, 6, 0, 0],
    ]

    # King PST - palace center
    KING_PST = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 4, 0, 4, 0, 0, 0],
        [0, 0, 0, 0, 8, 0, 0, 0, 0],
        [0, 0, 0, 6, 0, 6, 0, 0, 0],
    ]

    PST_MAP = {
        'P': PAWN_PST, 'N': KNIGHT_PST, 'R': ROOK_PST,
        'C': CANNON_PST, 'A': ADVISOR_PST, 'B': BISHOP_PST, 'K': KING_PST
    }

    def __init__(self):
        pass

    def get_piece_color(self, piece: str) -> Optional[str]:
        if not piece:
            return None
        return 'red' if piece[0] == 'r' else 'black'

    def get_piece_type(self, piece: str) -> Optional[str]:
        if not piece:
            return None
        return piece[1]

    def is_same_color(self, p1: str, p2: str) -> bool:
        if not p1 or not p2:
            return False
        return p1[0] == p2[0]

    def get_game_phase(self, board: List[List[str]]) -> str:
        count = sum(1 for row in board for cell in row if cell)
        if count > 20:
            return 'opening'
        if count < 10:
            return 'endgame'
        return 'midgame'

    def get_piece_value(self, ptype: str, phase: str) -> int:
        base = self.PIECE_VALUES.get(ptype, 0)
        if ptype == 'C':
            return 48 if phase == 'opening' else (38 if phase == 'endgame' else 45)
        if ptype == 'N':
            return 38 if phase == 'opening' else (48 if phase == 'endgame' else 42)
        return base

    def _get_pst_value(self, ptype: str, r: int, c: int, color: str) -> int:
        table = self.PST_MAP.get(ptype)
        if not table:
            return 0
        if color == 'red':
            # Mirror for red (row 9 becomes row 0)
            r = 9 - r
        return table[r][c]

    def evaluate(self, board: List[List[str]], color: str) -> float:
        phase = self.get_game_phase(board)
        score = 0

        for r in range(10):
            for c in range(9):
                piece = board[r][c]
                if not piece:
                    continue
                pcolor = self.get_piece_color(piece)
                ptype = self.get_piece_type(piece)
                value = self.get_piece_value(ptype, phase)
                pst = self._get_pst_value(ptype, r, c, pcolor)

                total = value + pst

                if pcolor == color:
                    score += total
                else:
                    score -= total

        # Check bonus
        enemy = 'black' if color == 'red' else 'red'
        if self._is_king_in_check(board, enemy):
            score += 500

        # Random perturbation for variety
        score *= (1 + (random.random() - 0.5) * 0.05)
        return score

    def _count_attacks(self, board: List[List[str]], color: str) -> int:
        """Count number of enemy pieces that are under attack."""
        count = 0
        for r in range(10):
            for c in range(9):
                piece = board[r][c]
                if not piece or self.get_piece_color(piece) != color:
                    continue
                moves = self._get_legal_moves_for_piece(board, r, c)
                for m in moves:
                    target = board[m[0]][m[1]]
                    if target and self.get_piece_color(target) != color:
                        count += 1
        return count

    # ========== Move Generation (ported from JS chess-engine.js) ==========

    def _get_legal_moves_for_piece(self, board: List[List[str]], r: int, c: int) -> List[Tuple[int, int]]:
        piece = board[r][c]
        if not piece:
            return []
        color = self.get_piece_color(piece)
        ptype = self.get_piece_type(piece)

        if ptype == 'K':
            moves = self._get_king_moves(board, r, c, color)
        elif ptype == 'A':
            moves = self._get_advisor_moves(board, r, c, color)
        elif ptype == 'B':
            moves = self._get_bishop_moves(board, r, c, color)
        elif ptype == 'R':
            moves = self._get_rook_moves(board, r, c, color)
        elif ptype == 'N':
            moves = self._get_knight_moves(board, r, c, color)
        elif ptype == 'C':
            moves = self._get_cannon_moves(board, r, c, color)
        elif ptype == 'P':
            moves = self._get_pawn_moves(board, r, c, color)
        else:
            moves = []

        # Filter out moves that leave own king in check
        return [m for m in moves if not self._is_king_in_check_after_move(board, r, c, m[0], m[1], color)]

    def _simulate_move(self, board: List[List[str]], from_r: int, from_c: int, to_r: int, to_c: int) -> List[List[str]]:
        new_board = [row[:] for row in board]
        new_board[to_r][to_c] = new_board[from_r][from_c]
        new_board[from_r][from_c] = ''
        return new_board

    def _is_king_in_check_after_move(self, board, from_r, from_c, to_r, to_c, color):
        new_board = self._simulate_move(board, from_r, from_c, to_r, to_c)
        return self._is_king_in_check(new_board, color)

    def _is_king_in_check(self, board: List[List[str]], color: str) -> bool:
        king_type = 'rK' if color == 'red' else 'bK'
        king_r = king_c = None
        for r in range(10):
            for c in range(9):
                if board[r][c] == king_type:
                    king_r, king_c = r, c
                    break
            if king_r is not None:
                break

        if king_r is None:
            return False

        enemy = 'black' if color == 'red' else 'red'
        for r in range(10):
            for c in range(9):
                piece = board[r][c]
                if not piece or self.get_piece_color(piece) != enemy:
                    continue
                ptype = self.get_piece_type(piece)
                if self._can_capture(board, r, c, king_r, king_c, ptype, enemy):
                    return True
        return False

    def _can_capture(self, board, from_r, from_c, to_r, to_c, ptype, color) -> bool:
        if ptype == 'K':
            # Facing kings
            if from_c == to_c:
                blocked = False
                for i in range(min(from_r, to_r) + 1, max(from_r, to_r)):
                    if board[i][from_c] != '':
                        blocked = True
                        break
                return not blocked
            return False
        elif ptype == 'R':
            return self._is_rook_move_valid(board, from_r, from_c, to_r, to_c)
        elif ptype == 'C':
            return self._is_cannon_move_valid(board, from_r, from_c, to_r, to_c)
        elif ptype == 'N':
            return self._is_knight_move_valid(board, from_r, from_c, to_r, to_c)
        elif ptype == 'P':
            forward = -1 if color == 'red' else 1
            crossed = from_r <= 4 if color == 'red' else from_r >= 5
            if to_r == from_r + forward and to_c == from_c:
                return True
            if crossed and to_r == from_r and abs(to_c - from_c) == 1:
                return True
            return False
        elif ptype == 'A':
            return abs(to_r - from_r) == 1 and abs(to_c - from_c) == 1
        elif ptype == 'B':
            return self._is_bishop_move_valid(board, from_r, from_c, to_r, to_c, color)
        return False

    def _is_king_move_valid(self, r, c, to_r, to_c, color):
        return abs(to_r - r) + abs(to_c - c) == 1

    def _is_advisor_move_valid(self, r, c, to_r, to_c, color):
        return abs(to_r - r) == 1 and abs(to_c - c) == 1

    def _is_bishop_move_valid(self, board, r, c, to_r, to_c, color):
        if abs(to_r - r) != 2 or abs(to_c - c) != 2:
            return False
        eye_r, eye_c = (r + to_r) // 2, (c + to_c) // 2
        if board[eye_r][eye_c] != '':
            return False
        if color == 'red' and to_r < 5:
            return False
        if color == 'black' and to_r > 4:
            return False
        return True

    def _is_rook_move_valid(self, board, r, c, to_r, to_c):
        if r != to_r and c != to_c:
            return False
        dr = 0 if r == to_r else (1 if to_r > r else -1)
        dc = 0 if c == to_c else (1 if to_c > c else -1)
        tr, tc = r + dr, c + dc
        while tr != to_r or tc != to_c:
            if board[tr][tc] != '':
                return False
            tr += dr
            tc += dc
        return True

    def _is_knight_move_valid(self, board, r, c, to_r, to_c):
        dr, dc = abs(to_r - r), abs(to_c - c)
        if not ((dr == 2 and dc == 1) or (dr == 1 and dc == 2)):
            return False
        leg_r = (r + to_r) // 2 if dr == 2 else r
        leg_c = (c + to_c) // 2 if dc == 2 else c
        return board[leg_r][leg_c] == ''

    def _is_cannon_move_valid(self, board, r, c, to_r, to_c):
        if r != to_r and c != to_c:
            return False
        dr = 0 if r == to_r else (1 if to_r > r else -1)
        dc = 0 if c == to_c else (1 if to_c > c else -1)
        tr, tc = r + dr, c + dc
        found = False
        while tr != to_r or tc != to_c:
            if board[tr][tc] != '':
                if found:
                    return False
                found = True
            tr += dr
            tc += dc
        target = board[to_r][to_c]
        if target:
            return found and not self.is_same_color(board[r][c], target)
        return not found

    def _is_pawn_move_valid(self, r, c, to_r, to_c, color):
        forward = -1 if color == 'red' else 1
        crossed = r <= 4 if color == 'red' else r >= 5
        if to_c == c and to_r == r + forward:
            return True
        if crossed and to_r == r and abs(to_c - c) == 1:
            return True
        return False

    def _get_king_moves(self, board, r, c, color):
        moves = []
        palace_rows = list(range(7, 10)) if color == 'red' else list(range(0, 3))
        palace_cols = [3, 4, 5]
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if nr in palace_rows and nc in palace_cols:
                target = board[nr][nc]
                if not target or self.get_piece_color(target) != color:
                    moves.append((nr, nc))
        # Facing kings capture
        enemy_king = 'bK' if color == 'red' else 'rK'
        for row in range(10):
            for col in range(9):
                if board[row][col] == enemy_king and col == c:
                    blocked = False
                    for i in range(min(r, row) + 1, max(r, row)):
                        if board[i][c] != '':
                            blocked = True
                            break
                    if not blocked:
                        moves.append((row, c))
        return moves

    def _get_advisor_moves(self, board, r, c, color):
        moves = []
        palace_rows = list(range(7, 10)) if color == 'red' else list(range(0, 3))
        palace_cols = [3, 4, 5]
        for dr, dc in [(-1, -1), (-1, 1), (1, -1), (1, 1)]:
            nr, nc = r + dr, c + dc
            if nr in palace_rows and nc in palace_cols:
                target = board[nr][nc]
                if not target or self.get_piece_color(target) != color:
                    moves.append((nr, nc))
        return moves

    def _get_bishop_moves(self, board, r, c, color):
        moves = []
        directions = [(-2, -2), (-2, 2), (2, -2), (2, 2)]
        eye_dirs = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
        for i, (dr, dc) in enumerate(directions):
            er, ec = eye_dirs[i]
            nr, nc = r + dr, c + dc
            eye_r, eye_c = r + er, c + ec
            if 0 <= nr <= 9 and 0 <= nc <= 8:
                if color == 'red' and nr < 5:
                    continue
                if color == 'black' and nr > 4:
                    continue
                if board[eye_r][eye_c] != '':
                    continue
                target = board[nr][nc]
                if not target or self.get_piece_color(target) != color:
                    moves.append((nr, nc))
        return moves

    def _get_rook_moves(self, board, r, c, color):
        moves = []
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            while 0 <= nr <= 9 and 0 <= nc <= 8:
                target = board[nr][nc]
                if not target:
                    moves.append((nr, nc))
                else:
                    if self.get_piece_color(target) != color:
                        moves.append((nr, nc))
                    break
                nr += dr
                nc += dc
        return moves

    def _get_knight_moves(self, board, r, c, color):
        moves = []
        offsets = [
            ((-2, -1), (-1, 0)), ((-2, 1), (-1, 0)),
            ((2, -1), (1, 0)), ((2, 1), (1, 0)),
            ((-1, -2), (0, -1)), ((1, -2), (0, -1)),
            ((-1, 2), (0, 1)), ((1, 2), (0, 1)),
        ]
        for (dr, dc), (lr, lc) in offsets:
            nr, nc = r + dr, c + dc
            leg_r, leg_c = r + lr, c + lc
            if 0 <= nr <= 9 and 0 <= nc <= 8:
                if board[leg_r][leg_c] != '':
                    continue
                target = board[nr][nc]
                if not target or self.get_piece_color(target) != color:
                    moves.append((nr, nc))
        return moves

    def _get_cannon_moves(self, board, r, c, color):
        moves = []
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            found = False
            while 0 <= nr <= 9 and 0 <= nc <= 8:
                target = board[nr][nc]
                if not found:
                    if not target:
                        moves.append((nr, nc))
                    else:
                        found = True
                else:
                    if target:
                        if self.get_piece_color(target) != color:
                            moves.append((nr, nc))
                        break
                nr += dr
                nc += dc
        return moves

    def _get_pawn_moves(self, board, r, c, color):
        moves = []
        forward = -1 if color == 'red' else 1
        crossed = r <= 4 if color == 'red' else r >= 5
        nr = r + forward
        if 0 <= nr <= 9:
            target = board[nr][c]
            if not target or self.get_piece_color(target) != color:
                moves.append((nr, c))
        if crossed:
            for dc in [-1, 1]:
                nc = c + dc
                if 0 <= nc <= 8:
                    target = board[r][nc]
                    if not target or self.get_piece_color(target) != color:
                        moves.append((r, nc))
        return moves

    def is_checkmate(self, board: List[List[str]], color: str) -> bool:
        if not self._is_king_in_check(board, color):
            return False
        for r in range(10):
            for c in range(9):
                piece = board[r][c]
                if piece and self.get_piece_color(piece) == color:
                    if self._get_legal_moves_for_piece(board, r, c):
                        return False
        return True

    # ========== Search ==========

    def _get_all_moves(self, board: List[List[str]], color: str):
        moves = []
        for r in range(10):
            for c in range(9):
                piece = board[r][c]
                if piece and self.get_piece_color(piece) == color:
                    for m in self._get_legal_moves_for_piece(board, r, c):
                        moves.append((r, c, m[0], m[1]))
        return moves

    def find_best_move(self, board: List[List[str]], color: str, depth: int = 2,
                       **kwargs) -> Optional[Dict[str, Any]]:
        if depth <= 0:
            return None

        moves = self._get_all_moves(board, color)
        if not moves:
            return None

        # Sort moves by capture value for better alpha-beta pruning
        def move_score(m):
            fr, fc, tr, tc = m
            captured = board[tr][tc]
            if captured:
                return self.get_piece_value(self.get_piece_type(captured), 'midgame')
            return 0

        moves.sort(key=move_score, reverse=True)

        best_score = -math.inf
        best_moves = []

        for m in moves:
            fr, fc, tr, tc = m
            new_board = self._simulate_move(board, fr, fc, tr, tc)
            score = self._minimax(new_board, depth - 1, -math.inf, math.inf, False, color)
            if score > best_score:
                best_score = score
                best_moves = [m]
            elif abs(score - best_score) < 0.001:
                best_moves.append(m)

        # For teaching levels, occasionally pick from top moves to avoid being too predictable
        chosen = random.choice(best_moves)
        return {
            "move": {"fromR": chosen[0], "fromC": chosen[1], "toR": chosen[2], "toC": chosen[3]},
            "engine": self.name,
            "eval_score": round(best_score, 2),
            "info": f"depth={depth}, evaluated {len(moves)} root moves"
        }

    def _minimax(self, board, depth, alpha, beta, is_maximizing, ai_color):
        current_color = ai_color if is_maximizing else ('black' if ai_color == 'red' else 'red')

        if depth == 0:
            return self.evaluate(board, ai_color)

        if self.is_checkmate(board, current_color):
            return 10000 if not is_maximizing else -10000

        moves = self._get_all_moves(board, current_color)
        if not moves:
            return 0

        # Move ordering for better pruning
        def cap_score(m):
            captured = board[m[2]][m[3]]
            if captured:
                return self.PIECE_VALUES.get(self.get_piece_type(captured), 0)
            return 0
        moves.sort(key=cap_score, reverse=True)

        if is_maximizing:
            max_eval = -math.inf
            for m in moves:
                new_board = self._simulate_move(board, m[0], m[1], m[2], m[3])
                ev = self._minimax(new_board, depth - 1, alpha, beta, False, ai_color)
                max_eval = max(max_eval, ev)
                alpha = max(alpha, ev)
                if beta <= alpha:
                    break
            return max_eval
        else:
            min_eval = math.inf
            for m in moves:
                new_board = self._simulate_move(board, m[0], m[1], m[2], m[3])
                ev = self._minimax(new_board, depth - 1, alpha, beta, True, ai_color)
                min_eval = min(min_eval, ev)
                beta = min(beta, ev)
                if beta <= alpha:
                    break
            return min_eval
