# async.each
### async.each(arr , iterator , callback)
该方法表示为数组中的每一项并行的执行iterator函数。

该方法接受三个参数：
1. arr：一个可迭代的数组。
2. iterator(item , callback)：用于数组中每一项执行的函数。
3. callback(err)：一个回调函数，当所有的iterator函数执行完成后会调用callback，或者一个错误发生也会立即执行callback函数。

**注意：因为数组中的每一项都是并行执行，所以并不能保证执行的顺序**

例子1：
```
const async = require('async');
const arr = [
	{name : 'jack' , delay : 200},
	{name : 'andy' , delay : 100},
	{name : 'alex' , delay : 300}
];
async.each(arr , (item , callback) => {
	setTimeout(() => {
		console.log(item.name);
		callback(null , item.name+1);
	} , item.delay)
} , (err) => {
	console.log(err);
})
```
### 实现原理：
该实现方式其实和concat的主要原理是一样的，这里就不介绍了，可以去看concat。
### 实现
```
//我这里主要通过index指针来标记是否数组中的每一项迭代完成，如果index等于最后一项，那么表示数组的所有项已经迭代完成，那么这个时候可以调用callback
function each (arr , iterator , callback) {
	let index = -1;
	arr.forEach((value , i) => {
		iterator(value , function (err) {
			if (err) {
				callback(err);
			} else {
				index++;
				if (index == arr.length - 1) {
					callback(null);
				}
			}
		})
	})
};
```
实现的案例：
```
const async = require('async');
const arr = [
	{name : 'jack' , delay : 200},
	{name : 'andy' , delay : 100},
	{name : 'alex' , delay : 300}
];

function each (arr , iterator , callback) {
	let index = -1;
	arr.forEach((value , i) => {
		iterator(value , function (err) {
			if (err) {
				callback(err);
			} else {
				index++;
				if (index == arr.length - 1) {
					callback(null);
				}
			}
		})
	})
};

each(arr , (item , callback) => {
	setTimeout(() => {
		console.log(item.name);
		if (item.name === 'andy') {
			callback('出错了');
		} else {
			callback(null);
		}
	} , item.delay)
} , err => {
	console.log(err);
})
```