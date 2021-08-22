const fetch = require("node-fetch");

const config = require("./config/config.json");
const utils = require("./utils");
let { addSong, startMusic, stopMusic, skipSong } = require("./music");

const commands = new Map();

class Command {
	constructor(name, command) {
		this.name = name;
		this.description = command.description;
		this.syntax = `${config.prefix}${command.syntax}`;
		this.execute = command.execute || (() => { });
		this.hidden = command.hidden || false;
		commands.set(name, this);
	};
};

new Command("help", {
	description: "Gives a list of all the available commands",
	syntax: `help`,
	execute: messageInfo => {
		let { message } = messageInfo;

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
						return collector.stop("Closed display");
					} else {
						await reaction.users.remove(user);
					};
				});
				collector.on("end", async (collected, reason) => {
					console.log(reason);
					if (reason === "time") await sent.edit(message.returnEmbed(`Display timeout (1min)`));
					else await sent.edit(message.returnEmbed(reason));
					await sent.reactions.removeAll();
				});
			}).catch(err => console.log(err));
	}
});

new Command("hey", {
	description: "Greet the bot",
	syntax: `hey`,
	execute: messageInfo => {
		let { message } = messageInfo;
		message.embed(`${utils.randomItem("hey", "Hii", "Yo")} ${message.author} ${utils.randomItem(":3", ":)", "!")}`);
	}
});

new Command("spell", {
	description: "The bot spells a sentence or a word",
	syntax: `spell <word/sentence>`,
	execute: async messageInfo => {
		let { message, commandAttr } = messageInfo;
		let length = commandAttr.content.length;
		for (let i = 0; i < length; i++) {
			await message.simple(commandAttr.content.charAt(i));
		};
	}
});

new Command("true or false", {
	description: "Answer \"true\" or \"false\" randomly",
	syntax: `true or false <?sentence>`,
	execute: messageInfo => {
		let { message, commandAttr, bot } = messageInfo;
		message.embed(`${commandAttr.content && `${message.author}\n${commandAttr.content}\n${bot.user}\n`}${utils.randomItem("vrai !", "faux !")}`)
	}
});

new Command("rate", {
	description: "The bot gives a random rate (%)",
	syntax: `rate <?sentence>`,
	execute: messageInfo => {
		let { message, commandAttr, bot } = messageInfo;
		message.embed(`${commandAttr.content && `${message.author}\n${commandAttr.content}\n${bot.user}\n`}${utils.randomPercentage(true)}%`);
	}
});

new Command("lovemeter", {
	description: "Finds the love rate between you and someone else",
	syntax: `lovemeter <person>`,
	execute: messageInfo => {
		let { message, commandAttr } = messageInfo;
		if (message.mentions.users.size === 0 && !commandAttr.content) return message.embed(`You have to mention the person you want to test your love with...`);
		message.embed(`${message.author} x ${!commandAttr.content ? message.mentions.users.first() : commandAttr.content}: ${utils.randomPercentage(true)}%`);
	}
});

new Command("choose", {
	description: "Chooses someone randomly in the server",
	syntax: `choose <?sentence>`,
	execute: messageInfo => {
		let { message, commandAttr, bot } = messageInfo;
		message.guild.members.fetch()
			.then(members => {
				message.embed(commandAttr.content ? `${message.author}\n${commandAttr.content}\n${bot.user}\nThe chosen person is ${members.random()}` : `The chosen person is ${members.random()}`);
			});
	}
});

