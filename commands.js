const fetch = require("node-fetch");

const config = require("./config.json");
const utils = require("./utils");

const commands = new Map();

class Command {
	constructor(name, command) {
		this.name = name;
		this.description = command.description;
		this.execute = command.execute;
		commands.set(name, this);
	};
};

new Command("help", {
	description: "Donne une liste de toutes les commandes disponibles",
	execute: args => {
		let { message, bot } = args;

		let embed = utils.defaultEmbed(message, bot);

		commands.forEach((value, key) => {
			embed.addField(`${config.prefix}${key}`, `${value.description}`);
		});

		message.reply(embed);
	}
});

new Command("hey", {
	description: "Dire bonjour au bot",
	execute: args => {
		let { message } = args;
		message.embed(`${utils.randomItem("hey", "Salut", "Yo")} ${message.author} ${utils.randomItem(":3", ":)", "!")}`);
	}
});

new Command("vrai ou faux", {
	description: "Réponds \"vrai\" ou \"faux\" aléatoirement",
	execute: args => {
		let { message, messageContent, bot } = args;
		message.embed(`${messageContent && `${message.author}\n${messageContent}\n${bot.user}\n`}${utils.randomItem("vrai !", "faux !")}`)
	}
});

new Command("taux", {
	description: "Donne un taux aléatoire de quelque chose",
	execute: args => {
		let { message, messageContent, bot } = args;
		message.embed(`${messageContent && `${message.author}\n${messageContent}\n${bot.user}\n`}${utils.randomPercentage()}%`);
	}
});

new Command("hug", {
	description: "Hug somebody",
	execute: args => {
		let { message } = args;
		let mentions = message.mentions.users.array();
		if (mentions.length === 0) mentions = [message.author];
		fetch("https://nekos.life/api/hug")
			.then(res => res.json())
			.then(data => {
				console.log(data);
				message.customEmbed(embed => embed
					.setDescription(`${message.author} hugs ${mentions.length === 1 ? "herself/himself" : `${mentions.map((user, i) => (i === 0) ? `${user}` : `, ${user}`).join("")}`}`)
					.setImage(data.url)
				)
			});

	}
});

new Command("pdp", {
	description: "Obtenir la photo de profil d'un membre du serveur",
	execute: args => {
		let { message } = args;
		let mentions = message.mentions.users.array();
		if (mentions.length === 0) mentions = [message.author];
		message.embed(`Voici ${(mentions.length === 1) ? "la photo de profil" : "les photos de profil"} de ${mentions.map((user, i) => (i === 0) ? `${user}` : `, ${user}`).join("")}`, mentions.map(user => user.displayAvatarURL()));
	}
});

new Command("code", {
	description: "Voire le code du bot (github)",
	execute: args => {
		let { message } = args;
		message.customEmbed(embed => {
			embed.setDescription(`Voici le lien pour voir le code qui me fait fonctionner ${utils.randomItem(":3", ":)", "!")}`);
			embed.setTitle("voir le code");
			embed.setURL(require("./package.json").repository.url);
			return embed;
		});
	}
});

new Command("invite", {
	description: "Génére un lien pour inviter le bot dans un de vos serveur",
	execute: args => {
		let { message, bot } = args;
		bot.generateInvite({ permissions: "ADMINISTRATOR" })
			.then(link => message.customEmbed((embed) =>
				embed
					.setDescription(`Voici un lien pour m'inviter dans votre serveur`)
					.setTitle("inviter")
					.setURL(link)
			))

	}
});

//new Command("music")

/*

new Command("testmodify", {
	description: "la flemme vous connaissez ?",
	execute: args => {
		let { message } = args;

		message.customEmbed(embed => {
			embed.setDescription(`hey je vais changer dans 5 secondes`);
			return embed;
		}, (message, embed) => {
			setTimeout(() => {
				embed.setDescription(`ça y est`);
				message.edit(embed);
			}, 5000);
		});
	}
});

new Command("detectreaction", {
	description: "lorsque la reaction est ajoutée le message change",
	execute: args => {
		let { message } = args;

		message.customEmbed(embed => {
			embed.setDescription(`reagi avec :white_check_mark: et je changerai :)`);
			return embed;
		}, (sent, embed, requirer) => {
			sent.awaitReactions((reaction, user) => ["✅"].includes(reaction.emoji.name) && user.id === requirer.id, { max: 1, time: 30000, errors: ["time"] })
				.then(collected => {
					let reaction = collected.first();
					if (reaction.emoji.name === "✅") {
						embed.setDescription(`tu as ajouté la reaction :)`);
						sent.edit(embed);
					};
				}).catch(() => {
					embed.setDescription(`Delai maximum de réaction dépassé (30s)`);
					sent.edit(embed);
				});
		});
	}
});

*/

module.exports.listen = (message, bot) => {
	let content = message.content;

	let commandName;
	commands.forEach((value, key) => {
		if (content.match(new RegExp(`^${config.prefix}${key}`, "g"))) commandName = key;
	});

	if (content.match(new RegExp(`^${config.prefix}`, "g"))) {
		if (commandName && commands.has(commandName)) commands.get(commandName).execute({
			message,
			messageContent: message.content.replace(new RegExp(`^${config.prefix}${commandName}`, "g"), ""),
			bot
		}); else message.react("❔");
	};

	/*if (text.match(new RegExp(`^${config.prefix}`, "g")).length === 1) { // the second on is useful if the prefix is also used to make discord message formatting. eg: __hello__ -> underline 
		text = text.replace(config.prefix, "");
	
		let splited = text.split(" ");
		let cmd = splited.shift();
	
		if (commands.has(cmd) === true) {
			commands.get(cmd).execute({
				message: message,
				content: text.replace(`${config.prefix}${cmd}`),
				bot: bot
			});
		} else {
			message.react("❔");
		};
	};*/
};