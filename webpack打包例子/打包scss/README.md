# 打包SCSS文件
打包scss文件，我们可以使用sass-loader来打包。
### scss文件
通过scss语法来编写css，可以使我们更好的管理css代码，而且通过逻辑，可以写出更灵活的代码，让我们写css也像写js一样。
### 用法：
- 首先安装打包scss文件需要的依赖插件
```
npm i -D sass-loader node-sass
```
- 然后编写scss文件，具体语法可以去查看官网
```
$color : #f00;
#app {
    color: $color;
    font-size:30px;
}
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
                test : /\.scss$/,
                use : ['style-loader' , 'css-loader' , 'sass-loader'],
                exclude : /node_modules/
            }
        ]
    }
};
```

```
// app.js文件
import './index.scss';
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