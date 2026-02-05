// index.js - Bot WhatsApp listo para Railway

const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const fs = require('fs')
const comandos = require('./comandos')

// Lista blanca de números permitidos
const listaBlanca = [
  '5219999999999@s.whatsapp.net', // Reemplaza con tus números
  '5218888888888@s.whatsapp.net'
]

async function iniciarBot() {
  // Autenticación
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  })

  sock.ev.on('creds.update', saveCreds)

  // -----------------------------
  // Bienvenida automática
  // -----------------------------
  sock.ev.on('group-participants.update', async (update) => {
    const { id: chatId, participants, action } = update
    if (action === 'add') {
      for (const user of participants) {
        await sock.sendMessage(chatId, {
          text: `👋 ¡Hola @${user.split('@')[0]}! Bienvenido al grupo.\nUsa .menu para ver los comandos y .reglas para leer las reglas.`,
          mentions: [user]
        })
      }
    }
  })

  // -----------------------------
  // Manejo de comandos
  // -----------------------------
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const texto = msg.message.conversation || msg.message.extendedTextMessage?.text
    if (!texto) return

    const comando = texto.toLowerCase().trim()
    const chatId = msg.key.remoteJid
    const autor = msg.key.participant

    if (!comandos[comando]) return

    // -----------------------------
    // Verificar admin o lista blanca
    // -----------------------------
    if (chatId.endsWith('@g.us')) {
      const metadata = await sock.groupMetadata(chatId)
      const admins = metadata.participants
        .filter(p => p.admin)
        .map(p => p.id)

      if (!admins.includes(autor) && !listaBlanca.includes(autor)) return
    }

    // -----------------------------
    // Leer texto desde archivo si existe
    // -----------------------------
    const archivo = `textos/${comando.slice(1)}.txt` // .avisos → textos/avisos.txt
    let textoAEnviar = comandos[comando] // fallback
    try {
      textoAEnviar = fs.readFileSync(archivo, 'utf8')
    } catch {}

    // -----------------------------
    // Delay anti-baneo
    // -----------------------------
    await new Promise(r => setTimeout(r, 1500))

    // -----------------------------
    // Enviar mensaje
    // -----------------------------
    await sock.sendMessage(chatId, { text: textoAEnviar })
  })
}

// Iniciar bot
iniciarBot()
