require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const fs = require('fs');
const gachasData = require('./gachas.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// --- CONFIGURACIÓN ---
client.login(process.env.TOKEN);
const DATA_FILE = './usuarios.json';
const TIEMPO_TICKET = 7 * 60 * 1000; 
const ID_CANAL_TOP = '1500647578281312286'; 
const BANNER_URL = 'https://i.imgur.com/uvLzZ3P.png'; // <--- Puedes cambiar este link por un banner de la Papu Family

// --- BASE DE DATOS ---
let db = {};
function loadDB() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
    } catch (e) { db = {}; }
}
loadDB();

function saveDB() {
    try { fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 4)); } 
    catch (e) { console.error("Error guardando DB:", e); }
}

// --- UTILIDADES ---
const getNextLevelXP = (level) => Math.floor(100 * Math.pow(1.25, level - 1));

const getProgressBar = (current, total) => {
    const percentage = Math.min(Math.floor((current / total) * 10), 10);
    return "🟩".repeat(percentage) + "⬛".repeat(10 - percentage);
};

const updateTickets = (userId) => {
    const user = db[userId];
    if (user.tickets < 3) {
        const now = Date.now();
        const tiempoPasado = now - user.lastTicketUpdate;
        const nuevosTickets = Math.floor(tiempoPasado / TIEMPO_TICKET);
        if (nuevosTickets > 0) {
            user.tickets = Math.min(3, user.tickets + nuevosTickets);
            user.lastTicketUpdate = now - (tiempoPasado % TIEMPO_TICKET);
            saveDB();
        }
    }
};

const obtenerTopUsuarios = () => {
    return Object.entries(db)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.nivel - a.nivel || b.xp - a.xp)
        .slice(0, 10);
};

// --- ESTADO ---
client.once('ready', () => {
    console.log(`✅ Pixi Bot v2.5 - Edición Coleccionista lista`);
    client.user.setActivity('el Top Semanal 🏆', { type: ActivityType.Watching });
});

