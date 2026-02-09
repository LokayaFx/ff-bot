const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGINT: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// QR එක අවශ්‍ය නැති නිසා console එකේ පමණක් පෙන්වයි
client.on('qr', (qr) => {
    console.log('QR එක ලැබී ඇත, නමුත් අපි Pairing Code එක භාවිතා කරමු...');
});

client.on('ready', () => {
    console.log('Free Fire Stats Bot එක සාර්ථකව සම්බන්ධ වුණා!');
});

// Bot Logic (Free Fire Stats)
client.on('message', async (msg) => {
    const text = msg.body.toLowerCase();

    if (text.startsWith('.ff ')) {
        const playerID = text.split(' ')[1];
        if (!playerID) return msg.reply('කරුණාකර Player ID එක ලබා දෙන්න. උදා: .ff 123456789');

        try {
            const response = await axios.get(`https://free-fire-api-six.vercel.app/api/v1/info?id=${playerID}`);
            const data = response.data;

            if (data && data.name) {
                const stats = `
🎮 *FREE FIRE PLAYER INFO* 🎮

👤 *Name:* ${data.name}
🆔 *ID:* ${data.id}
🆙 *Level:* ${data.level}
🔥 *Rank:* ${data.rank}
❤️ *Likes:* ${data.likes}
🌍 *Region:* ${data.region}

*Bot Powered by Gemini*`;
                msg.reply(stats);
            } else {
                msg.reply('කනගාටුයි, එම ID එකට අදාළ දත්ත හමු වුණේ නැහැ.');
            }
        } catch (error) {
            msg.reply('දත්ත ලබා ගැනීමේදී දෝෂයක් ඇති වුණා. පසුව උත්සාහ කරන්න.');
        }
    }
});

client.initialize();

// Pairing Code ලබා ගැනීම සඳහා (ඔයාගේ අංකය ඇතුළත් කර ඇත)
setTimeout(async () => {
    try {
        const code = await client.requestPairingCode('94756553076'); 
        console.log('******************************************');
        console.log('ඔයාගේ Pairing Code එක: ', code);
        console.log('******************************************');
    } catch (err) {
        console.error('Pairing Code එක ලබා ගැනීමට නොහැකි වුණා:', err);
    }
}, 5000);
