# async.series
### async.series(arr , callback)
该方法表示串行执行，一个函数数组中的每个函数，每一个函数执行完成之后才能执行下一个函数。
### 实现原理
函数递归调用，来实现串行执行。
### 具体代码

```
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
```
案例1：
```
const asyncSeries = require('./asyncSeries.js');
const arr = [
	function (callback) {
		setTimeout(() => {
			callback(null , 'one');
		} , 1000)
	},
	function (callback) {
		setTimeout(() => {
			callback(null , 'two');
		} , 100)
	}
];
asyncSeries(arr , function (err , results) {
	if (err) {
		console.log(err.message);
	}
	console.log(results);
})
```
结果：

```
[ 'one', 'two' ]
```
案例2：
```
const asyncSeries = require('./asyncSeries.js');
const arr = [
	function (callback) {
		setTimeout(() => {
			callback(null , 'one');
		} , 1000)
	},
	function (callback) {
		setTimeout(() => {
			callback(new Error('wrong') , 'two');
		} , 100)
	}
];
asyncSeries(arr , function (err , results) {
	if (err) {
		console.log(err.message);
	}
	console.log(results);
})
```
结果：
```
wrong
[ 'one' ]
```