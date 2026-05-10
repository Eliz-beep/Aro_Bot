require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActivityType
} = require('discord.js');

const fs = require('fs');
const gachasData = require('./gachas.js');

// =========================
// CONFIG
// =========================

const TOKEN = process.env.TOKEN;

if (!TOKEN) {
    console.log("❌ TOKEN no encontrado en .env");
    process.exit(1);
}

const DATA_FILE = './usuarios.json';
const TIEMPO_TICKET = 7 * 60 * 1000;
const ID_CANAL_TOP = '1500647578281312286';
const BANNER_URL = 'https://i.imgur.com/uvLzZ3P.png';

// =========================
// CLIENTE
// =========================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// =========================
// BASE DE DATOS
// =========================

let db = {};

function loadDB() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
    } catch (err) {
        console.log("❌ Error cargando DB:", err);
        db = {};
    }
}

function saveDB() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 4));
    } catch (err) {
        console.log("❌ Error guardando DB:", err);
    }
}

loadDB();

// =========================
// UTILIDADES
// =========================

const cooldowns = new Set();

function getNextLevelXP(level) {
    return Math.floor(100 * Math.pow(1.25, level - 1));
}

function getProgressBar(current, total) {
    const percentage = Math.min(
        Math.floor((current / total) * 10),
        10
    );

    return "🟩".repeat(percentage) + "⬛".repeat(10 - percentage);
}

function updateTickets(userId) {
    const user = db[userId];

    if (user.tickets < 3) {
        const now = Date.now();
        const tiempoPasado = now - user.lastTicketUpdate;

        const nuevosTickets = Math.floor(
            tiempoPasado / TIEMPO_TICKET
        );

        if (nuevosTickets > 0) {
            user.tickets = Math.min(
                3,
                user.tickets + nuevosTickets
            );

            user.lastTicketUpdate =
                now - (tiempoPasado % TIEMPO_TICKET);

            saveDB();
        }
    }
}

function obtenerTopUsuarios() {
    return Object.entries(db)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.nivel - a.nivel || b.xp - a.xp)
        .slice(0, 10);
}

