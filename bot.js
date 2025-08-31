const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('./config.json');

// Client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// ============ COMMANDES SLASH ============
const commands = [
    // Commande Ping
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('🏓 Affiche la latence du bot'),

    // Commande Avatar
    new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('🖼️ Affiche l\'avatar d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Utilisateur dont vous voulez voir l\'avatar')
                .setRequired(false)
        ),

    // Commande Random
    new SlashCommandBuilder()
        .setName('random')
        .setDescription('🎯 Génère un nombre aléatoire')
        .addIntegerOption(option =>
            option.setName('min')
                .setDescription('Nombre minimum (défaut: 1)')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('max')
                .setDescription('Nombre maximum (défaut: 100)')
                .setRequired(false)
        ),

    // Commande Poll (Sondage)
    new SlashCommandBuilder()
        .setName('poll')
        .setDescription('📊 Crée un sondage')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Question du sondage')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('option1')
                .setDescription('Première option')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('option2')
                .setDescription('Deuxième option')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('option3')
                .setDescription('Troisième option (optionnel)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('option4')
                .setDescription('Quatrième option (optionnel)')
                .setRequired(false)
        ),

    // Commande UserInfo
    new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('👤 Affiche les infos d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('Utilisateur à analyser')
                .setRequired(false)
        ),

    // Commande Clear (Modération)
    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('🧹 Supprime des messages')
        .addIntegerOption(option =>
            option.setName('nombre')
                .setDescription('Nombre de messages à supprimer (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        ),

    // Commande Flip (Pile ou Face)
    new SlashCommandBuilder()
        .setName('flip')
        .setDescription('🪙 Lance une pièce (pile ou face)'),

    // Commande Say
    new SlashCommandBuilder()
        .setName('say')
        .setDescription('💬 Fait dire quelque chose au bot')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message à faire dire')
                .setRequired(true)
        ),
        
    // NOUVELLE COMMANDE: Commande ServerInfo
    new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('📋 Affiche les informations sur le serveur')
];

// ============ ÉVÉNEMENTS ============
client.once('ready', () => {
    console.log('🎉 BOT CONNECTÉ AVEC SUCCÈS!');
    console.log(`✅ Connecté en tant que: ${client.user.tag}`);
    console.log(`🤖 ${commands.length} commandes chargées`);
    
    // Statut du bot
    client.user.setActivity(`/aide | ${client.guilds.cache.size} serveurs`, { type: 'WATCHING' });
});

// ============ GESTION DES COMMANDES ============
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;
    try {
        switch (commandName) {
            case 'ping':
                await handlePing(interaction);
                break;
            case 'avatar':
                await handleAvatar(interaction);
                break;
            case 'random':
                await handleRandom(interaction);
                break;
            case 'poll':
                await handlePoll(interaction);
                break;
            case 'userinfo':
                await handleUserInfo(interaction);
                break;
            case 'clear':
                await handleClear(interaction);
                break;
            case 'flip':
                await handleFlip(interaction);
                break;
            case 'say':
                await handleSay(interaction);
                break;
            // NOUVEAU CASE: Gère la nouvelle commande
            case 'serverinfo':
                await handleServerInfo(interaction);
                break;
            default:
                await interaction.reply('❌ Commande non reconnue!');
        }
    } catch (error) {
        console.error('Erreur commande:', error);
        const content = '❌ Une erreur est survenue!';
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content, ephemeral: true });
        } else {
            await interaction.reply({ content, ephemeral: true });
        }
    }
});

// ============ FONCTIONS DES COMMANDES ============
async function handlePing(interaction) {
    const sent = await interaction.reply({ content: '🏓 Pong!', fetchReply: true });
    const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
    
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🏓 Pong!')
        .addFields(
            { name: '📶 Latence', value: `${roundtripLatency}ms`, inline: true },
            { name: '💓 Heartbeat', value: `${Math.round(client.ws.ping)}ms`, inline: true }
        )
        .setTimestamp();
    
    await interaction.editReply({ content: '', embeds: [embed] });
}

