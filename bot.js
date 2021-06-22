import { Client } from "discord.js";
import "colors";

import { listen } from "./commands";
import { static, listen as _listen } from "./reader";
import { setupMessage } from "./utils";

import { username, activity as _activity, activityType, prefix } from "./config";
import token from "./token.json";

const bot = new Client();

bot.on("ready", async () => {

	// verifications and console logging

	console.log("\033c");

	await bot.user.setUsername(username)
		.then(client => console.log(` ${"[+]".green} Username set to ${(client.username).cyan}`));

	await bot.user.setPresence((_activity) ? {
		status: _activity.status,
		activity: {
			name: _activity.list[0],
			type: activityType || "PLAYING"
		}
	} : null)
		.then(() => console.log(` ${"[+]".green} Presence set to ${_activity.list[0].cyan} and status to ${_activity.status.cyan}`));

	console.log(` ${"[+]".green} Logged in as: ${(bot.user.tag).cyan} - ${(bot.user.id).cyan}`);
	console.log("\n " + " connected ".bgGreen.black + "\n");

	static(bot);

});

bot.on("message", async message => {

	console.log(`${message.author.username.cyan}${message.content !== "" ? `:` : ""} ${(message.content.includes(prefix) === true)
		? message.content.yellow
		: message.content} ${message.embeds.length !== 0 ? `[${message.embeds.length} embeds]`.green : ""}${message.attachments.size !== 0 ? ` [${message.attachments.size} attachements]`.green : ""}`); // logs every message

	if (message.author.bot) return; // skip if the author of the message is a bot

	// setup

	// messageInfo contains the required information to run all the commands
	const messageInfo = setupMessage({ message, bot }); // setup message (adding methods) and creating messageInfo ({message, bot})

	// listeners

	_listen(messageInfo); // simple fontion reading messages and replying in particular cases
	listen(messageInfo); // listen to command calls

	return;

});

bot.login(token);