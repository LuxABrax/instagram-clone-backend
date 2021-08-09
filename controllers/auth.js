const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   Public
exports.register = asyncHandler(async (req, res, next) => {
	const { name, email, password, fullName } = req.body;

	const hasEmail = await User.findOne({ email });
	if (hasEmail) res.status(401).json({ message: "Email already registered" });

	const hasName = await User.findOne({ name });
	if (!hasEmail && hasName)
		res.status(401).json({ message: "Name already registered" });

	if (!hasEmail && !hasName) {
		const user = await User.create({ name, email, password, fullName });

		res.status(200).json({ message: "User Created", user: user });
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
