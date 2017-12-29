# async.eachSeries
### async.eachSeries(arr , iterator , callback)
该方法表示为数组中的每一项按顺序执行iterator函数。
### 实现原理：
这里主要在于iterator函数是按照顺序来执行的，那么这里是通过递归调用的方式来顺序执行iterator的。
```
function eachSeries (arr , iterator , callback) {
	let index = 0;
	function iterate () {
		iterator(arr[index] , function (err) {
			if (err) {
				return callback(err);
			}
			index++;
			if (index === arr.length) {
				return callback(null);
			} else {
				setImmediate(iterate);
			}
		});
	};
	iterate();
};
```
案例：
```
const arr = [
	{name : 'jack' , delay : 200},
	{name : 'alex' , delay : 100},
	{name : 'andy' , delay : 300}
];
eachSeries(arr , function (item , callback) {
	setTimeout(function () {
		console.log('handle: ' + item.name);
		if (item.name === 'alex') {
			callback('myerr');
		}
	} , item.delay)
} , function (err) {
	console.log(err);
});
```