const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const UserInfo = require("../models/UserInfo");

exports.checkIfFollowing = asyncHandler(async (userId, followId) => {
	const userInfo = await UserInfo.findById(userId);

	const userFollows = userInfo.following.includes(followId);

	return userFollows;
});

exports.reformatUser = user => {
	const {
		description,
		photo,
		posts,
		followers,
		following,
		_id,
		name,
		fullName,
	} = user;

	return {
		_id,
		name,
		fullName,
		description,
		photo,
		posts,
		followers,
		following,
	};
};
