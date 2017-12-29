# async.map
### async.map(arr , iterator , callback)
该方法的功能和元素的数组对象的map方法功能类似，传入的数组每一项元素都会执行iterator函数，执行的结果会被保存在一个新的数组中，数组的所有项都执行完成后，将结果作为callback的第二个参数传入（callback的第二个参数是err）。

其实map方法和each方法类似，只是它们之间的关注点不一样，对于each方法来说，它关注的是执行的过程，而对于map方法来说，它关注的是执行后的结果。

### 实现原理：
1. 创建一个针对数组的迭代器函数，内部通过指针来控制。
```
function keyIterate () {
	let len = arr.length;
	let index = -1;
	return function () {
		index++;
		return index < len ? index : null;
	}
};
	
/* 创建迭代器对象 */
	let next = keyIterate();
```
2. 创建一个函数，用于数组的每一项迭代执行，内部是通过while循环来执行。
```
/**
 * 循环执行数组中的每一项，并将每一项执行完的结果保存在一个新的数组中，如果所有项都执行完成，那么新的数组会被作为callback的第二个参数传入
 * @param  {array}   arr      数组
 * @param  {function}   iterator 数组中的每一项需要执行的函数
 * @param  {function} callback 数组中的所有项执行完成后的回调函数
 */
function eachOf (arr , iterator , callback) {
	let key;
	while((key = next()) !== null) {
		running++;
		iterator(arr[key] , key , function (err) {
			running--;
			if (err) {
				callback(err);
			} else {
				if (running <= 0) {
					callback(null);
				}
			}
		})
	}
}
```
3. 定义一个变量用来记录数组中的每一项是否执行完成。
```
// 记录数组的每一项是否迭代完成
let running = 0;
```
### 具体实现代码：
```
function  asyncMap (arr , iterator , callback) {
	// 记录数组的每一项是否迭代完成
	let running = 0;
	let result = [];
	if (!Array.isArray(arr)) {
		arr = [];
	};
	/**
	 * 迭代器包装函数，返回的是一个迭代器
	 */
	function keyIterate () {
		let len = arr.length;
		let index = -1;
		return function () {
			index++;
			return index < len ? index : null;
		}
	};

	/* 创建迭代器对象 */
	let next = keyIterate();

	/**
	 * 循环执行数组中的每一项，并将每一项执行完的结果保存在一个新的数组中，如果所有项都执行完成，那么新的数组会被作为callback的第二个参数传入
	 * @param  {array}   arr      数组
	 * @param  {function}   iterator 数组中的每一项需要执行的函数
	 * @param  {function} callback 数组中的所有项执行完成后的回调函数
	 */
	function eachOf (arr , iterator , callback) {
		let key;
		while((key = next()) !== null) {
			running++;
			iterator(arr[key] , key , function (err) {
				running--;
				if (err) {
					callback(err);
				} else {
					if (running <= 0) {
						callback(null);
					}
				}
			})
		}
	};
	eachOf(arr , function (value , index , callback) {
		iterator(value , function (err , data) {
			result[index] = data;
			callback(err);
		});
	} , function (err) {
		callback(err , result);
	})
}
```
##### 案例1：定时器任务执行，并将结果返回
```
let arr = [
    {name:'Jack', delay:200}, 
    {name:'Mike', delay: 100}, 
    {name:'Freewind', delay:300}, 
    {name:'Test', delay: 50}
];
asyncMap(arr , function (promise , callback) {
	console.log('enter: ' + promise);
	promise.then(function (result) {
		console.log('handle: ' + result.url);
		callback(null , result.url);
	} , function (err) {
		callback(err);
	})
} , function (err , result) {
	console.log(err , result);
})
//打印结果：
1.1 enter: Jack
1.1 enter: Mike
1.1 enter: Freewind
1.1 enter: Test
1.1 handle: Test
1.1 handle: Mike
1.1 handle: Jack
1.1 handle: Freewind
1.1 err:  null
1.1 results:  [ 'Jack!!!', 'Mike!!!', 'Freewind!!!', 'Test!!!' ]
```
##### 案例2：异步获取其他网站数据，并将所有的网址的url返回

```
const fetch = require('node-fetch');
let baidu = fetch('http://baidu.com/');
let github = fetch('https://github.com/');
let ctrip = fetch('http://ctrip.com/');
let sina = fetch('http://sina.com/');
let arr = [baidu , github , ctrip , sina];

asyncMap(arr , function (promise , callback) {
	console.log('enter: ' + promise);
	promise.then(function (result) {
		console.log('handle: ' + result.url);
		callback(null , result.url);
	} , function (err) {
		callback(err);
	})
} , function (err , result) {
	console.log(err , result);
})
//打印结果：
enter: [object Promise]
enter: [object Promise]
enter: [object Promise]
enter: [object Promise]
handle: http://baidu.com/
handle: http://sina.com/
handle: http://www.ctrip.com/
handle: https://github.com/
null [ 'http://baidu.com/',
  'https://github.com/',
  'http://www.ctrip.com/',
  'http://sina.com/' ]

```