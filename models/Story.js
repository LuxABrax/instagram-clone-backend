const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema({
	name: {
		type: String,
	},
	uId: {
		type: String,
	},
	photo: {
		type: String,
	},
	seen: {
		type: [String],
	},
	isActive: {
		type: Boolean,
		default: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Story", StorySchema);
