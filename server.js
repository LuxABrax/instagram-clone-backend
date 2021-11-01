const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const http = require("http");
// const socketio = require("socket.io");
const socketio = require("socket.io");

// Load env vars
dotenv.config({ path: "./config/config.env" });
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

const router = require("./routes/router");

const app = express();
const server = http.createServer(app);
// const io = socketio(server);
const io = socketio(server);

app.use(cors());
// Body parser
app.use(express.json());

// Cookie parser
// app.use(cookieParser());

// Dev logging middlware
// if (process.env.NODE_ENV === "development") {
// 	app.use(morgan("dev"));
// }

// File upload
app.use(fileUpload());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Routers
app.use("/api/v1", router);
app.use(errorHandler);

// io.on("connection", socket => {
// 	console.log(socket.id); // x8WIv7-mJelg7on_ALbx
// });
io.on("connection", socket => {
	console.log("connected");
	socket.on("disconnect", () => {
		console.log("user disconnected");
	});
});

const serverM = server.listen(
	PORT,
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
	)
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
	console.log(`Error: ${err.message}`.red.bold);
	// CLose server & exit process
	serverM.close(() => {
		process.exit(1);
	});
});
