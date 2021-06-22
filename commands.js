import fetch from "node-fetch";

import { prefix } from "./config.js";
import { randomItem, randomPercentage } from "./utils";
import { addSong, startMusic, stopMusic, skipSong } from "./music";

const commands = new Map();

class Command {
	constructor(name, command) {
		this.name = name;
		this.description = command.description;
		this.syntax = `${prefix}${command.syntax}`;
		this.execute = command.execute || (() => { });
		this.hidden = command.hidden || false;
		commands.set(name, this);
	};
};

new Command("help", {
	description: "Gives a list of all the available commands",
	syntax: `help`,
	execute: args => {
		let { message } = args;

		function cutArray(array) {
			let newArray = new Array();
			do {
				let items = array.splice(0, 5);
				newArray.push(items);
			} while (array.length >= 5);
			if (array.length !== 0) newArray.push(array);
			return newArray;
		};

		let commandArray = new Array();
		commands.forEach((command) => commandArray.push(command));

		let formatted = cutArray(commandArray);
		let index = 0;

		let loadPage = (embed) => {
			embed.addField(`Page: `, `${index + 1}/${formatted.length}`, true);
			formatted[index].forEach((command) => {
				if (command.hidden === true) return;
				embed.addField(`${command.syntax}`, `${command.description}`);
			});
			return embed;
		};

		message.customEmbed(loadPage)
			.then(async (sent) => {
				await sent.react("⬅️");
				await sent.react("➡️");
				await sent.react("❌");
				let collector = sent.createReactionCollector((reaction) => ["⬅️", "➡️", "❌"].includes(reaction.emoji.name), { max: 200, time: 60000, errors: ["time"] });
				collector.on("collect", async (reaction, user) => {
					if (reaction.emoji.name === "➡️" && index + 1 !== formatted.length) {
						index++;
						await reaction.users.remove(user);
						await sent.edit(message.returnCustomEmbed(loadPage));
					} else if (reaction.emoji.name === "⬅️" && index !== 0) {
						index--;
						await reaction.users.remove(user);
						await sent.edit(message.returnCustomEmbed(loadPage));
					} else if (reaction.emoji.name === "❌") {
						return collector.stop("L'affichage a été fermé");
					} else {
						await reaction.users.remove(user);
					};
				});
				collector.on("end", async (collected, reason) => {
					console.log(reason);
					if (reason === "time") await sent.edit(message.returnEmbed(`Delai maximum d'affichage dépassé (1min)`));
					else await sent.edit(message.returnEmbed(reason));
					await sent.reactions.removeAll();
				});
			}).catch(err => console.log(err));
	}
});

new Command("hey", {
	description: "Greet the bot",
	syntax: `hey`,
	execute: args => {
		let { message } = args;
		message.embed(`${randomItem("hey", "Hii", "Yo")} ${message.author} ${randomItem(":3", ":)", "!")}`);
	}
});

new Command("spell", {
	description: "The bot spells a sentence or a word",
	syntax: `spell <word/sentence>`,
	execute: async args => {
		let { message, content } = args;
		let length = content.length;
		for (let i = 0; i < length; i++) {
			await message.simple(content.charAt(i));
		};
	}
});

new Command("true or false", {
	description: "Answer \"true\" or \"false\" randomly",
	syntax: `true or false <?sentence>`,
	execute: args => {
		let { message, content, bot } = args;
		message.embed(`${content && `${message.author}\n${content}\n${bot.user}\n`}${randomItem("vrai !", "faux !")}`)
	}
});

new Command("rate", {
	description: "The bot gives a random rate (%)",
	syntax: `rate <?sentence>`,
	execute: args => {
		let { message, content, bot } = args;
		message.embed(`${content && `${message.author}\n${content}\n${bot.user}\n`}${randomPercentage(true)}%`);
	}
});

new Command("lovemeter", {
	description: "Finds the love rate between you and someone else",
	syntax: `lovemeter <person>`,
	execute: args => {
		let { message, content } = args;
		if (message.mentions.users.size === 0 && !content) return message.embed(`Tu dois ajouter la personne avec qui tu veux tester ton amour...`);
		message.embed(`${message.author} x ${!content ? message.mentions.users.first() : content}: ${randomPercentage(true)}%`);
	}
});

new Command("choose", {
	description: "Chooses someone randomly in the server",
	syntax: `choose <?sentence>`,
	execute: args => {
		let { message, content, bot } = args;
		message.guild.members.fetch()
			.then(members => {
				message.embed(`${content && `${message.author}\n${content}\n${bot.user}\nLa personne choisie est ${members.random()}`}`);
			});
	}
});

