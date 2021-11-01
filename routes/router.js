const express = require("express");

const auth = require("./auth");
const users = require("./users");
const followers = require("./followers");
const posts = require("./posts");
const searches = require("./searches");
const stories = require("./stories");

const router = express.Router();

router.use("/auth", auth);
router.use("/users", users);
router.use("/follow", followers);
router.use("/posts", posts);
router.use("/searches", searches);
router.use("/stories", stories);

module.exports = router;
