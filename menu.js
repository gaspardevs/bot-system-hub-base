const config = require("../../settings/config.json");

const menu = (prefix, pushname, dono, numerodono, nomebot, hora) => {
    return `
┏━✦ BOT-SYSTEM-HUB ✦━┓
║
║ 🔥 Usuário: ${pushname || 'usuario'}
║ 🔥 Bot: ${nomebot || 'Bot-System-Hub'}
║ 🔥 Dono: ${dono || 'Gaspar Devs'}
║ 🔥 Número: ${numerodono || '351924423740'}
║ 🔥 Data: 28/06/2026
║ 🔥 Hora: ${hora || '--:--'}
║ 🔥 Versão: 1.0.0
║
┗━✦━━━━━━━━━━━━━━━━━━━✦━┛
╭─✦ MENU PRINCIPAL ✦─╮
│
│ ⚡ ${prefix}menu        » Menu Principal
│ 👮 ${prefix}menuadm     » Menu Administrador
│ 👑 ${prefix}menudono    » Menu do Dono
│
╰─✦━━━━━━━━━━━━━━━━━━━━━✦─╯
╭─✦ SUPORTE ✦─╮
│
│ 🏓 ${prefix}ping        » Testar Velocidade
│ 🐞 ${prefix}relatarbug  » Reportar Bug
│ 💡 ${prefix}sugerir     » Enviar Sugestão
│ ⭐ ${prefix}avaliar     » Avaliar o Bot
│ 👑 ${prefix}dono        » Ver o Dono
│
╰─✦━━━━━━━━━━━━━━━━━━━━━✦─╯
╭─✦ UTILIDADES ✦─╮
│
│ 🧮 ${prefix}calculadora » Calculadora
│ 📖 ${prefix}biblia      » Versículos Bíblicos
│ 💪 ${prefix}frases      » Frases Motivacionais
│ 🎰 ${prefix}roleta      » Roleta de Nomes
│ 🗂️ ${prefix}totalcases  » Total de Cases
│
╰─✦━━━━━━━━━━━━━━━━━━━━━✦─╯
✦ • BOT RÁPIDO • ESTÁVEL • PREMIUM ✦
         O melhor do momento! 🔥✨
`;
};
exports.menu = menu;

const menuadm = (prefix, pushname, dono, numerodono, nomebot, hora) => {
return `
┏━✦ BOT-SYSTEM-HUB ✦━┓
║
║ 🔥 MENU DE ADMINISTRAÇÃO 🔥
║
┗━✦━━━━━━━━━━━━━━━━━━━✦━┛
╭─✦ INFO DO ADMIN ✦─╮
│
│ 🌟 Olá, Admin ${pushname || 'usuario'}!
│ 🤖 Bot: ${nomebot || 'Bot-System-Hub'}
│ 👑 Dono: ${dono || 'Gaspar Devs'}
│ 📱 Número: ${numerodono || '351924423740'}
│ 🕒 Hora: ${hora || '--:--'}
║ 🔥 Versão: 1.0.0
│
╰─✦━━━━━━━━━━━━━━━━━━━━━✦─╯
╭─✦ PROTEÇÕES ✦─╮
│
│ 🚫 ${prefix}antilink      » Anti Link
│ 🔗 ${prefix}antilinkgp   » Anti Link de Grupos
│ 🚷 ${prefix}antilinkhard » Anti Link Hard (Ban)
│
╰─✦━━━━━━━━━━━━━━━━━━━━━✦─╯
╭─✦ GESTÃO DO GRUPO ✦─╮
│
│ ⛔ ${prefix}banir       » Banir Membro
│ 🔇 ${prefix}mutar       » Mutar Grupo
│ 🔊 ${prefix}desmutar    » Desmutar Grupo
│ ⚠️ ${prefix}adv         » Dar Advertência
│ ♻️ ${prefix}remadv      » Remover Advertência
│ 🗑️ ${prefix}del         » Apagar Mensagem
│ 👮 ${prefix}promover    » Tornar Admin
│ 👶 ${prefix}rebaixar    » Remover Admin
│ 👋 ${prefix}bemvindo    » Boas-Vindas On/Off
│ 🚪 ${prefix}saida       » Saída On/Off
│ ✏️ ${prefix}msgbv       » Mensagem de Boas-Vindas
│ ✏️ ${prefix}msgsaida    » Mensagem de Saída
│ 📊 ${prefix}statusgp    » Membros Ativos
│
╰─✦━━━━━━━━━━━━━━━━━━━━━✦─╯
✦ • BOT RÁPIDO • ESTÁVEL •PREMIUM ✦
         O melhor do momento! 🔥✨*
`;
};
exports.menuadm = menuadm;

const menudono = (prefix, pushname, dono, numerodono, nomebot, hora) => {
return `
┏━✦ BOT-SYSTEM-HUB ✦━┓
║
║ 🔥 MENU DO DONO 🔥
║
┗━✦━━━━━━━━━━━━━━━━━━━✦━┛
╭─✦ INFO DO DONO ✦─╮
│
│ 👑 Olá, Dono ${pushname || 'usuario'}!
│ 🤖 Bot: ${nomebot || 'Bot-Sustem-Hub'}
│ 👑 Dono: ${dono || 'Gaspar Devs'}
│ 📱 Número: ${numerodono || '351924423740'}
│ 🕒 Hora: ${hora || '--:--'}
║ 🔥 Versão: 1.0.0
│
╰─✦━━━━━━━━━━━━━━━━━━━━━✦─╯
╭─✦ CONFIGURAÇÕES ✦─╮
│
│ 🔧 ${prefix}setprefix    » Mudar Prefixo
│ 🤖 ${prefix}setnomebot   » Mudar Nome do Bot
│ 👑 ${prefix}setdono      » Definir Dono
│ 📱 ${prefix}setnumero    » Mudar Número
│ 🖼️ ${prefix}setfotomenu  » Mudar Foto do Menu
│ 🛡️ ${prefix}setsubdono   » Adicionar Subdono (1-6)
│
╰─✦━━━━━━━━━━━━━━━━━━━━━✦─╯
╭─✦ CONTROLE DO BOT ✦─╮
│
│ 🔌 ${prefix}botoff     » Desligar Bot
│ 🔋 ${prefix}boton      » Ligar Bot
│ 🔄 ${prefix}reiniciar  » Reiniciar Bot
│ 📢 ${prefix}broadcast  » Avisar Todos os Grupos
│
╰─✦━━━━━━━━━━━━━━━━━━━━━✦─╯
╭─✦ AVANÇADO ✦─╮
│
│ 🗂️ ${prefix}cases      » Ver Todas as Cases
│ 💥 ${prefix}bangp      » Banir de Grupo
│ 💥 ${prefix}unbangp    » Desbanir de Grupo
│ 🚫 ${prefix}blockcmd   » Bloquear Comando
│ ✅ ${prefix}unblockcmd » Desbloquear Comando
│
╰─✦━━━━━━━━━━━━━━━━━━━━━✦─╯
✦ • BOT RÁPIDO • ESTÁVEL • PREMIUM ✦
       O melhor do momento! 🔥✨
`;
};
exports.menudono = menudono;

