# output（出口）
output配置项，表示webpack如何去输出，以及在哪里输出你的打包文件。

当我们设置了“entry”配置项之后，我们需要设置“output”选项，来告诉webpack我们打包后的文件应该输出到哪里，以及输出文件的文件名是什么。

选项“output”的值是一个对象，最低要求必须要有两个属性：filename和path。

- **filename**

filename选项表示每一个打包文件的名称，这些打包文件将会写入到output.path选项指定的目录下。

如果是打包的是单文件入口，那么直接这样就可以了：

```javascript
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
[hash] | 模块标识符的hash，每次构建过程中，会生成唯一的hash，hash是唯一的，如果是多文件入口，那么就不能单独使用[hash].js这样的文件名，不然会发生冲突，可以和其他占位符一起使用
[chunkhash] | 每个chunk内容的hash，即每个文件的hash，如果文件的内容没有改变，那么这个文件的chunkhash也不会改变
[id] | 模块标识符，和[name]一样

“[hash]”占位符也可以用于路径，但是使用其他占位符就不行，会报错，可能是因为其他占位符都是多个，不是唯一的，而输出文件的存放目录只能在一个目录下，比如：

```javascript
output : {
    //path : __dirname + '/dist/[name]', 这个就会报错
    path : __dirname + '/dist/[hash]',
    filename : '[name].js'
}
```

```javascript
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

chunkFilename：表示非入口chunk文件的名称，比如说，按需加载的内容，如果这部分内容比较多，要是把它们也作为入口文件一起打包，打包后的文件会比较大，而且也不一定用户会用到，最好是用户需要的时候再加载它们，这里就会用到chunkFilename这个选项，当给非入口chunk文件指定了名称，我们还需要给这些文件指定存放的路径，这里就需要用到publicPath这个属性，publicPath表示相对于构建后的html页面的路径（这里就是index.html），比如：
```javascript
// webpack.config.js
const path = require('path');
module.exports = {
	entry : './app.js',
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : 'bundle.js',
		chunkFilename : '[chunkhash].js',  //表示按需加载的chunk的名称，存放的路径是相对于path的
		publicPath : './dist/'    //表示指定按需加载或加载外部资源的路径，如果指定了一个错误的值，那么加载这些文件时，会找不到该资源
	},
	mode : 'development'
}
```

```javascript
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
```javascript
// app2.js
module.exports = {
    say : function () {
        alert('hello andy');
    }
}
```

```html
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

对于按需加载或者加载外部资源（文件，图片等）的时候，需要使用这个选项来指定加载的路径，如果指定了一个错误的值，那么资源加载的时候会出现404错误。publicPath是一个相对路径，相对于html页面的。

这里说的所有资源的基础路径其实指的是项目中引入css，js，图片等资源时候的一个基础路径，这个基础路径要配合具体资源中指定的路径使用，基本如下：
```
静态资源最终访问路径 = output.publicPath + 资源loader或插件等配置路径
```
比如：

```javascript
output.publicPath = '/dist/'

// image
options: {
 	name: 'img/[name].[ext]?[hash]'
}

// 最终图片的访问路径为
output.publicPath + 'img/[name].[ext]?[hash]' = '/dist/img/[name].[ext]?[hash]'

// js output.filename
output: {
	filename: '[name].js'
}
// 最终js的访问路径为
output.publicPath + '[name].js' = '/dist/[name].js'

// extract-text-webpack-plugin css
new ExtractTextPlugin({
	filename: 'style.[chunkhash].css'
})
// 最终css的访问路径为
output.publicPath +'style.[chunkhash].css'= '/dist/style.[chunkhash].css'
```
这个最终静态资源访问路径在使用html-webpack-plugin打包后得到的html中可以看到。所以publicPath设置成相对路径后，相对路径是相对于build之后的index.html的，例如，如果设置publicPath: './dist/'，则打包后js的引用路径为./dist/main.js，但是这里有一个问题，相对路径在访问本地时可以，但是如果将静态资源托管到CDN上则访问路径显然不能使用相对路径，但是如果将publicPath设置成/，则打包后访问路径为localhost:8080/dist/main.js，本地无法访问。所以这里需要在上线时候手动更改publicPath，感觉不是很方便，但是不知道该如何解决。

**注意：一般情况下publicPath应该以'/'结尾，而其他loader或插件的配置不要以'/'开头**

```javascript
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
```javascript
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

```javascript
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
[参考这里](https://juejin.im/post/5ae9ae5e518825672f19b094)