const config = require("./config.json");

class Command {
	constructor(name, command) {
		this.name = name;
		this.description = command.description;
		this.execute = command.execute;
	};
};

class CommandRouter {
	constructor() {
		this.router = new Map();
		this.isRouter = true;
	};

	setCommand(name, command) {
		this.router.set(new Command(name, {
			name: name,
			...command
		}));
		return this;
	};

	setRoute(name) {
		this.router.set(name, new CommandRouter());
		return this.router.get(name);
	}

	get(key) {
		return this.router.get(key);
	};

	has(key) {
		return this.router.get(key);
	};
};

let router = new CommandRouter();

router.setRoute("test")
	.setCommand("hey", {
		description: "hey",
		execute: () => console.log("hey guys")
	})
	.setCommand("no", {
		description: "says no",
		execute: () => console.log("no")
	});

module.exports.listen = (message, bot) => {
	let content = message.content;
	let prefixRegex = new RegExp(`^${config.prefix}`, "g");

	if (content.match(prefixRegex).length !== null) { // the second on is useful if the prefix is also used to make discord message formatting. eg: __hello__ -> underline
		content = content.replace(prefixRegex, "").split(" ");

		console.log(content);

		const checker = (value, remainingText) => {
			if (router.has(value) === true) {
				let route = router.get("value");
				if (route.isRouter) checker(...arguments);
				else route.execute({
					message,
					remainingText,
					bot
				});
			} else {
				message.react("❔");
			};
		};

		content.forEach((value, index, array) => {
			checker(value, array)
		});

	};
};