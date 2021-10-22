const asyncHandler = require("../middleware/async");
const Story = require("../models/Story");
const User = require("../models/User");
const UserInfo = require("../models/UserInfo");
const path = require("path");

// @desc        Upload photo story
// @route       POST /api/v1/stories/story/:id/
// @access      Private
exports.uploadPhotoStory = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!req.files) {
		return res.json({ success: false, message: "Please upload a photo" });
	}

	console.log(req.files);
	const file = req.files.files;

	// Make sure the file is an image
	if (!file.mimetype.startsWith("image")) {
		return res.json({
			success: false,
			message: "Please upload an image file",
		});
	}

	// Check file size
	if (file.size > process.env.MAX_FILE_UPLOAD) {
		return res.json({
			success: false,
			message: `Please upload an image less than ${process.env.MAX_FILE_UPLOAD} Bytes`,
		});
	}
	// Create custom filename
	const r = Math.floor(Math.random() * 100);
	const r1 = Math.floor(Math.random() * 200 + 10);

	file.name = `story_${user._id}${r}${r1}${path.parse(file.name).ext}`;

	file.mv(`${process.env.FILE_UPLOAD_PATH}/stories/${file.name}`, async err => {
		if (err) {
			console.error(err);
			return res.json({
				success: false,
				message: "Problem with file upload",
			});
		}

		const story = await Story.create({
			name: user.name,
			uId: user._id,
			photo: file.name,
			seen: "[]",
		});

		await User.findByIdAndUpdate(
			user._id.toString(),
			{ hasStory: true },
			{ new: true }
		);

		const userInfo = await UserInfo.findByIdAndUpdate(
			user._id.toString(),
			{ $addToSet: { stories: [story._id.toString()] } },
			{ new: true }
		);

		res
			.status(200)
			.json({ success: true, data: story, info: userInfo.stories });
	});
});

// @desc        Get story
// @route       GET /api/v1/stories/story/:id/
// @access      Private
exports.getStory = asyncHandler(async (req, res, next) => {
	const id = req.params.id;
	const story = await Story.findById(id);

	if (!story)
		return res.json({ success: false, message: "No story with that id" });

	res.status(200).json({ success: true, data: story });
});

// @desc        See story
// @route       PUT /api/v1/stories/see/:id/:uid
// @access      Private
exports.addSeen = asyncHandler(async (req, res, next) => {
	const { id, uid } = req.params;
	const story = await Story.findById(id);

	if (!story)
		return res.json({ success: false, message: "No story with that id" });

	const newStory = await Story.findByIdAndUpdate(
		id,
		{ $addToSet: { seen: [uid] } },
		{ new: true }
	);

	res.status(200).json({ success: true, data: newStory });
});

// @desc        Get followed users that have stories
// @route       PUT /api/v1/stories/:uid
// @access      Private
exports.getUsersWithStories = asyncHandler(async (req, res, next) => {
	const { uid } = req.params;

	const userInfo = await UserInfo.findById(uid);

	const ids = userInfo.following;
	ids.shift();

	// Get followed users
	const users = await User.find({ _id: { $in: ids } });

	// Get ids of users with stories
	const usersWithStories = users.filter(u => u.hasStory === true);

	if (usersWithStories.length === 0)
		return res.json({ success: false, message: "No users with stories" });

	const uIds = usersWithStories.map(u => {
		return u._id;
	});

	// For each user find stories and return them sorted
	const usersWithStoriesArr = [];

	uIds.forEach(async uID => {
		const userWithStoryInfo = await UserInfo.findById(uID);

		const stories = await Story.find({
			_id: { $in: userWithStoryInfo.stories },
		});

		const activeStories = stories.filter(s => s.isActive);

		// Filter stories that are posted less than 24 hours ago
		const checkedStories = activeStories.filter(s => {
			const storyDate = new Date(s.createdAt);
			const now = new Date(Date.now());
			const diff = Math.abs(now - storyDate) / (1000 * 60 * 60);

			if (diff >= 24) {
				Story.findByIdAndUpdate(s._id, { isActive: false }, { new: true });
			}
			if (diff < 24) return s;
		});

		const currentUser = await User.findById(uID);
		const userObj = {
			user: {
				id: currentUser._id.toString(),
				name: currentUser.name,
				photo: currentUser.photo,
				hasUnseen: false,
				lastStory: undefined,
			},
			stories: [],
		};

		checkedStories.map(s => {
			const isSeen = s.seen.filter(i => i === currentUser._id).length > 0;
			if (isSeen === false) userObj.user.hasUnseen = true;

			const storyObj = {
				seen: isSeen,
				id: s._id.toString(),
				photo: s.photo,
				createdAt: s.createdAt,
			};
			userObj.stories.push(storyObj);
		});

		userObj.stories.sort(
			(a, b) => new Date(a.createdAt) - new Date(b.createdAt)
		);
		userObj.user.lastStory =
			userObj.stories[userObj.stories.length - 1].createdAt;

		usersWithStoriesArr.push(userObj);

		if (usersWithStoriesArr.length === uIds.length) {
			const data = await JSON.stringify(usersWithStoriesArr);
			return res.status(200).json({
				success: true,
				data: data,
			});
		}
	});
});