new Command("hug", {
	description: "Hug somebody",
	syntax: `hug <?mention>`,
	execute: messageInfo => {
		let { message, bot } = messageInfo;
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
	execute: messageInfo => {
		let { message } = messageInfo;
		let mentions = message.mentions.users.array();
		if (mentions.length === 0) mentions = [message.author];
		message.embed(`Here ${(mentions.length === 1) ? "is" : "are"} ${mentions.map((user, i) => (i === 0) ? `${user}` : `, ${user}`).join("")} profile ${(mentions.length === 1) ? "picture" : "pictures"}`, mentions.map(user => user.displayAvatarURL()));
	}
});

new Command("music add", {
	description: "Add a song to the playlist",
	syntax: `music add <youtube url>`,
	execute: messageInfo => addSong(messageInfo)
});

new Command("music play", {
	description: "Start playing music",
	syntax: `music play`,
	execute: messageInfo => startMusic(messageInfo)
});

new Command("music stop", {
	description: "Stop playing music",
	syntax: `music stop`,
	execute: messageInfo => stopMusic(messageInfo)
});

new Command("music skip", {
	description: "Skip current song",
	syntax: `music skip`,
	execute: messageInfo => skipSong(messageInfo)
});

new Command("code", {
	description: "Get a link to the bot's code (github)",
	syntax: `code`,
	execute: messageInfo => {
		let { message } = messageInfo;
		message.customEmbed(embed =>
			embed.setDescription(`Here is the link to access to my code ${utils.randomItem(":3", ":)", "!")}`)
				.setTitle("see code")
				.setURL(require("./package.json").repository.url)
		);
	}
});

new Command("invite", {
	description: "Generate invite link",
	syntax: `invite`,
	execute: messageInfo => {
		let { message, bot } = messageInfo;
		bot.generateInvite({ permissions: "ADMINISTRATOR" })
			.then(link => message.customEmbed((embed) =>
				embed
					.setDescription(`Here is my invite link ${utils.randomItem(":3", ":)", "!")}`)
					.setTitle("invite")
					.setURL(link)
			))

	}
});

/*

new Command("emote send", {
	description: `Sends an emote from an emote id (developer feature)`,
	syntax: `emote send <emote id>`,
	execute: async (messageInfo) => {
		let { message, commandAttr, bot } = messageInfo;

		let splitted = commandAttr.content.split(" ");

		let emote = await bot.emojis.cache.get(splitted[0]);

		message.simple(`<${emote.animated ? "a" : ""}:${emote.name}:${emote.id}>`);

	}
});

new Command("emote react", {
	description: `The bot reacts to a message with an emote (using discord ids)`,
	syntax: `emote react <message id> <emote id>`,
	execute: (messageInfo) => {
		let { message, commandAttr } = messageInfo;

		let splitted = commandAttr.content.split(" ");

		message.channel.messages.fetch(splitted[0])
			.then(fetched => {
				message.delete();
				fetched.react(splitted[1]);
			});

	}
});

new Command("emote spam", {
	description: `Le bot envoie toutes les emotes de sa connaissance`,
	syntax: `emote spam`,
	execute: async (messageInfo) => {
		let { message, bot } = messageInfo;

		let emotes = await bot.emojis.cache;

		emotes.forEach((emote) => {
			message.simple(`<${emote.animated ? "a" : ""}:${emote.name}:${emote.id}>`);
		});

	}
});


new Command("testmodify", {
	description: "la flemme vous connaissez ?",
	execute: messageInfo => {
		let { message } = messageInfo;

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
	execute: messageInfo => {
		let { message } = messageInfo;

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

/*module.exports.listen = (messageInfo) => {
	let { message, bot } = messageInfo,
		commandAttr.content = message.commandAttr.content;

	let commandName;
	commands.forEach((value, key) => {
		if (commandAttr.content.match(new RegExp(`^${config.prefix}${key}`, "g"))) commandName = key;
	});

	if (commandAttr.content.match(new RegExp(`^${config.prefix}`, "g"))) {
		if (commandName && commands.has(commandName)) commands.get(commandName).execute({
			message,
			commandAttr.content: message.commandAttr.content.replace(new RegExp(`^${config.prefix}${commandName}`, "g"), "").trim(),
			bot
		}); else message.react("❔");
	};

};*/



module.exports.map = commands;
module.exports.array = Array.from(commands).map(command => command[1]);