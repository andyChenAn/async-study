# async.mapLimit
### async.mapLimit(arr , limit , iterator , callback)
该方法表示，并行执行，同时最多2个函数并行，执行完一个，就会添加一个进来，始终会保持最多只有两个任务在执行，结果传给最终callback。
### 实现原理
1. while循环来并发执行。
2. 递归调用来顺序执行。
3. 通过limit参数来控制并发数。
### 具体实现
- 第一步

首先，我们需要一个迭代器，这个迭代器的作用就是通过传入的arr参数来确定需要调用多少次iterator。
```
function _iterator () {
    let index = -1;
    let len = arr.length;
    return function () {
        index++;
        return index < len ? index : null;
    }
}
```
其次，我们需要一个函数，该函数内部主要实现了循环和递归调用。
```
/**
 * 内部的循环函数，该函数主要做了以下几件事情：
 * 1、通过while循环并发执行。
 * 2、通过函数递归调用，保证顺序执行。
 * 3、通过传入的limit参数来限制并发数。
 * @param  {[type]}   obj      [description]
 * @param  {[type]}   iterator [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function eachFn (obj , iterator , callback) {
	if (limit <= 0) {
		return callback(null);
	}
	let done = false;
	let error = false;
	let running = 0;
	(function replenish () {
		if (done && running <= 0) {
			return callback(null);
		}
		while(running < limit && !error) {
			let key = keyIterator();
			if (key === null) {
				done = true;
				if (running <= 0) {
					callback(null);
				}
				return;
			};
			running++;
			iterator(obj[key] , key , function (err) {
				running--;
				if (err) {
					callback(err);
					error = true;
				} else {
					replenish();
				}
			})
		}
	})()
};

eachFn(arr , function (value , index , callback) {
	iterator(value , function (err , v) {
		results[index] = v;
		callback(err);
	})
} , function (err) {
	callback(err , results);
})
```
所以最终的实现代码就是：
```
function mapLimit (arr , limit , iterator , callback) {
	let results = [];
	/**
	 * 数组迭代器，返回一个函数
	 * 根据数组的长度来迭代
	 */
	function _iterator () {
		let index = -1;
		let len = arr.length;
		return function () {
			index++;
			return index < len ? index : null;
		}
	};
	let keyIterator = _iterator();

	/**
	 * 内部的循环函数，该函数主要做了以下几件事情：
	 * 1、通过while循环并发执行。
	 * 2、通过函数递归调用，保证顺序执行。
	 * 3、通过传入的limit参数来限制并发数。
	 * @param  {[type]}   obj      [description]
	 * @param  {[type]}   iterator [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	function eachFn (obj , iterator , callback) {
		if (limit <= 0) {
			return callback(null);
		}
		let done = false;
		let error = false;
		let running = 0;
		(function replenish () {
			if (done && running <= 0) {
				return callback(null);
			}
			while(running < limit && !error) {
				let key = keyIterator();
				if (key === null) {
					done = true;
					if (running <= 0) {
						callback(null);
					}
					return;
				};
				running++;
				iterator(obj[key] , key , function (err) {
					running--;
					if (err) {
						callback(err);
						error = true;
					} else {
						replenish();
					}
				})
			}
		})()
	};

	eachFn(arr , function (value , index , callback) {
		iterator(value , function (err , v) {
			results[index] = v;
			callback(err);
		})
	} , function (err) {
		callback(err , results);
	})

};
```
案例1:

```
var arr = [
 	{name:'Jack', delay:200}, 
 	{name:'Mike', delay: 1000}, 
 	{name:'Freewind', delay:300}, 
 	{name:'Test', delay: 50}
];
mapLimit(arr , 2 , function(item, callback) {
    console.log('1.3 enter: ' + item.name);
    setTimeout(function() {
        console.log('1.3 handle: ' + item.name);
        callback(null, item.name+'!!!');
    }, item.delay);
}, function(err,results) {
    console.log('1.3 err: ', err);
    console.log('1.3 results: ', results);
});
```
结果为：
```
mapLimit(arr , 2 , function(item, callback) {
    console.log('1.3 enter: ' + item.name);
    setTimeout(function() {
        console.log('1.3 handle: ' + item.name);
        callback(null, item.name+'!!!');
    }, item.delay);
}, function(err,results) {
    console.log('1.3 err: ', err);
    console.log('1.3 results: ', results);
});
```
案例2：

```
const fetch = require('node-fetch');
let baidu = fetch('http://baidu.com/');
let jobui = fetch('https://github.com/')
let ctrip = fetch('http://ctrip.com/');
let sina = fetch('http://sina.com/');
let arr = [baidu , jobui , ctrip , sina];
mapLimit(arr , 2 , function (promise , callback) {
	promise.then(function (value) {
		callback(null , value.url);
	});
} , function (err , results) {
	console.log(results);
})
```
结果为：
```
[ 'http://baidu.com/',
  'http://www.jobui.com/',
  'http://www.ctrip.com/',
  'http://sina.com/' ]
```