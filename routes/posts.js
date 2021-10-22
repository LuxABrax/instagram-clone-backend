const express = require("express");
const {
	getPost,
	getPosts,
	uploadPhotoPost,
	getPostsFromFollowing,
	addLike,
	removeLike,
	addSave,
	removeSave,
	getSavedPosts,
	getExplorePosts,
	addComment,
} = require("../controllers/posts");

const router = express.Router();

router.route("/post/:id").post(uploadPhotoPost);
router.route("/explore/:id").get(getExplorePosts);
router.route("/profile/:id").get(getPosts);
router.route("/following/:id").get(getPostsFromFollowing);
router.route("/saved/:id").get(getSavedPosts);
router.route("/like/:id/:uid").put(addLike);
router.route("/dislike/:id/:uid").put(removeLike);
router.route("/save/:id/:uid").put(addSave);
router.route("/unsave/:id/:uid").put(removeSave);
router.route("/comment/:id").put(addComment);
router.route("/:id").get(getPost);

module.exports = router;
