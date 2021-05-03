const ytdl = require("ytdl-core");

const utils = require("./utils");

class Song {
	async setVideoDetails(content) {
		let { videoDetails } = await ytdl.getInfo(content);
		this.title = videoDetails.title;
		this.url = videoDetails.video_url;
		this.videoDetails = videoDetails;
	}

	play(guild) {
		return new Promise((resolve, reject) => {
			try {
				guild.voiceDispatcher.play(ytdl(this.url))
					.on("finish", () => resolve())
					.on("error", (err) => reject(err));
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
		return this.queue.shift();
	};
}

guilds = new Map();

const add = async (args) => {
	let { message, content } = args;
	let song = new Song();
	await song.setVideoDetails(content);
	if (!guilds.has(message.guild.id)) guilds.set(message.guild.id, new GuildQueue(args));
	guilds.get(message.guild.id).addSong(song);
	message.customEmbed(embed => embed
		.setDescription(`Musique ajoutée à la playlist avec succès ${utils.randomItem(":3", ":)", "!")}`)
		.setThumbnail(song.videoDetails.thumbnails.url)
		.setTitle(song.title)
		.setURL(song.url)
	);
};

const connect = async (args, callback) => {
	let { message, bot } = args;

	let voiceChannel = message.member.voice.channel;
	if (!voiceChannel) return message.embed(`Tu dois être dans un salon vocal pour pouvoir entendre la musique...`);
	let permissions = voiceChannel.permissionsFor(bot.user);
	if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) return message.embed(`Je n'ai pas la permission de rejoindre ce salon...`)

	guilds.get(message.guild.id).setVoiceChannel(voiceChannel);
	message.embed(`Salon textuel relié`)
		.then(() => message.embed(`Connection au salon vocal en cours...`)
			.then(async () => {
				try {
					const voice = await voiceChannel.join();
					message.embed(`Connecté au salon vocal avec succès ${utils.randomItem(":3", ":)", "!")}`);
					guilds.get(message.guild.id).setVoiceDispatcher(voice);
					callback();
				} catch (err) {
					console.log(err);
					message.embed(`Erreur lors de la connection au salon vocal...`);
				};
			})
		);
};

const play = (args) => {
	let { message } = args;
	let currentGuild = guilds.get(message.guild.id);
	if (currentGuild.queue.length === 0) {
		currentGuild.voiceChannel.leave();
		return message.embed(`La playlist est vide...`);
	};
	currentGuild.next()
		.play(currentGuild)
		.then(() => play(args))
		.catch(err => {
			console.log(err);
			message.embed(`J'ai rencontré une erreur inconnue...`);
			currentGuild.voiceChannel.leave();
		});
};

module.exports = { add, connect, play };