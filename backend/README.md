# 中国象棋 AI 后端服务

FastAPI 后端，为 `chinese-chess-tutorial` 提供可选的 AI 走棋服务。

## 设计原则

- **前端优先离线**：前端保留完整的 JS AIEngine，后端只是可选增强
- **引擎插件化**：支持 Minimax（纯 Python）和 Pikafish（UCI 引擎）两种后端
- **自动降级**：后端不可用时，前端自动回退到本地 AI

## 安装

```bash
cd backend
pip install -r requirements.txt
```

可选：安装 Pikafish（最强开源象棋引擎）

```bash
# 下载 Pikafish 二进制和 nnue 权重文件
# https://github.com/official-pikafish/Pikafish/releases
export PIKAFISH_BINARY=/path/to/pikafish
export PIKAFISH_NNUE=/path/to/pikafish.nnue
```

## 启动

```bash
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

## API

### GET /api/health

检查服务状态和可用引擎。

### POST /api/ai-move

请求 AI 走法。

```json
{
  "board": [["bR","bN",...], ...],
  "color": "black",
  "level_id": 6,
  "ai_depth": 2,
  "engine": "auto"
}
```

响应：

```json
{
  "move": {"fromR": 0, "fromC": 1, "toR": 2, "toC": 2},
  "engine": "minimax",
  "eval_score": 120.5,
  "info": "depth=2, evaluated 44 root moves"
}
```

## 引擎选择策略

| 参数 | 说明 |
|------|------|
| `engine: "auto"` | depth < 3 用 minimax，depth >= 3 且 pikafish 可用则用 pikafish |
| `engine: "minimax"` | 强制使用 Python Minimax |
| `engine: "pikafish"` | 强制使用 Pikafish（不可用时返回错误） |

## 性能参考（Minimax）

| 深度 | 耗时（开局） | 说明 |
|------|-------------|------|
| 1 | ~0.01s | 教学关 |
| 2 | ~0.15s | 初级 |
| 3 | ~2.7s | 中级（残局更快） |