new Command("hug", {
	description: "Hug somebody",
	syntax: `hug <?mention>`,
	execute: args => {
		let { message, bot } = args;
		let mentions = message.mentions.users.array();
		if (mentions.length === 0) mentions = [message.author];
		fetch("https://nekos.life/api/hug")
			.then(res => res.json())
			.then(data => {
				message.customEmbed(embed => embed
					.setDescription(`${message.author} hugs ${mentions.length === 1 ? bot.user : `${mentions.map((user, i) => (i === 0) ? `${user}` : `, ${user}`).join("")}`}`)
					.setImage(data.url)
				);
			});

	}
});

new Command("pp", {
	description: "Get somebody's profile picture",
	syntax: `pp <?mention>`,
	execute: args => {
		let { message } = args;
		let mentions = message.mentions.users.array();
		if (mentions.length === 0) mentions = [message.author];
		message.embed(`Voici ${(mentions.length === 1) ? "la photo de profil" : "les photos de profil"} de ${mentions.map((user, i) => (i === 0) ? `${user}` : `, ${user}`).join("")}`, mentions.map(user => user.displayAvatarURL()));
	}
});

new Command("music add", {
	description: "Add a song to the playlist",
	syntax: `music add <youtube url>`,
	execute: args => addSong(args)
});

new Command("music play", {
	description: "Start playing music",
	syntax: `music play`,
	execute: args => startMusic(args)
});

new Command("music stop", {
	description: "Stop playing music",
	syntax: `music stop`,
	execute: args => stopMusic(args)
});

new Command("music skip", {
	description: "Skip current song",
	syntax: `music skip`,
	execute: args => skipSong(args)
});

new Command("code", {
	description: "Get a link to the bot's code (github)",
	syntax: `code`,
	execute: args => {
		let { message } = args;
		message.customEmbed(embed => {
			embed.setDescription(`Voici le lien pour voir le code qui me fait fonctionner ${randomItem(":3", ":)", "!")}`);
			embed.setTitle("voir le code");
			embed.setURL(require("./package.json").repository.url);
			return embed;
		});
	}
});

new Command("invite", {
	description: "Generate invite link",
	syntax: `invite`,
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

/*

new Command("emote send", {
	description: `Sends an emote from an emote id (devlopper feature)`,
	syntax: `emote send <emote id>`,
	execute: async (args) => {
		let { message, content, bot } = args;

		let splited = content.split(" ");

		let emote = await bot.emojis.cache.get(splited[0]);

		message.simple(`<${emote.animated ? "a" : ""}:${emote.name}:${emote.id}>`);

	}
});

new Command("emote react", {
	description: `The bot reacts to a message with an emote (using discord ids)`,
	syntax: `emote react <message id> <emote id>`,
	execute: (args) => {
		let { message, content } = args;

		let splited = content.split(" ");

		message.channel.messages.fetch(splited[0])
			.then(fetched => {
				message.delete();
				fetched.react(splited[1]);
			});

	}
});

new Command("emote spam", {
	description: `Le bot envoie toutes les emotes de sa connaissance`,
	syntax: `emote spam`,
	execute: async (args) => {
		let { message, bot } = args;

		let emotes = await bot.emojis.cache;

		emotes.forEach((emote) => {
			message.simple(`<${emote.animated ? "a" : ""}:${emote.name}:${emote.id}>`);
		});

	}
});


new Command("testmodify", {
	description: "la flemme vous connaissez ?",
	execute: args => {
		let { message } = args;

		message.customEmbed(embed => {
			embed.setDescription(`hey je vais changer dans 5 secondes`);
			return embed;
		}).then((message, embed) => {
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
		}).then((sent, embed, requirer) => {
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

export function listen(messageInfo) {
	let { message, bot } = messageInfo,
		content = message.content;

	let commandName;
	commands.forEach((value, key) => {
		if (content.match(new RegExp(`^${prefix}${key}`, "g"))) commandName = key;
	});

	if (content.match(new RegExp(`^${prefix}`, "g"))) {
		if (commandName && commands.has(commandName)) commands.get(commandName).execute({
			message,
			content: message.content.replace(new RegExp(`^${prefix}${commandName}`, "g"), "").trim(),
			bot
		}); else message.react("❔");
	};

}

export const list = commands;