const express = require("express");
const {
	followUser,
	getFollowedUsers,
	getNotFollowedUsers,
	getFollowingUsers,
	unFollowUser,
	removeFollowUser,
	checkIfUserIsFollowing,
	getPopupInfo,
} = require("../controllers/followers");

const router = express.Router();

router.route("/:id/:fid").put(followUser);
router.route("/unf/:id/:fid").put(unFollowUser);
router.route("/rf/:id/:fid").put(removeFollowUser);
router.route("/:id/followed").get(getFollowedUsers);
router.route("/:id/notfollowed").get(getNotFollowedUsers);
router.route("/:id/following").get(getFollowingUsers);
router.route("/:id/isfollowing/:fid").get(checkIfUserIsFollowing);
router.route("/popup/:id/:fid").get(getPopupInfo);

module.exports = router;
