# async.filterLimit
### async.filterLimit(arr , limit , iterator , callback)
该方法主要是限制异步并发数量在limit范围内，当达到limit上限时，后面的异步操作需要等待，等有异步操作完成之后，才能添加进来执行，直到所有的异步操作完成，会调用callback函数。
### 实现原理
通过循环和递归调用即可。
### 具体代码：

```
function filterLimit (arr , limit , iterator , callback) {
    // 存放过滤后的内容
	let result = [];
	// 是否完成迭代
	let done = false;
	// 计数器
	let running = 0;
    
    // 数组迭代器
	function keyIterator () {
		let index = -1;
		let len = arr.length;
		return function () {
			index++;
			return index < len ? index : null;
		}
	};

    // 数组迭代对象
	let nextKey = keyIterator();

    // 递归调用函数
	(function iterate () {
		if (limit <= 0) {
			return callback(null);
		}
		while (running < limit && !done) {
			let key = nextKey();
			if (key === null) {
				done = true;
				return;
			}
			running++;
			iterator(arr[key] , function (flag) {
				running--;
				if (flag) {
					result.push(arr[key]);
				}
				if (running <= 0) {
					callback(result);
				} else {
					iterate();
				}
			})
		}
	})();
};
```
#### 案例1：

```
const fetch = require('node-fetch');
const filterLimit = require('./filterLimit.js');
let baidu = fetch('http://baidu.com/');
let jobui = fetch('https://github.com/')
let ctrip = fetch('http://ctrip.com/');
let sina = fetch('http://sina.com/');
let arr = [baidu , jobui , ctrip , sina];

filterLimit(arr , 3 , function (value , callback) {
	console.log('enter : ' + value);
	value.then(result => {
		console.log('handle : ' + value);
		callback(/baidu|sina/g.test(result.url));
	})
} , function (result) {
	console.log(result);
})
```
结果：
```
enter : [object Promise]
enter : [object Promise]
enter : [object Promise]
handle : [object Promise]
enter : [object Promise]
handle : [object Promise]
handle : [object Promise]
handle : [object Promise]
[ Promise {
    Body {
    url: 'http://baidu.com/',
    status: 200,
    statusText: 'OK',
    headers: [Object],
    ok: true,
    body: [Object],
    bodyUsed: false,
    size: 0,
    timeout: 0,
    _raw: [],
    _abort: false } },
  Promise {
    Body {
    url: 'http://sina.com/',
    status: 200,
    statusText: 'OK',
    headers: [Object],
    ok: true,
    body: [Object],
    bodyUsed: false,
    size: 0,
    timeout: 0,
    _raw: [],
    _abort: false } } ]

```
#### 案例2

```
const arr = [1,2,3,4,5,6];
const filterLimit = require('./filterLimit.js');

filterLimit(arr , 2 , function (value , callback) {
	console.log('enter : ' + value);
	setTimeout(() => {
		console.log('handle : ' + value);
		callback(value > 3);
	} , 100)
} , function (result) {
	console.log(result);
})
```
结果：
```
enter : 1
enter : 2
handle : 1
enter : 3
handle : 2
enter : 4
handle : 3
enter : 5
handle : 4
enter : 6
handle : 5
handle : 6
[ 4, 5, 6 ]

```