async function handleAvatar(interaction) {
    const user = interaction.options.getUser('utilisateur') || interaction.user;
    
    const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle(`🖼️ Avatar de ${user.tag}`)
        .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setURL(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
}

async function handleRandom(interaction) {
    const min = interaction.options.getInteger('min') || 1;
    const max = interaction.options.getInteger('max') || 100;
    
    if (min >= max) {
        return interaction.reply('❌ Le minimum doit être inférieur au maximum!');
    }
    
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    
    const embed = new EmbedBuilder()
        .setColor('#feca57')
        .setTitle('🎯 Nombre Aléatoire')
        .addFields(
            { name: '🎲 Résultat', value: result.toString(), inline: true },
            { name: '📊 Plage', value: `${min} - ${max}`, inline: true }
        )
        .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
}

async function handlePoll(interaction) {
    const question = interaction.options.getString('question');
    const option1 = interaction.options.getString('option1');
    const option2 = interaction.options.getString('option2');
    const option3 = interaction.options.getString('option3');
    const option4 = interaction.options.getString('option4');
    
    let options = [option1, option2];
    if (option3) options.push(option3);
    if (option4) options.push(option4);
    
    const reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
    
    let description = '';
    options.forEach((option, index) => {
        description += `${reactions[index]} ${option}\n`;
    });
    
    const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle('📊 Sondage')
        .addFields(
            { name: '❓ Question', value: question },
            { name: '📋 Options', value: description }
        )
        .setFooter({ text: 'Réagissez avec les émojis pour voter!' })
        .setTimestamp();
    
    const message = await interaction.reply({ embeds: [embed], fetchReply: true });
    
    for (let i = 0; i < options.length; i++) {
        await message.react(reactions[i]);
    }
}

async function handleUserInfo(interaction) {
    const user = interaction.options.getUser('utilisateur') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    
    const embed = new EmbedBuilder()
        .setColor('#e67e22')
        .setTitle(`👤 Profil de ${user.tag}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: '🆔 ID', value: user.id, inline: true },
            { name: '📅 Compte créé', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
            { name: '🤖 Bot', value: user.bot ? 'Oui' : 'Non', inline: true }
        );
    
    if (member) {
        embed.addFields(
            { name: '📥 Rejoint le serveur', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
            { name: '🏷️ Surnom', value: member.nickname || 'Aucun', inline: true },
            { name: '🎭 Rôles', value: member.roles.cache.filter(r => r.name !== '@everyone').map(r => r.toString()).join(', ') || 'Aucun', inline: false }
        );
    }
    
    await interaction.reply({ embeds: [embed] });
}

async function handleClear(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return interaction.reply({ content: '❌ Tu n\'as pas la permission de gérer les messages!', ephemeral: true });
    }
    
    const amount = interaction.options.getInteger('nombre');
    
    try {
        await interaction.channel.bulkDelete(amount, true);
        await interaction.reply({ content: `✅ ${amount} message(s) supprimé(s)!`, ephemeral: true });
    } catch (error) {
        await interaction.reply({ content: '❌ Impossible de supprimer les messages (trop anciens?)', ephemeral: true });
    }
}

async function handleFlip(interaction) {
    const results = ['🪙 **PILE**', '🪙 **FACE**'];
    const result = results[Math.floor(Math.random() * results.length)];
    
    const embed = new EmbedBuilder()
        .setColor('#f1c40f')
        .setTitle('🪙 Pile ou Face')
        .setDescription(`Résultat: ${result}`)
        .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
}

async function handleSay(interaction) {
    const message = interaction.options.getString('message');
    
    await interaction.channel.send(message);
    await interaction.reply({ content: '✅ Message envoyé!', ephemeral: true });
}

// NOUVELLE FONCTION: Gère la commande ServerInfo
async function handleServerInfo(interaction) {
    const guild = interaction.guild;
    const guildIcon = guild.iconURL({ dynamic: true, size: 1024 });

    const embed = new EmbedBuilder()
        .setColor('#fb0000ff') // Une couleur verte pour un aspect positif
        .setTitle('Skill | DEATHMATCH | DAYZ')
        .setDescription('Serveur Deathmatch DayZ')
        .setThumbnail(guildIcon)
        .addFields(
            { name: 'Créateur', value: 'Skill The Goat', inline: true },
            { name: 'Jeu', value: 'DayZ', inline: true },
            { name: 'Plateforme', value: 'PC', inline: true },
            { name: 'Comment se connecter', value: '<#1400822445920878682>', inline: false },
            { name: 'Statut du serveur', value: '<#1400822268137050132>', inline: false },
            { name: 'Besoin d\'aide', value: '<#1400822569266970736>', inline: false }
        )
        .setFooter({ text: 'Skill' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

// ============ DÉPLOIEMENT DES COMMANDES ============
async function deployCommands() {
    const rest = new REST({ version: '10' }).setToken(config.token);
    
    try {
        console.log('🔄 Déploiement des commandes slash...');
        console.log(`📝 ${commands.length} commandes à déployer`);
        
        // Convertir les commandes en JSON pour l'API
        const commandsJson = commands.map(command => command.toJSON());
        
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commandsJson }
        );
        
        console.log(`✅ ${commands.length} commandes déployées avec succès!`);
        
        // Vérifier les commandes déployées
        const deployedCommands = await rest.get(
            Routes.applicationGuildCommands(config.clientId, config.guildId)
        );
        console.log(`📋 ${deployedCommands.length} commandes actives sur le serveur`);
        
    } catch (error) {
        console.error('❌ Erreur détaillée du déploiement:');
        console.error('Code:', error.code);
        console.error('Message:', error.message);
        if (error.code === 50001) {
            console.error('💡 Solution: Assure-toi que le bot a été invité sur le serveur avec les permissions "applications.commands"');
        }
    }
}

// ============ DÉMARRAGE ============
async function startBot() {
    try {
        await deployCommands();
        await client.login(config.token);
    } catch (error) {
        console.error('❌ Erreur démarrage:', error);
    }
}

startBot();
