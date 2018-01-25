const async = require('async');
const arr = [1,2,3,4,5,6];

/**
 * 按顺序执行异步过滤操作
 * @param  {array}   arr      要过滤的数组
 * @param  {function}   iterator 迭代函数
 * @param  {function} callback 迭代完成之后的回调函数
 */
function filterSeries (arr , iterator , callback) {
	// 定义一个数组，用来保存过滤后的数据
	let result = [];
	// 计数器
	let index = 0;
	// 是否数组中的每一项迭代完成
	let done = false;

	/**
	 * 数组迭代器函数
	 */
	function keyIterator () {
		let index = -1;
		let len = arr.length;
		return function () {
			index++;
			return index < len ? index : null;
		}
	};

	// 数组迭代器对象
	let nextKey = keyIterator();

	/**
	 * 递归调用函数来顺序执行异步操作
	 */
	(function iterate () {
		index++;
		let key = nextKey();
		if (key === null && !done) {
			return callback(null);
		};
		iterator(arr[key] , function (flag) {
			if (flag) {
				result.push(arr[key]);
			}
			if (index >= arr.length) {
				done = true;
				callback(result);
			} else {
				iterate();
			}
		});
	})();
};

filterSeries(arr , function (value , callback) {
	console.log('enter : ' + value);
	setTimeout(() => {
		console.log('handle : ' + value);
		callback(value > 2);
	} , 100)
} , function (result) {
	console.log(result);
});