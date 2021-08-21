const express = require("express");
const {
	followUser,
	getFollowedUsers,
	getNotFollowedUsers,
	getFollowingUsers,
	unFollowUser,
	removeFollowUser,
} = require("../controllers/followers");

const router = express.Router();

router.route("/:id/:fid").put(followUser);
router.route("/unf/:id/:fid").put(unFollowUser);
router.route("/rf/:id/:fid").put(removeFollowUser);
router.route("/:id/followed").get(getFollowedUsers);
router.route("/:id/notfollowed").get(getNotFollowedUsers);
router.route("/:id/following").get(getFollowingUsers);

module.exports = router;
