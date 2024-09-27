const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs'); // Pour journaliser dans un fichier
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// ID du canal de vérification et de la réaction (personnalisable)
const verificationChannelId = '1289345965681152029'; // ID de votre salon de vérification
const verificationRoleId = '1289347212672761896'; // ID de votre Rôle Vérification
const verificationMessageId = '1289347485688533114'; // ID de votre Message pour la vérification
const verificationEmoji = '✅'; // Emoji que le membre doit utiliser pour réagir
const logsChannelId = '1289349311464869993'; // ID du canal pour les logs
const exemptRoles = ['1289350873876533401', '1289350938053836850']; // ID des rôles Administrateur et Modérateur
const maxVerificationAttempts = 3; // Nombre maximal de tentatives de vérification avant éjection/bannissement
const failedVerifications = {};

// Système de journalisation des vérifications
const logVerification = (message) => {
    const logMessage = `[${new Date().toLocaleString()}] ${message}\n`;
    fs.appendFileSync('verification_logs.txt', logMessage, (err) => {
        if (err) console.error('Erreur lors de la journalisation :', err);
    });
};

// Fonction pour envoyer un message privé dynamique
const sendPrivateMessage = async (member) => {
    const welcomeMessage = `
        Salut ${member.displayName} ! 🎉
        Bienvenue sur notre serveur. Pour finaliser ton inscription, merci de réagir avec ${verificationEmoji} sur le message de vérification dans le salon.
        Si tu ne réagis pas dans les 5 minutes, tu recevras un rappel.
    `;
    try {
        await member.send(welcomeMessage);
    } catch (error) {
        console.error(`Erreur lors de l'envoi du message privé à ${member.displayName}:`, error);
    }
};

// Quand le bot est prêt
client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}!`);
});

// Événement : Nouveau membre rejoint le serveur
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.get(verificationChannelId);
    if (!channel) return;

    // Vérification si l'utilisateur a déjà été vérifié
    if (member.roles.cache.has(verificationRoleId)) {
        console.log(`${member.displayName} a déjà été vérifié.`);
        return;
    }

    // Si l'utilisateur a un rôle exempté, il n'a pas besoin d'être vérifié
    const hasExemptRole = member.roles.cache.some(role => exemptRoles.includes(role.id));
    if (hasExemptRole) {
        console.log(`${member.displayName} est exempté de la vérification.`);
        return;
    }

    try {
        // Ghost ping - Mentionner l'utilisateur puis supprimer le message
        const ghostPingMessage = await channel.send(`${member}`);
        await ghostPingMessage.delete();

        // Envoyer un message privé de bienvenue
        await sendPrivateMessage(member);

        // Attente de la réaction dans un délai de 5 minutes
        const verificationMessage = await channel.messages.fetch(verificationMessageId);
        const filter = (reaction, user) => reaction.emoji.name === verificationEmoji && user.id === member.id;

        const reactions = await verificationMessage.awaitReactions({ filter, max: 1, time: 300000, errors: ['time'] });

        if (reactions.size > 0) {
            const role = member.guild.roles.cache.get(verificationRoleId);
            if (role) {
                await member.roles.add(role);
                await member.send('Merci, tu es maintenant vérifié ! 🎉');
                logVerification(`${member.displayName} a été vérifié avec succès.`);
            }
        }

    } catch (error) {
        if (error.message === 'time') {
            // Enregistrer l'échec de la tentative de vérification
            if (!failedVerifications[member.id]) {
                failedVerifications[member.id] = 1;
            } else {
                failedVerifications[member.id] += 1;
            }

            // Vérifier si le nombre maximal de tentatives est atteint
            if (failedVerifications[member.id] >= maxVerificationAttempts) {
                await member.send('Tu as échoué à te vérifier après plusieurs tentatives. Tu es maintenant expulsé du serveur.');
                logVerification(`${member.displayName} a été expulsé après ${maxVerificationAttempts} échecs de vérification.`);
                await member.kick('Échec de la vérification.');
            } else {
                // Si l'utilisateur n'a pas réagi dans les 5 minutes, envoyer un rappel
                await member.send(`Tu n'as pas réagi dans le temps imparti. Réagis avec ${verificationEmoji} pour compléter la vérification.`);
                logVerification(`${member.displayName} a échoué à se vérifier. Tentative ${failedVerifications[member.id]}.`);
            }
        } else {
            console.error('Erreur lors de l\'envoi du ghost ping ou de la vérification:', error);
        }
    }
});

// Événement : Réaction ajoutée à un message
client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.id === verificationMessageId && reaction.emoji.name === verificationEmoji) {
        const guild = reaction.message.guild;
        const member = guild.members.cache.get(user.id);

        if (member) {
            const role = guild.roles.cache.get(verificationRoleId);
            if (role && !member.roles.cache.has(verificationRoleId)) { // Vérifie si le membre n'a pas déjà le rôle
                try {
                    await member.roles.add(role);
                    await member.send('Tu as été vérifié et tu as maintenant accès à tout le serveur ! 🎉');
                    logVerification(`${user.tag} a été vérifié avec succès.`);
                    failedVerifications[member.id] = 0; // Réinitialiser les tentatives échouées en cas de succès
                } catch (error) {
                    console.error('Erreur lors de l\'ajout du rôle de vérification:', error);
                }
            } else {
                await member.send('Tu es déjà vérifié.');
            }
        }
    }
});

// Se connecter à Discord avec le token du bot
client.login(process.env.TOKEN);
