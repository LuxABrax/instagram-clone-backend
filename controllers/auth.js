const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const UserInfo = require("../models/UserInfo");
const Searches = require("../models/Searches");

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   Public
exports.register = asyncHandler(async (req, res, next) => {
	const { name, email, password, fullName } = req.body;

	const hasEmail = await User.findOne({ email });
	if (hasEmail)
		res.json({
			success: false,
			message: `Email ${email} belongs to another account.`,
		});

	const hasName = await User.findOne({ name });
	if (!hasEmail && hasName)
		res.json({
			success: false,
			message: "Username not available. Choose another one.",
		});

	if (!hasEmail && !hasName) {
		const user = await User.create({ name, email, password, fullName });
		const userInfo = await UserInfo.create({
			_id: user._id,
			posts: "[]",
			followers: "[]",
			following: "[]",
			saved: "[]",
		});
		await Searches.create({
			_id: user._id,
			searches: "[]",
		});
		console.log(userInfo);

		res.status(200).json({ message: "User Created", user: user });
	}
});

//@desc     Check if email or username in DB
//@route    POST /api/v1/auth/checkemailname
//@access   Public
exports.checkEmailName = asyncHandler(async (req, res, next) => {
	const { type, value } = req.body;

	if (type === "email") {
		const hasEmail = await User.findOne({ email: value });
		if (hasEmail) {
			res.json({ success: false, message: "Email already registered" });
		} else {
			res.json({ success: true, message: "Available" });
		}
	} else if (type === "name") {
		const hasName = await User.findOne({ name: value });
		if (hasName) {
			res.json({ success: false, message: "Name already registered" });
		} else {
			res.json({ success: true, message: "Available" });
		}
	}
});

//@desc     Login user
//@route    POST /api/v1/auth/login
//@access   Public
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;
	console.log("em pas: ", email, password);
	if (!email || !password) {
		return next(new ErrorResponse("Enter your email and password", 400));
	}

	let user = await User.findOne({ email }).select("+password");
	if (!user) {
		let name = email;
		user = await User.findOne({ name }).select("+password");

		if (!user) {
			// return next(
			// 	new ErrorResponse("No user with that email or username", 401)
			// );
			return res.json({
				success: false,
				message:
					"The username you entered doesn't belong to an account. Please check your username and try again.",
			});
		}
	}
	console.log(user.password);
	// const isMatch = user.password === password;

	// Check if password matches
	const isMatch = await user.matchPassword(password);

	if (!isMatch) {
		return res.json({
			success: false,
			message:
				"Sorry, your password was incorrect. Please double-check your password",
		});

		// return next(new ErrorResponse("Invalid password", 401));
	}
	res.status(200).json({ message: "User Logged In", user: user });
});

//@desc     Check Password
//@route    POST /api/v1/auth/check
//@access   Public
exports.checkPassword = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;
	console.log("em pas: ", email, password);
	if (!email || !password) {
		return next(new ErrorResponse("Enter your email and password", 400));
	}

	let user = await User.findOne({ email }).select("+password");
	if (!user) {
		let name = email;
		user = await User.findOne({ name }).select("+password");

		if (!user) {
			// return next(
			// 	new ErrorResponse("No user with that email or username", 401)
			// );
			return res.json({
				success: false,
				message:
					"The username you entered doesn't belong to an account. Please check your username and try again.",
			});
		}
	}
	console.log(user.password);
	// const isMatch = user.password === password;

	// Check if password matches
	const isMatch = await user.matchPassword(password);

	if (!isMatch) {
		return res.json({
			success: false,
			message:
				"Sorry, your password was incorrect. Please double-check your password",
		});

		// return next(new ErrorResponse("Invalid password", 401));
	}
	res.status(200).json({ success: true, message: "Password Correct" });
});

//@desc     Change Password
//@route    PUT /api/v1/auth/change
//@access   Public
exports.changePassword = asyncHandler(async (req, res, next) => {
	const { email, password, newPassword } = req.body;
	console.log("em pas: ", email, password);
	if (!email || !password || !newPassword) {
		return next(new ErrorResponse("Enter your email and password", 400));
	}

	let user = await User.findOne({ email }).select("+password");
	if (!user) {
		let name = email;
		user = await User.findOne({ name }).select("+password");
		if (!user) {
			return res.json({
				success: false,
				message:
					"The username you entered doesn't belong to an account. Please check your username and try again.",
			});
		}
	}
	console.log(user.password);

	// Check if password matches
	const isMatch = await user.matchPassword(password);

	if (!isMatch) {
		return res.json({
			success: false,
			message:
				"Sorry, your password was incorrect. Please double-check your password",
		});
	} else {
		user.password = newPassword;
		await user.save();
		res.status(200).json({ success: true, message: "Password Updated" });
	}
});