// =========================
// READY
// =========================

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} conectado`);
    console.log(`🆔 BOT ID: ${client.user.id}`);

    client.user.setActivity(
        'el Top Semanal 🏆',
        { type: ActivityType.Watching }
    );
});

// =========================
// MENSAJES
// =========================

client.on('messageCreate', async (message) => {

    if (message.author.bot) return;

    const userId = message.author.id;
    const content = message.content.trim().toLowerCase();

    // =========================
    // ANTI DUPLICADOS
    // =========================

    const cooldownKey = `${userId}-${content}`;

    if (cooldowns.has(cooldownKey)) return;

    cooldowns.add(cooldownKey);

    setTimeout(() => {
        cooldowns.delete(cooldownKey);
    }, 1500);

    // =========================
    // CREAR USUARIO
    // =========================

    if (!db[userId]) {
        db[userId] = {
            nivel: 1,
            xp: 0,
            tickets: 3,
            lastTicketUpdate: Date.now(),
            pokedex: [],
            warning: false,
            pity: 0
        };

        saveDB();
    }

    const user = db[userId];

    updateTickets(userId);

    // =========================
    // ?TOP
    // =========================

    if (content === '?top') {

        const top10 = obtenerTopUsuarios();

        const rankingTxt = top10.map((u, i) => {

            const medal =
                i === 0 ? "🥇" :
                i === 1 ? "🥈" :
                i === 2 ? "🥉" :
                "🔹";

            return `${medal} \`#${i + 1}\` <@${u.id}> - Nivel ${u.nivel}`;

        }).join('\n');

        const embed = new EmbedBuilder()
            .setColor('#f1c40f')
            .setTitle('🏆 Ranking Global')
            .setDescription(rankingTxt || "Sin datos")
            .setFooter({
                text: 'Pixi Bot'
            });

        return message.reply({
            embeds: [embed]
        });
    }

    // =========================
    // ARROW
    // =========================

    if (content === 'arrow') {

        if (user.tickets <= 0) {

            const falta =
                TIEMPO_TICKET -
                (Date.now() - user.lastTicketUpdate);

            const mins = Math.floor(falta / 60000);
            const segs = Math.floor((falta % 60000) / 1000);

            const embed = new EmbedBuilder()
                .setColor('#ff4757')
                .setTitle('⏳ Sin Tickets')
                .setDescription(
                    `Vuelve en ${mins}m ${segs}s`
                );

            return message.reply({
                embeds: [embed]
            });
        }

        // =========================
        // GACHA
        // =========================

        user.tickets--;
        user.pity++;

        if (user.tickets === 2) {
            user.lastTicketUpdate = Date.now();
        }

        const pesosTotales =
            Object.values(gachasData.rarezas)
            .reduce((a, b) => a + b.prob, 0);

        let random = Math.random() * pesosTotales;

        if (user.pity >= 10) {
            random *= 0.6;
        }

        let rarezaFinal = "Comun";

        for (const [nombre, info] of Object.entries(gachasData.rarezas)) {

            if (random < info.prob) {
                rarezaFinal = nombre;
                break;
            }

            random -= info.prob;
        }

        if (
            ["Epico", "Legendario", "Mitico", "UltraRaro"]
            .includes(rarezaFinal)
        ) {
            user.pity = 0;
        }

        const pool = gachasData.arros.filter(
            a => a.rareza === rarezaFinal
        );

        const gacha =
            pool[Math.floor(Math.random() * pool.length)];

        if (!user.pokedex.includes(gacha.nombre)) {
            user.pokedex.push(gacha.nombre);
        }

        user.xp += gachasData.rarezas[rarezaFinal].xp;

        let levelUpStr = "";

        while (user.xp >= getNextLevelXP(user.nivel)) {

            user.xp -= getNextLevelXP(user.nivel);
            user.nivel++;

            levelUpStr =
                `\n\n⭐ ¡Subiste al nivel ${user.nivel}!`;
        }

        saveDB();

        const embed = new EmbedBuilder()
            .setColor(gachasData.rarezas[rarezaFinal].color)
            .setTitle(`✨ ${gacha.nombre}`)
            .setDescription(`Rareza: **${rarezaFinal}**`)
            .addFields(
                {
                    name: '🎫 Tickets',
                    value: `${user.tickets}/3`,
                    inline: true
                },
                {
                    name: '📈 XP',
                    value: `+${gachasData.rarezas[rarezaFinal].xp}`,
                    inline: true
                },
                {
                    name: '📜 Colección',
                    value: `${user.pokedex.length}`,
                    inline: true
                }
            )
            .setImage(gacha.imagen)
            .setFooter({
                text: levelUpStr || "Pixi Bot"
            });

        return message.reply({
            embeds: [embed]
        });
    }

    // =========================
    // ?POKEDEX
    // =========================

    if (content === '?pokedex') {

        const embed = new EmbedBuilder()
            .setColor('#2c3e50')
            .setTitle(`📜 ${message.author.username}`)
            .setDescription(
                user.pokedex.length > 0
                    ? user.pokedex.map(n => `• ${n}`).join('\n')
                    : 'Vacío'
            );

        return message.reply({
            embeds: [embed]
        });
    }

    // =========================
    // ?NIVEL
    // =========================

    if (content === '?nivel') {

        const next = getNextLevelXP(user.nivel);

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle(`📊 ${message.author.username}`)
            .addFields(
                {
                    name: 'Nivel',
                    value: `${user.nivel}`,
                    inline: true
                },
                {
                    name: 'XP',
                    value: `${user.xp}/${next}`,
                    inline: true
                },
                {
                    name: 'Progreso',
                    value: getProgressBar(user.xp, next)
                }
            );

        return message.reply({
            embeds: [embed]
        });
    }
});

// =========================
// LOGIN
// =========================

client.login(TOKEN);