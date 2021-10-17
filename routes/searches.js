const express = require("express");
const {
	addSearch,
	deleteSearch,
	deleteSearches,
	getSearches,
} = require("../controllers/searches");

const router = express.Router();

router.route("/:id/:sid").put(addSearch).delete(deleteSearch);
router.route("/:id").get(getSearches).delete(deleteSearches);

module.exports = router;
