const fetch = require('node-fetch');
let baidu = fetch('http://baidu.com/');
let github = fetch('https://github.com/');
let ctrip = fetch('http://ctrdfsafdsdfdsip1.com/');
let sina = fetch('http://sina.com/');
let arr1 = [
	{name:'Jack', delay:200}, 
	{name:'Mike', delay: 100}, 
	{name:'Freewind', delay:300}, 
	{name:'Test', delay: 50}
];
let arr2 = [baidu , github , ctrip , sina];

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
	}

	eachOf(arr , function (value , index , callback) {
		iterator(value , function (err , data) {
			result[index] = data;
			callback(err);
		});
	} , function (err) {
		callback(err , result);
	})
}
// 案例1
asyncMap(arr1 , function(item, callback) {
    console.log('1.1 enter: ' + item.name);
    setTimeout(function() {
        console.log('1.1 handle: ' + item.name);
        callback(null, item.name + '!!!');
    }, item.delay);
}, function(err,results) {
    console.log('1.1 err: ', err);
    console.log('1.1 results: ', results);
});

// 案例2
asyncMap(arr2 , function (promise , callback) {
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