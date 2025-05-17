import logging
import sys
from typing import Any, Dict

# ロガーの設定
logger = logging.getLogger("contest_calendar")
logger.setLevel(logging.INFO)

# コンソールハンドラの設定
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)

# フォーマッターの設定
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
console_handler.setFormatter(formatter)

# ハンドラの追加
logger.addHandler(console_handler)

def log_extra(extra: Dict[str, Any]) -> str:
    """追加情報をログメッセージに変換"""
    if not extra:
        return ""
    return " | " + " | ".join(f"{k}={v}" for k, v in extra.items()) 
