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

	await bot.user.setPresence((config.activity) ? {
		status: config.activity.status,
		activity: {
			name: config.activity.list[0],
			type: config.activityType || "PLAYING"
		}
	} : null)
		.then(() => console.log(` ${"[+]".green} Presence set to ${config.activity.list[0].cyan} and status to ${config.activity.status.cyan}`));

	console.log(` ${"[+]".green} Logged in as: ${(bot.user.tag).cyan} - ${(bot.user.id).cyan}`);
	console.log("\n " + " connected ".bgGreen.black + "\n");

	reader.static(bot);

});

bot.on("message", async message => {

	if (message.author.bot) return; // skip if the author of the message is a bot

	console.log(`${message.author.username.cyan}: ${(message.content.includes(config.prefix) === true)
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
		return message.channel.send(
			utils.defaultEmbed(message, bot)
				.setDescription(text)
				.attachFiles(files)
		);
	};

	message.returnEmbed = (text, files = []) => {
		return utils.defaultEmbed(message, bot)
			.setDescription(text)
			.attachFiles(files)
	};

	message.customEmbed = (config, files = []) => {
		let embed = utils.defaultEmbed(message, bot)
			.attachFiles(files);

		let newEmbed = config(embed);

		return message.channel.send(newEmbed);
	};

	message.simple = text => {
		message.channel.send(text);
	};

	/* listeners */

	reader.listen(message); // simple fontion reading messages and replying in particular cases

	commands.listen(message, bot); // listen to command calls

});

bot.login(token);