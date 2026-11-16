"""
Bot de atendimento no WhatsApp - Dojo Alpha
WhatsApp Cloud API (Meta) + Flask

Variáveis de ambiente:
    VERIFY_TOKEN     texto que você escolhe; o mesmo vai no painel da Meta ao cadastrar o webhook
    WHATSAPP_TOKEN   token de acesso (use um token permanente de usuário do sistema)
    PHONE_NUMBER_ID  ID do número no painel WhatsApp > API Setup
    APP_SECRET       (recomendado) segredo do app, para validar a assinatura dos webhooks
    GRAPH_VERSION    opcional, padrão v21.0

Rodar local:
    pip install -r requirements.txt     (flask requests gunicorn)
    flask --app bot_whatsapp run -p 5000
    ngrok http 5000                      -> URL pública para cadastrar o webhook

Produção:
    gunicorn -w 2 -b 0.0.0.0:8000 bot_whatsapp:app   (atrás de HTTPS)
    Cadastre em Meta > WhatsApp > Configuration: https://SEU-DOMINIO/webhook
    e assine o campo "messages".

Observações:
    - STATE e SEEN ficam em memória: com mais de um worker ou após reinício
      eles se perdem. Em produção, troque por Redis ou banco de dados.
    - Os dados de planos e horários espelham os do site (index.html).
      Mantenha os dois iguais ou migre para um data.json lido pelos dois.
"""
import hashlib
import hmac
import logging
import os
import re
import unicodedata

import requests
from flask import Flask, abort, request

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("bot")

app = Flask(__name__)

VERIFY_TOKEN = os.environ["VERIFY_TOKEN"]
ACCESS_TOKEN = os.environ["WHATSAPP_TOKEN"]
PHONE_ID = os.environ["PHONE_NUMBER_ID"]
APP_SECRET = os.environ.get("APP_SECRET", "")
GRAPH = os.environ.get("GRAPH_VERSION", "v21.0")
API_URL = f"https://graph.facebook.com/{GRAPH}/{PHONE_ID}/messages"

# --------------------------------------------------------------------------
# Dados (iguais aos do site)
# --------------------------------------------------------------------------
MODALIDADES = {
    "jiu-jitsu": {
        "nome": "Jiu-Jitsu",
        "horarios": [
            "Seg, Qua e Sex, 19:00-20:30: Adulto / Avançado (Tatame 1)",
            "Ter e Qui, 07:00-08:30: Iniciante (Tatame 1)",
        ],
    },
    "muay-thai": {
        "nome": "Muay Thai",
        "horarios": [
            "Seg, Qua e Sex, 18:00-19:00: Performance (Tatame 2)",
            "Ter e Qui, 20:00-21:00: Técnico (Tatame 2)",
        ],
    },
    "boxe": {
        "nome": "Boxe",
        "horarios": ["Seg, Qua e Sex, 20:30-21:45: Nobre Arte (Ringue Central)"],
    },
    "judo": {
        "nome": "Judô",
        "horarios": ["Ter e Qui, 18:00-19:30: Kids & Adulto (Tatame 1)"],
    },
}

PLANOS = [
    ("Mensal", 180, "1 modalidade à escolha, sem fidelidade"),
    ("Semestral", 159, "até 2 modalidades"),
    ("Anual", 139, "todas as modalidades, todas as unidades, uniforme e armário"),
]

# --------------------------------------------------------------------------
# Estado e deduplicação (em memória; veja observações no topo)
# --------------------------------------------------------------------------
STATE: dict[str, dict] = {}   # número -> {"step": ..., "nome": ..., "humano": bool}
SEEN: set[str] = set()        # ids de mensagens já processadas (a Meta reenvia webhooks)


# --------------------------------------------------------------------------
# Envio
# --------------------------------------------------------------------------
def _post(payload: dict) -> None:
    payload = {"messaging_product": "whatsapp", **payload}
    try:
        r = requests.post(
            API_URL,
            json=payload,
            headers={"Authorization": f"Bearer {ACCESS_TOKEN}"},
            timeout=10,
        )
        if not r.ok:
            log.error("Falha ao enviar (%s): %s", r.status_code, r.text)
    except requests.RequestException:
        log.exception("Erro de rede ao enviar mensagem")


def send_text(to: str, body: str) -> None:
    _post({"to": to, "type": "text", "text": {"body": body[:4096]}})


def send_list(to: str, body: str, rows: list[tuple[str, str, str]], button: str = "Ver opções") -> None:
    """rows: (id, título até 24 caracteres, descrição até 72 caracteres). Máximo 10 linhas."""
    _post({
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "list",
            "body": {"text": body[:1024]},
            "action": {
                "button": button[:20],
                "sections": [{
                    "title": "Opções",
                    "rows": [
                        {"id": i, "title": t[:24], "description": d[:72]}
                        for i, t, d in rows
                    ],
                }],
            },
        },
    })


# --------------------------------------------------------------------------
# Fluxos
# --------------------------------------------------------------------------
def menu(to: str, intro: str = "Como posso ajudar?") -> None:
    send_list(to, intro, [
        ("planos", "Planos e valores", "Mensal, semestral e anual"),
        ("horarios", "Grade de horários", "Veja as turmas por modalidade"),
        ("experimental", "Aula experimental", "Agende sua primeira aula"),
        ("atendente", "Falar com atendente", "Converse com uma pessoa"),
    ])


