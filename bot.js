const discord = require("discord.js");
require("colors");

const commands = require("./commands");
const reader = require("./reader");
const utils = require("./utils");

const config = require("./config.json");
const token = require("./token.json");

const bot = new discord.Client();

bot.on("ready", async () => {

	// verifications and console logging

	console.log("\033c");

	await bot.user.setUsername(config.username)
		.then(client => console.log(` ${"[+]".green} Username set to ${(client.username).cyan}`));

	await bot.user.setStatus(config.status)
		.then(client => console.log(` ${"[+]".green} Status set to ${(client.status).cyan}`));

	await bot.user.setPresence((config.activity.list[0]) ? {
		activity: {
			name: config.activity.list[0],
			type: config.activityType || "PLAYING"
		}
	} : null)
		.then(presence => console.log(` ${"[+]".green} Presence set to ${presence.activities.shift().name.cyan}`));

	console.log(` ${"[+]".green} Logged in as: ${(bot.user.tag).cyan} - ${(bot.user.id).cyan}`);
	console.log("\n " + " connected ".bgGreen.black + "\n");

	reader.static(bot);

});

bot.on("message", async message => {

	if (message.author.bot) return; // skip if the author of the message is a bot

	console.log(message.content.search(/^(\~{2}.+\s)/g));

	console.log(`${message.author.username.cyan}: ${(message.content.includes("~~") === true)
		? message.content.yellow : message.content}`); // logs every message

	// message sending methods

	function mention(text) {
		return (text.includes(`<@${message.author.id}>`) === true) ?
			"" : `${message.author}\n`;
	};

	message.answer = (text, files) => {
		message.channel.send(`${mention(text)}${text}`, files || {});
	};

	message.embed = (text, files = []) => {
		message.reply(
			utils.defaultEmbed(message, bot)
				.setDescription(text)
				.attachFiles(files)
		);
	};

	message.customEmbed = (config, then = () => { }, files = []) => {
		let embed = utils.defaultEmbed(message, bot)
			.attachFiles(files);

		let newEmbed = config(embed);

		message.channel.send(newEmbed).then(sent => then(sent, embed, message.author));
	};

	message.simple = text => {
		message.channel.send(text);
	};

	/* listeners */

	reader.listen(message); // simple fontion reading messages and replying in particular cases

	commands.listen(message, bot); // listen to command calls

});

bot.login(token);