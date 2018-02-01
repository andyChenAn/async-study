function asyncReduceRight (arr , memo , iterator , callback) {

	let result = null;
	let key;
	arr = arr.reverse();
	function keyIterator () {
		let index = -1;
		let len = arr.length;
		return function () {
			index++;
			return index < len ? index : null
		}
	};

	let nextKey = keyIterator();
	
	function iterate () {
		let key = nextKey();
		if (key === null) {
			return callback(memo);
		}
		iterator(memo , arr[key] , function (err , reduction) {
			if (err) {
				return callback(err);
			} else {
				memo = reduction;
				iterate();
			}
		})
	}
	iterate();
};