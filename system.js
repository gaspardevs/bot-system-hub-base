/* // ======== Créditos ==========// 
        BASE DO MELIODAS BOT 
          FEITO POR GASPAR 
   // ============================//

   //========================== INFOR E REGRAS =============================// 
     1-MANTER OS CREDITOS DO CRIADOR AJUDA A VALORIZAR O TRABALHO DE QUEM FEZ 
     2-QUAL QUER DUVIDA ENTRA EM CONTATO COM WA.ME/351924423740
     3-ADICIONA COMANDO DEPOIS DO SWITCH(COMMANDFINAL) CONFORME ESTA NA INDEX
     SEMPRE: 
     
     COMANDO DE MEMBRO
     case 'nome': {
     await reagir(conn, m, "reação");
     await reply("mensagem do bot")
     break;
     }

     4- SE FOR COMANDO PARA ADIMIN
     case 'nome': {
      if (!isGroup) { await reply('❌ Apenas em grupos.'); 
      break; 
      }
      const meta = await getGroupMeta(conn, from);
      const isAdmCmd = isAdminInMeta(meta, sender) || isDono;
      if (!isAdmCmd) { await reply('❌ Apenas administradores podem usar este comando.'); 
      break; 
      }

      resto do comando...
      break;
      }

      5- SE FOR COMANDO DONO 
      case 'nome': {
      if (!isDono) { await reply('❌ Apenas dono do bot.'); 
      break; 
      if (!isGroup) { await reply(' Apenas em grupos); //se for comando de grupo
      break;
      }
      resto do comando...
      break;
      }
      6- NÃO ME RESPONSABILIZO POR QUAISQUER DANOS OU USO NEGATIVO DO BOT.

// ── REQUIRES ──────────────────────────────────────────────────
/*const casesManager = require("./database/casesManager.js");*/
const { downloadMediaMessage, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { spawn }  = require('child_process');
const config     = require("./settings/config.json");
const config1    = require("./settings/config1.json");
const msgs       = require("./settings/message.json");
const reacao     = require("./settings/reacao.json");
const ativacoes  = require("./settings/ativacoes.json");
const menuMod    = require("./database/menus/menu.js");
const colors     = require("colors");
const math       = require('mathjs');
const fs         = require("fs");
const path       = require("path");
const os         = require("os");

// ── Paths de dados ─────────────────────────────────────────────
const CONFIGU_GP_PATH = './database/configu_gp.json';
const WARNS_DIR       = './database/warns';

// ── Helpers de ficheiros ───────────────────────────────────────
const lerJSON = (filePath, fallback = {}) => {
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {}
  return fallback;
};
const salvarJSON = (filePath, data) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('[ERRO salvarJSON]:', e.message);
  }
};

// const para o totalcase 
const totalcase = [
  'ping',
  'menu',
  'menuadm',
  'menudono',
  'relatarbug',
  'totalcase',
  'sugerir',
  'avaliar',
  'dono',
  'totalcase',
  'calculadora',
  'biblia',
  'frases',
  'roleta',
  'antilink',
  'antiligp',
  'antilinkhard',
  'bemvindo',
  'saida',
  'banir',
  'desmutar',
  'mutar',
  'adv',
  'remadv',
  'del',
  'promover',
  'rebaixar',
  'statusgp',
  'msgbv',
  'msgsaida',
  'setpefix',
  'setnomebot',
  'setdono',
  'setfotomenu',
  'setnumero',
  'botoff',
  'boton',
  'reiniciar',
  'broadcast',
  'bangp',
  'unbangp',
  'blockcmd',
  'unblockcmd',
  'cases'
  ]

// ── Sistema configu_gp ─────────────────────────────────────────
// Template padrão de ativações para um grupo novo
const templateAtivacoes = () => ({
  antilink:      false,
  antilinkgp:    false,
  antilinkhard:  false,
  bemvindo:      false,
  saida:         false,
  msgbemvindo:   msgs.message.bemvindo,
  msgsaida:      msgs.message.saida,
});

// Carrega o configu_gp.json completo
const lerConfiguGp = () => lerJSON(CONFIGU_GP_PATH, {});

// Retorna (e cria se não existir) a entrada de um grupo
const getGrupo = (groupId, groupName = '') => {
  const cfg = lerConfiguGp();
  if (!cfg[groupId]) {
    cfg[groupId] = {
      nome:      groupName,
      id:        groupId,
      ativacoes: templateAtivacoes(),
    };
    salvarJSON(CONFIGU_GP_PATH, cfg);
  } else if (groupName && cfg[groupId].nome !== groupName) {
    cfg[groupId].nome = groupName;
    salvarJSON(CONFIGU_GP_PATH, cfg);
  }
  return cfg[groupId];
};

// Atualiza uma ativação de um grupo
const setAtivacao = (groupId, chave, valor, groupName = '') => {
  const cfg = lerConfiguGp();
  if (!cfg[groupId]) getGrupo(groupId, groupName);
  const cfgAtual = lerConfiguGp();
  cfgAtual[groupId].ativacoes[chave] = valor;
  salvarJSON(CONFIGU_GP_PATH, cfgAtual);
};

// Lê uma ativação de um grupo
const getAtivacao = (groupId, chave) => {
  const cfg = lerConfiguGp();
  return cfg[groupId]?.ativacoes?.[chave] ?? false;
};


