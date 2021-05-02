const config = require("./config.json");

class CommandRouter {
	constructor() {
		this.router = new Map();
	};

	setCommand(name, command) {
		this.router.set(name, new Command(name, {
			name, ...command
		}));
		return this.router.get(name);
	};

	get(key) {
		return this.router.get(key);
	};

	has(key) {
		return this.router.get(key);
	};
};

class Command {
	constructor(name, command) {
		this.name = name;
		this.description = command.description;
		this.execute = command.execute;
		this.subCommands = new Map();
	};

	setSubCommand(name, command) {
		this.subCommands.set(name, {
			name, ...command
		});
		return this;
	};
};

let router = new CommandRouter();

router.setCommand("test", {
	description: "hey",
	execute: args => {
		let { message } = args;
		message.embed("test");
	}
})
	.setSubCommand("no", {
		description: "says no",
		execute: args => {
			let { message } = args;
			message.embed("no")
		}
	});

module.exports.listen = (message, bot) => {
	let content = message.content;
	let prefixRegex = new RegExp(`^${config.prefix}`, "g");



	if (content.match(prefixRegex).length !== null) { // the second on is useful if the prefix is also used to make discord message formatting. eg: __hello__ -> underline
		content = content.replace(prefixRegex, "").split(" ");

		if (router.has(content[0]) === true) {
			path.push(value);
			let route = router.get(value);
			content.shift();
			if (route.has(content[0])) {
				let command = route.get(content[0]);
				content.shift();
				command.execute({
					message,
					remainingText,
					bot
				});
			} else {
				route.execute({
					message,
					remainingText,
					bot
				});
			};
		} else {
			message.react("❔");
		};

	};
};