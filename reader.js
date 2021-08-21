const utils = require("./utils");
const config = require("./config/config.json")

module.exports.listen = messageInfo => {

	let { message } = messageInfo,
		{ content } = message;

	if (content.match(/(^|\s)[Nn][Oo]+[Nn]((\s)?[\.\!\?]+)?$/g) !== null) {
		utils.actionRate(1, 100) // 1 of 100 rate to occur
			.action(() => message.simple("*bril*"));

	};

	if (content.match(/(^|\s)[Qq][Uu][Oo][Ii]((\s)?[\.\!\?]+)?$/g) !== null) {
		utils.actionRate(1, 100)
			.action(() => message.simple("*feur*"));
	};

	if (content.match(/(^|\s)[Oo][Uu][Ii]+((\s)?[\.\!\?]+)?$/g) !== null) {
		utils.actionRate(1, 100)
			.action(() => message.simple(utils.randomItem("*stiti*", "*fi*")));
	};

	if (content.match(/^[oO][kK]$/g) !== null) {
		message.react("🤬");
	};

	if (content.match(/(^[Pp][Uu][Tt][Ee]$)|(^[Tt][Aa]\s[Mm][EeÈè][Rr][Ee]$)/g) !== null && message.reference !== null && message.mentions.users.get("710524468782694520") !== undefined) {
		message.simple(`ok ${message.author} mais paye moi au moins alors`);
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
		userIDs: ["418813560739725312"], // meumeu.
		regex: /eh\sle\sbot/g,
		message: message
	}, () => message.simple(`oui ${utils.randomItem("la sainte jarre-dindon", "la sainte patate")} ?`));

	filter({
		userIDs: ["363976260260593674"], // Blind
		regex: /\*pew pew\*$/g,
		message: message
	}, () => message.simple("https://cdn.discordapp.com/attachments/820063958177677382/878536964679294986/Screenshot_20210817_094236.jpg"));

	filter({
		userIDs: [""]
	});

};

module.exports.static = (bot) => {

	let lastNoseTouch = null; // last time you had to touch your noze (each time the hours and seconds are the same. eg: 11:11)
	setInterval(() => {
		let hours = new Date().getHours();
		let minutes = new Date().getMinutes();
		if (hours == minutes) {
			if (lastNoseTouch === `${hours}:${minutes}`) return;
			bot.channels.cache.get("802634814771560518").send(`${utils.randomItem(
				`Eh les <@&802634842557644900> vous savez ce que vous avez à faire`,
				`Chers <@&802634842557644900> ceci est notre heure`,
				`L'instant ultime est arrivé <@&802634842557644900>`
			)} ${utils.randomItem(":3", ":>", ":)", "!")}`);
			lastNoseTouch = `${hours}:${minutes}`;
		};
	}, 5000);

	let lastIndex = 0;
	setInterval(() => {
		bot.user.setPresence({
			activity: {
				name: config.activity.list[lastIndex],
				type: config.activityType || "PLAYING"
			}
		});
		lastIndex++;
		if (lastIndex >= config.activity.list.length) lastIndex = 0;
	}, 5000);

};