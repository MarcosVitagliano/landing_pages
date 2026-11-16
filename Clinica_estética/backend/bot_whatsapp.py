"""
Bot de atendimento no WhatsApp - Aura Estética
WhatsApp Cloud API (Meta) + Flask

Variáveis de ambiente:
    VERIFY_TOKEN     texto que você escolhe; o mesmo vai no painel da Meta ao cadastrar o webhook
    WHATSAPP_TOKEN   token de acesso (use um token permanente de usuário do sistema)
    PHONE_NUMBER_ID  ID do número no painel WhatsApp > API Setup
    APP_SECRET       (recomendado) segredo do app, para validar a assinatura dos webhooks
    GRAPH_VERSION    opcional, padrão v21.0

Rodar local:
    pip install -r requirements.txt
    flask --app bot_whatsapp run -p 5000
    ngrok http 5000          -> URL pública para cadastrar o webhook em /webhook

Produção:
    gunicorn -w 1 -b 0.0.0.0:8000 bot_whatsapp:app   (atrás de HTTPS)

Observações:
    - STATE e SEEN ficam em memória: use 1 worker ou troque por Redis/banco.
    - Serviços e horários espelham src/app/core/data.ts e config.ts do site.
      Mantenha os dois iguais.
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
NOME = "Aura Estética"
ENDERECO = "Rua Exemplo, 123 - Jardins, São Paulo - SP"
FUNCIONAMENTO = ["Segunda a sexta: 9h às 19h", "Sábado: 9h às 14h", "Domingo: fechado"]

SERVICOS = {
    "limpeza-de-pele": ("Limpeza de pele profunda", "Facial", "60 min",
                        "Remove impurezas e prepara a pele, com extração delicada e finalização hidratante."),
    "peeling": ("Peeling", "Facial", "45 min",
                "Renovação da superfície da pele, com produtos escolhidos após a avaliação."),
    "microagulhamento": ("Microagulhamento", "Facial", "60 min",
                         "Estímulo controlado da pele, indicado conforme a avaliação profissional."),
    "drenagem-linfatica": ("Drenagem linfática", "Corporal", "50 min",
                           "Massagem suave e ritmada que traz sensação de leveza e bem-estar."),
    "massagem-modeladora": ("Massagem modeladora", "Corporal", "50 min",
                            "Técnica firme e localizada, feita em sessões, com foco no contorno corporal."),
    "radiofrequencia": ("Radiofrequência", "Corporal", "45 min",
                        "Tecnologia aplicada à pele, em protocolo definido na avaliação."),
    "depilacao-a-laser": ("Depilação a laser", "Depilação", "30 a 60 min",
                          "Redução gradual dos pelos em sessões, ajustada ao seu tipo de pele."),
    "harmonizacao-facial": ("Harmonização facial", "Harmonização", "60 min",
                            "Procedimentos realizados por profissional habilitado, após avaliação individual."),
}

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
    """rows: (id, título até 24 caracteres, descrição até 72). Máximo 10 linhas."""
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
                    "rows": [{"id": i, "title": t[:24], "description": d[:72]} for i, t, d in rows],
                }],
            },
        },
    })


# --------------------------------------------------------------------------
# Fluxos
# --------------------------------------------------------------------------
def menu(to: str, intro: str = "Como posso ajudar?") -> None:
    send_list(to, intro, [
        ("servicos", "Serviços", "Veja os tratamentos oferecidos"),
        ("agendar", "Agendar horário", "Peça um horário à nossa equipe"),
        ("funcionamento", "Horário e endereço", "Quando e onde atendemos"),
        ("atendente", "Falar com atendente", "Converse com uma pessoa"),
    ])


def lista_servicos(to: str, prefixo: str, texto: str) -> None:
    send_list(to, texto, [
        (f"{prefixo}:{k}", nome, f"{cat} · {dur}") for k, (nome, cat, dur, _) in SERVICOS.items()
    ] + [("menu", "Voltar ao menu", "")], button="Escolher")


def normalizar(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def detectar(texto: str) -> str | None:
    t = normalizar(texto)
    if re.search(r"atendente|humano|pessoa|falar com", t):
        return "atendente"
    if re.search(r"endereco|onde fica|localizacao|funcionamento|abre|fecha|horario de atendimento", t):
        return "funcionamento"
    if re.search(r"agendar|agendamento|marcar|consulta|avaliacao|horario", t):
        return "agendar"
    for chave, (nome, *_rest) in SERVICOS.items():
        if normalizar(nome) in t:
            return f"srv:{chave}"
    if re.search(r"servico|procedimento|tratamento|facial|corporal|laser", t):
        return "servicos"
    if re.search(r"^(menu|oi|ola|bom dia|boa tarde|boa noite|inicio)\b", t):
        return "menu"
    return None


def processar(numero: str, texto: str = "", escolha: str = "") -> None:
    st = STATE.setdefault(numero, {})
    chave = escolha or detectar(texto) or ""

    # Conversa entregue a um atendente humano: o bot só volta se o cliente pedir o menu
    if st.get("humano") and chave != "menu":
        return

    # Coleta do nome para o pedido de agendamento
    if st.get("step") == "nome" and not escolha:
        st["nome"] = texto.strip()[:60]
        st["step"] = "servico"
        lista_servicos(numero, "ag", f"Prazer, {st['nome']}! Qual serviço você quer agendar?")
        return

    if chave == "menu" or not chave:
        st.clear()
        menu(numero, f"Olá! Sou o assistente virtual da {NOME}. Como posso ajudar?" if not chave else "Como posso ajudar?")
    elif chave == "servicos":
        lista_servicos(numero, "srv", "Qual serviço você quer conhecer?")
    elif chave.startswith("srv:"):
        s = SERVICOS.get(chave[4:])
        if s:
            nome, cat, dur, desc = s
            send_text(numero, f"{nome} ({cat} · {dur})\n{desc}\n\nPara agendar, envie \"agendar\".")
        menu(numero, "Quer ver mais alguma coisa?")
    elif chave == "agendar":
        st.clear()
        st["step"] = "nome"
        send_text(numero, "Vamos pedir o seu horário. Qual é o seu nome?")
    elif chave.startswith("ag:"):
        s = SERVICOS.get(chave[3:])
        if s:
            nome = st.get("nome", "")
            log.info("PEDIDO DE AGENDAMENTO | %s | %s | %s", numero, nome, s[0])
            st.clear()
            st["humano"] = True
            send_text(numero, (
                f"Perfeito{', ' + nome if nome else ''}! Registrei seu pedido de {s[0]}. "
                "Uma pessoa da equipe vai confirmar o dia e o horário por aqui em breve."
            ))
    elif chave == "funcionamento":
        send_text(numero, f"{ENDERECO}\n\n" + "\n".join(FUNCIONAMENTO))
        menu(numero, "Quer ver mais alguma coisa?")
    elif chave == "atendente":
        st.clear()
        st["humano"] = True
        log.info("PEDIDO DE ATENDENTE | %s", numero)
        send_text(numero, "Certo! Uma pessoa da equipe vai continuar a conversa por aqui. "
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
