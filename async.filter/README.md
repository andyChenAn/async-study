# async.filter
### async.filter(arr , iterator , callback)
使用异步操作对集合中的元素进行筛选。需要注意的是，iterator的callback只有一个参数，只能接收true或false。
### 实现原理
该方法会对数组中的每一项并发执行iterator函数，所以我们只需要知道如何才能让代码并发执行，其实就是通过循环来实现就可以了。
### 具体代码

```
function filter (arr , iterator , callback) {
	// 保存结果
	let result = [];
	let index = 0;
	// 循环，实现并发执行iterator
	// 将结果保存在result中
	for (let i = 0 ; i < arr.length ; i++) {
		index++;
		iterator(arr[i] , function (flag) {
			index--;
			if (flag) {
				result.push(arr[i]);
			}
			if (index === 0) {
				callback(result);
			}
		})
	}
};
```
案例1：

```
const arr = [1,2,3,4,5];
function filter (arr , iterator , callback) {
	// 保存结果
	let result = [];
	let index = 0;
	// 内部的迭代
	for (let i = 0 ; i < arr.length ; i++) {
		index++;
		iterator(arr[i] , function (flag) {
			index--;
			if (flag) {
				result.push(arr[i]);
			}
			if (index === 0) {
				callback(result);
			}
		})
	}
};

filter(arr , function (item , callback) {
	console.log('enter : ' + item);
	setTimeout(() => {
		console.log('handle : ' + item);
		callback(item >= 3);
	} , 100)
} , function (result) {
	console.log(result);
})
```
结果：
```
enter : 1
enter : 2
enter : 3
enter : 4
enter : 5
handle : 1
handle : 2
handle : 3
handle : 4
handle : 5
[ 3, 4, 5 ]
```
案例2：
```
const fs = require('fs');
filter(['alex.txt' , 'and1y.txt' , 'jack.txt' , 'henry.txt'] , fs.exists , function (result) {
	console.log(result);
})
```
结果：
```
[ 'alex.txt', 'jack.txt' ]
```