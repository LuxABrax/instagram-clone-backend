const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const Story = require("../models/Story");
const path = require("path");
const UserInfo = require("../models/UserInfo");

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
