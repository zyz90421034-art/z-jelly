#!/usr/bin/env python3
"""UserPromptSubmit hook：界面显示 + 向模型注入额外上下文。

两条通道：
- stderr  → 界面显示（你能看到）
- stdout  → 输出 JSON，Claude Code 把 additionalContext 注入到本次对话上下文（模型能看到）

注意：stdout 必须是合法 JSON，且不要在 JSON 之外混入其它 print，
否则 Claude Code 会把整段 stdout 当普通文本处理，注入可能失效。
"""

import json
import sys


# ===== 在这里改你要注入的固定内容 =====
FIXED_INJECT = "【hook 注入】请用中文回答，并在代码变更时遵循仓库 CLAUDE.md。"
# ====================================


def build_injected(data: dict) -> str:
    """组装最终注入给模型的内容。可按需扩展（读 cwd / prompt 关键词等）。"""
    parts = [FIXED_INJECT]

    cwd = data.get("cwd", "")
    if cwd:
        parts.append("（当前工作目录: " + cwd + "）")

    # 示例：按 prompt 命中关键词追加规则
    prompt = data.get("prompt", "")
    if "测试" in prompt:
        parts.append('检测到你在聊"测试"，写代码时请同步补上 pytest 用例。')

    return "\n".join(parts)


def main() -> int:
    raw = sys.stdin.read()
    try:
        data = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        data = {}

    injected = build_injected(data)
    prompt = data.get("prompt", "")

    # 1) 注入给模型：stdout 输出合法 JSON
    payload = {
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": injected,
        }
    }
    print(json.dumps(payload, ensure_ascii=False))

    # 2) 界面显示：stderr
    bar = "=" * 60
    print("\n[echo_prompt hook] 收到用户 prompt:", file=sys.stderr)
    print(bar, file=sys.stderr)
    print(prompt, file=sys.stderr)
    print(bar, file=sys.stderr)
    print("[echo_prompt hook] 已注入上下文:", file=sys.stderr)
    print(injected, file=sys.stderr)
    print(bar, file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())