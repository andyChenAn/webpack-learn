# 编写loader
在使用webpack的过程中，我们经常会使用一些loader来加载模块，比如：css-loader,vue-loader等。
### 如何编写loader？
首先我们需要知道的是，loader是导出为一个函数的node模块，该函数会在loader转换资源的时候调用。

```
module.exports = function (source) {
    // 进行相应的逻辑处理
}
```
该函数只能接受一个参数，这个参数是一个包含资源文件的内容的字符串。比如说，我们在入口文件中使用require('./andy.txt')，那么参数source表示的就是该文件里的内容。

loader会返回一个或两个值，第一个值的类型是JavaScript代码的字符串或者Buffer，第二个值是一个SourceMap，它是一个对象。

##### 例子1：编写一个简单的解析txt文件的loader

```
// txt-loader.js
module.exports = function (source) {
    const json = JSON.stringify(source);
    return `module.exports = ${json}`;
}
```

```
// webpack.config.js
const path = require('path');
module.exports = {
    entry : './app.js',
    output : {
        path : path.resolve(__dirname , './dist'),
        filename : 'bundle.js'
    },
    mode : 'development',
    module : {
        rules : [
            {
                test : /\.txt$/,
                use : path.resolve(__dirname , './txt-loader.js')
            }
        ]
    }
}
```

```
// app.js
const txt = require('./andy.txt');
document.body.innerText = txt;
```

当我们打包后，然后将打包后的文件引入到index.html中，就可以看到页面上回出现andy.txt文件中的内容了。

![image](https://github.com/andyChenAn/webpack-learn/raw/master/编写loader/image/1.png)

##### 例子2：编写一个替换html文件中指定内容的loader

```
// html-loader.js
const fs = require('fs');
const path = require('path');
const aa = {
    content : '{{__content__}}'
}

/**
 * 
 * @param {String} htmlPath 文件路径
 * @param {Object} aa 对象
 * @param {String} source 要替换的内容
 */
function htmlRender (htmlPath , aa , source) {
    let html = '';
    try {
        html = fs.readFileSync(htmlPath , 'utf8');
    } catch (err) {
        throw err;
    }
    return JSON.stringify(html.replace(aa.content , source));
};
/**
 * 
 * @param {String} source 加载资源的字符串内容
 */
function htmlLoader (source) {
    this.cacheable();
    const reg = /@layout\((.*?)\)/g;
    const regResult = reg.exec(source);
    if (regResult) {
        // 获取需要读取的文件的路径
        const url = regResult[1];
        // 将匹配的内容替换为空
        source = source.replace(regResult[0] , '');
        // 读取指定路径的文件内容，并替换相应内容
        const json = htmlRender(url , aa , source);
        // 返回数据
        return `module.exports = ${json}`;
    }
};

module.exports = htmlLoader;
```

```
// webpack.config.js
const path = require('path');
module.exports = {
    entry : './app.js',
    output : {
        path : path.resolve(__dirname , './dist'),
        filename : 'bundle.js'
    },
    mode : 'development',
    module : {
        rules : [
            {
                test : /\.html$/,
                loader : path.resolve(__dirname , './html-loader.js')
            }
        ]
    }
}
```

```
// app.js
const txt = require('./index.html');
document.write(txt);
```
当我们打包后，然后将打包后的文件引入到demo.html中，就可以看到替换后的内容了。

![image](https://github.com/andyChenAn/webpack-learn/raw/master/编写loader/image/2.png)
