# async.concatSeries
### async.concatSeries(arr , iterator , callback)
该方法接受三个参数，其实和async.concat()的参数是一样的，唯一不一样的就是该调用该方法是串行执行迭代器，而不是并发执行。所谓串行，就是在等数组中的每一项执行完函数之后，再依次执行下一项的迭代函数。
### 实现原理：
和async.concat()方法的差别在于下面这段代码：
```
async.eachOfSeries = function (obj, iterator, callback) {
    callback = _once(callback || noop);
    obj = obj || [];
    var nextKey = _keyIterator(obj);
    var key = nextKey();
    //这里我们可以看到，调用iterate函数，然后在内部调用iterator函数，当一个执行完之后，在回调函数中再一次调用iterate函数。
    function iterate() {
        //如果iterator函数是同步执行的，那么就调用async.setImmedate方法将其转为异步的，如果iterator函数是异步执行的，那么就直接调用
        var sync = true;
        if (key === null) {
            return callback(null);
        }
        iterator(obj[key], key, only_once(function (err) {
            if (err) {
                callback(err);
            }
            else {
                key = nextKey();
                if (key === null) {
                    return callback(null);
                } else {
                    if (sync) {
                        async.setImmediate(iterate);
                    } else {
                        iterate();
                    }
                }
            }
        }));
        sync = false;
    }
    iterate();
};
```
### 实现：
```
function concatSeries (arr , iterator , callback) {
    let result = [];
    let index = 0;
    let sync = true;
    function iterate () {
        iterator(arr[index] , function (err , data) {
            result = result.concat(data || []);
            if (err) {
                callback(err , result);
            } else {
                if (index === arr.length - 1) {
                    callback(null , result);
                } else {
                    index++;
                    if (sync) {
                        process.nextTick(iterate);
                    } else {
                        iterate();
                    }
                }
            }
        });
        sync = false;
    }
    iterate();
};
```
下面代码是案例实现：
```
var async = require('async');
const fs = require('fs');
const paths = ['./jack.txt' , './andy.txt' , './alex.txt'];

var data = {
    aaa: [11,22,33],
    bbb: [44,55],
    ccc: 66
};

var keys = [
    {name: 'aaa', delay: 300},
    {name: 'bbb', delay: 100},
    {name: 'ccc', delay: 200}
];

function concatSeries (arr , iterator , callback) {
    let result = [];
    let index = 0;
    let sync = true;
    function iterate () {
        iterator(arr[index] , function (err , data) {
            result = result.concat(data || []);
            if (err) {
                callback(err , result);
            } else {
                if (index === arr.length - 1) {
                    callback(null , result);
                } else {
                    index++;
                    if (sync) {
                        process.nextTick(iterate);
                    } else {
                        iterate();
                    }
                }
            }
        });
        sync = false;
    }
    iterate();
};

concatSeries(['./andy.txt' , './jack.txt' , './alex.txt'] , fs.readFile , (err , result) => {
    if (err) {
        console.log(err);
    }
    console.log(result)
})


console.time();
concatSeries(keys, function(key,callback) {
    setTimeout(function() {
        callback(null, data[key.name]);
    }, key.delay);
}, function(err, values) {
    console.log('1.1 err: ', err);
    console.log('1.1 values: ', values); 
    console.timeEnd();   
});
```

