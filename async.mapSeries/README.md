# async.mapSeries
### async.mapSeries(arr , iterator , callback)
该方法表示按照顺序来执行，执行完一个才能执行下一个。iterator里面可以有异步操作
举个例子：
```
const async = require('async');
const fetch = require('node-fetch');
let baidu = fetch('http://baidu.com/');
let github = fetch('https://github.com/');
let ctrip = fetch('http://ctrip.com/');
let sina = fetch('http://sina.com/');
let arr = [baidu , github , ctrip , sina];
async.mapSeries(arr , function (promise , callback) {
	promise.then(function (result) {
		callback(null , result.url);
	})
} , function (err , result) {
	console.log(result);
});
```
结果为：
```
[ 'http://baidu.com/',
  'https://github.com/',
  'http://www.ctrip.com/',
  'http://sina.com/'
]
```
我们可以看到它是按照数组中的顺序一个一个的来执行。
### 实现原理
要想实现顺序执行，我们一般采用的方式是递归调用。该方法的内部实现也是采用递归调用，会等到arr中的每一项执行完iterator函数，再递归调用内部方法继续往下执行。
```
function mapSeries (arr , iterator , callback) {
	let result = [];
	/**
	 * 数组迭代器
	 */
	function keyIterate () {
		if (Array.isArray(arr)) {
			let len = arr.length;
			let index = -1;
			return function () {
				index++;
				return index < len ? index : null;
			}
		} else {
			throw new Error('第一次参数必须是一个数组');
		}
	};

	/**
	 * 递归调用实现逻辑
	 * @param  {array}   arr      数组
	 * @param  {function}   iterator 函数
	 * @param  {function} callback 所有数组元素执行完iterator后的回调函数
	 */
	function eachOf (arr , iterator , callback) {
		let nextKey = keyIterate();
		let key = nextKey();
		function iterate () {
			if (key == null) {
				return callback(null);
			};
			iterator(arr[key] , key , function (err) {
				if (err) {
					callback(err);
				} else {
					key = nextKey();
					if (key === null) {
						return callback(null);
					} else {
						iterate();
					}
				}
			});
		};
		iterate();
	};

	eachOf(arr , function (value , index , callback) {
		iterator(value , function (err , v) {
			result[index] = v;
			callback(err);
		})
	} , function (err) {
		callback(err , result);
	});
};
```
案例1：

```
const async = require('async');
const fetch = require('node-fetch');
let baidu = fetch('http://baidu.com/');
let github = fetch('https://github.com/');
let ctrip = fetch('http://ctrip.com/');
let sina = fetch('http://sina.com/');
let arr = [baidu , github , ctrip , sina];

mapSeries(arr , function (promise , callback) {
	promise.then(function (result) {
		callback(null , result.url);
	})
} , function (err , result) {
	console.log(result);
})
```
结果：
```
[ 'http://baidu.com/',
  'https://github.com/',
  'http://www.ctrip.com/',
  'http://sina.com/'
]
```
案例2：
```
let arr = [
	{name : 'andy' , time : 200},
	{name : 'alex' , time : 100},
	{name : 'henry' , time : 150}
];
mapSeries(arr , function (value , callback) {
	console.log('enter: ' + value.name);
	setTimeout(function () {
		console.log('handle: ' + value.name);
		callback(null , value.name);
	} , value.time)
} , function (err , result) {
	console.log(result)
})
```
结果：
```
enter: andy
handle: andy
enter: alex
handle: alex
enter: henry
handle: henry
[ 'andy', 'alex', 'henry' ]
```