// --- COMANDOS ---
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;
    const content = message.content.trim().toLowerCase();

    if (!db[userId]) {
        db[userId] = { nivel: 1, xp: 0, tickets: 3, lastTicketUpdate: Date.now(), pokedex: [], warning: false, pity: 0 };
        saveDB();
    }

    const user = db[userId];
    updateTickets(userId);

    // --- COMANDO: ?TOP ---
    if (content === '?top') {
        const top10 = obtenerTopUsuarios();
        let rankingTxt = top10.map((u, i) => {
            const m = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🔹";
            return `${m} \`#${i + 1}\` <@${u.id}> - **Nivel ${u.nivel}**`;
        }).join('\n');

        const embedTop = new EmbedBuilder()
            .setColor('#f1c40f')
            .setAuthor({ name: 'RANKING EN TIEMPO REAL', iconURL: 'https://i.imgur.com/vHIn8m9.png' })
            .setThumbnail(message.author.displayAvatarURL())
            .setDescription(`📍 **Estado de la competencia:**\n\n${rankingTxt || "Sin datos"}`)
            .setFooter({ text: 'Usa "Arrow" para subir de nivel' });

        return message.reply({ embeds: [embedTop] });
    }

    // --- COMANDO: !PUBLICAR-TOP ---
    if (content === '!publicar-top') {
        if (!message.member.permissions.has('Administrator')) return;
        const canal = client.channels.cache.get(ID_CANAL_TOP);
        if (!canal) return message.reply("ID de canal inválido.");

        const top10 = obtenerTopUsuarios();
        const elRey = top10[0];
        
        let rankingTxt = top10.map((u, i) => {
            const m = i === 0 ? "👑" : i === 1 ? "⭐" : i === 2 ? "✨" : "🔸";
            return `${m} **${i + 1}.** <@${u.id}> • Nivel ${u.nivel}`;
        }).join('\n');

        // Intentar obtener el avatar del Rey para la miniatura
        let avatarRey = 'https://i.imgur.com/f1c40f.png'; 
        try { 
            const userKing = await client.users.fetch(elRey.id);
            avatarRey = userKing.displayAvatarURL();
        } catch(e) {}

        const embedSemanal = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🔥 ¡EL CUADRO DE HONOR DE LA SEMANA! 🔥')
            .setThumbnail(avatarRey)
            .setDescription(`Felicidades a los miembros más activos de la **Papu Family**:\n\n${rankingTxt}\n\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n🚀 **¿Quién será el mejor en la próxima semana?**\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`)
            .setImage(BANNER_URL)
            .setFooter({ text: 'Pixi Bot • Sistema de Temporadas' })
            .setTimestamp();
        
        await canal.send({ content: "🔔 **@everyone**", embeds: [embedSemanal] });
        return message.react('👑');
    }

    // --- COMANDO: ARROW ---
    if (content === 'arrow') {
        if (user.tickets <= 0) {
            if (user.warning) return message.react('🤣');
            user.warning = true; saveDB();
            const falta = TIEMPO_TICKET - (Date.now() - user.lastTicketUpdate);
            const mins = Math.floor(falta / 60000);
            const segs = Math.floor((falta % 60000) / 1000);

            const embedWait = new EmbedBuilder()
                .setColor('#ff4757')
                .setTitle('⏳ ¡Sin Tickets!')
                .setDescription(`Recuperarás uno en **${mins}m ${segs}s**.\n\n${getProgressBar(user.xp, getNextLevelXP(user.nivel))}`)
                .setFooter({ text: `Nivel actual: ${user.nivel}` });
            return message.reply({ embeds: [embedWait] });
        }

        user.warning = false;
        user.tickets--;
        user.pity++;
        if (user.tickets === 2) user.lastTicketUpdate = Date.now();

        const pesosTotales = Object.values(gachasData.rarezas).reduce((a, b) => a + b.prob, 0);
        let random = Math.random() * pesosTotales;
        if (user.pity >= 10) random *= 0.6;

        let rarezaFinal = "Comun";
        for (const [nombre, info] of Object.entries(gachasData.rarezas)) {
            if (random < info.prob) { rarezaFinal = nombre; break; }
            random -= info.prob;
        }

        if (["Epico", "Legendario", "Mitico", "UltraRaro"].includes(rarezaFinal)) user.pity = 0;

        const pool = gachasData.arros.filter(a => a.rareza === rarezaFinal);
        const gacha = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : gachasData.arros[0];

        if (!user.pokedex.includes(gacha.nombre)) user.pokedex.push(gacha.nombre);
        user.xp += gachasData.rarezas[rarezaFinal].xp;

        let levelUpStr = "";
        while (user.xp >= getNextLevelXP(user.nivel)) {
            user.xp -= getNextLevelXP(user.nivel);
            user.nivel++;
            levelUpStr = `\n\n⭐ **¡SUBISTE AL NIVEL ${user.nivel}!** ⭐`;
        }
        saveDB();

        const embedGacha = new EmbedBuilder()
            .setColor(gachasData.rarezas[rarezaFinal].color)
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setTitle(`✨ Invocaste a: ${gacha.nombre}`)
            .setDescription(`Rareza: **${rarezaFinal}**`)
            .addFields(
                { name: '🎫 Tickets', value: `${user.tickets}/3`, inline: true },
                { name: '📈 XP', value: `+${gachasData.rarezas[rarezaFinal].xp}${levelUpStr}`, inline: true },
                { name: '📜 Colección', value: `${user.pokedex.length} total`, inline: true }
            )
            .setImage(gacha.imagen);

        message.reply({ embeds: [embedGacha] });
    }

    // --- OTROS COMANDOS ---
    if (content === '?pokedex') {
        const embedDex = new EmbedBuilder()
            .setColor('#2c3e50')
            .setTitle(`📜 PokeDex de ${message.author.username}`)
            .setDescription(user.pokedex.length > 0 ? `**Has coleccionado:**\n${user.pokedex.map(n => `• ${n}`).join('\n')}` : '¡Tu PokeDex está vacía!');
        message.reply({ embeds: [embedDex] });
    }

    if (content === '?nivel') {
        const next = getNextLevelXP(user.nivel);
        const embedNivel = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle(`📊 Perfil de ${message.author.username}`)
            .addFields(
                { name: 'Nivel', value: `${user.nivel}`, inline: true },
                { name: 'XP', value: `${user.xp} / ${next}`, inline: true },
                { name: 'Progreso', value: `${getProgressBar(user.xp, next)}` }
            );
        message.reply({ embeds: [embedNivel] });
    }
});

client.login(process.env.TOKEN);