const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const UserInfo = require("../models/UserInfo");
const Post = require("../models/Post");
const path = require("path");

// @desc        Upload photo post
// @route       POST /api/v1/posts/post/:id/
// @access      Private
exports.uploadPhotoPost = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id);
	const { description } = req.body;

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
	const r = Math.floor(Math.random() * 100);
	const r1 = Math.floor(Math.random() * 200 + 10);
	console.log(r, r1);
	file.name = `post_${user._id}${r}${r1}${path.parse(file.name).ext}`;

	file.mv(`${process.env.FILE_UPLOAD_PATH}/posts/${file.name}`, async err => {
		if (err) {
			console.error(err);
			return res.json({ success: false, message: "Problem with file upload" });
		}

		const post = await Post.create({
			name: user.name,
			uId: user._id,
			description,
			photo: file.name,
		});
		res.status(200).json({ success: true, data: post });
	});
});

// @desc        Get post
// @route       GET /api/v1/posts/:id/
// @access      Private
exports.getPost = asyncHandler(async (req, res, next) => {
	const id = req.params.id;
	const post = await Post.findById(id);

	if (!post)
		return res.json({ success: false, message: "No post with that id" });

	res.status(200).json({ success: true, data: post });
});

// @desc        Get posts by user id
// @route       GET /api/v1/posts/profile/:id
// @access      Private
exports.getPosts = asyncHandler(async (req, res, next) => {
	const id = req.params.id;
	const posts = await Post.find({ uId: id });

	if (!posts)
		return res.json({ success: false, message: "No post with that id" });

	res.status(200).json({ success: true, data: posts });
});

// @desc        Get posts by following users
// @route       GET /api/v1/posts/following/:id
// @access      Private
exports.getPostsFromFollowing = asyncHandler(async (req, res, next) => {
	const id = req.params.id;
	const userInfo = await UserInfo.findById(id);
	const ids = userInfo.following;
	ids.shift();
	console.log(ids);
	const posts = await Post.find({ uId: { $in: ids } });

	if (!posts)
		return res.json({ success: false, message: "No posts with that id" });

	res.status(200).json({ success: true, data: posts });
});
