const asyncHandler = require("../middleware/async");
const Searches = require("../models/Searches");

// @desc        Add search
// @route       PUT /api/v1/searches/:id/:sid
// @access      Private/Admin
exports.addSearch = asyncHandler(async (req, res, next) => {
	const { id, sid } = req.params;

	const searches = await Searches.findById(id);

	if (searches === null) {
		let newS = await Searches.create({
			_id: id,
			searches: `${sid}`,
		});
		return res.status(201).json({ success: true, data: newS.searches });
	}

	const alreadySearched = searches.searches.filter(s => s === sid).length > 0;

	if (alreadySearched)
		return res.status(201).json({
			success: false,
			message: "Already searched",
			data: searches.searches,
		});

	searches.searches.push(sid);

	const newSearches = await Searches.findOneAndUpdate(
		id,
		{ searches: searches.searches },
		{ new: true }
	);

	res.status(201).json({ success: true, data: newSearches.searches });
});

// @desc        Delete 1 search
// @route       DELETE /api/v1/searches/:id/:sid
// @access      Private/Admin
exports.deleteSearch = asyncHandler(async (req, res, next) => {
	const { id, sid } = req.params;

	const searches = await Searches.findById(id);

	if (searches === null) {
		let newS = await Searches.create({
			_id: id,
			searches: "[]",
		});
		return res
			.status(201)
			.json({
				success: false,
				message: "No searches yet",
				data: newS.searches,
			});
	}

	if (searches.searches.length === 0)
		return res.status(201).json({
			success: false,
			message: "Searches are empty",
			data: searches.searches,
		});

	const isNotSearched = searches.searches.filter(s => s === sid).length === 0;

	if (isNotSearched)
		return res
			.status(201)
			.json({
				success: false,
				message: "Not searched",
				data: searches.searches,
			});

	const searchesRemoved = searches.searches.filter(s => s !== sid);

	const newSearches = await Searches.findOneAndUpdate(
		id,
		{ searches: searchesRemoved },
		{ new: true }
	);

	res.status(201).json({
		success: true,
		message: "Removed from searches",
		data: newSearches.searches,
	});
});

// @desc        Delete all searches
// @route       DELETE /api/v1/searches/:id
// @access      Private/Admin
exports.deleteSearches = asyncHandler(async (req, res, next) => {
	const { id } = req.params;

	const searches = await Searches.findById(id);

	if (searches === null) {
		let newS = await Searches.create({
			_id: id,
			searches: "[]",
		});
		return res
			.status(201)
			.json({ success: false, message: "No searches yet", data: newS });
	}

	if (searches.searches.length === 0)
		return res.status(201).json({
			success: false,
			message: "Searches are empty",
			data: searches.searches,
		});

	const newSearches = await Searches.findOneAndUpdate(
		id,
		{ searches: [] },
		{ new: true }
	);

	res.status(201).json({
		success: true,
		message: "Removed all searches",
		data: newSearches.searches,
	});
});

// @desc        Get all searches
// @route       GET /api/v1/searches/:id
// @access      Private/Admin
exports.getSearches = asyncHandler(async (req, res, next) => {
	const { id } = req.params;

	const searches = await Searches.findById(id);

	if (searches === null) {
		let newS = await Searches.create({
			_id: id,
			searches: "[]",
		});
		return res
			.status(201)
			.json({ success: true, message: "No searches yet", data: newS });
	}

	if (searches.searches.length === 0)
		return res.status(201).json({
			success: true,
			message: "Searches are empty",
			data: searches.searches,
		});

	res.status(201).json({
		success: true,
		message: "Get all searches",
		data: searches.searches,
	});
});
