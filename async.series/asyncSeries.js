function asyncSeries (arr , callback) {
	// 定义一个数组，用来储存最终结果
	let res = [];
	let key;

	// 数组迭代对象包装函数
	function keyIterator () {
		let index = -1;
		let len = arr.length;
		return function () {
			index++;
			return index < len ? index : null;
		}
	}

	// 数组迭代对象
	let nextKey = keyIterator();

	// 递归函数调用
	function iterate (callback) {
		key = nextKey();
		if (key !== null && typeof arr[key] === 'function') {
			arr[key](callback);
		} else {
			return callback(null , res);
		}
	}

	iterate(function it (err , result) {
		if (err) {
			return callback(err , res);
		} else {
			if (key === null) {
				return callback(null , res);
			} else {
				res.push(result);
				iterate(it);
			}
		}
	})
};