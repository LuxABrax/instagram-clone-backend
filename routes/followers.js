const express = require("express");
const {
	followUser,
	getFollowedUsers,
	getNotFollowedUsers,
	getFollowingUsers,
} = require("../controllers/followers");

const router = express.Router();

router.route("/:id/:fid").put(followUser);
router.route("/:id/followed").get(getFollowedUsers);
router.route("/:id/notfollowed").get(getNotFollowedUsers);
router.route("/:id/following").get(getFollowingUsers);

module.exports = router;
