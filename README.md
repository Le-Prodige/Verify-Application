# Discord Verification Bot

**Description**
Discord Verification Bot est un bot Discord personnalisable conçu pour automatiser le processus de vérification des nouveaux membres sur un serveur Discord. 
Il garantit que les nouveaux utilisateurs doivent réagir à un message spécifique pour obtenir un rôle de vérification et accéder au reste du serveur. 
Ce bot permet également de gérer les utilisateurs qui échouent à se vérifier en les rappelant, en limitant le nombre de tentatives de vérification et en les expulsant après plusieurs échecs.

**Fonctionnalités principales :**
💬 Ghost ping : Mention automatique des nouveaux membres sans les notifier, suivi d’un message privé expliquant comment se vérifier.
✅ Vérification par réaction : Les membres doivent réagir à un message avec un emoji spécifique pour être vérifiés.
🔐 Gestion des rôles : Attribution automatique d’un rôle de vérification après réaction avec l’emoji correct.
⏳ Délai de vérification : Si un membre ne réagit pas dans un délai imparti (5 minutes par défaut), un rappel est envoyé.
⚠️ Limitation des tentatives : Si un membre échoue plusieurs fois à se vérifier, il est automatiquement expulsé du serveur.
📜 Journalisation complète : Toutes les tentatives de vérification (réussites et échecs) sont enregistrées dans un fichier pour un suivi ultérieur.

**Comment ça fonctionne**
Lorsqu'un nouveau membre rejoint le serveur, le bot l'identifie et lui envoie un "ghost ping" (mention qui est automatiquement supprimée).
Le bot envoie également un message privé au nouveau membre avec des instructions pour se vérifier.
Le membre doit réagir avec un emoji spécifique (comme ✅) sur un message de vérification déjà présent dans un canal défini.
Si le membre réagit correctement dans le délai imparti (5 minutes par défaut), il se voit attribuer un rôle de vérification, ce qui lui donne accès à tout le serveur.
Si le membre échoue à réagir ou à se vérifier après plusieurs tentatives, il est expulsé du serveur.
Toutes les vérifications, réussies ou échouées, sont enregistrées dans un fichier texte pour que les administrateurs puissent les consulter.

# Installation

**Prérequis**
Node.js v16.6 ou supérieur.
Un token de bot Discord que vous pouvez obtenir en créant une application dans le portail des développeurs Discord.
Étapes d'installation
Cloner le projet :

```git clone https://github.com/votre-utilisateur/discord-verification-bot.git ```
```cd discord-verification-bot```

Installer les dépendances : Assurez-vous d'avoir Node.js installé, puis exécutez :

```Copier le code```
```npm install```


Configurer le bot : Créez un fichier .env à la racine du projet pour stocker votre token Discord :

```TOKEN=ton_token_discord```
Lancer le bot : Démarrez le bot avec la commande suivante :

```node index.js```

# Configuration

verificationChannelId : ID du canal où le message de vérification est affiché.
verificationRoleId : ID du rôle à attribuer une fois la vérification réussie.
verificationMessageId : ID du message sur lequel les nouveaux membres doivent réagir.
verificationEmoji : Emoji utilisé pour la vérification (ex : ✅).
logsChannelId : ID du canal où les logs (succès/échecs) sont envoyés.
exemptRoles : Liste des rôles qui sont exemptés du processus de vérification (comme les administrateurs et modérateurs).
maxVerificationAttempts : Nombre maximum de tentatives de vérification avant expulsion.

**Exemple de configuration du fichier .env**

```TOKEN=ton_token_discord```

