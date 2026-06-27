// ══════════════════════════════════════════════════════════════
//   INSTALAÇÃO DE DEPENDÊNCIAS — MELIODAS BOT
//   by Gaspar Devs
//   Uso: node instalacao.js
// ══════════════════════════════════════════════════════════════

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const reset   = '\x1b[0m';
const verde   = '\x1b[32m';
const azul    = '\x1b[34m';
const amarelo = '\x1b[33m';
const vermelho= '\x1b[31m';
const negrito = '\x1b[1m';

const log  = (msg) => console.log(`${azul}[INFO]${reset} ${msg}`);
const ok   = (msg) => console.log(`${verde}[OK]${reset} ${msg}`);
const warn = (msg) => console.log(`${amarelo}[AVISO]${reset} ${msg}`);
const erro = (msg) => console.log(`${vermelho}[ERRO]${reset} ${msg}`);

console.log(`\n${negrito}${azul}╔══════════════════════════════════════╗`);
console.log(`║      MELIODAS BOT — INSTALAÇÃO       ║`);
console.log(`╚══════════════════════════════════════╝${reset}\n`);

// ── 1. Verifica versão do Node ──────────────────────────────
log('A verificar versão do Node.js...');
const nodeVersion = process.version;
const major = parseInt(nodeVersion.slice(1).split('.')[0]);
if (major < 18) {
  erro(`Node.js ${nodeVersion} não suportado. Instala a versão 18 ou superior.`);
  process.exit(1);
}
ok(`Node.js ${nodeVersion} ✓`);

// ── 2. Deteta se está no /storage/ e move para home ────────
const pastaAtual   = process.cwd();
const pastaHome    = process.env.HOME || '/data/data/com.termux/files/home';
const pastaTemp    = path.join(pastaHome, 'bot-system-hub-install');
let   voltarPara   = null;
let   moveuParaHome = false;

if (pastaAtual.startsWith('/storage/') || pastaAtual.startsWith('/sdcard')) {
  warn('Bot detetado no armazenamento interno (/storage/).');
  warn('O Android não permite symlinks aqui — a mover para a home do Termux...');

  try {
    // Remove pasta temp antiga se existir
    if (fs.existsSync(pastaTemp)) {
      execSync(`rm -rf "${pastaTemp}"`, { stdio: 'pipe' });
    }

    // Copia o bot para a home (cp -r porque mv entre partições pode falhar)
    execSync(`cp -r "${pastaAtual}" "${pastaTemp}"`, { stdio: 'pipe' });
    ok(`Bot copiado para: ${pastaTemp}`);

    // Muda o cwd para a pasta temp
    process.chdir(pastaTemp);
    voltarPara    = pastaAtual;
    moveuParaHome = true;
    ok(`A trabalhar em: ${pastaTemp}\n`);
  } catch (e) {
    erro(`Não foi possível mover o bot: ${e.message}`);
    erro('Tenta mover manualmente com: mv /sdcard/bot-system-hub ~/bot-system-hub');
    process.exit(1);
  }
}

// ── 3. Cria package.json se não existir ────────────────────
if (!fs.existsSync('./package.json')) {
  warn('package.json não encontrado. A criar...');
  const pkg = {
    name: 'bot-system-hub',
    version: '1.0.0',
    description: 'base bot-system-hub by Gaspar Devs',
    main: 'connects.js',
    scripts: { start: 'bash start.sh' },
    type: 'commonjs'
  };
  fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
  ok('package.json criado ✓');
} else {
  ok('package.json encontrado ✓');
}

// ── 4. Cria pastas necessárias ──────────────────────────────
const pastas = [
  './database',
  './database/fotomenu',
  './database/menus',
  './database/warns',
  './settings',
];
log('A criar estrutura de pastas...');
for (const pasta of pastas) {
  if (!fs.existsSync(pasta)) {
    fs.mkdirSync(pasta, { recursive: true });
    ok(`Pasta criada: ${pasta}`);
  } else {
    ok(`Pasta já existe: ${pasta}`);
  }
}

