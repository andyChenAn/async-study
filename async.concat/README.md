# async.concat
### async.concat(arr , iterator , callback):
该方法接受三个参数：
1. arr：一个可迭代的数组。
2. iterator(item , callback)：数组的每一项都会执行的函数。这个函数传入了一个callback(err , results)参数，只要数组的一项已经完成或者报错，都会执行一次iterator传入的callback函数。
3. callback(err , results)：可选的参数，当数组的所有项都执行完iterator函数或报错后，会调用该callback函数，results中包含了每个iterator函数连接后的结果。
4. 
**调用该方法时，是并发执行数组中的每一项，而async库基本上也是遵守nodejs的error-first的原则**

**注意：这些都是异步实现的**

看几个例子：
```
var async = require('async');
const fs = require('fs');
const paths = ['./jack.txt' , './andy.txt' , './alex.txt'];
async.concat(paths , fs.readFile , (err , results) => {
    if (err) {
        console.log(err);
    }
    console.log(results);
});
//结果：
[ <Buffer 68 65 6c 6c 6f 20 6a 61 63 6b>,
  <Buffer 68 65 6c 6c 6f 20 61 6e 64 79>,
  <Buffer 68 65 6c 6c 6f 20 61 6c 65 78> ]
```
从这里例子中可以看出，数组中的每一项都调用fs.readFile函数，然后将读取到的数据结果调用数组的concat方法拼接在一起，等到数组的所有项都执行完fs.readFile函数后，再调用callback函数，将拼接好的结果传入callback参数。最终输出的结果是一个二进制数据，我们可以这样来处理：
```
var async = require('async');
const fs = require('fs');
const paths = ['./jack.txt' , './andy.txt' , './alex.txt'];
async.concat(paths , (path , callback) => {
    fs.readFile(path , (err , data) => {
        if (err) {
            callback(err);
        }
        callback(null , data.toString())
    })
} , (err , results) => {
    if (err) {
        console.log(err);
    }
    console.log(results);
});
//结果：
[ 'hello jack', 'hello andy', 'hello alex' ]
```
第二个例子：
```
var async = require('async');
const fs = require('fs');
const data1 = {
    a : [1,2,3],
    b : [4,5],
    c : [6]
};
const data2 = [
    {name : 'a' , delay : 300},
    {name : 'b' , delay : 100},
    {name : 'c' , delay : 200}
];
console.time();
async.concat(data2 , (item , callback) => {
    setTimeout(() => {
        callback(null , data1[item.name])
    } , item.delay)
} , (err , results) => {
    if (err) {
        console.log(err);
    }
    console.log(results);
    console.timeEnd()
});
//结果为：
[ 4, 5, 6, 1, 2, 3 ]
执行完成后总共花费的时间是：312.052ms，所以我们可以看出，这里的执行是并发执行的，总花费时间是312ms而不是所有时间相加的600ms
```
如果中间执行报错了：
```
var async = require('async');
const fs = require('fs');
const data1 = {
    a : [1,2,3],
    b : [4,5],
    c : [6]
};
const data2 = [
    {name : 'a' , delay : 300},
    {name : 'b' , delay : 100},
    {name : 'c' , delay : 200}
];
console.time();
async.concat(data2 , (item , callback) => {
    setTimeout(() => {
        if (item.name == 'c') {
            callback('报错了');
        } else {
            callback(null , data1[item.name])
        }
    } , item.delay)
} , (err , results) => {
    if (err) {
        console.log(err);
    }
    console.log(results);
    console.timeEnd()
});
//结果：
报错了
[ 4, 5 ]
从结果中可以看出，如果是报错了，那么后面的每一项就不会执行，前面的依然还是能够打印出来的。
```
### 实现原理：
我们来看一下源码，实现该方法主要是经过以下几步：
1. 调用doParallel函数，返回一个函数。
```
async.concat = doParallel(_concat);
```
2. doParallel函数主要就是一个函数包装器，调用该函数，返回一个函数并将async.eachOf函数作为参数传入。
```
function doParallel(fn) {
    return function (obj, iterator, callback) {
        return fn(async.eachOf, obj, iterator, callback);
    };
}
```
3. async.eachOf函数主要用于处理数组中的每一项的迭代，这里处理的方式是，通过调用_keyIterator函数来获取一个迭代器对象，该迭代器对象也是一个函数，调用该迭代器会返回数组的每一项的索引，如果索引大于数组的长度，那么就返回null，迭代完成。这里判断数组的所有项都已经执行完的标准是看completed变量，循环执行一次迭代时都会加1，而每次执行迭代完成后也都会减1，并且判断completed是否小于等于0，如果completed等于0，那么相当于数组的每一项迭代已经全部完成，那么这个时候就可以调用callback函数
```
async.eachOf = function (object, iterator, callback) {
    callback = _once(callback || noop);
    object = object || [];

    var iter = _keyIterator(object);
    var key, completed = 0;
    //循环调用iterator，如果调用迭代器返回null，表示已经迭代完成。
    while ((key = iter()) != null) {
        completed += 1;
        //数组中的每一项迭代完成后，都会执行一次done函数
        iterator(object[key], key, only_once(done));
    }
    //如果传入的是一个空数组，那么会直接调用
    if (completed === 0) callback(null);
    //当所有
    function done(err) {
        completed--;
        if (err) {
            callback(err);
        }
        // Check key is null in case iterator isn't exhausted
        // and done resolved synchronously.
        else if (key === null && completed <= 0) {
            callback(null);
        }
    }
};
```
4. 调用该函数，返回一个函数，并且再fn调用后，就将fn标记清除了。
```
function _once(fn) {
    return function() {
        if (fn === null) return;
        fn.apply(this, arguments);
        fn = null;
    };
}
```
5. _keyIterator函数的作用就是，根据提供的数组的key来创建一个迭代器对象，并且该迭代器对象就是一个函数，可以调用，该迭代器内部维护一个指针，每调用一次指针就会向前移动一次(加1)，当指针的值与数组的长度相等是，表示该数组已经迭代完成。
```
function _keyIterator(coll) {
    var i = -1;
    var len;
    var keys;
    //提供的参数是数组的情况
    if (_isArrayLike(coll)) {
        len = coll.length;
        return function next() {
            i++;
            return i < len ? i : null;
        };
    //提供的参数是对象的情况，直接调用Object.keys()方法，来获得一个数组
    } else {
        keys = _keys(coll);
        len = keys.length;
        return function next() {
            i++;
            return i < len ? keys[i] : null;
        };
    }
}
```
### 总结：
该方法实现是循环数组中的每一项，调用iterator函数将结果拼接在一起，并且通过内部的指针来判断是否迭代完成，如果完成调用callback函数并将最终的结果返回。
### 实现：
```
function concat (arr , iterator , callback) {
    let result = [];
    let index = 0;
    arr.forEach((value) => {
        iterator(value , function (err , data) {
            result = result.concat(data || []);
            index++;
            if (err) {
                callback(err);
            } else {
                if (index === arr.length) {
                    callback(null , result);
                }
            }
        })
    })
};
```
下面代码是案例实现：
```
function concat (arr , iterator , callback) {
    let result = [];
    let index = 0;
    arr.forEach((value) => {
        iterator(value , function (err , data) {
            result = result.concat(data || []);
            index++;
            if (err) {
                callback(err);
            } else {
                if (index === arr.length) {
                    callback(null , result);
                }
            }
        })
    })
};

//第一种方式：
concat(['./andy.txt' , './alex.txt' , './jack.txt'] , (item , callback) => {
    fs.readFile(item , (err , data) => {
        if (err) {
            callback(err);
        } else {
            callback(null , data.toString());
        }
    })
} , (err , result) => {
    if (err) {
        console.log(err);
    }
    console.log(result);
});

//第二种方式：
concat(['./andy.txt' , './alex.txt' , './jack.txt'] , fs.readFile , (err , result) => {
    console.log(result);
});
```
