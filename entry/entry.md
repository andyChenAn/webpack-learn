# entry
webpack的配置项有很多，首先我们需要了解的是"entry"配置项。

entry：表示打包的入口文件，从这个文件开始打包执行，如果入口文件中引入了其他文件，那么会按照依赖一次打包执行。

entry配置项可以是以下值：
- **字符串**

如果是单入口文件，entry的值可以是字符串，比如：
```
// webpack.config.js
const path = require('path');
module.exports = {
    // 入口文件只有一个，那么我们就可以这样写
	entry : './app.js',
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : 'bundle.js'
	},
	mode : 'development'
}
```
- **数组**

如果entry的值是一个数组，那么应用程序会依次执行数组中的每一个文件，并将所有文件打包到一个指定的文件中，比如：
```
// webpack.config.js
const path = require('path');
module.exports = {
	entry : ['./app.js' , './app2.js'],
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : 'bundle.js'
	},
	mode : 'development'
}
```
- **对象**

如果有多个入口文件，那么我们可以设置entry的值是一个对象，而在打包完后输出的文件中，entry中的每个键值就是对应的输出文件的文件名，比如：
```
// webpack.config.js
const path = require('path');
module.exports = {
	entry : {
		bundle : './app.js',
		bundle2 : './app2.js'
	},
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : '[name].js'   //这里的name表示的就是每一个entry对象中的键值
	},
	mode : 'development'
}
```
- **函数**

如果entry配置项被设置为一个函数，那么会调用这个函数，将返回值作为入口文件进行打包，这里需要注意的是，返回值可以是一个字符串，也可以是一个对象，或数组，打包方式和上面的对象或数组类似，比如：
```
// webpack.config.js
const path = require('path');
module.exports = {
	entry : () => {
		return './app.js'
	},
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : 'bundle.js'
	},
	mode : 'development'
}
```
- **promise对象**
如果entry配置项的值是一个promise对象，比如：
```
// webpack.config.js
const path = require('path');
module.exports = {
	entry : () => {
	   // 过了2秒，开始打包入口文件
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve('./app.js')
			} , 2000)
		})
	},
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : 'app.js'
	},
	mode : 'development'
}
```

**注意：如果entry是一个数组，并且output对象中，指明了library键值，那么只会导出最后一项**
```
// webpack.config.js
const path = require('path');
module.exports = {
	entry : ['./app.js' , './app2.js'],
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : 'bundle.js',
		library : 'andy',   // 表示打包后输出的js文件的库名
		libraryTarget : 'amd'  // 表示输出的库是通过什么样的方式来加载，amd,cmd,commonjs，umd等
	},
	mode : 'development'
}
```
```
// app.js
var a = 'hello andy';
exports.a = a;
```

```
// app2.js
var b = 'hello world';
exports.b = b;
```

比如说上面的例子中，我们通过amd的方式来加载我们自己打包好的这个库，所以打包后的文件会以define()的方式来打包文件，这时我们引入require.js文件，再在浏览器上引入打包后的文件，我们就可以通过amd的方式来加载打包文件了。
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    <script src="require.js"></script>
    <script src="dist/bundle.js"></script>
</head>
<body>
    <script>
        <!-- 通过amd的方式来加载打包文件 -->
        requirejs(['andy'] , function (andy) {
            console.log(andy)
        })
    </script>
</body>
</html>
```
打开浏览器调试工具，可以看到输出的结构就是最后打包的那个文件的结果，第一个文件不会输出：
```
{b: "hello world"}
```
