#!/bin/bash
# ================================================================
#   meliodas-bot — start.sh
#   - Pergunta o método de conexão (QR ou Código) só quando ainda
#     não existe sessão guardada.
#   - Inicia o bot e reinicia automaticamente sempre que ele cair
#     (rede, sessão inválida, erro qualquer) — não precisas de
#     voltar à host e dar "npm start" manualmente.
#   Dev: Gaspar devs </>
# ================================================================

cd "$(dirname "$0")" || exit 1

trap 'echo ""; echo "[start.sh] A encerrar..."; exit 0' SIGINT SIGTERM

if [ ! -d "node_modules" ]; then
  echo "[start.sh] node_modules não encontrado — a instalar dependências..."
  npm install
fi

PASTA_SESSAO="./bot-session"
RESTART_COUNT=0

while true; do
  # Só pergunta o método de conexão se ainda não houver sessão
  # guardada (primeira vez, ou depois de uma sessão inválida ter
  # sido apagada pelo conncts.js).
  if [ ! -d "$PASTA_SESSAO" ] || [ -z "$(ls -A "$PASTA_SESSAO" 2>/dev/null)" ]; then
    echo ""
    echo "  ╔══════════════════════════════════════╗"
    echo "  ║     Como deseja se conectar?         ║"
    echo "  ║                                      ║"
    echo "  ║   [ 1 ]  QR Code (câmera)            ║"
    echo "  ║   [ 2 ]  Código de Pareamento        ║"
    echo "  ╚══════════════════════════════════════╝"
    echo ""
    read -rp "  ➤  Digite 1 ou 2: " ESCOLHA

    if [ "$ESCOLHA" = "2" ]; then
      export METODO_CONEXAO="codigo"
      read -rp "  📱 Seu número com DDI (ex: 351912345678): " NUMERO
      export NUMERO_PAREAMENTO
      NUMERO_PAREAMENTO="$(echo "$NUMERO" | tr -dc '0-9')"
    else
      export METODO_CONEXAO="qr"
      unset NUMERO_PAREAMENTO
    fi
    echo ""
  fi

  echo "[start.sh] ──────────────────────────────────────────────"
  echo "[start.sh] A iniciar o Meliodas Bot... ($(date '+%d/%m/%Y %H:%M:%S'))"
  echo "[start.sh] ──────────────────────────────────────────────"
  echo ""

  # Corre em primeiro plano — banner, QR, logs de conexão e erros
  # aparecem direto na host.
  node conncts.js
  EXIT_CODE=$?

  RESTART_COUNT=$((RESTART_COUNT + 1))

  echo ""
  echo "[start.sh] Bot encerrou (código de saída: $EXIT_CODE)."
  echo "[start.sh] Reinício nº $RESTART_COUNT em 5 segundos... (Ctrl+C para parar)"
  sleep 5
done