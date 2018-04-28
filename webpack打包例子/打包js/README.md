# 打包js
我们现在编写js代码，一般都会用到es6，es7等最新的js语法，但是有一些浏览器可能对于最新的js语法支持还不够，那么我们只能将es6转换成浏览器可识别的es5。而将es6等语法转换为浏览器可识别的语法，主要是通过babel来实现。
### babel
babel是一个编译器，可以将我们写的es6语法转为es5，这样浏览器就可以识别到js，而不会导致报错。如果我们要使用babel，那么就必须定义一个".babelrc"文件，并且安装"babel-loader"和"babel-core"插件。".babelrc文件"是一个json文件。具体如何使用，可以去看官网。
### 用法：
- 首先定义".babelrc"文件
```
{
    "presets": ["es2015"]  // presets属性告诉babel要转换的源码中使用了哪些新的js语法特性
}
```
- 安装"babel-loader和babel-core"插件

```
npm i -D babel-loader babel-core
```
- 编写webpack.config.js文件
```
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
                test : /\.js$/,
                use : 'babel-loader',
                exclude : /node_modules/
            }
        ]
    }
};
```

```
// app.js文件
class Person {
    constructor (name , age) {
        this.name = name;
        this.age = age;
    }
    sayHello () {
        console.log(this.name);
    }
};
const person = new Person('andy' , 20);
person.sayHello();
```
- 最后执行webpack --colors命令：
```
Hash: e9ae6de158f195c9cd4c
Version: webpack 4.0.0
Time: 718ms
Built at: 2018-4-28 16:02:35
    Asset      Size  Chunks             Chunk Names
bundle.js  3.92 KiB    main  [emitted]  main
Entrypoint main = bundle.js
[./app.js] 1.09 KiB {main} [built]
```