const mongoose = require("mongoose");
const { Schema } = mongoose;

const memberSchema = new Schema({
	username: String,
	id: String,
	stats: {
		messageCount: {
			type: Number,
			default: 0
		}
	}
})

const Member = mongoose.model("Member", memberSchema);

const guildSchema = new Schema({
	name: String,
	id: String,
	stats: {
		memberCount: {
			type: Number,
			default: 0
		}
	},
	members: [memberSchema]
});

const Guild = mongoose.model("Guild", guildSchema);

module.exports = { Guild, Member };