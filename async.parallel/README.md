# async.parallel
### async.parallel(arr , callback)
该方法表示并发执行arr中的每一个任务，然后将最终的结果返回。
### 实现原理
如果是并发执行，那么我们通过循环就可以做到，内部定义一个计数器，循环一次就加1，然后在数组中的每一个任务完成后，执行done函数来判断是否数组中的所有任务都已经执行完毕，如果没有那么就减1，直到计数器为0，那么就调用callback函数将结果返回。
### 具体代码：
```
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
```
案例：

```
const asyncParallel = require('./asyncParallel.js');
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
	},
	function (callback) {
		setTimeout(() => {
			callback(null , 'three');
		} , 300)
	}
];
asyncParallel(arr , function (err , result) {
	console.log(result);
	console.timeEnd();
})
```
结果：
```
[ 'one', 'two', 'three' ]
花费时间: 1012.686ms
```
所以从执行情况来看，上面的任务是并发执行的，而且打印的结果也是按照任务的顺序来返回的。