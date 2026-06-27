 ![Bot Image](/foto_menu.jpeg)

# 🤖 Bot System Hub

O **Bot System Hub** é uma **base de bot em Node.js** criada para servir como estrutura inicial para bots de WhatsApp.

Este projeto é uma **base totalmente reformulada do Meliodas Bot**.  
Todo o código antigo foi removido e a estrutura foi refeita do zero, com foco em **organização, simplicidade e fácil expansão**.

O repositório está sendo disponibilizado publicamente a pedido da comunidade.

---

## 🎯 Objetivo

Este projeto tem como objetivo:

- Servir como **base limpa** para bots
- Facilitar o aprendizado de quem está começando
- Oferecer uma estrutura organizada para:
  - conexão com WhatsApp
  - comandos
  - eventos
  - organização de arquivos

---

## ⚙️ Tecnologias Utilizadas

- Node.js  
- JavaScript  
- Baileys (WhatsApp Web API)  
- PM2 (opcional)

---

## 🚀 Instalação

```bash
git clone https://github.com/gaspardevs/bot-system-hub.git
cd bot-system-hub
```

dar 

```bash
node instalacao.js
```

e depois que baixar tudo e configurar o settings roda:

```bash
pm2 start index.js --name bot-system-hub
```

depois 

```bash
 npm start
```
---

## 📁 Estrutura do Projeto no github

```
bot-system-hub/
│─ system.js
│─ const.js
│─ conncts.js
│─ instalacao.js
│─ leia-me
│─ foto_menu.jpeg
│─ menu.js



```

---

## 📁 Estrutura do Projeto depois de tudo instalada 

```
bot-system-hub/
│─ system.js
│─ package.json
│─ package-lock.json
│─ const.js
│─ conncts.js
│─ instalacao.js
│─ leia-me
│─ node_modules
│─ bot-session
│─ settings/
│  ├─ config.json
│  ├─ message.json
|  ├─ reacao.json
|  ├─ config1
│  └─ ativacoes.json
│─ database/
|     ├─ fotomenu/
|     |  ├─foto_menu.jpeg
|     ├─ menus/
|     |  ├─menu.js
|     ├─ warns
|     ├─ config_gp.json

```

---

## ⚠️ Aviso Importante

Este projeto é **apenas uma base**.  
Não acompanha comandos prontos ou funcionalidades avançadas por padrão.

Você é livre para usar, modificar, adaptar, expandir e utilizar em projetos pessoais ou comerciais.

---

## 📜 Licença

Este projeto está licenciado sob a **Licença MIT**.  
Você pode usar, modificar e distribuir livremente, desde que mantenha o aviso de copyright.

Veja o arquivo `LICENSE` para mais detalhes.

---

## 👤 Autor

Criado por **gaspardevs**  
Base oficial do **Meliodas Bot (reformulada)**

---

## 🌐 Suporte

<div align="center">

| Plataforma | Link |
|---|---|
| 📢 Canal | [Bot-System-Hub](https://whatsapp.com/channel/0029VbBUJVj0gcfO9obTtN04) |

</div>
---
