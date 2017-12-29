# async.eachLimit
### async.eachLimit(arr , limit , iterator , callback)
该方法表示同时最多有limit个任务在执行。如果有一个任务已经执行完了，那么会添加一个任务进来。

举个例子：
```
const async = require('async');
const arr = [
	{name : 'jack' , delay : 2000},
	{name : 'alex' , delay : 1000},
	{name : 'andy' , delay : 300},
	{name : 'peter' , delay : 600},
	{name : 'join' , delay : 6000},
	{name : 'jay' , delay : 800},

];
async.eachLimit(arr , 3 , function (item , callback) {
	console.log('1.5 enter: ' + item.name);
	setTimeout(function () {
		console.log('1.5 handle: ' + item.name);
		callback(null , item.name);
	} , item.delay)
} , function (err) {

})
//打印结果：
1.5 enter: jack
1.5 enter: alex
1.5 enter: andy
1.5 handle: andy
1.5 enter: peter
1.5 handle: peter
1.5 enter: join
1.5 handle: alex
1.5 enter: jay
1.5 handle: jay
1.5 handle: jack
1.5 handle: join
//我们限制同时最多只能执行3个任务，所以一开始进来三个任务，然后处理掉一个任务，就会进来一个任务。
```
### 用途
其实这个我们可以用在异步操作，比如说我们异步请求获取数据，同时有很多个请求，但是我们不想一次性全部都执行，而是希望能够控制在一定的请求次数上，那么我们可以用这样的方式来处理。
```
const async = require('async');
const fetch = require('node-fetch');
let baidu = fetch('http://baidu.com/');
let jobui = fetch('http://jobui.com/')
let ctrip = fetch('http://ctrip.com/');
let sina = fetch('http://sina.com/');
let arr = [baidu , jobui , ctrip , sina];
async.eachLimit(arr , 3 , function (promise , callback) {
	console.log('进来任务： '  + promise)
	promise.then(function (result) {
		console.log(result.url + '读取完成');
		callback(null , result);
	} , function (err) {
		console.log('读取出错');
		callback('error happened');
	})
} , function (err) {
	console.log(err);
});
// 打印结果为：
进来任务： [object Promise]
进来任务： [object Promise]
进来任务： [object Promise]
http://baidu.com/读取完成
进来任务： [object Promise]
http://www.ctrip.com/读取完成
http://sina.com/读取完成
http://www.jobui.com/读取完成
null
//所以我们可以很清楚的看到最多只能同时执行三个任务，等其中一个任务结束，又会添加一个任务进来，直到最后所有的任务执行完成。如果有一个任务出现异常，那么会中止之后要执行的任务。
```
### 实现原理：
要实现这个功能，主要是通过这两点来实现，第一点就是通过循环来并发执行，第二点就是通过递归调用来顺序执行。

实现思路如下：
```
function eachLimit (arr , limit , iterator , callback) {
	let done = false;
	let error = false;
	let running = 0;
	//返回一个迭代器对象，内部通过一个指针来控制，是一个函数，所以可以直接调用
	function _keyIterator () {
		let i = -1;
		if (Array.isArray(arr)) {
			let len = arr.length;
			return function () {
				i++;
				return i < len ? i : null;
			}
		}
	};
	let next = _keyIterator();
	if (limit <= 0) {
		return callback(null);
	}
	//通过一个函数自调用来，来初始化操作流程
	(function iterate () {
		while(running < limit && !error) {
			let index = next();
			if (index === null) {
				done = true;
				//因为当没有新任务添加进来的时候，那么running的值最后就是小于limit的值，比如，同时最多只能执行3个任务，那么最后running的值就是2，所以这里要等到running的值为0的时候，才调用callback
				if (running <= 0) {
					callback(null);
				}
				return;
			}
			//添加的任务个数
			running++;
			iterator(arr[index] , function (err) {
			    //表示有一个任务已经执行完毕，当有一个任务执行完毕，在递归调用iterate函数，会判断running是小于limit的，所以又会添加一个任务我进来，当没有任务添加的时候，running的值始终会小于limit的值。
				running--;
				if (err) {
					error = true;
					callback(err);
				} else {
					iterate();  //递归调用iterate函数
				}
			})
		};
	})()
};
```
##### 实例1：向外请求资源，并且控制最多并发数为3个
```
const fetch = require('node-fetch');
let baidu = fetch('http://baidu.com/');
let github = fetch('https://github.com/');
let ctrip = fetch('http://ctrip.com/');
let sina = fetch('http://sina.com/');
let arr = [baidu , github , ctrip , sina];

eachLimit(arr , 3 , function (promise , callback) {
	console.log('进来任务：' + promise);
	promise.then(function (result) {
		console.log(result.url + '读取完成')
		callback(null , result);
	} , function (err) {
		console.log('读取出错');
		callback('error happened');
	})
} , function (err) {
	console.log(err);
});
// 打印结果：
//进来任务：[object Promise]
//进来任务：[object Promise]
//http://baidu.com/读取完成
//进来任务：[object Promise]
//http://www.ctrip.com/读取完成
//进来任务：[object Promise]
//http://sina.com/读取完成
//https://github.com/读取完成
//null
```
##### 实例2：最多同时执行4个定时器任务
```
const fetch = require('node-fetch');
var arr = [{name:'Jack', delay: 2000},
  {name:'Mike', delay: 5000},
  {name:'Freewind', delay: 4000},
  {name:'youqing', delay:4000},
  {name:'youqing2', delay:4000},
  {name:'youqing3', delay:4000},
  {name:'youqing4', delay:4000},
];

eachLimit(arr , 4 , function (item , callback) {
	console.log('进来任务：' + item.name);
	setTimeout(function () {
		console.log('执行任务完成：' + item.name);
		callback(null);
	} , item.delay)
} , function (err) {
	console.log(err);
});
//打印结果：
进来任务：Jack
进来任务：Mike
进来任务：Freewind
进来任务：youqing
执行任务完成：Jack
进来任务：youqing2
执行任务完成：Freewind
进来任务：youqing3
执行任务完成：youqing
进来任务：youqing4
执行任务完成：Mike
执行任务完成：youqing2
执行任务完成：youqing3
执行任务完成：youqing4
null
```