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

	const fileNames = [];

	const hasMultipleFiles = req.files.files.length > 1;

	const files = hasMultipleFiles ? req.files.files : [req.files.files];

	files.forEach(file => {
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

		file.name = `post_${user._id}${r}${r1}${path.parse(file.name).ext}`;

		fileNames.push(file.name);

		file.mv(`${process.env.FILE_UPLOAD_PATH}/posts/${file.name}`, async err => {
			if (err) {
				console.error(err);
				return res.json({
					success: false,
					message: "Problem with file upload",
				});
			}
		});
	});

	const post = await Post.create({
		name: user.name,
		uId: user._id,
		description,
		photo: fileNames[0],
		isCarousel: hasMultipleFiles,
		photos: fileNames.slice(1),
	});

	// Update post number
	const postNum = user.posts + 1;
	await User.findByIdAndUpdate(
		user._id.toString(),
		{ posts: postNum },
		{ new: true }
	);
	await UserInfo.findByIdAndUpdate(
		user._id.toString(),
		{ $addToSet: { posts: [post._id.toString()] } },
		{ new: true }
	);

	res.status(200).json({ success: true, data: post });
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

// @desc        Get posts on Explore
// @route       GET /api/v1/posts/explore/:id
// @access      Private
exports.getExplorePosts = asyncHandler(async (req, res, next) => {
	const id = req.params.id;

	const posts = await Post.find({ uId: { $ne: id } });

	posts.sort(() => Math.random() - 0.5);

	if (!posts) return res.json({ success: false, message: "No posts" });

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
	ids.unshift(id);
	// console.log(ids);
	const posts = await Post.find({ uId: { $in: ids } });

	if (!posts)
		return res.json({ success: false, message: "No posts with that id" });

	res.status(200).json({ success: true, data: posts.reverse() });
});

// @desc        Get Saved posts
// @route       GET /api/v1/posts/saved/:id
// @access      Private
exports.getSavedPosts = asyncHandler(async (req, res, next) => {
	const id = req.params.id;
	const userInfo = await UserInfo.findById(id);
	const ids = userInfo.saved;
	ids.shift();

	const posts = await Post.find({ _id: { $in: ids } });

	if (!posts)
		return res.json({ success: false, message: "No posts with that id" });

	res.status(200).json({ success: true, data: posts });
});

// @desc        Add Like to Post
// @route       PUT /api/v1/posts/like/:id/:uid
// @access      Private
exports.addLike = asyncHandler(async (req, res, next) => {
	const id = req.params.id;
	const uid = req.params.uid;
	const post = await Post.findById(id);

	const checkIfLiked = post.likes.filter(l => l === uid).length > 0;

	if (!checkIfLiked) post.likes.push(uid);

	const nPost = await Post.findByIdAndUpdate(id, post, { new: true });

	if (!nPost) return res.json({ success: false, message: "No post" });

	res.status(200).json({ success: true, data: nPost });
});

// @desc        Remove Like from Post
// @route       PUT /api/v1/posts/dislike/:id/:uid
// @access      Private
exports.removeLike = asyncHandler(async (req, res, next) => {
	const id = req.params.id;
	const uid = req.params.uid;
	const post = await Post.findById(id);

	const checkIfLiked = post.likes.filter(l => l === uid).length > 0;

	if (!checkIfLiked) {
		return res.json({ success: false, message: "Not liked." });
	}

	const nLPost = { likes: post.likes.filter(l => l !== uid) };
	const nPost = await Post.findByIdAndUpdate(id, nLPost, { new: true });

	if (!nPost) return res.json({ success: false, message: "No post" });

	res.status(200).json({ success: true, data: nPost });
});

// @desc        Save Post
// @route       PUT /api/v1/posts/save/:id/:uid
// @access      Private
exports.addSave = asyncHandler(async (req, res, next) => {
	const id = req.params.id;
	const uid = req.params.uid;
	const post = await Post.findById(id);
	const userInfo = await UserInfo.findById(uid);

	const checkIfSaved = post.saved.filter(l => l === uid).length > 0;

	if (!checkIfSaved) post.saved.push(uid);
	userInfo.saved.push(id);

	const nPost = await Post.findByIdAndUpdate(id, post, { new: true });
	await UserInfo.findByIdAndUpdate(uid, userInfo, { new: true });

	if (!nPost) return res.json({ success: false, message: "No post" });

	res.status(200).json({ success: true, data: nPost });
});

// @desc        Remove Post Save
// @route       PUT /api/v1/posts/unsave/:id/:uid
// @access      Private
exports.removeSave = asyncHandler(async (req, res, next) => {
	const id = req.params.id;
	const uid = req.params.uid;
	const post = await Post.findById(id);
	const userInfo = await UserInfo.findById(uid);

	const checkIfSaved = post.saved.filter(l => l === uid).length > 0;

	if (!checkIfSaved) {
		return res.json({ success: false, message: "Not saved." });
	}

	const uInfo = { saved: userInfo.saved.filter(l => l !== id) };
	const nLPost = { saved: post.saved.filter(l => l !== uid) };

	await UserInfo.findByIdAndUpdate(uid, uInfo, { new: true });
	const nPost = await Post.findByIdAndUpdate(id, nLPost, { new: true });

	if (!nPost) return res.json({ success: false, message: "No post" });

	res.status(200).json({ success: true, data: nPost });
});

// @desc        Add Comment
// @route       PUT /api/v1/posts/comment/:id
// @access      Private
exports.addComment = asyncHandler(async (req, res, next) => {
	const id = req.params.id;
	const { cid, uid, name, text } = req.body;
	const post = await Post.findById(id);

	// add created at and comment id ////
	const comment = {
		cId: cid,
		uId: uid,
		uName: name,
		text,
		createdAt: Date.now(),
	};

	post.comments.push(JSON.stringify(comment));

	const nPost = await Post.findByIdAndUpdate(id, post, { new: true });

	if (!nPost) return res.json({ success: false, message: "No post" });

	res.status(200).json({ success: true, data: nPost });
});
