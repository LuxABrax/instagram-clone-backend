const mongoose = require("mongoose");

const UserInfoSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	posts: { type: [String] },
	followers: { type: [String] },
	following: { type: [String] },
	saved: { type: [String] },
});

module.exports = mongoose.model("UserInfo", UserInfoSchema);
