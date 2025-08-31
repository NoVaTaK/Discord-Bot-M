console.log('🚀 Démarrage du bot simple...');

const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
    console.log('🎉 BOT CONNECTÉ AVEC SUCCÈS!');
    console.log(`✅ Connecté en tant que: ${client.user.tag}`);
});

client.login(config.token);