// ── 5. Copia foto do menu se existir ──────────────────────
log('A verificar foto do menu...');
const fotoSrc  = path.join(__dirname, 'foto_menu.jpeg');
const fotoDest = './database/fotomenu/foto_menu.jpeg';
if (!fs.existsSync(fotoDest)) {
  if (fs.existsSync(fotoSrc)) {
    fs.copyFileSync(fotoSrc, fotoDest);
    ok('Foto do menu copiada ✓');
  } else {
    warn('foto_menu.jpeg não encontrada — coloca a foto na raiz do bot e corre novamente.');
  }
} else {
  ok('Foto do menu já existe ✓');
}

// ── 6. Cria menu.js dentro de database/menus ───────────────
log('A verificar menu.js...');
const menuSrc  = path.join(__dirname, 'menu.js');
const menuDest = './database/menus/menu.js';
if (!fs.existsSync(menuDest)) {
  if (fs.existsSync(menuSrc)) {
    fs.copyFileSync(menuSrc, menuDest);
    ok('menu.js copiado para database/menus/ ✓');
  } else {
    warn('menu.js não encontrado na raiz do bot.');
  }
} else {
  ok('menu.js já existe em database/menus/ ✓');
}


// ── 7. Cria ficheiros JSON base se não existirem ───────────
const ficheiros = {
  './database/configu_gp.json':  JSON.stringify({}, null, 2),
  './settings/config.json':    JSON.stringify({
    nomebot: 'BOT-SYSTEM-HUB',
    prefix: '+',
    dono: 'seunome',
    numerodono: 'seunumero',
    numerobot: 'numerodobot',
  }, null, 2),
  './settings/config1.json':   JSON.stringify({
    dono1: '', dono2: '', dono3: '',
    dono4: '', dono5: '', dono6: ''
  }, null, 2),
  './settings/ativacoes.json': JSON.stringify({
    blockedCommandsGlobal: [],
    unblockedCommandsGlobal: []
  }, null, 2),
  './settings/message.json': JSON.stringify({
    "message": {
        "bemvindo": "olá {user}, seja bem vindo ao nosso grupo {grupo}! espero que se divirta aqui :)",
        "saida": "adeus {user}, esperamos que volte em breve :(",
        "promovido": "parabéns {user}, você foi promovido a admin do grupo {grupo}! 👮",
        "rebaixado": "infelizmente {user}, você foi rebaixado de admin do grupo {grupo}.",
        "ativados": {
            "bemvindo 1": "mensagem de boas vindas ativada com sucesso!",
            "saida 1": "mensagem de despedida ativada com sucesso!",
            "antilink 1": "anti link ativado com sucesso!",
            "antilinkgp 1": "anti link de grupos ativado com sucesso!",
            "antilinkhard 1": "anti link hard (ban automático) ativado com sucesso!",
        },
        "desativados": {
            "bemvindo 0": "mensagem de boas vindas desativada com sucesso!",
            "saida 0": "mensagem de despedida desativada com sucesso!",
            "antilink 0": "anti link desativado com sucesso!",
            "antilinkgp 0": "anti link de grupos desativado com sucesso!",
            "antilinkhard 0": "anti link hard desativado com sucesso!",

        }
    }}, null, 2),
    './settings/reacao.json': JSON.stringify({
  "reacao": {
    "menus": {
      "menu": "📜",
      "menuadm": "👨🏻‍✈️",
      "menudono": "👑"
    },
    "comandos membros": {
      "ping": "🏓",
      "relatarbug": "🐞",
      "sugerir": "💡",
      "avaliar": "⭐",
      "calculadora": "🧮",
      "biblia": "📖",
      "frases": "💪",
      "roleta": "🎰",
      "totalcases": "🗂️",
      "dono": "👑",
    },
    "comandos adm": {
      "antilink": "🚫",
      "antilinkgp": "🔗",
      "antilinkhard": "🚷",
      "promover": "👨🏻‍✈️",
      "rebaixar": "👶",
      "bemvindo": "👋",
      "saida": "🚪",
      "msgbv": "✏️",
      "msgsaida": "✏️",
      "statusgp": "📊",
      "adv": "⚠️",
      "remadv": "♻️",
      "del": "🗑️",
      "deletar": "🗑️",
      "mutar": "🔇",
      "desmutar": "🔊",
      "banir": "⛔",
      "ban": "⛔",
    },
    "comandos dono": {
      "setprefix": "🔧",
      "setsubdono": "🛡️",
      "setsubdono1": "🛡️",
      "setsubdono2": "🛡️",
      "setsubdono3": "🛡️",
      "setsubdono4": "🛡️",
      "setsubdono5": "🛡️",
      "setsubdono6": "🛡️",
      "setnomebot": "🤖",
      "setfotomenu": "🖼️",
      "setdono": "👑",
      "setnumerodono": "📱",
      "setnumero": "📱",
      "botoff": "🔌",
      "boton": "🔋",
      "reiniciar": "🔄",
      "bangp": "💥",
      "unbangp": "💥",
      "cases": "🗂️",
      "broadcast": "📢",
      "blockcmd": "🚫",
      "unblockcmd": "✅",
    }
  }

    },null, 2),
};
log('A verificar ficheiros de configuração...');
for (const [ficheiro, conteudo] of Object.entries(ficheiros)) {
  if (!fs.existsSync(ficheiro)) {
    fs.writeFileSync(ficheiro, conteudo);
    ok(`Criado: ${ficheiro}`);
  } else {
    ok(`Já existe: ${ficheiro}`);
  }
}

