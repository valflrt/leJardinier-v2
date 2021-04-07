const discord = require("discord.js");

const randomItem = (...array) => array[Math.floor(Math.random() * array.length)];

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const randomPercentage = () => {
	let bonus = 0;
	if (Math.floor(Math.random() * 100) === 1) {
		bonus = 20 + Math.floor(Math.random() * 200);
	};
	return bonus === 0 ? (Math.floor(Math.random() * 100)) : 100 + bonus;
};

const defaultEmbed = (message, bot) => new discord.MessageEmbed()
	.setColor("#49a013")
	.setFooter(`En reponse à ${message.author.tag}`)
	.setAuthor(bot.user.username, "https://media.discordapp.net/attachments/749765499998437489/823241819801780254/36fb6d778b4d4a108ddcdefb964b3cc0.webp")
	.setTimestamp();

module.exports = { randomItem, randomNumber, randomPercentage, defaultEmbed };