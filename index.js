const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const axios = require('axios');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const from = msg.key.remoteJid;

        if (text.startsWith('.ff ')) {
            const playerID = text.split(' ')[1];
            try {
                const res = await axios.get(`https://www.dark-yasiya-api.site/download/ff?id=${playerID}`);
                const data = res.data;

                if (data && data.status) {
                    const stats = `🎮 *FREE FIRE INFO*\n\n👤 *Name:* ${data.result.name}\n🆙 *Level:* ${data.result.level}\n🔥 *Rank:* ${data.result.rank}\n❤️ *Likes:* ${data.result.likes}\n🆔 *ID:* ${playerID}\n\n🤖 *Bot by itzlokaya*`;
                    await sock.sendMessage(from, { text: stats });
                } else {
                    await sock.sendMessage(from, { text: '❌ දත්ත හමු වුණේ නැහැ. ID එක හරිද බලන්න.' });
                }
            } catch (e) {
                await sock.sendMessage(from, { text: '⚠️ FF API සර්වර් එක දැනට වැඩ නැහැ. පසුව උත්සාහ කරන්න.' });
            }
        }
        
        if (text === '.owner') {
            await sock.sendMessage(from, { text: '👤 *Owner:* itzlokaya\n🌐 *GitHub:* github.com/itzlokaya' });
        }
        
        if (text === '.ping') {
            await sock.sendMessage(from, { text: '🚀 *Speed:* 1.2ms' });
        }

        if (text === '.menu') {
            const menu = `╭─── [ ᖴᖴ ᔕTᗩTᔕ ᗷOT ] ───╼\n│\n│ 🤖 *Status:* Online\n│ 🛠️ *Commands:*\n│ 📌 *.ff [ID]*\n│ 📌 *.ping*\n│ 📌 *.owner*\n│\n╰──────────────╼`;
            await sock.sendMessage(from, { text: menu });
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('Bot connected successfully!');
        }
    });
}
startBot();
