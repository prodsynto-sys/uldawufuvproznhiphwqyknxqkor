
import hashlib
import hmac
import json
import os
import time
from urllib.parse import unquote

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS 

app = Flask(__name__)
CORS(app) 

# ─── КОНФИГУРАЦИЯ ────────────────────────────────────────────────────────────
BOT_TOKEN = os.environ.get("BOT_TOKEN", "8551428637:AAEdGJK5nYF8OXCUeoFzwIpdqMxv0_K93uE")
CHANNEL   = os.environ.get("TG_CHANNEL", "@Prodsynto") 
KITS = {
    "kit_APRIL2026":    os.environ.get("FILE_APRIL2026",    "BQACAgIAAxkBAAMGago5f4Mr9iG0QG-iewzGtvjXqDMAAiCeAALcl1FImxBO3zxsLcI7BA"),
    "kit_MARCH2026": os.environ.get("FILE_MARCH2026", "BQACAgIAAxkBAAMIago5sQfHvgQEcIuXtkITxqNxCn4AAiKeAALcl1FIMtJ6vgABv4cmOwQ"),
    "kit_KCBV2":     os.environ.get("FILE_KCBV2",     "BQACAgIAAxkBAAMGago5f4Mr9iG0QG-iewzGtvjXqDMAAiCeAALcl1FImxBO3zxsLcI7BA"),
}

KIT_NAMES = {
    "kit_APRIL2026":    "APRIL SYNTO KIT 2026",
    "kit_MARCH2026": "MARCH SYNTO KIT 2026",
    "kit_KCBV2":     "[KCB v2] COMMUNITY FX KIT W ME",
}

TG_API = "https://api.telegram.org/bot8551428637:AAEdGJK5nYF8OXCUeoFzwIpdqMxv0_K93uE"

# ─── ВЕРИФИКАЦИЯ initData ─────────────────────────────────────────────────────
def verify_telegram_init_data(init_data_raw: str) -> dict | None:

    try:
        parsed = {}
        for part in init_data_raw.split("&"):
            key, _, value = part.partition("=")
            parsed[key] = unquote(value)

        received_hash = parsed.pop("hash", None)
        if not received_hash:
            return None

        # Строка для проверки подписи
        data_check_string = "\n".join(
            f"{k}={v}" for k, v in sorted(parsed.items())
        )

        # HMAC-SHA256 с ключом = HMAC-SHA256("WebAppData", bot_token)
        secret_key = hmac.new(
            b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256
        ).digest()

        expected_hash = hmac.new(
            secret_key, data_check_string.encode(), hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_hash, received_hash):
            return None

        # Проверяем свежесть данных (не старше 1 часа)
        auth_date = int(parsed.get("auth_date", 0))
        if time.time() - auth_date > 3600:
            return None

        # Извлекаем user
        user_json = parsed.get("user", "{}")
        return json.loads(user_json)

    except Exception as e:
        print(f"[verify] error: {e}")
        return None


# ─── ПРОВЕРКА ПОДПИСКИ ────────────────────────────────────────────────────────
def is_subscribed(user_id: int) -> bool:
    try:
        resp = requests.get(
            f"{TG_API}/getChatMember",
            params={"chat_id": CHANNEL, "user_id": user_id},
            timeout=5,
        ).json()
        status = resp.get("result", {}).get("status", "")
        return status in ("member", "administrator", "creator")
    except Exception as e:
        print(f"[is_subscribed] error: {e}")
        return False


# ─── ОТПРАВКА КИТА ───────────────────────────────────────────────────────────
def send_kit(user_id: int, kit_id: str) -> bool:
    """Отправляет ZIP-архив кита пользователю в личку."""
    file_id = KITS.get(kit_id)
    if not file_id or file_id == "BQACAgIAAxkBAAMGago5f4Mr9iG0QG-iewzGtvjXqDMAAiCeAALcl1FImxBO3zxsLcI7BA":
        print(f"[send_kit] file_id не настроен для {kit_id}")
        return False

    kit_name = KIT_NAMES.get(kit_id, kit_id)
    try:
        resp = requests.post(
            f"{TG_API}/sendDocument",
            data={
                "chat_id": user_id,
                "document": file_id,
                "caption": (
                    f"🎁 *{kit_name}* — твой кит готов!\n\n"
                    "Благодари за подписку 🔥\n"
                    "Подписывайся на канал — будет ещё больше соуса 🟢"
                ),
                "parse_mode": "Markdown",
            },
            timeout=10,
        ).json()
        return resp.get("ok", False)
    except Exception as e:
        print(f"[send_kit] error: {e}")
        return False


# ─── МАРШРУТЫ ────────────────────────────────────────────────────────────────
@app.route("/check-sub", methods=["POST"])
def check_sub():
    data = request.get_json(silent=True) or {}

    init_data = data.get("initData", "")
    kit_id    = data.get("kitId", "")

    # 1. Верификация подписи
    user = verify_telegram_init_data(init_data)
    if not user:
        return jsonify({"error": "invalid_init_data"}), 403

    user_id = user.get("id")
    if not user_id:
        return jsonify({"error": "no_user_id"}), 403

    # 2. Проверка подписки
    subscribed = is_subscribed(user_id)

    # 3. Отправка кита
    sent = False
    if subscribed and kit_id in KITS:
        sent = send_kit(user_id, kit_id)

    print(f"[check-sub] user={user_id} kit={kit_id} subscribed={subscribed} sent={sent}")
    return jsonify({"subscribed": subscribed, "sent": sent})


@app.route("/health", methods=["GET"])
def health():
    """Проверка работоспособности сервера."""
    return jsonify({"status": "ok", "bot": BOT_TOKEN[:10] + "..."})


# ─── ЗАПУСК ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"▶  Server running on port {port}")
    print(f"   Channel : {CHANNEL}")
    print(f"   Kits    : {list(KITS.keys())}")
    app.run(host="0.0.0.0", port=port, debug=False)
