const utils = require("./utils");

module.exports.listen = message => {

	let { content } = message;

	if (content.match(/^[Nn][Oo][Nn]$/g) !== null) {
		message.simple("*bril*");
	};

	if (content.match(/[Qq][Uu][Oo][Ii]((\s)?(\?)+)?$/g) !== null) {
		message.simple("*feur*");
	};

	if (content.match(/^[Oo][Uu][Ii]$/g) !== null) {
		message.simple(utils.randomItem("*stiti*", "*fi*"));
	};

	if (content.match(/^[oO][kK]$/g) !== null) {
		message.react("🤬");
	};

	if (content.match(/^[Pp][Uu][Tt][Ee]$/g) !== null && message.reference !== null && message.mentions.users.get("710524468782694520") !== undefined) {
		message.reply(`ok mais paye moi alors`);
	};

	function filter(args, callback) {
		let { userIDs, regex, message } = args;
		if (userIDs.find(id => id === message.author.id) && message.content.match(regex) !== null) return callback();
	};

	filter({
		userIDs: ["449743606190702612"], // Poch
		regex: /[oO][rR][fF]/g,
		message: message
	}, () => message.simple("orf"));

	filter({
		userIDs: ["564012236851511298", "418813560739725312"], // Synonym' | meumeu.
		regex: /([hH][eE]){2,}|([eE][hH]){2,}|([eE][hH][eE])/g,
		message: message
	}, () => message.react(`823632553847947315`));

	filter({
		userIDs: ["564012236851511298"], // Synonym'
		regex: /sale\sbot/g,
		message: message
	}, () => message.channel.send("<:partyingkeqing:823632179212713985>"));

	filter({
		userIDs: ["418813560739725312"], // meumeu.
		regex: /eh\sle\sbot/g,
		message: message
	}, () => message.simple(`oui ${utils.randomItem("la sainte jarre-dindon", "la sainte patate")} ?`));

	filter({
		userIDs: ["348011923985661952"], // D1s3ase
		regex: /^[Aa]nticonstitutionnellement(\s\?|\?)?$/g,
		message: message
	}, () => message.simple(`oui maître, exactement`));
};

module.exports.static = (bot) => {
	this.current = null;
	setInterval(() => {
		let hours = new Date().getHours();
		let minutes = new Date().getMinutes();
		if (hours == minutes) {
			if (this.current === `${hours}:${minutes}`) return;
			bot.channels.cache.get("802634814771560518").send(`<@&802634842557644900> touchez votre nez bande de ${utils.randomItem(
				"patates",
				"personnes respectables"
			)} ${utils.randomItem(":3", ":>")}`);
			this.current = `${hours}:${minutes}`;
		};
	}, 5000);
};