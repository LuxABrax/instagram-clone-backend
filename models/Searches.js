const mongoose = require("mongoose");

const SearchesSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	searches: { type: [String] },
});

module.exports = mongoose.model("Searches", SearchesSchema);
