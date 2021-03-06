const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
	name: {
		type: String,
	},
	uId: {
		type: String,
	},
	photo: {
		type: String,
	},
	isCarousel: {
		type: Boolean,
	},
	photos: {
		type: [String],
	},
	description: {
		type: String,
	},
	likes: {
		type: [String],
	},
	comments: {
		type: [String],
	},
	saved: {
		type: [String],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Post", PostSchema);
