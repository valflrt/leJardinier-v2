const { MessageEmbed } = require("discord.js")

const config = require("./config/config.json");
const commands = require("./commands").array;

/**
 * MessageInfo holds all the data which is
 * required by the commands to work
 */

module.exports = class MessageInfo {
	constructor({ message, bot }) {
		this.message = message;
		this.bot = bot;

		this.setCommand();

		if (this.command) {
			this.setEmbed();
			this.setMethods();
		};

		return this;
	};

	setCommand() {
		let { message } = this;

		this.command = commands.find(command => message.content.match(new RegExp(`^${config.prefix}${command.name}`, "g")) !== null);
		if (!this.command && message.content.match(new RegExp(`^${config.prefix}`)) !== null) this.message.react("❔");

		if (this.command) {
			this.commandAttr = {
				content: this.message.content.replace(new RegExp(`^${config.prefix}${this.command.name}`, "g"), "").trim(),
				commandCall: `${config.prefix}${this.command.name}`
			};
		};
	};

	setEmbed() {
		this.embed = () => new MessageEmbed()
			.setColor("#49a013")
			.setFooter(`En reponse à ${this.message.author.tag} - ${this.commandAttr.commandCall}`)
			.setAuthor(this.bot.user.username, "https://media.discordapp.net/attachments/749765499998437489/823241819801780254/36fb6d778b4d4a108ddcdefb964b3cc0.webp")
			.setTimestamp();
	};

	setMethods() {

		this.message.answer = (text, files) => {
			this.message.channel.send(`${mention(text)}${text}`, files || {});
		};

		this.message.simple = text => {
			this.message.channel.send(text);
		};

		this.message.embed = (text, files = []) => {
			return this.message.channel.send(
				this.embed()
					.setDescription(text)
					.attachFiles(files)
			);
		};

		this.message.returnEmbed = (text, files = []) => {
			return this.embed()
				.setDescription(text)
				.attachFiles(files)
		};

		this.message.customEmbed = (config, files = []) => {
			let embed = this.embed()
				.attachFiles(files);

			let newEmbed = config(embed);

			return this.message.channel.send(newEmbed);
		};

		this.message.returnCustomEmbed = (config, files = []) => {
			let embed = this.embed()
				.attachFiles(files);

			let newEmbed = config(embed);

			return newEmbed;
		};

	}
};