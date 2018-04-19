# devtool
webpack的devtool配置项主要是用来控制是否生成，以及如何生成source map的。

### 什么是source map？
[参考这里](http://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html)

Source map就是一个信息文件，里面储存着位置信息。也就是说，转换后的代码的每一个位置，所对应的转换前的位置。
有了它，出错的时候，除错工具将直接显示原始代码，而不是转换后的代码。这无疑给开发者带来了很大方便。

比如说，我们经常会遇到这样的一个问题，当js报错时，我们需要去调试，具体是哪个位置报错了，一般来说，我们线上的js文件都是压缩后的代码，这样我们基本上看到的是这样的：
```
// 这里没有使用devtool配置，那么在生产环境中就不会生产source map
const path = require('path');
module.exports = {
    entry : './app.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : 'bundle.js'
    },
    mode : 'production'
};
```
![wrong](https://github.com/andyChenAn/webpack-learn/raw/master/devtool/image/1.png)

```
// 这里使用了devtool配置，那么在生产环境中就会生成source map
const path = require('path');
module.exports = {
    entry : './app.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : 'bundle.js'
    },
    mode : 'production',
    devtool : 'source-map'
};
```
![image](https://github.com/andyChenAn/webpack-learn/raw/master/devtool/image/2.png)

[具体信息可以参考官方文档](https://www.webpackjs.com/configuration/devtool/)