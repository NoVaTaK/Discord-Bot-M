console.log('🔧 Démarrage du bot de debug...');

const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');

// Vérification du config
try {
    const config = require('./config.json');
    console.log('✅ Config chargé');
    console.log('🔑 Token présent:', config.token ? 'Oui' : 'Non');
    console.log('🆔 Client ID présent:', config.clientId ? 'Oui' : 'Non');
    console.log('🏠 Guild ID présent:', config.guildId ? 'Oui' : 'Non');
} catch (error) {
    console.log('❌ Erreur config:', error.message);
    process.exit(1);
}

const config = require('./config.json');

// Client simple
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// Commande de test simple
const commands = [
    new SlashCommandBuilder()
        .setName('test')
        .setDescription('🧪 Commande de test simple')
];

client.once('ready', () => {
    console.log('🎉 BOT CONNECTÉ!');
    console.log(`✅ Tag: ${client.user.tag}`);
    console.log(`🆔 ID: ${client.user.id}`);
    console.log(`🏠 Serveurs: ${client.guilds.cache.size}`);
    
    // Liste les serveurs
    client.guilds.cache.forEach(guild => {
        console.log(`📍 Serveur: "${guild.name}" (ID: ${guild.id})`);
    });
});

// Gestion des commandes
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    
    console.log(`🎯 Commande reçue: ${interaction.commandName} par ${interaction.user.tag}`);
    
    if (interaction.commandName === 'test') {
        await interaction.reply('✅ **Test réussi!** Le bot fonctionne parfaitement! 🎉');
        console.log('✅ Commande test exécutée avec succès');
    }
});

// Erreurs
client.on('error', (error) => {
    console.log('❌ Erreur client:', error.message);
});

process.on('unhandledRejection', (error) => {
    console.log('❌ Erreur non gérée:', error.message);
});

// Déploiement des commandes
async function deployCommands() {
    const rest = new REST({ version: '10' }).setToken(config.token);
    
    try {
        console.log('🔄 Déploiement de la commande test...');
        
        // Déploie sur le serveur spécifique
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands }
        );
        
        console.log('✅ Commande /test déployée!');
        
        // Vérification
        const guildCommands = await rest.get(
            Routes.applicationGuildCommands(config.clientId, config.guildId)
        );
        console.log(`📋 ${guildCommands.length} commande(s) active(s) sur le serveur`);
        
    } catch (error) {
        console.log('❌ Erreur déploiement:', error.message);
        if (error.code === 50001) {
            console.log('💡 Le bot n\'a pas accès à ce serveur!');
        }
    }
}

async function start() {
    try {
        await deployCommands();
        console.log('🔄 Connexion du bot...');
        await client.login(config.token);
    } catch (error) {
        console.log('❌ Erreur de démarrage:', error.message);
    }
}

start();