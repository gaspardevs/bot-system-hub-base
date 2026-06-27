
// ── Silencia logs internos do Baileys — coloca ANTES de tudo ──
const _stdoutWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk, encoding, callback) => {
  const str = chunk.toString();
  if (
    str.includes('Closing session:') ||
    str.includes('SessionEntry')     ||
    str.includes('registrationId')   ||
    str.includes('currentRatchet')   ||
    str.includes('ephemeralKeyPair') ||
    str.includes('privKey')          ||
    str.includes('pubKey')           ||
    str.includes('pendingPreKey')    ||
    str.includes('indexInfo')
  ) {
    if (typeof encoding === 'function') encoding();
    else if (typeof callback === 'function') callback();
    return true;
  }
  return _stdoutWrite(chunk, encoding, callback);
};

const config  = require('./settings/config.json');
const prefix  = config.prefix;
const {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

const colors   = require("colors");
const fs       = require("fs");
const P        = require("pino");
const { Boom } = require("@hapi/boom");
const QRCode   = require("qrcode-terminal");
const { data, hora, exec } = require("./consts");

// ── Banner de créditos ─────────────────────────────────────────
const BANNER = `
${colors.red("  ██████╗ ███████╗██╗  ██╗")}
${colors.red("  ██╔══██╗██╔════╝██║  ██║")}
${colors.red("  ██████╔╝███████╗███████║")}
${colors.red("  ██╔══██╗╚════██║██╔══██║")}
${colors.red("  ██████╔╝███████║██║  ██║")}
${colors.red("  ╚═════╝ ╚══════╝╚═╝  ╚═╝")}
${colors.cyan("  BOT-SYSTEM-HUB — o melhor bot dO MOMENTO  ")}
${colors.gray("        criador: Gaspar devs </>")}
${colors.gray("  ──────────────────────────────────────────\n")}
`;

// ── Bot principal ──────────────────────────────────────────────
// Guarda global para impedir 2 sockets vivos ao mesmo tempo
// (a causa do loop "reiniciando em 3 segundos" + connectionReplaced
// era o Bot() ser chamado de novo sem o socket antigo estar fechado).
let reconectando = false;

async function Bot() {
  console.clear();
  console.log(BANNER);

  const pastaAuth = "./Bot-session";
  const { state, saveCreds } = await useMultiFileAuthState(pastaAuth);
  const { version }          = await fetchLatestBaileysVersion();

  // ── Método de conexão — decidido pelo start.sh ──────────────
  // METODO_CONEXAO=qr | codigo  (definido pelo start.sh antes de
  // chamar "node conncts.js"). O conncts.js já não pergunta nada,
  // só reage ao que o start.sh perguntou.
  let usarQR = true;

  if (!state.creds?.registered) {
    usarQR = (process.env.METODO_CONEXAO || "qr").toLowerCase() !== "codigo";
    console.log(colors.cyan(`  ➤  Método de conexão: ${usarQR ? "QR Code" : "Código de Pareamento"}\n`));
  } else {
    console.log(colors.green("  ✅  Sessão salva encontrada — conectando automaticamente...\n"));
  }

  // ── Logger — sem pino-pretty no Termux (evita crash) ───────
  // pino-pretty usa workers que não funcionam bem no Termux/Android
  const pLogger = P({ level: "silent" });

  const conn = makeWASocket({
    version,
    auth:              state,
    logger:            pLogger,
    printQRInTerminal: false,
    browser:           Browsers.macOS("Safari"),
    syncFullHistory:   false,
  });

  // ── Código de pareamento (se METODO_CONEXAO=codigo) ────────
  if (!state.creds?.registered && !usarQR) {
    try {
      const numero = (process.env.NUMERO_PAREAMENTO || "").replace(/\D/g, "");

      if (!numero) {
        console.log(colors.red("\n  ❌ Número de pareamento não definido (NUMERO_PAREAMENTO vazio).\n"));
        console.log(colors.gray("  ↪  Encerra e corre o start.sh de novo.\n"));
        process.exit(1);
      }

      console.log(colors.gray("\n  ⏳ Gerando código de pareamento...\n"));

      await new Promise(r => setTimeout(r, 3000));
      const code = await conn.requestPairingCode(numero);

      console.log(colors.cyan("  ╔═════════════════════════════╗"));
      console.log(colors.cyan(`  ║  Código: ${colors.white(code)}${" ".repeat(Math.max(0, 19 - code.length))}║`));
      console.log(colors.cyan("  ╚═════════════════════════════╝\n"));
      console.log(colors.gray("  ↪  Abre o WhatsApp → Aparelhos Conectados → Conectar Aparelho\n"));
    } catch (err) {
      console.log(colors.red("\n  ❌ Erro ao gerar código. Reinicia e tenta novamente.\n"), err);
      process.exit(1);
    }
  }

  // Se for QR, o QR fica visível até ser escaneado ou expirar
  // (mostrado no evento connection.update mais abaixo)

  // ── Salvar credenciais ─────────────────────────────────────
  conn.ev.on("creds.update", saveCreds);

  // ── Encaminhar mensagens para o meliodas.js ───────────────
  conn.ev.on("messages.upsert", (upsert) => {
    require("./system.js")(conn, upsert);
  });

  // ── Eventos de grupo → meliodas.js ────────────────────────
  conn.ev.on("group-participants.update", (update) => {
    require("./system.js").handleGroupUpdate(conn, update);
  });

  // ── Monitor de conexão + reconexão automática ─────────────
  conn.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    // ── QR Code ──────────────────────────────────────────────
    if (qr && usarQR) {
      console.clear();
      console.log(BANNER);
      console.log(colors.cyan("  ╔═════════════════════════════════════╗"));
      console.log(colors.cyan("  ║      📷 ESCANEIA O QR CODE ABAIXO   ║"));
      console.log(colors.cyan("  ╚═════════════════════════════════════╝\n"));
      try { QRCode.generate(qr, { small: true }); } catch (_) {}
      console.log(colors.gray("\n  ↪ Abre o WhatsApp → Aparelhos Conectados → Conectar Aparelho\n"));
    }

    const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;

    switch (connection) {
      case "connecting":
        console.log(colors.magenta(`\n  🔄 Conectando ao WhatsApp... [${data} — ${hora}]\n`));
        break;

      case "open":
        console.clear();
        console.log(BANNER);
        console.log(colors.green("  ╔══════════════════════════════════════╗"));
        console.log(colors.green("  ║  ✅ BOT-SYSTEM-HUB ONLINE E PRONTO!   ║"));
        console.log(colors.green("  ║       MEU CRIADOR É: GASPAR DEVS </> ║"));
        console.log(colors.green(`  ║       MEU PREFIXO É: ${prefix}               ║`));
        console.log(colors.green(`  ║       HORA: ${hora} - ${data}    ║`));
        console.log(colors.green("  ╚══════════════════════════════════════╝\n"));
        break;

      case "close": {
        const mensagens = {
          [DisconnectReason.loggedOut]:          "Sessão encerrada! A sessão vai ser apagada e vou pedir para ligares de novo (QR/código).",
          [DisconnectReason.badSession]:         "Sessão inválida! A sessão vai ser apagada e vou pedir para ligares de novo (QR/código).",
          [DisconnectReason.connectionReplaced]: "Conflito de sessão — há outra instância aberta?",
          [DisconnectReason.timedOut]:           "Timeout — internet muito fraca.",
          [DisconnectReason.connectionClosed]:   "Conexão caiu — reconectando...",
          [DisconnectReason.connectionLost]:     "Internet instável — conexão perdida.",
          [DisconnectReason.restartRequired]:    "Reinício necessário para estabilizar a conexão.",
        };

        const needsRestart = [
          DisconnectReason.loggedOut,
          DisconnectReason.badSession,
        ];

        const msg = mensagens[statusCode] || `Conexão encerrada. (código: ${statusCode ?? "desconhecido"})`;

        // Evita 2 reconexões simultâneas (era isto que empilhava sockets
        // e causava "connectionReplaced" em loop infinito).
        if (reconectando) break;
        reconectando = true;

        // Limpa por completo o socket antigo antes de criar um novo.
        try {
          conn.ev.removeAllListeners();
          conn.end?.(undefined);
        } catch (_) {}

        if (needsRestart.includes(statusCode)) {
          console.log(colors.red(`\n  ❌ ${msg}\n`));
          try {
            fs.rmSync(pastaAuth, { recursive: true, force: true });
          } catch (e) {
            console.log(colors.red(`  Erro ao apagar sessão: ${e.message}`));
          }
          // Sessão apagada → quem decide o próximo método de conexão
          // (QR ou código) é o start.sh, não o conncts.js. Por isso
          // encerramos o processo aqui: o start.sh apanha a saída,
          // vê que a pasta meliodas-session está vazia e pergunta
          // de novo antes de reiniciar o bot.
          console.log(colors.yellow("  🔁 O start.sh vai pedir o método de conexão novamente...\n"));
          process.exit(1);
        }

        console.log(colors.yellow(`\n  ⚠️  ${msg}`));
        console.log(colors.gray("  ↻  Tentando reconexão em 3 segundos...\n"));
        setTimeout(() => { reconectando = false; Bot(); }, 3000);
        break;
      }
    }
  });

  return conn;
}

module.exports = Bot;
Bot().catch((e) => {
  console.log(colors.red("\n  • ERRO CRÍTICO: " + e));
  process.exit(1);
});