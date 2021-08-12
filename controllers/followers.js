const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const UserInfo = require("../models/UserInfo");
const { checkIfFollowing, reformatUser } = require("../helpers/followers");

// @desc        Follow another user
// @route       PUT /api/v1/follow
// @access      Public
exports.followUser = asyncHandler(async (req, res, next) => {
	const { userId, followId } = req.body;
	const uId = { _id: userId };
	const fId = { _id: followId };

	if (userId === followId)
		return res.json({ success: false, message: "ID's are identical" });

	const isFollowing = await checkIfFollowing(userId, followId);

	if (isFollowing)
		return res.json({
			success: false,
			message: "You are already following this user.",
		});

	const user1 = await User.findById(userId);
	const user2 = await User.findById(followId);

	const following = user1.following + 1;
	const followers = user2.followers + 1;

	const user = await User.findOneAndUpdate(uId, { following }, { new: true });
	const follow = await User.findOneAndUpdate(
		fId,
		{ followers: followers },
		{ new: true }
	);

	const userInfo = await UserInfo.findOneAndUpdate(
		uId,
		{ $addToSet: { following: [followId] } },
		{ new: true }
	);
	const followInfo = await UserInfo.findOneAndUpdate(
		fId,
		{ $addToSet: { followers: [userId] } },
		{ new: true }
	);

	res
		.status(200)
		.json({ success: true, data: { user, userInfo, follow, followInfo } });
});

// @desc        Get users that are followed by user
// @route       GET /api/v1/follow/:id/followed
// @access      Public
exports.getFollowedUsers = asyncHandler(async (req, res, next) => {
	const userId = req.params.id;

	const userInfo = await UserInfo.findById(userId);

	if ((await userInfo.following.length) === 0)
		return res.json({ success: false, message: "Not following anybody" });

	const ids = userInfo.following;
	ids.shift();

	const users = await User.find({ _id: { $in: ids } });

	const newUsers = users.map(user => {
		return reformatUser(user);
	});

	res.status(200).json({ success: true, users: newUsers });
});

// @desc        Get users that are not followed by user
// @route       GET /api/v1/follow/:id/notfollowed
// @access      Public
exports.getNotFollowedUsers = asyncHandler(async (req, res, next) => {
	const userId = req.params.id;

	const userInfo = await UserInfo.findById(userId);

	const ids = userInfo.following;
	ids.shift();
	ids.push(userId);

	const users = await User.find({ _id: { $nin: ids } });

	const newUsers = users.map(user => {
		return reformatUser(user);
	});

	res.status(200).json({ success: true, users: newUsers });
});

// @desc        Get users that are following user
// @route       GET /api/v1/follow/:id/following
// @access      Public
exports.getFollowingUsers = asyncHandler(async (req, res, next) => {
	const userId = req.params.id;

	const userInfo = await UserInfo.findById(userId);

	if ((await userInfo.followers.length) === 0)
		return res.json({ success: false, message: "No followers" });

	const ids = userInfo.followers;
	ids.shift();

	const users = await User.find({ _id: { $in: ids } });

	const newUsers = users.map(user => {
		return reformatUser(user);
	});

	res.status(200).json({ success: true, users: newUsers });
});
