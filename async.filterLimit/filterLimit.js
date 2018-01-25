function filterLimit (arr , limit , iterator , callback) {
    // 存放过滤后的内容
	let result = [];
	// 是否完成迭代
	let done = false;
	// 计数器
	let running = 0;
    
    // 数组迭代器
	function keyIterator () {
		let index = -1;
		let len = arr.length;
		return function () {
			index++;
			return index < len ? index : null;
		}
	};

    // 数组迭代对象
	let nextKey = keyIterator();

    // 递归调用函数
	(function iterate () {
		if (limit <= 0) {
			return callback(null);
		}
		while (running < limit && !done) {
			let key = nextKey();
			if (key === null) {
				done = true;
				return;
			}
			running++;
			iterator(arr[key] , function (flag) {
				running--;
				if (flag) {
					result.push(arr[key]);
				}
				if (running <= 0) {
					callback(result);
				} else {
					iterate();
				}
			})
		}
	})();
};