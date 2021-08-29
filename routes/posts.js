const express = require("express");
const {
	// getUsers,
	// getUser,
	// createUser,
	// updateUser,
	// deleteUser,
	// getUserByName,
	// getUsersForFollowing,
	getPost,
	getPosts,
	uploadPhotoPost,
	getPostsFromFollowing,
	addLike,
	removeLike,
	addSave,
	removeSave,
	getSavedPosts,
	addComment,
} = require("../controllers/posts");

const router = express.Router();

// router.route("/").get(getUsers).post(createUser);
// router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);
router.route("/post/:id").post(uploadPhotoPost);
router.route("/profile/:id").get(getPosts);
router.route("/following/:id").get(getPostsFromFollowing);
router.route("/saved/:id").get(getSavedPosts);
router.route("/like/:id/:uid").put(addLike);
router.route("/dislike/:id/:uid").put(removeLike);
router.route("/save/:id/:uid").put(addSave);
router.route("/unsave/:id/:uid").put(removeSave);
router.route("/comment/:id").put(addComment);
router.route("/:id").get(getPost);

// router.route("/n/:name").get(getUserByName);

module.exports = router;
