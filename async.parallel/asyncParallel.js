function asyncParallel (arr , callback) {
	let res = [];
	function keyIterator () {
		let index = -1;
		let len = arr.length;
		return function () {
			index++;
			return index < len ? index : null;
		}
	}
	function inner (obj , iterator , callback) {
		let nextKey = keyIterator();
		let key , completed = 0;
		function done (err) {
			completed--;
			if (err) {
				return callback(err , res);
			}
			if (key === null && completed <= 0) {
				callback(null , res);
			}
		}
		while ((key = nextKey()) != null) {
			completed ++;
			iterator(obj[key] , key , done);
		}
	}

	inner(arr , function (task , key , callback) {
		task(function (err , result) {
			res[key] = result;
			if (err) {
				return callback(err);
			} else {
				callback(null);
			}
		})
	} , function (err , res) {
		if (err) {
			return callback(err , res);
		}
		callback(null , res);
	})
}