def modalidades_lista(to: str, prefixo: str, texto: str) -> None:
    send_list(to, texto, [
        (f"{prefixo}:{k}", m["nome"], "") for k, m in MODALIDADES.items()
    ] + [("menu", "Voltar ao menu", "")], button="Escolher")


def normalizar(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def detectar(texto: str) -> str | None:
    t = normalizar(texto)
    if re.search(r"atendente|humano|pessoa|falar com", t):
        return "atendente"
    if re.search(r"experimental|testar|agendar|aula gratis", t):
        return "experimental"
    if re.search(r"plano|preco|valor|mensalidade|quanto", t):
        return "planos"
    if re.search(r"horario|hora|grade|turma", t):
        return "horarios"
    if re.search(r"^(menu|oi|ola|bom dia|boa tarde|boa noite|inicio)\b", t):
        return "menu"
    return None


def processar(numero: str, texto: str = "", escolha: str = "") -> None:
    st = STATE.setdefault(numero, {})
    chave = escolha or detectar(texto) or ""

    # Conversa entregue a um atendente humano: o bot só volta se o cliente pedir o menu
    if st.get("humano") and chave != "menu":
        return

    # Coleta do nome para aula experimental
    if st.get("step") == "nome" and not escolha:
        st["nome"] = texto.strip()[:60]
        st["step"] = "modalidade"
        modalidades_lista(numero, "exp", f"Prazer, {st['nome']}! Qual modalidade você quer experimentar?")
        return

    if chave == "menu" or not chave:
        st.clear()
        menu(numero, "Olá! Sou o assistente virtual da Dojo Alpha. Como posso ajudar?" if not chave else "Como posso ajudar?")
    elif chave == "planos":
        linhas = "\n".join(f"• {n}: R$ {p}/mês ({d})" for n, p, d in PLANOS)
        send_text(numero, f"Nossos planos:\n{linhas}")
        menu(numero, "Quer ver mais alguma coisa?")
    elif chave == "horarios":
        modalidades_lista(numero, "hor", "De qual modalidade você quer ver os horários?")
    elif chave.startswith("hor:"):
        m = MODALIDADES.get(chave[4:])
        if m:
            send_text(numero, f"{m['nome']}\n" + "\n".join(f"• {h}" for h in m["horarios"]))
        menu(numero, "Quer ver mais alguma coisa?")
    elif chave == "experimental":
        st.clear()
        st["step"] = "nome"
        send_text(numero, "Vamos agendar sua aula experimental. Qual é o seu nome?")
    elif chave.startswith("exp:"):
        m = MODALIDADES.get(chave[4:])
        if m:
            nome = st.get("nome", "")
            log.info("AULA EXPERIMENTAL | %s | %s | %s", numero, nome, m["nome"])
            st.clear()
            st["humano"] = True
            send_text(numero, (
                f"Perfeito{', ' + nome if nome else ''}! Registrei seu pedido de aula experimental "
                f"de {m['nome']}. Um atendente vai confirmar o horário por aqui em breve."
            ))
    elif chave == "atendente":
        st.clear()
        st["humano"] = True
        log.info("PEDIDO DE ATENDENTE | %s", numero)
        send_text(numero, "Certo! Um atendente vai continuar a conversa por aqui. "
                          "Se quiser voltar ao menu automático, envie \"menu\".")


# --------------------------------------------------------------------------
# Webhook
# --------------------------------------------------------------------------
@app.get("/webhook")
def verificar():
    if (request.args.get("hub.mode") == "subscribe"
            and request.args.get("hub.verify_token") == VERIFY_TOKEN):
        return request.args.get("hub.challenge", ""), 200
    abort(403)


@app.post("/webhook")
def receber():
    if APP_SECRET:
        esperado = "sha256=" + hmac.new(APP_SECRET.encode(), request.get_data(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(esperado, request.headers.get("X-Hub-Signature-256", "")):
            abort(403)

    dados = request.get_json(silent=True) or {}
    try:
        for entry in dados.get("entry", []):
            for change in entry.get("changes", []):
                for msg in change.get("value", {}).get("messages", []):
                    mid = msg.get("id")
                    if mid in SEEN:
                        continue
                    SEEN.add(mid)
                    if len(SEEN) > 5000:
                        SEEN.clear()

                    numero = msg["from"]
                    tipo = msg.get("type")
                    if tipo == "text":
                        processar(numero, texto=msg["text"]["body"])
                    elif tipo == "interactive":
                        inter = msg["interactive"]
                        resp = inter.get("list_reply") or inter.get("button_reply") or {}
                        processar(numero, escolha=resp.get("id", ""))
                    else:
                        send_text(numero, "Por enquanto só consigo ler mensagens de texto. Envie \"menu\" para ver as opções.")
    except Exception:
        log.exception("Erro ao processar webhook")
    return "ok", 200   # sempre 200, senão a Meta reenvia


if __name__ == "__main__":
    app.run(port=int(os.environ.get("PORT", 5000)))
