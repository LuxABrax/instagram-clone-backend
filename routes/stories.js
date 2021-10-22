const express = require("express");
const {
	uploadPhotoStory,
	getStory,
	addSeen,
} = require("../controllers/stories");

const router = express.Router();

router.route("/story/:id").post(uploadPhotoStory).get(getStory);
router.route("/see/:id/:uid").put(addSeen);

module.exports = router;
