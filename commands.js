const config = require("./config.json");

const utils = require("./utils");

const commands = new Map();

commands.set("help", {
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

commands.set("hey", {
	description: "Dire bonjour au bot",
	execute: args => {
		let { message } = args;
		message.embed(`${utils.randomItem("hey", "Salut", "Yo")} ${message.author} ${utils.randomItem(":3", ":)", "!")}`);
	}
});

commands.set("vraioufaux", {
	description: "Réponds \"vrai\" ou \"faux\" aléatoirement",
	execute: args => {
		let { message, cmdArgs, bot } = args;
		message.embed(`${cmdArgs.length !== 0 ? `${message.author}\n${cmdArgs.join(" ")}\n${bot.user}\n` : ""}${utils.randomItem("vrai !", "faux !")}`)
	}
});

commands.set("taux", {
	description: "Donne un taux aléatoire de quelque chose",
	execute: args => {
		let { message, cmdArgs, bot } = args;

		message.embed(`${cmdArgs.length !== 0 ? `${message.author}\ntaux ${cmdArgs.join(" ")}\n${bot.user}\n` : ""}${utils.randomPercentage()}%`);
	}
});

commands.set("hug", {
	description: "Hug somebody",
	execute: args => {
		let { message } = args;
		let mentions = message.mentions.users.array();
		if (mentions.length === 0) mentions = [message.author];
		message.customEmbed(embed => embed
			.setDescription(`${message.author} hugs ${mentions.length === 1 ? "herself/himself" : `${mentions.map((user, i) => (i === 0) ? `${user}` : `, ${user}`).join("")}`}`)
			.setImage(utils.randomItem(
				"https://media1.tenor.com/images/969f0f462e4b7350da543f0231ba94cb/tenor.gif?itemid=14246498",
				"https://media1.tenor.com/images/bb9c0c56769afa3b58b9efe5c7bcaafb/tenor.gif?itemid=16831471",
				"https://media1.tenor.com/images/ea1ca14e49866429e2221aab2126cdb0/tenor.gif?itemid=14599424",
				"https://media1.tenor.com/images/34a1d8c67e7b373de17bbfa5b8d35fc0/tenor.gif?itemid=8995974",
				"https://media1.tenor.com/images/aeb42019b0409b98aed663f35b613828/tenor.gif?itemid=14108949",
				"https://media1.tenor.com/images/f2805f274471676c96aff2bc9fbedd70/tenor.gif?itemid=7552077"
			))
		);
	}
});

commands.set("pdp", {
	description: "Obtenir la photo de profil d'un membre du serveur",
	execute: args => {
		let { message } = args;
		let mentions = message.mentions.users.array();
		if (mentions.length === 0) mentions = [message.author];
		message.embed(`Voici ${(mentions.length === 1) ? "la photo de profil" : "les photos de profil"} de ${mentions.map((user, i) => (i === 0) ? `${user}` : `, ${user}`).join("")}`, mentions.map(user => user.displayAvatarURL()));
	}
});

commands.set("testmodify", {
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

commands.set("detectreaction", {
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

module.exports.listen = (message, bot) => {
	let text = message.content;

	if (text.startsWith(config.prefix)) {
		text = text.replace(config.prefix, "");

		let splited = text.split(" ");
		let cmd = splited.shift();
		let args = splited;

		if (commands.has(cmd) === true) {
			commands.get(cmd).execute({
				message: message,
				cmdArgs: args,
				bot: bot
			});
		} else {
			message.react("❔");
		}
	};
};