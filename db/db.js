const database = require("mongoose");
const { default: fetch } = require("node-fetch");

const connect = () => database
	.connect("mongodb://localhost/leJardinier", {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => console.log(` ${"[+]".green} Successfully connected to the database`))
	.catch(err => console.error(` ${"[!]".red} Failed to connect to the database:\n${err}`));

const { Guild, Member } = require("./models");

const listen = (message, callback) => {

	Guild.findOne({ id: message.guild.id })
		.then(fetchedGuild => {

			let { guild } = message;

			if (!fetchedGuild) {
				new Guild({
					name: guild.name,
					id: guild.id,
					stats: {
						memberCount: guild.memberCount
					}
				}).save();
			};

			Member.findOne({ id: message.author.id })
				.then(async fetchedMember => {

					let { author } = message;

					if (!fetchedMember) {

						let createdMember = new Member({
							username: author.username,
							id: author.id
						});

						fetchedGuild.members.push(createdMember);

						await fetchedGuild.save();
						await createdMember.save();

					};

					let memberInGuild = fetchedGuild.members.find(member => member.id === author.id);

					if (!memberInGuild) {
						fetchedGuild.members.push(fetchedMember);
						fetchedGuild.save();
					};

					callback({
						member: fetchedMember,
						guild: fetchedGuild
					});

				}).catch(err => console.log(err));

		}).catch(err => console.log(err));

};

module.exports = { connect, listen };