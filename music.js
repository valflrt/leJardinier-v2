const ytdl = require("youtube-dl");

const add = (args) => {
	let { message, content } = args;

	ytdl.getInfo(content);
};

module.exports = {}