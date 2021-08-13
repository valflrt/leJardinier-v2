const ytdl = require("ytdl-core");

const utils = require("./utils");

class Song {
	setVideoDetails(url) {
		return new Promise(async (resolve, reject) => {
			if (ytdl.validateURL(url) === false) return reject();
			let { videoDetails } = await ytdl.getInfo(url);
			this.title = videoDetails.title;
			this.url = videoDetails.video_url;
			this.videoDetails = videoDetails;
			resolve();
		});
	};

	play(guild, args) {
		return new Promise(async (resolve, reject) => {
			try {
				await guild.voiceDispatcher.play(ytdl(this.url))
					.on("finish", () => {
						guild.queue.shift();
						resolve();
					})
					.on("error", (err) => reject(err));
				args.message.embed(`Playing "${this.title}" ${utils.randomItem(":3", ":)", "!")}`)
			} catch (err) {
				reject(err);
			};
		});
	};
};

class GuildQueue {
	constructor(args) {
		let { message } = args;
		this.guild = message.guild;
		this.voiceChannel = null;
		this.textChannel = null;
		this.voiceDispatcher = null;
		this.queue = new Array();
	};

	setVoiceChannel(voiceChannel) {
		this.voiceChannel = voiceChannel;
	};

	setTextChannel(textChannel) {
		this.textChannel = textChannel;
	};

	setVoiceDispatcher(voiceDispatcher) {
		this.voiceDispatcher = voiceDispatcher;
	};

	addSong(song) {
		this.queue.push(song);
	};

	next() {
		return this.queue[0];
	};
}

guilds = new Map();

const addSong = async (args) => {
	let { message, content } = args;
	let song = new Song();
	message.embed(`Looking for the song...`)
		.then(sent => song.setVideoDetails(content)
			.then(() => {
				if (!guilds.has(message.guild.id)) guilds.set(message.guild.id, new GuildQueue(args));
				guilds.get(message.guild.id).addSong(song);
				sent.edit(message.returnCustomEmbed(embed => embed
					.setDescription(`Song found and added to the playlist successfully ${utils.randomItem(":3", ":)", "!")}`)
					.setImage(song.videoDetails.thumbnails.url)
					.setTitle(song.title)
					.setURL(song.url))
				);
			}).catch(() => sent.edit(message.returnEmbed(`Unable to find the requested song`)))
		);
};

const startMusic = async (args) => {
	let { message, bot } = args;

	let currentGuild = guilds.get(message.guild.id);

	let voiceChannel = message.member.voice.channel;
	if (!voiceChannel) return message.embed(`You need to be in a audio channel to hear the song...`);
	let permissions = voiceChannel.permissionsFor(bot.user);
	if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) return message.embed(`I am not allowed to join ${voiceChannel}...`)

	if (!currentGuild || currentGuild.queue.length === 0) return message.embed(`The playlist is empty...`);

	currentGuild.setVoiceChannel(voiceChannel);
	message.embed(`Salon textuel relié`)
		.then(sent => setTimeout(() => sent.edit(message.returnEmbed(`Connecting to ${voiceChannel}...`))
			.then(sent => {
				setTimeout(() => {
					voiceChannel.join()
						.then(voice => {
							sent.edit(message.returnEmbed(`Connected to ${voiceChannel} ${utils.randomItem(":3", ":)", "!")}`));
							guilds.get(message.guild.id).setVoiceDispatcher(voice);
							play(args);
						})
						.catch(err => {
							console.log(err);
							sent.edit(message.returnEmbed(`Failed to connect to ${voiceChannel}...`));

						})
				}, 1000)
			}), 1000)
		);
};

const play = (args) => {
	let { message } = args;
	let currentGuild = guilds.get(message.guild.id);
	if (currentGuild.queue.length === 0) {
		currentGuild.voiceDispatcher.disconnect();
		currentGuild.voiceChannel.leave();
		return message.embed(`The playlist is empty...`);
	};
	currentGuild.next()
		.play(currentGuild, args)
		.then(() => play(args))
		.catch(err => {
			console.log(err);
			message.embed(`I encountered an unknown error...`);
			currentGuild.voiceChannel.leave();
		});
};

const stopMusic = async (args) => {
	let { message } = args;
	if (guilds.has(message.guild.id) && guilds.get(message.guild.id).voiceDispatcher) {
		let currentGuild = guilds.get(message.guild.id);
		await currentGuild.voiceDispatcher.disconnect();
		await currentGuild.voiceChannel.leave();
		message.embed(`Song stopped successfully`);
	} else message.embed(`You need to start the song before to stop it !`);
};

const skipSong = async (args) => {
	let { message } = args;
	if (guilds.has(message.guild.id) && guilds.get(message.guild.id).voiceDispatcher) {
		guilds.get(message.guild.id).queue.shift();
		play(args);
	} else message.embed(`You need to start the song before to skip it !`);
};

module.exports = { addSong, startMusic, stopMusic, skipSong };