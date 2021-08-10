const express = require("express");
const {
	followUser,
	getFollowingUsers,
	getNotFollowingUsers,
} = require("../controllers/followers");

const router = express.Router();

router.route("/").put(followUser);
router.route("/following").get(getFollowingUsers);
router.route("/notfollowing").get(getNotFollowingUsers);

module.exports = router;
