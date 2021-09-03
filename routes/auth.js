const express = require("express");
const {
	register,
	login,
	checkEmailName,
	checkPassword,
	changePassword,
} = require("../controllers/auth");

const router = express.Router();

// const { protect } = require("../middleware/auth");
router.post("/checkemailname", checkEmailName);
router.post("/register", register);
router.post("/login", login);
router.post("/check", checkPassword);
router.put("/change", changePassword);
// router.get("/me", protect, getMe);
// router.put("/updatedetails", protect, updateDetails);
// router.put("/updatepassword", protect, updatePassword);
// router.post("/forgotpassword", forgotPassword);
// router.put("/resetpassword/:resettoken", resetPassword);

module.exports = router;
