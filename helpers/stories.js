const unSeenIdx = uStories => {
	let firstUnseen = undefined;
	uStories.forEach((s, idx) => {
		if (s.seen === false && firstUnseen === undefined) {
			firstUnseen = idx;
		}
	});
	if (firstUnseen === undefined) return 0;
	return firstUnseen;
};

exports.sortUnseenAndSeenStories = stories => {
	const unSeenArr = [];
	const seenArr = [];

	stories.forEach((s, idx) => {
		const indexObj = {
			// userIdx: idx,
			storyIdx: unSeenIdx(s.stories),
		};
		const newS = { ...s, indexes: indexObj };
		if (s.user.hasUnseen) {
			unSeenArr.push(newS);
		} else {
			seenArr.push(newS);
		}
	});

	if (unSeenArr.length > 0)
		unSeenArr.sort(
			(a, b) => new Date(b.user.lastStory) - new Date(a.user.lastStory)
		);
	if (seenArr.length > 0)
		seenArr.sort(
			(a, b) => new Date(b.user.lastStory) - new Date(a.user.lastStory)
		);
	console.log(unSeenArr);
	const arr = [...unSeenArr, ...seenArr];
	return arr;
};
