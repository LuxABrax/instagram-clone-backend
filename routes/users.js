const express = require("express");
const {
	getUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
	getUserByName,
	getUsersForFollowing,
	uploadProfilePhoto,
	getUserPhotoName,
} = require("../controllers/users");

const router = express.Router();

router.route("/").get(getUsers).post(createUser);
router.route("/fff").get(getUsersForFollowing);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);
router.route("/:id/photo").put(uploadProfilePhoto);

router.route("/n/:name").get(getUserByName);
router.route("/i/:id").get(getUserPhotoName);

module.exports = router;
