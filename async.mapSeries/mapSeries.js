const async = require('async');
const fetch = require('node-fetch');
let baidu = fetch('http://baidu.com/');
let github = fetch('https://github.com/');
let ctrip = fetch('http://ctrip.com/');
let sina = fetch('http://sina.com/');
let arr = [baidu , github , ctrip , sina];

/* async.mapSeries实现   start */
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
/* async.mapSeries实现   end */

/* 通过async库来实现 */
async.mapSeries(arr , function (promise , callback) {
	promise.then(function (result) {
		callback(null , result.url);
	})
} , function (err , result) {
	console.log(result);
});

/* 案例1    start*/
mapSeries(arr , function (promise , callback) {
	promise.then(function (result) {
		callback(null , result.url);
	})
} , function (err , result) {
	console.log(result);
});
/* 案例1    end*/

/* 案例2    start */
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
	console.timeEnd();
})
/* 案例2    end */