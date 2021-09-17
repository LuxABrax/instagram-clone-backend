const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const UserInfo = require("../models/UserInfo");
const { checkIfFollowing, reformatUser } = require("../helpers/followers");
const Post = require("../models/Post");

// @desc        UnFollow another user
// @route       PUT /api/v1/follow/unf/:id/:fid
// @access      Public
exports.unFollowUser = asyncHandler(async (req, res, next) => {
	const { id, fid } = req.params;
	// console.log(id, fid);
	const uId = { _id: id };
	const fId = { _id: fid };

	if (id === fid)
		return res.json({ success: false, message: "ID's are identical" });

	const isFollowing = await checkIfFollowing(id, fid);

	if (!isFollowing)
		return res.json({
			success: false,
			message: "You are not following this user.",
		});

	const user1 = await User.findById(id);
	const user2 = await User.findById(fid);

	const following = user1.following - 1;
	const followers = user2.followers - 1;

	const user = await User.findOneAndUpdate(uId, { following }, { new: true });
	const follow = await User.findOneAndUpdate(
		fId,
		{ followers: followers },
		{ new: true }
	);

	const userInfo = await UserInfo.updateOne(
		uId,
		{ $pullAll: { following: [fid] } },
		{ new: true }
	);
	const followInfo = await UserInfo.updateOne(
		fId,
		{ $pullAll: { followers: [id] } },
		{ new: true }
	);

	res
		.status(200)
		.json({ success: true, data: { user, userInfo, follow, followInfo } });
});

// @desc        Remove Follower
// @route       PUT /api/v1/follow/rf/:id/:fid
// @access      Public
exports.removeFollowUser = asyncHandler(async (req, res, next) => {
	const { id, fid } = req.params;
	// console.log(id, fid);
	const uId = { _id: id };
	const fId = { _id: fid };

	if (id === fid)
		return res.json({ success: false, message: "ID's are identical" });

	const isFollowing = await checkIfFollowing(id, fid);

	if (!isFollowing)
		return res.json({
			success: false,
			message: "You are not followed by this user.",
		});

	const user1 = await User.findById(id);
	const user2 = await User.findById(fid);

	const followers = user1.followers - 1;
	const following = user2.following - 1;

	const user = await User.findOneAndUpdate(uId, { followers }, { new: true });
	const follow = await User.findOneAndUpdate(
		fId,
		{ following: following },
		{ new: true }
	);

	const userInfo = await UserInfo.updateOne(
		uId,
		{ $pullAll: { followers: [fid] } },
		{ new: true }
	);
	const followInfo = await UserInfo.updateOne(
		fId,
		{ $pullAll: { following: [id] } },
		{ new: true }
	);

	res
		.status(200)
		.json({ success: true, data: { user, userInfo, follow, followInfo } });
});

// @desc        Follow another user
// @route       PUT /api/v1/follow/:id/:fid
// @access      Public
exports.followUser = asyncHandler(async (req, res, next) => {
	const { id, fid } = req.params;
	// console.log(id, fid);
	const uId = { _id: id };
	const fId = { _id: fid };

	if (id === fid)
		return res.json({ success: false, message: "ID's are identical" });

	const isFollowing = await checkIfFollowing(id, fid);

	if (isFollowing)
		return res.json({
			success: false,
			message: "You are already following this user.",
		});

	const user1 = await User.findById(id);
	const user2 = await User.findById(fid);

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
		{ $addToSet: { following: [fid] } },
		{ new: true }
	);
	const followInfo = await UserInfo.findOneAndUpdate(
		fId,
		{ $addToSet: { followers: [id] } },
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

// @desc        Check if following user
// @route       GET /api/v1/follow/:id/isfollowing/:fid
// @access      Public
exports.checkIfUserIsFollowing = asyncHandler(async (req, res, next) => {
	const { id, fid } = req.params;

	if (id === fid)
		return res.json({ success: false, message: "ID's are identical" });

	const isFollowing = await checkIfFollowing(id, fid);

	if (isFollowing)
		return res.status(200).json({ success: true, isfollowing: true });

	res.status(200).json({ success: true, isfollowing: false });
});

// @desc        Get Popup info
// @route       GET /api/v1/follow/popup/:id/:fid
// @access      Public
exports.getPopupInfo = asyncHandler(async (req, res, next) => {
	const { id, fid } = req.params;

	if (id === fid)
		return res.json({ success: false, message: "ID's are identical" });

	const user = await User.find({ _id: fid });

	if (user.length === 0)
		return res.json({ success: false, message: "No user with that id." });

	const isFollowing = await checkIfFollowing(id, fid);

	const {
		_id,
		name,
		photo,
		fullName,
		description,
		posts,
		followers,
		following,
	} = user[0];

	const fPosts = await Post.find({ uId: fid });
	let postGallery = [];

	if (fPosts)
		fPosts.map((p, idx) => {
			if (idx <= 2) postGallery.push({ id: p._id, photo: p.photo });
		});

	const returnPopup = {
		_id,
		name,
		photo,
		fullName,
		posts,
		followers,
		following,
		isFollowing,
		postGallery,
	};

	res.status(200).json({ success: true, popupInfo: returnPopup });
});
