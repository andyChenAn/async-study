# async.filterSeries
### async.filterSeries(arr , iterator , callback)
使用异步来对arr中的每一项进行顺序筛选。iterator包括两个参数，一个是arr每一项的值，一个是回调函数，该回调函数只有一个参数，是一个布尔值，如果为true，就会被添加到一个数组中，最终通过callback函数的参数获取。
### 实现原理
主要是通过函数递归调用来实现多个异步操作按顺序一个一个的来执行。
### 具体实现：

```
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
```
案例1：

```
const async = require('async');
const arr = [1,2,3,4,5,6];
const filterSeries = require('./filterSeries.js');
filterSeries(arr , function (value , callback) {
	console.log('enter : ' + value);
	setTimeout(() => {
		console.log('handle : ' + value);
		callback(value > 2);
	} , 100)
} , function (result) {
	console.log(result);
});
```
结果：

```
enter : 1
handle : 1
enter : 2
handle : 2
enter : 3
handle : 3
enter : 4
handle : 4
enter : 5
handle : 5
enter : 6
handle : 6
[ 3, 4, 5, 6 ]

```
