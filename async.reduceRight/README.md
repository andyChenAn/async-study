# async.reduceRight
### async.reduceRight(arr , memo , iterator , callback)
该方法表示从右向左将arr中的元素做运算，最后的结果通过callback的参数返回。
### 实现原理
通过递归调用从右到左来执行代码即可。注意，这里都是没有去实现容错处理的，只是用于学习
### 具体代码
```
function asyncReduceRight (arr , memo , iterator , callback) {

	let result = null;
	let key;
	arr = arr.reverse();
	function keyIterator () {
		let index = -1;
		let len = arr.length;
		return function () {
			index++;
			return index < len ? index : null
		}
	};

	let nextKey = keyIterator();
	
	function iterate () {
		let key = nextKey();
		if (key === null) {
			return callback(memo);
		}
		iterator(memo , arr[key] , function (err , reduction) {
			if (err) {
				return callback(err);
			} else {
				memo = reduction;
				iterate();
			}
		})
	}
	iterate();
};
```
#### 案例
```
asyncReduceRight(arr , 100 , function (memo , item , callback) {
	console.log('enter : ' + memo + ' , ' + item);
	setTimeout(function () {
		callback(null , memo + item);
	} , 100)
} , function (result) {
	console.log(result);
})

```