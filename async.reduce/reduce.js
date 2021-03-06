function asyncReduce (arr , memo , iterator , callback) {

	let result = null;
	let key;

	if (!memo) {
		memo = arr[0];
	}

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

asyncReduce(arr , 100 , function (memo , item , callback) {
	console.log('enter : ' + memo + ' , ' + item);
	setTimeout(function () {
		callback(null , memo + item);
	} , 100)
} , function (result) {
	console.log(result);
})