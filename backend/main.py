import os
import json
from typing import Optional, Dict, Any
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from engines.minimax import MinimaxEngine
from engines.pikafish import PikafishEngine

app = FastAPI(title="Chinese Chess AI Backend", version="1.0.0")

# CORS: allow frontend to call from any origin (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Engine registry
_minimax_engine = MinimaxEngine()

# Pikafish: configurable via env vars
PIKAFISH_BINARY = os.environ.get("PIKAFISH_BINARY", "pikafish")
PIKAFISH_NNUE = os.environ.get("PIKAFISH_NNUE", None)
_pikafish_engine: Optional[PikafishEngine] = None


def _get_pikafish() -> Optional[PikafishEngine]:
    global _pikafish_engine
    if _pikafish_engine is None:
        _pikafish_engine = PikafishEngine(
            binary_path=PIKAFISH_BINARY,
            nnue_path=PIKAFISH_NNUE,
            default_options={"Threads": 2, "Hash": 128}
        )
    return _pikafish_engine if _pikafish_engine.available else None


# ========== API Models ==========

class AIMoveRequest(BaseModel):
    board: list  # 10x9 array of strings
    color: str = "black"  # which side the AI plays
    level_id: int = 0
    ai_depth: int = 2
    engine: str = "auto"  # auto, minimax, pikafish
    movetime_ms: int = 1000


class AIMoveResponse(BaseModel):
    move: Optional[dict]
    engine: str
    eval_score: float
    info: str
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    engines: Dict[str, bool]


# ========== Endpoints ==========

@app.get("/api/health", response_model=HealthResponse)
def health():
    pf = _get_pikafish()
    return HealthResponse(
        status="ok",
        engines={
            "minimax": True,
            "pikafish": pf is not None and pf.available
        }
    )


@app.post("/api/ai-move", response_model=AIMoveResponse)
def ai_move(req: AIMoveRequest):
    board = req.board
    color = req.color
    depth = req.ai_depth
    engine_name = req.engine.lower()

    # Select engine
    selected_engine = None
    if engine_name == "pikafish":
        selected_engine = _get_pikafish()
        if selected_engine is None:
            return AIMoveResponse(
                move=None,
                engine="pikafish",
                eval_score=0.0,
                info="",
                error="Pikafish engine not available. Set PIKAFISH_BINARY env var."
            )
    elif engine_name == "minimax":
        selected_engine = _minimax_engine
    else:  # auto
        pf = _get_pikafish()
        if pf is not None and pf.available and depth >= 3:
            selected_engine = pf
        else:
            selected_engine = _minimax_engine

    try:
        if isinstance(selected_engine, PikafishEngine):
            # For pikafish, depth is used differently; limit movetime by level difficulty
            movetime = min(req.movetime_ms, 200 + depth * 300)
            result = selected_engine.find_best_move(
                board, color, depth=depth, movetime_ms=movetime
            )
        else:
            result = selected_engine.find_best_move(board, color, depth=depth)

        if result is None:
            return AIMoveResponse(
                move=None,
                engine=selected_engine.name,
                eval_score=0.0,
                info="No legal moves",
                error="No legal moves found"
            )

        return AIMoveResponse(
            move=result["move"],
            engine=result["engine"],
            eval_score=result.get("eval_score", 0.0),
            info=result.get("info", ""),
            error=None
        )
    except Exception as e:
        return AIMoveResponse(
            move=None,
            engine=selected_engine.name if selected_engine else "unknown",
            eval_score=0.0,
            info="",
            error=str(e)
        )


@app.post("/api/ai-move-json")
def ai_move_json_raw(request: Request):
    """Raw JSON endpoint for simpler frontend integration."""
    body = request.json()
    if isinstance(body, str):
        body = json.loads(body)
    req = AIMoveRequest(**body)
    return ai_move(req)


# For local dev
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
