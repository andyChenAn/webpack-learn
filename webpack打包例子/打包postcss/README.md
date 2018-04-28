# 打包postcss
postcss是一个css处理工具，可能我们用的比较多的就是，通过它来为css自动添加前缀。
### postcss
postcss可以通过不同插件来扩展，比如说，我们想要它自动帮我们添加css前缀，那么就需要安装autoprefixer，比如，我们想让他使用sass语法，那么我们可以安装precss插件。当postcss
### 用法：
- 首先安装postcss-loader autoprefixer , precss
```
npm i -D postcss-loader autoprefixer precss
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
            },
            {
                test : /\.css$/,
                use : ['style-loader' , 'css-loader' , {
                    loader : 'postcss-loader',
                    options : {
                        // 这里其实可以创建一个postcss.config.js文件来配置postcss-loader需要使用到的插件
                        plugins : [
                            require('precss'),
                            require('autoprefixer')
                        ]
                    }
                }]
            }
        ]
    }
};
```

```
// index.css文件
$color : #f00;
#app {
    color: $color;
    font-size:30px;
    display: flex;
}
```

```
// app.js文件
import './index.css';
import $ from 'jquery';
class Person {
    constructor (name , age) {
        this.name = name;
        this.age = age;
    }
    write () {
        $('#app').text(this.name + this.age);
    }
};
const person = new Person('andy' , 20);
person.write();
```
- 除了这些，我们还要在package.json文件中，添加browserslist字段，指明浏览器的相关信息
```
  "browserslist": [
    "defaults",
    "not ie < 8",
    "last 2 versions",
    "> 1%",
    "iOS 7",
    "last 3 iOS versions"
  ]
```
执行webpack --colors命令即可：
```
Hash: b2af5fbd845fe80a03b8
Version: webpack 4.0.0
Time: 1317ms
Built at: 2018-4-28 17:44:40
    Asset     Size  Chunks                    Chunk Names
bundle.js  324 KiB    main  [emitted]  [big]  main
Entrypoint main [big] = bundle.js
[./app.js] 1.32 KiB {main} [built]
[./index.css] 1.2 KiB {main} [built]
[./node_modules/css-loader/index.js!./node_modules/postcss-loader/lib/index.js??ref--5-2!./index.css] ./node_modules/css-loader!./node_modules/postcss-loader/lib??ref--5-2!./index.css 322 bytes {main} [built]
    + 4 hidden modules
```