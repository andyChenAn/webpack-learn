# output
output配置项，表示webpack如何去输出，以及在哪里输出你的打包文件。
- **filename**

filename选项表示每一个打包文件的名称，这些打包文件将会写入到output.path选项指定的目录下。

如果是打包的是单文件入口，那么直接这样就可以了：

```
// webpack.config.js
const path = require('path');
module.exports = {
	entry : './app.js',
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : 'bundle.js'   // 输出的文件名
	},
	mode : 'development'
}
```
如果是多文件入口打包，那么可以这样配置：

模板 | 描述
---|---
[name] | 模块名称
[hash] | 模块标识符的hash，每次构建过程中，会生成唯一的hash
[chunkhash] | 每个chunk内容的hash，即每个文件的hash
[id] | 模块标识符，和[name]一样

```
// webpack.config.js

// [name]
const path = require('path');
module.exports = {
	entry : {
		app : './app.js',
		app2 : './app2.js'
	},
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : '[name].bundle.js'  // 这里的name表示的就是入口文件配置项的key
	},
	mode : 'development'
}

// [chunkhash]
const path = require('path');
module.exports = {
	entry : {
		app : './app.js',
		app2 : './app2.js'
	},
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : '[chunkhash].bundle.js'
	},
	mode : 'development'
}

// [hash]
const path = require('path');
module.exports = {
	entry : {
		app : './app.js',
		app2 : './app2.js'
	},
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : '[name].[hash].bundle.js'
	},
	mode : 'development'
}
```
**- chunkFilename**

chunkFilename：表示非入口chunk文件的名称，比如说，按需加载的内容，如果这部分内容比较多，要是把它们也作为入口文件一起打包，打包后的文件会比较大，而且也不一定用户会用到，最好是用户需要的时候再加载它们，这里就会用到chunkFilename这个选项，比如：
```
// webpack.config.js
const path = require('path');
module.exports = {
	entry : './app.js',
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : 'bundle.js',
		chunkFilename : '[chunkhash].js',  //表示按需加载的chunk的名称，存放的路径是相对于path的
		publicPath : './dist/'    //表示指定按需加载或加载外部资源的路径，如果指定了一个错误的值，那么加载这些子元素时，那么会找不到该资源
	},
	mode : 'development'
}
```

```
// app.js
import $ from 'jquery';
$(function () {
    $('#btn').click(function () {
        require.ensure([] , function () {
            let a = require('./app2.js');
            a.say();
        })
    });
})
```
```
// app2.js
module.exports = {
    say : function () {
        alert('hello andy');
    }
}
```

```
// demo.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <script src="dist/bundle.js"></script>
</head>
<body>
    <button id="btn">click</button>
</body>
</html>
```
当我们打包完成后，打开浏览器，点击按钮时，发现会加载6cc92b79b0be3caa34f1.js文件，这里就是我们需要按需加载的文件内容。

**-publicPath**

对于按需加载或者加载外部资源（文件，图片等）的时候，需要使用这个选项来指定加载的路径，如果指定了一个错误的值，那么资源加载的时候会出现404错误。

```
// webpack.config.js
const path = require('path');
module.exports = {
	entry : './app.js',
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : 'bundle.js',
		chunkFilename : '[chunkhash].js',
		publicPath : './dist/'
	},
	mode : 'development'
}
```
**-library和libraryTarget**

这两个配置项基本上都是一起使用的，library表示引入的模块名，比如说，你自己编写了一个模块，想要指定一个模块名，那么就可以用这个选项。libraryTarget表示通过什么方式加载该模块，amd，umd，commonjs等。当我们写完后，发布到npm，然后下来下来使用，就可以直接require('模块名')即可。
```
const path = require('path');
module.exports = {
	entry : {
		myTools : './app.js'
	},
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : '[name].js',
		library : 'tools',
		libraryTarget : 'commonjs2'
	},
	mode : 'development'
}
```
**-path**

path选项表示打包后文件的输出的路径，是一个绝对路径。

```
const path = require('path');
module.exports = {
	entry : './app.js',
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : 'bundle.js'
	},
	mode : 'development'
}
```