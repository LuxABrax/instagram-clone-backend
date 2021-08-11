const express = require("express");
const {
	followUser,
	getFollowedUsers,
	getNotFollowedUsers,
	getFollowingUsers,
} = require("../controllers/followers");

const router = express.Router();

router.route("/").put(followUser);
router.route("/followed").get(getFollowedUsers);
router.route("/notfollowed").get(getNotFollowedUsers);
router.route("/following").get(getFollowingUsers);

module.exports = router;
