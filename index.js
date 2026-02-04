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

  sock.ev.on(
