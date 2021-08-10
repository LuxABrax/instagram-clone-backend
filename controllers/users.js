const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const UserInfo = require("../models/UserInfo");
const path = require("path");

// @desc        Get All Users
// @route       GET /api/v1/users
// @access      Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
	const users = await User.find();

	res.status(200).json({ success: true, data: users });
});

// @desc        Get single user
// @route       GET /api/v1/users/:id
// @access      Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	res.status(200).json({ success: true, data: user });
});

// @desc        Get single user with name
// @route       GET /api/v1/users/n/:name
// @access      Private/Admin
exports.getUserByName = asyncHandler(async (req, res, next) => {
	const user = await User.find({ name: req.params.name });

	const { _id, name, fullName, description, posts, followers, following } =
		user[0];

	const returnUser = {
		_id,
		name,
		fullName,
		description,
		posts,
		followers,
		following,
	};

	res.status(200).json({ success: true, data: returnUser });
});

// @desc        Get single user with name
// @route       GET /api/v1/users/fff
// @access      Private/Admin
exports.getUsersForFollowing = asyncHandler(async (req, res, next) => {
	const { id } = req.body;
	const users = await User.find();
	const userInfos = await UserInfo.find();
	const returnUsers = [];
	console.log(id);
	for (userInfo of userInfos) {
		// console.log(userInfo);
		let fString = userInfo.followers;
		let followersList = fString.substring(2, fString.length - 2).split(",");
		console.log(followersList);
		followersList.forEach(fol => {
			if (fol === id) console.log("inside");
		});
		if (id in followersList) console.log("in list");
	}

	res.status(200).json({ success: true, data: id });
});

// @desc        Create user
// @route       POST /api/v1/users
// @access      Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
	const user = await User.create(req.body);

	res.status(201).json({ success: true, data: user });
});

// @desc        Update user
// @route       PUT /api/v1/user/:id
// @access      Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({ success: true, data: user });
});

// @desc        Delete user
// @route       DELETE /api/v1/user/:id
// @access      Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
	await User.findByIdAndDelete(req.params.id);

	res.status(200).json({ success: true, data: {} });
});

// @desc        Upload photo for user
// @route       PUT /api/v1/users/:id/photo
// @access      Private
exports.uploadProfilePhoto = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!req.files) {
		return res.json({ success: false, message: "Please upload a photo" });
	}

	const file = req.files.file;

	// Make sure the image is a photo
	if (!file.mimetype.startsWith("image")) {
		return res.json({ success: false, message: "Please upload an image file" });
	}

	// Check file size
	if (file.size > process.env.MAX_FILE_UPLOAD) {
		return res.json({
			success: false,
			message: `Please upload an image less than ${process.env.MAX_FILE_UPLOAD} Bytes`,
		});
	}

	// Create custom filename
	file.name = `photo_${user._id}${path.parse(file.name).ext}`;

	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
		if (err) {
			console.error(err);
			return res.json({ success: false, message: "Problem with file upload" });
		}

		await User.findByIdAndUpdate(req.params.id, { photo: file.name });
		res.status(200).json({ success: true, data: file.name });
	});
});