// ── 8. Instala dependências ─────────────────────────────────
const dependencias = [
  '@whiskeysockets/baileys',
  '@hapi/boom',
  'axios',
  'colors',
  'mathjs',
  'qrcode-terminal',
  'pino',
  'pino-pretty',
  'node-cache',
  'jimp',
];

console.log(`\n${negrito}A instalar dependências...${reset}\n`);

for (const dep of dependencias) {
  try {
    log(`A instalar ${dep}...`);
    execSync(`npm install ${dep} --force --no-audit --no-fund`, { stdio: 'pipe' });
    ok(`${dep} instalado ✓`);
  } catch (e) {
    erro(`Falha ao instalar ${dep}: ${e.message}`);
  }
}

// ── 9. Instala PM2 globalmente (necessário para +reiniciar funcionar) ──
console.log(`\n${negrito}A instalar PM2 (gestor de processos)...${reset}\n`);
try {
  log('A verificar se o PM2 já está instalado...');
  execSync('pm2 --version', { stdio: 'pipe' });
  ok('PM2 já está instalado ✓');
} catch (_) {
  try {
    log('A instalar PM2 globalmente...');
    execSync('npm install -g pm2 --force --no-audit --no-fund', { stdio: 'pipe' });
    ok('PM2 instalado ✓');
  } catch (e) {
    erro(`Falha ao instalar PM2: ${e.message}`);
    warn('O comando +reiniciar não vai conseguir reiniciar o bot automaticamente sem o PM2.');
    warn('Instala manualmente depois com: npm install -g pm2');
  }
}

// ── 10. Move de volta para o /storage/ se necessário ────────
if (moveuParaHome && voltarPara) {
  console.log(`\n${amarelo}[AVISO]${reset} A mover o bot de volta para o armazenamento interno...`);
  try {
    // Remove a pasta antiga no sdcard (sem node_modules para não demorar)
    execSync(`rm -rf "${voltarPara}"`, { stdio: 'pipe' });

    // Copia tudo de volta (incluindo node_modules já instalada)
    execSync(`cp -r "${pastaTemp}" "${voltarPara}"`, { stdio: 'pipe' });

    // Limpa a pasta temp da home
    execSync(`rm -rf "${pastaTemp}"`, { stdio: 'pipe' });

    ok(`Bot movido de volta para: ${voltarPara}`);
    warn(`Para iniciar o bot, entra na pasta e corre: npm start`);
    warn(`cd "${voltarPara}" && npm start`);
  } catch (e) {
    erro(`Não foi possível mover de volta: ${e.message}`);
    warn(`O bot está instalado em: ${pastaTemp}`);
    warn(`Podes movê-lo manualmente ou correr de lá: cd "${pastaTemp}" && npm start`);
  }
}

// ── 11. Mensagem final ──────────────────────────────────────
console.log(`\n${negrito}${verde}╔══════════════════════════════════════╗`);
console.log(`║      INSTALAÇÃO CONCLUÍDA ✓           ║`);
console.log(`╚══════════════════════════════════════╝${reset}\n`);
console.log(`${negrito}Próximo passo:${reset}`);
console.log(`  1. Edita ${amarelo}settings/config.json${reset} com o teu número`);
console.log(`  2. Corre ${verde}npm start${reset} para iniciar o bot\n`);