// ── Temp dir ───────────────────────────────────────────────────
const getTmpDir = () => {
  const dir = process.env.MELIODAS_TMP
    ? path.resolve(process.env.MELIODAS_TMP)
    : path.resolve('./temp');
  try { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
  return dir;
};

const cleanupOldTempFiles = (dir, maxAgeMs = 1000 * 60 * 60 * 6) => {
  try {
    if (!fs.existsSync(dir)) return;
    const now = Date.now();
    for (const file of fs.readdirSync(dir)) {
      try {
        const p  = path.join(dir, file);
        const st = fs.statSync(p);
        if (now - st.mtimeMs > maxAgeMs) {
          if (st.isDirectory()) fs.rmSync(p, { recursive: true, force: true });
          else fs.unlinkSync(p);
        }
      } catch (_) {}
    }
  } catch (_) {}
};

// ── Frases ─────────────────────────────────────────────────────
const frasesMotivacionais = [
  "A persistência transforma sonhos em realidade.",
  "Cada pequeno passo conta.",
  "O sucesso começa com a decisão de tentar.",
  "Não desista. Grandes conquistas levam tempo.",
  "Acredite no seu potencial.",
  "Hoje é um ótimo dia para evoluir.",
  "Você é mais forte do que imagina.",
  "O impossível é apenas uma opinião.",
  "Aprenda com os erros e siga em frente.",
  "A disciplina vence a motivação passageira.",
  "Seja a mudança que deseja ver.",
  "O esforço de hoje é o resultado de amanhã.",
  "Toda conquista começa com coragem.",
  "Nunca é tarde para recomeçar.",
  "Foque no progresso, não na perfeição.",
  "Desafios revelam a sua força.",
  "Você já superou dias difíceis antes.",
  "Grandes jornadas começam com um passo.",
  "Mantenha a cabeça erguida e continue.",
  "Seu futuro é criado pelas suas ações.",
];

const frasesBiblicas = [
  "Tudo posso naquele que me fortalece. 🙏",
  "O Senhor é meu pastor; nada me faltará.",
  "Entrega o teu caminho ao Senhor e confia nele.",
  "Deus é o nosso refúgio e fortaleza.",
  "Não temas, porque eu sou contigo.",
  "A alegria do Senhor é a nossa força.",
  "Buscai primeiro o Reino de Deus.",
  "O amor tudo sofre, tudo crê, tudo espera.",
  "Bem-aventurados os que promovem a paz.",
  "O Senhor luta por vós; ficai tranquilos.",
  "A fé remove montanhas.",
  "Em Deus faremos proezas.",
  "O choro pode durar uma noite, mas a alegria vem pela manhã.",
  "Sede fortes e corajosos; não temais.",
  "Deus tem planos de paz para a tua vida.",
];


// Bytes -> GB com 2 casas decimais
const toGB = (bytes) => (Number(bytes) / 1024 / 1024 / 1024).toFixed(2);

// Mede o uso de CPU (%) num pequeno intervalo — funciona no Windows e Linux
const getCpuUsage = (intervalMs = 200) => new Promise((resolve) => {
  const snap = () => {
    let idle = 0, total = 0;
    for (const cpu of os.cpus()) {
      for (const t of Object.values(cpu.times)) total += t;
      idle += cpu.times.idle;
    }
    return { idle, total };
  };
  const a = snap();
  setTimeout(() => {
    const b = snap();
    const idleDiff  = b.idle  - a.idle;
    const totalDiff = b.total - a.total;
    const usage = totalDiff > 0 ? (1 - idleDiff / totalDiff) * 100 : 0;
    resolve(Math.max(0, Math.min(100, usage)));
  }, intervalMs);
});
// ── Foto do menu ───────────────────────────────────────────────
const getFotoMenu = () => {
  const pasta = "./database/fotomenu"; // caminho da imagem do menu
  try {
    const arquivos = fs.readdirSync(pasta).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    if (!arquivos.length) return null;
    return path.resolve(pasta, arquivos[0]);
  } catch { return null; }
};

// ── Reações ────────────────────────────────────────────────────
const reagir = async (conn, m, emoji) => {
  if (!emoji) return;
  try {
    await conn.sendMessage(m.key.remoteJid, { react: { text: emoji, key: m.key } });
  } catch (_) {}
};

const getEmoji = (command) => {
  const r = reacao.reacao || {};
  return (
    r.menus?.[command]              ||
    r['comandos membros']?.[command] ||
    r['comandos adm']?.[command]    ||
    r['comandos dono']?.[command]   ||
    null
  );
};

// ── HELPER: Extrai sender correctamente mesmo com LID do Baileys moderno ──
const resolveLidToPn = async (conn, lidJid) => {
  if (!lidJid || !lidJid.endsWith('@lid')) return null;
  try {
    const repo = conn?.signalRepository?.lidMapping;
    if (repo?.getPNForLID) {
      const pn = await repo.getPNForLID(lidJid);
      if (pn) return pn.includes('@') ? pn : `${pn}@s.whatsapp.net`;
    }
  } catch (_) {}
  return null;
};

const extractSender = async (m, config, conn) => {
  const from    = m.key.remoteJid;
  const isGroup = from.endsWith('@g.us');

  if (isGroup) {
    // Em grupo: participant é quem enviou
    let p = m.key.participantAlt || m.key.participant || '';
    // Se vier em formato @lid, tenta resolver para o número real (@s.whatsapp.net)
    if (p && p.endsWith('@lid')) {
      const resolved = m.key.participantPn || await resolveLidToPn(conn, p);
      if (resolved) p = resolved;
    }
    if (p) return p;
    // fromMe em grupo sem participant = dono noutro dispositivo
    if (m.key.fromMe) {
      return (config.numerodono || '').replace(/\D/g, '') + '@s.whatsapp.net';
    }
    return from;
  }

  // Chat privado
  if (m.key.fromMe) {
    // Bot respondeu em privado — usa numerobot
    return (config.numerobot || '').replace(/\D/g, '') + '@s.whatsapp.net';
  }
  // Se remoteJid vier como @lid, tenta resolver para o número real (@s.whatsapp.net)
  if (from.endsWith('@lid')) {
    const resolved = m.key.senderPn || await resolveLidToPn(conn, from);
    if (resolved) return resolved;
  }
  return from;
};

// ── HELPER: Extrai número para display (apenas dígitos nacionais) ──
const extractDisplayNumber = (sender) => {
  // Mostra o número completo sem @s.whatsapp.net e sem :XX
  return sender.split(':')[0].split('@')[0].replace(/\D/g, '');
};

// ── isDono helper (fora do loop para reutilizar) ──────────────
const checkIsDono = (m, sender) => {
  // Extrai números com cuidado — sender pode ser "5511999@s.whatsapp.net" ou "5511999:0"
  const cfgNum    = (config.numerodono || '').replace(/\D/g, '');
  const botNum    = (config.numerobot  || '').replace(/\D/g, '');
  const senderNum = sender.split('@')[0].split(':')[0].replace(/\D/g, '');
  // Bot nunca é dono
  if (botNum && senderNum === botNum) return false;
  
  if (!cfgNum || !senderNum) return false;
  
  // Função auxiliar para extrair número nacional (últimos 9 dígitos)
  // Para Portugal: número tem 9 dígitos, com DDI 351 fica 12 dígitos
  const getNacionalNum = (num) => {
    const clean = num.replace(/\D/g, '');
    return clean.length >= 9 ? clean.slice(-9) : clean;
  };
  
  const cfgNacional     = getNacionalNum(cfgNum);
  const senderNacional  = getNacionalNum(senderNum);
  
  // Comparações em ordem de especificidade
  // 1. Exacto (mesmo número completo)
  if (senderNum === cfgNum) return true;
  
  // 2. Número nacional (últimos 9 dígitos)
  if (cfgNacional && senderNacional && cfgNacional === senderNacional) return true;
  
  // 3. Um é sufixo do outro (para casos de números incompletos)
  if (senderNum.endsWith(cfgNum) || cfgNum.endsWith(senderNum)) return true;
  
  // 4. Verifica donos extra em config1
  const extras = Object.values(config1 || {})
    .map(v => (v || '').replace(/\D/g, ''))
    .filter(Boolean);
  
  return extras.some(extra => {
    const extraNacional = getNacionalNum(extra);
    return (
      senderNum === extra ||
      senderNacional === extraNacional ||
      senderNum.endsWith(extra) ||
      extra.endsWith(senderNum)
    );
  });
};

// ══════════════════════════════════════════════════════════════
//   HANDLER DE EVENTOS DE GRUPO (entradas/saídas)
//   chamado pelo conncts.js via handleGroupUpdate
// ══════════════════════════════════════════════════════════════
const handleGroupUpdate = async (conn, update) => {
  try {
    const { id: groupId, participants, action } = update;
    if (!groupId || !participants?.length) return;

    // Garante que o grupo existe no configu_gp
    let groupName = '';
    try {
      const meta = await getGroupMeta(conn, groupId);
      groupName  = meta.subject || '';
    } catch (_) {}

    getGrupo(groupId, groupName);

    const bemvindoAtivo = getAtivacao(groupId, 'bemvindo');
    const saidaAtiva    = getAtivacao(groupId, 'saida');
    const msgBv         = getAtivacao(groupId, 'msgbemvindo') || msgs.message.bemvindo;
    const msgSd         = getAtivacao(groupId, 'msgsaida')    || msgs.message.saida;
    for (const participantRaw of participants) {
      // Baileys v7 RC pode enviar string ou objeto { id, phoneNumber, ... }
      const participantJid = typeof participantRaw === 'string'
        ? participantRaw
        : (participantRaw?.id || participantRaw?.jid || participantRaw?.phoneNumber || '');

      if (!participantJid) continue;

      const numUser = participantJid.split('@')[0];

      if (action === 'add' && bemvindoAtivo) {
        const texto = msgBv
          .replace('{user}',  `@${numUser}`)
          .replace('{grupo}', groupName);
        await conn.sendMessage(groupId, { text: texto, mentions: [participantJid] });

      } else if (action === 'remove' && saidaAtiva) {
        const texto = msgSd
          .replace('{user}',  `@${numUser}`)
          .replace('{grupo}', groupName);
        await conn.sendMessage(groupId, { text: texto, mentions: [participantJid] });
      }
    }
  } catch (err) {
    console.error('[ERRO handleGroupUpdate]:', err.message);
  }
};

// ══════════════════════════════════════════════════════════════
//   CACHE DE METADATA DE GRUPO (evita rate-overlimit)
// ══════════════════════════════════════════════════════════════
const _metaCache  = new Map();
const META_TTL_MS = 5 * 60 * 1000; // 5 minutos

const getGroupMeta = async (conn, groupId) => {
  const cached = _metaCache.get(groupId);
  if (cached && (Date.now() - cached.ts) < META_TTL_MS) return cached.meta;
  try {

    const meta = await conn.groupMetadata(groupId);
    _metaCache.set(groupId, { meta, ts: Date.now() });
    return meta;
  } catch (e) {
    if (cached) return cached.meta;
    throw e;
  }
};

const invalidarMetaCache = (groupId) => _metaCache.delete(groupId);

// ── Helper: verifica se um JID é admin usando phoneNumber (LID) ──
const isAdminInMeta = (meta, jid) => {
  const parts = meta?.participants || [];
  const jidNum = jid.split(':')[0].split('@')[0].replace(/\D/g, '');
  const p = parts.find(p => {
    const candidates = [p.phoneNumber, p.jid, p.lidJid, p.lid, p.id].filter(Boolean);
    return candidates.some(c => {
      const cNum = c.split(':')[0].split('@')[0].replace(/\D/g, '');
      return cNum === jidNum || cNum.endsWith(jidNum) || jidNum.endsWith(cNum);
    });
  });
  return !!(p?.admin);
};

// ══════════════════════════════════════════════════════════════
//   HANDLER PRINCIPAL DE MENSAGENS
// ══════════════════════════════════════════════════════════════
module.exports = async (conn, upsert) => {
  try {
    const messages = upsert.messages || [];
    if (!messages.length) return;

    for (const m of messages) {
      if (!m.message) continue;
      if (m.key?.remoteJid === 'status@broadcast') continue;

      // Desembrulha efémeras
      let msg = m.message;
      if (msg.ephemeralMessage) msg = msg.ephemeralMessage.message;

      // Extrai texto e tipo
      const type = Object.keys(msg)[0];
      let text = '';
      if (type === 'conversation')                text = msg.conversation || '';
      else if (type === 'extendedTextMessage')    text = msg.extendedTextMessage?.text || '';
      else if (type === 'imageMessage')           text = msg.imageMessage?.caption || '';
      else if (type === 'videoMessage')           text = msg.videoMessage?.caption || '';
      else if (type === 'buttonsResponseMessage') text = msg.buttonsResponseMessage?.selectedDisplayText || '';
      else if (type === 'listResponseMessage')    text = msg.listResponseMessage?.title || '';
      // fallback geral
      if (!text) text = msg[type]?.text || msg[type]?.caption || msg[type]?.conversation || '';
      text = text.trim();

      const from    = m.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      // DEBUG TEMPORÁRIO — remove depois de confirmar
      if (process.env.DEBUG_SENDER === '1') {
        console.log('[DEBUG KEY]', JSON.stringify({
          remoteJid:   m.key.remoteJid,
          participant: m.key.participant,
          fromMe:      m.key.fromMe,
          id:          m.key.id
        }));
      }

      // Extrai o sender correctamente em todas as situações:
      // Com suporte a LID do Baileys moderno (usa participantAlt se disponível)
      const sender = await extractSender(m, config, conn);

      // Ignora apenas mensagens do número do próprio bot
      const botNumFull = (config.numerobot || '').replace(/\D/g, '') + '@s.whatsapp.net';
      if (sender === botNumFull) continue;
      const pushname = m.pushName || 'utilizador';
      const hora     = new Date().toLocaleTimeString('pt-PT');
      const prefix   = config?.prefix || '+';

      // ── isDono ──────────────────────────────────────────────
      const isDono = checkIsDono(m, sender);

      // ── Info de grupo ────────────────────────────────────────
      let isAdmin   = false;
      let groupName = '';
      if (isGroup) {
        try {
          const meta = await getGroupMeta(conn, from);
          groupName  = meta.subject || '';
          const parts = meta.participants || [];

          // WhatsApp usa LID (@lid) nos participants — ligar pelo campo phoneNumber
          const senderNum = sender.split(':')[0].split('@')[0].replace(/\D/g, '');

          const senderParticipant = parts.find(p => {
            // phoneNumber é o JID real quando id é LID
            const candidates = [p.phoneNumber, p.jid, p.lidJid, p.lid, p.id].filter(Boolean);
            return candidates.some(c => {
              const cNum = (c || '').split(':')[0].split('@')[0].replace(/\D/g, '');
              return cNum === senderNum ||
                     cNum.endsWith(senderNum) ||
                     senderNum.endsWith(cNum);
            });
          });

          isAdmin = !!(senderParticipant?.admin);
          if (isDono) isAdmin = true;

          // Garante registo do grupo no configu_gp
          getGrupo(from, groupName);
        } catch (e) { console.error('[ERRO isAdmin]:', e.message); }
      }

      const numero   = extractDisplayNumber(sender);
      const isCmd    = text.startsWith(prefix);

      // ════════════════════════════════════════════════════════
      //   LOG DE MENSAGENS (comandos E mensagens normais)
      // ════════════════════════════════════════════════════════
      const conteudo = isCmd
        ? `${colors.magenta('comando :')} ${colors.yellow(text.trim())}`
        : `${colors.cyan('mensagem:')} ${colors.white(text.trim() || `[${type}]`)}`;

      if (isGroup) {
        console.log(
          colors.bold(colors.blue('\n┌── 💬 MENSAGEM EM GRUPO ─────────────────')) + '\n' +
          colors.gray(`│ grupo   : `) + colors.green(groupName)                    + '\n' +
          colors.gray(`│ número  : `) + colors.white(numero)                       + '\n' +
          colors.gray(`│ nome    : `) + colors.white(pushname)                     + '\n' +
          colors.gray(`│ adm?    : `) + (isAdmin  ? colors.green('sim') : colors.red('não')) + '\n' +
          colors.gray(`│ dono?   : `) + (isDono   ? colors.green('sim') : colors.red('não')) + '\n' +
          colors.gray(`│ ${conteudo}`)                                              + '\n' +
          colors.gray(`│ hora    : `) + colors.gray(hora)                          + '\n' +
          colors.bold(colors.blue('└─────────────────────────────────────────'))
        );
      } else {
        console.log(
          colors.bold(colors.cyan('\n┌── 📩 MENSAGEM PRIVADA ──────────────────')) + '\n' +
          colors.gray(`│ número  : `) + colors.white(numero)                       + '\n' +
          colors.gray(`│ nome    : `) + colors.white(pushname)                     + '\n' +
          colors.gray(`│ dono?   : `) + (isDono   ? colors.green('sim') : colors.red('não')) + '\n' +
          colors.gray(`│ ${conteudo}`)                                              + '\n' +
          colors.gray(`│ hora    : `) + colors.gray(hora)                          + '\n' +
          colors.bold(colors.cyan('└─────────────────────────────────────────'))
        );
      }

      // ════════════════════════════════════════════════════════
      //   PROTEÇÕES AUTOMÁTICAS (correm mesmo sem prefixo)
      // ════════════════════════════════════════════════════════
      if (isGroup) {
        const adminsMeta = isAdmin; // já calculado acima
        // admins e dono ficam imunes às proteções
        const isImune = isAdmin || isDono;

        if (!isImune) {
          // ── Antilink ────────────────────────────────────────
          if (getAtivacao(from, 'antilink')) {
            const linkRegex = /https?:\/\/[^\s]+|www\.[^\s]+/i;
            const waLinkRegex = /chat\.whatsapp\.com\/[^\s]+/i;
            const isWaLink = waLinkRegex.test(text);
            const hasLink  = linkRegex.test(text);

            // antilinkgp: bloqueia só links do WhatsApp
            if (getAtivacao(from, 'antilinkgp') && isWaLink) {
              await conn.sendMessage(from, {
                text: `🚫 @${numero} links de grupos do WhatsApp não são permitidos aqui!`,
                mentions: [sender]
              });
              try { await conn.sendMessage(from, { delete: m.key }); } catch (_) {}
            }
            // antilinkhard: bloqueia qualquer link e bane
            else if (getAtivacao(from, 'antilinkhard') && hasLink) {
              await conn.sendMessage(from, {
                text: `⛔ @${numero} links não são permitidos! (ban automático)`,
                mentions: [sender]
              });
              try { invalidarMetaCache(from); await conn.groupParticipantsUpdate(from, [sender], 'remove'); } catch (_) {}
            }
            // antilink normal: apaga e avisa
            else if (hasLink) {
              await conn.sendMessage(from, {
                text: `🚫 @${numero} links não são permitidos neste grupo!`,
                mentions: [sender]
              });
              try { await conn.sendMessage(from, { delete: m.key }); } catch (_) {}
            }
          }
        }
        // ── Mutados: apaga qualquer mensagem de usuários mutados ──
        const mutadosCheck = getAtivacao(from, 'mutados') || [];
        const senderNumCheck = sender.split(':')[0].split('@')[0].replace(/\D/g, '');
        const isMutado = mutadosCheck.some(mid => mid.split('@')[0].replace(/\D/g, '') === senderNumCheck);
        if (isMutado && !isImune) {
          try { await conn.sendMessage(from, { delete: m.key }); } catch (_) {}
          continue;
        }
      }
      
      // ── Responde a "prefixo" ou "prefix" sem precisar do prefixo ──
      if (['prefixo', 'prefix'].includes(text.trim().toLowerCase())) {
        await conn.sendMessage(from, { text: `Meu prefixo é: *${prefix}*` }, { quoted: m });
        continue;
      }

      // ── Só processa comandos a partir daqui ──────────────────
      if (!text || !text.startsWith(prefix)) continue;

      const args    = text.slice(prefix.length).trim().split(/\s+/);
      const command = (args.shift() || '').toLowerCase();
      const body    = args.join(' ');

      const reply  = (txt) => conn.sendMessage(from, { text: txt }, { quoted: m });
      const numDono = (config.numerodono || '').replace(/\D/g, '') + '@s.whatsapp.net';

      // ── Reação automática ao comando ─────────────────────────
      const emojiCmd = getEmoji(command);
      if (emojiCmd) await reagir(conn, m, emojiCmd);

      // ── Bloquear comandos globalmente ────────────────────────
      const cmdsBloqueados = ativacoes.blockedCommandsGlobal || [];
      if (cmdsBloqueados.includes(command) && !isDono) {
        await reply(`🚫 O comando *${prefix}${command}* está bloqueado globalmente.`);
        continue;
      }
      
      if (global.botDesligado && !checkIsDono(m, sender)) continue;
      // ── Prefixo sozinho ──────────────────────────────────────
       if (text.trim() === prefix) {
        await reply(`Meu prefixo é: ${prefix}`);
        continue;
}
 const commandFinal = /^setsubdono\d+$/.test(command) ? 'setsubdono' : command;

      // ════════════════════════════════════════════════════════
      //   SWITCH DE COMANDOS
      // ════════════════════════════════════════════════════════
      switch (commandFinal) { //ADD CASES AQUI DEPOIS  DISSO!

        // ┌─────────────────────────────────────────────────────┐
        // │                    MENUS                            │
        // └─────────────────────────────────────────────────────┘
        case 'menu': {
          const txt  = menuMod.menu(prefix, pushname, config.dono, config.numerodono, config.nomebot, hora);
          const foto = getFotoMenu();
          if (foto) {
            await conn.sendMessage(from, { image: { url: foto }, caption: txt }, { quoted: m });
          } else {
            await reply(txt);
          }
          break;
        }

        case 'menuadm': {
          if (!isAdmin && !isDono) {
            await reagir(conn, m, '❌');
            await reply('❌ Apenas administradores podem ver este menu.');
            break;
          }
          const txt  = menuMod.menuadm(prefix, pushname, config.dono, config.numerodono, config.nomebot, hora);
          const foto = getFotoMenu();
          if (foto) {
            await conn.sendMessage(from, { image: { url: foto }, caption: txt }, { quoted: m });
          } else {
            await reply(txt);
          }
          break;
        }
        case 'menudono': {
          if (!isDono) {
            await reagir(conn, m, '❌');
            await reply('❌ Apenas o dono pode ver este menu.');
            break;
          }
          const txt  = menuMod.menudono(prefix, pushname, config.dono, config.numerodono, config.nomebot, hora);
          const foto = getFotoMenu();
          if (foto) {
            await conn.sendMessage(from, { image: { url: foto }, caption: txt }, { quoted: m });
          } else {
            await reply(txt);
          }
          break;
        }
        case 'ping': {
          const inicio = Date.now();
          const pingMsg = await conn.sendMessage(from, { text: '🏓 Calculando ping...' }, { quoted: m });
          const latency = Date.now() - inicio;

          const velocidade =
            latency < 200 ? '⚡ Muito rápido'  :
            latency < 500 ? '🚀 Rápido'         :
            latency < 900 ? '🐇 Normal'          : '🐢 Lento';

          const uptimeSec = process.uptime();
          const uptimeH   = Math.floor(uptimeSec / 3600);
          const uptimeM   = Math.floor((uptimeSec % 3600) / 60);
          const uptimeS   = Math.floor(uptimeSec % 60);
          const uptimeStr = `${uptimeH}h ${uptimeM}m ${uptimeS}s`;

          const cpu     = await getCpuUsage();
          const ramTotal = os.totalmem();
          const ramFree  = os.freemem();
          const ramUsed  = ramTotal - ramFree;
          const ramPct   = (ramUsed / ramTotal) * 100;

          let score = 0;
          if (latency < 400) score += 2; else if (latency < 800) score += 1;
          if (cpu < 50)      score += 2; else if (cpu < 80)      score += 1;
          if (ramPct < 70)   score += 2; else if (ramPct < 90)   score += 1;

          const estado =
            score >= 5 ? 'Muito bom 💚' :
            score >= 3 ? 'Bom 💛'        :
            score >= 1 ? 'Médio 🧡'      : 'Fraco ❤️';

          const texto =
            `🏓 *SEU PING*\n\n` +
            `⏱️ Latência: *${latency}ms*\n` +
            `🚀 Velocidade: *${velocidade}*\n` +
            `📡 Status: *Online ✅*\n\n` +
            `━━━━━━━━━━━━━━━\n\n` +
            `⏳ Uptime: *${uptimeStr}*\n` +
            `🖥️ CPU: *${cpu.toFixed(1)}%*\n` +
            `🧠 RAM Total: *${toGB(ramTotal)} GB*\n` +
            `📊 RAM Usada: *${toGB(ramUsed)} GB* (${ramPct.toFixed(0)}%)\n` +
            `🟢 RAM Livre: *${toGB(ramFree)} GB*\n\n` +
            `━━━━━━━━━━━━━━━\n\n` +
            `🤖 Bot em estado: *${estado}*`;

          try { await conn.sendMessage(from, { text: texto, edit: pingMsg.key }); }
          catch (_) { await reply(texto); }
          break;
        }

        case 'relatarbug': {
          if (!body) { await reply(`❌ Descreve o bug.\nEx: ${prefix}relatarbug o bot trava ao usar ${prefix}ping`); break; }
          await conn.sendMessage(numDono, { text: `🐞 *Bug relatado!*\n\nDe: ${pushname}\nNº: ${sender}\n\n${body}` });
          await reply('✅ Bug enviado ao dono, obrigado!');
          break;
        }
        case 'avaliar': {
          if (!body) { await reply(`❌ Escreve a tua avaliação.\nEx: ${prefix}avaliar muito bom o bot!`); break; }
          await conn.sendMessage(numDono, { text: `⭐ *Avaliação!*\n\nDe: ${pushname}\nNº: ${sender}\n\n${body}` });
          await reply('✅ Avaliação enviada ao dono, obrigado!');
          break;
        }
        case 'sugerir': {
          if (!body) { await reply(`❌ Escreve a tua sugestão.\nEx: ${prefix}sugerir adicionar o comando sticker`); break; }
          await conn.sendMessage(numDono, { text: `💡 *Sugestão!*\n\nDe: ${pushname}\nNº: ${sender}\n\n${body}` });
          await reply('✅ Sugestão enviada ao dono, obrigado!');
          break;
        }
        case 'totalcases': {
           await reply(`🗂️ *Total de cases:*\n\n${totalcase.length}`);
           break;
}
        case 'frases': {
          const frase = frasesMotivacionais[Math.floor(Math.random() * frasesMotivacionais.length)];
          await reply(`💪 ${frase}`);
          break;
        }
        case 'biblia': {
          const frase = frasesBiblicas[Math.floor(Math.random() * frasesBiblicas.length)];
          await reply(`📖 ${frase}`);
          break;
        }
        case 'roleta': {
          if (!body) { await reply(`_Exemplo: ${prefix}roleta Azul, Preto, Verde_`); break; }
          try {
            const opcoes = body.split(',').map(v => v.trim()).filter(Boolean);
            if (opcoes.length < 2) { await reply('_Mínimo de 2 opções._'); break; }
            const { data } = await require('axios').get('https://systemzone.store/api/canvas/roleta', { params: { text: opcoes.join(',') } });
            if (!data?.status || !data?.result?.download) throw new Error('API da roleta falhou');
            await conn.sendMessage(from, { video: { url: data.result.download }, ptv: true, mimetype: 'video/mp4' }, { quoted: m });
            await reagir(conn, m, '✅');
          } catch (e) {
            console.error('[ERRO ROLETA]', e?.response?.data || e.message);
            await reagir(conn, m, '❌');
            await reply('_Erro ao gerar a roleta._');
          }
          break;
        }
        case 'calculadora': {
          try {
            if (!body) { await reply(`🧮 Use: ${prefix}calculadora 10 + 5`); break; }
            if (body.length > 100) { await reply('Expressão demasiado longa.'); break; }
            const exprClean = body.replace(/,/g, '.').trim();
            if (!/^[0-9+\-*/().\s%^]+$/.test(exprClean)) {
              await reply('Expressão inválida. Usa apenas números e operadores + - * / ^ % ( ) .');
              break;
            }
            await reply(`🧮 Resultado: ${math.evaluate(exprClean)}`);
          } catch (_) {
            await reply('❌ Erro ao calcular. Verifica a expressão.');
          }
          break;
        }
        case 'dono': {
          const ninguem = 'Ninguém';
          const dono        = config.dono;
          const numerodono  = config.numerodono;
          const dono1 = config1.dono1 || ninguem;
          const dono2 = config1.dono2 || ninguem;
          const dono3 = config1.dono3 || ninguem;
          const dono4 = config1.dono4 || ninguem;
          const dono5 = config1.dono5 || ninguem;
          const dono6 = config1.dono6 || ninguem;
          await reply(
            `👑 *Meu dono é:* ${dono}\n` +
            `📞 *Contato:* wa.me/${numerodono}\n\n` +
            `🛡️ *Subdonos:*\n` +
            `1️⃣ ${dono1}\n` +
            `2️⃣ ${dono2}\n` +
            `3️⃣ ${dono3}\n` +
            `4️⃣ ${dono4}\n` +
            `5️⃣ ${dono5}\n` +
            `6️⃣ ${dono6}`
          );
          break;
        }

        // ┌─────────────────────────────────────────────────────┐
        // │               COMANDOS DE ADMIN                     │
        // └─────────────────────────────────────────────────────┘
        case 'adv': {
          if (!isGroup) { await reply('❌ Apenas em grupos.'); break; }
          const meta     = await getGroupMeta(conn, from);
          const isAdmCmd = isAdminInMeta(meta, sender) || isDono;
          if (!isAdmCmd) { await reply('❌ Apenas administradores podem usar este comando.'); break; }

          const alvo = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
          if (!alvo) { await reply(`❌ Menciona o utilizador.\n📌 Uso: *${prefix}adv @user|motivo*`); break; }

          const alvoIsAdmin = isAdminInMeta(meta, alvo);
          if (alvoIsAdmin && !isDono) { await reply('❌ Não podes dar adv em um administrador.'); break; }

          const motivo = body.includes('|') ? body.split('|').slice(1).join('|').trim() : 'Sem motivo informado';

          if (!fs.existsSync(WARNS_DIR)) fs.mkdirSync(WARNS_DIR, { recursive: true });
          const warnsFile = `${WARNS_DIR}/${from.replace('@g.us', '')}.json`;
          let warns = {};
          try { if (fs.existsSync(warnsFile)) warns = JSON.parse(fs.readFileSync(warnsFile, 'utf8')); } catch (_) {}

          if (!warns[alvo]) warns[alvo] = 0;
          warns[alvo]++;
          const count   = warns[alvo];
          const numUser = alvo.split('@')[0];
          fs.writeFileSync(warnsFile, JSON.stringify(warns, null, 2));

          if (count >= 3) {
            await conn.sendMessage(from, {
              text: `🚨 *ADV recebido: 3/3*\n\n👤 Utilizador: @${numUser}\n📋 Motivo: ${motivo}\n\n⛔ *3/3 adv — banido!* 👋`,
              mentions: [alvo]
            });
            delete warns[alvo];
            fs.writeFileSync(warnsFile, JSON.stringify(warns, null, 2));
            try { invalidarMetaCache(from); await conn.groupParticipantsUpdate(from, [alvo], 'remove'); }
            catch (_) { await reply('⚠️ Não consegui banir. O bot é admin?'); }
          } else {
            const faltam = 3 - count;
            await conn.sendMessage(from, {
              text: `⚠️ *ADV recebido: ${count}/3*\n\n👤 Utilizador: @${numUser}\n📋 Motivo: ${motivo}\n\n🔔 Falta${faltam > 1 ? 'm' : ''} *${faltam} adv${faltam > 1 ? 's' : ''}* para ban.`,
              mentions: [alvo]
            });
          }
          break;
        }
        case 'remadv': {
          if (!isGroup) { await reply('❌ Apenas em grupos.'); break; }
          const meta     = await getGroupMeta(conn, from);
          const isAdmCmd = isAdminInMeta(meta, sender) || isDono;
          if (!isAdmCmd) { await reply('❌ Apenas administradores.'); break; }

          const alvo = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
          if (!alvo) { await reply(`❌ Menciona o utilizador.\nUso: *${prefix}remadv @user*`); break; }

          const warnsFile = `${WARNS_DIR}/${from.replace('@g.us', '')}.json`;
          let warns = {};
          try { if (fs.existsSync(warnsFile)) warns = JSON.parse(fs.readFileSync(warnsFile, 'utf8')); } catch (_) {}

          if (!warns[alvo]) {
            await conn.sendMessage(from, { text: `ℹ️ @${alvo.split('@')[0]} não tem avisos registados.`, mentions: [alvo] });
            break;
          }
          const tinham = warns[alvo];
          delete warns[alvo];
          fs.writeFileSync(warnsFile, JSON.stringify(warns, null, 2));
          await conn.sendMessage(from, { text: `✅ Avisos de @${alvo.split('@')[0]} removidos! (tinha ${tinham}/3)`, mentions: [alvo] });
          break;
        }
        case 'ban':
        case 'banir': {
          if (!isGroup) { await reply('❌ Este comando só pode ser usado em grupos.'); break; }
          const meta     = await getGroupMeta(conn, from);
          const isAdmCmd = isAdminInMeta(meta, sender) || isDono;
          if (!isAdmCmd) { await reply('❌ Apenas administradores podem usar este comando.'); break; }

          const alvo = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
          if (!alvo) { await reply(`❌ Menciona alguém para banir.\nExemplo: *${prefix}ban @user*`); break; }

          const alvoIsAdmin = isAdminInMeta(meta, alvo);
          if (alvoIsAdmin && !isDono) { await reply('❌ Não podes banir um administrador.'); break; }

          try {
            invalidarMetaCache(from); await conn.groupParticipantsUpdate(from, [alvo], 'remove');
            await reagir(conn, m, '✅');
            await conn.sendMessage(from, { text: `⛔ @${alvo.split('@')[0]} foi banido do grupo.`, mentions: [alvo] });
          } catch (e) {
            console.error('[ERRO BAN]', e.message);
            await reagir(conn, m, '❌');
            await reply('❌ Erro ao tentar banir. O bot é admin?');
          }
          break;
        }
        case 'promover': {
          if (!isGroup) { await reply('❌ Apenas em grupos.'); break; }
          invalidarMetaCache(from);
          const meta     = await getGroupMeta(conn, from);
          const isAdmCmd = isAdminInMeta(meta, sender) || isDono;
          if (!isAdmCmd) { await reply('❌ Apenas administradores podem usar este comando.'); break; }

          const alvo = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
                    || m.message?.extendedTextMessage?.contextInfo?.participant;
          if (!alvo) { await reply(`❌ Menciona com @ ou responde à mensagem.\nUso: ${prefix}promover @user`); break; }

          const alvoIsAdmin = isAdminInMeta(meta, alvo);
          if (alvoIsAdmin) { await reply('ℹ️ Este utilizador já é administrador.'); break; }

          try {
            invalidarMetaCache(from); await conn.groupParticipantsUpdate(from, [alvo], 'promote');
            const txt = msgs.message.promovido
              .replace('{user}',  `@${alvo.split('@')[0]}`)
              .replace('{grupo}', groupName);
            await conn.sendMessage(from, { text: txt, mentions: [alvo] });
          } catch (e) {
            console.error('[ERRO PROMOVER]:', e.message);
            await reply('❌ Erro ao promover. O bot é admin?');
          }
          break;
        }
        case 'rebaixar': {
          if (!isGroup) { await reply('❌ Apenas em grupos.'); break; }
          invalidarMetaCache(from);
          const meta     = await getGroupMeta(conn, from);
          const isAdmCmd = isAdminInMeta(meta, sender) || isDono;
          if (!isAdmCmd) { await reply('❌ Apenas administradores podem usar este comando.'); break; }

          const alvo = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
                    || m.message?.extendedTextMessage?.contextInfo?.participant;
          if (!alvo) { await reply(`❌ Menciona com @ ou responde à mensagem.\nUso: ${prefix}rebaixar @user`); break; }
          if (alvo.split(':')[0] === sender.split(':')[0]) { await reply('❌ Não te podes rebaixar a ti próprio.'); break; }

          const alvoIsAdmin = isAdminInMeta(meta, alvo);
          if (!alvoIsAdmin) { await reply('ℹ️ Este utilizador já não é administrador.'); break; }

          try {
            invalidarMetaCache(from); await conn.groupParticipantsUpdate(from, [alvo], 'demote');
            const txt = msgs.message.rebaixado
              .replace('{user}',  `@${alvo.split('@')[0]}`)
              .replace('{grupo}', groupName);
            await conn.sendMessage(from, { text: txt, mentions: [alvo] });
          } catch (e) {
            console.error('[ERRO REBAIXAR]:', e.message);
            await reply('❌ Erro ao rebaixar. O bot é admin?');
          }
          break;
        }
        case 'mutar': {
          if (!isGroup) { await reply('❌ Apenas em grupos.'); break; }
          const meta = await getGroupMeta(conn, from);
          const isAdmCmd = isAdminInMeta(meta, sender) || isDono;
          if (!isAdmCmd) { await reply('❌ Apenas administradores podem usar este comando.'); break; }
          const alvoRawM = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
          if (!alvoRawM) { await reply(`❌ Menciona o utilizador.\nUso: ${prefix}mutar @user`); break; }
          // Converte LID para JID real
          let alvoM = alvoRawM;
          if (alvoRawM.endsWith('@lid')) {
            const aNum = alvoRawM.split('@')[0].replace(/\D/g, '');
            const ap = (meta.participants || []).find(p => {
              return [p.phoneNumber, p.jid, p.lidJid, p.lid, p.id].filter(Boolean)
                .some(c => c.split('@')[0].replace(/\D/g, '') === aNum);
            });
            if (ap?.phoneNumber) alvoM = ap.phoneNumber;
          }
          const alvoNumM = alvoM.split('@')[0].replace(/\D/g, '');
          if (alvoNumM === sender.split('@')[0].replace(/\D/g, '')) { await reply('❌ Não te podes mutar a ti próprio.'); break; }
          if ((isAdminInMeta(meta, alvoM) || isAdminInMeta(meta, alvoRawM)) && !isDono) {
            await reply(`❌ Não podes mutar um administrador.\nUso: ${prefix}mutar @user`);
            break;
          }
          const mutadosM = getAtivacao(from, 'mutados') || [];
          if (mutadosM.some(mid => mid.split('@')[0].replace(/\D/g, '') === alvoNumM)) {
            await reply(`ℹ️ @${alvoNumM} já está mutado.`); break;
          }
          mutadosM.push(`${alvoNumM}@s.whatsapp.net`);
          setAtivacao(from, 'mutados', mutadosM, groupName);
          await conn.sendMessage(from, {
            text: `🔇 @${alvoNumM} foi mutado!\nSuas mensagens serão apagadas automaticamente.\n\n👮 Mutado pelo adm: @${sender.split('@')[0]}`,
            mentions: [alvoM, sender]
          });
          break;
        }
        case 'desmutar': {
          if (!isGroup) { await reply('❌ Apenas em grupos.'); break; }
          const meta = await getGroupMeta(conn, from);
          const isAdmCmd = isAdminInMeta(meta, sender) || isDono;
          if (!isAdmCmd) { await reply('❌ Apenas administradores podem usar este comando.'); break; }
          const alvoRawD = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
          if (!alvoRawD) { await reply(`❌ Menciona o utilizador.\nUso: ${prefix}desmutar @user`); break; }
          // Converte LID para JID real (igual ao mutar)
          let alvoD = alvoRawD;
          if (alvoRawD.endsWith('@lid')) {
            const aNum = alvoRawD.split('@')[0].replace(/\D/g, '');
            const ap = (meta.participants || []).find(p => {
              return [p.phoneNumber, p.jid, p.lidJid, p.lid, p.id].filter(Boolean)
                .some(c => c.split('@')[0].replace(/\D/g, '') === aNum);
            });
            if (ap?.phoneNumber) alvoD = ap.phoneNumber;
          }
          const alvoNumD = alvoD.split('@')[0].replace(/\D/g, '');
          const mutadosD = getAtivacao(from, 'mutados') || [];
          if (!mutadosD.some(mid => mid.split('@')[0].replace(/\D/g, '') === alvoNumD)) {
            await reply(`ℹ️ @${alvoNumD} não está mutado.`); break;
          }
          const novos = mutadosD.filter(mid => mid.split('@')[0].replace(/\D/g, '') !== alvoNumD);
          setAtivacao(from, 'mutados', novos, groupName);
          await conn.sendMessage(from, {
            text: `🔊 @${alvoNumD} foi desmutado!\nJá pode enviar mensagens normalmente.\n\n👮 Desmutado pelo adm: @${sender.split('@')[0]}`,
            mentions: [alvoD, sender]
          });
          break;
        }
        case 'del':
        case 'deletar': {
          if (!isGroup) { await reply('❌ Apenas em grupos.'); break; }
          const meta     = await getGroupMeta(conn, from);
          const isAdmCmd = isAdminInMeta(meta, sender) || isDono;
          if (!isAdmCmd) { await reply('❌ Apenas administradores podem usar este comando.'); break; }

          const ctx = m.message?.extendedTextMessage?.contextInfo;
          if (!ctx?.stanzaId) { await reply(`❌ Responde à mensagem que queres apagar.\nUso: responde + ${prefix}del`); break; }
          try {
            await conn.sendMessage(from, { delete: { remoteJid: from, id: ctx.stanzaId, participant: ctx.participant, fromMe: false } });
          } catch (e) {
            await reply('❌ Erro ao apagar. O bot é admin?');
          }
          break;
        }
        // ── Proteções — ativar/desativar ────────────────────────
        // Uso: +antilink on | off
        case 'antilink': {
          if (!isGroup) { await reply('❌ Apenas em grupos.'); break; }
          const meta     = await getGroupMeta(conn, from);
          const isAdmCmd = isAdminInMeta(meta, sender) || isDono;
          if (!isAdmCmd) { await reply('❌ Apenas administradores podem usar este comando.'); break; }

          const sub = args[0]?.toLowerCase();
          if (!sub || (sub !== 'on' && sub !== 'off')) {
            const atual = getAtivacao(from, command) ? '✅ Ativado' : '❌ Desativado';
            await reply(`📋 *${command}* — Estado atual: ${atual}\n\nComandos:\n• ${prefix}${command} on\n• ${prefix}${command} off`);
            break;
          }
          const ativar = sub === 'on';
          setAtivacao(from, command, ativar, groupName);
          const keyMsg = ativar ? `${command} 1` : `${command} 0`;
          const resposta = ativar
            ? (msgs.message.ativados[keyMsg]   || `${command} ativado com sucesso!`)
            : (msgs.message.desativados[keyMsg] || `${command} desativado com sucesso!`);
          await reply(`${ativar ? '✅' : '❌'} ${resposta}`);
          break;
        }
        // ── Bem-vindo ───────────────────────────────────────────
        case 'bemvindo': {
          if (!isGroup) { await reply('❌ Apenas em grupos.'); break; }
          const meta     = await getGroupMeta(conn, from);
          const isAdmCmd = isAdminInMeta(meta, sender) || isDono;
          if (!isAdmCmd) { await reply('❌ Apenas administradores podem usar este comando.'); break; }
 
          const sub = args[0]?.toLowerCase();
          if (!sub || (sub !== 'on' && sub !== 'off')) {
            const estado = getAtivacao(from, 'bemvindo') ? '✅ Ativado' : '❌ Desativado';
            const msgAtual = getAtivacao(from, 'msgbemvindo') || msgs.message.bemvindo;
            await reply(`📋 *Bem-vindo — Estado atual*\n\nStatus: ${estado}\nMensagem: ${msgAtual}\n\nComandos:\n• ${prefix}bemvindo on\n• ${prefix}bemvindo off\n• ${prefix}msgbv [mensagem]`);
            break;
          }
          const ativar = sub === 'on';
          setAtivacao(from, 'bemvindo', ativar, groupName);
          const resposta = ativar
            ? (msgs.message.ativados['bemvindo 1']   || 'mensagem de boas vindas ativada com sucesso!')
            : (msgs.message.desativados['bemvindo 0'] || 'mensagem de boas vindas desativada com sucesso!');
          await reply(`${ativar ? '✅' : '❌'} ${resposta}`);
          break;
        }
        // ── Saída ────────────────────────────────────────────────
        case 'saida': {
          if (!isGroup) { await reply('❌ Apenas em grupos.'); break; }
          const meta     = await getGroupMeta(conn, from);
          const isAdmCmd = isAdminInMeta(meta, sender) || isDono;
          if (!isAdmCmd) { await reply('❌ Apenas administradores podem usar este comando.'); break; }
 
          const sub = args[0]?.toLowerCase();
          if (!sub || (sub !== 'on' && sub !== 'off')) {
            const estado = getAtivacao(from, 'saida') ? '✅ Ativado' : '❌ Desativado';
            const msgAtual = getAtivacao(from, 'msgsaida') || msgs.message.saida;
            await reply(`📋 *Saída — Estado atual*\n\nStatus: ${estado}\nMensagem: ${msgAtual}\n\nComandos:\n• ${prefix}saida on\n• ${prefix}saida off\n• ${prefix}msgsaida [mensagem]`);
            break;
          }
          const ativar = sub === 'on';
          setAtivacao(from, 'saida', ativar, groupName);
          const resposta = ativar
            ? (msgs.message.ativados['saida 1']   || 'mensagem de despedida ativada com sucesso!')
            : (msgs.message.desativados['saida 0'] || 'mensagem de despedida desativada com sucesso!');
          await reply(`${ativar ? '✅' : '❌'} ${resposta}`);
          break;
        }
        // ── Personalizar mensagem de boas-vindas ────────────────
        case 'msgbv': {
          if (!isGroup) { await reply('❌ Apenas em grupos.'); break; }
          const meta     = await getGroupMeta(conn, from);
          const isAdmCmd = isAdminInMeta(meta, sender) || isDono;
          if (!isAdmCmd) { await reply('❌ Apenas administradores podem usar este comando.'); break; }
 
          if (!body) {
            await reply(
              `📝 *Personalizar mensagem de boas-vindas*\n\n` +
              `Uso: ${prefix}msgbv [mensagem]\n\n` +
              `Variáveis disponíveis:\n` +
              `• *{user}* — menção ao utilizador\n` +
              `• *{grupo}* — nome do grupo\n\n` +
              `Exemplo: ${prefix}msgbv Olá {user}, bem-vindo ao {grupo}! 🎉`
            );
            break;
          }
          setAtivacao(from, 'msgbemvindo', body, groupName);
          await reply(`✅ Mensagem de boas-vindas atualizada!\n\n📝 Nova mensagem:\n${body}`);
          break;
        }
        // ── Personalizar mensagem de saída ──────────────────────
        case 'msgsaida': {
          if (!isGroup) { await reply('❌ Apenas em grupos.'); break; }
          const meta     = await getGroupMeta(conn, from);
          const isAdmCmd = isAdminInMeta(meta, sender) || isDono;
          if (!isAdmCmd) { await reply('❌ Apenas administradores podem usar este comando.'); break; }
 
          if (!body) {
            await reply(
              `📝 *Personalizar mensagem de saída*\n\n` +
              `Uso: ${prefix}msgsaida [mensagem]\n\n` +
              `Variáveis disponíveis:\n` +
              `• *{user}* — nome do utilizador\n` +
              `• *{grupo}* — nome do grupo\n\n` +
              `Exemplo: ${prefix}msgsaida Adeus {user}, foi bom ter-te no {grupo} 👋`
            );
            break;
          }
          setAtivacao(from, 'msgsaida', body, groupName);
          await reply(`✅ Mensagem de saída atualizada!\n\n📝 Nova mensagem:\n${body}`);
          break;
        }
        // ── Status do grupo ─────────────────────────────────────
        case 'statusgp': {
          if (!isGroup) { await reply('❌ Apenas em grupos.'); break; }
          const meta     = await getGroupMeta(conn, from);
          const isAdmCmd = isAdminInMeta(meta, sender) || isDono;
          if (!isAdmCmd) { await reply('❌ só adm ou dono pode usar o comando'); break;}
          const gd  = getGrupo(from, groupName);
          const atv = gd.ativacoes;
          const sim = '✅'; const nao = '❌';
          await reply(
            `📊 *Status do grupo: ${groupName}*\n\n` +
            `🔒 *Proteções*\n` +
            `${atv.antilink      ? sim : nao} Antilink\n` +
            `${atv.antilinkgp    ? sim : nao} Antilink GP\n` +
            `${atv.antilinkhard  ? sim : nao} Antilink Hard\n` +
            `👋 *Mensagens*\n` +
            `${atv.bemvindo ? sim : nao} Bem-vindo\n` +
            `${atv.saida    ? sim : nao} Saída`
          );
          break;
        }

        // ┌─────────────────────────────────────────────────────┐
        // │               COMANDOS DO DONO                      │
        // └─────────────────────────────────────────────────────┘
        case 'setfotomenu': {
          if (!isDono) { await reply('❌ Apenas o dono pode usar este comando.'); break; }
          const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
          const isImg  = quoted?.imageMessage;
          if (!isImg) { await reply(`❌ Marca uma imagem.\nUso: marca a foto e escreve *${prefix}setfotomenu*`); break; }
          try {
            const pasta = './database/fotomenu';
            if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });
            // Apaga fotos antigas
            fs.readdirSync(pasta).forEach(f => fs.unlinkSync(path.join(pasta, f)));
            // Baixa e guarda a nova
            const stream = await downloadContentFromMessage(isImg, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            fs.writeFileSync(path.join(pasta, 'fotomenu.jpg'), buffer);
            await reply('✅ Foto do menu atualizada com sucesso!');
          } catch (e) {
            await reply(`❌ Erro ao salvar a foto: ${e.message}`);
          }
          break;
        }
        case 'setprefix': {
          if (!isDono) { await reply('❌ Apenas o dono pode usar este comando.'); break; }
          if (!body) { await reply(`❌ Uso: ${prefix}setprefix [novo prefixo]\nEx: ${prefix}setprefix !`); break; }
          const novoPrefix = body.trim().split(' ')[0];
          const cfgPath    = './settings/config.json';
          const cfgAtual   = lerJSON(cfgPath);
          cfgAtual.prefix  = novoPrefix;
          salvarJSON(cfgPath, cfgAtual);
          // Atualiza em memória
          config.prefix = novoPrefix;
          await reply(`✅ Prefixo alterado para: *${novoPrefix}*\nReinicia o bot para aplicar totalmente.`);
          break;
        }
        case 'setnomebot': {
          if (!isDono) { await reply('❌ Apenas o dono pode usar este comando.'); break; }
          if (!body) { await reply(`❌ Uso: ${prefix}setnomebot [novo nome]`); break; }
          const cfgPath  = './settings/config.json';
          const cfgAtual = lerJSON(cfgPath);
          cfgAtual.nomebot = body.trim();
          salvarJSON(cfgPath, cfgAtual);
          config.nomebot = body.trim();
          await reply(`✅ Nome do bot alterado para: *${body.trim()}*`);
          break;
        } 
        case 'setdono': {
          if (!isDono) { await reply('❌ Apenas o dono pode usar este comando.'); break; }
          if (!body) { await reply(`❌ Uso: ${prefix}setdono [novo nome do dono]`); break; }
          const cfgPath  = './settings/config.json';
          const cfgAtual = lerJSON(cfgPath);
          cfgAtual.dono  = body.trim();
          salvarJSON(cfgPath, cfgAtual);
          config.dono = body.trim();
          await reply(`✅ Nome do dono alterado para: *${body.trim()}*`);
          break;
        }
        case 'setnumerodono':
        case 'setnumero': {
          if (!isDono) { await reply('❌ Apenas o dono pode usar este comando.'); break; }
          if (!body) { await reply(`❌ Uso: ${prefix}setnumerodono [número com DDI]\nEx: ${prefix}setnumerodono 351912345678`); break; }
          const novoNum  = body.trim().replace(/\D/g, '');
          const cfgPath  = './settings/config.json';
          const cfgAtual = lerJSON(cfgPath);
          cfgAtual.numerodono = novoNum;
          salvarJSON(cfgPath, cfgAtual);
          config.numerodono = novoNum;
          await reply(`✅ Número do dono alterado para: *${novoNum}*`);
          break;
        }
        case 'botoff': {
          if (!isDono) { await reply('❌ Apenas o dono pode usar este comando.'); break; }
          if (global.botDesligado) { await reply('ℹ️ O bot já está desligado.'); break; }
          global.botDesligado = true;
          await reply('🔌 Bot desligado! Ninguém conseguirá usar comandos.\nUsa *' + prefix + 'boton* para reativar.');
          break;
        } 
        case 'boton': {
          if (!isDono) { await reply('❌ Apenas o dono pode usar este comando.'); break; }
          if (!global.botDesligado) { await reply('ℹ️ O bot já está ligado.'); break; }
          global.botDesligado = false;
          await reply('🔋 Bot reativado! Todos podem usar os comandos novamente.');
          break;
        }
        case 'reiniciar': {
          if (!isDono) { await reply('❌ Apenas o dono pode usar este comando.'); break; }
          await reply('🔄 A reiniciar o bot...');
          setTimeout(() => {
            const { spawn } = require('child_process');
            spawn(process.argv[0], process.argv.slice(1), { detached: true, stdio: 'inherit' });
            process.exit(0);
          }, 2000);
          break;
        }
        case 'broadcast': {
          if (!isDono) { await reply('❌ Apenas o dono pode usar este comando.'); break; }
          if (!body) { await reply(`❌ Uso: ${prefix}broadcast [mensagem]`); break; }

          await reply('📢 A enviar broadcast...');
          try {
            const grupos = await conn.groupFetchAllParticipating();
            const ids    = Object.keys(grupos);
            let enviados = 0;
            for (const gid of ids) {
              try {
                await conn.sendMessage(gid, { text: `📢 *Broadcast do Dono*\n\n${body}` });
                enviados++;
                await new Promise(r => setTimeout(r, 500)); // evita flood
              } catch (_) {}
            }
            await reply(`✅ Broadcast enviado para *${enviados}* grupo(s).`);
          } catch (e) {
            console.error('[ERRO BROADCAST]:', e.message);
            await reply('❌ Erro ao enviar broadcast.');
          }
          break;
        }
        case 'bangp': {
          if (!isDono) { await reply('❌ Apenas o dono pode usar este comando.'); break; }
          if (!isGroup) { await reply('❌ Apenas em grupos.'); break; }
          if (getAtivacao(from, 'banido')) { await reply('ℹ️ Este grupo já está banido.'); break; }
          setAtivacao(from, 'banido', true, groupName);
          await reply('🚫 Grupo banido! O bot não responderá mais neste grupo.\nUsa *' + prefix + 'unbangp* para reativar.');
          break;
        }

        case 'unbangp': {
          if (!isDono) { await reply('❌ Apenas o dono pode usar este comando.'); break; }
          if (!isGroup) { await reply('❌ Apenas em grupos.'); break; }
          if (!getAtivacao(from, 'banido')) { await reply('ℹ️ Este grupo não está banido.'); break; }
          setAtivacao(from, 'banido', false, groupName);
          await reply('✅ Grupo reativado! O bot voltará a responder neste grupo.');
          break;
        }

        case 'blockcmd': {
          if (!isDono) { await reply('❌ Apenas o dono pode usar este comando.'); break; }
          if (!body) { await reply(`❌ Uso: ${prefix}blockcmd [comando]`); break; }
          const cmd = body.trim().toLowerCase().replace(prefix, '');
          const atv = lerJSON('./settings/ativacoes.json', { blockedCommandsGlobal: [], unblockedCommandsGlobal: [] });
          if (!atv.blockedCommandsGlobal) atv.blockedCommandsGlobal = [];
          if (atv.blockedCommandsGlobal.includes(cmd)) { await reply(`ℹ️ O comando *${prefix}${cmd}* já está bloqueado.`); break; }
          atv.blockedCommandsGlobal.push(cmd);
          salvarJSON('./settings/ativacoes.json', atv);
          await reply(`✅ Comando *${prefix}${cmd}* bloqueado globalmente!`);
          break;
        }

        case 'unblockcmd': {
          if (!isDono) { await reply('❌ Apenas o dono pode usar este comando.'); break; }
          if (!body) { await reply(`❌ Uso: ${prefix}unblockcmd [comando]`); break; }
          const cmd = body.trim().toLowerCase().replace(prefix, '');
          const atv = lerJSON('./settings/ativacoes.json', { blockedCommandsGlobal: [], unblockedCommandsGlobal: [] });
          if (!atv.blockedCommandsGlobal) atv.blockedCommandsGlobal = [];
          if (!atv.blockedCommandsGlobal.includes(cmd)) { await reply(`ℹ️ O comando *${prefix}${cmd}* não está bloqueado.`); break; }
          atv.blockedCommandsGlobal = atv.blockedCommandsGlobal.filter(c => c !== cmd);
          salvarJSON('./settings/ativacoes.json', atv);
          await reply(`✅ Comando *${prefix}${cmd}* desbloqueado!`);
          break;
        }

        case 'cases': {
          if (!isDono) { await reply('❌ Apenas o dono pode usar este comando.'); break; }
          const lista = totalcase.map((c, i) => `${i + 1} - ${c}`).join('\n');
          await reply(`🗂️ *Minhas cases (${totalcase.length}):*\n\n${lista}`);
          break;
        }
        case 'setsubdono': {
          if (!isDono) { await reply('❌ Apenas o dono pode usar este comando.'); break; }
          const slot = command.replace('setsubdono', '') || '1';
          const slotNum = parseInt(slot);
          if (isNaN(slotNum) || slotNum < 1 || slotNum > 6) {
            await reply(`❌ Slot inválido. Usa entre 1 e 6.\nEx: *${prefix}setsubdono1 @user*`);
            break;
          }
          const alvoRaw = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
          if (!alvoRaw) { await reply(`❌ Menciona o utilizador.\nEx: *${prefix}setsubdono${slotNum} @user*`); break; }
          try {
            // Converte LID para número real usando phoneNumber dos participants
            let numeroReal = alvoRaw.split('@')[0].replace(/\D/g, '');
            if (alvoRaw.endsWith('@lid') && isGroup) {
              const meta = await getGroupMeta(conn, from);
              const alvoNum = alvoRaw.split('@')[0].replace(/\D/g, '');
              const p = (meta.participants || []).find(p => {
                const candidates = [p.phoneNumber, p.jid, p.lidJid, p.lid, p.id].filter(Boolean);
                return candidates.some(c => c.split('@')[0].replace(/\D/g, '') === alvoNum);
              });
              if (p?.phoneNumber) numeroReal = p.phoneNumber.split('@')[0].replace(/\D/g, '');
            }
            const config1Path = './settings/config1.json';
            const dados = JSON.parse(fs.readFileSync(config1Path, 'utf-8'));
            dados[`dono${slotNum}`] = numeroReal;
            fs.writeFileSync(config1Path, JSON.stringify(dados, null, 2));
            Object.assign(config1, dados);
            await reply(`✅ *Subdono ${slotNum}* definido como *${numeroReal}*`);
          } catch (e) {
            await reply(`❌ Erro ao salvar: ${e.message}`);
          }
          break;
        }

        // ── Comando não encontrado ──────────────────────────────
        default:
          await reply(`❌ Comando *${prefix}${command}* não encontrado.\nUsa *${prefix}menu* para ver os comandos.`);
          break;
      }
    }
  } catch (err) {
    console.error('[ERRO system.js]:', err.message);
  }
};

// Exporta o handler de grupo para o conncts.js
module.exports.handleGroupUpdate = handleGroupUpdate;
