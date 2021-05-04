const ytdl = require("ytdl-core");

const utils = require("./utils");

class Song {
	async setVideoDetails(content) {
		let { videoDetails } = await ytdl.getInfo(content);
		this.title = videoDetails.title;
		this.url = videoDetails.video_url;
		this.videoDetails = videoDetails;
		return {
			then: (callback) => {
				callback()
			}
		}
	};

	play(guild, args) {
		return new Promise(async (resolve, reject) => {
			try {
				await guild.voiceDispatcher.play(ytdl(this.url))
					.on("finish", () => resolve())
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
		return this.queue.shift();
	};
}

guilds = new Map();

const addSong = async (args) => {
	let { message, content } = args;
	let song = new Song();
	message.embed(`Recherche de la musique...`)
		.then(sent => song.setVideoDetails(content)
			.then(() => setTimeout(() => {
				if (!guilds.has(message.guild.id)) guilds.set(message.guild.id, new GuildQueue(args));
				guilds.get(message.guild.id).addSong(song);
				sent.edit(message.returnCustomEmbed(embed => embed
					.setDescription(`Musique ajoutée à la playlist avec succès ${utils.randomItem(":3", ":)", "!")}`)
					.setThumbnail(song.videoDetails.thumbnails.url)
					.setTitle(song.title)
					.setURL(song.url))
				);
			}, 2000))
		);
};

const startMusic = async (args) => {
	let { message, bot } = args;

	let currentGuild = guilds.get(message.guild.id);

	let voiceChannel = message.member.voice.channel;
	if (!voiceChannel) return message.embed(`Tu dois être dans un salon vocal pour pouvoir entendre la musique...`);
	let permissions = voiceChannel.permissionsFor(bot.user);
	if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) return message.embed(`Je n'ai pas la permission de rejoindre ce salon...`)

	if (!currentGuild || currentGuild.queue.length === 0) return message.embed(`La playlist est vide...`);

	currentGuild.setVoiceChannel(voiceChannel);
	message.embed(`Salon textuel relié`)
		.then(sent => setTimeout(() => sent.edit(message.returnEmbed(`Connection au salon vocal en cours...`))
			.then(sent => {
				setTimeout(() => {
					voiceChannel.join()
						.then(voice => {
							sent.edit(message.returnEmbed(`Connecté au salon vocal avec succès ${utils.randomItem(":3", ":)", "!")}`));
							guilds.get(message.guild.id).setVoiceDispatcher(voice);
							play(args);
						})
						.catch(err => {
							console.log(err);
							sent.edit(message.returnEmbed(`Erreur lors de la connection au salon vocal...`));

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
		return message.embed(`La playlist est vide...`);
	};
	currentGuild.next()
		.play(currentGuild, args)
		.then(() => play(args))
		.catch(err => {
			console.log(err);
			message.embed(`J'ai rencontré une erreur inconnue...`);
			currentGuild.voiceChannel.leave();
		});
};

const stopMusic = async (args) => {
	let { message } = args;
	if (guilds.has(message.guild.id) && guilds.get(message.guild.id).voiceDispatcher) {
		let currentGuild = guilds.get(message.guild.id);
		await currentGuild.voiceDispatcher.disconnect();
		await currentGuild.voiceChannel.leave();
		message.embed(`Musique stoppée avec succès`);
	} else message.embed(`Tu dois d'abord démarrer la musique pour la stopper !`);
};

const skipSong = async (args) => {
	let { message } = args;
	if (guilds.has(message.guild.id) && guilds.get(message.guild.id).voiceDispatcher) {
		play(args);
	} else message.embed(`Tu dois d'abord démarrer la musique pour la mettre sur play !`);
};

module.exports = { addSong, startMusic, stopMusic, skipSong };