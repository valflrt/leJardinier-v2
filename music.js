const ytdl = require("ytdl-core");

let queue = new Array();

class Song {
	async constructor(content) {
		let { videoDetails } = await ytdl.getInfo(content);
		this.name = videoDetails.title;
		this.url = videoDetails.video_url;
		this.videoDetails = videoDetails;
	}
}

const add = async (args) => {
	let { message, content } = args;

	new Song(content);

};

module.exports = { add };